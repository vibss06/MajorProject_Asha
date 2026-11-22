import React, { useState, useEffect } from 'react';
import {
  Activity,
  Users,
  Calendar,
  AlertTriangle,
  Clock,
  Truck,
  Plus,
  Search,
  Stethoscope,
  Camera,
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
  Scale,
  Eye,
} from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import { NCD_TRANSLATIONS } from '../utils/ncdTranslations';
import type { Language, SharedBeneficiary } from '../types';

// Subcomponents
import { RegisterBeneficiaryModal } from './RegisterBeneficiaryModal';
import { BeneficiaryList } from './BeneficiaryList';
import { BasicScreeningSection } from './BasicScreeningSection';
import { VisualScreeningSection } from './VisualScreeningSection';
import { ScreeningSummaryModal } from './ScreeningSummaryModal';
import { RiskAssessmentSection } from './RiskAssessmentSection';
import { FollowUpSection } from './FollowUpSection';
import { ReferralSection } from './ReferralSection';
import { SupervisorDashboard } from './SupervisorDashboard';
import { BeneficiaryHealthProfileModal } from './BeneficiaryHealthProfileModal';
import { VoiceAssistantModal } from './VoiceAssistantModal';

interface NCDMainProps {
  appLanguage: 'en' | 'hi';
  onSwitchProgram?: () => void;
  onOpenSettings?: () => void;
  onLogout?: () => void;
}

