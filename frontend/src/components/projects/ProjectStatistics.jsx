import React from 'react';
import { motion } from 'framer-motion';
import { useProjectStore } from '../../store/projectStore';

export default function ProjectStatistics() {
  const { statistics } = useProjectStore();

  if (!statistics) return null;

  const cardVariants = {
    hidden: { opacity: 0, y: 15 },
    visible: { opacity: 1, y: 0, transition: { duration: 0.4 } }
  };

  const statItems = [
    {
      title: 'Total Projects',
      value: statistics.totalProjects,
      icon: '📂',
      subtext: `${statistics.activeProjects} Active / ${statistics.completedProjects} Done`,
      borderColor: 'border-brand-500/20',
      bgColor: 'bg-brand-500/5'
    },
    {
      title: 'Average Progress',
      value: `${statistics.averageProgress}%`,
      icon: '📈',
      subtext: `Avg Duration: ${statistics.averageDuration} Days`,
      borderColor: 'border-emerald-500/20',
      bgColor: 'bg-emerald-500/5'
    },
    {
      title: 'Alert Status',
      value: statistics.overdueProjects,
      icon: '⚠️',
      subtext: `Overdue / Ending 7d: ${statistics.endingWithin7Days}`,
      borderColor: 'border-rose-500/20',
      bgColor: 'bg-rose-500/5'
    },
    {
      title: 'Workforce allocated',
      value: statistics.totalMembers,
      icon: '👥',
      subtext: `Planning: ${statistics.statusDistribution?.PLANNING || 0} / Hold: ${statistics.statusDistribution?.ON_HOLD || 0}`,
      borderColor: 'border-indigo-500/20',
      bgColor: 'bg-indigo-500/5'
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
          {/* Light glow pattern */}
          <div className={`absolute -right-6 -bottom-6 w-20 h-20 ${item.bgColor} rounded-full blur-2xl`} />

          <div className="text-3xl p-3 bg-slateDark-900 rounded-xl border border-slateDark-800 shadow-inner">
            {item.icon}
          </div>

          <div className="space-y-1 z-10">
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
