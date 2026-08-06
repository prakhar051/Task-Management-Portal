import React, { useState, useEffect } from 'react';
import useAssetStore from '../store/assetStore';
import useVendorStore from '../store/vendorStore';
import AssetToolbar from '../components/assets/AssetToolbar';
import FilterPanel from '../components/assets/FilterPanel';
import AssetTable from '../components/assets/AssetTable';
import AssetCard from '../components/assets/AssetCard';
import AssignmentDialog from '../components/assets/AssignmentDialog';
import TransferDialog from '../components/assets/TransferDialog';
import MaintenanceDialog from '../components/assets/MaintenanceDialog';
import ReturnDialog from '../components/assets/ReturnDialog';
import { Tag, Hammer, HelpCircle, ShieldAlert, Award, Layers, Plus, FileText, CheckCircle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import apiClient from '../api/apiClient';

const Assets = () => {
  const navigate = useNavigate();
  const { assets, fetchAssets, createAsset, assignAsset, returnAsset, transferAsset, loading, error } = useAssetStore();
  const { vendors, fetchVendors } = useVendorStore();

  const [activeTab, setActiveTab] = useState('inventory');
  const [filteredAssets, setFilteredAssets] = useState([]);
  const [isCreateOpen, setIsCreateOpen] = useState(false);

  // Dialog anchors
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [dialogType, setDialogType] = useState(null); // 'assign', 'transfer', 'return', 'maintenance'

  // Creation form states
  const [name, setName] = useState('');
  const [tag, setTag] = useState('');
  const [categoryId, setCategoryId] = useState('1'); // Laptop category id mock or active
  const [vendorId, setVendorId] = useState('');
  const [purchasePrice, setPurchasePrice] = useState('');
  const [salvageValue, setSalvageValue] = useState('0');
  const [usefulLifeYears, setUsefulLifeYears] = useState('5');
  const [purchaseDate, setPurchaseDate] = useState('');
  const [warrantyExpiry, setWarrantyExpiry] = useState('');
  const [location, setLocation] = useState('');
  const [description, setDescription] = useState('');

  useEffect(() => {
    fetchAssets();
    fetchVendors();
  }, []);

  useEffect(() => {
    setFilteredAssets(assets);
  }, [assets]);

  const handleFilterChange = (filters) => {
    const { searchTerm, status, condition, categoryId } = filters;
    let temp = [...assets];

    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      temp = temp.filter(
        (a) =>
          a.tag.toLowerCase().includes(term) ||
          a.name.toLowerCase().includes(term) ||
          a.serialNumber?.toLowerCase().includes(term)
      );
    }
    if (status) {
      temp = temp.filter((a) => a.status === status);
    }
    if (condition) {
      temp = temp.filter((a) => a.condition === condition);
    }
    setFilteredAssets(temp);
  };

  const handleCreateSubmit = async (e) => {
    e.preventDefault();
    try {
      await createAsset({
        name,
        tag,
        categoryId,
        vendorId: vendorId || null,
        purchasePrice: parseFloat(purchasePrice) || 0.0,
        salvageValue: parseFloat(salvageValue) || 0.0,
        usefulLifeYears: parseInt(usefulLifeYears) || 5,
        purchaseDate: new Date(purchaseDate).toISOString(),
        warrantyExpiry: warrantyExpiry ? new Date(warrantyExpiry).toISOString() : null,
        location,
        description
      });
      setIsCreateOpen(false);
      setName('');
      setTag('');
      setPurchasePrice('');
      setPurchaseDate('');
      setWarrantyExpiry('');
    } catch (err) {}
  };

  // Compute metrics
  const totalAssetsCount = assets.length;
  const assignedCount = assets.filter((a) => a.status === 'ASSIGNED').length;
  const availableCount = assets.filter((a) => a.status === 'AVAILABLE').length;
  const underMaintenanceCount = assets.filter((a) => a.status === 'UNDER_MAINTENANCE').length;
  const totalValue = assets.reduce((acc, a) => acc + a.purchasePrice, 0);

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Asset & Inventory Registry</h1>
          <p className="text-sm text-zinc-400">Track and calculate double-declining value depreciation for corporate hardware inventory.</p>
        </div>
        <button
          onClick={() => setIsCreateOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-lg shadow-emerald-500/10 transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Register Asset</span>
        </button>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <AssetCard title="Total Inventory Assets" value={totalAssetsCount} icon={Tag} description="Registered catalogue count" />
        <AssetCard title="Assigned Hardware" value={assignedCount} icon={Award} description="Currently linked to personnel" trendColor="text-blue-400" />
        <AssetCard title="Available Stock" value={availableCount} icon={CheckCircle} description="Ready for employee allocation" trendColor="text-emerald-400" />
        <AssetCard title="In Repairs / Diagnostics" value={underMaintenanceCount} icon={Hammer} description="Currently under maintenance" trendColor="text-rose-400" />
      </div>

      <AssetToolbar activeTab={activeTab} onTabChange={(tab) => {
        if (tab === 'maintenance') navigate('/maintenance');
        else if (tab === 'vendors') navigate('/vendors');
        else setActiveTab(tab);
      }} />

      {activeTab === 'inventory' && (
        <>
          <FilterPanel onFilterChange={handleFilterChange} />

          <AssetTable
            assets={filteredAssets}
            onViewDetails={(id) => navigate(`/assets/${id}`)}
            onAssign={(a) => {
              setSelectedAsset(a);
              setDialogType('assign');
            }}
            onTransfer={(a) => {
              setSelectedAsset(a);
              setDialogType('transfer');
            }}
            onMaintenance={(a) => {
              setSelectedAsset(a);
              setDialogType('maintenance');
            }}
          />
        </>
      )}

      {/* Creation Modal */}
      {isCreateOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-lg bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">Register New Asset</h2>
              <button
                onClick={() => setIsCreateOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <Plus className="w-5 h-5 rotate-45" />
              </button>
            </div>

            <form onSubmit={handleCreateSubmit} className="p-6 space-y-4 max-h-[75vh] overflow-y-auto">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Asset Tag (Code)</label>
                  <input
                    type="text"
                    value={tag}
                    onChange={(e) => setTag(e.target.value)}
                    placeholder="e.g. AST-LAP-001"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Asset Name</label>
                  <input
                    type="text"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Dell XPS 15"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Purchase Price ($)</label>
                  <input
                    type="number"
                    value={purchasePrice}
                    onChange={(e) => setPurchasePrice(e.target.value)}
                    placeholder="2500"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Salvage Value ($)</label>
                  <input
                    type="number"
                    value={salvageValue}
                    onChange={(e) => setSalvageValue(e.target.value)}
                    placeholder="500"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Useful Life (Years)</label>
                  <input
                    type="number"
                    value={usefulLifeYears}
                    onChange={(e) => setUsefulLifeYears(e.target.value)}
                    placeholder="5"
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Purchase Date</label>
                  <input
                    type="date"
                    value={purchaseDate}
                    onChange={(e) => setPurchaseDate(e.target.value)}
                    required
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Warranty Expiration</label>
                  <input
                    type="date"
                    value={warrantyExpiry}
                    onChange={(e) => setWarrantyExpiry(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Vendor Profile</label>
                  <select
                    value={vendorId}
                    onChange={(e) => setVendorId(e.target.value)}
                    className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                  >
                    <option value="">-- Choose Vendor Partner --</option>
                    {vendors.map((v) => (
                      <option key={v.id} value={v.id}>
                        {v.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Office Room Location</label>
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="e.g. Cabinet C Floor 4, HR Suite"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Technical Description</label>
                <textarea
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  rows="3"
                  placeholder="State device details like storage specs, processor benchmarks..."
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsCreateOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors animate-pulse"
                >
                  Create Asset
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Dialog triggers */}
      {dialogType === 'assign' && selectedAsset && (
        <AssignmentDialog
          isOpen={true}
          onClose={() => {
            setSelectedAsset(null);
            setDialogType(null);
          }}
          asset={selectedAsset}
          onAssign={assignAsset}
        />
      )}

      {dialogType === 'transfer' && selectedAsset && (
        <TransferDialog
          isOpen={true}
          onClose={() => {
            setSelectedAsset(null);
            setDialogType(null);
          }}
          asset={selectedAsset}
          onTransfer={transferAsset}
        />
      )}

      {dialogType === 'maintenance' && selectedAsset && (
        <MaintenanceDialog
          isOpen={true}
          onClose={() => {
            setSelectedAsset(null);
            setDialogType(null);
          }}
          asset={selectedAsset}
          onSchedule={async (data) => {
            await apiClient.post('/maintenance', data);
            await fetchAssets();
          }}
        />
      )}
    </div>
  );
};

export default Assets;
