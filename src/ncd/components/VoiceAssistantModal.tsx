import React, { useState } from 'react';
import { Mic, Sparkles, Check, X } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import { calculateBMI } from '../utils/ncdRules';

interface VoiceAssistantModalProps {
  isOpen: boolean;
  onClose: () => void;
  onExtractedAndSaved: (beneficiaryId: string) => void;
}

interface ParsedNCDVoice {
  beneficiaryName: string;
  beneficiaryId?: string;
  systolicBp: number;
  diastolicBp: number;
  bloodGlucoseMgdl?: number;
  weightKg: number;
  heightCm: number;
  notes: string;
}

export const VoiceAssistantModal: React.FC<VoiceAssistantModalProps> = ({
  isOpen,
  onClose,
  onExtractedAndSaved,
}) => {
  const [speechText, setSpeechText] = useState(
    'Rahul Sharma, blood pressure 140 over 90, weight 68 kilograms, height 165 centimeters.'
  );
  const [extractedData, setExtractedData] = useState<ParsedNCDVoice | null>(null);

  if (!isOpen) return null;

  const sampleSentences = [
    'Rajesh Kumar, blood pressure 150 over 95, random blood sugar 170, weight 76 kilograms, height 168 centimeters.',
    'Ramesh Singh, blood pressure 160 over 98, weight 74 kilograms, height 170 centimeters.',
    'Kavita Bai, blood pressure 126 over 80, fasting blood sugar 130, weight 64 kilograms, height 152 centimeters.',
  ];

  const handleSimulate = (text: string) => {
    setSpeechText(text);
    parseNCDSpeech(text);
  };

  const parseNCDSpeech = (text: string) => {
    const beneficiaries = ncdStore.getBeneficiaries();
    let matchedName = beneficiaries[0]?.fullName || 'Beneficiary';
    let matchedId = beneficiaries[0]?.id || 'BEN-001';

    beneficiaries.forEach((b) => {
      if (text.toLowerCase().includes(b.fullName.toLowerCase())) {
        matchedName = b.fullName;
        matchedId = b.id;
      }
    });

    // BP
    let systolic = 120;
    let diastolic = 80;
    const bpMatch = text.match(/(\d{2,3})\s*(?:over|\/)\s*(\d{2,3})/i);
    if (bpMatch) {
      systolic = parseInt(bpMatch[1], 10);
      diastolic = parseInt(bpMatch[2], 10);
    }

    // Weight
    let weight = 65;
    const wtMatch = text.match(/weight\s*(\d{2,3})/i) || text.match(/(\d{2,3})\s*(?:kg|kilos|kilograms)/i);
    if (wtMatch) weight = parseInt(wtMatch[1], 10);

    // Height
    let height = 165;
    const htMatch = text.match(/height\s*(\d{2,3})/i) || text.match(/(\d{2,3})\s*(?:cm|centimeters)/i);
    if (htMatch) height = parseInt(htMatch[1], 10);

    // Sugar
    let sugar: number | undefined = undefined;
    const sugarMatch = text.match(/sugar\s*(\d{2,3})/i) || text.match(/glucose\s*(\d{2,3})/i);
    if (sugarMatch) sugar = parseInt(sugarMatch[1], 10);

    setExtractedData({
      beneficiaryName: matchedName,
      beneficiaryId: matchedId,
      systolicBp: systolic,
      diastolicBp: diastolic,
      bloodGlucoseMgdl: sugar,
      weightKg: weight,
      heightCm: height,
      notes: text,
    });
  };

  const handleConfirmAndSave = () => {
    if (!extractedData || !extractedData.beneficiaryId) return;

    const bmiCalc = calculateBMI(extractedData.weightKg, extractedData.heightCm);

    ncdStore.recordScreening({
      beneficiaryId: extractedData.beneficiaryId,
      screeningDate: new Date().toISOString().split('T')[0],
      screenedBy: 'Kamla Tai (Voice Assisted)',
      measurements: {
        systolicBp: extractedData.systolicBp,
        diastolicBp: extractedData.diastolicBp,
        bloodGlucoseMgdl: extractedData.bloodGlucoseMgdl,
        glucoseType: 'random',
        heightCm: extractedData.heightCm,
        weightKg: extractedData.weightKg,
        bmi: bmiCalc.bmi,
        bmiCategory: bmiCalc.category,
      },
      history: {
        tobaccoUse: 'none',
        alcoholConsumption: false,
        physicalActivity150MinPerWeek: true,
        familyHistoryHypertension: false,
        familyHistoryDiabetes: false,
        familyHistoryHeartDisease: false,
        knownConditions: [],
        otherObservations: `Voice Note: "${extractedData.notes}"`,
      },
      notes: extractedData.notes,
    });

    onExtractedAndSaved(extractedData.beneficiaryId);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Mic className="w-4 h-4" />
            </div>
            <div>
              <h3 className="font-bold text-slate-800 text-base leading-tight">
                Voice-Assisted NCD Entry
              </h3>
              <p className="text-xs text-stone-500">Dictate BP, glucose, weight & height</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          <div>
            <span className="text-[11px] font-bold text-slate-700 block mb-1.5">
              Select or Speak Field Clinical Observation:
            </span>
            <div className="space-y-1.5">
              {sampleSentences.map((s, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleSimulate(s)}
                  className={`w-full text-left p-2.5 rounded-xl border transition-all text-xs ${
                    speechText === s
                      ? 'bg-teal-50 border-teal-300 text-teal-950 font-semibold'
                      : 'bg-stone-50 border-stone-200 text-stone-700 hover:bg-stone-100'
                  }`}
                >
                  "{s}"
                </button>
              ))}
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">
              Transcribed Speech Text:
            </label>
            <textarea
              rows={2}
              value={speechText}
              onChange={(e) => setSpeechText(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none"
            />
          </div>

          <button
            type="button"
            onClick={() => parseNCDSpeech(speechText)}
            className="w-full py-2 px-3 rounded-xl bg-stone-100 hover:bg-stone-200 text-slate-800 font-bold text-xs flex items-center justify-center gap-1.5"
          >
            <Sparkles className="w-3.5 h-3.5 text-teal-700" />
            <span>Extract Structured Measurements</span>
          </button>

          {/* Structured Output Review (Section 14 requirement) */}
          {extractedData && (
            <div className="p-4 bg-teal-50/70 border border-teal-200 rounded-2xl space-y-3 animate-fadeIn">
              <span className="font-extrabold text-teal-950 text-xs flex items-center gap-1">
                <Check className="w-4 h-4 text-teal-700" />
                Review Extracted Data Before Committing:
              </span>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Beneficiary</span>
                  <span className="font-bold text-slate-800">
                    {extractedData.beneficiaryName} ({extractedData.beneficiaryId})
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Blood Pressure</span>
                  <span className="font-black text-slate-800">
                    {extractedData.systolicBp}/{extractedData.diastolicBp} mmHg
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Weight & Height</span>
                  <span className="font-bold text-slate-800">
                    {extractedData.weightKg} kg • {extractedData.heightCm} cm
                  </span>
                </div>
                <div>
                  <span className="text-stone-400 block text-[10px] uppercase font-bold">Blood Sugar</span>
                  <span className="font-bold text-slate-800">
                    {extractedData.bloodGlucoseMgdl ? `${extractedData.bloodGlucoseMgdl} mg/dL` : 'Not mentioned'}
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer */}
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
            className="px-5 py-2 rounded-xl bg-teal-700 hover:bg-teal-800 disabled:opacity-50 text-white text-xs font-black shadow-xs transition-all"
          >
            Confirm & Save to Record
          </button>
        </div>
      </div>
    </div>
  );
};
