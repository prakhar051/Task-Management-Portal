import React, { useState } from 'react';
import { HardDrive, Cloud, ShieldAlert } from 'lucide-react';

const StorageSelector = ({ config, onSave }) => {
  const [provider, setProvider] = useState(config?.provider || 'LOCAL');
  const [awsKey, setAwsKey] = useState('');
  const [awsSecret, setAwsSecret] = useState('');
  const [bucket, setBucket] = useState('');

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave({
      provider,
      awsKey,
      awsSecret,
      bucket
    });
  };

  return (
    <form onSubmit={handleSubmit} className="p-6 bg-zinc-950/40 border border-zinc-900 rounded-2xl space-y-6 select-none text-left">
      <div className="space-y-1">
        <h3 className="text-sm font-bold text-white">Storage Provider Configuration</h3>
        <p className="text-[10px] text-zinc-500 font-semibold uppercase">Decoupled upload drivers settings</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Local Storage */}
        <div
          onClick={() => setProvider('LOCAL')}
          className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
            provider === 'LOCAL'
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
          }`}
        >
          <HardDrive className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold">Local FileSystem</h4>
            <p className="text-[9px] text-zinc-500">Store on local backend disk</p>
          </div>
        </div>

        {/* AWS S3 */}
        <div
          onClick={() => setProvider('S3')}
          className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
            provider === 'S3'
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
          }`}
        >
          <Cloud className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold">Amazon S3</h4>
            <p className="text-[9px] text-zinc-500">Decoupled AWS cloud drive</p>
          </div>
        </div>

        {/* Azure Blob */}
        <div
          onClick={() => setProvider('AZURE')}
          className={`flex items-center space-x-3 p-4 rounded-xl border cursor-pointer transition-all ${
            provider === 'AZURE'
              ? 'bg-brand-500/10 border-brand-500/30 text-brand-400'
              : 'bg-zinc-950 border-zinc-900 text-zinc-500 hover:text-white'
          }`}
        >
          <Cloud className="w-5 h-5 shrink-0" />
          <div>
            <h4 className="text-xs font-bold">Azure Blob</h4>
            <p className="text-[9px] text-zinc-500">Microsoft cloud files storage</p>
          </div>
        </div>
      </div>

      {provider !== 'LOCAL' && (
        <div className="p-4 bg-zinc-900 border border-zinc-800 rounded-xl space-y-4 animate-fade-in text-xs">
          <div className="flex items-start space-x-2 text-amber-500 select-none">
            <ShieldAlert className="w-4 h-4 shrink-0 mt-0.5" />
            <span className="text-[10px] font-semibold uppercase">Cloud storage provider keys will be encrypted before storage</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Access Key ID</label>
              <input
                type="text"
                required
                value={awsKey}
                onChange={(e) => setAwsKey(e.target.value)}
                placeholder="e.g. AKIAIOSFODNN7EXAMPLE"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl focus:outline-none"
              />
            </div>
            <div className="space-y-1">
              <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Secret Access Key</label>
              <input
                type="password"
                required
                value={awsSecret}
                onChange={(e) => setAwsSecret(e.target.value)}
                placeholder="Encrypted password credentials"
                className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl focus:outline-none"
              />
            </div>
          </div>

          <div className="space-y-1">
            <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wider">Bucket Name / Storage Container</label>
            <input
              type="text"
              required
              value={bucket}
              onChange={(e) => setBucket(e.target.value)}
              placeholder="e.g. taskportal-documents-bucket"
              className="w-full px-4 py-3 bg-zinc-950 border border-zinc-900 focus:border-brand-500 text-white rounded-xl focus:outline-none"
            />
          </div>
        </div>
      )}

      <div className="flex justify-end">
        <button
          type="submit"
          className="px-5 py-2.5 bg-brand-600 hover:bg-brand-500 text-white rounded-xl text-xs font-bold shadow-lg transition-all"
        >
          Save Storage Parameters
        </button>
      </div>
    </form>
  );
};

export default StorageSelector;
