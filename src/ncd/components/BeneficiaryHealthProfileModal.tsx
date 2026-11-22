import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  Calendar,
  AlertTriangle,
  FileText,
  Camera,
  Truck,
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import type { SharedBeneficiary } from '../types';

interface BeneficiaryHealthProfileModalProps {
  beneficiary: SharedBeneficiary | null;
  isOpen: boolean;
  onClose: () => void;
  onStartBasicScreening: (id: string) => void;
  onStartVisualScreening: (id: string) => void;
  onOpenReferral: (id: string) => void;
}

export const BeneficiaryHealthProfileModal: React.FC<BeneficiaryHealthProfileModalProps> = ({
  beneficiary,
  isOpen,
  onClose,
  onStartBasicScreening,
  onStartVisualScreening,
  onOpenReferral,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'basic' | 'visual' | 'risk' | 'history' | 'referrals' | 'followups'
  >('overview');

  if (!isOpen || !beneficiary) return null;

  const screenings = ncdStore.getScreeningsForBeneficiary(beneficiary.id);
  const latestScreening = screenings[0];
  const visualRecords = ncdStore.getVisualRecordsForBeneficiary(beneficiary.id);
  const latestRisk = ncdStore.getLatestRiskAssessmentForBeneficiary(beneficiary.id);
  const tasks = ncdStore.getTasks().filter((t) => t.beneficiaryId === beneficiary.id);
  const referrals = ncdStore.getReferrals().filter((r) => r.beneficiaryId === beneficiary.id);

  const isHighRisk = latestRisk?.priority === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-teal-100 text-teal-800 flex items-center justify-center font-black text-sm border border-teal-200 shadow-xs">
              {beneficiary.fullName.slice(0, 2).toUpperCase()}
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h3 className="font-extrabold text-slate-800 text-lg leading-tight">
                  {beneficiary.fullName}
                </h3>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-200 text-stone-700 font-bold">
                  {beneficiary.id}
                </span>
                {isHighRisk && (
                  <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-rose-100 text-rose-800 border border-rose-200">
                    High Risk
                  </span>
                )}
              </div>
              <p className="text-xs text-stone-500">
                {beneficiary.age} Yrs • {beneficiary.gender} • Village: {beneficiary.village} • ASHA: {beneficiary.ashaName}
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

        {/* Tab Navigation */}
        <div className="px-4 bg-stone-50/70 border-b border-stone-200 flex overflow-x-auto space-x-1 py-1.5 scrollbar-thin">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'basic', label: 'Basic Measurements' },
            { id: 'visual', label: `Visual AI (${visualRecords.length})` },
            { id: 'risk', label: 'Risk Engine' },
            { id: 'history', label: `Screenings (${screenings.length})` },
            { id: 'referrals', label: `Referrals (${referrals.length})` },
            { id: 'followups', label: `Follow-ups (${tasks.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-800 shadow-xs border border-stone-200 font-bold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* TAB 1: OVERVIEW */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick Action CTAs */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-100">
                <button
                  onClick={() => onStartBasicScreening(beneficiary.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-teal-700 hover:bg-teal-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>+ Record NCD Vitals</span>
                </button>
                <button
                  onClick={() => onStartVisualScreening(beneficiary.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-purple-700 hover:bg-purple-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>Visual AI Screen</span>
                </button>
                <button
                  onClick={() => onOpenReferral(beneficiary.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Refer to PHC</span>
                </button>
              </div>

              {/* Vitals Summary Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Latest BP</span>
                  <span
                    className={`text-base font-extrabold ${
                      latestScreening?.measurements.systolicBp && latestScreening.measurements.systolicBp >= 140
                        ? 'text-rose-700'
                        : 'text-slate-800'
                    }`}
                  >
                    {latestScreening
                      ? `${latestScreening.measurements.systolicBp}/${latestScreening.measurements.diastolicBp}`
                      : 'Pending'}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Blood Glucose</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {latestScreening?.measurements.bloodGlucoseMgdl
                      ? `${latestScreening.measurements.bloodGlucoseMgdl} mg/dL`
                      : 'Pending'}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Calculated BMI</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {latestScreening ? `${latestScreening.measurements.bmi} kg/m²` : 'Pending'}
                  </span>
                </div>

                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Priority Status</span>
                  <span
                    className={`text-base font-black ${
                      isHighRisk ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {latestRisk?.priority || 'NORMAL'}
                  </span>
                </div>
              </div>

              {/* Demographics Card */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                <span className="text-[11px] font-bold text-slate-700 uppercase tracking-wider block">
                  Demographic & Contact Details
                </span>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Mobile</span>
                    <span className="font-semibold text-slate-700">{beneficiary.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Address</span>
                    <span className="font-semibold text-slate-700">{beneficiary.address}</span>
                  </div>
                </div>
              </div>

              {/* Latest Risk Engine Summary */}
              {latestRisk && (
                <div
                  className={`p-4 rounded-2xl border space-y-2 ${
                    isHighRisk
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-700" />
                      Priority Engine: {latestRisk.priority} ({latestRisk.ruleVersion})
                    </span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{latestRisk.reasoning}</p>
                  <div className="text-[11px]">
                    <strong>Recommended Action: </strong>
                    <span>{latestRisk.recommendedAction}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 2: BASIC MEASUREMENTS */}
          {activeTab === 'basic' && (
            <div className="space-y-3 animate-fadeIn">
              {latestScreening ? (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                  <div className="flex items-center justify-between border-b border-stone-200 pb-2">
                    <span className="font-bold text-slate-800 text-sm">Most Recent Vitals</span>
                    <span className="text-stone-500 font-mono text-[11px]">{latestScreening.screeningDate}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 text-xs">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Blood Pressure</span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {latestScreening.measurements.systolicBp}/{latestScreening.measurements.diastolicBp} mmHg
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Blood Glucose</span>
                      <span className="font-extrabold text-slate-800 text-sm">
                        {latestScreening.measurements.bloodGlucoseMgdl || 'Not tested'} mg/dL ({latestScreening.measurements.glucoseType})
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Height & Weight</span>
                      <span className="font-bold text-slate-800">
                        {latestScreening.measurements.heightCm} cm • {latestScreening.measurements.weightKg} kg
                      </span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Body Mass Index</span>
                      <span className="font-extrabold text-emerald-800">
                        {latestScreening.measurements.bmi} kg/m² ({latestScreening.measurements.bmiCategory})
                      </span>
                    </div>
                  </div>

                  <div className="pt-2 border-t border-stone-200 text-[11px] space-y-1">
                    <p><strong>Tobacco Use: </strong>{latestScreening.history.tobaccoUse}</p>
                    <p><strong>Alcohol: </strong>{latestScreening.history.alcoholConsumption ? 'Yes' : 'No'}</p>
                    <p><strong>Known Conditions: </strong>{latestScreening.history.knownConditions.join(', ') || 'None documented'}</p>
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 text-xs text-center py-6">No clinical measurements recorded yet.</p>
              )}
            </div>
          )}

          {/* TAB 3: VISUAL SCREENING */}
          {activeTab === 'visual' && (
            <div className="space-y-3 animate-fadeIn">
              <span className="font-bold text-slate-800 text-xs block">AI-Assisted Visual Area Observations</span>
              {visualRecords.length > 0 ? (
                visualRecords.map((vr) => (
                  <div
                    key={vr.id}
                    className={`p-3.5 bg-stone-50 rounded-2xl border space-y-2 ${
                      vr.isFlaggedAbnormal ? 'border-rose-200 bg-rose-50/20' : 'border-stone-200'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800 uppercase text-xs">{vr.area} ({vr.possibleCondition})</span>
                      <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${vr.isFlaggedAbnormal ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'}`}>
                        {vr.isFlaggedAbnormal ? '⚠️ Flagged' : 'Normal'}
                      </span>
                    </div>
                    {vr.aiObservation && (
                      <p className="text-[11px] text-stone-700 bg-white p-2.5 rounded-xl border border-stone-200">
                        {vr.aiObservation}
                      </p>
                    )}
                  </div>
                ))
              ) : (
                <p className="text-stone-500 text-xs text-center py-6">No visual photograph screenings completed.</p>
              )}
            </div>
          )}

          {/* TAB 4: RISK ASSESSMENT */}
          {activeTab === 'risk' && (
            <div className="space-y-3 animate-fadeIn">
              {latestRisk ? (
                <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
                  <div className="flex items-center justify-between pb-1 border-b border-stone-200">
                    <span className="font-black text-sm">{latestRisk.priority} PRIORITY</span>
                    <span className="font-mono text-[10px]">{latestRisk.ruleVersion}</span>
                  </div>
                  <div className="space-y-1 text-[11px]">
                    <span className="font-bold block">Contributing Factors:</span>
                    <ul className="list-disc pl-4 space-y-0.5">
                      {latestRisk.contributingFactors.map((f, i) => (
                        <li key={i}>{f}</li>
                      ))}
                    </ul>
                  </div>
                  <div className="pt-2 text-[11px]">
                    <strong>Recommended Action: </strong>
                    <span>{latestRisk.recommendedAction}</span>
                  </div>
                </div>
              ) : (
                <p className="text-stone-500 text-xs text-center py-6">No risk assessment records available.</p>
              )}
            </div>
          )}

          {/* TAB 5: SCREENING HISTORY */}
          {activeTab === 'history' && (
            <div className="space-y-2 animate-fadeIn">
              {screenings.map((s) => (
                <div key={s.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-bold text-slate-800">Screening on {s.screeningDate}</span>
                    <span className="text-[10px] text-stone-400">By {s.screenedBy}</span>
                  </div>
                  <p className="text-[11px] text-stone-600">
                    BP: {s.measurements.systolicBp}/{s.measurements.diastolicBp} mmHg • Glucose: {s.measurements.bloodGlucoseMgdl || '-'} mg/dL • BMI: {s.measurements.bmi}
                  </p>
                </div>
              ))}
            </div>
          )}

          {/* TAB 6: REFERRALS */}
          {activeTab === 'referrals' && (
            <div className="space-y-2 animate-fadeIn">
              {referrals.length > 0 ? (
                referrals.map((r) => (
                  <div key={r.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">{r.referredFacility}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">{r.status}</span>
                    </div>
                    <p className="text-[11px] text-stone-600">Reason: {r.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-stone-500 text-xs text-center py-6">No referrals generated.</p>
              )}
            </div>
          )}

          {/* TAB 7: FOLLOW-UPS */}
          {activeTab === 'followups' && (
            <div className="space-y-2 animate-fadeIn">
              {tasks.length > 0 ? (
                tasks.map((t) => (
                  <div key={t.id} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
                    <div className="flex items-center justify-between">
                      <span className="font-bold text-slate-800">Due: {t.dueDate}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-200 text-stone-700">{t.status}</span>
                    </div>
                    <p className="text-[11px] text-stone-600">{t.reason}</p>
                  </div>
                ))
              ) : (
                <p className="text-stone-500 text-xs text-center py-6">No pending follow-ups.</p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-2 rounded-xl bg-stone-200 hover:bg-stone-300 text-stone-800 text-xs font-bold transition-all"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
