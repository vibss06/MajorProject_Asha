import React from 'react';
import { X, FileText, CheckCircle2, AlertTriangle, ArrowRight, Stethoscope, Eye, ShieldAlert, Truck, Calendar } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import type { SharedBeneficiary } from '../types';

interface ScreeningSummaryModalProps {
  beneficiary: SharedBeneficiary | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenReferral?: (id: string) => void;
  onOpenFollowup?: (id: string) => void;
}

export const ScreeningSummaryModal: React.FC<ScreeningSummaryModalProps> = ({
  beneficiary,
  isOpen,
  onClose,
  onOpenReferral,
  onOpenFollowup,
}) => {
  if (!isOpen || !beneficiary) return null;

  const screenings = ncdStore.getScreeningsForBeneficiary(beneficiary.id);
  const latestScreening = screenings[0];
  const visualRecords = ncdStore.getVisualRecordsForBeneficiary(beneficiary.id);
  const latestRisk = ncdStore.getLatestRiskAssessmentForBeneficiary(beneficiary.id);

  // Check specific visual area findings
  const eyesRec = visualRecords.find((v) => v.area === 'eyes');
  const neckRec = visualRecords.find((v) => v.area === 'neck');
  const feetRec = visualRecords.find((v) => v.area === 'feet');
  const legsRec = visualRecords.find((v) => v.area === 'legs');

  const hasAbnormality =
    (latestScreening && (latestScreening.measurements.systolicBp >= 140 || latestScreening.measurements.diastolicBp >= 90)) ||
    visualRecords.some((v) => v.isFlaggedAbnormal);

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-xl bg-slate-800 text-white flex items-center justify-center font-bold">
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 className="font-extrabold text-slate-800 text-base">
                Combined NCD Screening Summary
              </h3>
              <p className="text-xs text-stone-500">
                {beneficiary.fullName} ({beneficiary.id}) • {beneficiary.age} Yrs • {beneficiary.village}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Key Identification Banner */}
          <div className="p-3 bg-stone-100 rounded-2xl flex items-center justify-between">
            <span className="text-[11px] font-bold text-stone-700">Screening Status:</span>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-extrabold uppercase ${
                hasAbnormality ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
              }`}
            >
              {hasAbnormality ? 'Clinical Assessment Required' : 'All Clear / Routine'}
            </span>
          </div>

          {/* 1. Recorded Basic Measurements */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
              <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
              1. Recorded Clinical Measurements
            </span>

            {latestScreening ? (
              <div className="grid grid-cols-3 gap-2 text-xs">
                <div className="p-2 bg-white rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-bold">Blood Pressure</span>
                  <span
                    className={`font-black ${
                      latestScreening.measurements.systolicBp >= 140 ? 'text-rose-700' : 'text-slate-800'
                    }`}
                  >
                    {latestScreening.measurements.systolicBp}/{latestScreening.measurements.diastolicBp} mmHg
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-bold">Blood Sugar</span>
                  <span className="font-black text-slate-800">
                    {latestScreening.measurements.bloodGlucoseMgdl
                      ? `${latestScreening.measurements.bloodGlucoseMgdl} mg/dL`
                      : 'Not measured'}
                  </span>
                </div>
                <div className="p-2 bg-white rounded-xl border border-stone-100">
                  <span className="text-[10px] text-stone-400 block font-bold">Calculated BMI</span>
                  <span className="font-black text-slate-800">
                    {latestScreening.measurements.bmi} kg/m²
                  </span>
                </div>
              </div>
            ) : (
              <p className="text-xs text-stone-500 italic">No basic measurements recorded yet.</p>
            )}
          </div>

          {/* 2. Visual Screening AI Observations */}
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2.5">
            <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-purple-700" />
              2. Visual Screening Observations (AI-Assisted)
            </span>

            <div className="space-y-1.5">
              <div className="p-2.5 bg-white rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                <span>👁️ Eyes (Conjunctiva):</span>
                <span className={`font-bold ${eyesRec?.isFlaggedAbnormal ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {eyesRec ? (eyesRec.isFlaggedAbnormal ? '⚠️ Pallor Flagged' : 'Normal') : 'Not Screened'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                <span>🧣 Neck (Thyroid):</span>
                <span className={`font-bold ${neckRec?.isFlaggedAbnormal ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {neckRec ? (neckRec.isFlaggedAbnormal ? '⚠️ Visible Swelling Flagged' : 'Normal') : 'Not Screened'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                <span>🦶 Feet (Diabetic Lesion):</span>
                <span className={`font-bold ${feetRec?.isFlaggedAbnormal ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {feetRec ? (feetRec.isFlaggedAbnormal ? '⚠️ Foot Ulcer/Lesion Flagged' : 'Normal') : 'Not Screened'}
                </span>
              </div>
              <div className="p-2.5 bg-white rounded-xl border border-stone-100 flex items-center justify-between text-xs">
                <span>🦵 Legs (Edema):</span>
                <span className={`font-bold ${legsRec?.isFlaggedAbnormal ? 'text-rose-700' : 'text-emerald-700'}`}>
                  {legsRec ? (legsRec.isFlaggedAbnormal ? '⚠️ Lower Limb Edema Flagged' : 'Normal') : 'Not Screened'}
                </span>
              </div>
            </div>
          </div>

          {/* 3. System Clinical Assessment & Recommended Next Action */}
          {latestRisk && (
            <div
              className={`p-4 rounded-2xl border space-y-2 text-xs ${
                latestRisk.priority === 'HIGH'
                  ? 'bg-rose-50 border-rose-200 text-rose-950'
                  : 'bg-emerald-50 border-emerald-200 text-emerald-950'
              }`}
            >
              <div className="flex items-center justify-between">
                <span className="font-extrabold flex items-center gap-1.5">
                  <ShieldAlert className="w-4 h-4 text-rose-700" />
                  Assessed Priority: {latestRisk.priority} (Rule: {latestRisk.ruleVersion})
                </span>
              </div>

              <div className="text-[11px] space-y-1">
                <p>
                  <strong>Contributing Factors: </strong>
                  {latestRisk.contributingFactors.join(', ')}
                </p>
                <p>
                  <strong>Clinical Reasoning: </strong>
                  {latestRisk.reasoning}
                </p>
                <div className="p-2 bg-white/80 rounded-xl mt-1 border border-black/10">
                  <strong className="text-emerald-900 block">Recommended Next Action:</strong>
                  <span>{latestRisk.recommendedAction}</span>
                </div>
              </div>
            </div>
          )}

          {/* Legend Distinguishing Data Types (Section 8 Requirement) */}
          <div className="p-3 bg-stone-100 rounded-xl text-[10px] text-stone-600 space-y-1">
            <span className="font-bold text-stone-700 block uppercase">Data Source Distinctions:</span>
            <div className="grid grid-cols-2 gap-1">
              <span>🔵 <strong>Recorded Measurement:</strong> Verified digital device reading</span>
              <span>🟣 <strong>AI Observation:</strong> Algorithmic visual screening flag</span>
              <span>🟢 <strong>Clinically Verified:</strong> Confirmed by Medical Officer</span>
              <span>⚪ <strong>Missing Information:</strong> Pending field assessment</span>
            </div>
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex flex-wrap items-center justify-between gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
          >
            Close
          </button>

          <div className="flex items-center gap-2">
            {onOpenFollowup && (
              <button
                onClick={() => {
                  onClose();
                  onOpenFollowup(beneficiary.id);
                }}
                className="px-3.5 py-2 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 text-xs font-bold flex items-center gap-1.5"
              >
                <Calendar className="w-3.5 h-3.5" />
                <span>Task Follow-up</span>
              </button>
            )}

            {onOpenReferral && hasAbnormality && (
              <button
                onClick={() => {
                  onClose();
                  onOpenReferral(beneficiary.id);
                }}
                className="px-4 py-2 rounded-xl bg-rose-700 hover:bg-rose-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
              >
                <Truck className="w-3.5 h-3.5" />
                <span>Escalate / Refer to PHC</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
