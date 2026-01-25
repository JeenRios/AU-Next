'use client';

import { useState, useRef, useEffect } from 'react';

// ============================================================================
// TYPES & INTERFACES
// ============================================================================

export interface VPSInstance {
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
}

export interface VPSFormData {
  name: string;
  status: string;
  ip_address: string;
  ssh_port: string;
  ssh_username: string;
  ssh_password: string;
  mt5_path: string;
  ea_path: string;
  notes: string;
  provider: string;
  provider_instance_id: string;
  provider_region: string;
  provider_plan: string;
}

export interface VPSRowProps {
  vps: VPSInstance;
  onUpdate: (id: number, data: Partial<VPSFormData>) => Promise<void>;
  onDelete: (id: number) => void;
  onTestConnection: (id: number) => Promise<void>;
  onDeploy: (vps: VPSInstance) => void;
  onHealthCheck: (id: number) => void;
  onStatusChange: (id: number, status: string) => void;
  onSyncVultr?: (id: number) => void;
  isTestingConnection?: boolean;
  isLoading?: boolean;
}

// ============================================================================
// STATUS BADGE COMPONENT
// ============================================================================

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
// INLINE EDITOR SECTION
// ============================================================================

interface InlineEditorProps {
  vps: VPSInstance;
  formData: VPSFormData;
  setFormData: (data: VPSFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

function InlineEditor({ vps, formData, setFormData, onSave, onCancel, isLoading }: InlineEditorProps) {
  return (
    // Highlighted expanded content with gold accent
    <div className="bg-[#c9a227]/5 border-t-2 border-[#c9a227]">
      <div className="p-4">
        {/* Editor Header */}
        <div className="flex items-center gap-2 mb-4">
          <h4 className="text-xs font-semibold text-[#c9a227] uppercase tracking-wider">Edit Configuration</h4>
        </div>

          <form onSubmit={(e) => { e.preventDefault(); onSave(); }} className="space-y-4">
          {/* Section: Connection Settings */}
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Connection Settings</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Name</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Status</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
            >
              <option value="pending">Pending</option>
              <option value="provisioning">Provisioning</option>
              <option value="active">Active</option>
              <option value="error">Error</option>
              <option value="decommissioned">Decommissioned</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">IP Address</label>
            <input
              type="text"
              value={formData.ip_address}
              onChange={(e) => setFormData({ ...formData, ip_address: e.target.value })}
              placeholder="192.168.1.100"
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white font-mono"
            />
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Port</label>
              <input
                type="number"
                value={formData.ssh_port}
                onChange={(e) => setFormData({ ...formData, ssh_port: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-stone-600 mb-1">Username</label>
              <input
                type="text"
                value={formData.ssh_username}
                onChange={(e) => setFormData({ ...formData, ssh_username: e.target.value })}
                className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
              />
            </div>
          </div>
          </div>
          </div>

          {/* Section: Paths & Credentials */}
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Paths & Credentials</p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">New SSH Password</label>
            <input
              type="password"
              value={formData.ssh_password}
              onChange={(e) => setFormData({ ...formData, ssh_password: e.target.value })}
              placeholder="Leave blank to keep"
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">MT5 Path</label>
            <input
              type="text"
              value={formData.mt5_path}
              onChange={(e) => setFormData({ ...formData, mt5_path: e.target.value })}
              placeholder="C:\Program Files\MetaTrader 5"
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white font-mono"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">EA Path</label>
            <input
              type="text"
              value={formData.ea_path}
              onChange={(e) => setFormData({ ...formData, ea_path: e.target.value })}
              placeholder="...\MQL5\Experts\EA.ex5"
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white font-mono"
            />
          </div>
          </div>
          </div>

          {/* Section: Provider Info */}
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Provider Information</p>
            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Provider</label>
            <select
              value={formData.provider}
              onChange={(e) => setFormData({ ...formData, provider: e.target.value })}
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
            >
              <option value="">Manual</option>
              <option value="vultr">Vultr</option>
              <option value="digitalocean">DigitalOcean</option>
              <option value="linode">Linode</option>
              <option value="hetzner">Hetzner</option>
              <option value="aws">AWS EC2</option>
            </select>
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Instance ID</label>
            <input
              type="text"
              value={formData.provider_instance_id}
              onChange={(e) => setFormData({ ...formData, provider_instance_id: e.target.value })}
              placeholder="abc123..."
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Region</label>
            <input
              type="text"
              value={formData.provider_region}
              onChange={(e) => setFormData({ ...formData, provider_region: e.target.value })}
              placeholder="ewr, nyc1"
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
            />
          </div>
          <div>
            <label className="block text-xs font-medium text-stone-600 mb-1">Plan</label>
            <input
              type="text"
              value={formData.provider_plan}
              onChange={(e) => setFormData({ ...formData, provider_plan: e.target.value })}
              placeholder="vc2-1c-2gb"
              className="w-full px-3 py-1.5 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white"
            />
          </div>
          </div>
          </div>

          {/* Section: Notes */}
          <div>
            <p className="text-[10px] font-semibold text-stone-400 uppercase tracking-wider mb-2">Additional Notes</p>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={2}
              placeholder="Add any notes about this VPS instance..."
              className="w-full px-3 py-2 text-sm border border-stone-300 rounded-lg focus:ring-2 focus:ring-[#c9a227]/20 focus:border-[#c9a227] bg-white resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="flex items-center justify-end gap-2 pt-4 border-t border-stone-200 mt-4">
            <button
              type="button"
              onClick={onCancel}
              className="px-4 py-2 text-sm font-medium text-stone-600 bg-white border border-stone-300 rounded-lg hover:bg-stone-100 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={isLoading}
              className="px-4 py-2 text-sm font-medium text-white bg-[#c9a227] rounded-lg hover:bg-[#b8922a] transition-colors disabled:opacity-50"
            >
              {isLoading ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ============================================================================
// MAIN VPS ROW COMPONENT
// ============================================================================

/**
 * VPSRow - A single VPS item with expandable inline editor.
 *
 * Architecture decisions:
 * - Row manages its own expand/collapse state
 * - Form data initialized from vps prop on expand
 * - Smooth height animation using CSS transitions
 * - Action handlers passed as props for separation of concerns
 */
export default function VPSRow({
  vps,
  onUpdate,
  onDelete,
  onTestConnection,
  onDeploy,
  onHealthCheck,
  onStatusChange,
  onSyncVultr,
  isTestingConnection = false,
  isLoading = false,
}: VPSRowProps) {
  // ========== STATE ==========
  const [isExpanded, setIsExpanded] = useState(false);
  const [formData, setFormData] = useState<VPSFormData>({
    name: '',
    status: '',
    ip_address: '',
    ssh_port: '',
    ssh_username: '',
    ssh_password: '',
    mt5_path: '',
    ea_path: '',
    notes: '',
    provider: '',
    provider_instance_id: '',
    provider_region: '',
    provider_plan: '',
  });

  // For smooth height animation
  const contentRef = useRef<HTMLDivElement>(null);
  const [contentHeight, setContentHeight] = useState(0);

  // Update content height when expanded
  useEffect(() => {
    if (contentRef.current) {
      setContentHeight(isExpanded ? contentRef.current.scrollHeight : 0);
    }
  }, [isExpanded, formData]);

  // ========== HANDLERS ==========

  const handleExpand = () => {
    if (!isExpanded) {
      // Initialize form data from vps when expanding
      setFormData({
        name: vps.name,
        status: vps.status,
        ip_address: vps.ip_address || '',
        ssh_port: String(vps.ssh_port),
        ssh_username: vps.ssh_username || '',
        ssh_password: '',
        mt5_path: vps.mt5_path || '',
        ea_path: vps.ea_path || '',
        notes: vps.notes || '',
        provider: vps.provider || '',
        provider_instance_id: vps.provider_instance_id || '',
        provider_region: vps.provider_region || '',
        provider_plan: vps.provider_plan || '',
      });
    }
    setIsExpanded(!isExpanded);
  };

  const handleSave = async () => {
    await onUpdate(vps.id, formData);
    setIsExpanded(false);
  };

  const handleCancel = () => {
    setIsExpanded(false);
  };

  // ========== DERIVED VALUES ==========
  const isActive = vps.status === 'active';
  const isProvisioning = vps.status === 'provisioning';
  const canTest = vps.ip_address && vps.has_ssh_password;
  const canDeploy = canTest && !vps.ea_path && vps.status !== 'provisioning';
  const updatedDate = new Date(vps.updated_at).toLocaleDateString('en-US', {
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });

  // ========== RENDER ==========
  return (
    <div
      className={`
        relative transition-all duration-200 ease-out
        ${isExpanded
          ? 'bg-white'
          : 'bg-white hover:bg-stone-50 border-b border-stone-100'
        }
      `}
    >
      {/* ===== MAIN ROW ===== */}
      <div className="px-4 py-3">
        <div className="flex items-center gap-4">
          {/* Expand Toggle - Larger hit area */}
          <button
            onClick={handleExpand}
            className={`
              flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-lg
              transition-all duration-200
              ${isExpanded
                ? 'bg-[#c9a227]/15 text-[#c9a227]'
                : 'text-stone-400 hover:text-stone-600 hover:bg-stone-100'
              }
            `}
            aria-label={isExpanded ? 'Collapse' : 'Expand'}
          >
            <svg
              className={`w-4 h-4 transition-transform duration-200 ease-out ${isExpanded ? 'rotate-90' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
            </svg>
          </button>

          {/* VPS Name & Server */}
          <div className="min-w-0 flex-1">
            <div className="flex items-center gap-2">
              <span className={`font-medium text-sm truncate transition-colors duration-200 ${isExpanded ? 'text-[#c9a227]' : 'text-[#1a1a1d]'}`}>
                {vps.name}
              </span>
              {vps.ea_path && (
                <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-semibold bg-[#c9a227]/10 text-[#c9a227] rounded">
                  EA
                </span>
              )}
              {vps.provider && (
                <span className="flex-shrink-0 px-1.5 py-0.5 text-[10px] font-medium bg-indigo-50 text-indigo-600 rounded capitalize">
                  {vps.provider}
                </span>
              )}
            </div>
            <p className="text-xs text-stone-400 truncate mt-0.5">
              {vps.account_number} • {vps.mt5_server}
            </p>
          </div>

          {/* IP Address */}
          <div className="hidden sm:block min-w-[140px]">
            <p className="text-xs text-stone-500">Connection</p>
            <p className="text-sm font-mono text-stone-700 truncate">
              {vps.ip_address ? `${vps.ip_address}:${vps.ssh_port}` : '—'}
            </p>
          </div>

          {/* Status */}
          <div className="hidden md:block">
            <StatusBadge status={vps.status} />
          </div>

          {/* Last Updated */}
          <div className="hidden lg:block min-w-[100px] text-right">
            <p className="text-xs text-stone-400">{updatedDate}</p>
          </div>

          {/* Action Buttons */}
          <div className="flex items-center gap-1 flex-shrink-0">
            {/* Test SSH */}
            {canTest && (
              <button
                onClick={() => onTestConnection(vps.id)}
                disabled={isTestingConnection || isLoading}
                className="p-1.5 text-stone-400 hover:text-[#c9a227] hover:bg-[#c9a227]/10 rounded-lg transition-colors disabled:opacity-50"
                title="Test SSH Connection"
              >
                {isTestingConnection ? (
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
            {canDeploy && (
              <button
                onClick={() => onDeploy(vps)}
                disabled={isLoading}
                className="p-1.5 text-stone-400 hover:text-emerald-600 hover:bg-emerald-50 rounded-lg transition-colors disabled:opacity-50"
                title="Deploy EA"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
                </svg>
              </button>
            )}

            {/* Sync (Vultr) */}
            {vps.provider === 'vultr' && vps.provider_instance_id && isProvisioning && onSyncVultr && (
              <button
                onClick={() => onSyncVultr(vps.id)}
                disabled={isLoading}
                className="p-1.5 text-stone-400 hover:text-blue-600 hover:bg-blue-50 rounded-lg transition-colors disabled:opacity-50"
                title="Sync Status"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                </svg>
              </button>
            )}

            {/* Health Check */}
            {isActive && (
              <button
                onClick={() => onHealthCheck(vps.id)}
                disabled={isLoading}
                className="p-1.5 text-stone-400 hover:text-pink-600 hover:bg-pink-50 rounded-lg transition-colors disabled:opacity-50"
                title="Health Check"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z" />
                </svg>
              </button>
            )}

            {/* Edit (Toggle Expand) */}
            <button
              onClick={handleExpand}
              className={`
                p-2 rounded-lg transition-all duration-200
                ${isExpanded
                  ? 'text-[#c9a227] bg-[#c9a227]/15'
                  : 'text-stone-400 hover:text-[#c9a227] hover:bg-[#c9a227]/10'
                }
              `}
              title={isExpanded ? 'Collapse' : 'Edit'}
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
              </svg>
            </button>

            {/* Delete */}
            <button
              onClick={() => onDelete(vps.id)}
              disabled={isLoading}
              className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
              title="Delete"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile-only status row */}
        <div className="flex items-center gap-2 mt-2 md:hidden">
          <StatusBadge status={vps.status} />
          {vps.ip_address && (
            <span className="text-xs font-mono text-stone-500">{vps.ip_address}</span>
          )}
        </div>
      </div>

      {/* ===== EXPANDABLE EDITOR SECTION (Level 3) ===== */}
      <div
        ref={contentRef}
        style={{ height: contentHeight }}
        className="overflow-hidden transition-[height] duration-200 ease-out"
      >
        <div
          className={`
            transition-opacity duration-200 ease-out
            ${isExpanded ? 'opacity-100' : 'opacity-0'}
          `}
        >
          {isExpanded && (
            <InlineEditor
              vps={vps}
              formData={formData}
              setFormData={setFormData}
              onSave={handleSave}
              onCancel={handleCancel}
              isLoading={isLoading}
            />
          )}
        </div>
      </div>
    </div>
  );
}
