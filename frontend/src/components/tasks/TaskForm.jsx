import React, { useState, useEffect } from 'react';
import { useTaskStore } from '../../store/taskStore';
import { apiClient } from '../../api/apiClient';

export default function TaskForm({ task, onClose }) {
  const createTask = useTaskStore((state) => state.createTask);
  const updateTask = useTaskStore((state) => state.updateTask);

  const [projects, setProjects] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [tasksForProject, setTasksForProject] = useState([]);

  const [formData, setFormData] = useState({
    title: task?.title || '',
    description: task?.description || '',
    projectId: task?.projectId || '',
    parentTaskId: task?.parentTaskId || '',
    reporterId: task?.reporterId || '',
    status: task?.status || 'TODO',
    priority: task?.priority || 'MEDIUM',
    type: task?.type || 'FEATURE',
    dueDate: task?.dueDate ? task.dueDate.split('T')[0] : '',
    estimatedHours: task?.estimatedHours || '',
    actualHours: task?.actualHours || '',
    completionPercentage: task?.completionPercentage || 0
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const loadLookups = async () => {
      try {
        const [projRes, empRes] = await Promise.all([
          apiClient.get('/projects?limit=100'),
          apiClient.get('/employees?limit=100')
        ]);
        if (projRes.data.success) setProjects(projRes.data.data || []);
        if (empRes.data.success) setEmployees(empRes.data.data || []);
      } catch (err) {
        console.error('Failed to load form lookup data', err);
      }
    };
    loadLookups();
  }, []);

  // Fetch tasks belonging to the selected project to populate parent task selection
  useEffect(() => {
    const loadTasksForProject = async () => {
      if (formData.projectId) {
        try {
          const response = await apiClient.get(`/tasks?projectId=${formData.projectId}&limit=200`);
          if (response.data.success) {
            // Exclude current task to prevent self-parenting
            const list = (response.data.tasks || []).filter((t) => t.id !== task?.id);
            setTasksForProject(list);
          }
        } catch (err) {
          console.error('Failed to load tasks for project', err);
        }
      } else {
        setTasksForProject([]);
      }
    };
    loadTasksForProject();
  }, [formData.projectId, task?.id]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSliderChange = (e) => {
    setFormData((prev) => ({
      ...prev,
      completionPercentage: parseInt(e.target.value)
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    const payload = {
      ...formData,
      description: formData.description || null,
      parentTaskId: formData.parentTaskId || null,
      reporterId: formData.reporterId || null,
      dueDate: formData.dueDate ? new Date(formData.dueDate).toISOString() : null,
      estimatedHours: formData.estimatedHours !== '' ? parseFloat(formData.estimatedHours) : null,
      actualHours: formData.actualHours !== '' ? parseFloat(formData.actualHours) : null,
      completionPercentage: parseInt(formData.completionPercentage)
    };

    try {
      if (task) {
        await updateTask(task.id, payload);
      } else {
        await createTask(payload);
      }
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to submit task details.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-6 text-sm font-semibold">
      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/25 rounded-xl text-red-400 text-xs">
          ⚠️ {error}
        </div>
      )}

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        {/* Title */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Title</label>
          <input
            type="text"
            name="title"
            required
            value={formData.title}
            onChange={handleChange}
            placeholder="Implement login workflow with validation..."
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none placeholder-slateDark-600"
          />
        </div>

        {/* Description */}
        <div className="space-y-1.5 sm:col-span-2">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Description</label>
          <textarea
            name="description"
            rows="3"
            value={formData.description}
            onChange={handleChange}
            placeholder="Write detailed specifications of the deliverables..."
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none placeholder-slateDark-600 resize-none"
          />
        </div>

        {/* Project Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Project</label>
          <select
            name="projectId"
            required
            disabled={!!task} // Project cannot be changed after creation
            value={formData.projectId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none cursor-pointer disabled:opacity-50"
          >
            <option value="">Select Project</option>
            {projects.map((p) => (
              <option key={p.id} value={p.id}>
                [{p.code}] {p.name}
              </option>
            ))}
          </select>
        </div>

        {/* Parent Task Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Parent Task</label>
          <select
            name="parentTaskId"
            value={formData.parentTaskId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none cursor-pointer"
          >
            <option value="">None (Independent Task)</option>
            {tasksForProject.map((t) => (
              <option key={t.id} value={t.id}>
                [{t.taskCode}] {t.title}
              </option>
            ))}
          </select>
        </div>

        {/* Status */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Status</label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none cursor-pointer"
          >
            <option value="TODO">📝 Todo</option>
            <option value="IN_PROGRESS">⚡ In Progress</option>
            <option value="IN_REVIEW">🔬 In Review</option>
            <option value="BLOCKED">🛑 Blocked</option>
            <option value="COMPLETED">✅ Completed</option>
            <option value="CANCELLED">❌ Cancelled</option>
          </select>
        </div>

        {/* Priority */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Priority</label>
          <select
            name="priority"
            value={formData.priority}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none cursor-pointer"
          >
            <option value="LOW">🔵 Low</option>
            <option value="MEDIUM">🟢 Medium</option>
            <option value="HIGH">🟡 High</option>
            <option value="URGENT">🔴 Urgent</option>
          </select>
        </div>

        {/* Task Type */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Type</label>
          <select
            name="type"
            value={formData.type}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none cursor-pointer"
          >
            <option value="FEATURE">💡 Feature</option>
            <option value="BUG">🐛 Bug</option>
            <option value="IMPROVEMENT">🔧 Improvement</option>
            <option value="DOCUMENTATION">📄 Documentation</option>
            <option value="RESEARCH">🔬 Research</option>
          </select>
        </div>

        {/* Reporter Selection */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Reporter</label>
          <select
            name="reporterId"
            value={formData.reporterId}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none cursor-pointer"
          >
            <option value="">Select Reporter</option>
            {employees.map((e) => (
              <option key={e.id} value={e.id}>
                {e.firstName} {e.lastName}
              </option>
            ))}
          </select>
        </div>

        {/* Estimated Hours */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Est. Hours</label>
          <input
            type="number"
            step="0.5"
            name="estimatedHours"
            value={formData.estimatedHours}
            onChange={handleChange}
            placeholder="e.g. 16.5"
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none placeholder-slateDark-600"
          />
        </div>

        {/* Due Date */}
        <div className="space-y-1.5">
          <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Due Date</label>
          <input
            type="date"
            name="dueDate"
            value={formData.dueDate}
            onChange={handleChange}
            className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white focus:outline-none"
          />
        </div>

        {/* Completion Percentage Slider */}
        <div className="space-y-1.5 sm:col-span-2">
          <div className="flex justify-between items-center select-none">
            <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Completion Progress</label>
            <span className="text-xs font-mono font-bold text-brand-400">{formData.completionPercentage}%</span>
          </div>
          <div className="flex items-center space-x-4">
            <input
              type="range"
              min="0"
              max="100"
              step="5"
              value={formData.completionPercentage}
              onChange={handleSliderChange}
              className="flex-1 accent-brand-500 cursor-pointer"
            />
          </div>
        </div>
      </div>

      <div className="flex justify-end space-x-3 select-none">
        <button
          type="button"
          onClick={onClose}
          className="px-6 py-2.5 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
        >
          Cancel
        </button>
        <button
          type="submit"
          disabled={isLoading}
          className="px-6 py-2.5 bg-brand-600 hover:bg-brand-500 border border-brand-500 text-white rounded-xl text-xs font-bold disabled:opacity-40 disabled:cursor-not-allowed transition-all shadow-lg hover:shadow-brand-500/25"
        >
          {isLoading ? 'Saving...' : task ? 'Save Changes' : 'Create Task'}
        </button>
      </div>
    </form>
  );
}
