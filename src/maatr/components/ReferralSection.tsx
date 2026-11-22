import React, { useState } from 'react';
import { Truck, Plus, AlertTriangle, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import type { Referral } from '../types';

interface ReferralSectionProps {
  onSelectBeneficiary: (id: string) => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ onSelectBeneficiary }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const beneficiaries = maatrStore.getBeneficiaries();

  const [beneficiaryId, setBeneficiaryId] = useState(beneficiaries[0]?.id || '');
  const [referralDate, setReferralDate] = useState(new Date().toISOString().split('T')[0]);
  const [referralReason, setReferralReason] = useState('Severe gestational hypertension / persistent headache');
  const [referralFacility, setReferralFacility] = useState('CHC Saoner / GMC Nagpur');
  const [priority, setPriority] = useState<'EMERGENCY' | 'HIGH' | 'ROUTINE'>('EMERGENCY');
  const [followUpNotes, setFollowUpNotes] = useState('Escorted patient to facility via 108 ambulance.');

  const referrals = maatrStore.getReferrals();

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    maatrStore.createReferral({
      beneficiaryId,
      referralDate,
      referralReason,
      referralFacility,
      referringAsha: 'Kamla Tai (ASHA-104)',
      priority,
      status: 'Referred',
      followUpNotes,
    });
    setIsModalOpen(false);
  };

  const handleStatusChange = (refId: string, status: Referral['status']) => {
    maatrStore.updateReferralStatus(refId, status);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">Referral Management & Escalations</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Coordinate tertiary escalations to CHCs, FRUs, and District Hospitals. Track transport and clinical outcomes.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create New Referral</span>
        </button>
      </div>

      {/* Referrals Table / Feed */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800">Active & Past Referrals ({referrals.length})</h3>

        {referrals.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {referrals.map((ref) => {
              const ben = maatrStore.getBeneficiaryById(ref.beneficiaryId);
              const isEmergency = ref.priority === 'EMERGENCY';

              return (
                <div
                  key={ref.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-sm space-y-3 ${
                    isEmergency ? 'border-rose-300 bg-rose-50/10' : 'border-stone-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-bold text-xs ${
                          isEmergency ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <Truck className="w-5 h-5" />
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectBeneficiary(ref.beneficiaryId)}
                            className="font-extrabold text-slate-800 text-sm hover:text-emerald-700 underline text-left"
                          >
                            {ben?.fullName || 'Beneficiary'}
                          </button>
                          <span className="text-[10px] text-stone-400">({ref.beneficiaryId})</span>
                          <span
                            className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isEmergency
                                ? 'bg-rose-100 text-rose-800'
                                : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ref.priority}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Referred to: <strong className="text-slate-700">{ref.referralFacility}</strong> • Date: {ref.referralDate}
                        </p>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[11px] font-semibold text-stone-500">Status:</span>
                      <select
                        value={ref.status}
                        onChange={(e) => handleStatusChange(ref.id, e.target.value as any)}
                        className={`text-xs font-bold px-2.5 py-1.5 rounded-xl border outline-none bg-white ${
                          ref.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        <option value="Created">Created</option>
                        <option value="Referred">Referred / En Route</option>
                        <option value="Pending">Pending Evaluation</option>
                        <option value="Follow-up required">Follow-up Required</option>
                        <option value="Completed">Completed ✓</option>
                      </select>
                    </div>
                  </div>

                  <div className="space-y-1 text-xs">
                    <p className="text-slate-800 font-medium">
                      <span className="text-stone-500 font-normal">Reason: </span>
                      {ref.referralReason}
                    </p>
                    {ref.followUpNotes && (
                      <p className="text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-[11px]">
                        <span className="font-semibold text-stone-700">ASHA Follow-up Notes: </span>
                        {ref.followUpNotes}
                      </p>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <Truck className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No active referrals recorded.</p>
          </div>
        )}
      </div>

      {/* Create Referral Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Create Hospital Referral</h3>
                <p className="text-xs text-stone-500">Escalate patient to Community or District facility</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateReferral} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Beneficiary *</label>
                <select
                  value={beneficiaryId}
                  onChange={(e) => setBeneficiaryId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.id}) - {b.village}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Referral Date</label>
                  <input
                    type="date"
                    required
                    value={referralDate}
                    onChange={(e) => setReferralDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Priority</label>
                  <select
                    value={priority}
                    onChange={(e: any) => setPriority(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="EMERGENCY">Emergency (Immediate)</option>
                    <option value="HIGH">High Priority</option>
                    <option value="ROUTINE">Routine Specialist Review</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Referral Facility *</label>
                <input
                  type="text"
                  required
                  value={referralFacility}
                  onChange={(e) => setReferralFacility(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Reason for Referral *</label>
                <textarea
                  rows={2}
                  required
                  value={referralReason}
                  onChange={(e) => setReferralReason(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Escort & Transport Notes</label>
                <textarea
                  rows={2}
                  value={followUpNotes}
                  onChange={(e) => setFollowUpNotes(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black shadow-sm"
                >
                  Confirm Referral
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
