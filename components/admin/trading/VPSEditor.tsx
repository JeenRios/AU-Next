'use client';

import { ReactNode } from 'react';

// ============================================================================
// TYPES & INTERFACES (Exported for use in VPSManagement)
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

interface VPSEditorProps {
  vps: VPSInstance;
  formData: VPSFormData;
  setFormData: (data: VPSFormData) => void;
  onSave: () => void;
  onCancel: () => void;
  isLoading: boolean;
}

// ============================================================================
// VPS EDITOR COMPONENT
// ============================================================================

export default function VPSEditor({ vps, formData, setFormData, onSave, onCancel, isLoading }: VPSEditorProps) {
  return (
    // Highlighted expanded content with gold accent
    <div className="bg-[#c9a227]/10 border-t border-stone-200 shadow-inner-top">
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
