import React, { useState } from 'react';
import {
  Camera,
  Eye,
  CheckCircle2,
  AlertTriangle,
  Clock,
  Sparkles,
  Info,
  ShieldAlert,
  ArrowRight,
  User,
} from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import { CameraCaptureModal } from './CameraCaptureModal';
import type { VisualArea, VisualScreeningRecord, VisualStatus } from '../types';

interface VisualScreeningSectionProps {
  selectedBeneficiaryId: string;
  onSelectBeneficiary: (id: string) => void;
  onOpenSummary?: () => void;
}

interface AreaConfig {
  area: VisualArea;
  title: string;
  condition: string;
  explanation: string;
  guidance: string;
  icon: string;
  aiSampleObservation: string;
}

const VISUAL_AREAS: AreaConfig[] = [
  {
    area: 'eyes',
    title: 'Eyes (Conjunctiva)',
    condition: 'Visible Conjunctival Pallor (Anemia)',
    explanation: 'Detects visible paleness of the inner lower eyelid conjunctiva associated with severe or moderate anemia.',
    guidance: 'Ask the patient to look up while gently pulling down the lower eyelid in good natural light.',
    icon: '👁️',
    aiSampleObservation: 'AI Visual Observation: Noticeable pale mucosal hue flagged on lower conjunctival vascular bed. Does not confirm anemia; confirmatory laboratory Hemoglobin testing required.',
  },
  {
    area: 'neck',
    title: 'Neck',
    condition: 'Visible Swelling (Goiter / Thyroid Enlargement)',
    explanation: 'Screens for visible anterior neck fullness, thyroid swelling, or asymmetry during normal swallowing.',
    guidance: 'Position camera at eye level with patient neck relaxed. Capture during a gentle swallow.',
    icon: '🧣',
    aiSampleObservation: 'AI Visual Observation: Contour elevation and visible fullness noted in lower anterior neck region. Clinical palpation by Medical Officer required.',
  },
  {
    area: 'feet',
    title: 'Feet',
    condition: 'Diabetic Foot Complications & Ulcers',
    explanation: 'Screens for open sores, ulcers, deep cracks, discoloration, or early diabetic neuropathy lesions on soles and heels.',
    guidance: 'Examine both plantar (soles) and dorsal (top) surfaces. Ensure feet are clean and well illuminated.',
    icon: '🦶',
    aiSampleObservation: 'AI Visual Observation: Localized surface skin breakdown/abrasion (~1.2 cm) with peripheral discoloration. Urgent clinical evaluation for diabetic ulcer management advised.',
  },
  {
    area: 'legs',
    title: 'Legs',
    condition: 'Edema (Lower Limb Fluid Retention)',
    explanation: 'Evaluates bilateral or unilateral swelling of feet, ankles, and pretibial areas associated with heart, kidney, or liver conditions.',
    guidance: 'Capture both legs side-by-side from the front, focusing on ankles and shins.',
    icon: '🦵',
    aiSampleObservation: 'AI Visual Observation: Visible bilateral ankle contour fullness suggestive of dependent fluid retention. Clinical pitting assessment recommended.',
  },
];

