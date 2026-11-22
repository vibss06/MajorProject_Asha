import type { ANCVisit, Pregnancy, RiskAssessment } from '../types';

export const CLINICAL_GUIDELINE_VERSION = 'MoHFW-MCH-v2.4';

/**
 * Calculates Estimated Date of Delivery (EDD) from LMP using Naegele's rule (LMP + 280 days).
 */
export function calculateEDDFromLMP(lmpDateString: string): string {
  if (!lmpDateString) return '';
  const lmp = new Date(lmpDateString);
  if (isNaN(lmp.getTime())) return '';
  const edd = new Date(lmp.getTime() + 280 * 24 * 60 * 60 * 1000);
  return edd.toISOString().split('T')[0];
}

/**
 * Calculates Gestational Age in completed weeks from LMP to today (or given reference date).
 */
export function calculateGestationalWeeks(lmpDateString: string, referenceDateString?: string): number {
  if (!lmpDateString) return 0;
  const lmp = new Date(lmpDateString);
  const ref = referenceDateString ? new Date(referenceDateString) : new Date();
  if (isNaN(lmp.getTime()) || isNaN(ref.getTime())) return 0;

  const diffMs = ref.getTime() - lmp.getTime();
  const diffWeeks = Math.floor(diffMs / (7 * 24 * 60 * 60 * 1000));
  return Math.max(0, Math.min(diffWeeks, 44));
}

/**
 * Standard Indian Maternal Healthcare (MoHFW) recommended ANC checkpoints
 */
export interface ANCScheduleCheckpoint {
  visitNumber: number;
  label: string;
  recommendedWeekStart: number;
  recommendedWeekEnd: number;
  description: string;
}

export const MOHFW_ANC_SCHEDULE: ANCScheduleCheckpoint[] = [
  {
    visitNumber: 1,
    label: 'ANC 1 (Early Registration)',
    recommendedWeekStart: 0,
    recommendedWeekEnd: 12,
    description: 'Registration, baseline BP/weight/Hb, blood grouping, TT-1/booster, folic acid',
  },
  {
    visitNumber: 2,
    label: 'ANC 2 (Second Trimester)',
    recommendedWeekStart: 14,
    recommendedWeekEnd: 26,
    description: 'BP, abdominal exam, Hb check, TT-2 dose, IFA tablets initiation, fetal heart check',
  },
  {
    visitNumber: 3,
    label: 'ANC 3 (Third Trimester - Early)',
    recommendedWeekStart: 28,
    recommendedWeekEnd: 34,
    description: 'BP monitoring, fundal height, fetal presentation & movements, anemia screening',
  },
  {
    visitNumber: 4,
    label: 'ANC 4 (Third Trimester - Term)',
    recommendedWeekStart: 36,
    recommendedWeekEnd: 40,
    description: 'Birth preparedness, identification of danger signs, institutional delivery plan',
  },
];

/**
 * Evaluates clinical risk based on MoHFW maternal healthcare guidelines.
 * Never invents scoring thresholds; explains every contributing factor.
 */
