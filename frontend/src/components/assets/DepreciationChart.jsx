import React from 'react';

const DepreciationChart = ({ records = [], purchasePrice }) => {
  if (records.length === 0) {
    return (
      <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 text-center text-zinc-500 italic">
        No depreciation calculation logs compiled yet.
      </div>
    );
  }

  // Prepend purchase price as starting point
  const points = [
    { label: 'Start', bookValue: purchasePrice },
    ...[...records].reverse().map((r, i) => ({
      label: `Month ${i + 1}`,
      bookValue: r.bookValue
    }))
  ];

  const maxVal = purchasePrice || 100;
  const height = 140;
  const width = 400;

  // Generate SVG path coordinates
  const coordPoints = points.map((p, index) => {
    const x = (index / (points.length - 1)) * (width - 40) + 20;
    const y = height - (p.bookValue / maxVal) * (height - 30) - 15;
    return { x, y, label: p.label, val: p.bookValue };
  });

  const pathD = coordPoints.reduce((acc, p, index) => {
    return acc + `${index === 0 ? 'M' : 'L'} ${p.x} ${p.y} `;
  }, '');

  // Fill path for gradient area underneath
  const fillD = pathD + `L ${coordPoints[coordPoints.length - 1].x} ${height - 15} L ${coordPoints[0].x} ${height - 15} Z`;

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
      <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Book Value Depreciation Trend</h3>
      <div className="relative">
        <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto overflow-visible">
          <defs>
            <linearGradient id="depArea" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="#10b981" stopOpacity="0.25" />
              <stop offset="100%" stopColor="#10b981" stopOpacity="0.0" />
            </linearGradient>
          </defs>

          {/* Grid lines */}
          <line x1="20" y1="15" x2={width - 20} y2="15" stroke="#27272a" strokeDasharray="3,3" />
          <line x1="20" y1={height / 2} x2={width - 20} y2={height / 2} stroke="#27272a" strokeDasharray="3,3" />
          <line x1="20" y1={height - 15} x2={width - 20} y2={height - 15} stroke="#3f3f46" />

          {/* Area under line */}
          <path d={fillD} fill="url(#depArea)" />

          {/* Trend line */}
          <path d={pathD} fill="none" stroke="#10b981" strokeWidth="2.5" strokeLinecap="round" />

          {/* Circle markers */}
          {coordPoints.map((p, i) => (
            <g key={i} className="group cursor-pointer">
              <circle cx={p.x} cy={p.y} r="4" fill="#09090b" stroke="#10b981" strokeWidth="2" />
              <text
                x={p.x}
                y={p.y - 10}
                textAnchor="middle"
                className="text-[9px] fill-zinc-300 font-bold opacity-0 group-hover:opacity-100 transition-opacity font-mono"
              >
                ${Math.round(p.val)}
              </text>
            </g>
          ))}
        </svg>
      </div>

      <div className="mt-4 grid grid-cols-2 gap-4 text-xs">
        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg">
          <span className="text-zinc-500 block">Initial Cost</span>
          <strong className="text-sm text-zinc-200 font-mono">${purchasePrice.toLocaleString()}</strong>
        </div>
        <div className="p-3 bg-zinc-950 border border-zinc-850 rounded-lg">
          <span className="text-zinc-500 block">Current Book Value</span>
          <strong className="text-sm text-emerald-400 font-mono">
            ${Math.round(coordPoints[coordPoints.length - 1]?.val || purchasePrice).toLocaleString()}
          </strong>
        </div>
      </div>
    </div>
  );
};

export default DepreciationChart;
