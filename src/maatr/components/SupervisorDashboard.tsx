import React from 'react';
import { Users, Activity, AlertTriangle, CheckCircle2, Clock, Truck, ShieldCheck, MapPin } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';

interface SupervisorDashboardProps {
  onSelectBeneficiary: (id: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onSelectBeneficiary }) => {
  const metrics = maatrStore.getDashboardMetrics();
  const beneficiaries = maatrStore.getBeneficiaries();
  const tasks = maatrStore.getTasks();
  const highRiskCohort = beneficiaries.filter((b) => b.currentRiskLevel === 'HIGH');
  const overdueTasks = tasks.filter((t) => t.status === 'pending');
  const referrals = maatrStore.getReferrals().filter((r) => r.status !== 'Completed');

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <ShieldCheck className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">ANM & PHC Supervisor Dashboard</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-lg">
            High-level oversight across Sub-Centres: monitoring institutional delivery readiness, high-risk pregnancies, and field ASHA task completion.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold">
          Role: ANM / Medical Officer View
        </span>
      </div>

      {/* High-Level Analytical KPI Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Registered Mothers</span>
          <span className="text-2xl font-black text-slate-800">{metrics.totalMothers}</span>
          <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">
            {metrics.activePregnancies} Active Pregnancies
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">High-Risk Cohort</span>
          <span className="text-2xl font-black text-rose-700">{metrics.highPriorityCount}</span>
          <span className="text-[10px] text-rose-700 block mt-1 font-semibold">Immediate monitoring</span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Pending Visits</span>
          <span className="text-2xl font-black text-amber-700">{overdueTasks.length}</span>
          <span className="text-[10px] text-stone-500 block mt-1 font-semibold">
            {metrics.ancDueCount} ANC • {metrics.pncDueCount} PNC
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-sm">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Tertiary Referrals</span>
          <span className="text-2xl font-black text-sky-800">{referrals.length}</span>
          <span className="text-[10px] text-stone-500 block mt-1 font-semibold">In transit / Admitted</span>
        </div>
      </div>

      {/* High-Risk Beneficiary Priority Roster */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            High-Risk Priority Cohort ({highRiskCohort.length})
          </h3>
          <span className="text-xs text-stone-400">Escalated by Clinical Priority Engine</span>
        </div>

        <div className="space-y-2">
          {highRiskCohort.map((ben) => {
            const risk = maatrStore.getLatestRiskAssessmentForBeneficiary(ben.id);
            const preg = maatrStore.getActivePregnancyForBeneficiary(ben.id);

            return (
              <div
                key={ben.id}
                className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectBeneficiary(ben.id)}
                      className="font-extrabold text-slate-800 hover:text-rose-700 underline text-left"
                    >
                      {ben.fullName}
                    </button>
                    <span className="text-[10px] text-stone-400">({ben.id})</span>
                    <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold">
                      {preg ? `${preg.gestationalAgeWeeks} Wks Gestation` : 'Postnatal'}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-600 mt-0.5">
                    Village: {ben.village} • ASHA: {ben.ashaName}
                  </p>
                  <p className="text-[11px] text-rose-900 font-medium mt-1">
                    Risk factors: {risk?.contributingFactors.join(', ') || 'Hypertension / Danger signs'}
                  </p>
                </div>

                <button
                  onClick={() => onSelectBeneficiary(ben.id)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 font-bold text-xs self-start sm:self-auto transition-all"
                >
                  Review Case
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ASHA Field Performance & Workload Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800">
          Field Worker (ASHA) Workload & Coverage
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">Kamla Tai</span>
                <span className="text-[10px] text-stone-400">ASHA-104 • Sub-Centre Ramnagar</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Active Coverage
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-400 block text-[10px]">Mothers</span>
                <span className="font-bold text-slate-800">{beneficiaries.length}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Pending Tasks</span>
                <span className="font-bold text-amber-700">{overdueTasks.length}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">High-Risk</span>
                <span className="font-bold text-rose-700">{highRiskCohort.length}</span>
              </div>
            </div>
          </div>

          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">Suman Bai</span>
                <span className="text-[10px] text-stone-400">ASHA-105 • Sub-Centre Ganga Layout</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Active Coverage
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-400 block text-[10px]">Mothers</span>
                <span className="font-bold text-slate-800">4</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Pending Tasks</span>
                <span className="font-bold text-amber-700">1</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">High-Risk</span>
                <span className="font-bold text-slate-800">0</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
