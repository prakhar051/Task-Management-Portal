import React from 'react';
import useSocketStore from '../../store/socketStore';

const TypingIndicator = ({ roomKey }) => {
  const typingUsers = useSocketStore((state) => state.typingUsers[roomKey]);

  if (!typingUsers || typingUsers.size === 0) return null;

  const names = Array.from(typingUsers);
  const text = names.length === 1
    ? `${names[0]} is typing...`
    : `${names.join(', ')} are typing...`;

  return (
    <div className="flex items-center space-x-1.5 text-xs text-zinc-400 italic py-1 animate-pulse">
      <span className="flex space-x-1">
        <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
        <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
        <span className="h-1.5 w-1.5 bg-zinc-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
      </span>
      <span>{text}</span>
    </div>
  );
};

export default TypingIndicator;
