import React from 'react';

export default function EventCard({ event }) {
  const handleDragStart = (e) => {
    e.dataTransfer.setData('text/plain', JSON.stringify({
      id: event.id,
      type: event.type
    }));
    e.dataTransfer.effectAllowed = 'move';
  };

  // Determine display styling color by event types
  const getBadgeColors = () => {
    switch (event.type) {
      case 'LEAVE':
        return 'bg-purple-500/10 border-purple-500/30 text-purple-400';
      case 'HOLIDAY':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'TASK':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'PROJECT':
        return 'bg-amber-500/10 border-amber-500/30 text-amber-400';
      case 'MEETING':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      default:
        return 'bg-yellow-500/10 border-yellow-500/30 text-yellow-400';
    }
  };

  const isDraggable = ['CUSTOM', 'MEETING', 'TASK', 'PROJECT'].includes(event.type);

  return (
    <div
      draggable={isDraggable}
      onDragStart={handleDragStart}
      className={`px-2 py-1 text-[9.5px] font-bold border rounded-lg shadow-sm truncate select-none transition-all ${getBadgeColors()} ${
        isDraggable ? 'cursor-grab active:cursor-grabbing hover:brightness-110' : 'cursor-default'
      }`}
      title={`${event.title}${event.description ? ` - ${event.description}` : ''}`}
    >
      <div className="flex items-center space-x-1 justify-between min-w-0">
        <span className="truncate flex-1">{event.title}</span>
        {event.code && (
          <span className="font-mono text-[7px] opacity-75 font-semibold bg-slateDark-950 px-1 py-0.5 rounded leading-none">
            {event.code}
          </span>
        )}
      </div>
    </div>
  );
}
