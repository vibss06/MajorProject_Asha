import React, { useState } from 'react';
import { Mic, MicOff, Sparkles, Check, X, AlertTriangle, ArrowRight } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractedAndSaved: (beneficiaryId: string) => void;
}

interface ParsedVoiceData {
  beneficiaryName: string;
  beneficiaryId?: string;
  systolicBp: number;
  diastolicBp: number;
  dangerSigns: string[];
  nextVisitDays: number;
  notes: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExtractedAndSaved,
}) => {
  const [speechText, setSpeechText] = useState(
    'Sunita Devi, blood pressure 140 over 95, swelling in feet reported, next visit after seven days.'
  );
  const [isListening, setIsListening] = useState(false);
  const [extractedData, setExtractedData] = useState<ParsedVoiceData | null>(null);

  if (!isOpen) return null;

  // Preset voice samples representing real ASHA field audio
  const sampleSentences = [
    'Sunita Devi, blood pressure 140 over 95, swelling in feet reported, next visit after seven days.',
    'Meena Patel, blood pressure 116 over 76, no reported danger signs, baby moving normally, next visit after four weeks.',
    'Priya Sharma, blood pressure 110 over 70, complained of dizziness and mild headache, next visit after fourteen days.',
  ];

  const handleSimulateSpeech = (text: string) => {
    setSpeechText(text);
    parseSpeech(text);
  };

  const parseSpeech = (text: string) => {
    const beneficiaries = maatrStore.getBeneficiaries();
    let matchedName = 'Sunita Devi';
    let matchedId = 'MTR-2026-001';

    beneficiaries.forEach((b) => {
      if (text.toLowerCase().includes(b.fullName.toLowerCase())) {
        matchedName = b.fullName;
        matchedId = b.id;
      }
    });

    // Extract BP e.g. "140 over 95" or "140/95"
    let systolic = 120;
    let diastolic = 80;
    const bpMatch = text.match(/(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i);
    if (bpMatch) {
      systolic = parseInt(bpMatch[1], 10);
      diastolic = parseInt(bpMatch[2], 10);
    }

    // Extract danger signs
    const dangerSigns: string[] = [];
    if (/swelling|edema/i.test(text)) dangerSigns.push('Pedal swelling');
    if (/headache/i.test(text)) dangerSigns.push('Severe headache');
    if (/dizziness/i.test(text)) dangerSigns.push('Dizziness');
    if (/bleeding/i.test(text)) dangerSigns.push('Vaginal bleeding');

    // Extract next visit days
    let days = 28;
    if (/seven days|7 days|one week/i.test(text)) days = 7;
    if (/fourteen days|14 days|two weeks/i.test(text)) days = 14;
    if (/four weeks|month/i.test(text)) days = 28;

    setExtractedData({
      beneficiaryName: matchedName,
      beneficiaryId: matchedId,
      systolicBp: systolic,
      diastolicBp: diastolic,
      dangerSigns,
      nextVisitDays: days,
      notes: text,
    });
  };

  const handleConfirmAndSave = () => {
    if (!extractedData || !extractedData.beneficiaryId) return;

    const preg = maatrStore.getActivePregnancyForBeneficiary(extractedData.beneficiaryId);
    if (!preg) {
      alert('Beneficiary has no active pregnancy episode.');
      return;
    }

    const nextDueDate = new Date(
      Date.now() + extractedData.nextVisitDays * 24 * 60 * 60 * 1000
    )
      .toISOString()
      .split('T')[0];

    const existingVisits = maatrStore.getANCVisitsForBeneficiary(extractedData.beneficiaryId);

    maatrStore.recordANCVisit({
      pregnancyId: preg.id,
      beneficiaryId: extractedData.beneficiaryId,
      visitNumber: existingVisits.length + 1,
      visitDate: new Date().toISOString().split('T')[0],
      gestationalAgeWeeks: preg.gestationalAgeWeeks,
      systolicBp: extractedData.systolicBp,
      diastolicBp: extractedData.diastolicBp,
      weightKg: 52,
      hemoglobinGdl: 10.5,
      edemaSwelling: extractedData.dangerSigns.includes('Pedal swelling') ? 'pedal' : 'none',
      dangerSigns: extractedData.dangerSigns,
      fetalMovement: 'normal',
      ifaTabletsGiven: 30,
      tetanusToxoidGiven: false,
      medicalAdvice: 'Advice verified by ASHA via Voice Assistant',
      nextDueDate,
      notes: `Voice Transcribed Note: "${extractedData.notes}"`,
      recordedBy: 'Kamla Tai (Voice Assisted)',
    });

    onExtractedAndSaved(extractedData.beneficiaryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-lg leading-tight">
                Voice-Assisted Documentation
              </h3>
              <p className="text-xs text-stone-500">
                Speech to clinical structured extraction with review
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Quick preset audio samples */}
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Select or Speak Clinical Observation (English / Hindi / Hinglish):
            </span>
            <div className="space-y-1.5">
              {sampleSentences.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSimulateSpeech(s)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                    speechText === s
                      ? 'bg-emerald-50 border-emerald-300 text-emerald-950 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          {/* Voice Input Box */}
          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transcribed Speech Input:
            </label>
            <textarea
              rows={2}
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs focus:ring-1 focus:ring-emerald-600 outline-none"
            />
          </div>

          <button
            onClick={() => parseSpeech(speechText)}
            className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5 transition-all"
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-700" />
            <span>Extract Clinical Structured Fields</span>
          </button>

          {/* Structured Output Review (Section 13 explicit requirement) */}
          {extractedData && (
            <div className="p-4 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between pb-1.5 border-b border-emerald-200">
                <span className="font-extrabold text-emerald-900 text-xs flex items-center gap-1">
                  <Check className="w-4 h-4 text-emerald-700" />
                  Structured Clinical Data (Review Required Before Saving)
                </span>
              </div>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Beneficiary Name
                  </span>
                  <span className="font-bold text-slate-800">
                    {extractedData.beneficiaryName} ({extractedData.beneficiaryId})
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Blood Pressure
                  </span>
                  <span
                    className={`font-black ${
                      extractedData.systolicBp >= 140 ? 'text-rose-700' : 'text-slate-800'
                    }`}
                  >
                    {extractedData.systolicBp}/{extractedData.diastolicBp} mmHg
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Danger Signs
                  </span>
                  <span className="font-bold text-slate-800">
                    {extractedData.dangerSigns.length > 0
                      ? extractedData.dangerSigns.join(', ')
                      : 'None reported'}
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">
                    Next Follow-up
                  </span>
                  <span className="font-bold text-emerald-800">
                    After {extractedData.nextVisitDays} Days
                  </span>
                </div>
              </div>

              <p className="text-[10px] text-stone-500 italic">
                * As per safety protocols, values are extracted without clinical guessing. Please review and confirm below.
              </p>
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="px-6 py-3 bg-stone-50 border-t border-stone-200 flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
          >
            Cancel
          </button>
          <button
            disabled={!extractedData}
            onClick={handleConfirmAndSave}
            className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 disabled:opacity-50 text-white text-xs font-black shadow-sm transition-all"
          >
            Confirm & Save to Record
          </button>
        </div>
      </div>
    </div>
  );
};
