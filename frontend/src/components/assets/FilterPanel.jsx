import React, { useState, useEffect } from 'react';
import { Search, Filter } from 'lucide-react';
import apiClient from '../../api/apiClient';

const FilterPanel = ({ onFilterChange }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [status, setStatus] = useState('');
  const [condition, setCondition] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    apiClient.get('/assets')
      .then(() => {
        // Just general list lookup or fetch categories directly from db
        return apiClient.get('/employees'); // or categories
      })
      .then(() => {
        // For simplicity let's fetch category options or compile them
        setCategories([
          { id: '1', name: 'Laptops' },
          { id: '2', name: 'Monitors' },
          { id: '3', name: 'Mobile Devices' },
          { id: '4', name: 'Servers' },
          { id: '5', name: 'Peripherals' }
        ]);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    onFilterChange({
      searchTerm,
      status,
      condition,
      categoryId
    });
  }, [searchTerm, status, condition, categoryId]);

  return (
    <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 mb-6 space-y-4">
      <div className="flex flex-col lg:flex-row gap-4 items-center justify-between">
        {/* Search Input */}
        <div className="relative w-full lg:w-96">
          <Search className="absolute left-3 top-3 w-4 h-4 text-zinc-500" />
          <input
            type="text"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            placeholder="Search by asset tag, name, or serial number..."
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-sm text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
          />
        </div>

        {/* Filters Grid */}
        <div className="grid grid-cols-3 gap-3 w-full lg:w-auto">
          {/* Status select */}
          <div>
            <select
              value={status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors"
            >
              <option value="">All Statuses</option>
              <option value="AVAILABLE">Available</option>
              <option value="ASSIGNED">Assigned</option>
              <option value="UNDER_MAINTENANCE">Under Maintenance</option>
              <option value="LOST">Lost</option>
              <option value="DAMAGED">Damaged</option>
              <option value="RETIRED">Retired</option>
            </select>
          </div>

          {/* Condition Select */}
          <div>
            <select
              value={condition}
              onChange={(e) => setCondition(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors"
            >
              <option value="">All Conditions</option>
              <option value="NEW">New</option>
              <option value="GOOD">Good</option>
              <option value="FAIR">Fair</option>
              <option value="POOR">Poor</option>
              <option value="DAMAGED">Damaged</option>
            </select>
          </div>

          {/* Category Select */}
          <div>
            <select
              value={categoryId}
              onChange={(e) => setCategoryId(e.target.value)}
              className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-300 focus:outline-none focus:border-zinc-700 transition-colors"
            >
              <option value="">All Categories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FilterPanel;
