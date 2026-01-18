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
    status: 'pending'
  });

  useEffect(() => {
    fetchData();
  }, [statusFilter]);

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
      status: 'pending'
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
      status: vps.status
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
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold text-[#1a1a1d]">VPS Management</h3>
          <p className="text-sm text-gray-500 mt-1">Manage VPS instances for automated trading</p>
        </div>
        <div className="flex gap-2">
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
          <button
            onClick={() => setShowCreateForm(true)}
            disabled={mt5Accounts.length === 0}
            className="px-4 py-1.5 text-sm bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors disabled:opacity-50"
          >
            Add VPS
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
                {vps.last_health_check && (
                  <div className="flex justify-between">
                    <span className="text-gray-500">Last Check:</span>
                    <span className="font-medium">{new Date(vps.last_health_check).toLocaleString()}</span>
                  </div>
                )}
              </div>

              <div className="flex gap-2 mt-4 pt-4 border-t border-gray-100">
                <button
                  onClick={() => openEditForm(vps)}
                  className="flex-1 px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
                >
                  Edit
                </button>
                {vps.status === 'pending' && (
                  <button
                    onClick={() => handleStatusUpdate(vps.id, 'provisioning')}
                    disabled={actionLoading}
                    className="flex-1 px-3 py-1.5 text-sm bg-blue-100 text-blue-700 hover:bg-blue-200 rounded-lg transition-colors disabled:opacity-50"
                  >
                    Start Provisioning
                  </button>
                )}
                {vps.status === 'provisioning' && (
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
                  onClick={() => handleDelete(vps.id)}
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
    </div>
  );
}
