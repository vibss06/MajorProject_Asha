import React, { useState } from 'react';
import {
  Stethoscope,
  Plus,
  AlertTriangle,
  Calendar,
  User,
  Heart,
  CheckCircle2,
  Clock,
  Mic,
  Activity,
  FileText,
  X,
} from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import { MOHFW_ANC_SCHEDULE } from '../utils/clinicalRules';
import type { ANCVisit, Beneficiary } from '../types';

interface ANCTrackingSectionProps {
  onOpenVoiceModal: () => void;
  onSelectBeneficiary: (id: string) => void;
}

export const ANCTrackingSection: React.FC<ANCTrackingSectionProps> = ({
  onOpenVoiceModal,
  onSelectBeneficiary,
}) => {
  const [isRecordModalOpen, setIsRecordModalOpen] = useState(false);
  const beneficiaries = maatrStore.getBeneficiaries().filter((b) => b.status !== 'completed');
  const [selectedBeneficiaryId, setSelectedBeneficiaryId] = useState<string>(
    beneficiaries[0]?.id || ''
  );

  // Form State
  const [visitNumber, setVisitNumber] = useState(1);
  const [visitDate, setVisitDate] = useState(new Date().toISOString().split('T')[0]);
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState(20);
  const [systolicBp, setSystolicBp] = useState(120);
  const [diastolicBp, setDiastolicBp] = useState(80);
  const [weightKg, setWeightKg] = useState(50);
  const [hemoglobinGdl, setHemoglobinGdl] = useState(11.0);
  const [bloodGlucoseMgdl, setBloodGlucoseMgdl] = useState<number | undefined>(undefined);
  const [edemaSwelling, setEdemaSwelling] = useState<'none' | 'pedal' | 'facial' | 'generalized'>('none');
  const [selectedDangerSigns, setSelectedDangerSigns] = useState<string[]>([]);
  const [fetalMovement, setFetalMovement] = useState<'normal' | 'reduced' | 'absent' | 'not_applicable'>('normal');
  const [ifaTabletsGiven, setIfaTabletsGiven] = useState(30);
  const [tetanusToxoidGiven, setTetanusToxoidGiven] = useState(false);
  const [medicalAdvice, setMedicalAdvice] = useState('Continue balanced diet and daily IFA tablets.');
  const [nextDueDate, setNextDueDate] = useState('');
  const [notes, setNotes] = useState('');

  const ancVisits = maatrStore.getANCVisits();

  const toggleDangerSign = (sign: string) => {
    setSelectedDangerSigns((prev) =>
      prev.includes(sign) ? prev.filter((s) => s !== sign) : [...prev, sign]
    );
  };

  const handleOpenModalFor = (bId: string) => {
    setSelectedBeneficiaryId(bId);
    const preg = maatrStore.getActivePregnancyForBeneficiary(bId);
    if (preg) {
      setGestationalAgeWeeks(preg.gestationalAgeWeeks);
      const existing = maatrStore.getANCVisitsForBeneficiary(bId);
      setVisitNumber(existing.length + 1);
    }
    setIsRecordModalOpen(true);
  };

  const handleSaveVisit = (e: React.FormEvent) => {
    e.preventDefault();
    const pregnancy = maatrStore.getActivePregnancyForBeneficiary(selectedBeneficiaryId);
    if (!pregnancy) {
      alert('No active pregnancy found for selected mother.');
      return;
    }

    maatrStore.recordANCVisit({
      pregnancyId: pregnancy.id,
      beneficiaryId: selectedBeneficiaryId,
      visitNumber: Number(visitNumber),
      visitDate,
      gestationalAgeWeeks: Number(gestationalAgeWeeks),
      systolicBp: Number(systolicBp),
      diastolicBp: Number(diastolicBp),
      weightKg: Number(weightKg),
      hemoglobinGdl: Number(hemoglobinGdl),
      bloodGlucoseMgdl: bloodGlucoseMgdl ? Number(bloodGlucoseMgdl) : undefined,
      edemaSwelling,
      dangerSigns: selectedDangerSigns,
      fetalMovement,
      ifaTabletsGiven: Number(ifaTabletsGiven),
      tetanusToxoidGiven,
      medicalAdvice,
      nextDueDate: nextDueDate || new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      notes,
      recordedBy: 'Kamla Tai (ASHA)',
    });

    setIsRecordModalOpen(false);
    setSelectedDangerSigns([]);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-emerald-100 text-emerald-800 flex items-center justify-center font-bold">
              <Stethoscope className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">Antenatal Care (ANC) Tracking</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Record regular checkups, monitor BP/Hb thresholds, and track MoHFW 4-ANC schedule adherence.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={onOpenVoiceModal}
            className="px-3.5 py-2 rounded-xl bg-white border border-stone-200 hover:border-emerald-500 text-slate-700 hover:text-emerald-800 text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Mic className="w-4 h-4 text-emerald-600" />
            <span>Voice Record</span>
          </button>
          <button
            onClick={() => handleOpenModalFor(selectedBeneficiaryId || beneficiaries[0]?.id || '')}
            className="px-4 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
          >
            <Plus className="w-4 h-4" />
            <span>+ Record ANC Checkup</span>
          </button>
        </div>
      </div>

      {/* MoHFW 4-ANC Guideline Progress Indicators */}
      <div className="bg-white rounded-3xl p-5 border border-stone-200 space-y-3">
        <h4 className="text-xs font-bold text-slate-700 uppercase tracking-wider">
          National MoHFW Standard ANC Protocol Checkpoints
        </h4>
        <div className="grid grid-cols-1 sm:grid-cols-4 gap-3">
          {MOHFW_ANC_SCHEDULE.map((item) => (
            <div key={item.visitNumber} className="p-3 bg-stone-50 rounded-2xl border border-stone-200 text-xs space-y-1">
              <span className="font-extrabold text-emerald-900 block">{item.label}</span>
              <span className="text-[10px] font-bold text-stone-500 block">
                Weeks {item.recommendedWeekStart} - {item.recommendedWeekEnd}
              </span>
              <p className="text-[10px] text-stone-500 line-clamp-2 leading-relaxed">
                {item.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Chronological Visits List */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800">
            Recorded ANC Checkups ({ancVisits.length})
          </h3>
          <span className="text-xs text-stone-400">Chronological clinical log</span>
        </div>

        {ancVisits.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {ancVisits.map((visit) => {
              const ben = maatrStore.getBeneficiaryById(visit.beneficiaryId);
              const isDanger = visit.isHighRiskFlagged || visit.dangerSigns.length > 0;

              return (
                <div
                  key={visit.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-sm ${
                    isDanger ? 'border-rose-300 bg-rose-50/20' : 'border-stone-200 hover:border-emerald-300'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                          isDanger ? 'bg-rose-100 text-rose-800' : 'bg-emerald-100 text-emerald-800'
                        }`}
                      >
                        ANC #{visit.visitNumber}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectBeneficiary(visit.beneficiaryId)}
                            className="font-extrabold text-slate-800 text-sm hover:text-emerald-700 underline text-left"
                          >
                            {ben?.fullName || 'Beneficiary'}
                          </button>
                          <span className="text-[10px] text-stone-400">({visit.beneficiaryId})</span>
                          {isDanger && (
                            <span className="px-2 py-0.5 rounded-full bg-rose-100 text-rose-800 text-[10px] font-bold uppercase">
                              ⚠️ Danger Signs
                            </span>
                          )}
                        </div>
                        <span className="text-xs text-stone-500">
                          {visit.gestationalAgeWeeks} Weeks Gestation • Village: {ben?.village || '-'}
                        </span>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-stone-400 block text-[10px]">Visit Date</span>
                      <span className="font-bold text-slate-700">{visit.visitDate}</span>
                    </div>
                  </div>

                  {/* Vitals Summary Strip */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 pt-3 text-xs">
                    <div className="p-2 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Blood Pressure</span>
                      <span
                        className={`font-extrabold ${
                          visit.systolicBp >= 140 || visit.diastolicBp >= 90 ? 'text-rose-700' : 'text-slate-800'
                        }`}
                      >
                        {visit.systolicBp}/{visit.diastolicBp} mmHg
                      </span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Hemoglobin (Hb)</span>
                      <span
                        className={`font-extrabold ${
                          visit.hemoglobinGdl < 10.0 ? 'text-amber-700' : 'text-slate-800'
                        }`}
                      >
                        {visit.hemoglobinGdl} g/dL
                      </span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Maternal Weight</span>
                      <span className="font-extrabold text-slate-800">{visit.weightKg} kg</span>
                    </div>
                    <div className="p-2 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Next Follow-Up</span>
                      <span className="font-extrabold text-emerald-800">{visit.nextDueDate}</span>
                    </div>
                  </div>

                  {visit.dangerSigns.length > 0 && (
                    <div className="mt-2.5 p-2 bg-rose-50 border border-rose-200 rounded-xl text-rose-800 text-xs font-bold flex items-center gap-1.5">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Reported Danger Signs: {visit.dangerSigns.join(', ')}</span>
                    </div>
                  )}

                  <div className="mt-2 text-xs text-stone-600 flex items-center justify-between">
                    <p className="line-clamp-1 italic">
                      <span className="font-semibold text-stone-700">Advice: </span>
                      {visit.medicalAdvice}
                    </p>
                    <span className="text-[10px] text-stone-400 whitespace-nowrap pl-2">
                      Recorded by: {visit.recordedBy}
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <Stethoscope className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No ANC checkups logged yet.</p>
          </div>
        )}
      </div>

      {/* Record ANC Visit Modal */}
      {isRecordModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Record Antenatal Care Visit</h3>
                <p className="text-xs text-stone-500">Clinical assessment & vital monitoring</p>
              </div>
              <button
                onClick={() => setIsRecordModalOpen(false)}
                className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveVisit} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Beneficiary *</label>
                <select
                  value={selectedBeneficiaryId}
                  onChange={(e) => {
                    setSelectedBeneficiaryId(e.target.value);
                    const p = maatrStore.getActivePregnancyForBeneficiary(e.target.value);
                    if (p) setGestationalAgeWeeks(p.gestationalAgeWeeks);
                  }}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  {beneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.id}) - {b.village}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Number</label>
                  <select
                    value={visitNumber}
                    onChange={(e) => setVisitNumber(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value={1}>ANC 1</option>
                    <option value={2}>ANC 2</option>
                    <option value={3}>ANC 3</option>
                    <option value={4}>ANC 4</option>
                    <option value={5}>ANC 5+</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Visit Date</label>
                  <input
                    type="date"
                    required
                    value={visitDate}
                    onChange={(e) => setVisitDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Gestational Weeks</label>
                  <input
                    type="number"
                    min="1"
                    max="44"
                    value={gestationalAgeWeeks}
                    onChange={(e) => setGestationalAgeWeeks(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
              </div>

              {/* Vitals */}
              <div className="p-3.5 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block">
                  Clinical Vitals
                </span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">
                      Blood Pressure (Systolic/Diastolic) *
                    </label>
                    <div className="flex items-center gap-1.5">
                      <input
                        type="number"
                        placeholder="Sys (120)"
                        value={systolicBp}
                        onChange={(e) => setSystolicBp(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                      <span>/</span>
                      <input
                        type="number"
                        placeholder="Dia (80)"
                        value={diastolicBp}
                        onChange={(e) => setDiastolicBp(Number(e.target.value))}
                        className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Weight (kg) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={weightKg}
                      onChange={(e) => setWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Hemoglobin (Hb g/dL) *</label>
                    <input
                      type="number"
                      step="0.1"
                      value={hemoglobinGdl}
                      onChange={(e) => setHemoglobinGdl(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Edema / Swelling</label>
                    <select
                      value={edemaSwelling}
                      onChange={(e: any) => setEdemaSwelling(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      <option value="none">None (सामान्य)</option>
                      <option value="pedal">Pedal Edema (पैरों में सूजन)</option>
                      <option value="facial">Facial Puffiness (चेहरे पर सूजन)</option>
                      <option value="generalized">Generalized Edema (संपूर्ण शरीर)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Danger Signs Selection */}
              <div>
                <label className="block font-semibold text-rose-800 mb-1.5">
                  Reported Danger Signs (खतरे के लक्षण - तुरंत ध्यान दें)
                </label>
                <div className="flex flex-wrap gap-1.5">
                  {[
                    'Severe persistent headache',
                    'Blurred vision',
                    'Vaginal bleeding',
                    'Severe abdominal pain',
                    'High fever',
                    'Breathlessness',
                    'Reduced fetal movement',
                    'Convulsions / fits',
                  ].map((sign) => {
                    const isSelected = selectedDangerSigns.includes(sign);
                    return (
                      <button
                        key={sign}
                        type="button"
                        onClick={() => toggleDangerSign(sign)}
                        className={`px-2 py-1 rounded-lg text-xs font-semibold border transition-all ${
                          isSelected
                            ? 'bg-rose-600 text-white border-rose-700 shadow-sm'
                            : 'bg-stone-50 text-stone-700 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isSelected ? '⚠️ ' : '+ '}
                        {sign}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Supplements & Advice */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">IFA Tablets Given</label>
                  <input
                    type="number"
                    value={ifaTabletsGiven}
                    onChange={(e) => setIfaTabletsGiven(Number(e.target.value))}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Next Follow-Up Date</label>
                  <input
                    type="date"
                    value={nextDueDate}
                    onChange={(e) => setNextDueDate(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Medical Advice Given</label>
                <input
                  type="text"
                  value={medicalAdvice}
                  onChange={(e) => setMedicalAdvice(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsRecordModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm"
                >
                  Save ANC Checkup
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
