import React from 'react';
import KanbanColumn from './KanbanColumn';
import { useTaskStore } from '../../store/taskStore';

export default function TaskKanban() {
  const tasks = useTaskStore((state) => state.tasks);

  // Group tasks by their current status column
  const todoTasks = tasks.filter((t) => t.status === 'TODO');
  const inProgressTasks = tasks.filter((t) => t.status === 'IN_PROGRESS');
  const inReviewTasks = tasks.filter((t) => t.status === 'IN_REVIEW');
  const blockedTasks = tasks.filter((t) => t.status === 'BLOCKED');
  const completedTasks = tasks.filter((t) => t.status === 'COMPLETED');

  return (
    <div className="grid grid-cols-1 md:grid-cols-5 gap-6 overflow-x-auto pb-4 select-none">
      <KanbanColumn
        title="Todo"
        status="TODO"
        icon="📝"
        tasks={todoTasks}
        color="bg-slateDark-900 border-slateDark-800 text-slateDark-400"
      />
      <KanbanColumn
        title="In Progress"
        status="IN_PROGRESS"
        icon="⚡"
        tasks={inProgressTasks}
        color="bg-brand-500/10 border-brand-500/20 text-brand-400"
      />
      <KanbanColumn
        title="In Review"
        status="IN_REVIEW"
        icon="🔬"
        tasks={inReviewTasks}
        color="bg-indigo-500/10 border-indigo-500/20 text-indigo-400"
      />
      <KanbanColumn
        title="Blocked"
        status="BLOCKED"
        icon="🛑"
        tasks={blockedTasks}
        color="bg-red-500/10 border-red-500/20 text-red-400"
      />
      <KanbanColumn
        title="Completed"
        status="COMPLETED"
        icon="✅"
        tasks={completedTasks}
        color="bg-emerald-500/10 border-emerald-500/20 text-emerald-400"
      />
    </div>
  );
}