export const NCDMain: React.FC<NCDMainProps> = ({
  appLanguage,
  onSwitchProgram,
  onOpenSettings,
  onLogout,
}) => {
  const [ncdLang, setNcdLang] = useState<Language>(
    (localStorage.getItem('ncd_language') as Language) || (appLanguage === 'hi' ? 'hi' : 'en')
  );

  const [activeTab, setActiveTab] = useState<'dashboard' | 'beneficiaries' | 'followups' | 'hub'>('dashboard');
  const [activeSubModule, setActiveSubModule] = useState<
    'basic' | 'visual' | 'risk' | 'referrals' | 'supervisor' | null
  >(null);

  const [searchQuery, setSearchQuery] = useState('');
  const [isRegisterOpen, setIsRegisterOpen] = useState(false);
  const [isVoiceOpen, setIsVoiceOpen] = useState(false);
  const [isSummaryOpen, setIsSummaryOpen] = useState(false);
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string | null>(null);

  // Store state
  const [metrics, setMetrics] = useState(() => ncdStore.getDashboardMetrics());
  const [syncStatus, setSyncStatus] = useState(() => ncdStore.getSyncStatus());
  const [isSyncing, setIsSyncing] = useState(false);

  useEffect(() => {
    const unsubscribe = ncdStore.subscribe(() => {
      setMetrics(ncdStore.getDashboardMetrics());
      setSyncStatus(ncdStore.getSyncStatus());
    });
    return () => unsubscribe();
  }, []);

  const t = NCD_TRANSLATIONS[ncdLang] || NCD_TRANSLATIONS.en;

  const handleLanguageChange = (lang: Language) => {
    setNcdLang(lang);
    localStorage.setItem('ncd_language', lang);
  };

  const handleManualSync = async () => {
    setIsSyncing(true);
    await ncdStore.syncWithCloud();
    setIsSyncing(false);
  };

  const selectedBeneficiary = selectedBeneficiaryId
    ? ncdStore.getBeneficiaryById(selectedBeneficiaryId) || null
    : null;

  const navigateToSub = (sub: 'basic' | 'visual' | 'risk' | 'referrals' | 'supervisor') => {
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
            <div className="w-9 h-9 rounded-2xl bg-amber-600 text-white flex items-center justify-center font-black text-sm shadow-xs">
              <Activity className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-base font-extrabold text-slate-900 tracking-tight">
                  {t.moduleTitle}
                </span>
                <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-100 text-amber-800 font-bold uppercase">
                  NCD Care
                </span>
              </div>
              <span className="block text-[9px] text-stone-500 font-medium">
                {t.moduleSubtitle}
              </span>
            </div>
          </div>

          {/* Quick Header Actions */}
          <div className="flex items-center gap-1.5">
            {/* Language Switcher */}
            <div className="flex items-center bg-stone-100 rounded-xl p-0.5 border border-stone-200 text-[10px] font-bold">
              {(['en', 'hi', 'mr'] as const).map((l) => (
                <button
                  key={l}
                  onClick={() => handleLanguageChange(l)}
                  className={`px-1.5 py-1 rounded-lg uppercase transition-all ${
                    ncdLang === l
                      ? 'bg-white text-amber-800 shadow-xs font-black'
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

        {/* Sub-bar: Module switch & sync */}
        <div className="flex items-center justify-between pt-2 mt-2 border-t border-stone-100 text-[11px]">
          {onSwitchProgram ? (
            <button
              onClick={onSwitchProgram}
              className="font-bold text-amber-900 hover:text-amber-950 flex items-center gap-1 bg-amber-50 px-2 py-0.5 rounded-lg border border-amber-200"
            >
              <span>NCD Module Active</span>
              <span className="text-[9px] uppercase font-bold text-amber-700">(Switch ▾)</span>
            </button>
          ) : (
            <span className="font-bold text-amber-900">NCD Active</span>
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

      {/* 2. Main Body Content */}
      <main className="p-4 space-y-4 flex-1">
        {/* Sub-module back navigation pill */}
        {activeSubModule && (
          <button
            onClick={navigateBackToDashboard}
            className="w-full flex items-center justify-between p-2.5 rounded-2xl bg-white border border-stone-200 text-amber-900 text-xs font-bold shadow-xs hover:bg-stone-50 transition-all active:scale-[0.99]"
          >
            <span className="flex items-center gap-1.5">
              <ChevronLeft className="w-4 h-4" />
              <span>← Back to NCD Dashboard (डैशबोर्ड पर वापस जाएं)</span>
            </span>
            <span className="text-[10px] text-stone-400 font-semibold uppercase">Home</span>
          </button>
        )}

        {/* ========================================================================= */}
        {/* TAB 1: MAIN DASHBOARD                                                     */}
        {/* ========================================================================= */}
        {activeTab === 'dashboard' && !activeSubModule && (
          <div className="space-y-4 animate-fadeIn">
            {/* Quick Search Bar */}
            <div className="relative">
              <Search className="w-4 h-4 text-stone-400 absolute left-3.5 top-3" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search citizen by name, mobile, village, or ID..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-stone-200 text-xs text-slate-800 placeholder-stone-400 focus:outline-none focus:border-amber-600 focus:ring-1 focus:ring-amber-600 shadow-xs"
              />

              {/* Instant Search Results */}
              {searchQuery && (
                <div className="absolute left-0 right-0 top-12 z-20 bg-white rounded-2xl p-2.5 border border-stone-200 shadow-lg space-y-1.5 animate-fadeIn">
                  {ncdStore
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
                        <span className="text-amber-800 font-bold text-[11px] flex items-center gap-1">
                          Health Profile →
                        </span>
                      </div>
                    ))}
                </div>
              )}
            </div>

            {/* 4 Core Summary Cards (Clean 2x2 grid) */}
            <div className="grid grid-cols-2 gap-2.5">
              <div
                onClick={() => setActiveTab('beneficiaries')}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Registered Citizens
                </span>
                <span className="text-2xl font-black text-slate-800 block mt-0.5">
                  {metrics.totalBeneficiaries}
                </span>
                <span className="text-[10px] text-emerald-700 font-semibold mt-1 block">
                  {metrics.totalScreened} Screened ({Math.round((metrics.totalScreened / (metrics.totalBeneficiaries || 1)) * 100)}%)
                </span>
              </div>

              <div
                onClick={() => setActiveTab('followups')}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs hover:border-amber-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Follow-ups Due
                </span>
                <span className="text-2xl font-black text-amber-700 block mt-0.5">
                  {metrics.followupsDue}
                </span>
                <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                  Repeat BP & Sugar check
                </span>
              </div>

              <div
                onClick={() => navigateToSub('risk')}
                className="bg-white p-3.5 rounded-2xl border border-rose-200 bg-rose-50/20 shadow-xs hover:border-rose-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-rose-800 uppercase tracking-wider block">
                  High Risk (Clinical Review)
                </span>
                <span className="text-2xl font-black text-rose-700 block mt-0.5">
                  {metrics.highRiskCount}
                </span>
                <span className="text-[10px] text-rose-700 font-semibold mt-1 block">
                  Requires Doctor Exam ⚠️
                </span>
              </div>

              <div
                onClick={() => navigateToSub('referrals')}
                className="bg-white p-3.5 rounded-2xl border border-stone-200 shadow-xs hover:border-sky-300 transition-all cursor-pointer active:scale-95"
              >
                <span className="text-[10px] font-bold text-stone-400 uppercase tracking-wider block">
                  Pending Referrals
                </span>
                <span className="text-2xl font-black text-sky-800 block mt-0.5">
                  {metrics.pendingReferrals}
                </span>
                <span className="text-[10px] text-stone-500 font-medium mt-1 block">
                  Primary Health Centre
                </span>
              </div>
            </div>

            {/* Quick Action Tiles (High-contrast, large touch targets) */}
            <div className="space-y-1.5">
              <span className="text-xs font-bold text-slate-700 block px-1">
                Primary Actions (त्वरित NCD कार्य)
              </span>

              <div className="grid grid-cols-2 gap-2.5">
                {/* 1. Register Beneficiary */}
                <button
                  onClick={() => setIsRegisterOpen(true)}
                  className="p-3.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Plus className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Register Citizen</span>
                    <span className="text-[10px] text-emerald-100">नया लाभार्थी पंजीयन</span>
                  </div>
                </button>

                {/* 2. Basic NCD Screening */}
                <button
                  onClick={() => navigateToSub('basic')}
                  className="p-3.5 rounded-2xl bg-teal-700 hover:bg-teal-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Stethoscope className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Basic Screening</span>
                    <span className="text-[10px] text-teal-100">बीपी, शुगर, बीएमआई जांच</span>
                  </div>
                </button>

                {/* 3. Visual AI Screening (Core feature) */}
                <button
                  onClick={() => navigateToSub('visual')}
                  className="p-3.5 rounded-2xl bg-purple-700 hover:bg-purple-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <Camera className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Visual AI Screen</span>
                    <span className="text-[10px] text-purple-100">आंख, गर्दन, पैर फोटो जांच</span>
                  </div>
                </button>

                {/* 4. High-Risk & Referrals */}
                <button
                  onClick={() => navigateToSub('risk')}
                  className="p-3.5 rounded-2xl bg-rose-700 hover:bg-rose-800 text-white flex flex-col items-start justify-between min-h-[90px] shadow-sm transition-all active:scale-95 text-left"
                >
                  <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center font-bold">
                    <ShieldAlert className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <span className="text-xs font-black block">Risk & Referrals</span>
                    <span className="text-[10px] text-rose-100">जोखिम मूल्यांकन व रेफरल</span>
                  </div>
                </button>
              </div>
            </div>

            {/* Voice Dictation Card */}
            <div
              onClick={() => setIsVoiceOpen(true)}
              className="p-3.5 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl flex items-center justify-between cursor-pointer active:scale-95 transition-all shadow-xs"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-amber-600 text-white flex items-center justify-center shadow-xs">
                  <Mic className="w-5 h-5 animate-pulse" />
                </div>
                <div>
                  <span className="text-xs font-black text-amber-950 block">
                    Voice Dictate Screening
                  </span>
                  <span className="text-[11px] text-amber-900 font-medium">
                    बोलकर बीपी व माप दर्ज करें (BP 140/90, वजन 68kg)
                  </span>
                </div>
              </div>
              <span className="text-xs font-bold text-amber-900 bg-white px-2.5 py-1 rounded-xl border border-amber-200">
                Tap 🎙️
              </span>
            </div>

            {/* Priority Follow-up Tasks */}
            <div className="bg-white rounded-3xl p-4 border border-stone-200 shadow-xs space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-xs font-bold text-slate-800 flex items-center gap-1.5">
                  <Calendar className="w-4 h-4 text-amber-700" />
                  Follow-ups Due ({metrics.followupsDue})
                </span>
                <button
                  onClick={() => setActiveTab('followups')}
                  className="text-[11px] font-bold text-amber-800 hover:underline"
                >
                  View All →
                </button>
              </div>

              <div className="space-y-2">
                {ncdStore
                  .getTasks()
                  .filter((t) => t.status === 'Pending')
                  .slice(0, 3)
                  .map((task) => (
                    <div
                      key={task.id}
                      className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-xs"
                    >
                      <div className="space-y-0.5">
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800">{task.beneficiaryName}</span>
                          <span className="text-stone-400">({task.priority} Priority)</span>
                        </div>
                        <p className="text-[11px] text-stone-500 line-clamp-1">{task.reason}</p>
                      </div>
                      <span className="text-[10px] font-bold text-amber-800 bg-amber-50 px-2 py-0.5 rounded-lg whitespace-nowrap">
                        {task.dueDate}
                      </span>
                    </div>
                  ))}
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* TAB 2: BENEFICIARIES DIRECTORY                                            */}
        {/* ========================================================================= */}
        {activeTab === 'beneficiaries' && !activeSubModule && (
          <BeneficiaryList
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onOpenRegisterModal={() => setIsRegisterOpen(true)}
            onOpenBasicScreening={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSub('basic');
            }}
            onOpenVisualScreening={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSub('visual');
            }}
          />
        )}

        {/* ========================================================================= */}
        {/* TAB 3: FOLLOW-UP TASKS                                                    */}
        {/* ========================================================================= */}
        {activeTab === 'followups' && !activeSubModule && (
          <FollowUpSection
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onOpenScreening={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSub('basic');
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
                NCD Clinical Tools & Modules
              </h3>
              <p className="text-xs text-stone-500">
                Tap any module to view clinical measurements and screening protocols
              </p>
            </div>

            <div className="grid grid-cols-1 gap-2.5">
              {[
                {
                  id: 'basic',
                  title: 'Basic NCD Screening (बीपी व शुगर जांच)',
                  desc: 'Record systolic/diastolic BP, blood glucose, automatic BMI, and CBAC history',
                  icon: Stethoscope,
                  color: 'text-teal-700 bg-teal-50 border-teal-200',
                  badge: 'Vitals & BMI',
                },
                {
                  id: 'visual',
                  title: 'Visual Screening – AI-Assisted (विजुअल जांच)',
                  desc: '4 confirmed areas: Eyes (Pallor), Neck (Goiter), Feet (Ulcers), Legs (Edema)',
                  icon: Camera,
                  color: 'text-purple-700 bg-purple-50 border-purple-200',
                  badge: '4 Body Areas',
                },
                {
                  id: 'risk',
                  title: 'Risk Assessment Engine (जोखिम मूल्यांकन)',
                  desc: 'NPCDCS-NCD-v3.1 explainable priority engine for hypertension & diabetes',
                  icon: ShieldAlert,
                  color: 'text-rose-700 bg-rose-50 border-rose-200',
                  badge: `${metrics.highRiskCount} High Risk`,
                },
                {
                  id: 'referrals',
                  title: 'Referral Management (रेफरल)',
                  desc: 'Coordinate PHC Saoner medical officer escalations & transport follow-up',
                  icon: Truck,
                  color: 'text-amber-700 bg-amber-50 border-amber-200',
                  badge: `${metrics.pendingReferrals} Pending`,
                },
                {
                  id: 'supervisor',
                  title: 'Supervisor Dashboard (पर्यवेक्षक ANM/PHC)',
                  desc: 'Sub-Centre population screening coverage, high-risk review & ASHA workload',
                  icon: ShieldCheck,
                  color: 'text-purple-700 bg-purple-50 border-purple-200',
                  badge: 'Supervisor',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <button
                    key={item.id}
                    onClick={() => navigateToSub(item.id as any)}
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
        {activeSubModule === 'basic' && (
          <BasicScreeningSection
            selectedBeneficiaryId={selectedBeneficiaryId || ncdStore.getBeneficiaries()[0]?.id || ''}
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onScreeningSaved={(id) => {
              setSelectedBeneficiaryId(id);
              setIsSummaryOpen(true);
            }}
          />
        )}

        {activeSubModule === 'visual' && (
          <VisualScreeningSection
            selectedBeneficiaryId={selectedBeneficiaryId || ncdStore.getBeneficiaries()[0]?.id || ''}
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onOpenSummary={() => setIsSummaryOpen(true)}
          />
        )}

        {activeSubModule === 'risk' && (
          <RiskAssessmentSection
            onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)}
            onOpenReferral={(id) => {
              setSelectedBeneficiaryId(id);
              navigateToSub('referrals');
            }}
          />
        )}

        {activeSubModule === 'referrals' && (
          <ReferralSection onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)} />
        )}

        {activeSubModule === 'supervisor' && (
          <SupervisorDashboard onSelectBeneficiary={(id) => setSelectedBeneficiaryId(id)} />
        )}
      </main>

      {/* 3. Mobile Bottom Navigation Bar (Fixed for thumb navigation) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-lg mx-auto bg-white/95 backdrop-blur-md border-t border-stone-200 px-4 py-2 flex items-center justify-around z-40 shadow-[0_-4px_20px_-4px_rgba(0,0,0,0.06)]">
        {/* 1. Home / Dashboard */}
        <button
          onClick={() => {
            setActiveTab('dashboard');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'dashboard' && !activeSubModule
              ? 'text-amber-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Activity className="w-5 h-5" />
          <span className="text-[10px]">{t.navDashboard}</span>
        </button>

        {/* 2. Beneficiaries */}
        <button
          onClick={() => {
            setActiveTab('beneficiaries');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all relative ${
            activeTab === 'beneficiaries' && !activeSubModule
              ? 'text-amber-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Users className="w-5 h-5" />
          <span className="text-[10px]">{t.navBeneficiaries}</span>
          {metrics.totalBeneficiaries > 0 && (
            <span className="absolute -top-1 -right-1 bg-amber-700 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {metrics.totalBeneficiaries}
            </span>
          )}
        </button>

        {/* 3. Follow-ups */}
        <button
          onClick={() => {
            setActiveTab('followups');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all relative ${
            activeTab === 'followups' && !activeSubModule
              ? 'text-amber-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Calendar className="w-5 h-5" />
          <span className="text-[10px]">{t.navFollowups}</span>
          {metrics.followupsDue > 0 && (
            <span className="absolute -top-1 -right-1 bg-rose-600 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center">
              {metrics.followupsDue}
            </span>
          )}
        </button>

        {/* 4. Clinical Hub */}
        <button
          onClick={() => {
            setActiveTab('hub');
            setActiveSubModule(null);
          }}
          className={`flex flex-col items-center gap-1 transition-all ${
            activeTab === 'hub' || activeSubModule !== null
              ? 'text-amber-700 scale-105 font-bold'
              : 'text-stone-400 hover:text-stone-600'
          }`}
        >
          <Layers className="w-5 h-5" />
          <span className="text-[10px]">Clinical Hub</span>
        </button>
      </nav>

      {/* 4. Modals */}
      <RegisterBeneficiaryModal
        isOpen={isRegisterOpen}
        onClose={() => setIsRegisterOpen(false)}
        onRegistered={(newId) => {
          setSelectedBeneficiaryId(newId);
          navigateToSub('basic');
        }}
      />

      <BeneficiaryHealthProfileModal
        beneficiary={selectedBeneficiary}
        isOpen={Boolean(selectedBeneficiaryId)}
        onClose={() => setSelectedBeneficiaryId(null)}
        onStartBasicScreening={(id) => {
          setSelectedBeneficiaryId(id);
          navigateToSub('basic');
        }}
        onStartVisualScreening={(id) => {
          setSelectedBeneficiaryId(id);
          navigateToSub('visual');
        }}
        onOpenReferral={(id) => {
          setSelectedBeneficiaryId(id);
          navigateToSub('referrals');
        }}
      />

      <ScreeningSummaryModal
        beneficiary={selectedBeneficiary}
        isOpen={isSummaryOpen}
        onClose={() => setIsSummaryOpen(false)}
        onOpenReferral={(id) => {
          setSelectedBeneficiaryId(id);
          navigateToSub('referrals');
        }}
        onOpenFollowup={(id) => {
          setSelectedBeneficiaryId(id);
          setActiveTab('followups');
          setActiveSubModule(null);
        }}
      />

      <VoiceAssistantModal
        isOpen={isVoiceOpen}
        onClose={() => setIsVoiceOpen(false)}
        onExtractedAndSaved={(id) => {
          setSelectedBeneficiaryId(id);
          navigateToSub('basic');
        }}
      />
    </div>
  );
};
