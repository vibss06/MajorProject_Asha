import type { ClinicalMeasurements, HealthHistoryCBAC, NCDRiskAssessment, VisualScreeningRecord } from '../types';

export const NCD_GUIDELINE_VERSION = 'NPCDCS-NCD-v3.1';

/**
 * Calculates BMI from weight (kg) and height (cm).
 * Formula: BMI = weight (kg) / (height (m))^2
 */
export function calculateBMI(weightKg: number, heightCm: number): {
  bmi: number;
  category: 'underweight' | 'normal' | 'overweight' | 'obese';
  label: string;
} {
  if (!weightKg || !heightCm || heightCm <= 0) {
    return { bmi: 0, category: 'normal', label: 'Not calculated' };
  }
  const heightM = heightCm / 100;
  const bmiRaw = weightKg / (heightM * heightM);
  const bmi = Math.round(bmiRaw * 10) / 10;

  let category: 'underweight' | 'normal' | 'overweight' | 'obese' = 'normal';
  let label = 'Normal (18.5 - 24.9)';

  if (bmi < 18.5) {
    category = 'underweight';
    label = 'Underweight (< 18.5)';
  } else if (bmi >= 18.5 && bmi <= 24.9) {
    category = 'normal';
    label = 'Normal (18.5 - 24.9)';
  } else if (bmi >= 25.0 && bmi <= 29.9) {
    category = 'overweight';
    label = 'Overweight (25.0 - 29.9)';
  } else {
    category = 'obese';
    label = 'Obese (≥ 30.0)';
  }

  return { bmi, category, label };
}

/**
 * Evaluates explainable NCD clinical risk based on National Programme for Prevention
 * and Control of Cancer, Diabetes, Cardiovascular Diseases and Stroke (NPCDCS) guidelines.
 */
