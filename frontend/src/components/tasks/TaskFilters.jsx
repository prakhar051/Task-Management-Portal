import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { apiClient } from '../../api/apiClient';

export default function TaskFilters() {
  const filters = useTaskStore((state) => state.filters);
  const setFilters = useTaskStore((state) => state.setFilters);
  const resetFilters = useTaskStore((state) => state.resetFilters);

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [showAdvanced, setShowAdvanced] = useState(false);

  useEffect(() => {
    // Load lookup parameters
    const loadLookups = async () => {
      try {
        const [projRes, empRes] = await Promise.all([
          apiClient.get('/projects?limit=100'),
          apiClient.get('/employees?limit=100')
        ]);
        if (projRes.data.success) {
          setProjects(projRes.data.data || []);
        }
        if (empRes.data.success) {
          setEmployees(empRes.data.data || []);
        }
      } catch (err) {
        console.error('Failed to load lookup filter lists', err);
      }
    };
    loadLookups();
  }, []);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFilters({ [name]: value });
  };

  const activeFilterCount = Object.entries(filters).filter(([k, v]) => k !== 'search' && v !== '').length;

  return (
    <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-5 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center space-x-2">
          <span className="text-lg">⚙️</span>
          <h3 className="font-bold text-white text-sm">Query Filters</h3>
          {activeFilterCount > 0 && (
            <span className="px-2.5 py-0.5 bg-brand-500/20 text-brand-400 border border-brand-500/30 rounded-full text-xs font-bold font-mono">
              {activeFilterCount} active
            </span>
          )}
        </div>

        <div className="flex items-center space-x-2">
          <button
            onClick={() => setShowAdvanced(!showAdvanced)}
            className="px-4 py-2 bg-slateDark-900 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            {showAdvanced ? '🙈 Hide Extended Filters' : '🛠️ Advanced Filters'}
          </button>
          {activeFilterCount > 0 && (
            <button
              onClick={resetFilters}
              className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-xs font-bold transition-all"
            >
              🧹 Clear All
            </button>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
        {/* Project Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Project</label>
          <select
            name="projectId"
            value={filters.projectId}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 text-white text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="">All Projects</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.code}] {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Status Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Status</label>
          <select
            name="status"
            value={filters.status}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 text-white text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="">All Statuses</option>
            <option value="TODO">📝 Todo</option>
            <option value="IN_PROGRESS">⚡ In Progress</option>
            <option value="IN_REVIEW">🔬 In Review</option>
            <option value="BLOCKED">🛑 Blocked</option>
            <option value="COMPLETED">✅ Completed</option>
            <option value="CANCELLED">❌ Cancelled</option>
          </select>
        </div>

        {/* Priority Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Priority</label>
          <select
            name="priority"
            value={filters.priority}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 text-white text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="">All Priorities</option>
            <option value="LOW">🔵 Low</option>
            <option value="MEDIUM">🟢 Medium</option>
            <option value="HIGH">🟡 High</option>
            <option value="URGENT">🔴 Urgent</option>
          </select>
        </div>

        {/* Assignee Selector */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Assignee</label>
          <select
            name="assigneeId"
            value={filters.assigneeId}
            onChange={handleChange}
            className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 text-white text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
          >
            <option value="">All Assignees</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>
      </div>

      {showAdvanced && (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4 pt-2 border-t border-slateDark-900 animate-fade-in">
          {/* Type Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Task Type</label>
            <select
              name="type"
              value={filters.type}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 text-white text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="">All Types</option>
              <option value="FEATURE">💡 Feature</option>
              <option value="BUG">🐛 Bug</option>
              <option value="IMPROVEMENT">🔧 Improvement</option>
              <option value="DOCUMENTATION">📄 Documentation</option>
              <option value="RESEARCH">🔬 Research</option>
            </select>
          </div>

          {/* Reporter Selector */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Reporter</label>
            <select
              name="reporterId"
              value={filters.reporterId}
              onChange={handleChange}
              className="w-full px-3.5 py-2.5 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 text-white text-xs font-semibold rounded-xl focus:outline-none cursor-pointer"
            >
              <option value="">All Reporters</option>
              {employees.map((e) => (
                <option key={e.id} value={e.id}>
                  {e.firstName} {e.lastName}
                </option>
              ))}
            </select>
          </div>

          {/* Due Date Filter */}
          <div className="space-y-1.5">
            <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Due Date</label>
            <input
              type="date"
              name="dueDate"
              value={filters.dueDate}
              onChange={handleChange}
              className="w-full px-3.5 py-2 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 text-white text-xs font-semibold rounded-xl focus:outline-none"
            />
          </div>

          <div className="flex items-end pb-0.5">
            <span className="text-slateDark-500 text-xs italic">
              Advanced filters apply in real-time.
            </span>
          </div>
        </div>
      )}
    </div>
  );
}
