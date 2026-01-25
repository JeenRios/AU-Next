'use client';

/**
 * VPSManagement - Admin dashboard for managing VPS instances.
 *
 * Architecture:
 * - Uses ListContainer for search, filter, pagination (reusable)
 * - Uses VPSRow for individual items with inline editing (reusable)
 * - Uses SlideOutPanel for Create VPS form
 * - Separates data fetching from presentation
 * - All state that affects multiple items lives here
 * - Row-specific state (expand/collapse) lives in VPSRow
 */

import { useState, useEffect, useCallback } from 'react';
import ListContainer, { FilterOption } from '../shared/ListContainer';
import ListItem from '../../shared/ListItem';
import VPSEditor, { VPSInstance, VPSFormData } from './VPSEditor';
import SlideOutPanel from '../shared/SlideOutPanel';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

interface MT5Account {
  id: number;
  user_id: number;
  account_number: string;
  server: string;
  platform: string;
  status: string;
  automation_status: string;
  user_email: string;
}

interface VultrConfig {
  configured: boolean;
  regions?: Array<{ id: string; city: string; country: string }>;
  plans?: Array<{ id: string; vcpu_count: number; ram: number; disk: number; bandwidth: number; monthly_cost: number }>;
}

interface VPSManagementProps {
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

function StatusBadge({ status }: { status: string }) {
  const config: Record<string, { bg: string; text: string; dot: string }> = {
    active: { bg: 'bg-emerald-50', text: 'text-emerald-700', dot: 'bg-emerald-500' },
    provisioning: { bg: 'bg-amber-50', text: 'text-amber-700', dot: 'bg-amber-500' },
    pending: { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-400' },
    error: { bg: 'bg-red-50', text: 'text-red-700', dot: 'bg-red-500' },
    decommissioned: { bg: 'bg-gray-100', text: 'text-gray-500', dot: 'bg-gray-400' },
  };

  const style = config[status] || config.pending;
  const isAnimated = status === 'active' || status === 'provisioning';

  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium rounded-full ${style.bg} ${style.text}`}>
      <span className="relative flex h-2 w-2">
        {isAnimated && (
          <span className={`animate-ping absolute inline-flex h-full w-full rounded-full ${style.dot} opacity-75`} />
        )}
        <span className={`relative inline-flex rounded-full h-2 w-2 ${style.dot}`} />
      </span>
      <span className="capitalize">{status}</span>
    </span>
  );
}

// ============================================================================
// FILTER OPTIONS
// ============================================================================

const VPS_FILTER_OPTIONS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'active', label: 'Active' },
  { value: 'provisioning', label: 'Provisioning' },
  { value: 'pending', label: 'Pending' },
  { value: 'error', label: 'Error' },
];

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function VPSManagement({ onError, onSuccess }: VPSManagementProps) {
  // ========== DATA STATE ==========
  const [vpsInstances, setVpsInstances] = useState<VPSInstance[]>([]);
  const [mt5Accounts, setMt5Accounts] = useState<MT5Account[]>([]);
  const [vultrConfig, setVultrConfig] = useState<VultrConfig | null>(null);

  // ========== UI STATE ==========
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [testingConnection, setTestingConnection] = useState<number | null>(null);
  const [showCreatePanel, setShowCreatePanel] = useState(false);
  const [showVultrPanel, setShowVultrPanel] = useState(false);
  const [expandedId, setExpandedId] = useState<number | null>(null);

  // ========== FORM STATE ==========
  const [editorFormData, setEditorFormData] = useState<VPSFormData | null>(null);

  const [createFormData, setCreateFormData] = useState({
    mt5_account_id: '',
    name: '',
    ip_address: '',
    ssh_port: '22',
    ssh_username: 'Administrator',
    ssh_password: '',
  });

  const [vultrFormData, setVultrFormData] = useState({
    mt5_account_id: '',
    name: '',
    region: '',
    plan: '',
  });

  // ========== DATA FETCHING ==========

  const fetchData = useCallback(async () => {
    try {
      setLoading(true);
      const [vpsRes, mt5Res] = await Promise.all([
        fetch('/api/vps'),
        fetch('/api/mt5/connect?status=approved'),
      ]);

      if (vpsRes.ok) {
        const vpsData = await vpsRes.json();
        setVpsInstances(vpsData.data || []);
      }

      if (mt5Res.ok) {
        const mt5Data = await mt5Res.json();
        setMt5Accounts(mt5Data.data || []);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      onError?.('Failed to load VPS data');
    } finally {
      setLoading(false);
    }
  }, [onError]);

  const fetchVultrConfig = useCallback(async () => {
    try {
      const res = await fetch('/api/vps/provision');
      if (res.ok) {
        const data = await res.json();
        setVultrConfig(data);
      }
    } catch (error) {
      console.error('Error fetching Vultr config:', error);
    }
  }, []);

  useEffect(() => {
    fetchData();
    fetchVultrConfig();
  }, [fetchData, fetchVultrConfig]);

  // ========== HANDLERS ==========

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);

    try {
      const res = await fetch('/api/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5_account_id: parseInt(createFormData.mt5_account_id),
          name: createFormData.name,
          ip_address: createFormData.ip_address,
          ssh_port: parseInt(createFormData.ssh_port),
          ssh_username: createFormData.ssh_username,
          ssh_password: createFormData.ssh_password,
          os_type: 'windows',
          status: 'pending',
        }),
      });

      if (res.ok) {
        onSuccess?.('VPS added successfully');
        setShowCreatePanel(false);
        resetCreateForm();
        fetchData();
      } else {
        const data = await res.json();
        onError?.(data.error || 'Failed to add VPS');
      }
    } catch (error) {
      onError?.('Failed to add VPS');
    } finally {
      setActionLoading(false);
    }
  };

  const handleUpdate = async (id: number) => {
    if (!editorFormData) return;
    setActionLoading(true);

    try {
      const payload: Record<string, unknown> = { ...editorFormData };
      if (editorFormData.ssh_port) payload.ssh_port = parseInt(editorFormData.ssh_port, 10);
      if (!editorFormData.ssh_password) delete payload.ssh_password;

      const res = await fetch(`/api/vps?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      if (res.ok) {
        onSuccess?.('VPS updated successfully');
        fetchData();
        setExpandedId(null);
      } else {
        const responseData = await res.json();
        onError?.(responseData.error || 'Failed to update VPS');
      }
    } catch (error) {
      onError?.('Failed to update VPS');
    } finally {
      setActionLoading(false);
    }
  };

