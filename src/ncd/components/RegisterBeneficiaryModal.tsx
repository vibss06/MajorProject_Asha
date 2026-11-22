import React, { useState } from 'react';
import { X, Check, AlertTriangle, User, Phone, MapPin, Sparkles } from 'lucide-react';
import { ncdStore } from '../data/ncdStore';
import type { Gender, SharedBeneficiary } from '../types';

interface RegisterBeneficiaryModalProps {
  isOpen: boolean;
  onClose: () => void;
  onRegistered: (beneficiaryId: string) => void;
}

export const RegisterBeneficiaryModal: React.FC<RegisterBeneficiaryModalProps> = ({
  isOpen,
  onClose,
  onRegistered,
}) => {
  const [fullName, setFullName] = useState('');
  const [age, setAge] = useState<number>(45);
  const [gender, setGender] = useState<Gender>('male');
  const [mobileNumber, setMobileNumber] = useState('');
  const [village, setVillage] = useState('Ramnagar');
  const [address, setAddress] = useState('');
  const [ashaId] = useState('ASHA-104');
  const [ashaName] = useState('Kamla Tai');
  const [registrationDate, setRegistrationDate] = useState(new Date().toISOString().split('T')[0]);

  // Duplicate Check
  const [existingMatch, setExistingMatch] = useState<{
    found: boolean;
    beneficiary?: SharedBeneficiary;
    sourceModule?: string;
  }>({ found: false });

  if (!isOpen) return null;

  const handleCheckDuplicate = () => {
    if (fullName && (mobileNumber || village)) {
      const result = ncdStore.checkDuplicate(fullName, mobileNumber, village);
      if (result.isDuplicate && result.existingBeneficiary) {
        setExistingMatch({
          found: true,
          beneficiary: result.existingBeneficiary,
          sourceModule: result.sourceModule,
        });
      } else {
        setExistingMatch({ found: false });
      }
    } else {
      setExistingMatch({ found: false });
    }
  };

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();

    const registered = ncdStore.registerBeneficiary({
      fullName,
      age: Number(age),
      gender,
      mobileNumber,
      village,
      address: address || `${village}, Ward area`,
      ashaId,
      ashaName,
      registrationDate,
    });

    onRegistered(registered.id);
    onClose();
  };

  const handleReuseExisting = () => {
    if (existingMatch.beneficiary) {
      existingMatch.beneficiary.isRegisteredInNCD = true;
      onRegistered(existingMatch.beneficiary.id);
      onClose();
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
        {/* Header */}
        <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-600 animate-pulse" />
              <h3 className="font-bold text-slate-800 text-lg">Register NCD Beneficiary</h3>
            </div>
            <p className="text-xs text-stone-500">Shared ASHA Sahayak Unified Registry</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSave} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
          {/* Duplicate Match Alert from Shared Maatr / NCD Database */}
          {existingMatch.found && existingMatch.beneficiary && (
            <div className="p-4 bg-emerald-50 border border-emerald-300 rounded-2xl space-y-2 text-emerald-950 animate-fadeIn">
              <div className="flex items-start gap-2.5">
                <Sparkles className="w-4 h-4 text-emerald-700 flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <span className="font-bold text-xs block">
                    Person Already Registered in {existingMatch.sourceModule}!
                  </span>
                  <p className="text-[11px] text-emerald-900 leading-relaxed">
                    Found matching profile: <strong>{existingMatch.beneficiary.fullName}</strong> ({existingMatch.beneficiary.id}, {existingMatch.beneficiary.village}, {existingMatch.beneficiary.mobileNumber}).
                    As per clinical policy, personal details are shared centrally without duplicate entry.
                  </p>
                </div>
              </div>
              <button
                type="button"
                onClick={handleReuseExisting}
                className="w-full py-2 px-3 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white font-bold text-xs shadow-xs transition-all"
              >
                ✓ Connect & Open Existing Profile ({existingMatch.beneficiary.id})
              </button>
            </div>
          )}

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Full Name (पूरा नाम) *</label>
            <input
              type="text"
              required
              value={fullName}
              onChange={(e) => setFullName(e.target.value)}
              onBlur={handleCheckDuplicate}
              placeholder="e.g. Ramesh Kumar"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-300 focus:border-emerald-600 focus:ring-1 focus:ring-emerald-600 text-sm outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Age (वर्ष) *</label>
              <input
                type="number"
                min="18"
                max="100"
                required
                value={age}
                onChange={(e) => setAge(Number(e.target.value))}
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Gender (लिंग) *</label>
              <select
                value={gender}
                onChange={(e: any) => setGender(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white outline-none"
              >
                <option value="male">Male (पुरुष)</option>
                <option value="female">Female (महिला)</option>
                <option value="other">Other</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Mobile Number *</label>
              <input
                type="tel"
                required
                value={mobileNumber}
                onChange={(e) => setMobileNumber(e.target.value)}
                onBlur={handleCheckDuplicate}
                placeholder="10-digit mobile"
                className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-sm outline-none"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Village (गाँव) *</label>
              <select
                value={village}
                onChange={(e) => setVillage(e.target.value)}
                onBlur={handleCheckDuplicate}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-sm bg-white outline-none"
              >
                <option value="Ramnagar">Ramnagar</option>
                <option value="Shantinagar">Shantinagar</option>
                <option value="Hanuman Nagar">Hanuman Nagar</option>
                <option value="Hanuman Chowk">Hanuman Chowk</option>
                <option value="Ganga Layout">Ganga Layout</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block font-semibold text-slate-700 mb-1">Address / Landmark</label>
            <input
              type="text"
              value={address}
              onChange={(e) => setAddress(e.target.value)}
              placeholder="e.g. Near Old Temple, Ward #4"
              className="w-full px-3.5 py-2 rounded-xl border border-stone-300 text-xs outline-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block font-semibold text-slate-700 mb-1">ASHA Worker</label>
              <input
                type="text"
                disabled
                value={`${ashaName} (${ashaId})`}
                className="w-full px-3 py-2 rounded-xl border border-stone-200 bg-stone-100 text-xs text-stone-600"
              />
            </div>
            <div>
              <label className="block font-semibold text-slate-700 mb-1">Registration Date</label>
              <input
                type="date"
                value={registrationDate}
                onChange={(e) => setRegistrationDate(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
              />
            </div>
          </div>

          <div className="pt-3 border-t border-stone-200 flex justify-end gap-2">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-black shadow-xs active:scale-95 transition-all"
            >
              Register & Start Screening
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};
