import React, { useState } from 'react';
import { Search, User, Phone, MapPin, Calendar, AlertTriangle, ArrowRight, Stethoscope, Baby, Filter } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import type { Beneficiary, BeneficiaryStatus } from '../types';

interface BeneficiaryListProps {
  onSelectBeneficiary: (id: string) => void;
  onOpenRegisterMother: () => void;
  onOpenRecordANC: (id: string) => void;
  onOpenRecordDelivery: (id: string) => void;
}

export const BeneficiaryList: React.FC<BeneficiaryListProps> = ({
  onSelectBeneficiary,
  onOpenRegisterMother,
  onOpenRecordANC,
  onOpenRecordDelivery,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<'ALL' | BeneficiaryStatus>('ALL');

  const beneficiaries = maatrStore.getBeneficiaries();

  const filtered = beneficiaries.filter((b) => {
    const matchesSearch =
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mobileNumber.includes(searchQuery) ||
      b.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const matchesStatus = statusFilter === 'ALL' || b.status === statusFilter;

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search and Action Bar */}
      <div className="bg-stone-50 rounded-3xl p-4 border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by mother name, mobile, village, or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-stone-200 text-xs text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-sm"
          />
        </div>

        <button
          onClick={onOpenRegisterMother}
          className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
        >
          <span>+ Register Mother</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: `All Mothers (${beneficiaries.length})` },
          { id: 'active_pregnancy', label: 'Active Pregnancies' },
          { id: 'high_risk', label: 'High Priority (Risk)' },
          { id: 'delivered', label: 'Delivered (PNC)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setStatusFilter(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              statusFilter === tab.id
                ? 'bg-slate-800 text-white shadow-sm font-bold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Beneficiary Cards List */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((b) => {
            const preg = maatrStore.getActivePregnancyForBeneficiary(b.id) ||
              maatrStore.getAllPregnanciesForBeneficiary(b.id)[0];
            const isHigh = b.currentRiskLevel === 'HIGH';
            const isDelivered = b.status === 'delivered';

            return (
              <div
                key={b.id}
                className={`bg-white rounded-3xl p-4 border transition-all shadow-sm space-y-3 ${
                  isHigh
                    ? 'border-rose-300 hover:border-rose-400'
                    : 'border-stone-200 hover:border-emerald-300'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-extrabold text-sm ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isDelivered
                          ? 'bg-sky-100 text-sky-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {b.fullName.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectBeneficiary(b.id)}
                          className="font-extrabold text-slate-800 text-base hover:text-emerald-700 underline text-left"
                        >
                          {b.fullName}
                        </button>
                        <span className="text-xs text-stone-400">({b.id})</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800'
                              : isDelivered
                              ? 'bg-sky-100 text-sky-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {isHigh ? 'High Risk' : isDelivered ? 'Delivered' : 'Active ANC'}
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        {b.age} Yrs • Village: {b.village} • Mobile: {b.mobileNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-stone-400 block text-[10px]">EDD / Status</span>
                    <span className="font-extrabold text-slate-800">
                      {isDelivered ? 'Delivered ✓' : preg?.edd || 'Pending'}
                    </span>
                  </div>
                </div>

                {/* Details Strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Gestation</span>
                    <span className="font-bold text-slate-800">
                      {isDelivered ? 'Postnatal' : preg ? `${preg.gestationalAgeWeeks} Weeks` : '-'}
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Obstetric</span>
                    <span className="font-bold text-slate-800">
                      {preg ? `G${preg.gravida} P${preg.parity}` : '-'}
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Risk Priority</span>
                    <span
                      className={`font-black ${
                        isHigh ? 'text-rose-700' : 'text-emerald-700'
                      }`}
                    >
                      {b.currentRiskLevel}
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">ASHA Worker</span>
                    <span className="font-semibold text-stone-700">{b.ashaName}</span>
                  </div>
                </div>

                {/* Action Buttons */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={() => onSelectBeneficiary(b.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <span>View Complete Health Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    {!isDelivered && (
                      <>
                        <button
                          onClick={() => onOpenRecordANC(b.id)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-50 hover:bg-emerald-100 text-emerald-800 text-xs font-bold transition-all"
                        >
                          + ANC Visit
                        </button>
                        <button
                          onClick={() => onOpenRecordDelivery(b.id)}
                          className="px-3 py-1.5 rounded-xl bg-sky-50 hover:bg-sky-100 text-sky-800 text-xs font-bold transition-all"
                        >
                          Log Delivery
                        </button>
                      </>
                    )}
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <User className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No beneficiaries found matching criteria.</p>
          </div>
        )}
      </div>
    </div>
  );
};
