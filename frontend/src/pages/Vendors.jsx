import React, { useEffect, useState } from 'react';
import useVendorStore from '../store/vendorStore';
import AssetToolbar from '../components/assets/AssetToolbar';
import { Truck, Plus, Mail, Phone, MapPin, X } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

const Vendors = () => {
  const navigate = useNavigate();
  const { vendors, fetchVendors, createVendor, loading } = useVendorStore();
  const [activeTab, setActiveTab] = useState('vendors');
  const [isOpen, setIsOpen] = useState(false);

  // Form states
  const [name, setName] = useState('');
  const [contactName, setContactName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [address, setAddress] = useState('');

  useEffect(() => {
    fetchVendors();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createVendor({ name, contactName, email, phone, address });
      setIsOpen(false);
      setName('');
      setContactName('');
      setEmail('');
      setPhone('');
      setAddress('');
    } catch (e) {}
  };

  return (
    <div className="p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-zinc-100">Vendors Directory</h1>
          <p className="text-sm text-zinc-400">Manage device suppliers and procurement contacts.</p>
        </div>
        <button
          onClick={() => setIsOpen(true)}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-600 text-white text-sm font-semibold rounded-lg shadow-lg transition-colors"
        >
          <Plus className="w-4 h-4" />
          <span>Add Vendor</span>
        </button>
      </div>

      <AssetToolbar activeTab={activeTab} onTabChange={(tab) => {
        if (tab === 'inventory') navigate('/assets');
        else if (tab === 'maintenance') navigate('/maintenance');
        else setActiveTab(tab);
      }} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {vendors.map((v) => (
          <div key={v.id} className="bg-zinc-900 border border-zinc-800 rounded-xl p-6 space-y-4">
            <div className="flex items-start justify-between">
              <div>
                <h3 className="text-lg font-bold text-zinc-100">{v.name}</h3>
                <span className="text-xs text-zinc-500 font-medium">Contact: {v.contactName || 'N/A'}</span>
              </div>
              <div className="p-2.5 bg-zinc-800 rounded-lg text-zinc-300">
                <Truck className="w-5 h-5" />
              </div>
            </div>

            <div className="space-y-2.5 text-sm text-zinc-400 pt-2 border-t border-zinc-850">
              <div className="flex items-center space-x-2">
                <Mail className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">{v.email || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <Phone className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300">{v.phone || 'N/A'}</span>
              </div>
              <div className="flex items-center space-x-2">
                <MapPin className="w-4 h-4 text-zinc-500" />
                <span className="text-zinc-300 truncate">{v.address || 'N/A'}</span>
              </div>
            </div>
          </div>
        ))}
        {vendors.length === 0 && (
          <div className="col-span-full py-12 text-center text-zinc-500 italic">
            No vendors registered in the directory.
          </div>
        )}
      </div>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <div className="w-full max-w-md bg-zinc-900 border border-zinc-800 rounded-xl overflow-hidden shadow-2xl animate-in fade-in zoom-in duration-200">
            <div className="flex items-center justify-between px-6 py-4 border-b border-zinc-800">
              <h2 className="text-lg font-bold text-zinc-100">Add Vendor Partner</h2>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1 rounded-lg text-zinc-400 hover:bg-zinc-800 hover:text-white transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="p-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Company Name</label>
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="e.g. Acme Tech Corp"
                  required
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Contact Person</label>
                <input
                  type="text"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                  placeholder="e.g. Alice Smith"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Contact Email</label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="e.g. sales@acmetech.com"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Contact Phone</label>
                <input
                  type="text"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  placeholder="e.g. 555-0100"
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 transition-colors"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-zinc-400 uppercase mb-2">Office Address</label>
                <textarea
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  rows="2"
                  placeholder="Street name, suite, city..."
                  className="w-full px-4 py-2.5 bg-zinc-950 border border-zinc-850 rounded-lg text-zinc-200 focus:outline-none focus:border-zinc-700 resize-none transition-colors"
                />
              </div>

              <div className="flex justify-end space-x-3 pt-4 border-t border-zinc-800">
                <button
                  type="button"
                  onClick={() => setIsOpen(false)}
                  className="px-4 py-2 text-sm font-medium text-zinc-400 hover:text-white transition-colors"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 text-sm font-semibold rounded-lg bg-emerald-500 hover:bg-emerald-600 text-white transition-colors animate-pulse"
                >
                  Save Partner
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default Vendors;
