-- ========================================================
-- ASHA Sahayak: Separate Supabase Schema for Matrr & NCD
-- Run this in your Supabase Dashboard -> SQL Editor
-- ========================================================

-- Enable UUID extension if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ========================================================
-- SECTION 1: MATRR (Maternal & Newborn Care) TABLES
-- ========================================================

-- 1.1 Matrr Beneficiaries (Mothers)
CREATE TABLE IF NOT EXISTS public.matrr_beneficiaries (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    dob DATE,
    mobile_number TEXT NOT NULL,
    village TEXT NOT NULL,
    address TEXT NOT NULL,
    husband_name TEXT,
    husband_mobile TEXT,
    asha_id TEXT NOT NULL,
    asha_name TEXT NOT NULL,
    registration_date DATE NOT NULL,
    status TEXT DEFAULT 'active_pregnancy',
    current_risk_level TEXT DEFAULT 'NORMAL',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.2 Matrr Pregnancies
CREATE TABLE IF NOT EXISTS public.matrr_pregnancies (
    id TEXT PRIMARY KEY,
    beneficiary_id TEXT REFERENCES public.matrr_beneficiaries(id) ON DELETE CASCADE,
    lmp DATE NOT NULL,
    edd DATE NOT NULL,
    gestational_age_weeks NUMERIC NOT NULL,
    gravida INTEGER DEFAULT 1,
    parity INTEGER DEFAULT 0,
    previous_complications JSONB DEFAULT '[]'::jsonb,
    medical_history JSONB DEFAULT '[]'::jsonb,
    registration_date DATE NOT NULL,
    source_of_info TEXT DEFAULT 'asha_survey',
    status TEXT DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.3 Matrr ANC Visits
CREATE TABLE IF NOT EXISTS public.matrr_anc_visits (
    id TEXT PRIMARY KEY,
    pregnancy_id TEXT,
    beneficiary_id TEXT REFERENCES public.matrr_beneficiaries(id) ON DELETE CASCADE,
    visit_number INTEGER NOT NULL,
    visit_date DATE NOT NULL,
    gestational_age_weeks NUMERIC NOT NULL,
    systolic_bp INTEGER NOT NULL,
    diastolic_bp INTEGER NOT NULL,
    weight_kg NUMERIC NOT NULL,
    hemoglobin_gdl NUMERIC NOT NULL,
    blood_glucose_mgdl NUMERIC,
    edema_swelling TEXT DEFAULT 'none',
    danger_signs JSONB DEFAULT '[]'::jsonb,
    fetal_movement TEXT DEFAULT 'normal',
    ifa_tablets_given INTEGER DEFAULT 0,
    tetanus_toxoid_given BOOLEAN DEFAULT false,
    medical_advice TEXT,
    next_due_date DATE,
    notes TEXT,
    recorded_by TEXT,
    is_high_risk_flagged BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.4 Matrr Deliveries
CREATE TABLE IF NOT EXISTS public.matrr_deliveries (
    id TEXT PRIMARY KEY,
    pregnancy_id TEXT,
    beneficiary_id TEXT REFERENCES public.matrr_beneficiaries(id) ON DELETE CASCADE,
    delivery_date_time TIMESTAMPTZ NOT NULL,
    place_of_delivery TEXT,
    delivery_facility TEXT,
    delivery_type TEXT,
    birth_outcome TEXT,
    complications JSONB DEFAULT '[]'::jsonb,
    attending_provider TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.5 Matrr Newborns
CREATE TABLE IF NOT EXISTS public.matrr_newborns (
    id TEXT PRIMARY KEY,
    delivery_id TEXT REFERENCES public.matrr_deliveries(id) ON DELETE CASCADE,
    mother_beneficiary_id TEXT REFERENCES public.matrr_beneficiaries(id) ON DELETE CASCADE,
    baby_name TEXT,
    gender TEXT,
    birth_weight_kg NUMERIC NOT NULL,
    current_weight_kg NUMERIC,
    birth_time TEXT,
    feeding_status TEXT DEFAULT 'exclusive_breastfeeding',
    temperature_celsius NUMERIC,
    jaundice_observed BOOLEAN DEFAULT false,
    breathing_difficulty BOOLEAN DEFAULT false,
    cry_at_birth BOOLEAN DEFAULT true,
    danger_signs JSONB DEFAULT '[]'::jsonb,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.6 Matrr PNC Visits
CREATE TABLE IF NOT EXISTS public.matrr_pnc_visits (
    id TEXT PRIMARY KEY,
    delivery_id TEXT,
    mother_beneficiary_id TEXT REFERENCES public.matrr_beneficiaries(id) ON DELETE CASCADE,
    newborn_id TEXT,
    checkpoint TEXT NOT NULL,
    checkpoint_label TEXT,
    visit_date DATE NOT NULL,
    status TEXT DEFAULT 'completed',
    maternal_assessment JSONB DEFAULT '{}'::jsonb,
    newborn_assessment JSONB DEFAULT '{}'::jsonb,
    notes TEXT,
    recorded_by TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 1.7 Matrr Referrals
CREATE TABLE IF NOT EXISTS public.matrr_referrals (
    id TEXT PRIMARY KEY,
    beneficiary_id TEXT REFERENCES public.matrr_beneficiaries(id) ON DELETE CASCADE,
    pregnancy_id TEXT,
    referral_date DATE NOT NULL,
    referral_reason TEXT NOT NULL,
    referral_facility TEXT NOT NULL,
    referring_asha TEXT NOT NULL,
    priority TEXT DEFAULT 'URGENT',
    status TEXT DEFAULT 'Created',
    follow_up_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- SECTION 2: NCD (Non-Communicable Disease) TABLES
-- ========================================================

-- 2.1 NCD Beneficiaries
CREATE TABLE IF NOT EXISTS public.ncd_beneficiaries (
    id TEXT PRIMARY KEY,
    full_name TEXT NOT NULL,
    age INTEGER NOT NULL,
    dob DATE,
    gender TEXT NOT NULL,
    mobile_number TEXT NOT NULL,
    village TEXT NOT NULL,
    address TEXT NOT NULL,
    asha_id TEXT NOT NULL,
    asha_name TEXT NOT NULL,
    registration_date DATE NOT NULL,
    is_registered_in_maatr BOOLEAN DEFAULT false,
    is_registered_in_ncd BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.2 NCD Screenings (Vitals & CBAC)
CREATE TABLE IF NOT EXISTS public.ncd_screenings (
    id TEXT PRIMARY KEY,
    beneficiary_id TEXT REFERENCES public.ncd_beneficiaries(id) ON DELETE CASCADE,
    screening_date DATE NOT NULL,
    screened_by TEXT NOT NULL,
    systolic_bp INTEGER NOT NULL,
    diastolic_bp INTEGER NOT NULL,
    blood_glucose_mgdl NUMERIC,
    glucose_type TEXT,
    height_cm NUMERIC NOT NULL,
    weight_kg NUMERIC NOT NULL,
    bmi NUMERIC NOT NULL,
    bmi_category TEXT,
    pulse_rate INTEGER,
    cbac_history JSONB DEFAULT '{}'::jsonb,
    cbac_score INTEGER DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.3 NCD Visual Screenings (Eyes, Neck, Feet, Legs)
CREATE TABLE IF NOT EXISTS public.ncd_visual_screenings (
    id TEXT PRIMARY KEY,
    beneficiary_id TEXT REFERENCES public.ncd_beneficiaries(id) ON DELETE CASCADE,
    screening_id TEXT,
    area TEXT NOT NULL,
    possible_condition TEXT,
    status TEXT,
    images JSONB DEFAULT '[]'::jsonb,
    ai_observation TEXT,
    is_flagged_abnormal BOOLEAN DEFAULT false,
    clinical_verification_status TEXT DEFAULT 'pending',
    notes TEXT,
    assessed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.4 NCD Risk Assessments
CREATE TABLE IF NOT EXISTS public.ncd_risk_assessments (
    id TEXT PRIMARY KEY,
    beneficiary_id TEXT REFERENCES public.ncd_beneficiaries(id) ON DELETE CASCADE,
    screening_id TEXT,
    assessment_date DATE NOT NULL,
    priority TEXT NOT NULL,
    contributing_factors JSONB DEFAULT '[]'::jsonb,
    reasoning TEXT,
    recommended_action TEXT,
    rule_version TEXT,
    requires_immediate_referral BOOLEAN DEFAULT false,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.5 NCD Follow-Up Tasks
CREATE TABLE IF NOT EXISTS public.ncd_followups (
    id TEXT PRIMARY KEY,
    beneficiary_id TEXT REFERENCES public.ncd_beneficiaries(id) ON DELETE CASCADE,
    beneficiary_name TEXT,
    due_date DATE NOT NULL,
    reason TEXT NOT NULL,
    priority TEXT DEFAULT 'NORMAL',
    status TEXT DEFAULT 'Pending',
    assigned_asha TEXT,
    notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- 2.6 NCD Referrals
CREATE TABLE IF NOT EXISTS public.ncd_referrals (
    id TEXT PRIMARY KEY,
    beneficiary_id TEXT REFERENCES public.ncd_beneficiaries(id) ON DELETE CASCADE,
    referral_date DATE NOT NULL,
    reason TEXT NOT NULL,
    referred_facility TEXT NOT NULL,
    referring_asha TEXT NOT NULL,
    priority TEXT DEFAULT 'ROUTINE',
    status TEXT DEFAULT 'Created',
    completion_date DATE,
    follow_up_notes TEXT,
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- ========================================================
-- SECTION 3: ROW LEVEL SECURITY (RLS) & PUBLIC ACCESS POLICIES
-- ========================================================

ALTER TABLE public.matrr_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrr_pregnancies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrr_anc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrr_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrr_newborns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrr_pnc_visits ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.matrr_referrals ENABLE ROW LEVEL SECURITY;

ALTER TABLE public.ncd_beneficiaries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncd_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncd_visual_screenings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncd_risk_assessments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncd_followups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ncd_referrals ENABLE ROW LEVEL SECURITY;

-- Allow read & write operations for demo / ASHA client
CREATE POLICY "Allow all on matrr_beneficiaries" ON public.matrr_beneficiaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on matrr_pregnancies" ON public.matrr_pregnancies FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on matrr_anc_visits" ON public.matrr_anc_visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on matrr_deliveries" ON public.matrr_deliveries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on matrr_newborns" ON public.matrr_newborns FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on matrr_pnc_visits" ON public.matrr_pnc_visits FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on matrr_referrals" ON public.matrr_referrals FOR ALL USING (true) WITH CHECK (true);

CREATE POLICY "Allow all on ncd_beneficiaries" ON public.ncd_beneficiaries FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ncd_screenings" ON public.ncd_screenings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ncd_visual_screenings" ON public.ncd_visual_screenings FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ncd_risk_assessments" ON public.ncd_risk_assessments FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ncd_followups" ON public.ncd_followups FOR ALL USING (true) WITH CHECK (true);
CREATE POLICY "Allow all on ncd_referrals" ON public.ncd_referrals FOR ALL USING (true) WITH CHECK (true);
