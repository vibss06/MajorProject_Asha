import React, { useState, useEffect } from 'react';
import {
  Heart,
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  Truck,
  Plus,
  Search,
  Stethoscope,
  Baby,
  ShieldAlert,
  FileText,
  ShieldCheck,
  Mic,
  RefreshCw,
  ArrowRight,
  Layers,
  ChevronLeft,
  Settings,
  LogOut,
  Sparkles,
} from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import { MAATR_TRANSLATIONS } from '../utils/maatrTranslations';
import type { Language } from '../types';

// Subcomponents
import { RegisterMotherModal } from './RegisterMotherModal';
import { BeneficiaryProfileModal } from './BeneficiaryProfileModal';
import { BeneficiaryList } from './BeneficiaryList';
import { ANCTrackingSection } from './ANCTrackingSection';
import { DeliverySection } from './DeliverySection';
import { PNCTrackingSection } from './PNCTrackingSection';
import { RiskAssessmentSection } from './RiskAssessmentSection';
import { TasksScheduleSection } from './TasksScheduleSection';
import { ReferralSection } from './ReferralSection';
import { SupervisorDashboard } from './SupervisorDashboard';
import { MaternalHealthRecords } from './MaternalHealthRecords';
import { VoiceAssistantModal } from './VoiceAssistantModal';

interface MaatrMainProps {
  appLanguage: 'en' | 'hi';
  onSwitchProgram?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const MaatrMain: React.FC<MaatrMainProps> = ({
  appLanguage,
  onSwitchProgram,
  onOpenSettings,
  onLogout,
}) => {
  const [maatrLang, setMaatrLang] = useState<Language>(
    (localStorage.getItem('maatr_language') as Language) || (appLanguage === 'hi' ? 'hi' : 'en')
  );

  // Active section: 'dashboard', 'beneficiaries', 'schedule', 'hub', or a specific sub-module
  const [activeTab, setActiveTab] = useState<'dashboard' | 'beneficiaries' | 'schedule' | 'hub'>('dashboard');
  const [activeSubModule, setActiveSubModule] = useState<
    'anc' | 'delivery' | 'pnc' | 'risk' | 'referrals' | 'records' | 'supervisor' | null
  >(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);

  // Store metrics state
  const [metrics, setMetrics] = useState(() => maatrStore.getDashboardMetrics());
  const [syncStatus, setSyncStatus] = useState(() => maatrStore.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = maatrStore.subscribe(() => {
      setMetrics(maatrStore.getDashboardMetrics());
      setSyncStatus(maatrStore.getSyncStatus());
    });
    return () => unsubscribe();
  }, []);

  const t = MAATR_TRANSLATIONS[maatrLang] || MAATR_TRANSLATIONS.en;

  const handleLanguageChange = (lang: Language) => {
    setMaatrLang(lang);
    localStorage.setItem('maatr_language', lang);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await maatrStore.syncWithCloud();
    setIsSyncing(false);
  };

  const selectedBeneficiary = selectedBeneficiaryId
    ? maatrStore.getBeneficiaryById(selectedBeneficiaryId) || null
    : null;

  const navigateToSubModule = (sub: 'anc' | 'delivery' | 'pnc' | 'risk' | 'referrals' | 'records' | 'supervisor') => {
    setActiveSubModule(sub);
    setActiveTab('hub');
  };

  const navigateBackToDashboard = () => {
    setActiveSubModule(null);
    setActiveTab('dashboard');
  };

