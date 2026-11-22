import React, { useState } from 'react';
import { Heart, CheckCircle2, AlertTriangle, Calendar, Clock, Baby, User, X, Plus } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import type { PNCVisit } from '../types';

interface PNCTrackingSectionProps {
  onSelectBeneficiary: (id: string) => void;
}

export const PNCTrackingSection: React.FC<PNCTrackingSectionProps> = ({ onSelectBeneficiary }) => {
  const [selectedVisitToRecord, setSelectedVisitToRecord] = useState<PNCVisit | null>(null);

  // Modal Form State (Maternal)
  const [maternalBp, setMaternalBp] = useState('118/78');
  const [severeBleeding, setSevereBleeding] = useState(false);
  const [fever, setFever] = useState(false);
  const [severePain, setSeverePain] = useState(false);
  const [breastfeedingDifficulty, setBreastfeedingDifficulty] = useState(false);
  const [maternalDangerSigns, setMaternalDangerSigns] = useState<string[]>([]);
  const [maternalNotes, setMaternalNotes] = useState('Uterus well contracted, lochia normal.');

  // Modal Form State (Newborn)
  const [babyWeight, setBabyWeight] = useState(2.9);
  const [temperatureCelsius, setTemperatureCelsius] = useState(36.8);
  const [exclusiveBreastfeeding, setExclusiveBreastfeeding] = useState(true);
  const [jaundice, setJaundice] = useState(false);
  const [breathingDifficulty, setBreathingDifficulty] = useState(false);
  const [umbilicalCordInfection, setUmbilicalCordInfection] = useState(false);
  const [babyDangerSigns, setBabyDangerSigns] = useState<string[]>([]);
  const [babyNotes, setBabyNotes] = useState('Baby alert, sucking well, cord clean and dry.');

  const pncVisits = maatrStore.getPNCVisits();

  const handleOpenRecord = (v: PNCVisit) => {
    setSelectedVisitToRecord(v);
    setSevereBleeding(v.maternalAssessment.severeBleeding);
    setFever(v.maternalAssessment.fever);
    setSeverePain(v.maternalAssessment.severePain);
    setBreastfeedingDifficulty(v.maternalAssessment.breastfeedingDifficulty);
    setMaternalDangerSigns(v.maternalAssessment.dangerSigns || []);
    if (v.newbornAssessment.currentWeightKg) setBabyWeight(v.newbornAssessment.currentWeightKg);
    setJaundice(v.newbornAssessment.jaundice);
    setBreathingDifficulty(v.newbornAssessment.breathingDifficulty);
    setUmbilicalCordInfection(v.newbornAssessment.umbilicalCordInfection);
  };

  const handleSavePNC = (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedVisitToRecord) return;

    const [sys, dia] = maternalBp.split('/').map((s) => Number(s.trim()));

    maatrStore.updatePNCVisit(selectedVisitToRecord.id, {
      status: 'completed',
      recordedBy: 'Kamla Tai (ASHA)',
      maternalAssessment: {
        systolicBp: isNaN(sys) ? 120 : sys,
        diastolicBp: isNaN(dia) ? 80 : dia,
        severeBleeding,
        fever,
        severePain,
        breastfeedingDifficulty,
        dangerSigns: maternalDangerSigns,
        notes: maternalNotes,
      },
      newbornAssessment: {
        currentWeightKg: Number(babyWeight),
        temperatureCelsius: Number(temperatureCelsius),
        exclusiveBreastfeeding,
        jaundice,
        breathingDifficulty,
        umbilicalCordInfection,
        dangerSigns: babyDangerSigns,
        notes: babyNotes,
      },
    });

    setSelectedVisitToRecord(null);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200">
        <div className="flex items-center gap-2">
          <span className="w-8 h-8 rounded-xl bg-pink-100 text-pink-800 flex items-center justify-center font-bold">
            <Heart className="w-4 h-4" />
          </span>
          <h2 className="text-xl font-black text-slate-800">Postnatal Care (PNC) Tracking</h2>
        </div>
        <p className="text-xs text-stone-500 mt-1 max-w-md">
          Track maternal recovery and newborn health separately across 4 mandated checkpoints: Within 48 Hours, Day 7, Day 14, and Six Weeks.
        </p>
      </div>

      {/* PNC Visits Feed */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <h3 className="text-sm font-extrabold text-slate-800">
            Postnatal Care Checkpoints ({pncVisits.length})
          </h3>
          <span className="text-xs text-stone-400">Mother & Newborn Dual Assessment</span>
        </div>

        {pncVisits.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {pncVisits.map((visit) => {
              const mother = maatrStore.getBeneficiaryById(visit.motherBeneficiaryId);
              const isCompleted = visit.status === 'completed';
              const isDue = visit.status === 'due';

              return (
                <div
                  key={visit.id}
                  className={`bg-white rounded-2xl p-4 border transition-all shadow-sm ${
                    isDue
                      ? 'border-amber-300 bg-amber-50/20'
                      : isCompleted
                      ? 'border-emerald-200'
                      : 'border-stone-200'
                  }`}
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2.5 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div
                        className={`w-10 h-10 rounded-2xl flex items-center justify-center font-black text-xs ${
                          isCompleted
                            ? 'bg-emerald-100 text-emerald-800'
                            : isDue
                            ? 'bg-amber-100 text-amber-800'
                            : 'bg-stone-100 text-stone-600'
                        }`}
                      >
                        {isCompleted ? '✓' : 'PNC'}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-extrabold text-slate-800 text-sm">
                            {visit.checkpointLabel}
                          </span>
                          <span
                            className={`px-2 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                              isCompleted
                                ? 'bg-emerald-100 text-emerald-800'
                                : isDue
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-stone-100 text-stone-600'
                            }`}
                          >
                            {visit.status}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Mother:{' '}
                          <button
                            onClick={() => onSelectBeneficiary(visit.motherBeneficiaryId)}
                            className="font-bold text-slate-700 hover:text-emerald-700 underline"
                          >
                            {mother?.fullName}
                          </button>{' '}
                          • Due Date: {visit.visitDate}
                        </p>
                      </div>
                    </div>

                    <div>
                      {!isCompleted ? (
                        <button
                          onClick={() => handleOpenRecord(visit)}
                          className="px-3 py-1.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold shadow-sm transition-all"
                        >
                          Record Assessment
                        </button>
                      ) : (
                        <span className="text-[11px] font-bold text-emerald-700 flex items-center gap-1">
                          <CheckCircle2 className="w-3.5 h-3.5" />
                          <span>Completed by {visit.recordedBy}</span>
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Dual Separate Cards: Maternal & Newborn */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
                    {/* Mother Assessment */}
                    <div className="p-3 bg-stone-50 rounded-xl border border-stone-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-stone-700 font-bold text-[11px] border-b border-stone-200 pb-1">
                        <span className="flex items-center gap-1">
                          <User className="w-3 h-3 text-emerald-700" />
                          Maternal Assessment
                        </span>
                        <span>BP: {visit.maternalAssessment.systolicBp ? `${visit.maternalAssessment.systolicBp}/${visit.maternalAssessment.diastolicBp}` : 'Pending'}</span>
                      </div>
                      <div className="text-[11px] text-stone-600 space-y-0.5">
                        <p>Severe Bleeding: {visit.maternalAssessment.severeBleeding ? '⚠️ YES' : 'None'}</p>
                        <p>Fever / Infection: {visit.maternalAssessment.fever ? '⚠️ YES' : 'None'}</p>
                        <p>Breastfeeding Difficulty: {visit.maternalAssessment.breastfeedingDifficulty ? 'Reported' : 'Normal'}</p>
                      </div>
                    </div>

                    {/* Newborn Assessment */}
                    <div className="p-3 bg-sky-50/50 rounded-xl border border-sky-100 space-y-1.5 text-xs">
                      <div className="flex items-center justify-between text-sky-900 font-bold text-[11px] border-b border-sky-200 pb-1">
                        <span className="flex items-center gap-1">
                          <Baby className="w-3 h-3 text-sky-700" />
                          Newborn Assessment
                        </span>
                        <span>Weight: {visit.newbornAssessment.currentWeightKg || '-'} kg</span>
                      </div>
                      <div className="text-[11px] text-stone-600 space-y-0.5">
                        <p>Exclusive Breastfeeding: {visit.newbornAssessment.exclusiveBreastfeeding ? 'Yes ✓' : 'No'}</p>
                        <p>Jaundice / Yellow skin: {visit.newbornAssessment.jaundice ? '⚠️ Detected' : 'No'}</p>
                        <p>Breathing difficulty: {visit.newbornAssessment.breathingDifficulty ? '⚠️ Fast/Difficult' : 'Normal'}</p>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <Heart className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No PNC checkpoints active. Will appear after delivery is recorded.</p>
          </div>
        )}
      </div>

      {/* Record PNC Assessment Modal */}
      {selectedVisitToRecord && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">
                  Record Postnatal Checkpoint: {selectedVisitToRecord.checkpointLabel}
                </h3>
                <p className="text-xs text-stone-500">Separately evaluate mother and infant vitals</p>
              </div>
              <button
                onClick={() => setSelectedVisitToRecord(null)}
                className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSavePNC} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              {/* Part 1: Mother Assessment */}
              <div className="p-4 bg-stone-50 rounded-2xl border border-stone-200 space-y-3">
                <span className="font-bold text-slate-800 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                  <User className="w-3.5 h-3.5 text-emerald-700" />
                  1. Maternal Assessment
                </span>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Blood Pressure (mmHg)</label>
                    <input
                      type="text"
                      value={maternalBp}
                      onChange={(e) => setMaternalBp(e.target.value)}
                      placeholder="120/80"
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Bleeding Status</label>
                    <select
                      value={severeBleeding ? 'yes' : 'no'}
                      onChange={(e) => setSevereBleeding(e.target.value === 'yes')}
                      className="w-full px-3 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      <option value="no">Normal Lochia (सामान्य)</option>
                      <option value="yes">Severe Bleeding (अत्यधिक रक्तस्राव ⚠️)</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={fever}
                      onChange={(e) => setFever(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Fever &gt; 38°C</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breastfeedingDifficulty}
                      onChange={(e) => setBreastfeedingDifficulty(e.target.checked)}
                      className="rounded text-emerald-600"
                    />
                    <span>Breast pain / Engorgement</span>
                  </label>
                </div>
              </div>

              {/* Part 2: Newborn Assessment */}
              <div className="p-4 bg-sky-50/60 rounded-2xl border border-sky-200 space-y-3">
                <span className="font-bold text-sky-900 uppercase tracking-wider text-[11px] block flex items-center gap-1.5">
                  <Baby className="w-3.5 h-3.5 text-sky-700" />
                  2. Newborn Clinical Assessment
                </span>

                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Current Weight (kg)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={babyWeight}
                      onChange={(e) => setBabyWeight(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Temperature (°C)</label>
                    <input
                      type="number"
                      step="0.1"
                      value={temperatureCelsius}
                      onChange={(e) => setTemperatureCelsius(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-600 mb-1">Feeding</label>
                    <select
                      value={exclusiveBreastfeeding ? 'yes' : 'no'}
                      onChange={(e) => setExclusiveBreastfeeding(e.target.value === 'yes')}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      <option value="yes">Exclusive Breastfeeding</option>
                      <option value="no">Difficulty / Formula</option>
                    </select>
                  </div>
                </div>

                <div className="flex flex-wrap gap-3">
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={jaundice}
                      onChange={(e) => setJaundice(e.target.checked)}
                      className="rounded text-sky-600"
                    />
                    <span>Yellow eyes / Jaundice observed</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={breathingDifficulty}
                      onChange={(e) => setBreathingDifficulty(e.target.checked)}
                      className="rounded text-sky-600"
                    />
                    <span>Fast or chest indrawing breathing</span>
                  </label>
                  <label className="flex items-center gap-1.5 text-xs text-slate-700 font-medium cursor-pointer">
                    <input
                      type="checkbox"
                      checked={umbilicalCordInfection}
                      onChange={(e) => setUmbilicalCordInfection(e.target.checked)}
                      className="rounded text-sky-600"
                    />
                    <span>Umbilical cord redness / pus</span>
                  </label>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setSelectedVisitToRecord(null)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-sm"
                >
                  Save PNC Checkpoint
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
