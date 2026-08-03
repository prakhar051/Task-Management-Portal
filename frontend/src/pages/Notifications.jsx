import React, { useState, useEffect } from 'react';
import { useNotificationStore } from '../store/notificationStore';
import NotificationCard from '../components/notifications/NotificationCard';

export default function Notifications() {
  const notifications = useNotificationStore((state) => state.notifications);
  const unreadCount = useNotificationStore((state) => state.unreadCount);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const fetchUnreadCount = useNotificationStore((state) => state.fetchUnreadCount);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const deleteBulkNotifications = useNotificationStore((state) => state.deleteBulkNotifications);
  
  const preferences = useNotificationStore((state) => state.preferences);
  const fetchPreferences = useNotificationStore((state) => state.fetchPreferences);
  const updatePreferences = useNotificationStore((state) => state.updatePreferences);

  const filters = useNotificationStore((state) => state.filters);
  const setFilters = useNotificationStore((state) => state.setFilters);
  const resetFilters = useNotificationStore((state) => state.resetFilters);

  const pagination = useNotificationStore((state) => state.pagination);
  const setPage = useNotificationStore((state) => state.setPage);
  const exportNotificationsCSV = useNotificationStore((state) => state.exportNotificationsCSV);
  const isLoading = useNotificationStore((state) => state.isLoading);

  const [selectedIds, setSelectedIds] = useState([]);
  const [showPrefs, setShowPrefs] = useState(false);

  useEffect(() => {
    fetchNotifications();
    fetchUnreadCount();
    fetchPreferences();
  }, [fetchNotifications, fetchUnreadCount, fetchPreferences]);

  const handleSelectToggle = (id) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((item) => item !== id) : [...prev, id]
    );
  };

  const handleSelectAll = () => {
    if (selectedIds.length === notifications.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(notifications.map((n) => n.id));
    }
  };

  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) return;
    if (window.confirm(`Delete ${selectedIds.length} notifications?`)) {
      await deleteBulkNotifications(selectedIds);
      setSelectedIds([]);
    }
  };

  const handlePreferenceChange = async (key, val) => {
    try {
      await updatePreferences({ [key]: val });
    } catch (err) {
      alert('Failed to update preference settings.');
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
            <span className="text-white font-mono">Notifications</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Notification Feed</h1>
        </div>

        <div className="flex items-center space-x-2.5">
          <button
            onClick={() => setShowPrefs(!showPrefs)}
            className="px-4 py-2 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            ⚙️ Preferences Settings
          </button>
          {unreadCount > 0 && (
            <button
              onClick={() => markAllAsRead()}
              className="px-4 py-2 bg-brand-500/10 hover:bg-brand-500/20 border border-brand-500/20 hover:border-brand-500/40 text-brand-400 rounded-xl text-xs font-bold transition-all"
            >
              👁️ Mark All Read
            </button>
          )}
          <button
            onClick={() => exportNotificationsCSV()}
            className="px-4 py-2 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            📥 Export CSV
          </button>
        </div>
      </div>

      {/* Preferences overlay panel */}
      {showPrefs && preferences && (
        <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-6 space-y-4 animate-fade-in select-none">
          <h3 className="text-sm font-bold text-white border-b border-slateDark-900 pb-2">
            Notification Subscription Settings
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs text-slateDark-300">
            <div className="space-y-3">
              <h4 className="font-bold text-slateDark-400 uppercase tracking-wider">Channels</h4>
              <label className="flex items-center space-x-3 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={preferences.inApp}
                  onChange={(e) => handlePreferenceChange('inApp', e.target.checked)}
                  className="w-4 h-4 accent-brand-500 bg-slateDark-950 rounded border-slateDark-800"
                />
                <span>Enable In-App Notification Bell alerts</span>
              </label>
              <label className="flex items-center space-x-3 cursor-pointer hover:text-white">
                <input
                  type="checkbox"
                  checked={preferences.email}
                  onChange={(e) => handlePreferenceChange('email', e.target.checked)}
                  className="w-4 h-4 accent-brand-500 bg-slateDark-950 rounded border-slateDark-800"
                />
                <span>Enable email summary digests</span>
              </label>
            </div>

            <div className="space-y-3">
              <h4 className="font-bold text-slateDark-400 uppercase tracking-wider">Trigger Events</h4>
              {[
                { label: 'Task Assignments', key: 'taskAssigned' },
                { label: 'Task Modifications', key: 'taskUpdated' },
                { label: 'Task Completions', key: 'taskCompleted' },
                { label: 'Project Creations', key: 'projectCreated' },
                { label: 'Project Assignments/Updates', key: 'projectUpdated' },
                { label: 'New Comments', key: 'commentAdded' },
                { label: 'New File Uploads', key: 'attachmentAdded' }
              ].map((p) => (
                <label key={p.key} className="flex items-center space-x-3 cursor-pointer hover:text-white">
                  <input
                    type="checkbox"
                    checked={preferences[p.key]}
                    onChange={(e) => handlePreferenceChange(p.key, e.target.checked)}
                    className="w-4 h-4 accent-brand-500 bg-slateDark-950 rounded border-slateDark-800"
                  />
                  <span>{p.label}</span>
                </label>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Toolbar Search / Filters */}
      <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-4 flex flex-col md:flex-row gap-4 items-center justify-between select-none">
        <div className="flex flex-wrap gap-3 items-center w-full md:w-auto">
          {/* Read/Unread filters */}
          <select
            value={filters.isRead}
            onChange={(e) => setFilters({ isRead: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">👁️ All Statuses</option>
            <option value="false">📩 Unread Only</option>
            <option value="true">📖 Read Only</option>
          </select>

          {/* Priority filter */}
          <select
            value={filters.priority}
            onChange={(e) => setFilters({ priority: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">⚡ All Priorities</option>
            <option value="LOW">LOW</option>
            <option value="MEDIUM">MEDIUM</option>
            <option value="HIGH">HIGH</option>
            <option value="URGENT">URGENT</option>
          </select>

          {/* Type filter */}
          <select
            value={filters.type}
            onChange={(e) => setFilters({ type: e.target.value })}
            className="px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
          >
            <option value="">🔔 All Types</option>
            <option value="TASK_ASSIGNED">TASK_ASSIGNED</option>
            <option value="TASK_UPDATED">TASK_UPDATED</option>
            <option value="TASK_COMPLETED">TASK_COMPLETED</option>
            <option value="PROJECT_CREATED">PROJECT_CREATED</option>
            <option value="PROJECT_UPDATED">PROJECT_UPDATED</option>
            <option value="COMMENT_ADDED">COMMENT_ADDED</option>
            <option value="ATTACHMENT_ADDED">ATTACHMENT_ADDED</option>
          </select>

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
        <div className="w-full md:w-64 relative">
          <input
            type="text"
            placeholder="Search notifications..."
            value={filters.search}
            onChange={(e) => setFilters({ search: e.target.value })}
            className="w-full pl-9 pr-4 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs focus:outline-none"
          />
          <span className="absolute left-3.5 top-2.5 text-xs select-none text-slateDark-500">🔍</span>
        </div>
      </div>

      {/* Bulk actions toolbar */}
      {selectedIds.length > 0 && (
        <div className="p-3 bg-brand-500/10 border border-brand-500/25 rounded-xl flex items-center justify-between text-xs select-none">
          <span className="text-white font-bold">
            {selectedIds.length} notifications selected
          </span>
          <button
            onClick={handleBulkDelete}
            className="px-3.5 py-1.5 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 text-red-400 text-[11px] font-bold rounded-lg transition-colors"
          >
            🗑️ Delete Selected
          </button>
        </div>
      )}

      {/* Main notifications feed list */}
      <div className="space-y-3">
        {notifications.map((item) => (
          <div key={item.id} className="flex items-center space-x-3.5">
            <input
              type="checkbox"
              checked={selectedIds.includes(item.id)}
              onChange={() => handleSelectToggle(item.id)}
              className="w-4 h-4 accent-brand-500 bg-slateDark-950 rounded border-slateDark-800 select-none flex-shrink-0 cursor-pointer"
            />
            <div className="flex-1">
              <NotificationCard notification={item} />
            </div>
          </div>
        ))}

        {notifications.length === 0 && !isLoading && (
          <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-12 text-center select-none text-slateDark-500 max-w-sm mx-auto">
            <span className="text-4xl block mb-2">📬</span>
            <h3 className="font-bold text-white mb-1">No notifications found</h3>
            <p className="text-xs text-slateDark-500">Adjust filters or search parameters</p>
          </div>
        )}

        {isLoading && (
          <div className="min-h-[20vh] flex items-center justify-center text-xs animate-pulse text-slateDark-500 font-bold">
            Refreshing notifications...
          </div>
        )}
      </div>

      {/* Pagination control footer */}
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
  );
}
