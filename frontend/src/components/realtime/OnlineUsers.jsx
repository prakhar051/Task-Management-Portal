import React from 'react';
import useSocketStore from '../../store/socketStore';

const OnlineUsers = () => {
  const onlineUsers = useSocketStore((state) => state.onlineUsers);

  return (
    <div className="flex items-center space-x-2">
      <span className="text-xs text-zinc-400 font-semibold mr-1">Active Team:</span>
      <div className="flex -space-x-2.5 overflow-hidden">
        {onlineUsers.map((u) => (
          <div
            key={u.userId}
            title={`${u.name} (Online)`}
            className="inline-block h-7 w-7 rounded-full ring-2 ring-zinc-950 bg-zinc-800 text-zinc-200 text-[10px] font-bold flex items-center justify-center border border-emerald-500/40 relative cursor-default"
          >
            {u.name.slice(0, 2).toUpperCase()}
            <span className="absolute bottom-0 right-0 block h-1.5 w-1.5 rounded-full bg-emerald-400 ring-1 ring-zinc-950" />
          </div>
        ))}
        {onlineUsers.length === 0 && (
          <span className="text-[10px] text-zinc-500 italic">No one online</span>
        )}
      </div>
    </div>
  );
};

export default OnlineUsers;
