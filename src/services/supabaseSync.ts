import { supabase } from '../utils/supabaseClient';
import type {
  Beneficiary,
  Pregnancy,
  ANCVisit,
  Delivery,
  Newborn,
  PNCVisit,
  Referral as MatrrReferral,
} from '../maatr/types';
import type {
  SharedBeneficiary,
  NCDScreening,
  VisualScreeningRecord,
  NCDRiskAssessment,
  NCDFollowupTask,
  NCDReferral,
} from '../ncd/types';

// ========================================================
// MATRR SYNC HANDLERS (NEW RECORDS ONLY)
// ========================================================

/**
 * Sync a newly registered mother and initial pregnancy record to Supabase
 */
export async function syncNewMatrrBeneficiary(
  beneficiary: Beneficiary,
  pregnancy?: Pregnancy
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    // 1. Insert Beneficiary
    const { error: benError } = await supabase.from('matrr_beneficiaries').insert([
      {
        id: beneficiary.id,
        full_name: beneficiary.fullName,
        age: beneficiary.age,
        dob: beneficiary.dob || null,
        mobile_number: beneficiary.mobileNumber,
        village: beneficiary.village,
        address: beneficiary.address,
        husband_name: beneficiary.husbandName || null,
        husband_mobile: beneficiary.husbandMobile || null,
        asha_id: beneficiary.ashaId,
        asha_name: beneficiary.ashaName,
        registration_date: beneficiary.registrationDate,
        status: beneficiary.status,
        current_risk_level: beneficiary.currentRiskLevel,
        created_at: beneficiary.createdAt,
        updated_at: beneficiary.updatedAt,
      },
    ]);

    if (benError) {
      console.warn('[Supabase Sync: Matrr Beneficiary] Notice:', benError.message);
      return { success: false, error: benError.message };
    }

    // 2. Insert Pregnancy if provided
    if (pregnancy) {
      const { error: pregError } = await supabase.from('matrr_pregnancies').insert([
        {
          id: pregnancy.id,
          beneficiary_id: pregnancy.beneficiaryId,
          lmp: pregnancy.lmp,
          edd: pregnancy.edd,
          gestational_age_weeks: pregnancy.gestationalAgeWeeks,
          gravida: pregnancy.gravida,
          parity: pregnancy.parity,
          previous_complications: pregnancy.previousComplications,
          medical_history: pregnancy.medicalHistory,
          registration_date: pregnancy.registrationDate,
          source_of_info: pregnancy.sourceOfInfo,
          status: pregnancy.status,
          created_at: pregnancy.createdAt,
          updated_at: pregnancy.updatedAt,
        },
      ]);

      if (pregError) {
        console.warn('[Supabase Sync: Matrr Pregnancy] Notice:', pregError.message);
      }
    }

    console.log('[Supabase Sync] Successfully persisted new Matrr mother:', beneficiary.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: Matrr Beneficiary]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync a newly recorded Antenatal Care (ANC) visit to Supabase
 */
export async function syncNewMatrrANCVisit(
  visit: ANCVisit
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('matrr_anc_visits').insert([
      {
        id: visit.id,
        pregnancy_id: visit.pregnancyId,
        beneficiary_id: visit.beneficiaryId,
        visit_number: visit.visitNumber,
        visit_date: visit.visitDate,
        gestational_age_weeks: visit.gestationalAgeWeeks,
        systolic_bp: visit.systolicBp,
        diastolic_bp: visit.diastolicBp,
        weight_kg: visit.weightKg,
        hemoglobin_gdl: visit.hemoglobinGdl,
        blood_glucose_mgdl: visit.bloodGlucoseMgdl || null,
        edema_swelling: visit.edemaSwelling,
        danger_signs: visit.dangerSigns || [],
        fetal_movement: visit.fetalMovement,
        ifa_tablets_given: visit.ifaTabletsGiven,
        tetanus_toxoid_given: visit.tetanusToxoidGiven,
        medical_advice: visit.medicalAdvice,
        next_due_date: visit.nextDueDate || null,
        notes: visit.notes || null,
        recorded_by: visit.recordedBy,
        is_high_risk_flagged: visit.isHighRiskFlagged,
        created_at: visit.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: Matrr ANC Visit] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted new ANC visit:', visit.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: Matrr ANC Visit]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync a newly recorded Delivery and Newborn to Supabase
 */
export async function syncNewMatrrDelivery(
  delivery: Delivery,
  newborn?: Newborn
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error: delError } = await supabase.from('matrr_deliveries').insert([
      {
        id: delivery.id,
        pregnancy_id: delivery.pregnancyId,
        beneficiary_id: delivery.beneficiaryId,
        delivery_date_time: delivery.deliveryDateTime,
        place_of_delivery: delivery.placeOfDelivery,
        delivery_facility: delivery.deliveryFacility,
        delivery_type: delivery.deliveryType,
        birth_outcome: delivery.birthOutcome,
        complications: delivery.complications || [],
        attending_provider: delivery.attendingProvider,
        created_at: delivery.createdAt,
      },
    ]);

    if (delError) {
      console.warn('[Supabase Sync: Matrr Delivery] Notice:', delError.message);
      return { success: false, error: delError.message };
    }

    if (newborn) {
      const { error: nbError } = await supabase.from('matrr_newborns').insert([
        {
          id: newborn.id,
          delivery_id: newborn.deliveryId,
          mother_beneficiary_id: newborn.motherBeneficiaryId,
          baby_name: newborn.babyName,
          gender: newborn.gender,
          birth_weight_kg: newborn.birthWeightKg,
          current_weight_kg: newborn.currentWeightKg || null,
          birth_time: newborn.birthTime,
          feeding_status: newborn.feedingStatus,
          temperature_celsius: newborn.temperatureCelsius || null,
          jaundice_observed: newborn.jaundiceObserved,
          breathing_difficulty: newborn.breathingDifficulty,
          cry_at_birth: newborn.cryAtBirth,
          danger_signs: newborn.dangerSigns || [],
          created_at: newborn.createdAt,
        },
      ]);

      if (nbError) {
        console.warn('[Supabase Sync: Matrr Newborn] Notice:', nbError.message);
      }
    }

    console.log('[Supabase Sync] Successfully persisted new delivery & newborn:', delivery.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: Matrr Delivery]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync a newly recorded Postnatal Care (PNC) visit to Supabase
 */
export async function syncNewMatrrPNCVisit(
  visit: PNCVisit
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('matrr_pnc_visits').insert([
      {
        id: visit.id,
        delivery_id: visit.deliveryId,
        mother_beneficiary_id: visit.motherBeneficiaryId,
        newborn_id: visit.newbornId || null,
        checkpoint: visit.checkpoint,
        checkpoint_label: visit.checkpointLabel,
        visit_date: visit.visitDate,
        status: visit.status,
        maternal_assessment: visit.maternalAssessment,
        newborn_assessment: visit.newbornAssessment,
        recorded_by: visit.recordedBy,
        created_at: visit.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: Matrr PNC Visit] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted new PNC visit:', visit.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: Matrr PNC Visit]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync a newly created maternal referral to Supabase
 */
export async function syncNewMatrrReferral(
  referral: MatrrReferral
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('matrr_referrals').insert([
      {
        id: referral.id,
        beneficiary_id: referral.beneficiaryId,
        pregnancy_id: referral.pregnancyId || null,
        referral_date: referral.referralDate,
        referral_reason: referral.referralReason,
        referral_facility: referral.referralFacility,
        referring_asha: referral.referringAsha,
        priority: referral.priority,
        status: referral.status,
        follow_up_notes: referral.followUpNotes || null,
        created_at: referral.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: Matrr Referral] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted new Matrr referral:', referral.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: Matrr Referral]', err.message);
    return { success: false, error: err.message };
  }
}

// ========================================================
// NCD SYNC HANDLERS (NEW RECORDS ONLY)
// ========================================================

/**
 * Sync a newly registered NCD beneficiary to Supabase
 */
export async function syncNewNCDBeneficiary(
  beneficiary: SharedBeneficiary
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('ncd_beneficiaries').insert([
      {
        id: beneficiary.id,
        full_name: beneficiary.fullName,
        age: beneficiary.age,
        dob: beneficiary.dob || null,
        gender: beneficiary.gender,
        mobile_number: beneficiary.mobileNumber,
        village: beneficiary.village,
        address: beneficiary.address,
        asha_id: beneficiary.ashaId,
        asha_name: beneficiary.ashaName,
        registration_date: beneficiary.registrationDate,
        is_registered_in_maatr: beneficiary.isRegisteredInMaatr || false,
        is_registered_in_ncd: true,
        created_at: beneficiary.createdAt,
        updated_at: beneficiary.updatedAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: NCD Beneficiary] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted new NCD beneficiary:', beneficiary.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: NCD Beneficiary]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync a newly recorded NCD screening (vitals & CBAC) to Supabase
 */
export async function syncNewNCDScreening(
  screening: NCDScreening
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('ncd_screenings').insert([
      {
        id: screening.id,
        beneficiary_id: screening.beneficiaryId,
        screening_date: screening.screeningDate,
        screened_by: screening.screenedBy,
        systolic_bp: screening.measurements.systolicBp,
        diastolic_bp: screening.measurements.diastolicBp,
        blood_glucose_mgdl: screening.measurements.bloodGlucoseMgdl || null,
        glucose_type: screening.measurements.glucoseType || null,
        height_cm: screening.measurements.heightCm,
        weight_kg: screening.measurements.weightKg,
        bmi: screening.measurements.bmi,
        bmi_category: screening.measurements.bmiCategory,
        pulse_rate: screening.measurements.pulseRate || null,
        cbac_history: screening.history,
        cbac_score: screening.cbacScore || 0,
        notes: screening.notes || null,
        created_at: screening.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: NCD Screening] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted new NCD screening:', screening.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: NCD Screening]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync a new Visual Screening Record (Eyes, Neck, Feet, Legs) to Supabase
 */
export async function syncNewNCDVisualRecord(
  record: VisualScreeningRecord
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('ncd_visual_screenings').insert([
      {
        id: record.id,
        beneficiary_id: record.beneficiaryId,
        screening_id: record.screeningId || null,
        area: record.area,
        possible_condition: record.possibleCondition,
        status: record.status,
        images: record.images,
        ai_observation: record.aiObservation || null,
        is_flagged_abnormal: record.isFlaggedAbnormal,
        clinical_verification_status: record.clinicalVerificationStatus,
        notes: record.notes || null,
        assessed_at: record.assessedAt,
        created_at: new Date().toISOString(),
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: NCD Visual Record] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted new Visual Record:', record.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: NCD Visual Record]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync an NCD Risk Assessment result to Supabase
 */
export async function syncNewNCDRiskAssessment(
  assessment: NCDRiskAssessment
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('ncd_risk_assessments').insert([
      {
        id: assessment.id,
        beneficiary_id: assessment.beneficiaryId,
        screening_id: assessment.screeningId || null,
        assessment_date: assessment.assessmentDate,
        priority: assessment.priority,
        contributing_factors: assessment.contributingFactors,
        reasoning: assessment.reasoning,
        recommended_action: assessment.recommendedAction,
        rule_version: assessment.ruleVersion,
        requires_immediate_referral: assessment.requiresImmediateReferral,
        created_at: assessment.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: NCD Risk Assessment] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted NCD risk assessment:', assessment.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: NCD Risk Assessment]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync an NCD Follow-Up Task to Supabase
 */
export async function syncNewNCDFollowup(
  task: NCDFollowupTask
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('ncd_followups').insert([
      {
        id: task.id,
        beneficiary_id: task.beneficiaryId,
        beneficiary_name: task.beneficiaryName,
        due_date: task.dueDate,
        reason: task.reason,
        priority: task.priority,
        status: task.status,
        assigned_asha: task.assignedAsha,
        notes: task.notes || null,
        created_at: task.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: NCD Followup] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted NCD followup:', task.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: NCD Followup]', err.message);
    return { success: false, error: err.message };
  }
}

/**
 * Sync an NCD Referral to Supabase
 */
export async function syncNewNCDReferral(
  referral: NCDReferral
): Promise<{ success: boolean; error?: string }> {
  try {
    if (!supabase) return { success: false, error: 'Supabase client not initialized' };

    const { error } = await supabase.from('ncd_referrals').insert([
      {
        id: referral.id,
        beneficiary_id: referral.beneficiaryId,
        referral_date: referral.referralDate,
        reason: referral.reason,
        referred_facility: referral.referredFacility,
        referring_asha: referral.referringAsha,
        priority: referral.priority,
        status: referral.status,
        completion_date: referral.completionDate || null,
        follow_up_notes: referral.followUpNotes || null,
        created_at: referral.createdAt,
      },
    ]);

    if (error) {
      console.warn('[Supabase Sync: NCD Referral] Notice:', error.message);
      return { success: false, error: error.message };
    }

    console.log('[Supabase Sync] Successfully persisted NCD referral:', referral.id);
    return { success: true };
  } catch (err: any) {
    console.warn('[Supabase Sync Exception: NCD Referral]', err.message);
    return { success: false, error: err.message };
  }
}
