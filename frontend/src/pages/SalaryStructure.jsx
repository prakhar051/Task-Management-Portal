import React, { useEffect, useState } from 'react';
import { useSalaryStore } from '../store/salaryStore';
import { useAuthStore } from '../store/authStore';
import SalaryTable from '../components/payroll/SalaryTable';
import SalaryComponentModal from '../components/payroll/SalaryComponentModal';
import PayrollToolbar from '../components/payroll/PayrollToolbar';

export default function SalaryStructure() {
  const user = useAuthStore((state) => state.user);

  const structures = useSalaryStore((state) => state.structures);
  const loading = useSalaryStore((state) => state.loading);
  const error = useSalaryStore((state) => state.error);

  const fetchStructures = useSalaryStore((state) => state.fetchStructures);
  const createStructure = useSalaryStore((state) => state.createStructure);
  const updateStructure = useSalaryStore((state) => state.updateStructure);

  const [activeTab, setActiveTab] = useState('structures');
  const [search, setSearch] = useState('');
  const [selectedStruct, setSelectedStruct] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchStructures();
  }, [fetchStructures]);

  const handleEditClick = (struct) => {
    setSelectedStruct(struct);
    setIsModalOpen(true);
  };

  const handleCreateClick = () => {
    setSelectedStruct(null);
    setIsModalOpen(true);
  };

  const handleModalSubmit = async (employeeId, payload) => {
    let success = false;
    if (selectedStruct) {
      success = await updateStructure(employeeId, payload);
    } else {
      success = await createStructure({ employeeId, ...payload });
    }
    return success;
  };

  const filteredStructures = structures.filter((s) => {
    const fullName = `${s.employee?.firstName} ${s.employee?.lastName}`.toLowerCase();
    return fullName.includes(search.toLowerCase());
  });

  return (
    <div className="space-y-6">
      {/* Title Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 border-b border-slateDark-900 pb-4 select-none">
        <div>
          <div className="flex items-center space-x-2 text-xs font-bold text-slateDark-400 uppercase tracking-wider">
            <span>Workspace</span>
            <span>/</span>
            <span className="text-white font-mono">Salaries</span>
          </div>
          <h1 className="text-xl font-extrabold text-white mt-1">Salary Template Configurations</h1>
        </div>

        <button
          onClick={handleCreateClick}
          className="px-4.5 py-2.5 bg-brand-500 hover:bg-brand-600 border border-brand-500 hover:border-brand-600 text-white rounded-xl text-xs font-black transition-all shadow-md shadow-brand-500/10"
        >
          ➕ Assign Structure
        </button>
      </div>

      {error && (
        <div className="p-4 bg-red-500/10 border border-red-500/20 text-red-400 text-xs font-bold rounded-2xl">
          ⚠️ {error}
        </div>
      )}

      {/* Toolbar filters */}
      <PayrollToolbar
        search={search}
        onSearchChange={setSearch}
        activeTab={activeTab}
        onTabChange={(tab) => {
          if (tab === 'runs') {
            window.location.href = '/payroll';
          }
        }}
      />

      {loading ? (
        <div className="py-24 text-center text-xs text-slateDark-500 italic">
          Loading structures registries...
        </div>
      ) : (
        <SalaryTable
          structures={filteredStructures}
          onEditClick={handleEditClick}
        />
      )}

      {/* Configuration modal */}
      <SalaryComponentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        structure={selectedStruct}
        onSubmit={handleModalSubmit}
      />
    </div>
  );
}
