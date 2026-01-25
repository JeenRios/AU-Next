'use client';

import { useState, useEffect } from 'react';

interface MT5Account {
  login: number;
  name: string;
  server: string;
  currency: string;
  balance: number;
  equity: number;
  margin: number;
  margin_free: number;
  margin_level: number;
  profit: number;
  leverage: number;
  trade_allowed: boolean;
}

interface Position {
  ticket: number;
  symbol: string;
  type: string;
  volume: number;
  price_open: number;
  price_current: number;
  sl: number;
  tp: number;
  profit: number;
  swap: number;
  time: string;
  comment: string;
}

interface MT5Status {
  success: boolean;
  status: string;
  mt5_available: boolean;
  active_connections: number;
}

interface PendingAccount {
  id: number;
  account_number: string;
  server: string;
  platform: string;
  status: string;
  user_email: string;
  created_at: string;
  automation_status?: string;
  ea_status?: string;
  balance?: number;
  equity?: number;
  profit?: number;
  gain_percentage?: number;
  open_positions_count?: number;
  last_sync_at?: string;
}

interface VPSInfo {
  id: number;
  name: string;
  status: string;
  ip_address: string | null;
}

export default function MT5Trading() {
  const [serviceStatus, setServiceStatus] = useState<MT5Status | null>(null);
  const [account, setAccount] = useState<MT5Account | null>(null);
  const [positions, setPositions] = useState<Position[]>([]);
  const [pendingAccounts, setPendingAccounts] = useState<PendingAccount[]>([]);
  const [allAccounts, setAllAccounts] = useState<PendingAccount[]>([]);
  const [vpsMap, setVpsMap] = useState<Record<number, VPSInfo>>({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionLoading, setActionLoading] = useState(false);
  const [refreshingAccountId, setRefreshingAccountId] = useState<number | null>(null);
  const [expandedAccountId, setExpandedAccountId] = useState<number | null>(null);
  const [showVpsSetup, setShowVpsSetup] = useState(false);
  const [selectedAccountForVps, setSelectedAccountForVps] = useState<PendingAccount | null>(null);
  const [rejectionReason, setRejectionReason] = useState('');
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [accountToReject, setAccountToReject] = useState<PendingAccount | null>(null);

  // Login form state
  const [showLoginForm, setShowLoginForm] = useState(false);
  const [loginForm, setLoginForm] = useState({
    account: '',
    password: '',
    server: '',
  });

  // Trade form state
  const [showTradeForm, setShowTradeForm] = useState(false);
  const [tradeForm, setTradeForm] = useState({
    symbol: 'EURUSD',
    type: 'buy',
    volume: '0.01',
    sl: '',
    tp: '',
  });

  // VPS Setup form state
  const [vpsForm, setVpsForm] = useState({
    name: '',
    ip_address: '',
    ssh_port: '22',
    ssh_username: '',
    ssh_password: '',
    os_type: 'windows',
    mt5_path: 'C:\\Program Files\\MetaTrader 5\\terminal64.exe',
    ea_path: 'C:\\Program Files\\MetaTrader 5\\MQL5\\Experts\\',
    notes: '',
  });

  useEffect(() => {
    fetchData();
    const interval = setInterval(fetchData, 10000); // Refresh every 10 seconds
    return () => clearInterval(interval);
  }, []);

  const fetchData = async () => {
    try {
      // Fetch service status
      const statusRes = await fetch('/api/mt5/trading?action=health');
      const statusData = await statusRes.json();
      setServiceStatus(statusData);

      if (statusData.success && statusData.mt5_available) {
        // Fetch account info
        const accountRes = await fetch('/api/mt5/trading?action=account');
        const accountData = await accountRes.json();
        if (accountData.success) {
          setAccount(accountData.account);
        }

        // Fetch positions
        const positionsRes = await fetch('/api/mt5/trading?action=positions');
        const positionsData = await positionsRes.json();
        if (positionsData.success) {
          setPositions(positionsData.positions || []);
        }
      }

      // Fetch all MT5 account requests
      const pendingRes = await fetch('/api/mt5/connect');
      const pendingData = await pendingRes.json();
      if (pendingData.success) {
        setAllAccounts(pendingData.data || []);
        setPendingAccounts(pendingData.data?.filter((a: PendingAccount) => a.status === 'pending') || []);
      }

      // Fetch VPS instances
      const vpsRes = await fetch('/api/vps');
      const vpsData = await vpsRes.json();
      if (vpsData.success) {
        const vpsMapping: Record<number, VPSInfo> = {};
        vpsData.data.forEach((v: any) => {
          vpsMapping[v.mt5_account_id] = {
            id: v.id,
            name: v.name,
            status: v.status,
            ip_address: v.ip_address
          };
        });
        setVpsMap(vpsMapping);
      }

      setError(null);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleInitialize = async () => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/mt5/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'initialize' }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/mt5/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'login',
          account: loginForm.account,
          password: loginForm.password,
          server: loginForm.server,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      } else {
        setShowLoginForm(false);
        setLoginForm({ account: '', password: '', server: '' });
        await fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleTrade = async (e: React.FormEvent) => {
    e.preventDefault();
    setActionLoading(true);
    try {
      const res = await fetch('/api/mt5/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'open',
          symbol: tradeForm.symbol,
          type: tradeForm.type,
          volume: parseFloat(tradeForm.volume),
          sl: tradeForm.sl ? parseFloat(tradeForm.sl) : undefined,
          tp: tradeForm.tp ? parseFloat(tradeForm.tp) : undefined,
        }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      } else {
        setShowTradeForm(false);
        setTradeForm({ symbol: 'EURUSD', type: 'buy', volume: '0.01', sl: '', tp: '' });
        await fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleClosePosition = async (ticket: number) => {
    if (!confirm(`Close position #${ticket}?`)) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/mt5/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'close', ticket }),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      } else {
        await fetchData();
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleApproveAccount = async (id: number, status: 'active' | 'rejected', reason?: string) => {
    setActionLoading(true);
    try {
      const body: any = { id, status };
      if (status === 'rejected' && reason) {
        body.rejection_reason = reason;
      }
      const res = await fetch('/api/mt5/connect', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!data.success) {
        setError(data.error);
      } else {
        await fetchData();
        setShowRejectModal(false);
        setRejectionReason('');
        setAccountToReject(null);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleRefreshAccountStatus = async (accountId: number) => {
    setRefreshingAccountId(accountId);
    try {
      const res = await fetch(`/api/mt5/status?account_id=${accountId}`);
      const data = await res.json();
      if (data.success) {
        // Update the account in allAccounts
        setAllAccounts(prev => prev.map(acc =>
          acc.id === accountId ? { ...acc, ...data.data } : acc
        ));
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setRefreshingAccountId(null);
    }
  };

  const handleDeployEA = async (accountId: number) => {
    setActionLoading(true);
    try {
      const res = await fetch('/api/automation/deploy-ea', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ mt5_account_id: accountId }),
      });
      const data = await res.json();
      if (data.success) {
        await fetchData();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const openRejectModal = (account: PendingAccount) => {
    setAccountToReject(account);
    setRejectionReason('');
    setShowRejectModal(true);
  };

  const handleCreateVps = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedAccountForVps) return;

    setActionLoading(true);
    try {
      const res = await fetch('/api/vps', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          mt5_account_id: selectedAccountForVps.id,
          name: vpsForm.name || `VPS-${selectedAccountForVps.account_number}`,
          ip_address: vpsForm.ip_address || null,
          ssh_port: parseInt(vpsForm.ssh_port) || 22,
          ssh_username: vpsForm.ssh_username || null,
          ssh_password: vpsForm.ssh_password || null,
          os_type: vpsForm.os_type,
          mt5_path: vpsForm.mt5_path || null,
          ea_path: vpsForm.ea_path || null,
          notes: vpsForm.notes || null,
        }),
      });
      const data = await res.json();
      if (data.success) {
        setShowVpsSetup(false);
        setSelectedAccountForVps(null);
        setVpsForm({
          name: '',
          ip_address: '',
          ssh_port: '22',
          ssh_username: '',
          ssh_password: '',
          os_type: 'windows',
          mt5_path: 'C:\\Program Files\\MetaTrader 5\\terminal64.exe',
          ea_path: 'C:\\Program Files\\MetaTrader 5\\MQL5\\Experts\\',
          notes: '',
        });
        await fetchData();
      } else {
        setError(data.error);
      }
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleShutdown = async () => {
    if (!confirm('Shutdown MT5 connection?')) return;
    setActionLoading(true);
    try {
      const res = await fetch('/api/mt5/trading', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'shutdown' }),
      });
      await res.json();
      setAccount(null);
      setPositions([]);
      await fetchData();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setActionLoading(false);
    }
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
      {/* Error Banner */}
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg flex justify-between items-center">
          <span>{error}</span>
          <button onClick={() => setError(null)} className="text-red-500 hover:text-red-700">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
      )}

      {/* Service Status Card */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-[#1a1a1d]">MT5 Service Status</h3>
          <div className="flex gap-2">
            <button
              onClick={fetchData}
              className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
            >
              Refresh
            </button>
            {!account && (
              <button
                onClick={handleInitialize}
                disabled={actionLoading}
                className="px-3 py-1.5 text-sm bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Initialize MT5
              </button>
            )}
            {!account && serviceStatus?.mt5_available && (
              <button
                onClick={() => setShowLoginForm(true)}
                disabled={actionLoading}
                className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Login
              </button>
            )}
            {account && (
              <button
                onClick={handleShutdown}
                disabled={actionLoading}
                className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                Disconnect
              </button>
            )}
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">Service</p>
            <p className={`font-semibold ${serviceStatus?.success ? 'text-green-600' : 'text-red-600'}`}>
              {serviceStatus?.success ? 'Running' : 'Offline'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">MT5 Module</p>
            <p className={`font-semibold ${serviceStatus?.mt5_available ? 'text-green-600' : 'text-yellow-600'}`}>
              {serviceStatus?.mt5_available ? 'Available' : 'Not Installed'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">Connection</p>
            <p className={`font-semibold ${account ? 'text-green-600' : 'text-gray-400'}`}>
              {account ? 'Connected' : 'Disconnected'}
            </p>
          </div>
          <div className="bg-gray-50 rounded-lg p-3">
            <p className="text-sm text-gray-500">Active Positions</p>
            <p className="font-semibold text-[#1a1a1d]">{positions.length}</p>
          </div>
        </div>
      </div>

      {/* Account Info Card */}
      {account && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1a1a1d]">Account: {account.login}</h3>
            <span className="text-sm text-gray-500">{account.server}</span>
          </div>

          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4">
            <div>
              <p className="text-sm text-gray-500">Balance</p>
              <p className="font-semibold text-[#1a1a1d]">${account.balance.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Equity</p>
              <p className="font-semibold text-[#1a1a1d]">${account.equity.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Profit</p>
              <p className={`font-semibold ${account.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                ${account.profit.toLocaleString()}
              </p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Margin</p>
              <p className="font-semibold text-[#1a1a1d]">${account.margin.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Free Margin</p>
              <p className="font-semibold text-[#1a1a1d]">${account.margin_free.toLocaleString()}</p>
            </div>
            <div>
              <p className="text-sm text-gray-500">Leverage</p>
              <p className="font-semibold text-[#1a1a1d]">1:{account.leverage}</p>
            </div>
          </div>
        </div>
      )}

      {/* Positions Table */}
      {account && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1a1a1d]">Open Positions</h3>
            <button
              onClick={() => setShowTradeForm(true)}
              disabled={!account.trade_allowed}
              className="px-4 py-2 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors disabled:opacity-50"
            >
              New Trade
            </button>
          </div>

          {positions.length === 0 ? (
            <p className="text-gray-500 text-center py-8">No open positions</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-gray-200">
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Ticket</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Symbol</th>
                    <th className="text-left py-2 px-3 text-sm font-medium text-gray-500">Type</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Volume</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Open</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Current</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">SL</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">TP</th>
                    <th className="text-right py-2 px-3 text-sm font-medium text-gray-500">Profit</th>
                    <th className="text-center py-2 px-3 text-sm font-medium text-gray-500">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {positions.map((pos) => (
                    <tr key={pos.ticket} className="border-b border-gray-100 hover:bg-gray-50">
                      <td className="py-2 px-3 text-sm">{pos.ticket}</td>
                      <td className="py-2 px-3 text-sm font-medium">{pos.symbol}</td>
                      <td className="py-2 px-3">
                        <span className={`text-xs px-2 py-1 rounded ${pos.type === 'buy' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                          {pos.type.toUpperCase()}
                        </span>
                      </td>
                      <td className="py-2 px-3 text-sm text-right">{pos.volume}</td>
                      <td className="py-2 px-3 text-sm text-right">{pos.price_open.toFixed(5)}</td>
                      <td className="py-2 px-3 text-sm text-right">{pos.price_current.toFixed(5)}</td>
                      <td className="py-2 px-3 text-sm text-right">{pos.sl || '-'}</td>
                      <td className="py-2 px-3 text-sm text-right">{pos.tp || '-'}</td>
                      <td className={`py-2 px-3 text-sm text-right font-medium ${pos.profit >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                        ${pos.profit.toFixed(2)}
                      </td>
                      <td className="py-2 px-3 text-center">
                        <button
                          onClick={() => handleClosePosition(pos.ticket)}
                          disabled={actionLoading}
                          className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                        >
                          Close
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {/* Pending Account Requests */}
      {pendingAccounts.length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
          <h3 className="text-lg font-semibold text-[#1a1a1d] mb-4">Pending MT5 Account Requests</h3>
          <div className="space-y-3">
            {pendingAccounts.map((acc) => (
              <div key={acc.id} className="flex items-center justify-between bg-amber-50 rounded-lg p-4">
                <div>
                  <p className="font-medium text-[#1a1a1d]">{acc.account_number} @ {acc.server}</p>
                  <p className="text-sm text-gray-500">{acc.user_email} - {acc.platform}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApproveAccount(acc.id, 'active')}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm bg-green-600 hover:bg-green-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Approve
                  </button>
                  <button
                    onClick={() => openRejectModal(acc)}
                    disabled={actionLoading}
                    className="px-3 py-1.5 text-sm bg-red-600 hover:bg-red-700 text-white rounded-lg disabled:opacity-50"
                  >
                    Reject
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* All Active Accounts with VPS/Automation Status */}
      {allAccounts.filter(a => a.status === 'active').length > 0 && (
        <div className="bg-white rounded-2xl border border-gray-200 shadow-lg p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-[#1a1a1d]">Active MT5 Accounts</h3>
            <span className="text-sm text-gray-500">{allAccounts.filter(a => a.status === 'active').length} accounts</span>
          </div>
          <div className="space-y-4">
            {allAccounts.filter(a => a.status === 'active').map((acc) => {
              const vps = vpsMap[acc.id];
              const isExpanded = expandedAccountId === acc.id;

              return (
                <div key={acc.id} className="border border-gray-200 rounded-xl overflow-hidden">
                  {/* Account Header */}
                  <div
                    className="flex items-center justify-between p-4 bg-gray-50 cursor-pointer hover:bg-gray-100"
                    onClick={() => setExpandedAccountId(isExpanded ? null : acc.id)}
                  >
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-2">
                        <span className="font-medium text-[#1a1a1d]">{acc.account_number}</span>
                        <span className="text-gray-400">@</span>
                        <span className="text-gray-600">{acc.server}</span>
                      </div>
                      <div className="flex items-center gap-2">
                        {/* EA Status Badge */}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          acc.ea_status === 'active' ? 'bg-green-100 text-green-700' :
                          acc.ea_status === 'inactive' ? 'bg-gray-100 text-gray-600' :
                          'bg-yellow-100 text-yellow-700'
                        }`}>
                          EA: {acc.ea_status?.toUpperCase() || 'INACTIVE'}
                        </span>
                        {/* Automation Status Badge */}
                        <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                          acc.automation_status === 'active' ? 'bg-green-100 text-green-700' :
                          acc.automation_status === 'vps_ready' ? 'bg-blue-100 text-blue-700' :
                          acc.automation_status === 'ea_deploying' ? 'bg-purple-100 text-purple-700' :
                          acc.automation_status === 'error' ? 'bg-red-100 text-red-700' :
                          'bg-gray-100 text-gray-600'
                        }`}>
                          {acc.automation_status?.replace('_', ' ').toUpperCase() || 'NONE'}
                        </span>
                        {/* VPS Status Badge */}
                        {vps && (
                          <span className={`px-2 py-0.5 text-xs font-medium rounded-full ${
                            vps.status === 'active' ? 'bg-green-100 text-green-700' :
                            vps.status === 'provisioning' ? 'bg-blue-100 text-blue-700' :
                            'bg-yellow-100 text-yellow-700'
                          }`}>
                            VPS: {vps.status.toUpperCase()}
                          </span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <button
                        onClick={(e) => { e.stopPropagation(); handleRefreshAccountStatus(acc.id); }}
                        disabled={refreshingAccountId === acc.id}
                        className="p-2 text-gray-500 hover:text-[#c9a227] hover:bg-amber-50 rounded-lg disabled:opacity-50"
                        title="Refresh Status"
                      >
                        <svg className={`w-4 h-4 ${refreshingAccountId === acc.id ? 'animate-spin' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                        </svg>
                      </button>
                      <svg className={`w-5 h-5 text-gray-400 transition-transform ${isExpanded ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </div>

                  {/* Expanded Details */}
                  {isExpanded && (
                    <div className="p-4 border-t border-gray-200">
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Balance</p>
                          <p className="font-semibold text-[#1a1a1d]">${(acc.balance || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Equity</p>
                          <p className="font-semibold text-[#1a1a1d]">${(acc.equity || 0).toLocaleString()}</p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Profit</p>
                          <p className={`font-semibold ${(acc.profit || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            ${(acc.profit || 0).toLocaleString()}
                          </p>
                        </div>
                        <div className="bg-gray-50 rounded-lg p-3">
                          <p className="text-xs text-gray-500">Gain %</p>
                          <p className={`font-semibold ${(acc.gain_percentage || 0) >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                            {(acc.gain_percentage || 0).toFixed(2)}%
                          </p>
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-sm text-gray-500 mb-4">
                        <span>Open Positions: <strong className="text-[#1a1a1d]">{acc.open_positions_count || 0}</strong></span>
                        <span>Last Sync: <strong className="text-[#1a1a1d]">{acc.last_sync_at ? new Date(acc.last_sync_at).toLocaleString() : 'Never'}</strong></span>
                      </div>

                      {/* VPS Info */}
                      {vps && (
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 mb-4">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium text-blue-900">{vps.name}</p>
                              <p className="text-sm text-blue-700">{vps.ip_address || 'IP not assigned'}</p>
                            </div>
                            <span className={`px-2 py-1 text-xs font-medium rounded ${
                              vps.status === 'active' ? 'bg-green-100 text-green-700' : 'bg-yellow-100 text-yellow-700'
                            }`}>
                              {vps.status.toUpperCase()}
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Action Buttons */}
                      <div className="flex flex-wrap gap-2">
                        {!vps && (
                          <button
                            onClick={() => { setSelectedAccountForVps(acc); setShowVpsSetup(true); }}
                            className="px-3 py-1.5 text-sm bg-blue-600 hover:bg-blue-700 text-white rounded-lg"
                          >
                            Setup VPS
                          </button>
                        )}
                        {vps && vps.status === 'active' && acc.automation_status !== 'active' && acc.automation_status !== 'ea_deploying' && (
                          <button
                            onClick={() => handleDeployEA(acc.id)}
                            disabled={actionLoading}
                            className="px-3 py-1.5 text-sm bg-purple-600 hover:bg-purple-700 text-white rounded-lg disabled:opacity-50"
                          >
                            Deploy EA
                          </button>
                        )}
                        {acc.automation_status === 'ea_deploying' && (
                          <span className="px-3 py-1.5 text-sm bg-purple-100 text-purple-700 rounded-lg flex items-center gap-2">
                            <svg className="w-4 h-4 animate-spin" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
                            </svg>
                            Deploying EA...
                          </span>
                        )}
                      </div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Rejection Reason Modal */}
      {showRejectModal && accountToReject && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[#1a1a1d] mb-4">Reject MT5 Account Request</h3>
            <p className="text-sm text-gray-500 mb-4">
              Account: <strong>{accountToReject.account_number}</strong> @ {accountToReject.server}
            </p>
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">Rejection Reason (Optional)</label>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter reason for rejection..."
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
              />
            </div>
            <div className="flex gap-3">
              <button
                onClick={() => { setShowRejectModal(false); setAccountToReject(null); setRejectionReason(''); }}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleApproveAccount(accountToReject.id, 'rejected', rejectionReason)}
                disabled={actionLoading}
                className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
              >
                {actionLoading ? 'Rejecting...' : 'Reject Request'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* VPS Setup Modal */}
      {showVpsSetup && selectedAccountForVps && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 overflow-y-auto">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 my-8">
            <h3 className="text-lg font-semibold text-[#1a1a1d] mb-4">Setup VPS for MT5 Account</h3>
            <p className="text-sm text-gray-500 mb-4">
              Account: <strong>{selectedAccountForVps.account_number}</strong> @ {selectedAccountForVps.server}
            </p>
            <form onSubmit={handleCreateVps} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">VPS Name</label>
                <input
                  type="text"
                  value={vpsForm.name}
                  onChange={(e) => setVpsForm({ ...vpsForm, name: e.target.value })}
                  placeholder={`VPS-${selectedAccountForVps.account_number}`}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">IP Address</label>
                  <input
                    type="text"
                    value={vpsForm.ip_address}
                    onChange={(e) => setVpsForm({ ...vpsForm, ip_address: e.target.value })}
                    placeholder="192.168.1.100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Port</label>
                  <input
                    type="text"
                    value={vpsForm.ssh_port}
                    onChange={(e) => setVpsForm({ ...vpsForm, ssh_port: e.target.value })}
                    placeholder="22"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Username</label>
                  <input
                    type="text"
                    value={vpsForm.ssh_username}
                    onChange={(e) => setVpsForm({ ...vpsForm, ssh_username: e.target.value })}
                    placeholder="Administrator"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">SSH Password</label>
                  <input
                    type="password"
                    value={vpsForm.ssh_password}
                    onChange={(e) => setVpsForm({ ...vpsForm, ssh_password: e.target.value })}
                    placeholder="********"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">OS Type</label>
                <select
                  value={vpsForm.os_type}
                  onChange={(e) => setVpsForm({ ...vpsForm, os_type: e.target.value })}
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
                  value={vpsForm.mt5_path}
                  onChange={(e) => setVpsForm({ ...vpsForm, mt5_path: e.target.value })}
                  placeholder="C:\Program Files\MetaTrader 5\terminal64.exe"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">EA Path</label>
                <input
                  type="text"
                  value={vpsForm.ea_path}
                  onChange={(e) => setVpsForm({ ...vpsForm, ea_path: e.target.value })}
                  placeholder="C:\Program Files\MetaTrader 5\MQL5\Experts\"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Notes</label>
                <textarea
                  value={vpsForm.notes}
                  onChange={(e) => setVpsForm({ ...vpsForm, notes: e.target.value })}
                  placeholder="Any additional notes about this VPS setup..."
                  rows={2}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                />
              </div>
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-3 text-sm text-blue-700">
                <strong>Note:</strong> VPS details can be added later. You can create a placeholder entry now and update it when the VPS is provisioned.
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => { setShowVpsSetup(false); setSelectedAccountForVps(null); }}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Creating...' : 'Create VPS Entry'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Login Modal */}
      {showLoginForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[#1a1a1d] mb-4">Login to MT5 Account</h3>
            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
                <input
                  type="text"
                  value={loginForm.account}
                  onChange={(e) => setLoginForm({ ...loginForm, account: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Password</label>
                <input
                  type="password"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Server</label>
                <input
                  type="text"
                  value={loginForm.server}
                  onChange={(e) => setLoginForm({ ...loginForm, server: e.target.value })}
                  placeholder="e.g., MetaQuotes-Demo"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowLoginForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-[#c9a227] hover:bg-[#b8922a] text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  {actionLoading ? 'Connecting...' : 'Login'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Trade Modal */}
      {showTradeForm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-md mx-4">
            <h3 className="text-lg font-semibold text-[#1a1a1d] mb-4">Open New Trade</h3>
            <form onSubmit={handleTrade} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Symbol</label>
                <input
                  type="text"
                  value={tradeForm.symbol}
                  onChange={(e) => setTradeForm({ ...tradeForm, symbol: e.target.value.toUpperCase() })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                <select
                  value={tradeForm.type}
                  onChange={(e) => setTradeForm({ ...tradeForm, type: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                >
                  <option value="buy">BUY</option>
                  <option value="sell">SELL</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Volume (Lots)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0.01"
                  value={tradeForm.volume}
                  onChange={(e) => setTradeForm({ ...tradeForm, volume: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  required
                />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Stop Loss</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tradeForm.sl}
                    onChange={(e) => setTradeForm({ ...tradeForm, sl: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Take Profit</label>
                  <input
                    type="number"
                    step="0.00001"
                    value={tradeForm.tp}
                    onChange={(e) => setTradeForm({ ...tradeForm, tp: e.target.value })}
                    placeholder="Optional"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
                  />
                </div>
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowTradeForm(false)}
                  className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={actionLoading}
                  className={`flex-1 px-4 py-2 text-white rounded-lg transition-colors disabled:opacity-50 ${
                    tradeForm.type === 'buy' ? 'bg-green-600 hover:bg-green-700' : 'bg-red-600 hover:bg-red-700'
                  }`}
                >
                  {actionLoading ? 'Placing...' : `${tradeForm.type.toUpperCase()} ${tradeForm.volume} Lots`}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
