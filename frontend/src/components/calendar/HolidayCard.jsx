import React, { useState, useEffect } from 'react';
import { apiClient } from '../../api/apiClient';

export default function HolidayCard() {
  const [holidays, setHolidays] = useState([]);

  useEffect(() => {
    const fetchHolidays = async () => {
      try {
        const response = await apiClient.get('/calendar');
        if (response.data.success) {
          const allEvents = response.data.data || [];
          const list = allEvents.filter((ev) => ev.type === 'HOLIDAY');
          
          // Deduplicate by title/date
          const uniqueList = [];
          const seen = new Set();
          list.forEach((h) => {
            const key = `${h.title}_${h.startDate.split('T')[0]}`;
            if (!seen.has(key)) {
              seen.add(key);
              uniqueList.push(h);
            }
          });

          setHolidays(uniqueList.slice(0, 5));
        }
      } catch (err) {
        console.error('Failed to load holidays', err);
      }
    };
    fetchHolidays();
  }, []);

  return (
    <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-2xl p-4.5 space-y-4 shadow-lg select-none">
      <h3 className="text-xs font-black uppercase text-slateDark-400 tracking-wider">
        🎉 Public Holidays
      </h3>
      <div className="space-y-3">
        {holidays.map((h) => (
          <div key={h.id} className="flex justify-between items-center text-[10.5px]">
            <span className="font-bold text-white truncate max-w-[140px]" title={h.title}>
              {h.title}
            </span>
            <span className="font-mono text-slateDark-500 font-semibold">
              {new Date(h.startDate).toLocaleDateString([], { month: 'short', day: 'numeric' })}
            </span>
          </div>
        ))}

        {holidays.length === 0 && (
          <p className="text-[10px] text-slateDark-600 italic text-center py-2">
            No public holidays scheduled
          </p>
        )}
      </div>
    </div>
  );
}
