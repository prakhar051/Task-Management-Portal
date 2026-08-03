import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { useTaskStore } from '../store/taskStore';
import { useAuthStore } from '../store/authStore';
import CommentFeed from '../components/tasks/CommentFeed';
import AttachmentList from '../components/tasks/AttachmentList';
import LabelSelector from '../components/tasks/LabelSelector';
import TaskModal from '../components/tasks/TaskModal';
import { apiClient } from '../api/apiClient';

export default function TaskDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const currentTask = useTaskStore((state) => state.currentTask);
  const fetchTaskById = useTaskStore((state) => state.fetchTaskById);
  const updateTaskStatus = useTaskStore((state) => state.updateTaskStatus);
  const updateTaskProgress = useTaskStore((state) => state.updateTaskProgress);
  const assignAssignees = useTaskStore((state) => state.assignAssignees);
  const updateDependencies = useTaskStore((state) => state.updateDependencies);
  const deleteTask = useTaskStore((state) => state.deleteTask);
  const user = useAuthStore((state) => state.user);

  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isEditOpen, setIsEditOpen] = useState(false);

  // Assignment and Blocker modal/inline triggers
  const [employees, setEmployees] = useState([]);
  const [allTasks, setAllTasks] = useState([]);
  const [showAssigneeEdit, setShowAssigneeEdit] = useState(false);
  const [showBlockerEdit, setShowBlockerEdit] = useState(false);

  const isAdmin = user?.role === 'ADMIN';

  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      setError(null);
      try {
        await fetchTaskById(id);
        if (isAdmin) {
          const [empRes, taskRes] = await Promise.all([
            apiClient.get('/employees?limit=100'),
            apiClient.get('/tasks?limit=200')
          ]);
          if (empRes.data.success) setEmployees(empRes.data.data || []);
          if (taskRes.data.success) {
            // Exclude current task to prevent circular loop selection
            setAllTasks((taskRes.data.tasks || []).filter((t) => t.id !== id));
          }
        }
      } catch (err) {
        setError(err.response?.data?.message || 'Failed to retrieve task details.');
      } finally {
        setIsLoading(false);
      }
    };
    loadData();
  }, [id, fetchTaskById, isAdmin]);

  const handleStatusChange = async (e) => {
    const targetStatus = e.target.value;
    try {
      await updateTaskStatus(id, targetStatus);
    } catch (err) {
      alert(err.response?.data?.message || 'Invalid status transition.');
    }
  };

  const handleProgressChange = async (e) => {
    const progress = parseInt(e.target.value);
    try {
      await updateTaskProgress(id, progress);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update progress percentage.');
    }
  };

  const handleAssigneeToggle = async (employeeId) => {
    const isAssigned = currentTask.assignees?.some((a) => a.employeeId === employeeId);
    let updatedList;
    if (isAssigned) {
      updatedList = currentTask.assignees.filter((a) => a.employeeId !== employeeId).map((a) => a.employeeId);
    } else {
      updatedList = [...(currentTask.assignees || []).map((a) => a.employeeId), employeeId];
    }

    try {
      await assignAssignees(id, updatedList);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to assign employee.');
    }
  };

  const handleBlockerToggle = async (blockerTaskId) => {
    const isBlocked = currentTask.dependencies?.some((d) => d.dependsOnTaskId === blockerTaskId);
    let updatedList;
    if (isBlocked) {
      updatedList = currentTask.dependencies.filter((d) => d.dependsOnTaskId !== blockerTaskId).map((d) => d.dependsOnTaskId);
    } else {
      updatedList = [...(currentTask.dependencies || []).map((d) => d.dependsOnTaskId), blockerTaskId];
    }

    try {
      await updateDependencies(id, updatedList);
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update blockers.');
    }
  };

  const handleDeleteTask = async () => {
    if (window.confirm('Are you sure you want to soft delete this task?')) {
      try {
        await deleteTask(id);
        navigate('/tasks');
      } catch (err) {
        alert(err.response?.data?.message || 'Failed to delete task.');
      }
    }
  };

  if (isLoading) {
    return (
      <div className="min-h-[50vh] flex items-center justify-center animate-pulse">
        <div className="text-slateDark-400 font-bold text-sm">Loading task details...</div>
      </div>
    );
  }

  if (error || !currentTask) {
    return (
      <div className="p-8 bg-red-500/10 border border-red-500/25 rounded-2xl text-red-400 text-center select-none max-w-lg mx-auto">
        <span className="text-3xl block mb-2">⚠️</span>
        <h3 className="font-bold text-white mb-2">Failed to retrieve task</h3>
        <p className="text-sm text-red-400/90">{error}</p>
        <Link to="/tasks" className="mt-4 inline-block px-5 py-2 bg-slateDark-900 border border-slateDark-800 text-white text-xs font-bold rounded-xl">
          Back to Directory
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Detail Header navigation path */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div className="space-y-1">
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <Link to="/tasks" className="hover:text-brand-400">Tasks</Link>
            <span>/</span>
            <span className="text-slateDark-500">{currentTask.project?.name}</span>
            <span>/</span>
            <span className="text-white font-mono">{currentTask.taskCode}</span>
          </div>
          <h1 className="text-xl font-extrabold text-white">{currentTask.title}</h1>
        </div>

        <div className="flex items-center space-x-2">
          {isAdmin && (
            <>
              <button
                onClick={() => setIsEditOpen(true)}
                className="px-4 py-2 bg-slateDark-900 hover:bg-slateDark-800 border border-slateDark-800 hover:border-slateDark-700 text-slateDark-300 hover:text-white rounded-xl text-xs font-bold transition-all"
              >
                ✏️ Edit Metadata
              </button>
              <button
                onClick={handleDeleteTask}
                className="px-4 py-2 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 hover:border-red-500/40 text-red-400 rounded-xl text-xs font-bold transition-all"
              >
                🗑️ Delete Task
              </button>
            </>
          )}
        </div>
      </div>

      {/* Main Split details grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left column details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Description */}
          <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-6 space-y-3">
            <h3 className="text-xs font-bold text-slateDark-400 uppercase tracking-wider select-none">Description</h3>
            <p className="text-slateDark-300 text-sm leading-relaxed whitespace-pre-line">
              {currentTask.description || 'No description provided.'}
            </p>
          </div>

          {/* Subtasks hierarchy tree */}
          <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center select-none border-b border-slateDark-900 pb-3">
              <h3 className="text-xs font-bold text-slateDark-400 uppercase tracking-wider">Subtasks Tree</h3>
              <span className="px-2 py-0.5 bg-slateDark-900 border border-slateDark-800 text-slateDark-400 rounded-md text-[10px] font-bold">
                {currentTask.subTasks?.length || 0}
              </span>
            </div>
            <div className="space-y-2">
              {currentTask.subTasks?.map((sub) => (
                <div key={sub.id} className="flex items-center justify-between p-3 bg-slateDark-900/40 border border-slateDark-900 rounded-xl hover:border-slateDark-800 transition-colors">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="font-mono text-xs font-bold text-slateDark-500">{sub.taskCode}</span>
                    <Link to={`/tasks/${sub.id}`} className="text-white hover:text-brand-400 text-xs font-bold truncate">
                      {sub.title}
                    </Link>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-slateDark-900 text-slateDark-400 select-none">
                    {sub.status}
                  </span>
                </div>
              ))}
              {(!currentTask.subTasks || currentTask.subTasks.length === 0) && (
                <span className="text-slateDark-500 text-xs italic block select-none">No subtask hierarchy children</span>
              )}
            </div>
          </div>

          {/* Blocker dependencies */}
          <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-6 space-y-4">
            <div className="flex justify-between items-center select-none border-b border-slateDark-900 pb-3">
              <h3 className="text-xs font-bold text-slateDark-400 uppercase tracking-wider">Blocker Dependencies</h3>
              {isAdmin && (
                <button
                  onClick={() => setShowBlockerEdit(!showBlockerEdit)}
                  className="text-[10px] text-brand-400 hover:text-white font-bold transition-colors"
                >
                  {showBlockerEdit ? 'Done' : '⚙️ Manage Blockers'}
                </button>
              )}
            </div>

            {showBlockerEdit && (
              <div className="p-3.5 bg-slateDark-900/65 border border-slateDark-900 rounded-xl space-y-2 animate-fade-in max-h-48 overflow-y-auto select-none">
                {allTasks.map((t) => {
                  const isBlocked = currentTask.dependencies?.some((d) => d.dependsOnTaskId === t.id);
                  return (
                    <label key={t.id} className="flex items-center space-x-3 cursor-pointer py-1 hover:text-white text-xs">
                      <input
                        type="checkbox"
                        checked={isBlocked}
                        onChange={() => handleBlockerToggle(t.id)}
                        className="w-4 h-4 accent-brand-500 bg-slateDark-950 rounded border-slateDark-800"
                      />
                      <span>[{t.taskCode}] {t.title}</span>
                    </label>
                  );
                })}
              </div>
            )}

            <div className="space-y-2">
              {currentTask.dependencies?.map((dep) => (
                <div key={dep.id} className="flex items-center justify-between p-3 bg-red-500/5 border border-red-500/10 rounded-xl">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-xs">🛑</span>
                    <span className="font-mono text-xs font-bold text-red-400 select-none">Blocked by {dep.dependsOnTask?.taskCode}</span>
                    <Link to={`/tasks/${dep.dependsOnTaskId}`} className="text-white hover:text-brand-400 text-xs font-bold truncate">
                      {dep.dependsOnTask?.title}
                    </Link>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-red-500/10 text-red-400 select-none border border-red-500/20">
                    {dep.dependsOnTask?.status}
                  </span>
                </div>
              ))}

              {currentTask.blockedTasks?.map((block) => (
                <div key={block.id} className="flex items-center justify-between p-3 bg-brand-500/5 border border-brand-500/10 rounded-xl">
                  <div className="flex items-center space-x-3 overflow-hidden">
                    <span className="text-xs">⚡</span>
                    <span className="font-mono text-xs font-bold text-brand-400 select-none">Blocking {block.task?.taskCode}</span>
                    <Link to={`/tasks/${block.taskId}`} className="text-white hover:text-brand-400 text-xs font-bold truncate">
                      {block.task?.title}
                    </Link>
                  </div>
                  <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-brand-500/10 text-brand-400 select-none border border-brand-500/20">
                    {block.task?.status}
                  </span>
                </div>
              ))}

              {(!currentTask.dependencies || currentTask.dependencies.length === 0) &&
                (!currentTask.blockedTasks || currentTask.blockedTasks.length === 0) && (
                  <span className="text-slateDark-500 text-xs italic block select-none">No active dependency blocker links</span>
                )}
            </div>
          </div>

          {/* Comments Feed */}
          <CommentFeed taskId={id} />
        </div>

        {/* Right column details */}
        <div className="space-y-6">
          {/* Status, progress widgets */}
          <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-6 space-y-5 select-none">
            {/* Status Select dropdown */}
            <div className="space-y-1.5">
              <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Status Workflow</label>
              <select
                value={currentTask.status}
                onChange={handleStatusChange}
                className="w-full px-4 py-3 bg-slateDark-900 border border-slateDark-800 focus:border-brand-500 rounded-xl text-white text-xs font-semibold focus:outline-none cursor-pointer"
              >
                <option value="TODO">📝 Todo</option>
                <option value="IN_PROGRESS">⚡ In Progress</option>
                <option value="IN_REVIEW">🔬 In Review</option>
                <option value="BLOCKED">🛑 Blocked</option>
                <option value="COMPLETED">✅ Completed</option>
                <option value="CANCELLED">❌ Cancelled</option>
              </select>
            </div>

            {/* Progress Slider */}
            <div className="space-y-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Completion percentage</label>
                <span className="text-xs font-mono font-bold text-white">{currentTask.completionPercentage}%</span>
              </div>
              <input
                type="range"
                min="0"
                max="100"
                step="5"
                value={currentTask.completionPercentage}
                onChange={handleProgressChange}
                className="w-full accent-brand-500 cursor-pointer"
              />
            </div>
          </div>

          {/* Core attributes list */}
          <div className="bg-slateDark-950/20 border border-slateDark-900 rounded-2xl p-6 space-y-5">
            <div className="flex items-center space-x-2 border-b border-slateDark-900 pb-3 select-none">
              <span className="text-sm">📋</span>
              <h3 className="font-bold text-white text-xs.5 uppercase tracking-wider">Attributes details</h3>
            </div>

            <div className="space-y-3.5 text-xs">
              <div className="flex justify-between items-center">
                <span className="text-slateDark-400 font-semibold select-none">Type</span>
                <span className="text-white font-bold bg-slateDark-900 border border-slateDark-800 px-2 py-0.5 rounded uppercase tracking-wide">
                  {currentTask.type}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slateDark-400 font-semibold select-none">Priority</span>
                <span className="text-white font-bold bg-slateDark-900 border border-slateDark-800 px-2 py-0.5 rounded uppercase tracking-wide">
                  {currentTask.priority}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slateDark-400 font-semibold select-none">Due Date</span>
                <span className="text-white font-bold font-mono">
                  {currentTask.dueDate ? new Date(currentTask.dueDate).toLocaleDateString() : 'None'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slateDark-400 font-semibold select-none">Est. Hours</span>
                <span className="text-white font-bold font-mono">
                  {currentTask.estimatedHours !== null ? `${currentTask.estimatedHours} hrs` : 'None'}
                </span>
              </div>

              <div className="flex justify-between items-center">
                <span className="text-slateDark-400 font-semibold select-none">Reporter</span>
                <span className="text-white font-bold">
                  {currentTask.reporter ? `${currentTask.reporter.firstName} ${currentTask.reporter.lastName}` : 'Unassigned'}
                </span>
              </div>
            </div>

            {/* Labels display */}
            <LabelSelector task={currentTask} onUpdate={() => fetchTaskById(id)} />

            {/* Multiple Assignees manager */}
            <div className="space-y-3 pt-3 border-t border-slateDark-900">
              <div className="flex justify-between items-center select-none">
                <span className="text-[11px] font-bold text-slateDark-400 uppercase tracking-wider">Assignees</span>
                {isAdmin && (
                  <button
                    onClick={() => setShowAssigneeEdit(!showAssigneeEdit)}
                    className="text-[10px] text-brand-400 hover:text-white font-bold transition-colors"
                  >
                    {showAssigneeEdit ? 'Done' : '⚙️ Assign'}
                  </button>
                )}
              </div>

              {showAssigneeEdit && (
                <div className="p-3.5 bg-slateDark-900/65 border border-slateDark-900 rounded-xl space-y-2 animate-fade-in max-h-48 overflow-y-auto select-none">
                  {employees.map((e) => {
                    const isAssigned = currentTask.assignees?.some((a) => a.employeeId === e.id);
                    return (
                      <label key={e.id} className="flex items-center space-x-3 cursor-pointer py-1 hover:text-white text-xs">
                        <input
                          type="checkbox"
                          checked={isAssigned}
                          onChange={() => handleAssigneeToggle(e.id)}
                          className="w-4 h-4 accent-brand-500 bg-slateDark-950 rounded border-slateDark-800"
                        />
                        <span>{e.firstName} {e.lastName}</span>
                      </label>
                    );
                  })}
                </div>
              )}

              <div className="space-y-2 max-h-36 overflow-y-auto">
                {currentTask.assignees?.map((a) => (
                  <div key={a.id} className="flex items-center space-x-3 p-2 bg-slateDark-900/40 border border-slateDark-900 rounded-xl">
                    <div className="w-6 h-6 rounded-full bg-brand-500/20 text-brand-400 border border-brand-500/30 flex items-center justify-center font-extrabold text-[10px] uppercase select-none">
                      {a.employee?.avatar ? (
                        <img
                          src={`${apiClient.defaults.baseURL || ''}${a.employee.avatar}`}
                          alt="avatar"
                          className="w-full h-full object-cover rounded-full"
                        />
                      ) : (
                        a.employee?.firstName?.charAt(0)
                      )}
                    </div>
                    <span className="text-white text-xs font-bold">
                      {a.employee?.firstName} {a.employee?.lastName}
                    </span>
                  </div>
                ))}
                {(!currentTask.assignees || currentTask.assignees.length === 0) && (
                  <span className="text-slateDark-500 text-xs italic block select-none">No assignees allocated</span>
                )}
              </div>
            </div>
          </div>

          {/* Attachments Section */}
          <AttachmentList taskId={id} />
        </div>
      </div>

      {/* Task Modal Edit metadata */}
      <TaskModal
        task={currentTask}
        isOpen={isEditOpen}
        onClose={() => {
          setIsEditOpen(false);
          fetchTaskById(id); // reload on save
        }}
      />
    </div>
  );
}
