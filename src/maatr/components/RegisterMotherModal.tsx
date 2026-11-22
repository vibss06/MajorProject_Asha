import React, { useState, useEffect } from 'react';
import { X, ArrowRight, ArrowLeft, Check, AlertTriangle, Calendar, User, Phone, MapPin, Heart, ShieldAlert } from 'lucide-react';
import { calculateEDDFromLMP, calculateGestationalWeeks } from '../utils/clinicalRules';
import { maatrStore } from '../data/maatrStore';
import type { Beneficiary } from '../types';

interface RegisterMotherModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (beneficiaryId: string) => void;
}

export const RegisterMotherModal: React.FC<RegisterMotherModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const [step, setStep] = useState<1 | 2 | 3>(1);

  // Step 1: Personal Information
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(24);
  const [dob, setDob] = useState('');
  const [mobileNumber, setMobileNumber] = useState('');
  const [village, setVillage] = useState('Ramnagar');
  const [address, setAddress] = useState('');
  const [husbandName, setHusbandName] = useState('');
  const [husbandMobile, setHusbandMobile] = useState('');
  const [ashaId] = useState('ASHA-104');
  const [ashaName] = useState('Kamla Tai');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);

  // Duplicate Check
  const [duplicateWarning, setDuplicateWarning] = useState<Beneficiary[]>([]);

  // Step 2: Pregnancy Information
  const [lmp, setLmp] = useState('');
  const [edd, setEdd] = useState('');
  const [gestationalAgeWeeks, setGestationalAgeWeeks] = useState(0);
  const [gravida, setGravida] = useState(1);
  const [parity, setParity] = useState(0);
  const [selectedComplications, setSelectedComplications] = useState<string[]>([]);
  const [selectedMedicalHistory, setSelectedMedicalHistory] = useState<string[]>([]);
  const [sourceOfInfo, setSourceOfInfo] = useState<'asha_survey' | 'self_report' | 'hospital_referral'>('asha_survey');

  // Recalculate EDD & Gestational age when LMP changes
  useEffect(() => {
    if (lmp) {
      const calcEdd = calculateEDDFromLMP(lmp);
      setEdd(calcEdd);
      const weeks = calculateGestationalWeeks(lmp);
      setGestationalAgeWeeks(weeks);
    }
  }, [lmp]);

  // Duplicate detection on blur
  const handleCheckDuplicate = () => {
    if (fullName && (mobileNumber || village)) {
      const result = maatrStore.checkDuplicateBeneficiary(fullName, mobileNumber, village);
      setDuplicateWarning(result.matches);
    } else {
      setDuplicateWarning([]);
    }
  };

  const toggleComplication = (item: string) => {
    setSelectedComplications((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const toggleMedicalHistory = (item: string) => {
    setSelectedMedicalHistory((prev) =>
      prev.includes(item) ? prev.filter((i) => i !== item) : [...prev, item]
    );
  };

  const handleSave = () => {
    const { beneficiary } = maatrStore.registerMother(
      {
        fullName,
        age: Number(age),
        dob,
        mobileNumber,
        village,
        address: address || `${village}, Ward area`,
        husbandName,
        husbandMobile,
        ashaId,
        ashaName,
        registrationDate,
      },
      {
        lmp,
        edd: edd || calculateEDDFromLMP(lmp),
        gestationalAgeWeeks,
        gravida: Number(gravida),
        parity: Number(parity),
        previousComplications: selectedComplications,
        medicalHistory: selectedMedicalHistory,
        registrationDate,
        sourceOfInfo,
      }
    );

    // Reset form
    setStep(1);
    setFullName('');
    setMobileNumber('');
    setLmp('');
    setEdd('');
    onRegistered(beneficiary.id);
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-lg">Register Pregnant Mother</h3>
            </div>
            <p className="text-xs text-stone-500">Step {step} of 3 • Maatr Maternal Care</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Step Progression Bar */}
        <div className="w-full bg-stone-100 h-1.5 flex">
          <div
            className={`h-full transition-all duration-300 ${
              step === 1 ? 'w-1/3 bg-emerald-600' : step === 2 ? 'w-2/3 bg-emerald-600' : 'w-full bg-emerald-600'
            }`}
          />
        </div>

        {/* Modal Body */}
        <div className="p-6 overflow-y-auto flex-1 space-y-5">
          {/* STEP 1: Personal Information */}
          {step === 1 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <User className="w-4 h-4" />
                <span>1. Personal & Contact Details</span>
              </div>

              {/* Duplicate Warning Alert */}
              {duplicateWarning.length > 0 && (
                <div className="p-3.5 bg-amber-50 border border-amber-200 rounded-2xl flex items-start gap-3 text-amber-900">
                  <AlertTriangle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
                  <div className="text-xs space-y-1">
                    <span className="font-bold">Potential Duplicate Beneficiary Found:</span>
                    <p className="text-[11px] text-amber-800">
                      Found {duplicateWarning.length} existing record(s) with matching name/mobile:
                      {duplicateWarning.map((m) => ` ${m.fullName} (${m.id}, ${m.village})`).join(', ')}.
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Full Name (पूरा नाम) *
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  onBlur={handleCheckDuplicate}
                  placeholder="e.g. Sunita Devi"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Age (वर्ष) *</label>
                  <input
                    type="number"
                    min="15"
                    max="50"
                    value={age}
                    onChange={(e) => setAge(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Mobile Number *</label>
                  <input
                    type="tel"
                    required
                    value={mobileNumber}
                    onChange={(e) => setMobileNumber(e.target.value)}
                    onBlur={handleCheckDuplicate}
                    placeholder="10-digit mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Village (गाँव) *</label>
                  <select
                    value={village}
                    onChange={(e) => setVillage(e.target.value)}
                    onBlur={handleCheckDuplicate}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none bg-white"
                  >
                    <option value="Ramnagar">Ramnagar</option>
                    <option value="Shantinagar">Shantinagar</option>
                    <option value="Hanuman Nagar">Hanuman Nagar</option>
                    <option value="Ganga Layout">Ganga Layout</option>
                    <option value="Kashinagar">Kashinagar</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Registration Date</label>
                  <input
                    type="date"
                    value={registrationDate}
                    onChange={(e) => setRegistrationDate(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none bg-white"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">Address / Landmark</label>
                <input
                  type="text"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="e.g. Near Old Well, Ward #2"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1 border-t border-stone-100">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Husband/Family Name</label>
                  <input
                    type="text"
                    value={husbandName}
                    onChange={(e) => setHusbandName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Husband Contact</label>
                  <input
                    type="tel"
                    value={husbandMobile}
                    onChange={(e) => setHusbandMobile(e.target.value)}
                    placeholder="Optional mobile"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none"
                  />
                </div>
              </div>
            </div>
          )}

          {/* STEP 2: Pregnancy Information */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Heart className="w-4 h-4 text-emerald-700" />
                <span>2. Obstetric & Pregnancy Information</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    LMP (अंतिम माहवारी) *
                  </label>
                  <input
                    type="date"
                    required
                    value={lmp}
                    onChange={(e) => setLmp(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none bg-white"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    EDD (प्रसव की अनुमानित तिथि)
                  </label>
                  <input
                    type="date"
                    value={edd}
                    onChange={(e) => setEdd(e.target.value)}
                    className="w-full px-3 py-2.5 rounded-xl border border-emerald-300 bg-emerald-50/50 text-emerald-900 font-semibold text-sm outline-none"
                  />
                </div>
              </div>

              {/* Calculated Gestational Age Display */}
              {gestationalAgeWeeks > 0 && (
                <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-2xl flex items-center justify-between">
                  <div className="text-xs">
                    <span className="text-emerald-800 font-bold">Gestational Age: </span>
                    <span className="font-extrabold text-emerald-900">{gestationalAgeWeeks} Weeks</span>
                  </div>
                  <span className="text-[11px] font-semibold px-2 py-0.5 rounded-md bg-emerald-100 text-emerald-800">
                    {gestationalAgeWeeks < 14 ? '1st Trimester' : gestationalAgeWeeks < 28 ? '2nd Trimester' : '3rd Trimester'}
                  </span>
                </div>
              )}

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Gravida (कुल गर्भधारणा)</label>
                  <input
                    type="number"
                    min="1"
                    max="10"
                    value={gravida}
                    onChange={(e) => setGravida(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">Parity (पूर्व जीवित प्रसव)</label>
                  <input
                    type="number"
                    min="0"
                    max="10"
                    value={parity}
                    onChange={(e) => setParity(Number(e.target.value))}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Previous Pregnancy Complications (पूर्व जटिलताएं)
                </label>
                <div className="flex flex-wrap gap-2">
                  {[
                    'Previous C-Section',
                    'Postpartum Hemorrhage (PPH)',
                    'Preeclampsia / High BP',
                    'Stillbirth / Miscarriage',
                    'Obstructed Labor',
                  ].map((comp) => {
                    const isSelected = selectedComplications.includes(comp);
                    return (
                      <button
                        key={comp}
                        type="button"
                        onClick={() => toggleComplication(comp)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-rose-100 text-rose-800 border-rose-300 font-semibold'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {comp}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1.5">
                  Medical History (चिकित्सा इतिहास)
                </label>
                <div className="flex flex-wrap gap-2">
                  {['Hypertension', 'Diabetes', 'Severe Anemia', 'Thyroid Disorder', 'Heart Condition'].map((med) => {
                    const isSelected = selectedMedicalHistory.includes(med);
                    return (
                      <button
                        key={med}
                        type="button"
                        onClick={() => toggleMedicalHistory(med)}
                        className={`px-2.5 py-1.5 rounded-xl text-xs font-medium border transition-all ${
                          isSelected
                            ? 'bg-amber-100 text-amber-800 border-amber-300 font-semibold'
                            : 'bg-stone-50 text-stone-600 border-stone-200 hover:bg-stone-100'
                        }`}
                      >
                        {isSelected ? '✓ ' : '+ '}
                        {med}
                      </button>
                    );
                  })}
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Source of Information
                </label>
                <select
                  value={sourceOfInfo}
                  onChange={(e: any) => setSourceOfInfo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                >
                  <option value="asha_survey">ASHA Field Survey / Door-to-Door</option>
                  <option value="self_report">Self-reported by Mother / Family</option>
                  <option value="hospital_referral">PHC / Sub-Centre Health Worker</option>
                </select>
              </div>
            </div>
          )}

          {/* STEP 3: Review and Save */}
          {step === 3 && (
            <div className="space-y-4 animate-fadeIn">
              <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-emerald-800">
                <Check className="w-4 h-4 text-emerald-600" />
                <span>3. Review & Confirm Registration</span>
              </div>

              <div className="bg-stone-50 rounded-2xl p-4 border border-stone-200 space-y-3">
                <div className="flex items-center justify-between pb-2 border-b border-stone-200">
                  <div>
                    <h4 className="text-base font-black text-slate-800">{fullName}</h4>
                    <p className="text-xs text-stone-500">
                      {age} Yrs • Village: {village}
                    </p>
                  </div>
                  <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-800 text-xs font-bold">
                    Active Pregnancy
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Contact</span>
                    <span className="font-semibold text-slate-700">{mobileNumber}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Husband</span>
                    <span className="font-semibold text-slate-700">{husbandName || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">LMP Date</span>
                    <span className="font-semibold text-slate-700">{lmp || 'Not specified'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Calculated EDD</span>
                    <span className="font-bold text-emerald-800">{edd || 'Pending'}</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Gestational Age</span>
                    <span className="font-bold text-slate-800">{gestationalAgeWeeks} Weeks</span>
                  </div>
                  <div>
                    <span className="text-stone-400 block text-[10px] uppercase font-bold">Obstetric Score</span>
                    <span className="font-semibold text-slate-700">
                      G{gravida} P{parity}
                    </span>
                  </div>
                </div>

                {selectedComplications.length > 0 && (
                  <div className="pt-2 border-t border-stone-200">
                    <span className="text-[10px] text-rose-700 uppercase font-bold block mb-1">
                      Reported Complications
                    </span>
                    <div className="flex flex-wrap gap-1">
                      {selectedComplications.map((c) => (
                        <span key={c} className="text-[10px] bg-rose-50 text-rose-700 border border-rose-200 px-2 py-0.5 rounded-md font-medium">
                          {c}
                        </span>
                      ))}
                    </div>
                  </div>
                )}
              </div>

              <div className="p-3.5 bg-emerald-50/70 border border-emerald-200 rounded-2xl space-y-1.5 text-xs text-emerald-900">
                <span className="font-bold flex items-center gap-1.5">
                  <Check className="w-3.5 h-3.5 text-emerald-700" />
                  Automatic Actions Upon Saving:
                </span>
                <ul className="text-[11px] space-y-1 pl-4 list-disc text-emerald-800">
                  <li>Generate permanent Beneficiary ID (e.g. MTR-2026-XXX)</li>
                  <li>Calculate gestational milestones & schedule ANC visits</li>
                  <li>Evaluate baseline risk and create ASHA visit tasks</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Modal Footer Controls */}
        <div className="px-6 py-4 bg-stone-50 border-t border-stone-200 flex items-center justify-between">
          {step > 1 ? (
            <button
              onClick={() => setStep((prev) => (prev - 1) as any)}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 hover:bg-stone-100 text-xs font-bold flex items-center gap-1.5 transition-all"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Back</span>
            </button>
          ) : (
            <div />
          )}

          {step < 3 ? (
            <button
              onClick={() => {
                if (step === 1 && (!fullName || !mobileNumber)) {
                  alert('Please enter mother full name and mobile number.');
                  return;
                }
                setStep((prev) => (prev + 1) as any);
              }}
              className="px-5 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
            >
              <span>Next: {step === 1 ? 'Pregnancy Details' : 'Review & Confirm'}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              onClick={handleSave}
              className="px-6 py-2.5 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black flex items-center gap-1.5 shadow-md transition-all active:scale-95"
            >
              <Check className="w-4 h-4" />
              <span>Confirm & Register Mother</span>
            </button>
          )}
        </div>
      </div>
    </div>
  );
};
