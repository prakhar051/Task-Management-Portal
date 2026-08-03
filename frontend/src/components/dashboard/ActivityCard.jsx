import React from 'react';

export default function ActivityCard({ activities }) {
  const getActionIcon = (action) => {
    switch (action) {
      case 'PROJECT_CREATED': return '📁';
      case 'TASK_ASSIGNED': return '👤';
      case 'STATUS_UPDATED': return '🔄';
      case 'USER_REGISTERED': return '🎉';
      default: return '⚡';
    }
  };

  const getFormattedTime = (dateStr) => {
    try {
      const date = new Date(dateStr);
      return date.toLocaleTimeString(undefined, { hour: '2-digit', minute: '2-digit' });
    } catch (e) {
      return '';
    }
  };

  return (
    <div className="glass rounded-xl p-6 border border-slateDark-800 flex flex-col h-96">
      <h3 className="font-bold text-sm text-slateDark-300 mb-6 tracking-wide">Recent Activities</h3>
      <div className="flex-1 overflow-y-auto space-y-4 pr-1">
        {!activities || activities.length === 0 ? (
          <div className="h-full flex items-center justify-center text-slateDark-500 text-sm">
            No recent activity logged.
          </div>
        ) : (
          activities.map((act) => (
            <div key={act.id} className="flex items-start space-x-3 p-2 rounded-lg hover:bg-slateDark-900/30 transition-colors">
              <div className="w-8 h-8 rounded-full bg-slateDark-900 border border-slateDark-850 flex items-center justify-center text-sm">
                {getActionIcon(act.action)}
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-semibold text-white truncate">{act.details}</p>
                <div className="flex items-center space-x-2 mt-1">
                  <span className="text-[10px] text-slateDark-500 font-bold uppercase tracking-wider">{act.user}</span>
                  <span className="text-[10px] text-slateDark-600">•</span>
                  <span className="text-[10px] text-slateDark-500">{getFormattedTime(act.timestamp)}</span>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
