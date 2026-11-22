import React, { useState, useEffect } from 'react';
import { Activity, Heart, User, Check, AlertTriangle, ArrowRight, Stethoscope, Scale } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import { calculateBMI } from '../utils/ncdRules';
import type { NCDScreening, SharedBeneficiary } from '../types';

interface BasicScreeningSectionProps {
  selectedBeneficiaryId: string;
  onSelectBeneficiary: (id: string) => void;
  onScreeningSaved?: (beneficiaryId: string) => void;
}

export const BasicScreeningSection: React.FC<BasicScreeningSectionProps> = ({
  selectedBeneficiaryId,
  onSelectBeneficiary,
  onScreeningSaved,
}) => {
  const beneficiaries = ncdStore.getBeneficiaries();
  const currentBeneficiary = ncdStore.getBeneficiaryById(selectedBeneficiaryId) || beneficiaries[0];

  // Measurements
  const [systolicBp, setSystolicBp] = useState<number>(128);
  const [diastolicBp, setDiastolicBp] = useState<number>(82);
  const [bloodGlucoseMgdl, setBloodGlucoseMgdl] = useState<string>('110');
  const [glucoseType, setGlucoseType] = useState<'random' | 'fasting' | 'post_prandial'>('random');
  const [heightCm, setHeightCm] = useState<number>(165);
  const [weightKg, setWeightKg] = useState<number>(65);
  const [pulseRate, setPulseRate] = useState<number>(78);

  // Auto-calculated BMI
  const [bmiResult, setBmiResult] = useState(() => calculateBMI(65, 165));

  // Health History / CBAC
  const [tobaccoUse, setTobaccoUse] = useState<'none' | 'smoking' | 'smokeless_chewing' | 'both'>('none');
  const [alcoholConsumption, setAlcoholConsumption] = useState<boolean>(false);
  const [waistCircumferenceCm, setWaistCircumferenceCm] = useState<string>('85');
  const [physicalActivity, setPhysicalActivity] = useState<boolean>(true);
  const [familyHypertension, setFamilyHypertension] = useState<boolean>(false);
  const [familyDiabetes, setFamilyDiabetes] = useState<boolean>(false);
  const [familyHeartDisease, setFamilyHeartDisease] = useState<boolean>(false);
  const [knownConditions, setKnownConditions] = useState<string[]>([]);
  const [notes, setNotes] = useState<string>('');

  // Auto recalculate BMI on height/weight change
  useEffect(() => {
    if (heightCm > 0 && weightKg > 0) {
      setBmiResult(calculateBMI(weightKg, heightCm));
    }
  }, [heightCm, weightKg]);

  const toggleCondition = (cond: string) => {
    setKnownConditions((prev) =>
      prev.includes(cond) ? prev.filter((c) => c !== cond) : [...prev, cond]
    );
  };

  const handleSaveScreening = (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentBeneficiary) return;

    ncdStore.recordScreening({
      beneficiaryId: currentBeneficiary.id,
      screeningDate: new Date().toISOString().split('T')[0],
      screenedBy: 'Kamla Tai (ASHA-104)',
      measurements: {
        systolicBp: Number(systolicBp),
        diastolicBp: Number(diastolicBp),
        bloodGlucoseMgdl: bloodGlucoseMgdl ? Number(bloodGlucoseMgdl) : undefined,
        glucoseType,
        heightCm: Number(heightCm),
        weightKg: Number(weightKg),
        bmi: bmiResult.bmi,
        bmiCategory: bmiResult.category,
        pulseRate: Number(pulseRate),
      },
      history: {
        tobaccoUse,
        alcoholConsumption,
        waistCircumferenceCm: waistCircumferenceCm ? Number(waistCircumferenceCm) : undefined,
        physicalActivity150MinPerWeek: physicalActivity,
        familyHistoryHypertension: familyHypertension,
        familyHistoryDiabetes: familyDiabetes,
        familyHistoryHeartDisease: familyHeartDisease,
        knownConditions,
        otherObservations: notes,
      },
      notes,
    });

    if (onScreeningSaved) onScreeningSaved(currentBeneficiary.id);
  };

  const pastScreenings = ncdStore.getScreeningsForBeneficiary(currentBeneficiary?.id || '');

  return (
    <div className="space-y-4 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-teal-100 text-teal-800 flex items-center justify-center font-bold">
              <Activity className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">Basic NCD Health Screening</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Record blood pressure, blood glucose, automatic BMI calculations, and CBAC risk history.
          </p>
        </div>

        {/* Beneficiary Select Dropdown */}
        <div className="flex items-center gap-1.5 bg-white px-3 py-1.5 rounded-2xl border border-stone-200 text-xs shadow-xs">
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

      {/* Main Screening Form */}
      <form onSubmit={handleSaveScreening} className="bg-white rounded-3xl p-5 border border-stone-200 shadow-xs space-y-4 text-xs">
        {/* Section 1: Clinical Vitals */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
            <Stethoscope className="w-3.5 h-3.5 text-teal-700" />
            1. Physical Measurements & Vitals
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Blood Pressure (BP mmHg) *
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="120"
                  required
                  value={systolicBp}
                  onChange={(e) => setSystolicBp(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                />
                <span className="font-bold text-stone-400">/</span>
                <input
                  type="number"
                  placeholder="80"
                  required
                  value={diastolicBp}
                  onChange={(e) => setDiastolicBp(Number(e.target.value))}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">
                Blood Glucose (mg/dL)
              </label>
              <div className="flex items-center gap-1.5">
                <input
                  type="number"
                  placeholder="e.g. 110"
                  value={bloodGlucoseMgdl}
                  onChange={(e) => setBloodGlucoseMgdl(e.target.value)}
                  className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
                />
                <select
                  value={glucoseType}
                  onChange={(e: any) => setGlucoseType(e.target.value)}
                  className="px-2 py-2 rounded-xl border border-stone-300 text-[10px] bg-white font-semibold"
                >
                  <option value="random">Random</option>
                  <option value="fasting">Fasting</option>
                  <option value="post_prandial">PP</option>
                </select>
              </div>
            </div>
          </div>

          {/* Height, Weight & Automatic BMI */}
          <div className="grid grid-cols-3 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Height (cm) *</label>
              <input
                type="number"
                required
                value={heightCm}
                onChange={(e) => setHeightCm(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Weight (kg) *</label>
              <input
                type="number"
                step="0.1"
                required
                value={weightKg}
                onChange={(e) => setWeightKg(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
              />
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Pulse (bpm)</label>
              <input
                type="number"
                value={pulseRate}
                onChange={(e) => setPulseRate(Number(e.target.value))}
                className="w-full px-2.5 py-2 rounded-xl border border-stone-300 text-xs font-bold"
              />
            </div>
          </div>

          {/* Real-Time Auto BMI Banner (Section 5 Requirement) */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Scale className="w-4 h-4 text-emerald-700" />
              <div>
                <span className="text-[10px] uppercase font-bold text-emerald-800 block">
                  Automatic Calculated BMI:
                </span>
                <span className="text-base font-black text-emerald-950">
                  {bmiResult.bmi} kg/m²
                </span>
              </div>
            </div>
            <span
              className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                bmiResult.category === 'normal'
                  ? 'bg-emerald-100 text-emerald-800'
                  : bmiResult.category === 'overweight'
                  ? 'bg-amber-100 text-amber-900'
                  : 'bg-rose-100 text-rose-800'
              }`}
            >
              {bmiResult.label}
            </span>
          </div>
        </div>

        {/* Section 2: Health History & CBAC Risk Factors */}
        <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
          <span className="font-extrabold text-slate-800 uppercase tracking-wider text-[11px] block">
            2. CBAC & Lifestyle Risk Factors
          </span>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Tobacco Consumption</label>
              <select
                value={tobaccoUse}
                onChange={(e: any) => setTobaccoUse(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="none">None (तंबाकू नहीं)</option>
                <option value="smoking">Smoking (बीड़ी/सिगरेट)</option>
                <option value="smokeless_chewing">Smokeless (गुटखा/खरा/तंबाकू चबाना)</option>
                <option value="both">Both (धूम्रपान एवं चबाना)</option>
              </select>
            </div>

            <div>
              <label className="block font-semibold text-slate-700 mb-1">Alcohol Consumption</label>
              <select
                value={alcoholConsumption ? 'yes' : 'no'}
                onChange={(e) => setAlcoholConsumption(e.target.value === 'yes')}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              >
                <option value="no">No (मद्यपान नहीं)</option>
                <option value="yes">Yes (नियमित/कभी-कभी)</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Family History of Chronic Diseases (परिवार में इतिहास)
            </label>
            <div className="flex flex-wrap gap-2">
              <label className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyHypertension}
                  onChange={(e) => setFamilyHypertension(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Hypertension (उच्च रक्तचाप)</span>
              </label>

              <label className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyDiabetes}
                  onChange={(e) => setFamilyDiabetes(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Diabetes (मधुमेह)</span>
              </label>

              <label className="flex items-center gap-1.5 bg-white px-2.5 py-1.5 rounded-xl border border-stone-200 font-medium cursor-pointer">
                <input
                  type="checkbox"
                  checked={familyHeartDisease}
                  onChange={(e) => setFamilyHeartDisease(e.target.checked)}
                  className="rounded text-emerald-600"
                />
                <span>Heart Disease / Stroke</span>
              </label>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1.5">
              Known Pre-existing Conditions
            </label>
            <div className="flex flex-wrap gap-1.5">
              {['Hypertension', 'Type 2 Diabetes', 'Asthma / COPD', 'Thyroid Disorder', 'Oral Lesion'].map(
                (cond) => {
                  const isSelected = knownConditions.includes(cond);
                  return (
                    <button
                      key={cond}
                      type="button"
                      onClick={() => toggleCondition(cond)}
                      className={`px-2.5 py-1 rounded-xl text-xs font-semibold border transition-all ${
                        isSelected
                          ? 'bg-amber-100 text-amber-900 border-amber-300'
                          : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                      }`}
                    >
                      {isSelected ? '✓ ' : '+ '}
                      {cond}
                    </button>
                  );
                }
              )}
            </div>
          </div>
        </div>

        <div>
          <label className="block font-semibold text-slate-700 mb-1">
            Additional Clinical Screening Observations
          </label>
          <textarea
            rows={2}
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="e.g. Patient reports intermittent dizziness, headaches, and numbness in feet..."
            className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs outline-none"
          />
        </div>

        {/* Submit Button */}
        <div className="pt-2 flex justify-end">
          <button
            type="submit"
            className="px-6 py-2.5 rounded-2xl bg-emerald-700 hover:bg-emerald-800 text-white font-black text-xs flex items-center gap-1.5 shadow-sm transition-all active:scale-95"
          >
            <Check className="w-4 h-4" />
            <span>Save NCD Screening & Calculate Risk</span>
          </button>
        </div>
      </form>

      {/* Historical Screenings for Beneficiary */}
      {pastScreenings.length > 0 && (
        <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3">
          <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
            Previous Screening History ({pastScreenings.length})
          </h4>
          <div className="space-y-2">
            {pastScreenings.map((s) => (
              <div
                key={s.id}
                className="p-3 bg-stone-50 rounded-2xl border border-stone-100 flex items-center justify-between text-xs"
              >
                <div>
                  <span className="font-bold text-slate-800">
                    BP: {s.measurements.systolicBp}/{s.measurements.diastolicBp} mmHg • Sugar:{' '}
                    {s.measurements.bloodGlucoseMgdl || '-'} mg/dL • BMI: {s.measurements.bmi}
                  </span>
                  <p className="text-[10px] text-stone-500 mt-0.5">
                    Date: {s.screeningDate} • Logged by: {s.screenedBy}
                  </p>
                </div>
                <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-md">
                  Recorded ✓
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
