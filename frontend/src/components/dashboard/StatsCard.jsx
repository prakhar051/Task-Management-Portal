import React from 'react';
import { motion } from 'framer-motion';

export default function StatsCard({ title, value, change, icon, color }) {
  return (
    <motion.div
      whileHover={{ y: -4, scale: 1.01 }}
      transition={{ duration: 0.2 }}
      className="glass rounded-xl p-6 relative overflow-hidden group border border-slateDark-800"
    >
      {/* Decorative radial card hover highlights */}
      <div className="absolute -right-4 -bottom-4 w-24 h-24 bg-brand-500/5 rounded-full blur-2xl group-hover:bg-brand-500/10 transition-all duration-300" />

      <div className="flex items-center justify-between mb-4 relative z-10">
        <span className="text-slateDark-400 text-sm font-semibold tracking-wide">{title}</span>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center text-lg shadow-sm ${color}`}>
          {icon}
        </div>
      </div>

      <div className="text-3xl font-extrabold text-white mb-2 tracking-tight relative z-10">
        {value}
      </div>

      {change && (
        <div className="text-xs text-slateDark-400 flex items-center space-x-1 relative z-10">
          <span className="text-emerald-400 font-bold">↑</span>
          <span>{change}</span>
        </div>
      )}
    </motion.div>
  );
}
