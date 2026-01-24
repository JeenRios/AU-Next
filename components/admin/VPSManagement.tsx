'use client';

import { useState, useEffect } from 'react';

interface VPSInstance {
  id: number;
  mt5_account_id: number;
  name: string;
  ip_address: string | null;
  ssh_port: number;
  ssh_username: string | null;
  status: string;
  os_type: string;
  mt5_path: string | null;
  ea_path: string | null;
  health_status: string | null;
  last_health_check: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
  account_number: string;
  mt5_server: string;
  platform: string;
  mt5_status: string;
  user_email: string;
  first_name: string | null;
  last_name: string | null;
  has_ssh_password: boolean;
  has_ssh_key: boolean;
  provider?: string | null;
  provider_instance_id?: string | null;
  provider_region?: string | null;
  provider_plan?: string | null;
  provider_metadata?: Record<string, any> | null;
}

interface VultrConfig {
  configured: boolean;
  recommendedPlans?: Record<string, { plan: string; description: string; monthlyPrice: number }>;
  recommendedRegions?: Record<string, { name: string; country: string; latency: string }>;
  windowsOS?: Record<string, number>;
}

interface MT5Account {
  id: number;
  account_number: string;
  server: string;
  platform: string;
  status: string;
  user_email: string;
}

interface VPSManagementProps {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700 border-yellow-200',
  provisioning: 'bg-blue-100 text-blue-700 border-blue-200',
  active: 'bg-green-100 text-green-700 border-green-200',
  error: 'bg-red-100 text-red-700 border-red-200',
  decommissioned: 'bg-gray-100 text-gray-700 border-gray-200'
};

const HEALTH_COLORS: Record<string, string> = {
  healthy: 'text-green-600',
  degraded: 'text-yellow-600',
  unhealthy: 'text-red-600',
  unknown: 'text-gray-400'
};

