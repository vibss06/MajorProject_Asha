import React from 'react';
import { Activity, Heart, ArrowRight, Stethoscope, Baby, Sparkles } from 'lucide-react';
import type { Language } from '../utils/translations';

interface ProgramSelectProps {
  language: Language;
  onSelect: (program: 'ncd' | 'matrr') => void;
  onLogout?: () => void;
}

export const ProgramSelect: React.FC<ProgramSelectProps> = ({ language, onSelect, onLogout }) => {
  const isHindi = language === 'hi';

  return (
    <div className="flex-1 flex flex-col justify-between p-5 space-y-6 animate-fadeIn">
      {/* Welcome Header */}
      <div className="space-y-2 text-center pt-2">
        <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-semibold border border-emerald-100/80 mb-1">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{isHindi ? 'कृपया मॉड्यूल चुनें' : 'Select Program / Module'}</span>
        </div>
        <h2 className="text-2xl font-black text-slate-800 tracking-tight">
          {isHindi ? 'आप किस अनुभाग में काम करना चाहते हैं?' : 'Choose Healthcare Domain'}
        </h2>
        <p className="text-xs text-slate-500 font-medium max-w-xs mx-auto leading-relaxed">
          {isHindi 
            ? 'आगे बढ़ने के लिए NCD या Matrr में से कोई एक विकल्प चुनें।' 
            : 'Select either NCD or Matrr to proceed to the designated module.'}
        </p>
      </div>

      {/* 2 Options Cards */}
      <div className="space-y-4 flex-1 flex flex-col justify-center">
        {/* Option 1: NCD */}
        <button
          onClick={() => onSelect('ncd')}
          className="group w-full text-left bg-gradient-to-br from-white via-white to-amber-50/40 hover:to-amber-50 border-2 border-slate-200/80 hover:border-amber-400/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] relative overflow-hidden"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-amber-100/30 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-amber-100/80 border border-amber-200/60 flex items-center justify-center text-amber-700 shadow-sm group-hover:scale-105 group-hover:bg-amber-200/70 transition-all flex-shrink-0">
                <Activity className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-800 tracking-tight group-hover:text-amber-800 transition-colors">
                    NCD
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-amber-100 text-amber-800 border border-amber-200/60">
                    {isHindi ? 'गैर-संचारी रोग' : 'Chronic Care'}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-600">
                  {isHindi ? 'गैर-संचारी रोग प्रबंधन' : 'Non-Communicable Diseases'}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                  {isHindi 
                    ? 'उच्च रक्तचाप (BP), मधुमेह (Sugar), कैंसर स्क्रीनिंग और नियमित जांच।'
                    : 'Hypertension, Diabetes, Cancer screening, and chronic disease follow-ups.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-amber-700 group-hover:text-amber-800">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Stethoscope className="w-3.5 h-3.5" />
              {isHindi ? 'NCD अनुभाग खोलें' : 'Open NCD Section'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-amber-100/70 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>

        {/* Option 2: Matrr */}
        <button
          onClick={() => onSelect('matrr')}
          className="group w-full text-left bg-gradient-to-br from-white via-white to-rose-50/40 hover:to-rose-50 border-2 border-slate-200/80 hover:border-rose-400/80 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all duration-200 active:scale-[0.98] relative overflow-hidden"
        >
          {/* Subtle background decoration */}
          <div className="absolute top-0 right-0 w-28 h-28 bg-rose-100/30 rounded-bl-full pointer-events-none group-hover:scale-110 transition-transform" />
          
          <div className="flex items-start justify-between gap-3 relative z-10">
            <div className="flex items-start gap-4">
              <div className="w-14 h-14 rounded-2xl bg-rose-100/80 border border-rose-200/60 flex items-center justify-center text-rose-700 shadow-sm group-hover:scale-105 group-hover:bg-rose-200/70 transition-all flex-shrink-0">
                <Heart className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="text-xl font-black text-slate-800 tracking-tight group-hover:text-rose-800 transition-colors">
                    Matrr
                  </span>
                  <span className="px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider rounded-md bg-rose-100 text-rose-800 border border-rose-200/60">
                    {isHindi ? 'मातृ एवं शिशु' : 'MCH Care'}
                  </span>
                </div>
                <h4 className="text-xs font-semibold text-slate-600">
                  {isHindi ? 'मातृ एवं शिशु स्वास्थ्य' : 'Maternal & Child Healthcare'}
                </h4>
                <p className="text-[11px] text-slate-500 leading-snug pt-0.5">
                  {isHindi 
                    ? 'गर्भावस्था (ANC), प्रसव पश्चात (PNC), नवजात टीकाकरण और पोषण।'
                    : 'Antenatal care, Postnatal care, Immunization, and Infant nutrition.'}
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-rose-700 group-hover:text-rose-800">
            <span className="flex items-center gap-1.5 text-[11px]">
              <Baby className="w-3.5 h-3.5" />
              {isHindi ? 'Matrr अनुभाग खोलें' : 'Open Matrr Section'}
            </span>
            <div className="w-7 h-7 rounded-xl bg-rose-100/70 flex items-center justify-center group-hover:translate-x-1 transition-transform">
              <ArrowRight className="w-4 h-4" />
            </div>
          </div>
        </button>
      </div>

      {/* Footer info & Logout */}
      <div className="pt-2 text-center space-y-3">
        <p className="text-[11px] text-slate-400">
          {isHindi 
            ? '💡 आप बाद में कभी भी दोनों विकल्पों के बीच बदल सकते हैं।'
            : '💡 You can switch between NCD and Matrr anytime.'}
        </p>

        {onLogout && (
          <button
            onClick={onLogout}
            className="text-xs text-slate-400 hover:text-slate-600 underline font-medium transition-colors"
          >
            {isHindi ? 'लॉग आउट करें' : 'Log out'}
          </button>
        )}
      </div>
    </div>
  );
};
