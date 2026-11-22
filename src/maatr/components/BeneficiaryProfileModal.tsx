import React, { useState } from 'react';
import {
  X,
  User,
  Heart,
  Calendar,
  AlertTriangle,
  FileText,
  Baby,
  Truck,
  Stethoscope,
  Activity,
  CheckCircle2,
  Clock,
  ArrowRight,
  ShieldAlert,
} from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import type { Beneficiary } from '../types';

interface BeneficiaryProfileModalProps {
  beneficiary: Beneficiary | null;
  isOpen: boolean;
  onClose: () => void;
  onOpenRecordANC: (beneficiaryId: string) => void;
  onOpenRecordDelivery: (beneficiaryId: string) => void;
  onOpenReferral: (beneficiaryId: string) => void;
}

export const BeneficiaryProfileModal: React.FC<BeneficiaryProfileModalProps> = ({
  beneficiary,
  isOpen,
  onClose,
  onOpenRecordANC,
  onOpenRecordDelivery,
  onOpenReferral,
}) => {
  const [activeTab, setActiveTab] = useState<
    'overview' | 'pregnancy' | 'anc' | 'risk' | 'delivery' | 'pnc' | 'newborn' | 'referrals'
  >('overview');

  if (!isOpen || !beneficiary) return null;

  const pregnancy = maatrStore.getActivePregnancyForBeneficiary(beneficiary.id) ||
    maatrStore.getAllPregnanciesForBeneficiary(beneficiary.id)[0];
  const ancVisits = maatrStore.getANCVisitsForBeneficiary(beneficiary.id);
  const delivery = maatrStore.getDeliveryForBeneficiary(beneficiary.id);
  const newborns = maatrStore.getNewbornsForMother(beneficiary.id);
  const pncVisits = maatrStore.getPNCVisitsForMother(beneficiary.id);
  const referrals = maatrStore.getReferralsForBeneficiary(beneficiary.id);
  const latestRisk = maatrStore.getLatestRiskAssessmentForBeneficiary(beneficiary.id);

  const isHighRisk = beneficiary.currentRiskLevel === 'HIGH';

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-2 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-2xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Profile Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-11 h-11 rounded-2xl bg-emerald-100/80 text-emerald-800 flex items-center justify-center font-black text-sm border border-emerald-200 shadow-sm">
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
                <span
                  className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider ${
                    isHighRisk
                      ? 'bg-rose-100 text-rose-800 border border-rose-200'
                      : beneficiary.status === 'delivered'
                      ? 'bg-sky-100 text-sky-800 border border-sky-200'
                      : 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                  }`}
                >
                  {isHighRisk ? 'High Priority' : beneficiary.status === 'delivered' ? 'Delivered' : 'Active'}
                </span>
              </div>
              <p className="text-xs text-stone-500">
                {beneficiary.age} Yrs • Village: {beneficiary.village} • ASHA: {beneficiary.ashaName}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="px-4 bg-stone-50/70 border-b border-stone-200 flex overflow-x-auto space-x-1 py-1.5 scrollbar-thin">
          {[
            { id: 'overview', label: 'Overview' },
            { id: 'pregnancy', label: 'Pregnancy' },
            { id: 'anc', label: `ANC Visits (${ancVisits.length})` },
            { id: 'risk', label: 'Risk Engine' },
            { id: 'delivery', label: 'Delivery' },
            { id: 'pnc', label: `PNC (${pncVisits.length})` },
            { id: 'newborn', label: `Newborn (${newborns.length})` },
            { id: 'referrals', label: `Referrals (${referrals.length})` },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as any)}
              className={`px-3 py-1.5 rounded-xl text-xs font-semibold whitespace-nowrap transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-emerald-800 shadow-sm border border-stone-200 font-bold'
                  : 'text-stone-500 hover:text-stone-800 hover:bg-stone-100'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* 1. OVERVIEW TAB */}
          {activeTab === 'overview' && (
            <div className="space-y-4 animate-fadeIn">
              {/* Quick Actions Bar */}
              <div className="flex flex-wrap gap-2 pb-2 border-b border-stone-100">
                <button
                  onClick={() => onOpenRecordANC(beneficiary.id)}
                  className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Stethoscope className="w-3.5 h-3.5" />
                  <span>+ Record ANC Visit</span>
                </button>
                {beneficiary.status !== 'delivered' && (
                  <button
                    onClick={() => onOpenRecordDelivery(beneficiary.id)}
                    className="px-3 py-1.5 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                  >
                    <Baby className="w-3.5 h-3.5" />
                    <span>Log Delivery</span>
                  </button>
                )}
                <button
                  onClick={() => onOpenReferral(beneficiary.id)}
                  className="px-3 py-1.5 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Escalate / Refer</span>
                </button>
              </div>

              {/* Vital Metrics Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Gestational Age</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {pregnancy ? `${pregnancy.gestationalAgeWeeks} Weeks` : 'Delivered'}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Estimated Delivery</span>
                  <span className="text-base font-extrabold text-emerald-800">
                    {pregnancy?.edd || 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Obstetric History</span>
                  <span className="text-base font-extrabold text-slate-800">
                    {pregnancy ? `G${pregnancy.gravida} P${pregnancy.parity}` : 'N/A'}
                  </span>
                </div>
                <div className="p-3 bg-stone-50 border border-stone-200 rounded-2xl">
                  <span className="text-[10px] text-stone-400 font-bold uppercase block">Risk Level</span>
                  <span
                    className={`text-base font-black ${
                      isHighRisk ? 'text-rose-700' : 'text-emerald-700'
                    }`}
                  >
                    {beneficiary.currentRiskLevel}
                  </span>
                </div>
              </div>

              {/* Personal Details Card */}
              <div className="bg-stone-50/70 border border-stone-200 rounded-2xl p-4 space-y-2">
                <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Contact & Demographics
                </h4>
                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px]">Mobile</span>
                    <span className="font-semibold text-slate-700">{beneficiary.mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px]">Husband</span>
                    <span className="font-semibold text-slate-700">
                      {beneficiary.husbandName || 'Not specified'} ({beneficiary.husbandMobile || '-'})
                    </span>
                  </div>
                  <div className="col-span-2">
                    <span className="text-stone-400 block text-[10px]">Address</span>
                    <span className="font-semibold text-slate-700">{beneficiary.address}</span>
                  </div>
                </div>
              </div>

              {/* Latest Risk Engine Notice */}
              {latestRisk && (
                <div
                  className={`p-4 rounded-2xl border text-xs space-y-2 ${
                    isHighRisk
                      ? 'bg-rose-50 border-rose-200 text-rose-950'
                      : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span className="font-bold flex items-center gap-1.5">
                      <ShieldAlert className="w-4 h-4 text-rose-700" />
                      Priority Engine: {latestRisk.priority} (Rule: {latestRisk.ruleVersion})
                    </span>
                    <span className="text-[10px] text-stone-500">{latestRisk.assessmentDate}</span>
                  </div>
                  <p className="text-[11px] leading-relaxed">{latestRisk.reasoning}</p>
                  <div className="font-bold text-[11px]">
                    Recommended Action: <span className="font-normal">{latestRisk.recommendedAction}</span>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* 2. PREGNANCY HISTORY TAB */}
          {activeTab === 'pregnancy' && (
            <div className="space-y-4 animate-fadeIn">
              {pregnancy ? (
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-3 text-xs bg-stone-50 p-4 rounded-2xl border border-stone-200">
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">LMP</span>
                      <span className="font-bold text-slate-800">{pregnancy.lmp}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Calculated EDD</span>
                      <span className="font-bold text-emerald-800">{pregnancy.edd}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Gravida</span>
                      <span className="font-bold text-slate-800">{pregnancy.gravida}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Parity</span>
                      <span className="font-bold text-slate-800">{pregnancy.parity}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Registration Source</span>
                      <span className="font-semibold text-slate-700">{pregnancy.sourceOfInfo}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Status</span>
                      <span className="font-bold text-emerald-700 uppercase">{pregnancy.status}</span>
                    </div>
                  </div>

                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                    <h5 className="text-xs font-bold text-slate-700">Previous Complications</h5>
                    {pregnancy.previousComplications.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {pregnancy.previousComplications.map((c) => (
                          <span key={c} className="text-xs bg-rose-100 text-rose-800 px-2.5 py-1 rounded-lg font-semibold">
                            ⚠️ {c}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500">No previous obstetric complications reported.</p>
                    )}
                  </div>

                  <div className="bg-stone-50 p-4 rounded-2xl border border-stone-200 space-y-2">
                    <h5 className="text-xs font-bold text-slate-700">Medical History</h5>
                    {pregnancy.medicalHistory.length > 0 ? (
                      <div className="flex flex-wrap gap-1.5">
                        {pregnancy.medicalHistory.map((m) => (
                          <span key={m} className="text-xs bg-amber-100 text-amber-900 px-2.5 py-1 rounded-lg font-semibold">
                            {m}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <p className="text-xs text-stone-500">None documented.</p>
                    )}
                  </div>
                </div>
              ) : (
                <p className="text-xs text-stone-500">No pregnancy record found.</p>
              )}
            </div>
          )}

          {/* 3. ANC HISTORY TAB */}
          {activeTab === 'anc' && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Chronological Visits Timeline</span>
                <button
                  onClick={() => onOpenRecordANC(beneficiary.id)}
                  className="px-3 py-1 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold"
                >
                  + Add ANC Checkup
                </button>
              </div>

              {ancVisits.length > 0 ? (
                <div className="space-y-3 relative before:absolute before:left-3 before:top-2 before:bottom-2 before:w-0.5 before:bg-stone-200">
                  {ancVisits.map((v) => (
                    <div key={v.id} className="relative pl-8 space-y-1">
                      <div className="absolute left-1.5 top-1.5 w-3.5 h-3.5 rounded-full bg-emerald-600 border-2 border-white shadow-sm" />
                      <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2 text-xs">
                        <div className="flex items-center justify-between">
                          <span className="font-extrabold text-slate-800 text-sm">
                            ANC #{v.visitNumber} ({v.gestationalAgeWeeks} Weeks)
                          </span>
                          <span className="text-stone-500 text-[11px] font-semibold">{v.visitDate}</span>
                        </div>

                        <div className="grid grid-cols-3 gap-2 text-[11px]">
                          <div>
                            <span className="text-stone-400 block text-[10px]">Blood Pressure</span>
                            <span className={`font-bold ${v.systolicBp >= 140 ? 'text-rose-700' : 'text-slate-800'}`}>
                              {v.systolicBp}/{v.diastolicBp} mmHg
                            </span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px]">Weight</span>
                            <span className="font-bold text-slate-800">{v.weightKg} kg</span>
                          </div>
                          <div>
                            <span className="text-stone-400 block text-[10px]">Hemoglobin (Hb)</span>
                            <span className={`font-bold ${v.hemoglobinGdl < 10 ? 'text-amber-700' : 'text-slate-800'}`}>
                              {v.hemoglobinGdl} g/dL
                            </span>
                          </div>
                        </div>

                        {v.dangerSigns.length > 0 && (
                          <div className="p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-[11px] font-bold">
                            ⚠️ Danger Signs: {v.dangerSigns.join(', ')}
                          </div>
                        )}

                        <div className="text-[11px] text-stone-600 pt-1 border-t border-stone-100">
                          <span className="font-semibold">Advice: </span>
                          <span>{v.medicalAdvice}</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-2">
                  <p className="text-xs text-stone-500">No antenatal visits recorded yet.</p>
                  <button
                    onClick={() => onOpenRecordANC(beneficiary.id)}
                    className="text-xs font-bold text-emerald-700 underline"
                  >
                    Record first ANC visit
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 4. RISK ASSESSMENT TAB */}
          {activeTab === 'risk' && (
            <div className="space-y-4 animate-fadeIn">
              {latestRisk ? (
                <div className="space-y-4">
                  <div
                    className={`p-5 rounded-2xl border text-xs space-y-3 ${
                      latestRisk.priority === 'HIGH'
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : latestRisk.priority === 'MODERATE'
                        ? 'bg-amber-50 border-amber-200 text-amber-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center justify-between pb-2 border-b border-black/10">
                      <div>
                        <span className="text-[10px] font-bold uppercase tracking-wider block">Assessed Priority</span>
                        <h4 className="text-xl font-black">{latestRisk.priority} PRIORITY</h4>
                      </div>
                      <span className="text-[10px] font-mono bg-white/60 px-2 py-1 rounded-md border border-black/10">
                        {latestRisk.ruleVersion}
                      </span>
                    </div>

                    <div>
                      <span className="font-bold block mb-1">Contributing Factors Identified:</span>
                      <ul className="list-disc pl-4 space-y-1 text-[11px]">
                        {latestRisk.contributingFactors.map((f, i) => (
                          <li key={i}>{f}</li>
                        ))}
                      </ul>
                    </div>

                    <div>
                      <span className="font-bold block mb-1">Reason for Prioritization:</span>
                      <p className="text-[11px] leading-relaxed">{latestRisk.reasoning}</p>
                    </div>

                    <div className="p-3 bg-white/80 rounded-xl border border-black/10">
                      <span className="font-bold text-emerald-900 block text-xs">Recommended Clinical Action:</span>
                      <p className="text-[11px] text-slate-800 font-semibold mt-0.5">
                        {latestRisk.recommendedAction}
                      </p>
                    </div>
                  </div>

                  <p className="text-[10px] text-stone-400 italic">
                    * This system evaluates MoHFW approved clinical guidelines for maternal safety and does not replace diagnostic judgment by a Medical Officer.
                  </p>
                </div>
              ) : (
                <p className="text-xs text-stone-500">No risk assessment records available.</p>
              )}
            </div>
          )}

          {/* 5. DELIVERY TAB */}
          {activeTab === 'delivery' && (
            <div className="space-y-4 animate-fadeIn">
              {delivery ? (
                <div className="bg-stone-50 p-5 rounded-2xl border border-stone-200 space-y-3 text-xs">
                  <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                    <span className="font-bold text-slate-800 text-sm">Institutional Delivery Record</span>
                    <span className="text-emerald-700 font-bold uppercase">{delivery.birthOutcome}</span>
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-stone-400 block text-[10px]">Date & Time</span>
                      <span className="font-bold text-slate-800">{delivery.deliveryDateTime}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Facility</span>
                      <span className="font-semibold text-slate-700">{delivery.deliveryFacility}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Delivery Type</span>
                      <span className="font-bold text-slate-800">{delivery.deliveryType}</span>
                    </div>
                    <div>
                      <span className="text-stone-400 block text-[10px]">Attending Healthcare Provider</span>
                      <span className="font-semibold text-slate-700">{delivery.attendingProvider}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-8 text-center bg-stone-50 rounded-2xl border border-dashed border-stone-300 space-y-3">
                  <Baby className="w-8 h-8 text-stone-400 mx-auto" />
                  <p className="text-xs text-stone-600">Mother has not delivered yet. Pregnancy is currently active.</p>
                  <button
                    onClick={() => onOpenRecordDelivery(beneficiary.id)}
                    className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold"
                  >
                    Record Delivery Event
                  </button>
                </div>
              )}
            </div>
          )}

          {/* 6. PNC TAB */}
          {activeTab === 'pnc' && (
            <div className="space-y-3 animate-fadeIn">
              <span className="text-xs font-bold text-slate-700">Postnatal Care (PNC) Checkpoints</span>

              {pncVisits.length > 0 ? (
                <div className="space-y-3">
                  {pncVisits.map((p) => (
                    <div key={p.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="font-extrabold text-slate-800">{p.checkpointLabel}</span>
                        <span
                          className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                            p.status === 'completed'
                              ? 'bg-emerald-100 text-emerald-800'
                              : p.status === 'due'
                              ? 'bg-amber-100 text-amber-800'
                              : 'bg-stone-200 text-stone-600'
                          }`}
                        >
                          {p.status}
                        </span>
                      </div>
                      <p className="text-[11px] text-stone-500">Scheduled Date: {p.visitDate}</p>
                    </div>
                  ))}
                </div>
              ) : (
                <p className="text-xs text-stone-500">PNC checkpoints activate automatically after delivery is recorded.</p>
              )}
            </div>
          )}

          {/* 7. NEWBORN TAB */}
          {activeTab === 'newborn' && (
            <div className="space-y-3 animate-fadeIn">
              {newborns.length > 0 ? (
                newborns.map((nb) => (
                  <div key={nb.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-2">
                    <div className="flex items-center justify-between">
                      <h5 className="font-bold text-slate-800 text-sm">{nb.babyName}</h5>
                      <span className="px-2 py-0.5 rounded-md bg-sky-100 text-sky-800 font-bold uppercase text-[10px]">
                        {nb.gender}
                      </span>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-stone-400 block text-[10px]">Birth Weight</span>
                        <span className="font-bold text-slate-800">{nb.birthWeightKg} kg</span>
                      </div>
                      <div>
                        <span className="text-stone-400 block text-[10px]">Feeding Status</span>
                        <span className="font-semibold text-emerald-800">{nb.feedingStatus}</span>
                      </div>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500">No newborn profiles registered yet.</p>
              )}
            </div>
          )}

          {/* 8. REFERRALS TAB */}
          {activeTab === 'referrals' && (
            <div className="space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-700">Referral History</span>
                <button
                  onClick={() => onOpenReferral(beneficiary.id)}
                  className="px-3 py-1 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold"
                >
                  + New Referral
                </button>
              </div>

              {referrals.length > 0 ? (
                referrals.map((r) => (
                  <div key={r.id} className="p-4 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1.5">
                    <div className="flex items-center justify-between">
                      <span className="font-extrabold text-slate-800">{r.referralFacility}</span>
                      <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 uppercase">
                        {r.status}
                      </span>
                    </div>
                    <p className="text-[11px] text-stone-600 font-medium">Reason: {r.referralReason}</p>
                    <p className="text-[10px] text-stone-400">Date: {r.referralDate} • Referring ASHA: {r.referringAsha}</p>
                  </div>
                ))
              ) : (
                <p className="text-xs text-stone-500">No referrals initiated for this mother.</p>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
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