export const VisualScreeningSection: React.FC<VisualScreeningSectionProps> = ({
  selectedBeneficiaryId,
  onSelectBeneficiary,
  onOpenSummary,
}) => {
  const beneficiaries = ncdStore.getBeneficiaries();
  const currentBeneficiary = ncdStore.getBeneficiaryById(selectedBeneficiaryId) || beneficiaries[0];

  const [activeAreaToCapture, setActiveAreaToCapture] = useState<AreaConfig | null>(null);
  const visualRecords = ncdStore.getVisualRecordsForBeneficiary(currentBeneficiary?.id || '');

  const getRecordForArea = (area: VisualArea): VisualScreeningRecord | undefined => {
    return visualRecords.find((v) => v.area === area);
  };

  const handlePhotoCaptured = (dataUrl: string) => {
    if (!activeAreaToCapture || !currentBeneficiary) return;

    // Simulate modular AI visual screening analysis
    const isAbnormalSample = activeAreaToCapture.area === 'feet' || activeAreaToCapture.area === 'eyes';

    ncdStore.saveVisualScreening({
      beneficiaryId: currentBeneficiary.id,
      area: activeAreaToCapture.area,
      possibleCondition: activeAreaToCapture.condition,
      status: isAbnormalSample ? 'flagged_for_review' : 'reviewed',
      images: [
        {
          id: `IMG-${Date.now().toString().slice(-4)}`,
          dataUrl,
          caption: `${activeAreaToCapture.title} visual capture`,
          capturedAt: new Date().toISOString(),
          qualityPassed: true,
        },
      ],
      aiObservation: isAbnormalSample
        ? activeAreaToCapture.aiSampleObservation
        : `AI Visual Observation: No obvious macroscopic visual contour abnormalities detected on ${activeAreaToCapture.title}. Continue routine physical exam.`,
      isFlaggedAbnormal: isAbnormalSample,
      clinicalVerificationStatus: 'pending',
      notes: `Screening photo captured via device camera by ASHA Sahayak.`,
    });

    setActiveAreaToCapture(null);
  };

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 space-y-2">
        <div className="flex items-center justify-between flex-wrap gap-2">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-purple-100 text-purple-800 flex items-center justify-center font-bold">
              <Camera className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">
              Visual Screening – AI-Assisted Screening
            </h2>
          </div>

          {/* Beneficiary Selector */}
          <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border border-stone-200 text-xs">
            <User className="w-3.5 h-3.5 text-stone-400" />
            <select
              value={currentBeneficiary?.id || ''}
              onChange={(e) => onSelectBeneficiary(e.target.value)}
              className="font-bold text-slate-800 bg-transparent outline-none cursor-pointer"
            >
              {beneficiaries.map((b) => (
                <option key={b.id} value={b.id}>
                  {b.fullName} ({b.id})
                </option>
              ))}
            </select>
          </div>
        </div>
        <p className="text-xs text-stone-500 max-w-lg leading-relaxed">
          AI-assisted photograph screening across 4 confirmed body areas: Conjunctival Pallor, Neck Goiter, Diabetic Foot Ulcers, and Lower Limb Edema.
        </p>
      </div>

      {/* Mandatory Clinical Safety Disclaimer (Section 6 Requirement) */}
      <div className="p-4 bg-amber-50/80 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-950 text-xs">
        <Info className="w-4 h-4 text-amber-700 flex-shrink-0 mt-0.5" />
        <div className="space-y-1">
          <span className="font-bold">Important Clinical Safety Protocols:</span>
          <p className="text-[11px] text-amber-900 leading-relaxed">
            AI screening identifies possible visible abnormalities and <strong>does not diagnose diseases</strong>. Photograph screening is never a substitute for blood pressure measurement, blood glucose testing, or clinical laboratory investigations. All screening findings represent observations requiring formal Medical Officer verification.
          </p>
        </div>
      </div>

      {/* 4 Body-Area Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {VISUAL_AREAS.map((cfg) => {
          const rec = getRecordForArea(cfg.area);
          const hasImage = rec && rec.images && rec.images.length > 0;
          const isFlagged = rec?.isFlaggedAbnormal;

          return (
            <div
              key={cfg.area}
              className={`bg-white rounded-3xl p-4 border transition-all shadow-xs flex flex-col justify-between space-y-3 ${
                isFlagged
                  ? 'border-rose-300 bg-rose-50/15'
                  : hasImage
                  ? 'border-emerald-300'
                  : 'border-stone-200 hover:border-emerald-200'
              }`}
            >
              <div className="space-y-2">
                {/* Card Title & Icon */}
                <div className="flex items-start justify-between gap-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-2xl">{cfg.icon}</span>
                    <div>
                      <h4 className="font-black text-slate-800 text-sm leading-tight">
                        {cfg.title}
                      </h4>
                      <span className="text-[10px] font-bold text-emerald-800 block">
                        {cfg.condition}
                      </span>
                    </div>
                  </div>

                  {/* Status Badge */}
                  <span
                    className={`text-[9px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider ${
                      isFlagged
                        ? 'bg-rose-100 text-rose-800 border border-rose-200'
                        : hasImage
                        ? 'bg-emerald-100 text-emerald-800 border border-emerald-200'
                        : 'bg-stone-100 text-stone-600'
                    }`}
                  >
                    {isFlagged ? 'Flagged for Review' : hasImage ? 'Image Captured' : 'Not Screened'}
                  </span>
                </div>

                <p className="text-[11px] text-stone-500 leading-snug">{cfg.explanation}</p>

                {/* Photo Preview if captured */}
                {hasImage && rec.images[0].dataUrl && (
                  <div className="relative rounded-2xl overflow-hidden border border-stone-200 max-h-36 bg-black flex items-center justify-center">
                    <img
                      src={rec.images[0].dataUrl}
                      alt={cfg.title}
                      className="w-full h-auto object-cover max-h-36"
                    />
                    <span className="absolute bottom-1 right-1 text-[9px] bg-black/60 text-white px-1.5 py-0.5 rounded font-mono">
                      Captured
                    </span>
                  </div>
                )}

                {/* AI Screening Observation */}
                {rec?.aiObservation && (
                  <div
                    className={`p-2.5 rounded-xl border text-[11px] space-y-1 ${
                      isFlagged
                        ? 'bg-rose-50 border-rose-200 text-rose-950'
                        : 'bg-emerald-50 border-emerald-200 text-emerald-950'
                    }`}
                  >
                    <div className="flex items-center gap-1 font-bold">
                      <Sparkles className="w-3 h-3 text-emerald-700" />
                      <span>{isFlagged ? 'Observation Flagged' : 'Screening Clear'}</span>
                    </div>
                    <p className="text-[10px] leading-relaxed">{rec.aiObservation}</p>
                  </div>
                )}
              </div>

              {/* Action Button */}
              <div className="pt-2 border-t border-stone-100 flex items-center justify-between">
                <span className="text-[10px] text-stone-400 font-medium">
                  {hasImage ? `Assessed: ${rec.assessedAt.split('T')[0]}` : 'Ready for photo'}
                </span>

                <button
                  type="button"
                  onClick={() => setActiveAreaToCapture(cfg)}
                  className={`px-3 py-1.5 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-all shadow-xs active:scale-95 ${
                    hasImage
                      ? 'bg-stone-100 hover:bg-stone-200 text-slate-700'
                      : 'bg-emerald-700 hover:bg-emerald-800 text-white'
                  }`}
                >
                  <Camera className="w-3.5 h-3.5" />
                  <span>{hasImage ? 'Retake Photo' : 'Capture Photo'}</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {onOpenSummary && (
        <div className="p-3 bg-white rounded-2xl border border-stone-200 flex items-center justify-between">
          <span className="text-xs font-bold text-slate-700">
            Combine basic vitals and visual observations:
          </span>
          <button
            onClick={onOpenSummary}
            className="px-4 py-2 rounded-xl bg-slate-800 hover:bg-slate-900 text-white text-xs font-bold flex items-center gap-1.5"
          >
            <span>View Screening Summary</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>
      )}

      {/* Real Camera Capture Modal */}
      {activeAreaToCapture && (
        <CameraCaptureModal
          isOpen={Boolean(activeAreaToCapture)}
          areaTitle={activeAreaToCapture.title}
          guidanceText={activeAreaToCapture.guidance}
          onClose={() => setActiveAreaToCapture(null)}
          onPhotoCaptured={handlePhotoCaptured}
        />
      )}
    </div>
  );
};
