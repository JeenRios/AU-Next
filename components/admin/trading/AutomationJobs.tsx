'use client';

import { useState, useEffect } from 'react';

interface AutomationJob {
  id: number;
  mt5_account_id: number;
  vps_instance_id: number | null;
  job_type: string;
  status: string;
  progress: number;
  message: string | null;
  error_message: string | null;
  started_at: string | null;
  completed_at: string | null;
  created_at: string;
  retry_count: number;
  max_retries: number;
  metadata: any;
  account_number: string;
  mt5_server: string;
  user_id: number;
  vps_name: string | null;
  vps_ip: string | null;
  created_by_email: string;
}

interface AutomationJobsProps {
  mt5AccountId?: number;
  onError?: (message: string) => void;
  onSuccess?: (message: string) => void;
}

const JOB_TYPE_LABELS: Record<string, string> = {
  ea_deploy: 'EA Deployment',
  ea_configure: 'EA Configuration',
  ea_start: 'EA Start',
  ea_stop: 'EA Stop',
  status_check: 'Status Check',
  vps_health_check: 'VPS Health Check'
};

const STATUS_COLORS: Record<string, string> = {
  pending: 'bg-yellow-100 text-yellow-700',
  running: 'bg-blue-100 text-blue-700',
  completed: 'bg-green-100 text-green-700',
  failed: 'bg-red-100 text-red-700',
  cancelled: 'bg-gray-100 text-gray-700'
};

