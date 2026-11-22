export type Language = 'en' | 'hi' | 'mr';

export type BeneficiaryStatus = 'active_pregnancy' | 'delivered' | 'high_risk' | 'completed';

export interface Beneficiary {
  id: string; // e.g. MTR-2026-001
  fullName: string;
  age: number;
  dob?: string;
  mobileNumber: string;
  village: string;
  address: string;
  husbandName?: string;
  husbandMobile?: string;
  ashaId: string;
  ashaName: string;
  registrationDate: string;
  status: BeneficiaryStatus;
  currentRiskLevel: 'HIGH' | 'MODERATE' | 'NORMAL';
  createdAt: string;
  updatedAt: string;
}

export interface Pregnancy {
  id: string;
  beneficiaryId: string;
  lmp: string; // YYYY-MM-DD
  edd: string; // YYYY-MM-DD
  gestationalAgeWeeks: number;
  gravida: number;
  parity: number;
  previousComplications: string[];
  medicalHistory: string[];
  registrationDate: string;
  sourceOfInfo: 'asha_survey' | 'self_report' | 'hospital_referral';
  status: 'active' | 'completed' | 'terminated';
  createdAt: string;
  updatedAt: string;
}

export interface ANCVisit {
  id: string;
  pregnancyId: string;
  beneficiaryId: string;
  visitNumber: number; // 1, 2, 3, 4, etc.
  visitDate: string;
  gestationalAgeWeeks: number;
  systolicBp: number;
  diastolicBp: number;
  weightKg: number;
  hemoglobinGdl: number;
  bloodGlucoseMgdl?: number;
  edemaSwelling: 'none' | 'pedal' | 'facial' | 'generalized';
  dangerSigns: string[];
  fetalMovement: 'normal' | 'reduced' | 'absent' | 'not_applicable';
  ifaTabletsGiven: number;
  tetanusToxoidGiven: boolean;
  medicalAdvice: string;
  nextDueDate: string;
  notes: string;
  recordedBy: string;
  isHighRiskFlagged: boolean;
  createdAt: string;
}

export interface RiskAssessment {
  id: string;
  beneficiaryId: string;
  pregnancyId?: string;
  assessmentDate: string;
  priority: 'HIGH' | 'MODERATE' | 'NORMAL';
  contributingFactors: string[];
  reasoning: string;
  recommendedAction: string;
  ruleVersion: string; // e.g. "MoHFW-MCH-v2.4"
  emergencyEscalation: boolean;
  missingDataWarnings: string[];
  createdAt: string;
}

export interface Delivery {
  id: string;
  pregnancyId: string;
  beneficiaryId: string;
  deliveryDateTime: string;
  placeOfDelivery: 'institutional_phc' | 'institutional_chc' | 'district_hospital' | 'home';
  deliveryFacility: string;
  deliveryType: 'normal_vaginal' | 'cesarean' | 'assisted_instrumental';
  birthOutcome: 'live_birth' | 'stillbirth';
  complications: string[];
  attendingProvider: string;
  createdAt: string;
}

export interface Newborn {
  id: string;
  deliveryId: string;
  motherBeneficiaryId: string;
  babyName: string;
  gender: 'male' | 'female' | 'other';
  birthWeightKg: number;
  currentWeightKg?: number;
  birthTime: string;
  feedingStatus: 'exclusive_breastfeeding' | 'formula' | 'mixed' | 'difficulty';
  temperatureCelsius?: number;
  jaundiceObserved: boolean;
  breathingDifficulty: boolean;
  cryAtBirth: boolean;
  dangerSigns: string[];
  createdAt: string;
}

export interface PNCVisit {
  id: string;
  deliveryId: string;
  motherBeneficiaryId: string;
  newbornId?: string;
  checkpoint: 'within_48_hours' | 'day_7' | 'day_14' | 'six_weeks';
  checkpointLabel: string;
  visitDate: string;
  status: 'completed' | 'due' | 'overdue' | 'upcoming';
  maternalAssessment: {
    systolicBp?: number;
    diastolicBp?: number;
    severeBleeding: boolean;
    fever: boolean;
    severePain: boolean;
    breastfeedingDifficulty: boolean;
    dangerSigns: string[];
    notes?: string;
  };
  newbornAssessment: {
    currentWeightKg?: number;
    temperatureCelsius?: number;
    exclusiveBreastfeeding: boolean;
    jaundice: boolean;
    breathingDifficulty: boolean;
    umbilicalCordInfection: boolean;
    dangerSigns: string[];
    notes?: string;
  };
  recordedBy: string;
  createdAt: string;
}

export interface Referral {
  id: string;
  beneficiaryId: string;
  pregnancyId?: string;
  referralDate: string;
  referralReason: string;
  referralFacility: string;
  referringAsha: string;
  priority: 'EMERGENCY' | 'HIGH' | 'ROUTINE';
  status: 'Created' | 'Referred' | 'Pending' | 'Completed' | 'Follow-up required';
  completionDate?: string;
  followUpNotes?: string;
  createdAt: string;
}

export interface MaatrTask {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  pregnancyId?: string;
  visitType: 'ANC 1' | 'ANC 2' | 'ANC 3' | 'ANC 4' | 'PNC 48h' | 'PNC Day 7' | 'PNC Day 14' | 'PNC 6w' | 'Referral Follow-up' | 'Danger Sign Escalation';
  dueDate: string;
  priority: 'HIGH' | 'MODERATE' | 'NORMAL';
  reason: string;
  status: 'pending' | 'completed' | 'overdue';
  createdAt: string;
}
