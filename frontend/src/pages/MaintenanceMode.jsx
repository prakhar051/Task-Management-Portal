import React, { useEffect, useState } from 'react';
import useAdminStore from '../store/adminStore';
import { ToggleLeft, ToggleRight, AlertTriangle, ShieldCheck } from 'lucide-react';

const MaintenanceMode = () => {
  const config = useAdminStore((state) => state.maintenanceConfig);
  const fetchMaintenanceConfig = useAdminStore((state) => state.fetchMaintenanceConfig);
  const updateMaintenanceConfig = useAdminStore((state) => state.updateMaintenanceConfig);

  const [status, setStatus] = useState('DISABLED');
  const [message, setMessage] = useState('System is undergoing scheduled maintenance.');
  const [allowAdmin, setAllowAdmin] = useState(true);
  const [eta, setEta] = useState('');

  useEffect(() => {
    fetchMaintenanceConfig();
  }, [fetchMaintenanceConfig]);

  useEffect(() => {
    if (config) {
      setStatus(config.status || 'DISABLED');
      setMessage(config.message || 'System is undergoing scheduled maintenance.');
      setAllowAdmin(config.allowAdmin ?? true);
      if (config.eta) {
        setEta(new Date(config.eta).toISOString().slice(0, 16));
      } else {
        setEta('');
      }
    }
  }, [config]);

  const handleSave = async (e) => {
    e.preventDefault();
    await updateMaintenanceConfig({
      status,
      message,
      allowAdmin,
      eta: eta ? new Date(eta) : null
    });
    alert('Maintenance parameters successfully saved!');
  };

  return (
    <div className="space-y-6 text-left select-none max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <AlertTriangle className="w-6 h-6 text-rose-500 animate-pulse" />
          <span>System Maintenance Center</span>
        </h1>
        <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
          Lock company database, restrict login routes access, and configure offline warning displays.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <form onSubmit={handleSave} className="lg:col-span-2 p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4 text-xs text-zinc-300">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">
            Configure Locking Trigger
          </h3>

          <div className="flex items-center justify-between p-4 bg-zinc-950 border border-zinc-900 rounded-xl">
            <div>
              <h4 className="font-bold text-white">Activate System Lock</h4>
              <p className="text-[10px] text-zinc-500 leading-relaxed font-semibold mt-0.5">Enforces service unavailability locks instantly</p>
            </div>
            <button
              type="button"
              onClick={() => setStatus(status === 'ENABLED' ? 'DISABLED' : 'ENABLED')}
              className={`flex items-center space-x-1.5 px-4 py-2 rounded-xl border font-bold transition-all ${
                status === 'ENABLED'
                  ? 'bg-rose-500/10 border-rose-500/20 text-rose-400 font-extrabold'
                  : 'bg-zinc-900 border-zinc-800 text-zinc-500 font-semibold'
              }`}
            >
              {status === 'ENABLED' ? (
                <>
                  <ToggleRight className="w-5 h-5 text-rose-400 animate-bounce" />
                  <span>ACTIVE LOCKS</span>
                </>
              ) : (
                <>
                  <ToggleLeft className="w-5 h-5 text-zinc-500" />
                  <span>DISABLED</span>
                </>
              )}
            </button>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Warning Banner Message</label>
            <input
              type="text"
              required
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Estimated Completion (ETA)</label>
              <input
                type="datetime-local"
                value={eta}
                onChange={(e) => setEta(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl focus:outline-none"
              />
            </div>

            <div className="space-y-1 flex items-center pt-5">
              <label className="flex items-center space-x-2 text-xs font-bold text-zinc-400 select-none cursor-pointer">
                <input
                  type="checkbox"
                  checked={allowAdmin}
                  onChange={(e) => setAllowAdmin(e.target.checked)}
                  className="h-4.5 w-4.5 bg-zinc-950 border border-zinc-900 text-brand-500 rounded focus:ring-0"
                />
                <span>Allow Administrators Bypass Logins</span>
              </label>
            </div>
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              Apply Maintenance Status
            </button>
          </div>
        </form>

        <div className="lg:col-span-1 p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl flex flex-col justify-between text-xs space-y-4">
          <div className="space-y-3">
            <div className="p-2.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl w-10 flex items-center justify-center">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <h4 className="font-bold text-white text-sm">Security Controls Safety Guidelines</h4>
            <p className="text-zinc-400 leading-relaxed font-semibold">
              When Maintenance Locks are enabled, standard users API calls are aborted with service unavailable codes. Bypass paths remain active for administrators login checks to enable hotfixes.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MaintenanceMode;
