import React from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';

export default function NotificationCard({ notification, onRead }) {
  const markAsRead = useNotificationStore((state) => state.markAsRead);
  const deleteNotification = useNotificationStore((state) => state.deleteNotification);

  const getPriorityBadgeColor = (prio) => {
    switch (prio) {
      case 'URGENT':
        return 'bg-red-500/10 text-red-400 border-red-500/20';
      case 'HIGH':
        return 'bg-amber-500/10 text-amber-400 border-amber-500/20';
      case 'MEDIUM':
        return 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20';
      default:
        return 'bg-slateDark-800 text-slateDark-400 border-slateDark-700/60';
    }
  };

  const getNotificationIcon = (type) => {
    switch (type) {
      case 'TASK_ASSIGNED':
        return '📋';
      case 'TASK_UPDATED':
        return '⚡';
      case 'TASK_COMPLETED':
        return '✅';
      case 'PROJECT_CREATED':
        return '📂';
      case 'PROJECT_UPDATED':
        return '⚙️';
      case 'COMMENT_ADDED':
        return '💬';
      case 'ATTACHMENT_ADDED':
        return '📎';
      default:
        return '🔔';
    }
  };

  const handleRead = async (e) => {
    e.preventDefault();
    if (!notification.isRead) {
      await markAsRead(notification.id);
    }
    if (onRead) onRead();
  };

  const handleDelete = async (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (window.confirm('Delete this notification?')) {
      await deleteNotification(notification.id);
    }
  };

  return (
    <div
      className={`p-4 border rounded-xl flex items-start space-x-3.5 transition-all select-none hover:bg-slateDark-900/30 ${
        notification.isRead
          ? 'bg-slateDark-950/10 border-slateDark-900/60 opacity-70'
          : 'bg-slateDark-900/15 border-brand-500/15 hover:border-brand-500/25'
      }`}
    >
      {/* Type Icon indicator */}
      <div
        onClick={handleRead}
        className={`w-9 h-9 rounded-full flex items-center justify-center text-sm flex-shrink-0 cursor-pointer ${
          notification.isRead
            ? 'bg-slateDark-900 text-slateDark-400 border border-slateDark-800'
            : 'bg-brand-500/10 text-brand-400 border border-brand-500/20'
        }`}
      >
        {getNotificationIcon(notification.type)}
      </div>

      {/* Title / Description */}
      <div className="flex-1 space-y-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className={`text-[9px] font-bold px-2 py-0.5 rounded border ${getPriorityBadgeColor(notification.priority)}`}>
            {notification.priority}
          </span>
          <span className="text-[10px] text-slateDark-500 font-mono">
            {new Date(notification.createdAt).toLocaleDateString()}
          </span>
        </div>

        {notification.actionUrl ? (
          <Link
            to={notification.actionUrl}
            onClick={handleRead}
            className="block text-xs font-bold text-white hover:text-brand-400 transition-colors truncate"
          >
            {notification.title}
          </Link>
        ) : (
          <h4 className="text-xs font-bold text-white truncate">{notification.title}</h4>
        )}

        <p className="text-slateDark-400 text-xs leading-normal line-clamp-2">
          {notification.message}
        </p>
      </div>

      {/* Action buttons */}
      <div className="flex items-center space-x-1 flex-shrink-0">
        {!notification.isRead && (
          <button
            onClick={handleRead}
            title="Mark read"
            className="w-7 h-7 flex items-center justify-center bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-400 hover:text-white rounded-lg text-xs transition-colors"
          >
            👁️
          </button>
        )}
        <button
          onClick={handleDelete}
          title="Delete notification"
          className="w-7 h-7 flex items-center justify-center bg-red-500/5 hover:bg-red-500/10 border border-red-500/10 hover:border-red-500/30 text-red-400 hover:text-red-300 rounded-lg text-xs transition-colors"
        >
          🗑️
        </button>
      </div>
    </div>
  );
}
