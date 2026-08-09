import React, { useEffect, useState } from 'react';
import useSocketStore from '../../store/socketStore';
import { Bell, Info, ShieldAlert, X } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';

const RealtimeToast = () => {
  const lastEvent = useSocketStore((state) => state.lastReceivedEvent);
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!lastEvent) return;

    let title = 'System Update';
    let message = '';
    let icon = Info;
    let color = 'border-blue-500/30 text-blue-400 bg-blue-500/5';

    if (lastEvent.event === 'notification:new') {
      const n = lastEvent.payload.notification;
      title = n.title;
      message = n.message;
      if (n.priority === 'HIGH' || n.priority === 'URGENT') {
        icon = ShieldAlert;
        color = 'border-rose-500/30 text-rose-400 bg-rose-500/5';
      } else {
        icon = Bell;
        color = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5';
      }
    } else if (lastEvent.event === 'task:create') {
      title = 'Task Registered';
      message = `Task "${lastEvent.payload.task.title}" has been created.`;
      color = 'border-emerald-500/30 text-emerald-400 bg-emerald-500/5';
    } else if (lastEvent.event === 'task:status') {
      title = 'Status Transition';
      message = `Task ${lastEvent.payload.taskId} shifted status to ${lastEvent.payload.status}.`;
      color = 'border-amber-500/30 text-amber-400 bg-amber-500/5';
    } else {
      return; // Ignore general updates
    }

    setToast({ title, message, icon, color });

    const timer = setTimeout(() => {
      setToast(null);
    }, 4500);

    return () => clearTimeout(timer);
  }, [lastEvent]);

  if (!toast) return null;
  const Icon = toast.icon;

  return (
    <div className="fixed bottom-6 right-6 z-50 max-w-sm">
      <AnimatePresence>
        <motion.div
          initial={{ opacity: 0, y: 50, scale: 0.9 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          exit={{ opacity: 0, scale: 0.9, y: 20 }}
          className={`flex items-start space-x-3 p-4 border rounded-xl shadow-2xl backdrop-blur-md ${toast.color}`}
        >
          <Icon className="w-5 h-5 mt-0.5 shrink-0" />
          <div className="flex-1 space-y-1">
            <h4 className="text-xs font-bold uppercase tracking-wider">{toast.title}</h4>
            <p className="text-sm text-zinc-300 leading-relaxed">{toast.message}</p>
          </div>
          <button
            onClick={() => setToast(null)}
            className="p-1 rounded-lg text-zinc-500 hover:text-white transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </motion.div>
      </AnimatePresence>
    </div>
  );
};

export default RealtimeToast;
