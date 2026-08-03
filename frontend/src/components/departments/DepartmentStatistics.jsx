import React from 'react';
import { motion } from 'framer-motion';
import { useDepartmentStore } from '../../store/departmentStore';

export default function DepartmentStatistics() {
  const { statistics } = useDepartmentStore();

  if (!statistics) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const statItems = [
    {
      title: 'Total Departments',
      value: statistics.totalDepartments,
      icon: '🏢',
      subtext: `${statistics.activeDepartments} Active / ${statistics.inactiveDepartments} Inactive`,
      borderColor: 'border-brand-500/20',
      bgColor: 'bg-brand-500/5',
      iconColor: 'text-brand-400'
    },
    {
      title: 'Total Workforce',
      value: statistics.totalEmployees,
      icon: '👥',
      subtext: `${statistics.activeEmployees} Active / Avg ${statistics.averageEmployeesPerDepartment} per Dept`,
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-500/5',
      iconColor: 'text-emerald-400'
    },
    {
      title: 'Manager Assigned',
      value: `${statistics.managerAssigned}/${statistics.totalDepartments}`,
      icon: '👤',
      subtext: `${statistics.departmentsWithoutManagers} Depts lacking Managers`,
      borderColor: 'border-amber-500/20',
      bgColor: 'bg-amber-500/5',
      iconColor: 'text-amber-400'
    },
    {
      title: 'Roster Scale',
      value: statistics.openPositions,
      icon: '🎯',
      subtext: `Largest: ${statistics.largestDepartment}`,
      borderColor: 'border-indigo-500/20',
      bgColor: 'bg-indigo-500/5',
      iconColor: 'text-indigo-400'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 select-none">
      {statItems.map((item, index) => (
        <motion.div
          key={index}
          variants={cardVariants}
          initial="hidden"
          animate="visible"
          whileHover={{ scale: 1.02 }}
          className={`glass p-6 rounded-2xl border ${item.borderColor} flex items-start space-x-4 relative overflow-hidden transition-all shadow-md`}
        >
          {/* Subtle light streak */}
          <div className={`absolute -right-6 -bottom-6 w-20 h-20 ${item.bgColor} rounded-full blur-2xl`} />

          <div className="text-3xl p-3 bg-slateDark-900 rounded-xl border border-slateDark-800 shadow-inner">
            {item.icon}
          </div>
          
          <div className="space-y-1">
            <span className="text-xs font-semibold text-slateDark-400 uppercase tracking-wider block">
              {item.title}
            </span>
            <span className="text-2xl font-black text-white block tracking-tight">
              {item.value}
            </span>
            <span className="text-[11px] font-semibold text-slateDark-500 block truncate max-w-[180px]">
              {item.subtext}
            </span>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
