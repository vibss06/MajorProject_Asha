import React, { useState } from 'react';
import { Baby, Plus, Calendar, MapPin, CheckCircle2, Clock, AlertTriangle, X } from 'lucide-react';
import { maatrStore } from '../data/maatrStore';
import type { Delivery, Newborn } from '../types';

interface DeliverySectionProps {
  onSelectBeneficiary: (id: string) => void;
}

export const DeliverySection: React.FC<DeliverySectionProps> = ({ onSelectBeneficiary }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const activeBeneficiaries = maatrStore
    .getBeneficiaries()
    .filter((b) => b.status === 'active_pregnancy' || b.status === 'high_risk');

  const [selectedMotherId, setSelectedMotherId] = useState<string>(activeBeneficiaries[0]?.id || '');
  const [deliveryDateTime, setDeliveryDateTime] = useState(new Date().toISOString().slice(0, 16));
  const [placeOfDelivery, setPlaceOfDelivery] = useState<'institutional_phc' | 'institutional_chc' | 'district_hospital' | 'home'>('institutional_chc');
  const [deliveryFacility, setDeliveryFacility] = useState('CHC Saoner, Nagpur Rural');
  const [deliveryType, setDeliveryType] = useState<'normal_vaginal' | 'cesarean' | 'assisted_instrumental'>('normal_vaginal');
  const [birthOutcome, setBirthOutcome] = useState<'live_birth' | 'stillbirth'>('live_birth');
  const [complications, setComplications] = useState('');
  const [attendingProvider, setAttendingProvider] = useState('Dr. Ananya Rao & Staff Nurse');

  // Newborn info
  const [babyName, setBabyName] = useState('');
  const [gender, setGender] = useState<'male' | 'female' | 'other'>('male');
  const [birthWeightKg, setBirthWeightKg] = useState(2.9);
  const [feedingStatus, setFeedingStatus] = useState<'exclusive_breastfeeding' | 'formula' | 'mixed' | 'difficulty'>('exclusive_breastfeeding');
  const [cryAtBirth, setCryAtBirth] = useState(true);

  const deliveries = maatrStore.getDeliveries();
  const newborns = maatrStore.getNewborns();

  const handleSaveDelivery = (e: React.FormEvent) => {
    e.preventDefault();
    const pregnancy = maatrStore.getActivePregnancyForBeneficiary(selectedMotherId);
    if (!pregnancy) {
      alert('Selected mother does not have an active pregnancy record.');
      return;
    }

    const mother = maatrStore.getBeneficiaryById(selectedMotherId);
    const finalBabyName = babyName || `Baby of ${mother?.fullName || 'Mother'}`;

    maatrStore.recordDelivery(
      {
        pregnancyId: pregnancy.id,
        beneficiaryId: selectedMotherId,
        deliveryDateTime,
        placeOfDelivery,
        deliveryFacility,
        deliveryType,
        birthOutcome,
        complications: complications ? [complications] : ['None'],
        attendingProvider,
      },
      {
        babyName: finalBabyName,
        gender,
        birthWeightKg: Number(birthWeightKg),
        currentWeightKg: Number(birthWeightKg),
        birthTime: deliveryDateTime,
        feedingStatus,
        temperatureCelsius: 36.8,
        jaundiceObserved: false,
        breathingDifficulty: false,
        cryAtBirth,
        dangerSigns: [],
      }
    );

    setIsModalOpen(false);
  };

  return (
    <div className="space-y-5 animate-fadeIn">
      {/* Header Banner */}
      <div className="bg-stone-50 rounded-3xl p-5 border border-stone-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 rounded-xl bg-sky-100 text-sky-800 flex items-center justify-center font-bold">
              <Baby className="w-4 h-4" />
            </span>
            <h2 className="text-xl font-black text-slate-800">Delivery & Birth Management</h2>
          </div>
          <p className="text-xs text-stone-500 mt-1 max-w-md">
            Log institutional deliveries, register newborns, and automatically activate the 4-stage PNC workflow.
          </p>
        </div>

        <button
          onClick={() => setIsModalOpen(true)}
          className="px-4 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-bold flex items-center gap-1.5 shadow-sm transition-all"
        >
          <Plus className="w-4 h-4" />
          <span>+ Record Delivery Event</span>
        </button>
      </div>

      {/* Deliveries Registry */}
      <div className="space-y-3">
        <h3 className="text-sm font-extrabold text-slate-800">
          Delivered Mothers & Newborn Registry ({deliveries.length})
        </h3>

        {deliveries.length > 0 ? (
          <div className="grid grid-cols-1 gap-3">
            {deliveries.map((del) => {
              const mother = maatrStore.getBeneficiaryById(del.beneficiaryId);
              const baby = newborns.find((n) => n.deliveryId === del.id);

              return (
                <div
                  key={del.id}
                  className="bg-white rounded-2xl p-4 border border-stone-200 hover:border-sky-300 transition-all shadow-sm space-y-3"
                >
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-2 border-b border-stone-100">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-2xl bg-sky-100 text-sky-800 flex items-center justify-center font-black text-xs">
                        👶
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => onSelectBeneficiary(del.beneficiaryId)}
                            className="font-extrabold text-slate-800 text-sm hover:text-sky-700 underline text-left"
                          >
                            {mother?.fullName}
                          </button>
                          <span className="text-[10px] text-stone-400">({del.beneficiaryId})</span>
                          <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                            ✓ {del.birthOutcome}
                          </span>
                        </div>
                        <p className="text-xs text-stone-500">
                          Facility: {del.deliveryFacility} ({del.placeOfDelivery})
                        </p>
                      </div>
                    </div>

                    <div className="text-right text-xs">
                      <span className="text-stone-400 block text-[10px]">Delivered On</span>
                      <span className="font-bold text-slate-700">{del.deliveryDateTime.replace('T', ' ')}</span>
                    </div>
                  </div>

                  {/* Delivery & Newborn Details */}
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 text-xs">
                    <div className="p-2.5 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Delivery Mode</span>
                      <span className="font-bold text-slate-800">{del.deliveryType}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Newborn Name</span>
                      <span className="font-bold text-sky-800">{baby?.babyName || 'Baby'}</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Birth Weight</span>
                      <span className="font-bold text-slate-800">{baby?.birthWeightKg} kg</span>
                    </div>
                    <div className="p-2.5 bg-stone-50 rounded-xl">
                      <span className="text-stone-400 block text-[10px] uppercase font-bold">Feeding Status</span>
                      <span className="font-bold text-emerald-800">{baby?.feedingStatus}</span>
                    </div>
                  </div>

                  <div className="text-[11px] text-stone-500 flex items-center justify-between pt-1">
                    <span>Provider: {del.attendingProvider}</span>
                    <span className="text-emerald-700 font-bold">PNC Checkpoints Active ✓</span>
                  </div>
                </div>
              );
            })}
          </div>
        ) : (
          <div className="p-8 text-center bg-white rounded-3xl border border-dashed border-stone-300">
            <Baby className="w-8 h-8 text-stone-400 mx-auto mb-2" />
            <p className="text-xs text-stone-500">No deliveries registered yet.</p>
          </div>
        )}
      </div>

      {/* Record Delivery Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-stone-200 overflow-hidden flex flex-col max-h-[92vh]">
            <div className="px-6 py-4 bg-stone-50 border-b border-stone-200 flex items-center justify-between">
              <div>
                <h3 className="font-bold text-slate-800 text-lg">Record Delivery & Register Newborn</h3>
                <p className="text-xs text-stone-500">Updates pregnancy status & creates linked PNC schedule</p>
              </div>
              <button
                onClick={() => setIsModalOpen(false)}
                className="p-2 hover:bg-stone-200 rounded-full text-stone-400 hover:text-stone-700"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveDelivery} className="p-6 overflow-y-auto flex-1 space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-700 mb-1">Select Mother *</label>
                <select
                  value={selectedMotherId}
                  onChange={(e) => setSelectedMotherId(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl border border-stone-300 text-sm bg-white"
                >
                  {activeBeneficiaries.map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.fullName} ({b.id}) - {b.village}
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Date & Time of Delivery *</label>
                  <input
                    type="datetime-local"
                    required
                    value={deliveryDateTime}
                    onChange={(e) => setDeliveryDateTime(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Place of Delivery *</label>
                  <select
                    value={placeOfDelivery}
                    onChange={(e: any) => setPlaceOfDelivery(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="institutional_chc">Community Health Centre (CHC)</option>
                    <option value="institutional_phc">Primary Health Centre (PHC)</option>
                    <option value="district_hospital">District Hospital</option>
                    <option value="home">Home Delivery (with SBA)</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Delivery Facility Name</label>
                <input
                  type="text"
                  value={deliveryFacility}
                  onChange={(e) => setDeliveryFacility(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Delivery Type</label>
                  <select
                    value={deliveryType}
                    onChange={(e: any) => setDeliveryType(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="normal_vaginal">Normal Vaginal Delivery</option>
                    <option value="cesarean">Cesarean Section (C-Section)</option>
                    <option value="assisted_instrumental">Assisted Instrumental</option>
                  </select>
                </div>
                <div>
                  <label className="block font-semibold text-slate-700 mb-1">Birth Outcome</label>
                  <select
                    value={birthOutcome}
                    onChange={(e: any) => setBirthOutcome(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs bg-white"
                  >
                    <option value="live_birth">Live Birth (जीवित शिशु)</option>
                    <option value="stillbirth">Stillbirth (मृत जन्म)</option>
                  </select>
                </div>
              </div>

              {/* Newborn Information */}
              <div className="p-3.5 bg-sky-50/70 border border-sky-200 rounded-2xl space-y-3">
                <span className="font-bold text-sky-900 uppercase tracking-wider text-[11px] block">
                  Newborn Initial Health Record
                </span>
                <div className="grid grid-cols-3 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Baby Name (Optional)</label>
                    <input
                      type="text"
                      placeholder="e.g. Baby boy"
                      value={babyName}
                      onChange={(e) => setBabyName(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Gender</label>
                    <select
                      value={gender}
                      onChange={(e: any) => setGender(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      <option value="male">Male</option>
                      <option value="female">Female</option>
                    </select>
                  </div>
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Birth Weight (kg)</label>
                    <input
                      type="number"
                      step="0.05"
                      value={birthWeightKg}
                      onChange={(e) => setBirthWeightKg(Number(e.target.value))}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block font-medium text-slate-700 mb-1">Feeding Status</label>
                    <select
                      value={feedingStatus}
                      onChange={(e: any) => setFeedingStatus(e.target.value)}
                      className="w-full px-2.5 py-1.5 rounded-lg border border-stone-300 text-xs bg-white"
                    >
                      <option value="exclusive_breastfeeding">Exclusive Breastfeeding (मां का दूध)</option>
                      <option value="difficulty">Feeding Difficulty (स्तनपान में कठिनाई)</option>
                      <option value="formula">Prescribed Formula</option>
                    </select>
                  </div>
                  <div className="flex items-center gap-2 pt-4">
                    <input
                      type="checkbox"
                      id="cryAtBirth"
                      checked={cryAtBirth}
                      onChange={(e) => setCryAtBirth(e.target.checked)}
                      className="rounded text-sky-600 focus:ring-sky-500"
                    />
                    <label htmlFor="cryAtBirth" className="text-xs font-semibold text-slate-700">
                      Baby cried immediately at birth
                    </label>
                  </div>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-700 mb-1">Attending Provider</label>
                <input
                  type="text"
                  value={attendingProvider}
                  onChange={(e) => setAttendingProvider(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-stone-300 text-xs"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2 border-t border-stone-200">
                <button
                  type="button"
                  onClick={() => setIsModalOpen(false)}
                  className="px-4 py-2 rounded-xl border border-stone-300 text-stone-700 text-xs font-bold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 rounded-xl bg-sky-700 hover:bg-sky-800 text-white text-xs font-black shadow-sm"
                >
                  Save Delivery & Activate PNC
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
