import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';

export default function LabelSelector({ task, onUpdate }) {
  const [availableLabels, setAvailableLabels] = useState([]);
  const [showPicker, setShowPicker] = useState(false);
  const [newColor, setNewColor] = useState('#3b82f6');
  const [newName, setNewName] = useState('');

  // Fetch all existing labels
  const loadLabels = async () => {
    try {
      // In early stage, we can query labels via a lookup endpoint, or directly.
      // Let's implement a quick API lookup to fetch tags or fall back to defaults.
      const response = await apiClient.get('/tasks'); // We can parse labels from loaded task rows
      // Fallback predefined tags
      const defaults = [
        { id: '1', name: 'Design', color: '#ec4899' },
        { id: '2', name: 'Frontend', color: '#3b82f6' },
        { id: '3', name: 'Backend', color: '#10b981' },
        { id: '4', name: 'DevOps', color: '#f59e0b' },
        { id: '5', name: 'QA', color: '#8b5cf6' }
      ];
      setAvailableLabels(defaults);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    loadLabels();
  }, []);

  const handleToggleLabel = async (label) => {
    // Modify task labels list
    const isLinked = task.labels?.some((l) => l.name === label.name);
    let updatedList;
    if (isLinked) {
      updatedList = task.labels.filter((l) => l.name !== label.name);
    } else {
      updatedList = [...(task.labels || []), label];
    }

    try {
      const labelNames = updatedList.map((l) => l.name);
      // Wait, let's patch the task directly
      await apiClient.patch(`/tasks/${task.id}`, { labels: labelNames });
      onUpdate();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update task labels.');
    }
  };

  return (
    <div className="space-y-3 font-semibold text-xs select-none">
      <div className="flex items-center justify-between border-b border-slateDark-900 pb-2">
        <span className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Labels</span>
        <button
          onClick={() => setShowPicker(!showPicker)}
          className="text-[10px] text-brand-400 hover:text-white font-bold transition-colors"
        >
          {showPicker ? 'Done' : '⚙️ Manage'}
        </button>
      </div>

      <div className="flex flex-wrap gap-1.5 min-h-[24px]">
        {task.labels?.map((label) => (
          <span
            key={label.id || label.name}
            style={{ backgroundColor: `${label.color}15`, color: label.color, borderColor: `${label.color}30` }}
            className="px-2.5 py-0.5 rounded-full border text-[10px] font-bold uppercase tracking-wide"
          >
            {label.name}
          </span>
        ))}
        {(!task.labels || task.labels.length === 0) && (
          <span className="text-slateDark-500 text-xs italic">No labels assigned</span>
        )}
      </div>

      {showPicker && (
        <div className="p-3 bg-slateDark-900/60 border border-slateDark-900 rounded-xl space-y-3 animate-fade-in">
          <div className="flex flex-wrap gap-1.5">
            {availableLabels.map((l) => {
              const isSelected = task.labels?.some((tl) => tl.name === l.name);
              return (
                <button
                  key={l.id}
                  onClick={() => handleToggleLabel(l)}
                  style={{
                    backgroundColor: isSelected ? l.color : 'transparent',
                    color: isSelected ? '#ffffff' : l.color,
                    borderColor: l.color
                  }}
                  className="px-2.5 py-0.5 rounded-full border text-[9px] font-extrabold uppercase tracking-wide transition-all"
                >
                  {isSelected ? '✓ ' : ''}
                  {l.name}
                </button>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
