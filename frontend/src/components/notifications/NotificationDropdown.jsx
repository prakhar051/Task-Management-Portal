import React, { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { useNotificationStore } from '../../store/notificationStore';
import NotificationCard from './NotificationCard';

export default function NotificationDropdown({ onClose }) {
  const notifications = useNotificationStore((state) => state.notifications);
  const fetchNotifications = useNotificationStore((state) => state.fetchNotifications);
  const markAllAsRead = useNotificationStore((state) => state.markAllAsRead);
  const isLoading = useNotificationStore((state) => state.isLoading);

  useEffect(() => {
    // Load top 5 notifications when dropdown opens
    fetchNotifications();
  }, [fetchNotifications]);

  const unreadItems = notifications.filter((n) => !n.isRead).slice(0, 5);
  const displayItems = notifications.slice(0, 5);

  return (
    <div className="absolute right-0 mt-3 w-80 sm:w-96 bg-slateDark-950 border border-slateDark-900 shadow-2xl rounded-2xl p-4 z-50 space-y-3.5 select-none animate-fade-in">
      <div className="flex items-center justify-between border-b border-slateDark-900 pb-2.5">
        <div className="flex items-center space-x-1.5">
          <h3 className="font-extrabold text-white text-sm">Notifications</h3>
          <span className="bg-brand-500/10 text-brand-400 text-[10px] font-bold px-2 py-0.5 rounded-full border border-brand-500/25">
            {unreadItems.length} New
          </span>
        </div>
        {unreadItems.length > 0 && (
          <button
            onClick={() => markAllAsRead()}
            className="text-[10px] text-brand-400 hover:text-white font-bold transition-colors"
          >
            Mark all read
          </button>
        )}
      </div>

      <div className="max-h-72 overflow-y-auto space-y-2">
        {displayItems.map((item) => (
          <NotificationCard key={item.id} notification={item} onRead={onClose} />
        ))}

        {displayItems.length === 0 && !isLoading && (
          <div className="p-8 text-center text-slateDark-500 text-xs italic">
            No active notification alerts
          </div>
        )}

        {isLoading && (
          <div className="p-4 text-center text-slateDark-400 text-xs animate-pulse font-bold">
            Refreshing feed...
          </div>
        )}
      </div>

      <div className="border-t border-slateDark-900 pt-2.5 flex justify-center">
        <Link
          to="/notifications"
          onClick={onClose}
          className="text-xs font-bold text-slateDark-400 hover:text-white hover:underline transition-colors"
        >
          View all notifications
        </Link>
      </div>
    </div>
  );
}