export default function AutomationJobs({ mt5AccountId, onError, onSuccess }: AutomationJobsProps) {
  const [jobs, setJobs] = useState<AutomationJob[]>([]);
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [jobTypeFilter, setJobTypeFilter] = useState<string>('all');
  const [selectedJob, setSelectedJob] = useState<AutomationJob | null>(null);

  useEffect(() => {
    fetchJobs();
    // Auto-refresh running jobs every 5 seconds
    const interval = setInterval(() => {
      if (jobs.some(j => j.status === 'running' || j.status === 'pending')) {
        fetchJobs();
      }
    }, 5000);
    return () => clearInterval(interval);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [statusFilter, jobTypeFilter, mt5AccountId]);

  const fetchJobs = async () => {
    try {
      let url = '/api/automation/jobs?limit=100';
      if (mt5AccountId) url += `&mt5_account_id=${mt5AccountId}`;
      if (statusFilter !== 'all') url += `&status=${statusFilter}`;
      if (jobTypeFilter !== 'all') url += `&job_type=${jobTypeFilter}`;

      const res = await fetch(url);
      const data = await res.json();
      if (data.success) {
        setJobs(data.data);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleRetry = async (job: AutomationJob) => {
    if (job.retry_count >= job.max_retries) {
      onError?.('Maximum retries exceeded');
      return;
    }

    setActionLoading(true);
    try {
      // Reset the job to pending
      const res = await fetch('/api/automation/jobs', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          id: job.id,
          status: 'pending',
          progress: 0,
          error_message: null,
          message: `Retry attempt ${job.retry_count + 1}`
        })
      });
      const data = await res.json();
      if (data.success) {
        onSuccess?.('Job queued for retry');
        fetchJobs();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const handleCancel = async (jobId: number) => {
    if (!confirm('Cancel this job?')) return;

    setActionLoading(true);
    try {
      const res = await fetch(`/api/automation/jobs?id=${jobId}`, { method: 'DELETE' });
      const data = await res.json();
      if (data.success) {
        onSuccess?.('Job cancelled');
        fetchJobs();
      } else {
        onError?.(data.error);
      }
    } catch (err: any) {
      onError?.(err.message);
    } finally {
      setActionLoading(false);
    }
  };

  const formatDuration = (start: string | null, end: string | null) => {
    if (!start) return '-';
    const startTime = new Date(start).getTime();
    const endTime = end ? new Date(end).getTime() : Date.now();
    const duration = Math.floor((endTime - startTime) / 1000);

    if (duration < 60) return `${duration}s`;
    if (duration < 3600) return `${Math.floor(duration / 60)}m ${duration % 60}s`;
    return `${Math.floor(duration / 3600)}h ${Math.floor((duration % 3600) / 60)}m`;
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
          <h3 className="text-lg font-semibold text-[#1a1a1d]">Automation Jobs</h3>
          <p className="text-sm text-gray-500 mt-1">Track and manage automation tasks</p>
        </div>
        <div className="flex gap-2">
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
          >
            <option value="all">All Status</option>
            <option value="pending">Pending</option>
            <option value="running">Running</option>
            <option value="completed">Completed</option>
            <option value="failed">Failed</option>
            <option value="cancelled">Cancelled</option>
          </select>
          <select
            value={jobTypeFilter}
            onChange={(e) => setJobTypeFilter(e.target.value)}
            className="px-3 py-1.5 text-sm border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#c9a227] focus:border-transparent"
          >
            <option value="all">All Types</option>
            <option value="ea_deploy">EA Deployment</option>
            <option value="ea_configure">EA Configuration</option>
            <option value="ea_start">EA Start</option>
            <option value="ea_stop">EA Stop</option>
            <option value="status_check">Status Check</option>
            <option value="vps_health_check">VPS Health Check</option>
          </select>
          <button
            onClick={fetchJobs}
            className="px-3 py-1.5 text-sm bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors"
          >
            Refresh
          </button>
        </div>
      </div>

      {/* Stats Summary */}
      <div className="grid grid-cols-5 gap-4">
        {['pending', 'running', 'completed', 'failed', 'cancelled'].map((status) => {
          const count = jobs.filter(j => j.status === status).length;
          return (
            <div
              key={status}
              onClick={() => setStatusFilter(status === statusFilter ? 'all' : status)}
              className={`bg-white rounded-lg border p-4 cursor-pointer transition-all hover:shadow-md ${
                statusFilter === status ? 'border-[#c9a227] ring-2 ring-[#c9a227]/20' : 'border-gray-200'
              }`}
            >
              <p className="text-2xl font-bold text-[#1a1a1d]">{count}</p>
              <p className="text-sm text-gray-500 capitalize">{status}</p>
            </div>
          );
        })}
      </div>

      {/* Jobs List */}
      {jobs.length === 0 ? (
        <div className="text-center py-12 bg-gray-50 rounded-xl border border-gray-200">
          <svg className="w-12 h-12 text-gray-300 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
          </svg>
          <p className="text-gray-500">No automation jobs found</p>
        </div>
      ) : (
        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b border-gray-200 bg-gray-50">
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Job Type</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Account</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">VPS</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Progress</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Duration</th>
                  <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Created</th>
                  <th className="text-center py-3 px-4 text-sm font-medium text-gray-500">Actions</th>
                </tr>
              </thead>
              <tbody>
                {jobs.map((job) => (
                  <tr key={job.id} className="border-b border-gray-100 hover:bg-gray-50">
                    <td className="py-3 px-4">
                      <span className="font-medium text-[#1a1a1d]">{JOB_TYPE_LABELS[job.job_type] || job.job_type}</span>
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {job.account_number}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {job.vps_name || '-'}
                    </td>
                    <td className="py-3 px-4">
                      <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[job.status] || 'bg-gray-100'}`}>
                        {job.status.toUpperCase()}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      {job.status === 'running' || job.status === 'pending' ? (
                        <div className="w-24">
                          <div className="flex items-center gap-2">
                            <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                              <div
                                className="h-full bg-[#c9a227] rounded-full transition-all"
                                style={{ width: `${job.progress}%` }}
                              />
                            </div>
                            <span className="text-xs text-gray-500">{job.progress}%</span>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-gray-500">{job.progress}%</span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {formatDuration(job.started_at, job.completed_at)}
                    </td>
                    <td className="py-3 px-4 text-sm text-gray-600">
                      {new Date(job.created_at).toLocaleString()}
                    </td>
                    <td className="py-3 px-4 text-center">
                      <div className="flex items-center justify-center gap-2">
                        <button
                          onClick={() => setSelectedJob(job)}
                          className="text-[#c9a227] hover:text-[#b8922a] text-sm"
                        >
                          Details
                        </button>
                        {job.status === 'failed' && job.retry_count < job.max_retries && (
                          <button
                            onClick={() => handleRetry(job)}
                            disabled={actionLoading}
                            className="text-blue-600 hover:text-blue-800 text-sm disabled:opacity-50"
                          >
                            Retry
                          </button>
                        )}
                        {(job.status === 'pending' || job.status === 'running') && (
                          <button
                            onClick={() => handleCancel(job.id)}
                            disabled={actionLoading}
                            className="text-red-600 hover:text-red-800 text-sm disabled:opacity-50"
                          >
                            Cancel
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Job Details Modal */}
      {selectedJob && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-6 w-full max-w-lg mx-4 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-[#1a1a1d]">Job Details</h3>
              <button
                onClick={() => setSelectedJob(null)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="text-xs text-gray-500">Job ID</label>
                  <p className="font-medium">#{selectedJob.id}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Type</label>
                  <p className="font-medium">{JOB_TYPE_LABELS[selectedJob.job_type] || selectedJob.job_type}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Status</label>
                  <p>
                    <span className={`px-2 py-1 text-xs font-medium rounded-full ${STATUS_COLORS[selectedJob.status]}`}>
                      {selectedJob.status.toUpperCase()}
                    </span>
                  </p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Progress</label>
                  <p className="font-medium">{selectedJob.progress}%</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">MT5 Account</label>
                  <p className="font-medium">{selectedJob.account_number}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">VPS</label>
                  <p className="font-medium">{selectedJob.vps_name || 'N/A'}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Retries</label>
                  <p className="font-medium">{selectedJob.retry_count} / {selectedJob.max_retries}</p>
                </div>
                <div>
                  <label className="text-xs text-gray-500">Created By</label>
                  <p className="font-medium">{selectedJob.created_by_email}</p>
                </div>
              </div>

              <div className="border-t border-gray-200 pt-4">
                <label className="text-xs text-gray-500">Timeline</label>
                <div className="mt-2 space-y-2">
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Created:</span>
                    <span>{new Date(selectedJob.created_at).toLocaleString()}</span>
                  </div>
                  {selectedJob.started_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Started:</span>
                      <span>{new Date(selectedJob.started_at).toLocaleString()}</span>
                    </div>
                  )}
                  {selectedJob.completed_at && (
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Completed:</span>
                      <span>{new Date(selectedJob.completed_at).toLocaleString()}</span>
                    </div>
                  )}
                  <div className="flex justify-between text-sm">
                    <span className="text-gray-500">Duration:</span>
                    <span className="font-medium">{formatDuration(selectedJob.started_at, selectedJob.completed_at)}</span>
                  </div>
                </div>
              </div>

              {selectedJob.message && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-xs text-gray-500">Message</label>
                  <p className="mt-1 text-sm bg-gray-50 rounded-lg p-3">{selectedJob.message}</p>
                </div>
              )}

              {selectedJob.error_message && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-xs text-gray-500">Error</label>
                  <p className="mt-1 text-sm bg-red-50 text-red-700 rounded-lg p-3">{selectedJob.error_message}</p>
                </div>
              )}

              {selectedJob.metadata && Object.keys(selectedJob.metadata).length > 0 && (
                <div className="border-t border-gray-200 pt-4">
                  <label className="text-xs text-gray-500">Metadata</label>
                  <pre className="mt-1 text-xs bg-gray-50 rounded-lg p-3 overflow-x-auto">
                    {JSON.stringify(selectedJob.metadata, null, 2)}
                  </pre>
                </div>
              )}
            </div>

            <div className="flex gap-3 mt-6 pt-4 border-t border-gray-200">
              {selectedJob.status === 'failed' && selectedJob.retry_count < selectedJob.max_retries && (
                <button
                  onClick={() => { handleRetry(selectedJob); setSelectedJob(null); }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Retry Job
                </button>
              )}
              {(selectedJob.status === 'pending' || selectedJob.status === 'running') && (
                <button
                  onClick={() => { handleCancel(selectedJob.id); setSelectedJob(null); }}
                  disabled={actionLoading}
                  className="flex-1 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-lg transition-colors disabled:opacity-50"
                >
                  Cancel Job
                </button>
              )}
              <button
                onClick={() => setSelectedJob(null)}
                className="flex-1 px-4 py-2 bg-gray-200 hover:bg-gray-300 rounded-lg transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
