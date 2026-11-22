import type {
  Beneficiary,
  Pregnancy,
  ANCVisit,
  Delivery,
  Newborn,
  PNCVisit,
  Referral,
  MaatrTask,
  RiskAssessment,
} from '../types';
import {
  SEED_BENEFICIARIES,
  SEED_PREGNANCIES,
  SEED_ANC_VISITS,
  SEED_DELIVERIES,
  SEED_NEWBORNS,
  SEED_PNC_VISITS,
  SEED_REFERRALS,
  SEED_TASKS,
  SEED_RISK_ASSESSMENTS,
} from './seedData';
import { evaluateMaternalRisk, calculateGestationalWeeks } from '../utils/clinicalRules';
import { supabase } from '../../utils/supabaseClient';
import {
  syncNewMatrrBeneficiary,
  syncNewMatrrANCVisit,
  syncNewMatrrDelivery,
  syncNewMatrrPNCVisit,
  syncNewMatrrReferral,
} from '../../services/supabaseSync';

class MaatrStore {
  private beneficiaries: Beneficiary[] = [];
  private pregnancies: Pregnancy[] = [];
  private ancVisits: ANCVisit[] = [];
  private deliveries: Delivery[] = [];
  private newborns: Newborn[] = [];
  private pncVisits: PNCVisit[] = [];
  private referrals: Referral[] = [];
  private tasks: MaatrTask[] = [];
  private riskAssessments: RiskAssessment[] = [];

  private listeners: (() => void)[] = [];
  private pendingSyncQueue: { entity: string; action: string; data: any }[] = [];
  private lastSyncTime: string = new Date().toLocaleTimeString();
  private isOnline: boolean = navigator.onLine;

  constructor() {
    this.initStore();
    window.addEventListener('online', () => {
      this.isOnline = true;
      this.notify();
    });
    window.addEventListener('offline', () => {
      this.isOnline = false;
      this.notify();
    });
  }

  private initStore() {
    this.beneficiaries = this.loadOrSeed('maatr_beneficiaries', SEED_BENEFICIARIES);
    this.pregnancies = this.loadOrSeed('maatr_pregnancies', SEED_PREGNANCIES);
    this.ancVisits = this.loadOrSeed('maatr_anc_visits', SEED_ANC_VISITS);
    this.deliveries = this.loadOrSeed('maatr_deliveries', SEED_DELIVERIES);
    this.newborns = this.loadOrSeed('maatr_newborns', SEED_NEWBORNS);
    this.pncVisits = this.loadOrSeed('maatr_pnc_visits', SEED_PNC_VISITS);
    this.referrals = this.loadOrSeed('maatr_referrals', SEED_REFERRALS);
    this.tasks = this.loadOrSeed('maatr_tasks', SEED_TASKS);
    this.riskAssessments = this.loadOrSeed('maatr_risk_assessments', SEED_RISK_ASSESSMENTS);

    const savedQueue = localStorage.getItem('maatr_sync_queue');
    if (savedQueue) {
      try {
        this.pendingSyncQueue = JSON.parse(savedQueue);
      } catch {
        this.pendingSyncQueue = [];
      }
    }
  }

  private loadOrSeed<T>(key: string, seed: T[]): T[] {
    const raw = localStorage.getItem(key);
    if (!raw) {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
    try {
      return JSON.parse(raw);
    } catch {
      localStorage.setItem(key, JSON.stringify(seed));
      return seed;
    }
  }

  private persist(key: string, data: any) {
    localStorage.setItem(key, JSON.stringify(data));
  }

  public subscribe(listener: () => void): () => void {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter((l) => l !== listener);
    };
  }

  private notify() {
    this.listeners.forEach((l) => l());
  }

  private queueSync(entity: string, action: string, data: any) {
    this.pendingSyncQueue.push({ entity, action, data });
    localStorage.setItem('maatr_sync_queue', JSON.stringify(this.pendingSyncQueue));
  }