export default function VPSManagement({ onError, onSuccess }: VPSManagementProps) {
  const [vpsInstances, setVpsInstances] = useState<VPSInstance[]>([]);
  const [mt5Accounts, setMt5Accounts] = useState<MT5Account[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [showCreateForm, setShowCreateForm] = useState(false);
  const [showEditForm, setShowEditForm] = useState(false);
  const [selectedVps, setSelectedVps] = useState<VPSInstance | null>(null);

  // Vultr state
  const [vultrConfig, setVultrConfig] = useState<VultrConfig | null>(null);
  const [showVultrForm, setShowVultrForm] = useState(false);
  const [vultrFormData, setVultrFormData] = useState({
    mt5_account_id: '',
    vps_name: '',
    region: 'ewr',
    plan: 'vc2-1c-2gb',
    os_id: 1713, // Windows Server 2022
  });

  const [formData, setFormData] = useState({
    mt5_account_id: '',
    name: '',
    ip_address: '',
    ssh_port: '22',
    ssh_username: '',
    ssh_password: '',
    os_type: 'windows',
    mt5_path: 'C:\\Program Files\\MetaTrader 5\\terminal64.exe',
    ea_path: '',
    notes: '',
    status: 'pending',
    provider: '',  // manual, vultr, digitalocean, etc.
    provider_instance_id: '',
    provider_region: '',
    provider_plan: '',
  });

  useEffect(() => {
    fetchData();
    fetchVultrConfig();
  }, [statusFilter]);

  const fetchVultrConfig = async () => {
    try {
      const res = await fetch('/api/vps/provision');
      const data = await res.json();
      if (data.success) {
        setVultrConfig({
          configured: data.configured,
          recommendedPlans: data.recommendedPlans,
          recommendedRegions: data.recommendedRegions,
          windowsOS: data.windowsOS,
        });
      }
    } catch (err) {
      console.error('Failed to fetch Vultr config:', err);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    try {
      // Fetch VPS instances
      const vpsUrl = statusFilter !== 'all' ? `/api/vps?status=${statusFilter}` : '/api/vps';
      const vpsRes = await fetch(vpsUrl);
      const vpsData = await vpsRes.json();
      if (vpsData.success) {
        setVpsInstances(vpsData.data);
      }

      // Fetch MT5 accounts that don't have VPS yet (for create form)
      const mt5Res = await fetch('/api/mt5/connect');
      const mt5Data = await mt5Res.json();
      if (mt5Data.success) {
        // Filter accounts that are active and don't have VPS
        const accountsWithoutVps = mt5Data.data.filter((acc: MT5Account) =>
          acc.status === 'active' && !vpsData.data?.some((v: VPSInstance) => v.mt5_account_id === acc.id)
        );
        setMt5Accounts(accountsWithoutVps);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          mt5_account_id: parseInt(formData.mt5_account_id),
          ssh_port: parseInt(formData.ssh_port)
        })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.('VPS instance created successfully');
        setShowCreateForm(false);
        resetForm();
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVps) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/vps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: selectedVps.id,
          name: formData.name,
          status: formData.status,
          ip_address: formData.ip_address || null,
          ssh_port: parseInt(formData.ssh_port),
          ssh_username: formData.ssh_username || null,
          ssh_password: formData.ssh_password || undefined,
          mt5_path: formData.mt5_path || null,
          ea_path: formData.ea_path || null,
          notes: formData.notes || null
        })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.('VPS instance updated successfully');
        setShowEditForm(false);
        resetForm();
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusUpdate = async (id: number, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/vps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id, status })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.(`VPS status updated to ${status}`);
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this VPS instance?')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/vps?id=${id}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onSuccess?.('VPS instance deleted successfully');
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCheckHealth = async (id: number) => {
    setActionLoading(true);
    try {
      // Create a health check job
      const res = await fetch('/api/automation/jobs', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5_account_id: vpsInstances.find(v => v.id === id)?.mt5_account_id,
          vps_instance_id: id,
          job_type: 'vps_health_check'
        })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.('Health check job created');
        // For now, just update status locally
        await fetch('/api/vps', {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ id, health_status: 'healthy' })
        });
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleVultrProvision = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/vps/provision', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5_account_id: parseInt(vultrFormData.mt5_account_id),
          vps_name: vultrFormData.vps_name,
          region: vultrFormData.region,
          plan: vultrFormData.plan,
          os_id: vultrFormData.os_id,
        })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.(`VPS provisioning started! Instance ID: ${data.data.vultr_instance_id}`);
        setShowVultrForm(false);
        setVultrFormData({
          mt5_account_id: '',
          vps_name: '',
          region: 'ewr',
          plan: 'vc2-1c-2gb',
          os_id: 1713,
        });
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncVultrStatus = async (vpsId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/vps/provision', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vps_id: vpsId })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.(`Status synced: ${data.data.status} (IP: ${data.data.main_ip || 'pending'})`);
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleDeleteVultrVps = async (vpsId: number) => {
    if (!confirm('Are you sure you want to delete this VPS? This will also delete the Vultr instance.')) return;
    setActionLoading(true);
    try {
      const res = await fetch(`/api/vps/provision?vps_id=${vpsId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onSuccess?.('VPS and Vultr instance deleted successfully');
        fetchData();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      mt5_account_id: '',
      name: '',
      ip_address: '',
      ssh_port: '22',
      ssh_username: '',
      ssh_password: '',
      os_type: 'windows',
      mt5_path: 'C:\\Program Files\\MetaTrader 5\\terminal64.exe',
      ea_path: '',
      notes: '',
      status: 'pending',
      provider: '',
      provider_instance_id: '',
      provider_region: '',
      provider_plan: '',
    });
    setSelectedVps(null);
  };

  const openEditForm = (vps: VPSInstance) => {
    setSelectedVps(vps);
    setFormData({
      mt5_account_id: vps.mt5_account_id.toString(),
      name: vps.name,
      ip_address: vps.ip_address || '',
      ssh_port: vps.ssh_port.toString(),
      ssh_username: vps.ssh_username || '',
      ssh_password: '',
      os_type: vps.os_type,
      mt5_path: vps.mt5_path || '',
      ea_path: vps.ea_path || '',
      notes: vps.notes || '',
      status: vps.status,
      provider: vps.provider || '',
      provider_instance_id: vps.provider_instance_id || '',
      provider_region: vps.provider_region || '',
      provider_plan: vps.provider_plan || '',
    });
    setShowEditForm(true);
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-[#c9a227]"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div>
          <h3 className="text-lg font-semibold text-[#1a1a1d]">VPS Management</h3>
          <p className="text-sm text-gray-500 mt-1">
            Manage VPS instances for automated trading
            {vultrConfig?.configured && (
              <span className="ml-2 inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                <span className="w-1.5 h-1.5 bg-green-500 rounded-full mr-1"></span>
                Vultr Connected
              </span>
            )}
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="provisioning">Provisioning</option>
            <option value="active">Active</option>
            <option value="error">Error</option>
          </select>
          {vultrConfig?.configured && mt5Accounts.length > 0 && (
            <button
              onClick={() => setShowVultrForm(true)}
              className="px-4 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors flex items-center gap-1"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
              </svg>
              Auto-Provision (Vultr)
            </button>
          )}
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={mt5Accounts.length === 0}
            className="px-4 py-1.5 text-sm bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Add VPS (Manual)
          </button>
          <button
            onClick={fetchData}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* VPS List */}
      {vpsInstances.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2m-2-4h.01M17 16h.01" />
          </svg>
          <p className="text-gray-500">No VPS instances found</p>
          {mt5Accounts.length > 0 && (
            <button
              onClick={() => setShowCreateForm(true)}
              className="mt-4 px-4 py-2 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg text-sm"
            >
              Create First VPS
            </button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          {vpsInstances.map((vps) => (
            <div key={vps.id} className="bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md transition-shadow">
              <div className="flex items-start justify-between mb-4">
                <div>
                  <h4 className="font-semibold text-[#1a1a1d]">{vps.name}</h4>
                  <p className="text-sm text-gray-500">{vps.ip_address || 'No IP assigned'}</p>
                </div>
                <div className="flex items-center gap-2">
                  <span className={`px-2 py-1 text-xs font-medium rounded-full border ${STATUS_COLORS[vps.status] || STATUS_COLORS.pending}`}>
                    {vps.status.toUpperCase()}
                  </span>
                  {vps.health_status && (
                    <span className={`text-sm ${HEALTH_COLORS[vps.health_status] || HEALTH_COLORS.unknown}`} title={`Health: ${vps.health_status}`}>
                      {vps.health_status === 'healthy' ? '●' : vps.health_status === 'degraded' ? '◐' : '○'}
                    </span>
                  )}
                </div>
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-500">MT5 Account:</span>
                  <span className="font-medium">{vps.account_number} @ {vps.mt5_server}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">User:</span>
                  <span className="font-medium">{vps.first_name ? `${vps.first_name} ${vps.last_name}` : vps.user_email}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">OS:</span>
                  <span className="font-medium capitalize">{vps.os_type}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-500">SSH:</span>
                  <span className="font-medium">{vps.ssh_username}@{vps.ip_address || 'N/A'}:{vps.ssh_port}</span>
                </div>
                {vps.provider && vps.provider_instance_id && (
                  <>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Provider:</span>
                      <span className="font-medium capitalize">{vps.provider}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Instance ID:</span>
                      <span className="font-medium font-mono text-xs">{vps.provider_instance_id}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-500">Region/Plan:</span>
                      <span className="font-medium">
                        {vps.provider === 'vultr'
                          ? (vultrConfig?.recommendedRegions?.[vps.provider_region || '']?.name || vps.provider_region)
                          : vps.provider_region
                        } / {vps.provider_plan}
                      </span>
                    </div>
                  </>
                )}
                {vps.last_health_check && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Check:</span>
                    <span className="font-medium">{new Date(vps.last_health_check).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100 flex-wrap">
                <button
                  onClick={() => openEditForm(vps)}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Edit
                </button>
                {vps.provider === 'vultr' && vps.provider_instance_id && vps.status === 'provisioning' && (
                  <button
                    onClick={() => handleSyncVultrStatus(vps.id)}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Sync Status
                  </button>
                )}
                {!vps.provider_instance_id && vps.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(vps.id, 'provisioning')}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Start Provisioning
                  </button>
                )}
                {!vps.provider_instance_id && vps.status === 'provisioning' && (
                  <button
                    onClick={() => handleStatusUpdate(vps.id, 'active')}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-1.5 text-sm bg-green-100 text-green-700 hover:bg-green-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Mark Active
                  </button>
                )}
                {vps.status === 'active' && (
                  <button
                    onClick={() => handleCheckHealth(vps.id)}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-1.5 text-sm bg-amber-100 text-amber-700 hover:bg-amber-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Check Health
                  </button>
                )}
                <button
                  onClick={() => vps.provider_instance_id ? handleDeleteVultrVps(vps.id) : handleDelete(vps.id)}
                  disabled={actionLoading}
                  className="px-3 py-1.5 text-sm bg-red-100 text-red-700 hover:bg-red-200 rounded-lg transition-colors disabled:opacity-50"
                >
                  Delete
                </button>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create VPS Modal */}
      {showCreateForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#1a1a1d] mb-4">Create VPS Instance</h3>
            <form onSubmit={handleCreate} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MT5 Account</label>
                <select
                  value={formData.mt5_account_id}
                  onChange={(e) => setFormData({ ...formData, mt5_account_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                >
                  <option value="">Select MT5 Account</option>
                  {mt5Accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_number} @ {acc.server} ({acc.user_email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VPS Name</label>
                <input
                  type="text"
                  value={formData.name}
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                  placeholder="e.g., VPS-001"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VPS Provider</label>
                <select
                  value={formData.provider}
                  onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                >
                  <option value="">Manual (No Provider)</option>
                  <option value="vultr">Vultr</option>
                  <option value="digitalocean" disabled>DigitalOcean (Coming Soon)</option>
                  <option value="linode" disabled>Linode (Coming Soon)</option>
                  <option value="hetzner" disabled>Hetzner (Coming Soon)</option>
                  <option value="aws" disabled>AWS EC2 (Coming Soon)</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {formData.provider && formData.provider !== '' && (
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider Instance ID</label>
                    <input
                      type="text"
                      value={formData.provider_instance_id}
                      onChange={(e) => setFormData({ ...formData, provider_instance_id: e.target.value })}
                      placeholder="e.g., abc123..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider Region</label>
                    <input
                      type="text"
                      value={formData.provider_region}
                      onChange={(e) => setFormData({ ...formData, provider_region: e.target.value })}
                      placeholder="e.g., ewr, nyc1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    />
                  </div>
                </div>
              )}
              {formData.provider && formData.provider !== '' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Provider Plan</label>
                  <input
                    type="text"
                    value={formData.provider_plan}
                    onChange={(e) => setFormData({ ...formData, provider_plan: e.target.value })}
                    placeholder="e.g., vc2-1c-2gb"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              )}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Port</label>
                  <input
                    type="number"
                    value={formData.ssh_port}
                    onChange={(e) => setFormData({ ...formData, ssh_port: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Username</label>
                  <input
                    type="text"
                    value={formData.ssh_username}
                    onChange={(e) => setFormData({ ...formData, ssh_username: e.target.value })}
                    placeholder="Administrator"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Password</label>
                  <input
                    type="password"
                    value={formData.ssh_password}
                    onChange={(e) => setFormData({ ...formData, ssh_password: e.target.value })}
                    placeholder="••••••••"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OS Type</label>
                <select
                  value={formData.os_type}
                  onChange={(e) => setFormData({ ...formData, os_type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                >
                  <option value="windows">Windows</option>
                  <option value="linux">Linux (Wine)</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MT5 Path</label>
                <input
                  type="text"
                  value={formData.mt5_path}
                  onChange={(e) => setFormData({ ...formData, mt5_path: e.target.value })}
                  placeholder="C:\Program Files\MetaTrader 5\terminal64.exe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EA Path</label>
                <input
                  type="text"
                  value={formData.ea_path}
                  onChange={(e) => setFormData({ ...formData, ea_path: e.target.value })}
                  placeholder="C:\...\MQL5\Experts\MyEA.ex5"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowCreateForm(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create VPS'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Edit VPS Modal */}
      {showEditForm && selectedVps && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <h3 className="text-lg font-semibold text-[#1a1a1d] mb-4">Edit VPS Instance</h3>
            <form onSubmit={handleUpdate} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">VPS Name</label>
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                  <select
                    value={formData.status}
                    onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  >
                    <option value="pending">Pending</option>
                    <option value="provisioning">Provisioning</option>
                    <option value="active">Active</option>
                    <option value="error">Error</option>
                    <option value="decommissioned">Decommissioned</option>
                  </select>
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={formData.ip_address}
                    onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Port</label>
                  <input
                    type="number"
                    value={formData.ssh_port}
                    onChange={(e) => setFormData({ ...formData, ssh_port: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Username</label>
                  <input
                    type="text"
                    value={formData.ssh_username}
                    onChange={(e) => setFormData({ ...formData, ssh_username: e.target.value })}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">New SSH Password</label>
                  <input
                    type="password"
                    value={formData.ssh_password}
                    onChange={(e) => setFormData({ ...formData, ssh_password: e.target.value })}
                    placeholder="Leave blank to keep"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MT5 Path</label>
                <input
                  type="text"
                  value={formData.mt5_path}
                  onChange={(e) => setFormData({ ...formData, mt5_path: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EA Path</label>
                <input
                  type="text"
                  value={formData.ea_path}
                  onChange={(e) => setFormData({ ...formData, ea_path: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>

              {/* Provider Info Section */}
              <div className="border-t border-gray-200 pt-4 mt-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-3">Provider Information</h4>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Provider</label>
                    <select
                      value={formData.provider}
                      onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    >
                      <option value="">Manual (No Provider)</option>
                      <option value="vultr">Vultr</option>
                      <option value="digitalocean">DigitalOcean</option>
                      <option value="linode">Linode</option>
                      <option value="hetzner">Hetzner</option>
                      <option value="aws">AWS EC2</option>
                      <option value="other">Other</option>
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Instance ID</label>
                    <input
                      type="text"
                      value={formData.provider_instance_id}
                      onChange={(e) => setFormData({ ...formData, provider_instance_id: e.target.value })}
                      placeholder="e.g., abc123..."
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3 mt-3">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                    <input
                      type="text"
                      value={formData.provider_region}
                      onChange={(e) => setFormData({ ...formData, provider_region: e.target.value })}
                      placeholder="e.g., ewr, nyc1"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                    <input
                      type="text"
                      value={formData.provider_plan}
                      onChange={(e) => setFormData({ ...formData, provider_plan: e.target.value })}
                      placeholder="e.g., vc2-1c-2gb"
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                    />
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowEditForm(false); resetForm(); }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Saving...' : 'Save Changes'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Vultr Auto-Provision Modal */}
      {showVultrForm && vultrConfig?.configured && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                <svg className="w-6 h-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
              </div>
              <div>
                <h3 className="text-lg font-semibold text-[#1a1a1d]">Auto-Provision VPS (Vultr)</h3>
                <p className="text-sm text-gray-500">Create a Windows VPS automatically via Vultr API</p>
              </div>
            </div>
            <form onSubmit={handleVultrProvision} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">MT5 Account</label>
                <select
                  value={vultrFormData.mt5_account_id}
                  onChange={(e) => setVultrFormData({ ...vultrFormData, mt5_account_id: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                >
                  <option value="">Select MT5 Account</option>
                  {mt5Accounts.map((acc) => (
                    <option key={acc.id} value={acc.id}>
                      {acc.account_number} @ {acc.server} ({acc.user_email})
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VPS Name (optional)</label>
                <input
                  type="text"
                  value={vultrFormData.vps_name}
                  onChange={(e) => setVultrFormData({ ...vultrFormData, vps_name: e.target.value })}
                  placeholder="Auto-generated from account number"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Region</label>
                <select
                  value={vultrFormData.region}
                  onChange={(e) => setVultrFormData({ ...vultrFormData, region: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {vultrConfig.recommendedRegions && Object.entries(vultrConfig.recommendedRegions).map(([id, region]) => (
                    <option key={id} value={id}>
                      {region.name}, {region.country} - {region.latency}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Plan</label>
                <select
                  value={vultrFormData.plan}
                  onChange={(e) => setVultrFormData({ ...vultrFormData, plan: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {vultrConfig.recommendedPlans && Object.entries(vultrConfig.recommendedPlans).map(([key, plan]) => (
                    <option key={key} value={plan.plan}>
                      {plan.description} - ${plan.monthlyPrice}/mo
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Windows Version</label>
                <select
                  value={vultrFormData.os_id}
                  onChange={(e) => setVultrFormData({ ...vultrFormData, os_id: parseInt(e.target.value) })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                >
                  {vultrConfig.windowsOS && Object.entries(vultrConfig.windowsOS).map(([name, id]) => (
                    <option key={name} value={id}>
                      {name.replace(/-/g, ' ').replace(/windows/i, 'Windows Server')}
                    </option>
                  ))}
                </select>
              </div>

              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <div className="flex items-start gap-2">
                  <svg className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                  </svg>
                  <div className="text-sm text-amber-800">
                    <p className="font-medium">Billing Notice</p>
                    <p className="text-amber-700">This will create a billable Vultr instance. The selected plan costs approximately ${vultrConfig.recommendedPlans?.[Object.keys(vultrConfig.recommendedPlans).find(k => vultrConfig.recommendedPlans?.[k].plan === vultrFormData.plan) || 'basic']?.monthlyPrice || 24}/month.</p>
                  </div>
                </div>
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowVultrForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading || !vultrFormData.mt5_account_id}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {actionLoading ? (
                    <>
                      <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Provisioning...
                    </>
                  ) : (
                    <>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 3v4M3 5h4M6 17v4m-2-2h4m5-16l2.286 6.857L21 12l-5.714 2.143L13 21l-2.286-6.857L5 12l5.714-2.143L13 3z" />
                      </svg>
                      Provision VPS
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
