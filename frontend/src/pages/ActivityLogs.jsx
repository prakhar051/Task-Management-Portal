import React, { useState, useEffect } from 'react';
import { useActivityStore } from '../store/activityStore';
import { useAuthStore } from '../store/authStore';
import { apiClient } from '../api/apiClient';

export default function ActivityLogs() {
  const activities = useActivityStore((state) => state.activities);
  const fetchActivities = useActivityStore((state) => state.fetchActivities);
  const filters = useActivityStore((state) => state.filters);
  const setFilters = useActivityStore((state) => state.setFilters);
  const resetFilters = useActivityStore((state) => state.resetFilters);
  const pagination = useActivityStore((state) => state.pagination);
  const setPage = useActivityStore((state) => state.setPage);
  const exportActivityCSV = useActivityStore((state) => state.exportActivityCSV);
  const isLoading = useActivityStore((state) => state.isLoading);
  
  const user = useAuthStore((state) => state.user);

  const [employees, setEmployees] = useState([]);
  const [selectedLog, setSelectedLog] = useState(null);

  useEffect(() => {
    fetchActivities();
    // Load lookup employees for filter selections (for ADMIN or MANAGER roles)
    const loadEmployees = async () => {
      if (user?.role === 'ADMIN' || user?.role === 'MANAGER') {
        try {
          const response = await apiClient.get('/employees?limit=100');
          if (response.data.success) {
            setEmployees(response.data.data || []);
          }
        } catch (err) {
          console.error('Failed to load employee lookups', err);
        }
      }
    };
    loadEmployees();
  }, [fetchActivities, user]);

  const getActionBadgeColor = (action) => {
    switch (action) {
      case 'CREATE':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/25';
      case 'DELETE':
        return 'bg-red-500/10 text-red-400 border-red-500/25';
      case 'UPDATE':
      case 'STATUS_CHANGE':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/25';
      case 'LOGIN':
      case 'LOGOUT':
        return 'bg-blue-500/10 text-blue-400 border-blue-500/25';
      default:
        return 'bg-slateDark-800 text-slateDark-400 border-slateDark-700/60';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Activity Logs</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Audit Trails</h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => exportActivityCSV()}
            className="px-4 py-2 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Filters toolbar */}
      <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-4 flex flex-col gap-4 select-none">
        <div className="flex flex-wrap gap-3 items-center">
          {/* Action Filter */}
          <select
            value={filters.action}
            onChange={(e) => setFilters({ action: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">⚙️ All Actions</option>
            <option value="CREATE">CREATE</option>
            <option value="UPDATE">UPDATE</option>
            <option value="DELETE">DELETE</option>
            <option value="RESTORE">RESTORE</option>
            <option value="ASSIGN">ASSIGN</option>
            <option value="UNASSIGN">UNASSIGN</option>
            <option value="LOGIN">LOGIN</option>
            <option value="LOGOUT">LOGOUT</option>
            <option value="STATUS_CHANGE">STATUS_CHANGE</option>
            <option value="COMMENT">COMMENT</option>
            <option value="UPLOAD">UPLOAD</option>
            <option value="EXPORT">EXPORT</option>
          </select>

          {/* Entity type filter */}
          <select
            value={filters.entityType}
            onChange={(e) => setFilters({ entityType: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">📁 All Entities</option>
            <option value="EMPLOYEE">EMPLOYEE</option>
            <option value="DEPARTMENT">DEPARTMENT</option>
            <option value="PROJECT">PROJECT</option>
            <option value="TASK">TASK</option>
            <option value="USER">USER</option>
          </select>

          {/* User selector filter (ADMIN or MANAGER only) */}
          {(user?.role === 'ADMIN' || user?.role === 'MANAGER') && (
            <select
              value={filters.userId}
              onChange={(e) => setFilters({ userId: e.target.value })}
              className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer max-w-xs"
            >
              <option value="">👤 All Employees</option>
              {employees.map((emp) => (
                <option key={emp.id} value={emp.userId}>
                  {emp.firstName} {emp.lastName}
                </option>
              ))}
            </select>
          )}

          {/* Date Picker inputs */}
          <div className="flex items-center space-x-2">
            <input
              type="date"
              value={filters.startDate}
              onChange={(e) => setFilters({ startDate: e.target.value })}
              className="px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 text-white rounded-xl text-xs focus:outline-none"
            />
            <span className="text-slateDark-500 text-xs">to</span>
            <input
              type="date"
              value={filters.endDate}
              onChange={(e) => setFilters({ endDate: e.target.value })}
              className="px-3 py-1.5 bg-slateDark-900 border border-slateDark-800 text-white rounded-xl text-xs focus:outline-none"
            />
          </div>

          {Object.values(filters).some((v) => v !== '') && (
            <button
              onClick={() => resetFilters()}
              className="text-[10px] text-red-400 hover:text-white font-bold transition-colors"
            >
              Clear filters
            </button>
          )}
        </div>

        {/* Search */}
        <div className="relative w-full">
          <input
            type="text"
            placeholder="Search by user email, entity UUID, or description details..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs focus:outline-none"
          />
          <span className="absolute left-3.5 top-2.5 text-xs text-slateDark-500 select-none">🔍</span>
        </div>
      </div>

      {/* Main Grid display: timeline list, detail metadata card */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Logs Timeline List */}
        <div className="lg:col-span-2 space-y-4">
          <div className="space-y-3.5">
            {activities.map((log) => (
              <div
                key={log.id}
                onClick={() => setSelectedLog(log)}
                className={`p-4 border rounded-2xl cursor-pointer transition-all flex items-start space-x-4 ${
                  selectedLog?.id === log.id
                    ? 'bg-slateDark-900 border-brand-500/40 shadow-lg shadow-brand-500/5'
                    : 'bg-slateDark-950/20 border-slateDark-900 hover:border-slateDark-800'
                }`}
              >
                <div className={`px-2.5 py-0.5 text-[9px] font-extrabold rounded-full border tracking-wide uppercase flex-shrink-0 mt-1 select-none ${getActionBadgeColor(log.action)}`}>
                  {log.action}
                </div>

                <div className="flex-1 space-y-1 min-w-0">
                  <div className="flex justify-between items-center select-none">
                    <span className="text-white text-xs font-bold font-mono">
                      {log.user?.name || 'System / Guest'}
                    </span>
                    <span className="text-[10px] font-mono text-slateDark-500">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-slateDark-300 text-xs leading-normal">
                    {log.description}
                  </p>
                  <div className="flex items-center space-x-3 text-[10px] text-slateDark-500 select-none font-mono">
                    <span>IP: {log.ipAddress}</span>
                    <span>•</span>
                    <span>Entity: {log.entityType}</span>
                  </div>
                </div>
              </div>
            ))}

            {activities.length === 0 && !isLoading && (
              <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-12 text-center select-none text-slateDark-500 max-w-sm mx-auto">
                <span className="text-4xl block mb-2">📜</span>
                <h3 className="font-bold text-white mb-1">No activities found</h3>
                <p className="text-xs text-slateDark-500">Adjust filters or search queries</p>
              </div>
            )}

            {isLoading && (
              <div className="min-h-[20vh] flex items-center justify-center text-xs animate-pulse text-slateDark-500 font-bold">
                Refreshing audit trail...
              </div>
            )}
          </div>

          {/* Pagination footer */}
          {pagination.pages > 1 && (
            <div className="flex justify-between items-center select-none pt-4 border-t border-slateDark-900">
              <span className="text-[11px] font-bold text-slateDark-500">
                Page {pagination.page} of {pagination.pages}
              </span>
              <div className="flex items-center space-x-2">
                <button
                  disabled={pagination.page <= 1}
                  onClick={() => setPage(pagination.page - 1)}
                  className="px-3.5 py-1.5 bg-slateDark-900 disabled:opacity-40 border border-slateDark-800 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Previous
                </button>
                <button
                  disabled={pagination.page >= pagination.pages}
                  onClick={() => setPage(pagination.page + 1)}
                  className="px-3.5 py-1.5 bg-slateDark-900 disabled:opacity-40 border border-slateDark-800 text-white rounded-lg text-xs font-bold transition-all"
                >
                  Next
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Detailed Metadata Card */}
        <div>
          {selectedLog ? (
            <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-5 space-y-4 sticky top-6 animate-fade-in select-none">
              <div className="border-b border-slateDark-900 pb-3">
                <h3 className="font-extrabold text-white text-sm">Metadata Diff Audit</h3>
                <span className="text-[10px] text-slateDark-500 font-mono">UUID: {selectedLog.id}</span>
              </div>

              <div className="space-y-3 text-xs">
                <div className="space-y-1">
                  <span className="text-slateDark-500 font-semibold block">Browser Agent</span>
                  <p className="text-white bg-slateDark-900/60 p-2.5 rounded-xl border border-slateDark-900 text-[10px] font-mono leading-relaxed break-words">
                    {selectedLog.userAgent}
                  </p>
                </div>

                <div className="space-y-1">
                  <span className="text-slateDark-500 font-semibold block">Audit JSON changes payload</span>
                  <pre className="text-brand-400 bg-slateDark-900/60 p-3 rounded-xl border border-slateDark-900 text-[10px] font-mono leading-relaxed overflow-x-auto max-h-72">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              </div>
            </div>
          ) : (
            <div className="bg-slateDark-950/10 border border-slateDark-900/40 border-dashed rounded-2xl p-8 text-center text-slateDark-500 text-xs italic sticky top-6 select-none">
              Select an activity from the timeline to view JSON metadata modifications payload
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