export function evaluateNCDRisk(
  beneficiaryId: string,
  measurements: ClinicalMeasurements,
  history?: HealthHistoryCBAC,
  visualRecords: VisualScreeningRecord[] = []
): NCDRiskAssessment {
  const contributingFactors: string[] = [];
  let isImmediateReferral = false;
  let priority: 'HIGH' | 'MODERATE' | 'NORMAL' = 'NORMAL';

  // 1. Evaluate Blood Pressure
  if (measurements.systolicBp > 0 || measurements.diastolicBp > 0) {
    if (measurements.systolicBp >= 160 || measurements.diastolicBp >= 100) {
      contributingFactors.push(
        `Stage 2 Hypertension recorded (${measurements.systolicBp}/${measurements.diastolicBp} mmHg) — Critical cardiovascular risk`
      );
      priority = 'HIGH';
      isImmediateReferral = true;
    } else if (measurements.systolicBp >= 140 || measurements.diastolicBp >= 90) {
      contributingFactors.push(
        `Elevated Blood Pressure / Stage 1 Hypertension (${measurements.systolicBp}/${measurements.diastolicBp} mmHg)`
      );
      priority = 'HIGH';
    } else if (measurements.systolicBp >= 130 || measurements.diastolicBp >= 85) {
      contributingFactors.push(
        `High Normal / Pre-hypertension (${measurements.systolicBp}/${measurements.diastolicBp} mmHg)`
      );
      if (priority === 'NORMAL') priority = 'MODERATE';
    }
  }

  // 2. Evaluate Blood Glucose
  if (measurements.bloodGlucoseMgdl && measurements.bloodGlucoseMgdl > 0) {
    if (measurements.bloodGlucoseMgdl >= 200) {
      contributingFactors.push(
        `Marked Hyperglycemia (Random Blood Sugar ${measurements.bloodGlucoseMgdl} mg/dL ≥ 200) — High diabetes risk`
      );
      priority = 'HIGH';
    } else if (measurements.bloodGlucoseMgdl >= 140) {
      contributingFactors.push(
        `Elevated Blood Glucose (${measurements.bloodGlucoseMgdl} mg/dL ≥ 140) — Impaired glucose tolerance`
      );
      if (priority !== 'HIGH') priority = 'MODERATE';
    }
  }

  // 3. Evaluate BMI
  if (measurements.bmi >= 30.0) {
    contributingFactors.push(`Clinical Obesity detected (BMI ${measurements.bmi} kg/m² ≥ 30.0)`);
    if (priority === 'NORMAL') priority = 'MODERATE';
  } else if (measurements.bmi >= 25.0) {
    contributingFactors.push(`Overweight status (BMI ${measurements.bmi} kg/m²)`);
  }

  // 4. Evaluate Visual Screening Abnormalities
  visualRecords.forEach((vr) => {
    if (vr.isFlaggedAbnormal) {
      if (vr.area === 'feet') {
        contributingFactors.push(
          `Visual screening: Visible foot ulceration/wound flagged — High diabetic foot risk`
        );
        priority = 'HIGH';
        isImmediateReferral = true;
      } else if (vr.area === 'eyes') {
        contributingFactors.push(
          `Visual screening: Visible conjunctival pallor flagged — Suspected nutritional/chronic anemia`
        );
        if (priority !== 'HIGH') priority = 'MODERATE';
      } else if (vr.area === 'neck') {
        contributingFactors.push(
          `Visual screening: Visible neck/thyroid enlargement flagged`
        );
        if (priority !== 'HIGH') priority = 'MODERATE';
      } else if (vr.area === 'legs') {
        contributingFactors.push(
          `Visual screening: Visible lower limb edema (swelling) flagged`
        );
        if (priority !== 'HIGH') priority = 'MODERATE';
      }
    }
  });

  // 5. Evaluate Lifestyle & Family Risk Factors
  if (history) {
    if (history.tobaccoUse !== 'none') {
      contributingFactors.push(`Active tobacco consumption reported (${history.tobaccoUse})`);
    }
    if (history.familyHistoryHeartDisease || history.familyHistoryHypertension) {
      contributingFactors.push(`Documented positive family history of cardiovascular disease`);
      if (priority === 'NORMAL') priority = 'MODERATE';
    }
    if (history.familyHistoryDiabetes) {
      contributingFactors.push(`Family history of type 2 diabetes mellitus`);
    }
  }

  // Clinical Recommendations Formulation
  let reasoning = '';
  let recommendedAction = '';

  if (priority === 'HIGH') {
    reasoning =
      'Significant clinical indicators detected (hypertension, hyperglycemia, or suspicious visual abnormalities) requiring prompt medical officer assessment.';
    recommendedAction =
      'Refer to Primary Health Centre (PHC) / Community Health Centre (CHC) within 7 days for confirmatory laboratory testing and physician prescription.';
  } else if (priority === 'MODERATE') {
    reasoning =
      'Borderline cardiovascular or metabolic risk factors noted. Early lifestyle modification and periodic monitoring recommended.';
    recommendedAction =
      'Provide dietary counseling (reduced salt, low refined sugar), tobacco cessation advice, and schedule follow-up BP/BMI re-assessment in 30 days.';
  } else {
    reasoning =
      'All recorded vital parameters and visual screening areas are within normal screening thresholds.';
    recommendedAction =
      'Continue annual NCD screening under National Health Mission guidelines and maintain healthy diet and physical activity.';
  }

  return {
    id: `NCD-RA-${Date.now().toString().slice(-4)}`,
    beneficiaryId,
    assessmentDate: new Date().toISOString().split('T')[0],
    priority,
    contributingFactors:
      contributingFactors.length > 0 ? contributingFactors : ['All screening parameters within normal limits'],
    reasoning,
    recommendedAction,
    ruleVersion: NCD_GUIDELINE_VERSION,
    requiresImmediateReferral: isImmediateReferral,
    createdAt: new Date().toISOString(),
  };
}
