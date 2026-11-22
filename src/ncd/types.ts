export type Language = 'en' | 'hi' | 'mr';

export type Gender = 'male' | 'female' | 'other';

export interface SharedBeneficiary {
  id: string; // e.g. BEN-2026-001 or MTR-2026-001
  fullName: string;
  age: number;
  dob?: string;
  gender: Gender;
  mobileNumber: string;
  village: string;
  address: string;
  ashaId: string;
  ashaName: string;
  registrationDate: string;
  isRegisteredInMaatr?: boolean;
  isRegisteredInNCD?: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface ClinicalMeasurements {
  systolicBp: number;
  diastolicBp: number;
  bloodGlucoseMgdl?: number;
  glucoseType?: 'random' | 'fasting' | 'post_prandial';
  heightCm: number;
  weightKg: number;
  bmi: number; // calculated: weight / (height/100)^2
  bmiCategory: 'underweight' | 'normal' | 'overweight' | 'obese';
  pulseRate?: number;
}

export interface HealthHistoryCBAC {
  tobaccoUse: 'none' | 'smoking' | 'smokeless_chewing' | 'both';
  alcoholConsumption: boolean;
  waistCircumferenceCm?: number;
  physicalActivity150MinPerWeek: boolean;
  familyHistoryHypertension: boolean;
  familyHistoryDiabetes: boolean;
  familyHistoryHeartDisease: boolean;
  knownConditions: string[];
  previousNcdDiagnosis?: string;
  otherObservations?: string;
}

export interface NCDScreening {
  id: string;
  beneficiaryId: string;
  screeningDate: string;
  screenedBy: string;
  measurements: ClinicalMeasurements;
  history: HealthHistoryCBAC;
  cbacScore?: number;
  notes?: string;
  createdAt: string;
}

export type VisualArea = 'eyes' | 'neck' | 'feet' | 'legs';

export type VisualStatus =
  | 'not_screened'
  | 'image_captured'
  | 'analysis_pending'
  | 'flagged_for_review'
  | 'reviewed';

export interface VisualScreeningRecord {
  id: string;
  beneficiaryId: string;
  screeningId?: string;
  area: VisualArea;
  possibleCondition: string; // e.g. 'Anemia', 'Goiter / Thyroid', 'Diabetic Foot Complication', 'Edema'
  status: VisualStatus;
  images: {
    id: string;
    dataUrl: string;
    caption: string;
    capturedAt: string;
    qualityPassed: boolean;
  }[];
  aiObservation?: string; // Observation requiring clinical verification
  isFlaggedAbnormal: boolean;
  clinicalVerificationStatus: 'pending' | 'verified_abnormal' | 'verified_normal';
  notes?: string;
  assessedAt: string;
}

export interface NCDRiskAssessment {
  id: string;
  beneficiaryId: string;
  screeningId?: string;
  assessmentDate: string;
  priority: 'HIGH' | 'MODERATE' | 'NORMAL';
  contributingFactors: string[];
  reasoning: string;
  recommendedAction: string;
  ruleVersion: string; // e.g. "NPCDCS-NCD-v3.1"
  requiresImmediateReferral: boolean;
  createdAt: string;
}

export interface NCDFollowupTask {
  id: string;
  beneficiaryId: string;
  beneficiaryName: string;
  dueDate: string;
  reason: string;
  priority: 'HIGH' | 'MODERATE' | 'NORMAL';
  status: 'Pending' | 'Visit completed' | 'Referred' | 'Clinical assessment completed' | 'Follow-up required';
  assignedAsha: string;
  notes?: string;
  createdAt: string;
}

export interface NCDReferral {
  id: string;
  beneficiaryId: string;
  referralDate: string;
  reason: string;
  referredFacility: string;
  referringAsha: string;
  priority: 'EMERGENCY' | 'HIGH' | 'ROUTINE';
  status: 'Created' | 'Referred' | 'Pending' | 'Completed' | 'Follow-up required';
  completionDate?: string;
  followUpNotes?: string;
  createdAt: string;
}
