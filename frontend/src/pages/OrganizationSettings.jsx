import React, { useEffect, useState } from 'react';
import useAdminStore from '../store/adminStore';
import { ShieldCheck, Plus, Key, Trash, Ban } from 'lucide-react';

const OrganizationSettings = () => {
  const settings = useAdminStore((state) => state.settings);
  const fetchSettings = useAdminStore((state) => state.fetchSettings);
  const updateSettings = useAdminStore((state) => state.updateSettings);

  const apiKeys = useAdminStore((state) => state.apiKeys);
  const fetchApiKeys = useAdminStore((state) => state.fetchApiKeys);
  const createApiKey = useAdminStore((state) => state.createApiKey);
  const revokeApiKey = useAdminStore((state) => state.revokeApiKey);
  const deleteApiKey = useAdminStore((state) => state.deleteApiKey);

  const [companyName, setCompanyName] = useState('');
  const [address, setAddress] = useState('');
  const [timeZone, setTimeZone] = useState('UTC');
  const [currency, setCurrency] = useState('USD');
  const [workingDays, setWorkingDays] = useState('MON,TUE,WED,THU,FRI');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyDesc, setNewKeyDesc] = useState('');
  const [generatedKey, setGeneratedKey] = useState(null);

  useEffect(() => {
    fetchSettings();
    fetchApiKeys();
  }, [fetchSettings, fetchApiKeys]);

  useEffect(() => {
    if (settings) {
      setCompanyName(settings.companyName || '');
      setAddress(settings.address || '');
      setTimeZone(settings.timeZone || 'UTC');
      setCurrency(settings.currency || 'USD');
      setWorkingDays(settings.workingDays || 'MON,TUE,WED,THU,FRI');
    }
  }, [settings]);

  const handleSaveSettings = async (e) => {
    e.preventDefault();
    await updateSettings({
      companyName,
      address,
      timeZone,
      currency,
      workingDays
    });
    alert('Organization settings updated successfully!');
  };

  const handleGenerateKey = async (e) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    try {
      const res = await createApiKey(newKeyName, newKeyDesc);
      setGeneratedKey(res.rawKey);
      setNewKeyName('');
      setNewKeyDesc('');
    } catch (err) {
      alert('Failed to generate API Key');
    }
  };

  return (
    <div className="space-y-6 text-left select-none max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight">Organization & API Settings</h1>
        <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
          Configure company parameters, working calendar, and developer API credentials.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Core Configuration settings form */}
        <form onSubmit={handleSaveSettings} className="lg:col-span-2 p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
          <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">Company Configuration</h3>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Company Name</label>
            <input
              type="text"
              required
              value={companyName}
              onChange={(e) => setCompanyName(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Office Address</label>
            <textarea
              rows={2}
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Time Zone</label>
              <select
                value={timeZone}
                onChange={(e) => setTimeZone(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
              >
                <option value="UTC">UTC (GMT)</option>
                <option value="EST">EST (GMT-5)</option>
                <option value="PST">PST (GMT-8)</option>
                <option value="IST">IST (GMT+5:30)</option>
              </select>
            </div>

            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Base Currency</label>
              <input
                type="text"
                required
                value={currency}
                onChange={(e) => setCurrency(e.target.value)}
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Working Days (CSV format)</label>
            <input
              type="text"
              required
              value={workingDays}
              onChange={(e) => setWorkingDays(e.target.value)}
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl text-xs focus:outline-none"
            />
          </div>

          <div className="flex justify-end pt-3">
            <button
              type="submit"
              className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg"
            >
              Save Configuration
            </button>
          </div>
        </form>

        {/* Developer Keys management */}
        <div className="lg:col-span-1 space-y-6">
          <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">Provision Developer Key</h3>
            
            <form onSubmit={handleGenerateKey} className="space-y-3 text-xs">
              <input
                type="text"
                required
                placeholder="Key Name (e.g. Jenkins CI)"
                value={newKeyName}
                onChange={(e) => setNewKeyName(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl placeholder-zinc-500 focus:outline-none"
              />
              <input
                type="text"
                placeholder="Description"
                value={newKeyDesc}
                onChange={(e) => setNewKeyDesc(e.target.value)}
                className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl placeholder-zinc-500 focus:outline-none"
              />
              <button
                type="submit"
                className="w-full flex items-center justify-center space-x-1 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl font-bold shadow-md"
              >
                <Plus className="w-4 h-4" />
                <span>Generate API Key</span>
              </button>
            </form>

            {generatedKey && (
              <div className="p-3.5 bg-brand-500/10 border border-brand-500/20 text-brand-400 rounded-xl text-[10px] leading-relaxed break-all font-mono space-y-1.5 animate-pulse">
                <span className="font-bold uppercase text-[9px]">⚠️ Copy key now (displays once):</span>
                <div>{generatedKey}</div>
              </div>
            )}
          </div>

          <div className="p-5 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-4">
            <h3 className="text-xs font-bold text-zinc-400 uppercase tracking-wider border-b border-zinc-900 pb-2">Active API Keys</h3>
            <div className="space-y-2.5 max-h-48 overflow-y-auto pr-1">
              {apiKeys.map((key) => (
                <div key={key.id} className="flex justify-between items-center p-3 bg-zinc-950 border border-zinc-900 rounded-xl">
                  <div className="space-y-0.5 text-xs text-zinc-300">
                    <div className="font-bold flex items-center space-x-1.5">
                      <Key className="w-3.5 h-3.5 text-zinc-500" />
                      <span>{key.name}</span>
                    </div>
                    <div className="text-[9px] text-zinc-500">Created: {new Date(key.createdAt).toLocaleDateString()}</div>
                  </div>

                  <div className="flex items-center space-x-1.5">
                    {key.isActive ? (
                      <button
                        title="Revoke Key"
                        onClick={() => revokeApiKey(key.id)}
                        className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-500 hover:text-amber-500"
                      >
                        <Ban className="w-3.5 h-3.5" />
                      </button>
                    ) : (
                      <span className="text-[9px] font-bold text-zinc-500 px-1.5 py-0.5 bg-zinc-900 rounded-md border border-zinc-900">
                        REVOKED
                      </span>
                    )}
                    <button
                      title="Delete Key"
                      onClick={() => {
                        if (window.confirm('Delete this key record permanently?')) {
                          deleteApiKey(key.id);
                        }
                      }}
                      className="p-1 rounded bg-rose-500/10 border border-rose-500/20 text-rose-400 hover:bg-rose-500/20"
                    >
                      <Trash className="w-3.5 h-3.5" />
                    </button>
                  </div>
                </div>
              ))}
              {apiKeys.length === 0 && (
                <div className="text-center py-4 text-xs text-zinc-500 italic">No credentials configured</div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default OrganizationSettings;
