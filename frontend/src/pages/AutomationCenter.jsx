import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import useAutomationStore from '../store/automationStore';
import RuleTable from '../components/automation/RuleTable';
import AutomationBuilder from '../components/automation/AutomationBuilder';
import { Settings, Plus, History } from 'lucide-react';
import { useAuthStore } from '../store/authStore';

const AutomationCenter = () => {
  const rules = useAutomationStore((state) => state.rules);
  const fetchRules = useAutomationStore((state) => state.fetchRules);
  const user = useAuthStore((state) => state.user);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [selectedRule, setSelectedRule] = useState(null);

  useEffect(() => {
    fetchRules();
  }, [fetchRules]);

  const handleEditRule = (rule) => {
    setSelectedRule(rule);
    setBuilderOpen(true);
  };

  const handleNewRule = () => {
    setSelectedRule(null);
    setBuilderOpen(true);
  };

  const canEdit = user?.role === 'ADMIN' || user?.role === 'MANAGER';

  return (
    <div className="space-y-6 select-none">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <Settings className="w-6 h-6 text-brand-400" />
            <span>Workflow Automation Center</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Configure custom trigger conditions and automate repetitive team tasks.
          </p>
        </div>

        <div className="flex items-center space-x-2">
          <Link
            to="/automation/history"
            className="flex items-center space-x-1.5 px-4 py-2.5 bg-zinc-900 border border-zinc-800 hover:border-zinc-700 text-zinc-300 hover:text-white rounded-xl text-xs font-bold transition-all"
          >
            <History className="w-4 h-4" />
            <span>Execution History</span>
          </Link>
          {canEdit && (
            <button
              onClick={handleNewRule}
              className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
            >
              <Plus className="w-4 h-4" />
              <span>Configure Rule</span>
            </button>
          )}
        </div>
      </div>

      {/* Rules list */}
      <div className="space-y-4">
        <div className="flex justify-between items-center border-b border-zinc-900 pb-3">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">Active Rules Matrix</h3>
          <span className="px-2 py-0.5 bg-zinc-900 border border-zinc-800 text-zinc-400 rounded-md text-[10px] font-bold">
            {rules.length} total
          </span>
        </div>

        <RuleTable rules={rules} onEditRule={handleEditRule} />
      </div>

      <AutomationBuilder
        rule={selectedRule}
        isOpen={builderOpen}
        onClose={() => {
          setBuilderOpen(false);
          setSelectedRule(null);
        }}
      />
    </div>
  );
};

export default AutomationCenter;
