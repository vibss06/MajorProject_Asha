import React, { useState } from 'react';
import { Truck, Plus, CheckCircle2, Clock, MapPin, X } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import type { NCDReferral } from '../types';

interface ReferralSectionProps {
  onSelectBeneficiary: (id: string) => void;
}

export const ReferralSection: React.FC<ReferralSectionProps> = ({ onSelectBeneficiary }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const beneficiaries = ncdStore.getBeneficiaries();

  const [beneficiaryId, setBeneficiaryId] = useState(beneficiaries[0]?.id || '');
  const [referralDate, setReferralDate] = useState(new Date().toISOString().split('T')[0]);
  const [reason, setReason] = useState('Uncontrolled Stage 2 Hypertension / Diabetic foot complication');
  const [referredFacility, setReferredFacility] = useState('Primary Health Centre (PHC) Saoner');
  const [priority, setPriority] = useState<'EMERGENCY' | 'HIGH' | 'ROUTINE'>('HIGH');
  const [followUpNotes, setFollowUpNotes] = useState('Advised patient regarding fasting blood sugar test and physician review.');

  const referrals = ncdStore.getReferrals();

  const handleCreateReferral = (e: React.FormEvent) => {
    e.preventDefault();
    ncdStore.createReferral({
      beneficiaryId,
      referralDate,
      reason,
      referredFacility,
      referringAsha: 'Kamla Tai (ASHA-104)',
      priority,
      status: 'Referred',
      followUpNotes,
    });
    setIsModalOpen(false);
  };

  const handleStatusChange = (refId: string, status: NCDReferral['status']) => {
    ncdStore.updateReferralStatus(refId, status);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-amber-100 text-amber-800 flex items-center justify-center font-bold">
              <Truck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">NCD Facility Referrals</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Coordinate escalations to PHCs, CHCs, and District Hospitals for confirmatory diagnostic testing and prescription initiation.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-xs transition-all whitespace-nowrap"
        >
          <Plus className="w-4 h-4" />
          <span>+ Create Referral</span>
        </button>
      </div>

      {/* Referrals List */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800">Active & Historical Referrals ({referrals.length})</h3>

        {referrals.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {referrals.map((ref) => {
              const ben = ncdStore.getBeneficiaryById(ref.beneficiaryId);
              const isHigh = ref.priority === 'EMERGENCY' || ref.priority === 'HIGH';

              return (
                <div
                  key={ref.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-xs space-y-3 ${
                    isHigh ? 'border-rose-300 bg-rose-50/10' : 'border-stone-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-2.5">
                      <div
                        className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-xs ${
                          isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                        }`}
                      >
                        <Truck className="w-4 h-4" />
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
                            className={`text-[9px] px-2 py-0.5 rounded-full font-bold uppercase ${
                              isHigh ? 'bg-rose-100 text-rose-800' : 'bg-amber-100 text-amber-800'
                            }`}
                          >
                            {ref.priority}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Facility: <strong className="text-slate-800">{ref.referredFacility}</strong> • Date: {ref.referralDate}
                        </p>
                      </div>
                    </div>

                    {/* Status Dropdown */}
                    <div className="flex items-center gap-2">
                      <span className="text-[10px] font-semibold text-stone-500">Status:</span>
                      <select
                        value={ref.status}
                        onChange={(e) => handleStatusChange(ref.id, e.target.value as any)}
                        className={`text-xs font-bold px-2 py-1 rounded-xl border outline-none bg-white ${
                          ref.status === 'Completed'
                            ? 'bg-emerald-50 text-emerald-800 border-emerald-300'
                            : 'bg-amber-50 text-amber-900 border-amber-300'
                        }`}
                      >
                        <option value="Created">Created</option>
                        <option value="Referred">Referred</option>
                        <option value="Pending">Pending Evaluation</option>
                        <option value="Follow-up required">Follow-up Required</option>
                        <option value="Completed">Completed ✓</option>
                      </select>
                    </div>
                  </div>

                  <p className="text-xs text-slate-800 font-medium">
                    <span className="text-stone-500 font-normal">Reason: </span>
                    {ref.reason}
                  </p>

                  {ref.followUpNotes && (
                    <p className="text-stone-600 bg-stone-50 p-2.5 rounded-xl border border-stone-100 text-[11px]">
                      <span className="font-semibold text-stone-700">Follow-up Notes: </span>
                      {ref.followUpNotes}
                    </p>
                  )}
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <Truck className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No active NCD referrals.</p>
          </div>
        )}
      </div>

      {/* Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Create NCD Facility Referral</h3>
                <p className="text-xs text-stone-500">Clinical escalation to Primary or Community facility</p>
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
                  value={referredFacility}
                  onChange={(e) => setReferredFacility(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Clinical Reason *</label>
                <textarea
                  rows={2}
                  required
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
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
                  className="px-5 py-2 rounded-xl bg-amber-700 hover:bg-amber-800 text-white text-xs font-black shadow-xs"
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
