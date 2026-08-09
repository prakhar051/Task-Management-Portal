import React from 'react';
import useSocketStore from '../../store/socketStore';
import { Lock } from 'lucide-react';

const EditingIndicator = ({ taskId }) => {
  const activeLock = useSocketStore((state) => state.activeLocks[taskId]);

  if (!activeLock) return null;

  return (
    <div className="flex items-center space-x-2 px-3 py-2 bg-amber-500/10 border border-amber-500/20 text-amber-400 rounded-lg text-xs font-semibold animate-pulse mb-4">
      <Lock className="w-3.5 h-3.5" />
      <span>Currently being edited by {activeLock.name}</span>
    </div>
  );
};

export default EditingIndicator;
