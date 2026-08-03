import React from 'react';
import { motion } from 'framer-motion';

export default function ChartCard({ title, subtitle, children, actions }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      className="p-5 bg-slateDark-950/40 border border-slateDark-900/60 rounded-2xl flex flex-col space-y-4 shadow-lg shadow-slateDark-950/20 backdrop-blur-md min-h-[300px]"
    >
      <div className="flex items-center justify-between border-b border-slateDark-900/60 pb-3 select-none">
        <div>
          <h3 className="font-extrabold text-white text-sm tracking-wide">{title}</h3>
          {subtitle && <p className="text-[10px] text-slateDark-500 font-semibold">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center space-x-2">{actions}</div>}
      </div>
      <div className="flex-1 w-full relative">
        {children}
      </div>
    </motion.div>
  );
}
