import React, { useEffect, useState } from 'react';
import useFeatureFlagStore from '../store/featureFlagStore';
import FeatureFlagTable from '../components/admin/FeatureFlagTable';
import { Plus, X, ToggleRight } from 'lucide-react';

const FeatureFlags = () => {
  const flags = useFeatureFlagStore((state) => state.flags);
  const fetchFlags = useFeatureFlagStore((state) => state.fetchFlags);
  const createFlag = useFeatureFlagStore((state) => state.createFlag);
  const updateFlag = useFeatureFlagStore((state) => state.updateFlag);

  const [builderOpen, setBuilderOpen] = useState(false);
  const [key, setKey] = useState('');
  const [description, setDescription] = useState('');
  const [environment, setEnvironment] = useState('');
  const [selectedRole, setSelectedRole] = useState('');
  const [roles, setRoles] = useState([]);

  useEffect(() => {
    fetchFlags();
  }, [fetchFlags]);

  const handleToggleStatus = async (flag) => {
    const nextStatus = flag.status === 'ENABLED' ? 'DISABLED' : 'ENABLED';
    await updateFlag(flag.id, { status: nextStatus });
  };

  const handleAddRole = () => {
    if (selectedRole && !roles.includes(selectedRole)) {
      setRoles([...roles, selectedRole]);
      setSelectedRole('');
    }
  };

  const handleRemoveRole = (roleToRemove) => {
    setRoles(roles.filter((r) => r !== roleToRemove));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!key.trim()) return;

    try {
      await createFlag({
        key,
        description,
        environment: environment || null,
        roles,
        status: 'ENABLED'
      });
      setBuilderOpen(false);
      setKey('');
      setDescription('');
      setEnvironment('');
      setRoles([]);
    } catch (err) {
      alert('Failed to register feature flag. Key may be duplicate.');
    }
  };

  return (
    <div className="space-y-6 text-left select-none max-w-5xl mx-auto">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-zinc-900 pb-4">
        <div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
            <ToggleRight className="w-6 h-6 text-brand-400" />
            <span>Feature Flags Registry</span>
          </h1>
          <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
            Toggle portal subsystems, restrict beta access to managers, or filter by developer envs.
          </p>
        </div>

        <button
          onClick={() => setBuilderOpen(true)}
          className="flex items-center space-x-1.5 px-4 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold transition-all shadow-lg"
        >
          <Plus className="w-4 h-4" />
          <span>Configure Flag</span>
        </button>
      </div>

      <FeatureFlagTable flags={flags} onToggleStatus={handleToggleStatus} />

      {/* Flag Creator Modal */}
      {builderOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-zinc-950/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-950 border border-zinc-900 rounded-2xl shadow-2xl overflow-hidden flex flex-col">
            <div className="flex justify-between items-center p-5 border-b border-zinc-900 bg-zinc-950/40">
              <h3 className="text-sm font-bold text-white">⚙️ Configure Feature Flag</h3>
              <button
                onClick={() => setBuilderOpen(false)}
                className="p-1 rounded-lg text-zinc-500 hover:text-white hover:bg-zinc-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4 text-left">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Flag Key</label>
                <input
                  type="text"
                  required
                  value={key}
                  onChange={(e) => setKey(e.target.value)}
                  placeholder="e.g. ENABLE_PAYROLL_MODULE"
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="space-y-1">
                <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Description</label>
                <input
                  type="text"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Summarize flag impact..."
                  className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Target Environment</label>
                  <select
                    value={environment}
                    onChange={(e) => setEnvironment(e.target.value)}
                    className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                  >
                    <option value="">ALL</option>
                    <option value="production">Production</option>
                    <option value="development">Development</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Visibility Role</label>
                  <div className="flex space-x-2">
                    <select
                      value={selectedRole}
                      onChange={(e) => setSelectedRole(e.target.value)}
                      className="flex-1 px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
                    >
                      <option value="">Select role...</option>
                      <option value="ADMIN">Admin</option>
                      <option value="MANAGER">Manager</option>
                      <option value="EMPLOYEE">Employee</option>
                      <option value="HR">HR</option>
                    </select>
                    <button
                      type="button"
                      onClick={handleAddRole}
                      className="px-3 bg-zinc-900 border border-zinc-800 text-white rounded-xl text-xs font-bold"
                    >
                      Add
                    </button>
                  </div>
                </div>
              </div>

              {roles.length > 0 && (
                <div className="flex flex-wrap gap-1.5 p-3 bg-zinc-900 border border-zinc-800 rounded-xl">
                  {roles.map((r, idx) => (
                    <span
                      key={idx}
                      onClick={() => handleRemoveRole(r)}
                      className="flex items-center space-x-1 px-2.5 py-0.5 bg-zinc-950 text-[10px] font-bold text-zinc-400 rounded-md border border-zinc-900 hover:text-rose-400 cursor-pointer"
                    >
                      <span>{r}</span>
                      <X className="w-2.5 h-2.5 shrink-0" />
                    </span>
                  ))}
                </div>
              )}

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-900/60">
                <button
                  type="button"
                  onClick={() => setBuilderOpen(false)}
                  className="px-4 py-2 bg-zinc-900 border border-zinc-900 text-zinc-400 hover:text-white rounded-xl text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg"
                >
                  Save Flag
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default FeatureFlags;
