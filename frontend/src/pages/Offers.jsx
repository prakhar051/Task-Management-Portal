import React, { useEffect } from 'react';
import { useOfferStore } from '../store/offerStore';

export default function Offers() {
  const offers = useOfferStore((state) => state.offers);
  const fetchOffers = useOfferStore((state) => state.fetchOffers);
  const updateOffer = useOfferStore((state) => state.updateOffer);

  useEffect(() => {
    fetchOffers();
  }, [fetchOffers]);

  const handleUpdateStatus = async (id, status) => {
    if (window.confirm(`Mark this offer status as ${status}?`)) {
      const success = await updateOffer(id, { status });
      if (success) {
        await fetchOffers();
      }
    }
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'ACCEPTED':
        return 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400';
      case 'DECLINED':
        return 'bg-red-500/10 border-red-500/30 text-red-400';
      case 'SENT':
        return 'bg-blue-500/10 border-blue-500/30 text-blue-400';
      case 'EXPIRED':
        return 'bg-slateDark-900 border-slateDark-800 text-slateDark-500';
      default:
        return 'bg-slateDark-900 border-slateDark-800 text-slateDark-400';
    }
  };

  return (
    <div className="space-y-6 select-none pb-12">
      <div>
        <h1 className="text-xl font-black text-white">Offer Letters</h1>
        <p className="text-slateDark-400 text-xs mt-0.5">Manage job contract letters issued to applicants.</p>
      </div>

      <div className="bg-slateDark-950/40 border border-slateDark-900 rounded-3xl overflow-hidden shadow-lg">
        <table className="w-full text-left border-collapse">
          <thead className="bg-slateDark-950/90 border-b border-slateDark-900">
            <tr className="text-[10px] font-black uppercase text-slateDark-500 tracking-wider">
              <th className="py-4 px-6">Candidate</th>
              <th className="py-4 px-6">Position</th>
              <th className="py-4 px-6">Monthly Salary</th>
              <th className="py-4 px-6">Status</th>
              <th className="py-4 px-6">Generated Date</th>
              <th className="py-4 px-6 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slateDark-900/40 text-xs font-semibold">
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-slateDark-900/10 transition-colors">
                <td className="py-4 px-6 font-bold text-white">
                  👤 {o.candidate?.firstName} {o.candidate?.lastName}
                </td>
                <td className="py-4 px-6 text-slateDark-300">{o.jobOpening?.title}</td>
                <td className="py-4 px-6 font-mono text-white font-bold">${o.grossSalary.toFixed(2)}</td>
                <td className="py-4 px-6">
                  <span className={`px-2.5 py-0.5 rounded-full text-[9px] font-black border uppercase tracking-wider ${getStatusBadge(o.status)}`}>
                    {o.status}
                  </span>
                </td>
                <td className="py-4 px-6 font-mono text-slateDark-400">
                  {new Date(o.createdAt).toLocaleDateString()}
                </td>
                <td className="py-4 px-6 text-right space-x-2">
                  {o.status === 'DRAFT' && (
                    <button
                      onClick={() => handleUpdateStatus(o.id, 'SENT')}
                      className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-[10px] font-black transition-all"
                    >
                      Mark Sent
                    </button>
                  )}
                  {o.status === 'SENT' && (
                    <>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'ACCEPTED')}
                        className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl text-[10px] font-black transition-all"
                      >
                        Accept Offer
                      </button>
                      <button
                        onClick={() => handleUpdateStatus(o.id, 'DECLINED')}
                        className="px-3 py-1.5 border border-slateDark-800 hover:border-red-500/20 text-slateDark-400 hover:text-red-400 rounded-xl text-[10px] font-black transition-all"
                      >
                        Decline
                      </button>
                    </>
                  )}
                </td>
              </tr>
            ))}

            {offers.length === 0 && (
              <tr>
                <td colSpan={6} className="py-16 text-center text-xs text-slateDark-600 italic">
                  No offer proposals generated yet
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
