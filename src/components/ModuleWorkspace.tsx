import React from 'react';
import { Activity, Heart, ArrowLeft, Layers, Sparkles, CheckCircle2 } from 'lucide-react';
import type { Language } from '../utils/translations';

interface ModuleWorkspaceProps {
  program: 'ncd' | 'matrr';
  language: Language;
  onChangeProgram: () => void;
  onExploreDefaultDashboard?: () => void;
}

export const ModuleWorkspace: React.FC<ModuleWorkspaceProps> = ({
  program,
  language,
  onChangeProgram,
  onExploreDefaultDashboard,
}) => {
  const isHindi = language === 'hi';
  const isNCD = program === 'ncd';

  return (
    <div className="p-5 space-y-5 animate-fadeIn">
      {/* Top Navigation / Change button */}
      <div className="flex items-center justify-between">
        <button
          onClick={onChangeProgram}
          className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white border border-slate-200 text-slate-600 hover:text-slate-900 hover:border-slate-300 text-xs font-semibold shadow-sm transition-all active:scale-95"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>{isHindi ? 'विकल्प बदलें (NCD / Matrr)' : 'Switch Option (NCD / Matrr)'}</span>
        </button>

        <span
          className={`px-2.5 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider ${
            isNCD
              ? 'bg-amber-100 text-amber-800 border border-amber-200'
              : 'bg-rose-100 text-rose-800 border border-rose-200'
          }`}
        >
          {isNCD ? 'NCD Mode' : 'Matrr Mode'}
        </span>
      </div>

      {/* Hero Banner for Selected Program */}
      <div
        className={`rounded-3xl p-6 text-white shadow-lg relative overflow-hidden ${
          isNCD
            ? 'bg-gradient-to-br from-amber-600 via-amber-700 to-orange-700'
            : 'bg-gradient-to-br from-rose-600 via-pink-700 to-rose-800'
        }`}
      >
        <div className="relative z-10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center text-white border border-white/20">
            {isNCD ? <Activity className="w-6 h-6" /> : <Heart className="w-6 h-6" />}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-2xl font-black tracking-tight">
                {isNCD ? 'NCD' : 'Matrr'}
              </h2>
              <span className="px-2 py-0.5 rounded-md bg-white/20 text-[10px] font-bold uppercase tracking-wider backdrop-blur-sm">
                {isHindi ? 'सक्रिय' : 'Active'}
              </span>
            </div>
            <p className="text-xs text-white/90 font-medium mt-1">
              {isNCD
                ? isHindi
                  ? 'गैर-संचारी रोग प्रबंधन (Hypertension, Diabetes, Screening)'
                  : 'Non-Communicable Diseases (Hypertension, Diabetes, Screening)'
                : isHindi
                  ? 'मातृ एवं शिशु स्वास्थ्य (ANC, PNC, Immunization)'
                  : 'Maternal & Child Healthcare (ANC, PNC, Immunization)'}
            </p>
          </div>
        </div>

        {/* Decorative circle */}
        <div className="absolute -right-8 -bottom-8 w-36 h-36 bg-white/10 rounded-full blur-xl pointer-events-none" />
      </div>

      {/* Structure Pending Box */}
      <div className="bg-white rounded-3xl p-5 border border-slate-200/80 shadow-sm space-y-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 rounded-2xl bg-emerald-50 text-emerald-600 flex items-center justify-center border border-emerald-100 flex-shrink-0 mt-0.5">
            <Sparkles className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h3 className="text-sm font-bold text-slate-800">
              {isHindi ? 'संरचना के लिए तैयार' : 'Ready for Custom Structure'}
            </h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              {isHindi
                ? `आपने ${isNCD ? 'NCD' : 'Matrr'} विकल्प चुना है। अब आप मुझे बताएं कि इसमें कौन सा स्ट्रक्चर, फॉर्म्स, टेबल्स या फील्ड्स जोड़ना है!`
                : `You have selected the ${isNCD ? 'NCD' : 'Matrr'} option. Now let me know the structure, fields, tables, or workflows you want to add here!`}
            </p>
          </div>
        </div>

        <div className="bg-slate-50 rounded-2xl p-4 border border-slate-100 space-y-2.5">
          <div className="flex items-center gap-2 text-xs font-semibold text-slate-700">
            <Layers className="w-4 h-4 text-slate-500" />
            <span>{isHindi ? 'वर्तमान स्थिति:' : 'Current Status:'}</span>
          </div>
          <ul className="text-[11px] text-slate-600 space-y-1.5 pl-1">
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHindi ? 'लॉगिन के बाद 2 विकल्प (NCD & Matrr) सक्रिय हैं' : '2 Options (NCD & Matrr) active right after login'}</span>
            </li>
            <li className="flex items-center gap-2">
              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
              <span>{isHindi ? `वर्तमान चयन: ${isNCD ? 'NCD' : 'Matrr'}` : `Selected module: ${isNCD ? 'NCD' : 'Matrr'}`}</span>
            </li>
            <li className="flex items-center gap-2">
              <div className="w-3.5 h-3.5 rounded-full border-2 border-dashed border-amber-500" />
              <span className="text-amber-700 font-medium">
                {isHindi ? 'यूजर के स्ट्रक्चर इनपुट की प्रतीक्षा है...' : 'Awaiting your structure definition...'}
              </span>
            </li>
          </ul>
        </div>

        {onExploreDefaultDashboard && (
          <div className="pt-1">
            <button
              onClick={onExploreDefaultDashboard}
              className="w-full py-2.5 px-4 rounded-2xl bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-bold transition-all text-center"
            >
              {isHindi ? 'अथवा मौजूदा ASHA डैशबोर्ड देखें' : 'Or view existing ASHA dashboard'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
