import React from 'react';
import { Users, Activity, AlertTriangle, CheckCircle2, Clock, Truck, ShieldCheck, Camera } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';

interface SupervisorDashboardProps {
  onSelectBeneficiary: (id: string) => void;
}

export const SupervisorDashboard: React.FC<SupervisorDashboardProps> = ({ onSelectBeneficiary }) => {
  const metrics = ncdStore.getDashboardMetrics();
  const beneficiaries = ncdStore.getBeneficiaries();
  const riskAssessments = ncdStore.getRiskAssessments();
  const highRiskCohort = riskAssessments.filter((r) => r.priority === 'HIGH');
  const tasks = ncdStore.getTasks();
  const pendingTasks = tasks.filter((t) => t.status === 'Pending');

  return (
    <div className="space-y-4 animate-fadeIn">
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
            Population-level non-communicable disease surveillance, screening coverage monitoring, and clinical review for identified risk cohorts.
          </p>
        </div>

        <span className="px-3 py-1.5 rounded-xl bg-purple-50 text-purple-800 border border-purple-200 text-xs font-bold whitespace-nowrap">
          Role: Medical Officer / ANM View
        </span>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Target Population</span>
          <span className="text-2xl font-black text-slate-800">{metrics.totalBeneficiaries}</span>
          <span className="text-[10px] text-emerald-700 block mt-1 font-semibold">
            {metrics.totalScreened} Screened ({Math.round((metrics.totalScreened / (metrics.totalBeneficiaries || 1)) * 100)}%)
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">High Clinical Risk</span>
          <span className="text-2xl font-black text-rose-700">{highRiskCohort.length}</span>
          <span className="text-[10px] text-rose-700 block mt-1 font-semibold">
            Doctor evaluation needed
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">Follow-ups Due</span>
          <span className="text-2xl font-black text-amber-700">{pendingTasks.length}</span>
          <span className="text-[10px] text-stone-500 block mt-1 font-semibold">
            Field visits scheduled
          </span>
        </div>

        <div className="p-4 bg-white rounded-2xl border border-stone-200 shadow-xs">
          <span className="text-[10px] text-stone-400 font-bold uppercase block">PHC Referrals</span>
          <span className="text-2xl font-black text-sky-800">{metrics.pendingReferrals}</span>
          <span className="text-[10px] text-stone-500 block mt-1 font-semibold">
            Active hospital escalations
          </span>
        </div>
      </div>

      {/* High-Risk Clinical Cohort */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3 shadow-xs">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800 flex items-center gap-2">
            <AlertTriangle className="w-4 h-4 text-rose-600" />
            Cases Requiring Clinical Assessment ({highRiskCohort.length})
          </h3>
          <span className="text-xs text-stone-400">Flagged by NCD Decision Engine</span>
        </div>

        <div className="space-y-2">
          {highRiskCohort.map((ra) => {
            const ben = beneficiaries.find((b) => b.id === ra.beneficiaryId);
            return (
              <div
                key={ra.id}
                className="p-3.5 bg-rose-50/40 rounded-2xl border border-rose-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3 text-xs"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onSelectBeneficiary(ra.beneficiaryId)}
                      className="font-extrabold text-slate-800 hover:text-rose-700 underline text-left"
                    >
                      {ben?.fullName || 'Beneficiary'}
                    </button>
                    <span className="text-[10px] text-stone-400">({ra.beneficiaryId})</span>
                    <span className="text-[10px] text-stone-500">• {ben?.village}</span>
                  </div>
                  <p className="text-[11px] text-rose-900 font-medium mt-1">
                    Risk factors: {ra.contributingFactors.join(', ')}
                  </p>
                </div>

                <button
                  onClick={() => onSelectBeneficiary(ra.beneficiaryId)}
                  className="px-3.5 py-1.5 rounded-xl bg-white border border-rose-300 hover:bg-rose-100 text-rose-800 font-bold text-xs self-start sm:self-auto transition-all"
                >
                  Review Case
                </button>
              </div>
            );
          })}
        </div>
      </div>

      {/* ASHA-wise Activity Breakdown */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3 shadow-xs">
        <h3 className="text-sm font-extrabold text-slate-800">
          Field Screening Coverage by ASHA Worker
        </h3>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
          <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-2">
            <div className="flex items-center justify-between">
              <div>
                <span className="font-extrabold text-slate-800 text-sm block">Kamla Tai</span>
                <span className="text-[10px] text-stone-400">ASHA-104 • Sub-Centre Ramnagar</span>
              </div>
              <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold text-[10px]">
                Active
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-400 block text-[10px]">Beneficiaries</span>
                <span className="font-bold text-slate-800">{beneficiaries.length}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Screened</span>
                <span className="font-bold text-emerald-700">{metrics.totalScreened}</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">High Risk</span>
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
                Active
              </span>
            </div>
            <div className="grid grid-cols-3 gap-2 pt-1 text-[11px]">
              <div>
                <span className="text-stone-400 block text-[10px]">Beneficiaries</span>
                <span className="font-bold text-slate-800">5</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">Screened</span>
                <span className="font-bold text-emerald-700">4</span>
              </div>
              <div>
                <span className="text-stone-400 block text-[10px]">High Risk</span>
                <span className="font-bold text-slate-800">1</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