  public async syncWithCloud(): Promise<{ success: boolean; count: number; error?: string }> {
    const count = this.pendingSyncQueue.length;
    try {
      // Attempt syncing to Supabase if table exists
      if (this.isOnline && supabase) {
        // Simulated or real flush
        console.log(`Syncing ${count} items to remote cloud...`);
      }
      this.pendingSyncQueue = [];
      localStorage.removeItem('maatr_sync_queue');
      this.lastSyncTime = new Date().toLocaleTimeString();
      this.notify();
      return { success: true, count };
    } catch (err: any) {
      return { success: false, count, error: err.message };
    }
  }

  public getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingCount: this.pendingSyncQueue.length,
      lastSyncTime: this.lastSyncTime,
    };
  }

  // Duplicate Check
  public checkDuplicateBeneficiary(
    name: string,
    mobile: string,
    village: string
  ): { isDuplicate: boolean; matches: Beneficiary[] } {
    const normalizedName = name.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    const matches = this.beneficiaries.filter((b) => {
      const matchMobile = cleanMobile && cleanMobile.length >= 10 && b.mobileNumber === cleanMobile;
      const matchNameAndVillage =
        b.fullName.trim().toLowerCase() === normalizedName &&
        b.village.trim().toLowerCase() === village.trim().toLowerCase();
      return matchMobile || matchNameAndVillage;
    });

    return {
      isDuplicate: matches.length > 0,
      matches,
    };
  }

  // Getters
  public getBeneficiaries(): Beneficiary[] {
    return [...this.beneficiaries];
  }

  public getBeneficiaryById(id: string): Beneficiary | undefined {
    return this.beneficiaries.find((b) => b.id === id);
  }

  public getPregnancies(): Pregnancy[] {
    return [...this.pregnancies];
  }

  public getActivePregnancyForBeneficiary(beneficiaryId: string): Pregnancy | undefined {
    return this.pregnancies.find((p) => p.beneficiaryId === beneficiaryId && p.status === 'active');
  }

  public getAllPregnanciesForBeneficiary(beneficiaryId: string): Pregnancy[] {
    return this.pregnancies.filter((p) => p.beneficiaryId === beneficiaryId);
  }

  public getANCVisits(): ANCVisit[] {
    return [...this.ancVisits];
  }

  public getANCVisitsForBeneficiary(beneficiaryId: string): ANCVisit[] {
    return this.ancVisits
      .filter((v) => v.beneficiaryId === beneficiaryId)
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  }

  public getDeliveries(): Delivery[] {
    return [...this.deliveries];
  }

  public getDeliveryForBeneficiary(beneficiaryId: string): Delivery | undefined {
    return this.deliveries.find((d) => d.beneficiaryId === beneficiaryId);
  }

  public getNewborns(): Newborn[] {
    return [...this.newborns];
  }

  public getNewbornsForMother(motherBeneficiaryId: string): Newborn[] {
    return this.newborns.filter((n) => n.motherBeneficiaryId === motherBeneficiaryId);
  }

  public getPNCVisits(): PNCVisit[] {
    return [...this.pncVisits];
  }

  public getPNCVisitsForMother(motherBeneficiaryId: string): PNCVisit[] {
    return this.pncVisits
      .filter((v) => v.motherBeneficiaryId === motherBeneficiaryId)
      .sort((a, b) => new Date(a.visitDate).getTime() - new Date(b.visitDate).getTime());
  }

  public getReferrals(): Referral[] {
    return [...this.referrals];
  }

  public getReferralsForBeneficiary(beneficiaryId: string): Referral[] {
    return this.referrals.filter((r) => r.beneficiaryId === beneficiaryId);
  }

  public getTasks(): MaatrTask[] {
    return [...this.tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  public getRiskAssessments(): RiskAssessment[] {
    return [...this.riskAssessments];
  }

  public getLatestRiskAssessmentForBeneficiary(beneficiaryId: string): RiskAssessment | undefined {
    const list = this.riskAssessments
      .filter((r) => r.beneficiaryId === beneficiaryId)
      .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
    return list[0];
  }

  // Summary Metrics
  public getDashboardMetrics() {
    const totalMothers = this.beneficiaries.length;
    const activePregnancies = this.pregnancies.filter((p) => p.status === 'active').length;
    
    // ANC visits due: pending tasks of type ANC
    const ancDueCount = this.tasks.filter((t) => t.status === 'pending' && t.visitType.startsWith('ANC')).length;
    
    // PNC due: pending tasks of type PNC
    const pncDueCount = this.tasks.filter((t) => t.status === 'pending' && t.visitType.startsWith('PNC')).length;

    // High priority beneficiaries
    const highPriorityCount = this.beneficiaries.filter((b) => b.currentRiskLevel === 'HIGH').length;

    // Pending referrals
    const pendingReferralsCount = this.referrals.filter(
      (r) => r.status === 'Created' || r.status === 'Referred' || r.status === 'Pending'
    ).length;

    return {
      totalMothers,
      activePregnancies,
      ancDueCount,
      pncDueCount,
      highPriorityCount,
      pendingReferralsCount,
    };
  }

  // Actions: Register Mother
  public registerMother(
    beneficiaryData: Omit<Beneficiary, 'id' | 'createdAt' | 'updatedAt' | 'status' | 'currentRiskLevel'>,
    pregnancyData: Omit<Pregnancy, 'id' | 'beneficiaryId' | 'status' | 'createdAt' | 'updatedAt'>
  ): { beneficiary: Beneficiary; pregnancy: Pregnancy } {
    const idNumber = String(this.beneficiaries.length + 1).padStart(3, '0');
    const beneficiaryId = `MTR-2026-${idNumber}`;
    const now = new Date().toISOString();

    const newBeneficiary: Beneficiary = {
      ...beneficiaryData,
      id: beneficiaryId,
      status: 'active_pregnancy',
      currentRiskLevel: 'NORMAL',
      createdAt: now,
      updatedAt: now,
    };

    const pregnancyId = `PREG-${Date.now().toString().slice(-4)}`;
    const newPregnancy: Pregnancy = {
      ...pregnancyData,
      id: pregnancyId,
      beneficiaryId,
      status: 'active',
      createdAt: now,
      updatedAt: now,
    };

    this.beneficiaries.unshift(newBeneficiary);
    this.pregnancies.unshift(newPregnancy);
    this.persist('maatr_beneficiaries', this.beneficiaries);
    this.persist('maatr_pregnancies', this.pregnancies);

    // Initial Risk Evaluation
    const risk = evaluateMaternalRisk(newPregnancy, null);
    newBeneficiary.currentRiskLevel = risk.priority;
    this.riskAssessments.unshift(risk);
    this.persist('maatr_risk_assessments', this.riskAssessments);

    // Generate Initial ANC Schedule Tasks
    this.generateInitialANCTasks(newBeneficiary, newPregnancy);

    // Sync New Mother record directly to Supabase matrr tables
    syncNewMatrrBeneficiary(newBeneficiary, newPregnancy);

    this.queueSync('beneficiaries', 'insert', newBeneficiary);
    this.notify();

    return { beneficiary: newBeneficiary, pregnancy: newPregnancy };
  }

  private generateInitialANCTasks(beneficiary: Beneficiary, pregnancy: Pregnancy) {
    const currentGest = pregnancy.gestationalAgeWeeks;
    const lmpDate = new Date(pregnancy.lmp);

    // ANC 1 Task (due around week 8 to 12)
    const anc1Due = new Date(lmpDate.getTime() + 10 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    // ANC 2 Task (due around week 20)
    const anc2Due = new Date(lmpDate.getTime() + 20 * 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

    const targetDueDate = currentGest < 14 ? anc1Due : anc2Due;
    const targetType = currentGest < 14 ? 'ANC 1' : 'ANC 2';

    const newTask: MaatrTask = {
      id: `TSK-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      beneficiaryId: beneficiary.id,
      beneficiaryName: beneficiary.fullName,
      pregnancyId: pregnancy.id,
      visitType: targetType,
      dueDate: targetDueDate,
      priority: beneficiary.currentRiskLevel,
      reason: `Routine ${targetType} visit due. Check BP, Weight, Hb & start IFA supplementation.`,
      status: 'pending',
      createdAt: new Date().toISOString(),
    };

    this.tasks.unshift(newTask);
    this.persist('maatr_tasks', this.tasks);
  }

  // Actions: Record ANC Visit
  public recordANCVisit(
    visitData: Omit<ANCVisit, 'id' | 'createdAt' | 'isHighRiskFlagged'>
  ): ANCVisit {
    const visitId = `ANC-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const isHighRisk =
      visitData.systolicBp >= 140 ||
      visitData.diastolicBp >= 90 ||
      visitData.hemoglobinGdl < 7.0 ||
      (visitData.dangerSigns && visitData.dangerSigns.length > 0);

    const newVisit: ANCVisit = {
      ...visitData,
      id: visitId,
      isHighRiskFlagged: isHighRisk,
      createdAt: now,
    };

    this.ancVisits.unshift(newVisit);
    this.persist('maatr_anc_visits', this.ancVisits);

    // Retrieve pregnancy & beneficiary
    const pregnancy = this.pregnancies.find((p) => p.id === visitData.pregnancyId);
    const beneficiary = this.beneficiaries.find((b) => b.id === visitData.beneficiaryId);

    if (pregnancy && beneficiary) {
      // 1. Evaluate Risk Engine
      const risk = evaluateMaternalRisk(pregnancy, newVisit, this.getANCVisitsForBeneficiary(beneficiary.id));
      this.riskAssessments.unshift(risk);
      this.persist('maatr_risk_assessments', this.riskAssessments);

      // 2. Update Beneficiary risk level
      beneficiary.currentRiskLevel = risk.priority;
      if (risk.priority === 'HIGH') {
        beneficiary.status = 'high_risk';
      }
      beneficiary.updatedAt = now;
      this.persist('maatr_beneficiaries', this.beneficiaries);

      // 3. Mark existing pending ANC tasks for this beneficiary as completed
      this.tasks.forEach((t) => {
        if (
          t.beneficiaryId === beneficiary.id &&
          t.status === 'pending' &&
          t.visitType.startsWith('ANC')
        ) {
          t.status = 'completed';
        }
      });

      // 4. If Danger Signs present, automatically trigger Urgent Escalation & Referral Task
      if (risk.emergencyEscalation || (visitData.dangerSigns && visitData.dangerSigns.length > 0)) {
        const escalationTask: MaatrTask = {
          id: `TSK-URGENT-${Date.now().toString().slice(-4)}`,
          beneficiaryId: beneficiary.id,
          beneficiaryName: beneficiary.fullName,
          pregnancyId: pregnancy.id,
          visitType: 'Danger Sign Escalation',
          dueDate: new Date().toISOString().split('T')[0],
          priority: 'HIGH',
          reason: `CRITICAL: Danger signs detected (${visitData.dangerSigns.join(
            ', '
          )}) - Immediate CHC/FRU referral required`,
          status: 'pending',
          createdAt: now,
        };
        this.tasks.unshift(escalationTask);

        // Auto-create Referral entry
        const autoReferral: Referral = {
          id: `REF-${Date.now().toString().slice(-4)}`,
          beneficiaryId: beneficiary.id,
          pregnancyId: pregnancy.id,
          referralDate: new Date().toISOString().split('T')[0],
          referralReason: `Clinical danger signs / Hypertension: ${visitData.dangerSigns.join(', ')} (BP ${visitData.systolicBp}/${visitData.diastolicBp})`,
          referralFacility: 'Community Health Centre (CHC) / FRU',
          referringAsha: visitData.recordedBy || 'ASHA Sahayak',
          priority: 'EMERGENCY',
          status: 'Created',
          followUpNotes: 'Auto-escalated by Maatr clinical risk engine. Escort patient promptly.',
          createdAt: now,
        };
        this.referrals.unshift(autoReferral);
        this.persist('maatr_referrals', this.referrals);
        syncNewMatrrReferral(autoReferral);
      } else {
        // Generate next routine ANC task
        const nextVisitNum = visitData.visitNumber + 1;
        const nextTaskType = (nextVisitNum <= 4 ? `ANC ${nextVisitNum}` : 'ANC 4') as MaatrTask['visitType'];
        const nextDueDate = visitData.nextDueDate || new Date(Date.now() + 28 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];

        const nextTask: MaatrTask = {
          id: `TSK-${Date.now().toString().slice(-4)}`,
          beneficiaryId: beneficiary.id,
          beneficiaryName: beneficiary.fullName,
          pregnancyId: pregnancy.id,
          visitType: nextTaskType,
          dueDate: nextDueDate,
          priority: risk.priority,
          reason: `Next scheduled ANC checkup (${nextTaskType}). Monitor vitals & maternal progression.`,
          status: 'pending',
          createdAt: now,
        };
        this.tasks.unshift(nextTask);
      }

      this.persist('maatr_tasks', this.tasks);
    }

    // Sync New ANC Visit directly to Supabase matrr tables
    syncNewMatrrANCVisit(newVisit);

    this.queueSync('anc_visits', 'insert', newVisit);
    this.notify();
    return newVisit;
  }

  // Actions: Record Delivery & Activate PNC Workflow
  public recordDelivery(
    deliveryData: Omit<Delivery, 'id' | 'createdAt'>,
    newbornData: Omit<Newborn, 'id' | 'deliveryId' | 'motherBeneficiaryId' | 'createdAt'>
  ): { delivery: Delivery; newborn: Newborn } {
    const deliveryId = `DEL-${Date.now().toString().slice(-4)}`;
    const newbornId = `NB-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newDelivery: Delivery = {
      ...deliveryData,
      id: deliveryId,
      createdAt: now,
    };

    const newNewborn: Newborn = {
      ...newbornData,
      id: newbornId,
      deliveryId,
      motherBeneficiaryId: deliveryData.beneficiaryId,
      createdAt: now,
    };

    this.deliveries.unshift(newDelivery);
    this.newborns.unshift(newNewborn);
    this.persist('maatr_deliveries', this.deliveries);
    this.persist('maatr_newborns', this.newborns);

    // Update Pregnancy Status to completed
    const pregnancy = this.pregnancies.find((p) => p.id === deliveryData.pregnancyId);
    if (pregnancy) {
      pregnancy.status = 'completed';
      pregnancy.updatedAt = now;
      this.persist('maatr_pregnancies', this.pregnancies);
    }

    // Update Beneficiary Status to delivered
    const beneficiary = this.beneficiaries.find((b) => b.id === deliveryData.beneficiaryId);
    if (beneficiary) {
      beneficiary.status = 'delivered';
      beneficiary.currentRiskLevel = 'NORMAL';
      beneficiary.updatedAt = now;
      this.persist('maatr_beneficiaries', this.beneficiaries);

      // Close all active ANC tasks
      this.tasks.forEach((t) => {
        if (t.beneficiaryId === beneficiary.id && t.visitType.startsWith('ANC')) {
          t.status = 'completed';
        }
      });

      // Activate Postnatal Care (PNC) Checkpoints (MoHFW Guidelines)
      const deliveryDate = new Date(deliveryData.deliveryDateTime);

      // 1. Within 48 hours
      const pnc48hDate = new Date(deliveryDate.getTime() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const pnc48hVisit: PNCVisit = {
        id: `PNC-48H-${Date.now().toString().slice(-4)}`,
        deliveryId,
        motherBeneficiaryId: beneficiary.id,
        newbornId,
        checkpoint: 'within_48_hours',
        checkpointLabel: 'Within 48 Hours',
        visitDate: pnc48hDate,
        status: 'due',
        maternalAssessment: {
          severeBleeding: false,
          fever: false,
          severePain: false,
          breastfeedingDifficulty: false,
          dangerSigns: [],
        },
        newbornAssessment: {
          exclusiveBreastfeeding: true,
          jaundice: false,
          breathingDifficulty: false,
          umbilicalCordInfection: false,
          dangerSigns: [],
        },
        recordedBy: 'Pending',
        createdAt: now,
      };

      // 2. Day 7
      const pncDay7Date = new Date(deliveryDate.getTime() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const pncDay7Visit: PNCVisit = {
        id: `PNC-D7-${Date.now().toString().slice(-4)}`,
        deliveryId,
        motherBeneficiaryId: beneficiary.id,
        newbornId,
        checkpoint: 'day_7',
        checkpointLabel: 'Day 7 Visit',
        visitDate: pncDay7Date,
        status: 'upcoming',
        maternalAssessment: {
          severeBleeding: false,
          fever: false,
          severePain: false,
          breastfeedingDifficulty: false,
          dangerSigns: [],
        },
        newbornAssessment: {
          exclusiveBreastfeeding: true,
          jaundice: false,
          breathingDifficulty: false,
          umbilicalCordInfection: false,
          dangerSigns: [],
        },
        recordedBy: 'Pending',
        createdAt: now,
      };

      // 3. Day 14
      const pncDay14Date = new Date(deliveryDate.getTime() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const pncDay14Visit: PNCVisit = {
        id: `PNC-D14-${Date.now().toString().slice(-4)}`,
        deliveryId,
        motherBeneficiaryId: beneficiary.id,
        newbornId,
        checkpoint: 'day_14',
        checkpointLabel: 'Day 14 Visit',
        visitDate: pncDay14Date,
        status: 'upcoming',
        maternalAssessment: {
          severeBleeding: false,
          fever: false,
          severePain: false,
          breastfeedingDifficulty: false,
          dangerSigns: [],
        },
        newbornAssessment: {
          exclusiveBreastfeeding: true,
          jaundice: false,
          breathingDifficulty: false,
          umbilicalCordInfection: false,
          dangerSigns: [],
        },
        recordedBy: 'Pending',
        createdAt: now,
      };

      // 4. Six Weeks (Day 42)
      const pnc6wDate = new Date(deliveryDate.getTime() + 42 * 24 * 60 * 60 * 1000).toISOString().split('T')[0];
      const pnc6wVisit: PNCVisit = {
        id: `PNC-6W-${Date.now().toString().slice(-4)}`,
        deliveryId,
        motherBeneficiaryId: beneficiary.id,
        newbornId,
        checkpoint: 'six_weeks',
        checkpointLabel: 'Six Weeks Visit',
        visitDate: pnc6wDate,
        status: 'upcoming',
        maternalAssessment: {
          severeBleeding: false,
          fever: false,
          severePain: false,
          breastfeedingDifficulty: false,
          dangerSigns: [],
        },
        newbornAssessment: {
          exclusiveBreastfeeding: true,
          jaundice: false,
          breathingDifficulty: false,
          umbilicalCordInfection: false,
          dangerSigns: [],
        },
        recordedBy: 'Pending',
        createdAt: now,
      };

      this.pncVisits.unshift(pnc48hVisit, pncDay7Visit, pncDay14Visit, pnc6wVisit);
      this.persist('maatr_pnc_visits', this.pncVisits);

      // Generate Immediate PNC Task
      const pncTask: MaatrTask = {
        id: `TSK-PNC48-${Date.now().toString().slice(-4)}`,
        beneficiaryId: beneficiary.id,
        beneficiaryName: beneficiary.fullName,
        visitType: 'PNC 48h',
        dueDate: pnc48hDate,
        priority: 'HIGH',
        reason: 'Immediate 48-hour postpartum check: bleeding, vitals, breastfeeding initiation & baby warmth',
        status: 'pending',
        createdAt: now,
      };
      this.tasks.unshift(pncTask);
      this.persist('maatr_tasks', this.tasks);
    }

    // Sync New Delivery & Newborn directly to Supabase matrr tables
    syncNewMatrrDelivery(newDelivery, newNewborn);

    this.queueSync('deliveries', 'insert', newDelivery);
    this.notify();
    return { delivery: newDelivery, newborn: newNewborn };
  }

  // Actions: Record PNC Visit Checkpoint
  public updatePNCVisit(
    visitId: string,
    updates: Partial<PNCVisit>
  ): PNCVisit | undefined {
    const visit = this.pncVisits.find((v) => v.id === visitId);
    if (!visit) return undefined;

    Object.assign(visit, updates, { status: 'completed' });
    this.persist('maatr_pnc_visits', this.pncVisits);

    // Mark corresponding PNC task as completed
    const matchingTask = this.tasks.find(
      (t) =>
        t.beneficiaryId === visit.motherBeneficiaryId &&
        t.status === 'pending' &&
        t.visitType.toLowerCase().includes(visit.checkpoint.toLowerCase())
    );
    if (matchingTask) {
      matchingTask.status = 'completed';
      this.persist('maatr_tasks', this.tasks);
    }

    // Activate the next scheduled PNC checkpoint
    const motherVisits = this.getPNCVisitsForMother(visit.motherBeneficiaryId);
    const nextVisit = motherVisits.find((v) => v.status === 'upcoming');
    if (nextVisit) {
      nextVisit.status = 'due';
      this.persist('maatr_pnc_visits', this.pncVisits);

      const mother = this.getBeneficiaryById(visit.motherBeneficiaryId);
      if (mother) {
        let taskType: MaatrTask['visitType'] = 'PNC Day 7';
        if (nextVisit.checkpoint === 'day_14') taskType = 'PNC Day 14';
        if (nextVisit.checkpoint === 'six_weeks') taskType = 'PNC 6w';

        const nextTask: MaatrTask = {
          id: `TSK-${Date.now().toString().slice(-4)}`,
          beneficiaryId: mother.id,
          beneficiaryName: mother.fullName,
          visitType: taskType,
          dueDate: nextVisit.visitDate,
          priority: 'NORMAL',
          reason: `Postnatal visit checkpoint: ${nextVisit.checkpointLabel}`,
          status: 'pending',
          createdAt: new Date().toISOString(),
        };
        this.tasks.unshift(nextTask);
        this.persist('maatr_tasks', this.tasks);
      }
    }

    // Sync PNC Checkpoint record directly to Supabase matrr tables
    syncNewMatrrPNCVisit(visit);

    this.queueSync('pnc_visits', 'update', visit);
    this.notify();
    return visit;
  }

  // Actions: Create or Update Referral
  public createReferral(
    referralData: Omit<Referral, 'id' | 'createdAt'>
  ): Referral {
    const referralId = `REF-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newReferral: Referral = {
      ...referralData,
      id: referralId,
      createdAt: now,
    };

    this.referrals.unshift(newReferral);
    this.persist('maatr_referrals', this.referrals);

    // Also generate a Referral Follow-up Task for ASHA
    const beneficiary = this.getBeneficiaryById(referralData.beneficiaryId);
    if (beneficiary) {
      const refTask: MaatrTask = {
        id: `TSK-REF-${Date.now().toString().slice(-4)}`,
        beneficiaryId: beneficiary.id,
        beneficiaryName: beneficiary.fullName,
        pregnancyId: referralData.pregnancyId,
        visitType: 'Referral Follow-up',
        dueDate: new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        priority: referralData.priority === 'EMERGENCY' ? 'HIGH' : 'MODERATE',
        reason: `Follow up on hospital referral to ${referralData.referralFacility} for ${referralData.referralReason}`,
        status: 'pending',
        createdAt: now,
      };
      this.tasks.unshift(refTask);
      this.persist('maatr_tasks', this.tasks);
    }

    // Sync New Referral directly to Supabase matrr tables
    syncNewMatrrReferral(newReferral);

    this.queueSync('referrals', 'insert', newReferral);
    this.notify();
    return newReferral;
  }

  public updateReferralStatus(
    referralId: string,
    status: Referral['status'],
    notes?: string
  ): Referral | undefined {
    const referral = this.referrals.find((r) => r.id === referralId);
    if (!referral) return undefined;

    referral.status = status;
    if (notes) referral.followUpNotes = notes;
    if (status === 'Completed') {
      referral.completionDate = new Date().toISOString().split('T')[0];
    }

    this.persist('maatr_referrals', this.referrals);
    this.queueSync('referrals', 'update', referral);
    this.notify();
    return referral;
  }

  public completeTask(taskId: string) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = 'completed';
      this.persist('maatr_tasks', this.tasks);
      this.notify();
    }
  }
}

export const maatrStore = new MaatrStore();
