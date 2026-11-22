import React, { useState } from 'react';
import { ShieldAlert, AlertTriangle, User, ArrowRight, Info, Stethoscope } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import { NCD_GUIDELINE_VERSION } from '../utils/ncdRules';

interface RiskAssessmentSectionProps {
  onSelectBeneficiary: (id: string) => void;
  onOpenReferral: (id: string) => void;
}

export const RiskAssessmentSection: React.FC<RiskAssessmentSectionProps> = ({
  onSelectBeneficiary,
  onOpenReferral,
}) => {
  const [filterPriority, setFilterPriority] = useState<'ALL' | 'HIGH' | 'MODERATE' | 'NORMAL'>('ALL');
  const assessments = ncdStore.getRiskAssessments();
  const beneficiaries = ncdStore.getBeneficiaries();

  const filtered = assessments.filter((a) => {
    if (filterPriority === 'ALL') return true;
    return a.priority === filterPriority;
  });

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200">
        <div className="flex items-center justify-between gap-3 flex-wrap">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-rose-100 text-rose-800 flex items-center justify-center font-bold">
              <ShieldAlert className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              NCD Clinical Risk Assessment & Priority Engine
            </h2>
          </div>

          <span className="text-[11px] font-mono font-bold bg-white px-3 py-1.5 rounded-xl border border-stone-200 text-stone-600 shadow-xs">
            {NCD_GUIDELINE_VERSION}
          </span>
        </div>
        <p className="text-xs text-stone-500 mt-1 max-w-lg">
          Explainable, rule-based clinical decision support evaluating hypertension, hyperglycemia, BMI, and AI visual screening flags.
        </p>
      </div>

      {/* Protocol safety notice */}
      <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-2.5 text-xs text-amber-950">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <p className="text-[11px] text-amber-900 leading-relaxed">
          Screening assessments assist in identifying individuals who require timely medical evaluation. Any severe abnormal finding (such as Stage 2 Hypertension or open diabetic foot ulcers) triggers independent hospital referral regardless of calculated score.
        </p>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-2">
        {(['ALL', 'HIGH', 'MODERATE', 'NORMAL'] as const).map((p) => (
          <button
            key={p}
            onClick={() => setFilterPriority(p)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              filterPriority === p
                ? 'bg-slate-800 text-white shadow-xs'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {p === 'ALL' ? 'All' : `${p} Priority`}
          </button>
        ))}
      </div>

      {/* Assessments Feed */}
      <div className="space-y-3">
        {filtered.length > 0 ? (
          filtered.map((ra) => {
            const beneficiary = beneficiaries.find((b) => b.id === ra.beneficiaryId);
            const isHigh = ra.priority === 'HIGH';
            const isMod = ra.priority === 'MODERATE';

            return (
              <div
                key={ra.id}
                className={`bg-white rounded-3xl p-5 border transition-all shadow-xs space-y-3 ${
                  isHigh
                    ? 'border-rose-300 bg-rose-50/10'
                    : isMod
                    ? 'border-amber-300 bg-amber-50/10'
                    : 'border-stone-200'
                }`}
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-11 h-11 rounded-2xl flex items-center justify-center font-black text-xs ${
                        isHigh
                          ? 'bg-rose-100 text-rose-800'
                          : isMod
                          ? 'bg-amber-100 text-amber-800'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {ra.priority.slice(0, 3)}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onSelectBeneficiary(ra.beneficiaryId)}
                          className="font-extrabold text-slate-800 text-base hover:text-emerald-700 underline text-left"
                        >
                          {beneficiary?.fullName || 'Beneficiary'}
                        </button>
                        <span className="text-xs text-stone-400">({ra.beneficiaryId})</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            isHigh
                              ? 'bg-rose-100 text-rose-800'
                              : isMod
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-emerald-100 text-emerald-800'
                          }`}
                        >
                          {ra.priority} PRIORITY
                        </span>
                      </div>
                      <p className="text-xs text-stone-500">
                        Village: {beneficiary?.village || '-'} • Date: {ra.assessmentDate}
                      </p>
                    </div>
                  </div>

                  {isHigh && (
                    <button
                      onClick={() => onOpenReferral(ra.beneficiaryId)}
                      className="px-3.5 py-1.5 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold shadow-xs flex items-center gap-1.5 self-start sm:self-auto"
                    >
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Immediate Referral</span>
                    </button>
                  )}
                </div>

                {/* Factors */}
                <div className="space-y-1.5 text-xs">
                  <span className="font-bold text-slate-700 block">Contributing Factors:</span>
                  <div className="flex flex-wrap gap-1.5">
                    {ra.contributingFactors.map((factor, idx) => (
                      <span
                        key={idx}
                        className={`text-[11px] px-2.5 py-1 rounded-xl font-medium border ${
                          isHigh
                            ? 'bg-rose-50 text-rose-800 border-rose-200'
                            : isMod
                            ? 'bg-amber-50 text-amber-800 border-amber-200'
                            : 'bg-stone-50 text-stone-600 border-stone-200'
                        }`}
                      >
                        {factor}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 text-xs">
                  <div className="p-3 bg-stone-50 rounded-2xl space-y-1 border border-stone-100">
                    <span className="font-bold text-slate-700 block text-[11px] uppercase">
                      Clinical Reasoning
                    </span>
                    <p className="text-stone-600 leading-relaxed text-[11px]">{ra.reasoning}</p>
                  </div>
                  <div className="p-3 bg-emerald-50/60 rounded-2xl space-y-1 border border-emerald-100">
                    <span className="font-bold text-emerald-900 block text-[11px] uppercase">
                      Recommended Next Action
                    </span>
                    <p className="text-emerald-950 font-semibold leading-relaxed text-[11px]">
                      {ra.recommendedAction}
                    </p>
                  </div>
                </div>
              </div>
            );
          })
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <ShieldAlert className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No assessments found matching selected priority.</p>
          </div>
        )}
      </div>
    </div>
  );
};
