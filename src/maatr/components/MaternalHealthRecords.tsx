import React, { useState } from 'react';
import { FileText, Shield, Clock, Download, Printer, User, Stethoscope, Baby, Truck, CheckCircle2 } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';

interface MaternalHealthRecordsProps {
  onSelectBeneficiary: (id: string) => void;
}

export const MaternalHealthRecords: React.FC<MaternalHealthRecordsProps> = ({ onSelectBeneficiary }) => {
  const [selectedRecordType, setSelectedRecordType] = useState<'ALL' | 'ANC' | 'DELIVERY' | 'PNC' | 'REFERRAL'>('ALL');

  const ancVisits = maatrStore.getANCVisits();
  const deliveries = maatrStore.getDeliveries();
  const pncVisits = maatrStore.getPNCVisits().filter((p) => p.status === 'completed');
  const referrals = maatrStore.getReferrals();
  const beneficiaries = maatrStore.getBeneficiaries();

  // Unified chronological audit events
  const auditEvents = [
    ...ancVisits.map((a) => ({
      id: a.id,
      type: 'ANC',
      beneficiaryId: a.beneficiaryId,
      title: `Antenatal Checkup (ANC #${a.visitNumber})`,
      date: a.visitDate,
      details: `BP: ${a.systolicBp}/${a.diastolicBp} mmHg, Hb: ${a.hemoglobinGdl} g/dL, Weight: ${a.weightKg} kg`,
      author: a.recordedBy,
      isDanger: a.isHighRiskFlagged,
    })),
    ...deliveries.map((d) => ({
      id: d.id,
      type: 'DELIVERY',
      beneficiaryId: d.beneficiaryId,
      title: `Institutional Delivery (${d.birthOutcome})`,
      date: d.deliveryDateTime.split('T')[0],
      details: `Facility: ${d.deliveryFacility}, Type: ${d.deliveryType}, Attending: ${d.attendingProvider}`,
      author: 'Healthcare Facility / ASHA',
      isDanger: false,
    })),
    ...pncVisits.map((p) => ({
      id: p.id,
      type: 'PNC',
      beneficiaryId: p.motherBeneficiaryId,
      title: `Postnatal Care (${p.checkpointLabel})`,
      date: p.visitDate,
      details: `Maternal check completed, Baby weight: ${p.newbornAssessment.currentWeightKg || '-'} kg`,
      author: p.recordedBy,
      isDanger: false,
    })),
    ...referrals.map((r) => ({
      id: r.id,
      type: 'REFERRAL',
      beneficiaryId: r.beneficiaryId,
      title: `Tertiary Referral to ${r.referralFacility}`,
      date: r.referralDate,
      details: `Priority: ${r.priority}, Reason: ${r.referralReason}, Status: ${r.status}`,
      author: r.referringAsha,
      isDanger: r.priority === 'EMERGENCY',
    })),
  ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime());

  const filteredEvents = auditEvents.filter((ev) => {
    if (selectedRecordType === 'ALL') return true;
    return ev.type === selectedRecordType;
  });

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <FileText className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">Maternal Clinical Audit Trail</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            Immutable longitudinal healthcare registry preserving complete maternal histories without data loss or overwrites.
          </p>
        </div>

        <button
          onClick={handlePrint}
          className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:bg-stone-100 text-slate-700 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Printer className="w-4 h-4 text-stone-500" />
          <span>Print / Export Summary</span>
        </button>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center gap-1.5 overflow-x-auto pb-1">
        {(['ALL', 'ANC', 'DELIVERY', 'PNC', 'REFERRAL'] as const).map((t) => (
          <button
            key={t}
            onClick={() => setSelectedRecordType(t)}
            className={`px-3 py-1.5 rounded-xl text-xs font-bold transition-all ${
              selectedRecordType === t
                ? 'bg-slate-800 text-white shadow-sm'
                : 'bg-white border border-stone-200 text-stone-600 hover:bg-stone-100'
            }`}
          >
            {t === 'ALL' ? 'All Records' : t}
          </button>
        ))}
      </div>

      {/* Timeline Log */}
      <div className="space-y-3">
        {filteredEvents.map((ev) => {
          const beneficiary = beneficiaries.find((b) => b.id === ev.beneficiaryId);

          return (
            <div
              key={ev.id}
              className={`p-4 bg-white rounded-2xl border transition-all shadow-sm space-y-1.5 ${
                ev.isDanger ? 'border-rose-300 bg-rose-50/10' : 'border-stone-200'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-1 text-xs">
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-slate-800 text-sm">{ev.title}</span>
                  <span className="text-[10px] px-2 py-0.5 rounded-md bg-stone-100 text-stone-600 font-bold uppercase">
                    {ev.type}
                  </span>
                </div>
                <span className="text-stone-400 text-[11px] font-mono">{ev.date}</span>
              </div>

              <p className="text-xs text-stone-700">{ev.details}</p>

              <div className="flex items-center justify-between pt-1 border-t border-stone-100 text-[11px] text-stone-500">
                <span>
                  Mother:{' '}
                  <button
                    onClick={() => onSelectBeneficiary(ev.beneficiaryId)}
                    className="font-bold text-slate-700 hover:text-emerald-700 underline"
                  >
                    {beneficiary?.fullName || 'Beneficiary'}
                  </button>{' '}
                  ({ev.beneficiaryId})
                </span>
                <span>Audit Logger: {ev.author}</span>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
