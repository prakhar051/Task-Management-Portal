import React from 'react';
import { Barcode, Download } from 'lucide-react';

const BarcodeViewer = ({ tag }) => {
  const barcodeUrl = `https://barcode.tec-it.com/barcode.ashx?data=${encodeURIComponent(tag)}`;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col items-center justify-center text-center">
      <span className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Inventory Barcode</span>
      <div className="p-4 bg-white rounded-xl shadow-lg border border-zinc-200 flex items-center justify-center min-h-[90px] w-full max-w-[240px]">
        <img
          src={barcodeUrl}
          alt={`Barcode for ${tag}`}
          className="h-14 w-auto object-contain select-none"
          loading="lazy"
        />
      </div>
      <span className="mt-3 text-xs font-mono font-bold text-zinc-300 bg-zinc-950 px-2.5 py-1 rounded border border-zinc-800">
        {tag}
      </span>
      <a
        href={barcodeUrl}
        target="_blank"
        rel="noopener noreferrer"
        download={`BAR_${tag}.png`}
        className="mt-4 flex items-center space-x-2 text-xs font-semibold text-zinc-400 hover:text-white transition-colors"
      >
        <Download className="w-4 h-4" />
        <span>Open Barcode PNG</span>
      </a>
    </div>
  );
};

export default BarcodeViewer;
