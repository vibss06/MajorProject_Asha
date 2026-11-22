import React, { useState } from 'react';
import { Search, User, Activity, Camera, ArrowRight, Plus, Eye, Stethoscope } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import type { SharedBeneficiary } from '../types';

interface BeneficiaryListProps {
  onSelectBeneficiary: (id: string) => void;
  onOpenRegisterModal: () => void;
  onOpenBasicScreening: (id: string) => void;
  onOpenVisualScreening: (id: string) => void;
}

export const BeneficiaryList: React.FC<BeneficiaryListProps> = ({
  onSelectBeneficiary,
  onOpenRegisterModal,
  onOpenBasicScreening,
  onOpenVisualScreening,
}) => {
  const [searchQuery, setSearchQuery] = useState('');
  const [filterMode, setFilterMode] = useState<'ALL' | 'SCREENED' | 'PENDING' | 'HIGH_RISK'>('ALL');

  const beneficiaries = ncdStore.getBeneficiaries();

  const filtered = beneficiaries.filter((b) => {
    const matchesSearch =
      b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.mobileNumber.includes(searchQuery) ||
      b.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
      b.id.toLowerCase().includes(searchQuery.toLowerCase());

    const screenings = ncdStore.getScreeningsForBeneficiary(b.id);
    const isScreened = screenings.length > 0;
    const latestRisk = ncdStore.getLatestRiskAssessmentForBeneficiary(b.id);
    const isHigh = latestRisk?.priority === 'HIGH';

    let matchesFilter = true;
    if (filterMode === 'SCREENED') matchesFilter = isScreened;
    if (filterMode === 'PENDING') matchesFilter = !isScreened;
    if (filterMode === 'HIGH_RISK') matchesFilter = isHigh;

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Search Bar & Register CTA */}
      <div className="bg-stone-50 rounded-3xl p-4 border border-stone-200 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="relative flex-1">
          <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search by name, mobile, village, or ID..."
            className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-stone-200 text-xs text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
          />
        </div>

        <button
          onClick={onOpenRegisterModal}
          className="px-4 py-2 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-xs flex items-center justify-center gap-1.5 transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Register Beneficiary</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none">
        {[
          { id: 'ALL', label: `All (${beneficiaries.length})` },
          { id: 'SCREENED', label: 'Screened' },
          { id: 'PENDING', label: 'Screening Pending' },
          { id: 'HIGH_RISK', label: 'High Priority (Risk)' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setFilterMode(tab.id as any)}
            className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
              filterMode === tab.id
                ? 'bg-slate-800 text-white shadow-xs font-bold'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Beneficiaries Feed */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((b) => {
            const screenings = ncdStore.getScreeningsForBeneficiary(b.id);
            const latest = screenings[0];
            const risk = ncdStore.getLatestRiskAssessmentForBeneficiary(b.id);
            const isHigh = risk?.priority === 'HIGH';
            const visuals = ncdStore.getVisualRecordsForBeneficiary(b.id);
            const hasVisualAlert = visuals.some((v) => v.isFlaggedAbnormal);

            return (
              <div
                key={b.id}
                className={`bg-white rounded-3xl p-4 border transition-all shadow-xs space-y-3 ${
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
                          : latest
                          ? 'bg-emerald-100 text-emerald-800'
                          : 'bg-stone-100 text-stone-600'
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
                        {b.isRegisteredInMaatr && (
                          <span className="text-[9px] px-1.5 py-0.5 rounded-md bg-pink-100 text-pink-800 font-bold">
                            Maatr Shared
                          </span>
                        )}
                        {isHigh && (
                          <span className="text-[9px] px-2 py-0.5 rounded-full font-bold uppercase bg-rose-100 text-rose-800">
                            High Risk
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-stone-500">
                        {b.age} Yrs • {b.gender} • Village: {b.village} • Mobile: {b.mobileNumber}
                      </p>
                    </div>
                  </div>

                  <div className="text-right text-xs">
                    <span className="text-stone-400 block text-[10px]">Latest BP</span>
                    <span className="font-extrabold text-slate-800">
                      {latest
                        ? `${latest.measurements.systolicBp}/${latest.measurements.diastolicBp} mmHg`
                        : 'Not Screened'}
                    </span>
                  </div>
                </div>

                {/* Metrics strip */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Blood Glucose</span>
                    <span className="font-bold text-slate-800">
                      {latest?.measurements.bloodGlucoseMgdl
                        ? `${latest.measurements.bloodGlucoseMgdl} mg/dL`
                        : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Calculated BMI</span>
                    <span className="font-bold text-slate-800">
                      {latest?.measurements.bmi ? `${latest.measurements.bmi} kg/m²` : '-'}
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Visual Screening</span>
                    <span
                      className={`font-bold ${
                        hasVisualAlert ? 'text-rose-700' : visuals.length > 0 ? 'text-emerald-700' : 'text-stone-500'
                      }`}
                    >
                      {hasVisualAlert ? '⚠️ Alert Flagged' : visuals.length > 0 ? 'Normal ✓' : 'Pending'}
                    </span>
                  </div>
                  <div className="p-2 bg-stone-50 rounded-xl">
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Risk Assessment</span>
                    <span
                      className={`font-black ${
                        isHigh ? 'text-rose-700' : risk ? 'text-emerald-700' : 'text-stone-400'
                      }`}
                    >
                      {risk?.priority || 'Not assessed'}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center justify-between gap-2 pt-1 border-t border-stone-100">
                  <button
                    onClick={() => onSelectBeneficiary(b.id)}
                    className="text-xs font-bold text-emerald-700 hover:text-emerald-900 flex items-center gap-1"
                  >
                    <span>View Central Health Profile</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </button>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onOpenBasicScreening(b.id)}
                      className="px-3 py-1.5 rounded-xl bg-teal-50 hover:bg-teal-100 text-teal-800 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Stethoscope className="w-3.5 h-3.5" />
                      <span>Screen Vitals</span>
                    </button>
                    <button
                      onClick={() => onOpenVisualScreening(b.id)}
                      className="px-3 py-1.5 rounded-xl bg-purple-50 hover:bg-purple-100 text-purple-800 text-xs font-bold transition-all flex items-center gap-1"
                    >
                      <Camera className="w-3.5 h-3.5" />
                      <span>Visual AI</span>
                    </button>
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