  return (
    <div className="w-full max-w-lg mx-auto bg-[#fafaf9] min-h-screen flex flex-col shadow-xl relative border-x border-stone-200 font-sans pb-24">
      {/* 1. Mobile Header */}
      <header className="sticky top-0 z-40 bg-white/95 backdrop-blur-md border-b border-stone-200 px-4 py-3 shadow-xs">
        <div className="flex items-center justify-between gap-2">
          {/* Logo & Module info */}
          <div className="flex items-center gap-2.5">
            <div className="w-9 h-9 rounded-2xl bg-emerald-700 text-white flex items-center justify-center font-black text-sm shadow-xs">
              M
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  {t.moduleTitle}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 font-bold uppercase">
                  ASHA Sahayak
                </span>
              </div>
              <span className="block text-[9px] text-stone-500 font-medium">
                {t.moduleSubtitle}
              </span>
            </div>
          </div>

          {/* Quick Header Actions: Language & System */}
          <div className="flex items-center gap-1.5">
            {/* Multilingual Switcher: EN / हिन्दी / मराठी */}
            <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200 text-[10px] font-bold">
              {(['en', 'hi', 'mr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  className={`px-1.5 py-1 rounded-lg uppercase transition-all ${
                    maatrLang === l
                      ? 'bg-white text-emerald-800 shadow-xs font-black'
                      : 'text-stone-500 hover:text-stone-800'
                  }`}
                >
                  {l === 'en' ? 'EN' : l === 'hi' ? 'हि' : 'म'}
                </button>
              ))}
            </div>

            {onOpenSettings && (
              <button
                onClick={onOpenSettings}
                className="p-2 hover:bg-stone-100 rounded-xl text-stone-400 hover:text-stone-700 transition-colors"
                title="Settings"
              >
                <Settings className="w-4 h-4" />
              </button>
            )}

            {onLogout && (
              <button
                onClick={onLogout}
                className="p-2 hover:bg-rose-50 rounded-xl text-stone-400 hover:text-rose-600 transition-colors"
                title="Log out"
              >
                <LogOut className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Sub-bar: Module switcher & Sync status */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-[11px]">
          {onSwitchProgram ? (
            <button
              onClick={onSwitchProgram}
              className="font-bold text-emerald-800 hover:text-emerald-950 flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded-lg border border-emerald-100"
            >
              <span>Maatr Module Active</span>
              <span className="text-[9px] uppercase font-bold text-emerald-600">(Switch ▾)</span>
            </button>
          ) : (
            <span className="font-bold text-emerald-800">Maatr Active</span>
          )}

          <button
            onClick={handleManualSync}
            disabled={isSyncing}
            className="flex items-center gap-1 text-stone-500 hover:text-stone-800 transition-colors"
          >
            <RefreshCw className={`w-3 h-3 ${isSyncing ? 'animate-spin text-emerald-600' : ''}`} />
            <span>{syncStatus.pendingCount > 0 ? `Syncing (${syncStatus.pendingCount})` : 'Offline Ready ✓'}</span>
          </button>
        </div>
      </header>

      {/* 2. Main Content Body */}
      <main className="p-4 space-y-4 flex-1">
        {/* Back navigation pill if inside a sub-module */}
        {activeSubModule && (
          <button
            onClick={navigateBackToDashboard}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200 text-emerald-800 text-xs font-bold shadow-xs hover:bg-stone-50 transition-all active:scale-[0.99]"
          >
            <span className="flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              <span>← Back to Dashboard (डैशबोर्ड पर वापस जाएं)</span>
            </span>
            <span className="text-[10px] text-stone-400 font-semibold uppercase">Home</span>
          </button>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MAIN DASHBOARD                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && !activeSubModule && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick Search */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search mother by name, mobile, village, or ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs text-slate-800 placeholder-stone-400 focus:outline-none focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 shadow-xs"
              />

              {/* Instant Search Dropdown */}
              {searchQuery && (
                <div className="absolute left-0 right-0 top-12 z-20 bg-white rounded-2xl p-2.5 border border-stone-200 shadow-lg space-y-1.5 animate-fadeIn">
                  {maatrStore
                    .getBeneficiaries()
                    .filter(
                      (b) =>
                        b.fullName.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.mobileNumber.includes(searchQuery) ||
                        b.village.toLowerCase().includes(searchQuery.toLowerCase()) ||
                        b.id.toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    .slice(0, 4)
                    .map((b) => (
                      <div
                        key={b.id}
                        onClick={() => {
                          setSelectedBeneficiaryId(b.id);
                          setSearchQuery('');
                        }}
                        className="p-2.5 hover:bg-stone-50 rounded-xl cursor-pointer flex items-center justify-between text-xs transition-colors"
                      >
                        <div>
                          <span className="font-bold text-slate-800 block">{b.fullName}</span>
                          <span className="text-[10px] text-stone-400">
                            {b.id} • {b.village}
                          </span>
                        </div>
                        <span className="text-emerald-700 font-bold text-[11px] flex items-center gap-1">
                          Profile →
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 4 Core Summary Cards (Clean 2x2 grid, high readability) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setActiveTab('beneficiaries')}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs hover:border-emerald-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Registered Mothers
                </span>
                <span className="text-2xl font-black text-slate-800 block mt-0.5">
                  {metrics.totalMothers}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  {metrics.activePregnancies} Active Pregnancies
                </span>
              </div>

              <div
                onClick={() => setActiveTab('schedule')}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Visits Due
                </span>
                <span className="text-2xl font-black text-amber-700 block mt-0.5">
                  {metrics.ancDueCount + metrics.pncDueCount}
                </span>
                <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                  {metrics.ancDueCount} ANC • {metrics.pncDueCount} PNC
                </span>
              </div>

              <div
                onClick={() => navigateToSubModule('risk')}
                className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                  High Risk Mothers
                </span>
                <span className="text-2xl font-black text-rose-700 block mt-0.5">
                  {metrics.highPriorityCount}
                </span>
                <span className="text-[10px] text-rose-700 font-semibold mt-1 block">
                  Priority Attention ⚠️
                </span>
              </div>

              <div
                onClick={() => navigateToSubModule('referrals')}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs hover:border-sky-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Pending Referrals
                </span>
                <span className="text-2xl font-black text-sky-800 block mt-0.5">
                  {metrics.pendingReferralsCount}
                </span>
                <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                  CHC / District Hospital
                </span>
              </div>
            </div>

            {/* Quick Action Buttons (Large, high-contrast touch cards) */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block px-1">
                Primary Actions (त्वरित कार्य)
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Register Mother */}
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="p-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Register Mother</span>
                    <span className="text-[10px] text-emerald-100">नई गर्भवती महिला पंजीयन</span>
                  </div>
                </button>

                {/* 2. Record ANC Checkup */}
                <button
                  onClick={() => navigateToSubModule('anc')}
                  className="p-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Record ANC</span>
                    <span className="text-[10px] text-teal-100">प्रसवपूर्व जांच दर्ज करें</span>
                  </div>
                </button>

                {/* 3. Log Delivery */}
                <button
                  onClick={() => navigateToSubModule('delivery')}
                  className="p-3.5 rounded-2xl bg-sky-700 hover:bg-sky-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Baby className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Log Delivery</span>
                    <span className="text-[10px] text-sky-100">प्रसव एवं नवजात शिशु</span>
                  </div>
                </button>

                {/* 4. High-Risk & Referrals */}
                <button
                  onClick={() => navigateToSubModule('risk')}
                  className="p-3.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">High Risk / Refer</span>
                    <span className="text-[10px] text-rose-100">जोखिम मूल्यांकन व रेफरल</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Voice Dictation Card */}
            <div
              onClick={() => setIsVoiceOpen(true)}
              className="p-3.5 bg-gradient-to-r from-emerald-50 to-teal-50 border border-emerald-200 rounded-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-emerald-700 text-white flex items-center justify-center shadow-xs">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-black text-emerald-950 block">
                    Voice Record Observation
                  </span>
                  <span className="text-[11px] text-emerald-800 font-medium">
                    बोलकर जांच दर्ज करें (BP, वजन, लक्षण)
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-emerald-800 bg-white px-2.5 py-1 rounded-xl border border-emerald-200">
                Tap 🎙️
              </span>
            </div>

            {/* Priority Tasks Due Today */}
            <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-emerald-700" />
                  Upcoming Follow-ups ({metrics.ancDueCount + metrics.pncDueCount})
                </span>
                <button
                  onClick={() => setActiveTab('schedule')}
                  className="text-[11px] font-bold text-emerald-700 hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2">
                {maatrStore
                  .getTasks()
                  .filter((t) => t.status === 'pending')
                  .slice(0, 3)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800">{task.visitType}</span>
                          <span className="text-stone-400">• {task.beneficiaryName}</span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1">{task.reason}</p>
                      </div>
                      <span className="text-[10px] font-bold text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        {task.dueDate}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: MOTHERS DIRECTORY                                                  */}
        {/* ========================================================================= */}
        {activeTab === 'beneficiaries' && !activeSubModule && (
          <BeneficiaryList
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onOpenRegisterMother={() => setIsRegisterOpen(true)}
            onOpenRecordANC={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSubModule('anc');
            }}
            onOpenRecordDelivery={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSubModule('delivery');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: TASKS & SCHEDULE                                                   */}
        {/* ========================================================================= */}
        {activeTab === 'schedule' && !activeSubModule && (
          <TasksScheduleSection
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onOpenRecordANC={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSubModule('anc');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 4: CLINICAL HUB (MORE MENU)                                           */}
        {/* ========================================================================= */}
        {activeTab === 'hub' && !activeSubModule && (
          <div className="space-y-3 animate-fadeIn">
            <div className="px-1">
              <h3 className="text-base font-extrabold text-slate-800">
                Clinical Healthcare Modules
              </h3>
              <p className="text-xs text-stone-500">
                Tap any module to view clinical records and protocols
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'anc',
                  title: 'ANC Tracking (प्रसवपूर्व जांच)',
                  desc: 'Record visits, BP, Hb, danger signs, IFA tablets & MoHFW schedules',
                  icon: Stethoscope,
                  color: 'text-teal-700 bg-teal-50 border-teal-200',
                  badge: `${metrics.ancDueCount} Due`,
                },
                {
                  id: 'delivery',
                  title: 'Delivery & Newborn Registry (प्रसव)',
                  desc: 'Record institutional deliveries, baby vitals, and birth outcomes',
                  icon: Baby,
                  color: 'text-sky-700 bg-sky-50 border-sky-200',
                  badge: 'Active',
                },
                {
                  id: 'pnc',
                  title: 'PNC Postnatal Tracking (प्रसवोत्तर)',
                  desc: '48 Hours, Day 7, Day 14, and 6 Weeks maternal & newborn checkpoints',
                  icon: Clock,
                  color: 'text-pink-700 bg-pink-50 border-pink-200',
                  badge: `${metrics.pncDueCount} Due`,
                },
                {
                  id: 'risk',
                  title: 'Risk Assessment Engine (जोखिम इंजन)',
                  desc: 'MoHFW-MCH-v2.4 explainable priority engine for maternal complications',
                  icon: ShieldAlert,
                  color: 'text-rose-700 bg-rose-50 border-rose-200',
                  badge: `${metrics.highPriorityCount} High Risk`,
                },
                {
                  id: 'referrals',
                  title: 'Referral Management (रेफरल)',
                  desc: 'Escalate to CHC / FRU / District Hospitals and track ambulance transport',
                  icon: Truck,
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                  badge: `${metrics.pendingReferralsCount} Pending`,
                },
                {
                  id: 'records',
                  title: 'Master Health Records (आरोग्य नोंदी)',
                  desc: 'Immutable longitudinal audit trail & printable maternal health summary',
                  icon: FileText,
                  color: 'text-emerald-700 bg-emerald-50 border-emerald-200',
                  badge: 'Audit Trail',
                },
                {
                  id: 'supervisor',
                  title: 'Supervisor Dashboard (पर्यवेक्षक ANM)',
                  desc: 'High-level Sub-Centre metrics, overdue tracker, and ASHA workload',
                  icon: ShieldCheck,
                  color: 'text-purple-700 bg-purple-50 border-purple-200',
                  badge: 'Supervisor',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToSubModule(item.id as any)}
                    className="w-full text-left p-3.5 bg-white hover:bg-stone-50 rounded-2xl border border-stone-200 flex items-center justify-between gap-3 shadow-xs transition-all active:scale-[0.98]"
                  >
                    <div className="flex items-center gap-3">
                      <div className={`w-10 h-10 rounded-2xl flex items-center justify-center border font-bold flex-shrink-0 ${item.color}`}>
                        <Icon className="w-5 h-5" />
                      </div>
                      <div className="space-y-0.5">
                        <span className="text-xs font-black text-slate-800 block">
                          {item.title}
                        </span>
                        <p className="text-[11px] text-stone-500 leading-snug">
                          {item.desc}
                        </p>
                      </div>
                    </div>
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-stone-100 text-stone-700 uppercase whitespace-nowrap">
                      {item.badge}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* SUB-MODULE DETAIL VIEWS                                                   */}
        {/* ========================================================================= */}
        {activeSubModule === 'anc' && (
          <ANCTrackingSection
            onOpenVoiceModal={() => setIsVoiceOpen(true)}
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
          />
        )}

        {activeSubModule === 'delivery' && (
          <DeliverySection onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)} />
        )}

        {activeSubModule === 'pnc' && (
          <PNCTrackingSection onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)} />
        )}

        {activeSubModule === 'risk' && (
          <RiskAssessmentSection
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onOpenReferral={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSubModule('referrals');
            }}
          />
        )}

        {activeSubModule === 'referrals' && (
          <ReferralSection onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)} />
        )}

        {activeSubModule === 'records' && (
          <MaternalHealthRecords onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)} />
        )}

        {activeSubModule === 'supervisor' && (
          <SupervisorDashboard onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)} />
        )}
      </main>

      {/* 3. Mobile Bottom Navigation Bar (Fixed at bottom for thumb-friendly navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
        {/* 1. Home / Dashboard */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'dashboard' && !activeSubModule
              ? 'text-emerald-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Heart className="w-5 h-5" />
          <span className="text-[10px]">{t.navDashboard}</span>
        </button>

        {/* 2. Mothers Directory */}
        <button
          onClick={() => {
            setActiveTab('beneficiaries');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all relative ${
            activeTab === 'beneficiaries' && !activeSubModule
              ? 'text-emerald-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">{t.navBeneficiaryList}</span>
          {metrics.totalMothers > 0 && (
            <span className="absolute -top-1 -right-1 bg-emerald-700 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {metrics.totalMothers}
            </span>
          )}
        </button>

        {/* 3. Tasks / Schedule */}
        <button
          onClick={() => {
            setActiveTab('schedule');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all relative ${
            activeTab === 'schedule' && !activeSubModule
              ? 'text-emerald-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">{t.navVisitSchedule}</span>
          {metrics.ancDueCount + metrics.pncDueCount > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {metrics.ancDueCount + metrics.pncDueCount}
            </span>
          )}
        </button>

        {/* 4. Clinical Hub (More) */}
        <button
          onClick={() => {
            setActiveTab('hub');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'hub' || activeSubModule !== null
              ? 'text-emerald-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Clinical Hub</span>
        </button>
      </nav>

      {/* 4. MODALS (Mobile friendly bottom-sheet styling) */}
      <RegisterMotherModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(newId) => {
          setIsRegisterOpen(false);
          setSelectedBeneficiaryId(newId);
        }}
      />

      <BeneficiaryProfileModal
        beneficiary={selectedBeneficiary}
        isOpen={Boolean(selectedBeneficiaryId)}
        onClose={() => setSelectedBeneficiaryId(null)}
        onOpenRecordANC={(id) => {
          setSelectedBeneficiaryId(null);
          navigateToSubModule('anc');
        }}
        onOpenRecordDelivery={(id) => {
          setSelectedBeneficiaryId(null);
          navigateToSubModule('delivery');
        }}
        onOpenReferral={(id) => {
          setSelectedBeneficiaryId(null);
          navigateToSubModule('referrals');
        }}
      />

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExtractedAndSaved={(id) => {
          setSelectedBeneficiaryId(id);
          navigateToSubModule('anc');
        }}
      />
    </div>
  );
};
