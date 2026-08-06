import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import useAssetStore from '../store/assetStore';
import QRGenerator from '../components/assets/QRGenerator';
import BarcodeViewer from '../components/assets/BarcodeViewer';
import WarrantyCard from '../components/assets/WarrantyCard';
import DepreciationChart from '../components/assets/DepreciationChart';
import AssetTimeline from '../components/assets/AssetTimeline';
import ReturnDialog from '../components/assets/ReturnDialog';
import { ArrowLeft, RefreshCw, Calendar, Tag, ShieldAlert, BadgeInfo } from 'lucide-react';

const AssetDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { selectedAsset, fetchAssetById, calculateDepreciation, returnAsset, loading, error } = useAssetStore();

  const [isReturnOpen, setIsReturnOpen] = useState(false);
  const [depMethod, setDepMethod] = useState('STRAIGHT_LINE');
  const [depMonths, setDepMonths] = useState(12);
  const [calculating, setCalculating] = useState(false);

  useEffect(() => {
    fetchAssetById(id);
  }, [id]);

  if (loading && !selectedAsset) {
    return (
      <div className="p-6 text-center text-zinc-500 font-medium">
        Loading asset specifications...
      </div>
    );
  }

  if (!selectedAsset) {
    return (
      <div className="p-6 text-center text-zinc-400">
        Asset record not found.
      </div>
    );
  }

  const handleCalculateDep = async () => {
    setCalculating(true);
    try {
      await calculateDepreciation({
        assetId: selectedAsset.id,
        method: depMethod,
        months: parseInt(depMonths) || 12
      });
    } catch (e) {
      alert('Depreciation calculations failed: ' + e.message);
    } finally {
      setCalculating(false);
    }
  };

  return (
    <div className="p-6 space-y-6">
      {/* Header bar */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/assets')}
          className="flex items-center space-x-2 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Back to catalogue</span>
        </button>

        {selectedAsset.status === 'ASSIGNED' && (
          <button
            onClick={() => setIsReturnOpen(true)}
            className="px-4 py-2 text-xs font-bold rounded-lg bg-rose-500 hover:bg-rose-600 text-white transition-colors"
          >
            Register Return
          </button>
        )}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Basic Details */}
        <div className="lg:col-span-2 space-y-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6">
            <div className="flex items-center justify-between border-b border-zinc-850 pb-4 mb-6">
              <div>
                <span className="text-xs font-semibold text-zinc-500 font-mono">[{selectedAsset.tag}]</span>
                <h1 className="text-xl font-bold text-zinc-100 mt-1">{selectedAsset.name}</h1>
              </div>
              <span className={`px-2.5 py-1 text-xs font-semibold rounded-full border ${
                selectedAsset.status === 'AVAILABLE' ? 'bg-emerald-500/10 text-emerald-400 border-emerald-500/20' :
                selectedAsset.status === 'ASSIGNED' ? 'bg-blue-500/10 text-blue-400 border-blue-500/20' :
                'bg-amber-500/10 text-amber-400 border-amber-500/20'
              }`}>
                {selectedAsset.status}
              </span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6 text-sm">
              <div>
                <span className="text-zinc-500 block mb-1">Serial Number</span>
                <span className="font-mono text-zinc-200 font-semibold">{selectedAsset.serialNumber || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Purchase Price</span>
                <span className="text-zinc-200 font-semibold">${selectedAsset.purchasePrice.toLocaleString()}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Location Room</span>
                <span className="text-zinc-200 font-semibold">{selectedAsset.location || 'N/A'}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Useful Life</span>
                <span className="text-zinc-200 font-semibold">{selectedAsset.usefulLifeYears} Years</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Salvage Value</span>
                <span className="text-zinc-200 font-semibold">${selectedAsset.salvageValue}</span>
              </div>
              <div>
                <span className="text-zinc-500 block mb-1">Purchase Date</span>
                <span className="text-zinc-200 font-semibold">{new Date(selectedAsset.purchaseDate).toLocaleDateString()}</span>
              </div>
            </div>

            {selectedAsset.description && (
              <div className="mt-6 pt-6 border-t border-zinc-850">
                <span className="text-zinc-500 text-xs font-semibold uppercase block mb-2">Description</span>
                <p className="text-zinc-300 text-sm leading-relaxed">{selectedAsset.description}</p>
              </div>
            )}
          </div>

          {/* Depreciation Calculator Form & Chart */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <DepreciationChart records={selectedAsset.depreciationRecords} purchasePrice={selectedAsset.purchasePrice} />

            <div className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 flex flex-col justify-between">
              <div>
                <h3 className="text-xs font-semibold text-zinc-500 uppercase tracking-wider mb-4">Depreciation Calculator</h3>
                <p className="text-xs text-zinc-400 mb-4">Calculate straight-line drops or declining book balances over specified month spans.</p>

                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Method</label>
                    <select
                      value={depMethod}
                      onChange={(e) => setDepMethod(e.target.value)}
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-200 focus:outline-none"
                    >
                      <option value="STRAIGHT_LINE">Straight Line Method</option>
                      <option value="DECLINING_BALANCE">Double-Declining Balance</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-[11px] font-semibold text-zinc-400 uppercase mb-1">Duration (Months)</label>
                    <input
                      type="number"
                      value={depMonths}
                      onChange={(e) => setDepMonths(e.target.value)}
                      min="1"
                      className="w-full px-3 py-2 bg-zinc-950 border border-zinc-850 rounded-lg text-xs text-zinc-200 focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <button
                onClick={handleCalculateDep}
                disabled={calculating}
                className="mt-6 w-full flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-500 hover:bg-emerald-600 disabled:opacity-55 text-white text-xs font-bold rounded-lg transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${calculating ? 'animate-spin' : ''}`} />
                <span>{calculating ? 'Calculating...' : 'Run Calculations'}</span>
              </button>
            </div>
          </div>

          <AssetTimeline history={selectedAsset.history} />
        </div>

        {/* Sidebar codes & warranty */}
        <div className="space-y-6">
          <QRGenerator tag={selectedAsset.tag} />
          <BarcodeViewer tag={selectedAsset.tag} />
          <WarrantyCard expiryDate={selectedAsset.warrantyExpiry} />
        </div>
      </div>

      {isReturnOpen && (
        <ReturnDialog
          isOpen={true}
          onClose={() => setIsReturnOpen(false)}
          asset={selectedAsset}
          onReturn={async (assignId, data) => {
            await returnAsset(assignId, data);
            await fetchAssetById(id);
          }}
        />
      )}
    </div>
  );
};

export default AssetDetails;
