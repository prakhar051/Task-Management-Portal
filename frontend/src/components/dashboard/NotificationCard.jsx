import React from 'react';

export default function NotificationCard({ notifications }) {
  const getNotificationIcon = (type) => {
    switch (type) {
      case 'ASSIGNMENT': return '📋';
      case 'DEADLINE': return '⏰';
      case 'STATUS_UPDATE': return '🔄';
      default: return '🔔';
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-slateDark-800 flex flex-col h-96">
      <h3 className="font-bold text-sm text-slateDark-300 mb-6 tracking-wide">Notifications</h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {!notifications || notifications.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slateDark-500 text-sm">
            No notifications available.
          </div>
        ) : (
          notifications.map((not) => (
            <div
              key={not.id}
              className={`flex items-start space-x-3 p-3 rounded-lg border transition-all ${
                !not.read
                  ? 'bg-brand-500/5 border-brand-500/10 shadow-sm shadow-brand-500/5'
                  : 'border-transparent hover:bg-slateDark-900/30'
              }`}
            >
              <div className="w-8 h-8 rounded-lg bg-slateDark-900 border border-slateDark-850 flex items-center justify-center text-sm relative">
                {getNotificationIcon(not.type)}
                {!not.read && (
                  <span className="absolute -top-1 -right-1 w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-sm leading-normal text-slateDark-200 ${!not.read ? 'font-semibold text-white' : ''}`}>
                  {not.message}
                </p>
                <span className="text-[10px] text-slateDark-500 mt-1 block">
                  {new Date(not.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