  const handleExpand = (vps: VPSInstance) => {
    const isCurrentlyExpanded = expandedId === vps.id;
    if (!isCurrentlyExpanded) {
      setExpandedId(vps.id);
      setEditorFormData({
        name: vps.name,
        status: vps.status,
        ip_address: vps.ip_address || '',
        ssh_port: String(vps.ssh_port),
        ssh_username: vps.ssh_username || '',
        ssh_password: '', // Always clear password for security
        mt5_path: vps.mt5_path || '',
        ea_path: vps.ea_path || '',
        notes: vps.notes || '',
        provider: vps.provider || '',
        provider_instance_id: vps.provider_instance_id || '',
        provider_region: vps.provider_region || '',
        provider_plan: vps.provider_plan || '',
      });
    } else {
      setExpandedId(null);
      setEditorFormData(null);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm('Are you sure you want to delete this VPS?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/vps?id=${id}`, { method: 'DELETE' });
      if (res.ok) {
        onSuccess?.('VPS deleted successfully');
        fetchData();
      } else {
        onError?.('Failed to delete VPS');
      }
    } catch (error) {
      onError?.('Failed to delete VPS');
    } finally {
      setActionLoading(false);
    }
  };

  const handleTestConnection = async (id: number) => {
    setTestingConnection(id);
    try {
      const res = await fetch('/api/vps/provision-vps', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vps_id: id }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess?.(`SSH connection successful: ${data.data?.hostname || 'Connected'}`);
      } else {
        onError?.(data.error || 'SSH connection failed');
      }
    } catch (error) {
      onError?.('Failed to test connection');
    } finally {
      setTestingConnection(null);
    }
  };