export function evaluateMaternalRisk(
  pregnancy: Pregnancy,
  latestVisit: ANCVisit | null,
  previousVisits: ANCVisit[] = []
): RiskAssessment {
  const contributingFactors: string[] = [];
  const missingDataWarnings: string[] = [];
  let isEmergency = false;
  let priority: 'HIGH' | 'MODERATE' | 'NORMAL' = 'NORMAL';

  // 1. Evaluate Danger Signs (Highest clinical urgency)
  if (latestVisit && latestVisit.dangerSigns && latestVisit.dangerSigns.length > 0) {
    const dangerList = latestVisit.dangerSigns.join(', ');
    contributingFactors.push(`Critical danger sign reported: ${dangerList}`);
    isEmergency = true;
    priority = 'HIGH';
  }

  // 2. Evaluate Blood Pressure (Preeclampsia / Gestational Hypertension)
  if (latestVisit && (latestVisit.systolicBp > 0 || latestVisit.diastolicBp > 0)) {
    if (latestVisit.systolicBp >= 140 || latestVisit.diastolicBp >= 90) {
      contributingFactors.push(
        `Elevated Blood Pressure recorded (${latestVisit.systolicBp}/${latestVisit.diastolicBp} mmHg) — Risk of gestational hypertension/preeclampsia`
      );
      priority = 'HIGH';
    } else if (latestVisit.systolicBp >= 130 || latestVisit.diastolicBp >= 85) {
      contributingFactors.push(
        `Borderline Blood Pressure (${latestVisit.systolicBp}/${latestVisit.diastolicBp} mmHg)`
      );
      if (priority !== 'HIGH') priority = 'MODERATE';
    }
  } else {
    missingDataWarnings.push('Recent Blood Pressure reading is missing');
  }

  // 3. Evaluate Hemoglobin (Anemia in Pregnancy)
  if (latestVisit && latestVisit.hemoglobinGdl > 0) {
    if (latestVisit.hemoglobinGdl < 7.0) {
      contributingFactors.push(
        `Severe Anemia detected (Hb ${latestVisit.hemoglobinGdl} g/dL < 7.0) — High maternal & fetal risk`
      );
      priority = 'HIGH';
    } else if (latestVisit.hemoglobinGdl < 10.0) {
      contributingFactors.push(
        `Moderate Anemia detected (Hb ${latestVisit.hemoglobinGdl} g/dL < 10.0)`
      );
      if (priority !== 'HIGH') priority = 'MODERATE';
    }
  } else {
    missingDataWarnings.push('Hemoglobin level not yet verified for recent visit');
  }

  // 4. Edema / Swelling
  if (latestVisit && (latestVisit.edemaSwelling === 'facial' || latestVisit.edemaSwelling === 'generalized')) {
    contributingFactors.push(
      `Marked edema observed (${latestVisit.edemaSwelling}) — Possible preeclampsia indicator`
    );
    priority = 'HIGH';
  }

  // 5. Fetal Movement (Third Trimester)
  if (
    pregnancy.gestationalAgeWeeks >= 28 &&
    latestVisit &&
    (latestVisit.fetalMovement === 'reduced' || latestVisit.fetalMovement === 'absent')
  ) {
    contributingFactors.push(
      `Reduced or absent fetal movements in 3rd trimester (${latestVisit.fetalMovement})`
    );
    isEmergency = true;
    priority = 'HIGH';
  }

  // 6. Pregnancy History & Previous Complications
  if (pregnancy.previousComplications && pregnancy.previousComplications.length > 0) {
    const compList = pregnancy.previousComplications.join(', ');
    contributingFactors.push(`Documented previous obstetric complications: ${compList}`);
    if (priority !== 'HIGH') priority = 'MODERATE';
  }

  // 7. Age Risk factors
  // (In real practice, adolescent pregnancy < 18 or elderly primigravida > 35 is considered higher risk)
  if (pregnancy.parity === 0 && pregnancy.gravida === 1) {
    // primigravida requires extra vigilance
  }

  // Formulate Clinical Recommendations
  let recommendedAction = '';
  let reasoning = '';

  if (isEmergency || priority === 'HIGH') {
    reasoning =
      'High clinical urgency triggered by active danger signs, severe hypertension, or critical laboratory thresholds.';
    recommendedAction =
      'Immediate referral and escort to Community Health Centre (CHC) or District Hospital / FRU for Medical Officer assessment.';
  } else if (priority === 'MODERATE') {
    reasoning =
      'Moderate risk factors identified requiring enhanced surveillance, dietary supplementation, and prompt ANM checkup.';
    recommendedAction =
      'Schedule follow-up visit with ANM within 7 days. Ensure daily IFA compliance and monitor BP closely.';
  } else {
    reasoning =
      'Routine antenatal course with normal vitals and no documented high-risk factors at present.';
    recommendedAction =
      'Continue routine MoHFW antenatal care schedule, balanced nutrition, and IFA tablets.';
  }

  return {
    id: `RA-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
    beneficiaryId: pregnancy.beneficiaryId,
    pregnancyId: pregnancy.id,
    assessmentDate: new Date().toISOString().split('T')[0],
    priority,
    contributingFactors: contributingFactors.length > 0 ? contributingFactors : ['All parameters within normal limits'],
    reasoning,
    recommendedAction,
    ruleVersion: CLINICAL_GUIDELINE_VERSION,
    emergencyEscalation: isEmergency,
    missingDataWarnings,
    createdAt: new Date().toISOString(),
  };
}
