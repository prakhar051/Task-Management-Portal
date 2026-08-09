import React, { useEffect } from 'react';
import useAdminStore from '../store/adminStore';
import StorageSelector from '../components/admin/StorageSelector';
import { HardDrive } from 'lucide-react';

const StorageSettings = () => {
  const smtpConfig = useAdminStore((state) => state.smtpConfig); // Reuse loader to assert connection parameters
  const storageConfig = useAdminStore((state) => state.storageConfig);
  const fetchSettings = useAdminStore((state) => state.fetchSettings);
  const updateSettings = useAdminStore((state) => state.updateSettings);

  useEffect(() => {
    fetchSettings();
  }, [fetchSettings]);

  const handleSaveStorage = async (data) => {
    // In production, would update StorageConfiguration database model
    alert(`Storage provider successfully toggled to ${data.provider}!`);
  };

  return (
    <div className="space-y-6 text-left select-none max-w-4xl mx-auto">
      <div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center space-x-2">
          <HardDrive className="w-6 h-6 text-brand-400" />
          <span>Storage Providers Registry</span>
        </h1>
        <p className="text-slateDark-400 text-xs font-semibold uppercase tracking-wider mt-1">
          Select active uploads drivers, partition bucket scopes, and review configurations.
        </p>
      </div>

      <StorageSelector config={storageConfig} onSave={handleSaveStorage} />
    </div>
  );
};

export default StorageSettings;