  const handleDeploy = async (vps: VPSInstance) => {
    if (!confirm(`Deploy EA to ${vps.name}? This will install MT5 and copy the EA file.`)) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/vps/provision-vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ vps_id: vps.id }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess?.('Provisioning started');
        fetchData();
      } else {
        onError?.(data.error || 'Failed to start provisioning');
      }
    } catch (error) {
      onError?.('Failed to start provisioning');
    } finally {
      setActionLoading(false);
    }
  };

  const handleHealthCheck = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/vps?id=${id}&action=health`, { method: 'PATCH' });
      if (res.ok) {
        onSuccess?.('Health check initiated');
        fetchData();
      } else {
        onError?.('Health check failed');
      }
    } catch (error) {
      onError?.('Health check failed');
    } finally {
      setActionLoading(false);
    }
  };

  const handleStatusChange = async (id: number, status: string) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/vps?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ status }),
      });

      if (res.ok) {
        onSuccess?.(`Status updated to ${status}`);
        fetchData();
      } else {
        onError?.('Failed to update status');
      }
    } catch (error) {
      onError?.('Failed to update status');
    } finally {
      setActionLoading(false);
    }
  };

  const handleSyncVultr = async (id: number) => {
    setActionLoading(true);
    try {
      const res = await fetch(`/api/vps/provision?vps_id=${id}&action=status`);
      if (res.ok) {
        onSuccess?.('Status synced from Vultr');
        fetchData();
      } else {
        onError?.('Failed to sync status');
      }
    } catch (error) {
      onError?.('Failed to sync status');
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
          name: vultrFormData.name || undefined,
          region: vultrFormData.region,
          plan: vultrFormData.plan,
        }),
      });

      const data = await res.json();
      if (data.success) {
        onSuccess?.('VPS provisioning started on Vultr');
        setShowVultrPanel(false);
        resetVultrForm();
        fetchData();
      } else {
        onError?.(data.error || 'Failed to provision VPS');
      }
    } catch (error) {
      onError?.('Failed to provision VPS');
    } finally {
      setActionLoading(false);
    }
  };

  // ========== FORM HELPERS ==========

  const resetCreateForm = () => {
    setCreateFormData({
      mt5_account_id: '',
      name: '',
      ip_address: '',
      ssh_port: '22',
      ssh_username: 'Administrator',
      ssh_password: '',
    });
  };

  const resetVultrForm = () => {
    setVultrFormData({
      mt5_account_id: '',
      name: '',
      region: '',
      plan: '',
    });
  };

  // ========== LIST CONTAINER HELPERS ==========

  const getSearchableText = (vps: VPSInstance) => {
    return [
      vps.name,
      vps.ip_address,
      vps.account_number,
      vps.mt5_server,
      vps.user_email,
      vps.first_name,
      vps.last_name,
      vps.provider,
    ].filter(Boolean).join(' ');
  };

  const getFilterValue = (vps: VPSInstance) => vps.status;

  // ========== RENDER ==========

  return (
    <div className="space-y-4">
      <ListContainer
        items={vpsInstances}
        renderItem={(vps) => {
          const isExpanded = expandedId === vps.id;
          const updatedDate = new Date(vps.updated_at).toLocaleDateString('en-US', {
            month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit',
          });

          return (
            <ListItem
              key={vps.id}
              onClick={() => handleExpand(vps)}
              title={vps.name}
              subtitle={`${vps.account_number} • ${vps.mt5_server}`}
              badges={[
                vps.ea_path && (
                  <span key="ea" className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-[#c9a227]/10 text-[#c9a227] rounded">
                    EA
                  </span>
                ),
                vps.provider && (
                  <span key="provider" className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-600 rounded capitalize">
                    {vps.provider}
                  </span>
                ),
              ]}
              attributes={[
                { label: 'Connection', value: vps.ip_address ? `${vps.ip_address}:${vps.ssh_port}` : '—', isSensitive: true },
                { label: 'Status', value: <StatusBadge status={vps.status} /> },
                { label: 'Last Updated', value: updatedDate },
              ]}
              actionButtons={
                <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                  {/* Test SSH */}
                  {vps.ip_address && vps.has_ssh_password && (
                    <button
                      onClick={() => handleTestConnection(vps.id)}
                      disabled={(testingConnection === vps.id) || actionLoading}
                      className="p-1.5 text-stone-400 hover:text-[#c9a227] hover:bg-[#c9a227]/10 rounded-lg transition-colors disabled:opacity-50"
                      title="Test SSH Connection"
                    >
                      {testingConnection === vps.id ? (
                        <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                        </svg>
                      ) : (
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                        </svg>
                      )}
                    </button>
                  )}
                  {/* Deploy EA */}
                  {vps.ip_address && vps.has_ssh_password && !vps.ea_path && vps.status !== 'provisioning' && (
                    <button
                      onClick={() => handleDeploy(vps)}
                      disabled={actionLoading}
                      className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Deploy EA"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                      </svg>
                    </button>
                  )}
                  {/* Sync (Vultr) */}
                  {vps.provider === 'vultr' && vps.provider_instance_id && vps.status === 'provisioning' && (
                    <button
                      onClick={() => handleSyncVultr(vps.id)}
                      disabled={actionLoading}
                      className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Sync Status"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                      </svg>
                    </button>
                  )}
                  {/* Health Check */}
                  {vps.status === 'active' && (
                     <button
                      onClick={() => handleHealthCheck(vps.id)}
                      disabled={actionLoading}
                      className="p-1.5 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors disabled:opacity-50"
                      title="Health Check"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                      </svg>
                    </button>
                  )}
                  {/* Delete */}
                  <button
                    onClick={() => handleDelete(vps.id)}
                    disabled={actionLoading}
                    className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                    title="Delete"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                  </button>
                </div>
              }
              collapsibleContent={
                isExpanded && editorFormData && (
                  <VPSEditor
                    vps={vps}
                    formData={editorFormData}
                    setFormData={setEditorFormData}
                    onSave={() => handleUpdate(vps.id)}
                    onCancel={() => setExpandedId(null)}
                    isLoading={actionLoading}
                  />
                )
              }
            />
          );
        }}
        getSearchableText={getSearchableText}
        getFilterValue={getFilterValue}
        filterOptions={VPS_FILTER_OPTIONS}
        defaultFilter="all"
        pageSize={10}
        loading={loading}
        onRefresh={fetchData}
        title="VPS Instances"
        subtitle="Manage your Windows VPS servers for automated trading"
        searchPlaceholder="Search by name, IP, account..."
        headerActions={
          <>
            {vultrConfig?.configured && (
              <button
                onClick={() => setShowVultrPanel(true)}
                className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg transition-colors"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 10-9.78 2.096A4.001 4.001 0 003 15z" />
                </svg>
                Auto-Provision
              </button>
            )}
            <button
              onClick={() => setShowCreatePanel(true)}
              disabled={mt5Accounts.length === 0}
              className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-white bg-[#c9a227] hover:bg-[#b8922a] rounded-lg transition-colors disabled:opacity-50"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
              </svg>
              Add VPS
            </button>
          </>
        }
        emptyState={
          <div className="text-center py-8">
            <svg className="w-12 h-12 mx-auto mb-3 text-gray-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M5 12h14M5 12a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v4a2 2 0 01-2 2M5 12a2 2 0 00-2 2v4a2 2 0 002 2h14a2 2 0 002-2v-4a2 2 0 00-2-2" />
            </svg>
            <p className="font-medium text-gray-600">No VPS instances</p>
            <p className="text-sm text-gray-400 mt-1">Add your first VPS to get started</p>
            {mt5Accounts.length > 0 && (
              <button
                onClick={() => setShowCreatePanel(true)}
                className="mt-4 px-4 py-2 text-sm font-medium text-white bg-[#c9a227] hover:bg-[#b8922a] rounded-lg transition-colors"
              >
                Add VPS
              </button>
            )}
          </div>
        }
      />

      {/* ===== CREATE VPS PANEL ===== */}
      <SlideOutPanel
        isOpen={showCreatePanel}
        onClose={() => { setShowCreatePanel(false); resetCreateForm(); }}
        title="Add VPS"
        subtitle="Enter your Windows VPS credentials"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleCreate} className="space-y-5">
          {/* MT5 Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MT5 Account *</label>
            <select
              value={createFormData.mt5_account_id}
              onChange={(e) => setCreateFormData({ ...createFormData, mt5_account_id: e.target.value })}
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

          {/* VPS Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VPS Name *</label>
            <input
              type="text"
              value={createFormData.name}
              onChange={(e) => setCreateFormData({ ...createFormData, name: e.target.value })}
              placeholder="e.g., My Trading VPS"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
              required
            />
          </div>

          {/* SSH Connection Section */}
          <div className="space-y-4 pt-4 border-t border-gray-100">
            <h4 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">SSH Connection</h4>

            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-xs text-gray-500 mb-1">IP Address *</label>
                <input
                  type="text"
                  value={createFormData.ip_address}
                  onChange={(e) => setCreateFormData({ ...createFormData, ip_address: e.target.value })}
                  placeholder="192.168.1.100"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-xs text-gray-500 mb-1">Port</label>
                <input
                  type="number"
                  value={createFormData.ssh_port}
                  onChange={(e) => setCreateFormData({ ...createFormData, ssh_port: e.target.value })}
                  placeholder="22"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Username *</label>
              <input
                type="text"
                value={createFormData.ssh_username}
                onChange={(e) => setCreateFormData({ ...createFormData, ssh_username: e.target.value })}
                placeholder="Administrator"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                required
              />
            </div>

            <div>
              <label className="block text-xs text-gray-500 mb-1">Password *</label>
              <input
                type="password"
                value={createFormData.ssh_password}
                onChange={(e) => setCreateFormData({ ...createFormData, ssh_password: e.target.value })}
                placeholder="••••••••"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                required
              />
            </div>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700">
                Your VPS must have OpenSSH Server enabled. After adding, use &quot;Test SSH&quot; to verify, then &quot;Deploy EA&quot; to install.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setShowCreatePanel(false); resetCreateForm(); }}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 px-4 py-2.5 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {actionLoading ? 'Adding...' : 'Add VPS'}
            </button>
          </div>
        </form>
      </SlideOutPanel>

      {/* ===== VULTR AUTO-PROVISION PANEL ===== */}
      <SlideOutPanel
        isOpen={showVultrPanel && !!vultrConfig?.configured}
        onClose={() => { setShowVultrPanel(false); resetVultrForm(); }}
        title="Auto-Provision VPS"
        subtitle="Create a Windows VPS via Vultr API"
        maxWidth="max-w-md"
      >
        <form onSubmit={handleVultrProvision} className="space-y-5">
          {/* MT5 Account */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">MT5 Account *</label>
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

          {/* VPS Name */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">VPS Name (optional)</label>
            <input
              type="text"
              value={vultrFormData.name}
              onChange={(e) => setVultrFormData({ ...vultrFormData, name: e.target.value })}
              placeholder="Auto-generated if empty"
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          {/* Region */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Region *</label>
            <select
              value={vultrFormData.region}
              onChange={(e) => setVultrFormData({ ...vultrFormData, region: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Region</option>
              {vultrConfig?.regions?.map((region) => (
                <option key={region.id} value={region.id}>
                  {region.city}, {region.country} ({region.id})
                </option>
              ))}
            </select>
          </div>

          {/* Plan */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Plan *</label>
            <select
              value={vultrFormData.plan}
              onChange={(e) => setVultrFormData({ ...vultrFormData, plan: e.target.value })}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              required
            >
              <option value="">Select Plan</option>
              {vultrConfig?.plans?.map((plan) => (
                <option key={plan.id} value={plan.id}>
                  {plan.vcpu_count} vCPU / {plan.ram / 1024}GB RAM / {plan.disk}GB SSD - ${plan.monthly_cost}/mo
                </option>
              ))}
            </select>
          </div>

          {/* Info Box */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <div className="flex items-start gap-2">
              <svg className="w-4 h-4 text-blue-600 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <p className="text-xs text-blue-700">
                A Windows Server instance will be created on Vultr. SSH credentials will be auto-configured.
              </p>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4 border-t border-gray-100">
            <button
              type="button"
              onClick={() => { setShowVultrPanel(false); resetVultrForm(); }}
              className="flex-1 px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-lg transition-colors font-medium"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={actionLoading}
              className="flex-1 px-4 py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium disabled:opacity-50"
            >
              {actionLoading ? 'Provisioning...' : 'Provision VPS'}
            </button>
          </div>
        </form>
      </SlideOutPanel>
    </div>
  );
}
