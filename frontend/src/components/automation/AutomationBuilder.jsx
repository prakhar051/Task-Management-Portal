import React, { useState, useEffect } from 'react';
import useAutomationStore from '../../store/automationStore';
import { X, Check } from 'lucide-react';

const AutomationBuilder = ({ rule = null, isOpen, onClose }) => {
  const createRule = useAutomationStore((state) => state.createRule);
  const updateRule = useAutomationStore((state) => state.updateRule);

  const [title, setTitle] = useState('');
  const [trigger, setTrigger] = useState('TASK_COMPLETED');
  const [action, setAction] = useState('NOTIFY_MANAGER');
  const [status, setStatus] = useState('ACTIVE');
  const [conditions, setConditions] = useState('{}');

  useEffect(() => {
    if (rule) {
      setTitle(rule.title || '');
      setTrigger(rule.trigger || 'TASK_COMPLETED');
      setAction(rule.action || 'NOTIFY_MANAGER');
      setStatus(rule.status || 'ACTIVE');
      setConditions(rule.conditions || '{}');
    } else {
      setTitle('');
      setTrigger('TASK_COMPLETED');
      setAction('NOTIFY_MANAGER');
      setStatus('ACTIVE');
      setConditions('{}');
    }
  }, [rule, isOpen]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!title.trim()) return;

    try {
      // Validate conditions JSON string
      JSON.parse(conditions);
    } catch (err) {
      alert('Conditions must be a valid JSON string (e.g. {"status":"COMPLETED"})');
      return;
    }

    const data = { title, trigger, action, status, conditions };

    try {
      if (rule) {
        await updateRule(rule.id, data);
      } else {
        await createRule(data);
      }
      onClose();
    } catch (err) {
      alert('Failed to save automation rule.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm select-none">
      <div className="w-full max-w-lg bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
        {/* Header */}
        <div className="flex justify-between items-center p-5 border-b border-zinc-900 bg-zinc-950/40">
          <h3 className="text-sm font-bold text-white">
            {rule ? '✏️ Edit Automation Rule' : '⚙️ Configure Workflow Automation'}
          </h3>
          <button onClick={onClose} className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Rule Name</label>
            <input
              type="text"
              required
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              placeholder="e.g. Notify Department Manager on Task Completion"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Trigger Event</label>
              <select
                value={trigger}
                onChange={(e) => setTrigger(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="TASK_COMPLETED">When Task Completed</option>
                <option value="EMPLOYEE_JOINED">When Employee Joined</option>
                <option value="PAYROLL_APPROVED">When Payroll Approved</option>
                <option value="LEAVE_APPROVED">When Leave Approved</option>
                <option value="CANDIDATE_HIRED">When Candidate Hired</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Action Outcome</label>
              <select
                value={action}
                onChange={(e) => setAction(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
              >
                <option value="NOTIFY_MANAGER">Notify Associated Manager</option>
                <option value="GENERATE_DOCUMENTS">Generate Guidelines Document</option>
                <option value="NOTIFY_EMPLOYEE">Notify Employee Profile</option>
                <option value="UPDATE_CALENDAR">Update Calendar Event</option>
                <option value="CREATE_EMPLOYEE">Provision Employee Profile</option>
              </select>
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Conditions (JSON format)</label>
            <input
              type="text"
              required
              value={conditions}
              onChange={(e) => setConditions(e.target.value)}
              placeholder='e.g. {"status":"COMPLETED"}'
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white placeholder-zinc-500 focus:outline-none focus:border-brand-500 font-mono"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Initial Status</label>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 rounded-xl text-xs text-white focus:outline-none focus:border-brand-500"
            >
              <option value="ACTIVE">Active</option>
              <option value="INACTIVE">Inactive</option>
            </select>
          </div>

          <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-900/60">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="flex items-center space-x-1.5 px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              <Check className="w-3.5 h-3.5" />
              <span>Apply Rule</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default AutomationBuilder;
