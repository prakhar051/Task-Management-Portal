import React from 'react';
import { motion } from 'framer-motion';

export default function KpiCard({ title, value, icon, colorClass = 'text-brand-400', subtext }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -4, scale: 1.01 }}
      className="p-5 bg-slateDark-950/40 border border-slateDark-900/60 rounded-2xl flex items-center justify-between shadow-lg shadow-slateDark-950/20 backdrop-blur-md select-none"
    >
      <div className="space-y-1.5 min-w-0">
        <span className="text-[10px] font-extrabold uppercase tracking-wider text-slateDark-500 block">
          {title}
        </span>
        <h3 className="text-2xl font-black text-white leading-none tracking-tight">
          {value !== undefined && value !== null ? value : '--'}
        </h3>
        {subtext && (
          <p className="text-[10px] text-slateDark-400 font-semibold truncate leading-tight pt-0.5">
            {subtext}
          </p>
        )}
      </div>
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center bg-slateDark-900 border border-slateDark-800 text-lg flex-shrink-0 ${colorClass}`}>
        {icon}
      </div>
    </motion.div>
  );
}
