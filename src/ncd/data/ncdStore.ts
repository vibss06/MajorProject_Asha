import type {
  SharedBeneficiary,
  NCDScreening,
  VisualScreeningRecord,
  NCDRiskAssessment,
  NCDFollowupTask,
  NCDReferral,
  VisualArea,
} from '../types';
import {
  SEED_NCD_BENEFICIARIES,
  SEED_NCD_SCREENINGS,
  SEED_VISUAL_RECORDS,
  SEED_NCD_RISK_ASSESSMENTS,
  SEED_NCD_TASKS,
  SEED_NCD_REFERRALS,
} from './seedData';
import { evaluateNCDRisk, calculateBMI } from '../utils/ncdRules';
import { maatrStore } from '../../maatr/data/maatrStore';
import {
  syncNewNCDBeneficiary,
  syncNewNCDScreening,
  syncNewNCDVisualRecord,
  syncNewNCDRiskAssessment,
  syncNewNCDFollowup,
  syncNewNCDReferral,
} from '../../services/supabaseSync';

class NCDStore {
  private beneficiaries: SharedBeneficiary[] = [];
  private screenings: NCDScreening[] = [];
  private visualRecords: VisualScreeningRecord[] = [];
  private riskAssessments: NCDRiskAssessment[] = [];
  private tasks: NCDFollowupTask[] = [];
  private referrals: NCDReferral[] = [];

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
    this.beneficiaries = this.loadOrSeed('ncd_beneficiaries', SEED_NCD_BENEFICIARIES);
    this.syncWithMaatrBeneficiaries();

    this.screenings = this.loadOrSeed('ncd_screenings', SEED_NCD_SCREENINGS);
    this.visualRecords = this.loadOrSeed('ncd_visual_screenings', SEED_VISUAL_RECORDS);
    this.riskAssessments = this.loadOrSeed('ncd_risk_assessments', SEED_NCD_RISK_ASSESSMENTS);
    this.tasks = this.loadOrSeed('ncd_tasks', SEED_NCD_TASKS);
    this.referrals = this.loadOrSeed('ncd_referrals', SEED_NCD_REFERRALS);
  }

  // Synchronize beneficiaries between Maatr and NCD
  private syncWithMaatrBeneficiaries() {
    try {
      const maatrList = maatrStore.getBeneficiaries();
      maatrList.forEach((m) => {
        const existing = this.beneficiaries.find((b) => b.id === m.id || b.mobileNumber === m.mobileNumber);
        if (existing) {
          existing.isRegisteredInMaatr = true;
        } else {
          // Add Maatr beneficiary into shared directory
          this.beneficiaries.push({
            id: m.id,
            fullName: m.fullName,
            age: m.age,
            dob: m.dob,
            gender: 'female',
            mobileNumber: m.mobileNumber,
            village: m.village,
            address: m.address,
            ashaId: m.ashaId,
            ashaName: m.ashaName,
            registrationDate: m.registrationDate,
            isRegisteredInMaatr: true,
            isRegisteredInNCD: false,
            createdAt: m.createdAt,
            updatedAt: m.updatedAt,
          });
        }
      });
      this.persist('ncd_beneficiaries', this.beneficiaries);
    } catch (e) {
      console.log('Maatr cross-sync note:', e);
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

  public async syncWithCloud(): Promise<{ success: boolean; count: number }> {
    const count = this.pendingSyncQueue.length;
    this.pendingSyncQueue = [];
    localStorage.removeItem('ncd_sync_queue');
    this.lastSyncTime = new Date().toLocaleTimeString();
    this.notify();
    return { success: true, count };
  }

  public getSyncStatus() {
    return {
      isOnline: this.isOnline,
      pendingCount: this.pendingSyncQueue.length,
      lastSyncTime: this.lastSyncTime,
    };
  }

  // Cross-Module Duplicate Check
  public checkDuplicate(name: string, mobile: string, village: string): {
    isDuplicate: boolean;
    existingBeneficiary?: SharedBeneficiary;
    sourceModule?: 'NCD' | 'Maatr';
  } {
    const normName = name.trim().toLowerCase();
    const cleanMobile = mobile.trim();

    // Check shared local list
    const found = this.beneficiaries.find((b) => {
      const matchMobile = cleanMobile && cleanMobile.length >= 10 && b.mobileNumber === cleanMobile;
      const matchNameAndVillage =
        b.fullName.trim().toLowerCase() === normName &&
        b.village.trim().toLowerCase() === village.trim().toLowerCase();
      return matchMobile || matchNameAndVillage;
    });

    if (found) {
      return {
        isDuplicate: true,
        existingBeneficiary: found,
        sourceModule: found.isRegisteredInMaatr ? 'Maatr' : 'NCD',
      };
    }

    return { isDuplicate: false };
  }

  // Getters
  public getBeneficiaries(): SharedBeneficiary[] {
    return [...this.beneficiaries];
  }

  public getBeneficiaryById(id: string): SharedBeneficiary | undefined {
    return this.beneficiaries.find((b) => b.id === id);
  }

  public getScreenings(): NCDScreening[] {
    return [...this.screenings].sort(
      (a, b) => new Date(b.screeningDate).getTime() - new Date(a.screeningDate).getTime()
    );
  }

  public getScreeningsForBeneficiary(beneficiaryId: string): NCDScreening[] {
    return this.screenings
      .filter((s) => s.beneficiaryId === beneficiaryId)
      .sort((a, b) => new Date(b.screeningDate).getTime() - new Date(a.screeningDate).getTime());
  }

  public getVisualRecordsForBeneficiary(beneficiaryId: string): VisualScreeningRecord[] {
    return this.visualRecords.filter((v) => v.beneficiaryId === beneficiaryId);
  }

  public getRiskAssessments(): NCDRiskAssessment[] {
    return [...this.riskAssessments];
  }

  public getLatestRiskAssessmentForBeneficiary(beneficiaryId: string): NCDRiskAssessment | undefined {
    const list = this.riskAssessments
      .filter((r) => r.beneficiaryId === beneficiaryId)
      .sort((a, b) => new Date(b.assessmentDate).getTime() - new Date(a.assessmentDate).getTime());
    return list[0];
  }

  public getTasks(): NCDFollowupTask[] {
    return [...this.tasks].sort((a, b) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime());
  }

  public getReferrals(): NCDReferral[] {
    return [...this.referrals];
  }

  // Summary KPIs
  public getDashboardMetrics() {
    const totalBeneficiaries = this.beneficiaries.length;
    const screenedBeneficiaryIds = new Set(this.screenings.map((s) => s.beneficiaryId));
    const totalScreened = screenedBeneficiaryIds.size;
    const screeningsPending = Math.max(0, totalBeneficiaries - totalScreened);

    const followupsDue = this.tasks.filter((t) => t.status === 'Pending').length;

    // High priority / requiring clinical assessment
    const highRiskCount = this.riskAssessments.filter((r) => r.priority === 'HIGH').length;

    const pendingReferrals = this.referrals.filter(
      (r) => r.status === 'Created' || r.status === 'Referred' || r.status === 'Pending'
    ).length;

    return {
      totalBeneficiaries,
      totalScreened,
      screeningsPending,
      followupsDue,
      highRiskCount,
      pendingReferrals,
    };
  }

  // Action: Register Beneficiary (Reuses existing if in Maatr!)
  public registerBeneficiary(
    data: Omit<SharedBeneficiary, 'id' | 'createdAt' | 'updatedAt' | 'isRegisteredInNCD'>
  ): SharedBeneficiary {
    const dupCheck = this.checkDuplicate(data.fullName, data.mobileNumber, data.village);
    if (dupCheck.isDuplicate && dupCheck.existingBeneficiary) {
      const existing = dupCheck.existingBeneficiary;
      existing.isRegisteredInNCD = true;
      existing.updatedAt = new Date().toISOString();
      this.persist('ncd_beneficiaries', this.beneficiaries);
      this.notify();
      return existing;
    }

    const idNumber = String(this.beneficiaries.length + 1).padStart(3, '0');
    const newId = `BEN-2026-${idNumber}`;
    const now = new Date().toISOString();

    const newBen: SharedBeneficiary = {
      ...data,
      id: newId,
      isRegisteredInNCD: true,
      isRegisteredInMaatr: false,
      createdAt: now,
      updatedAt: now,
    };

    this.beneficiaries.unshift(newBen);
    this.persist('ncd_beneficiaries', this.beneficiaries);
    
    // Sync New NCD Beneficiary directly to Supabase ncd tables
    syncNewNCDBeneficiary(newBen);

    this.notify();
    return newBen;
  }

  // Action: Record Basic NCD Screening
  public recordScreening(
    screeningData: Omit<NCDScreening, 'id' | 'createdAt'>
  ): NCDScreening {
    const newId = `SCR-${Date.now().toString().slice(-4)}`;
    const now = new Date().toISOString();

    const newScreening: NCDScreening = {
      ...screeningData,
      id: newId,
      createdAt: now,
    };

    this.screenings.unshift(newScreening);
    this.persist('ncd_screenings', this.screenings);

    // Retrieve visual records for risk assessment
    const visuals = this.getVisualRecordsForBeneficiary(screeningData.beneficiaryId);
    const risk = evaluateNCDRisk(
      screeningData.beneficiaryId,
      screeningData.measurements,
      screeningData.history,
      visuals
    );

    this.riskAssessments.unshift(risk);
    this.persist('ncd_risk_assessments', this.riskAssessments);

    const beneficiary = this.getBeneficiaryById(screeningData.beneficiaryId);
    const benName = beneficiary?.fullName || 'Beneficiary';

    // Auto Follow-up Task Generation
    if (risk.priority === 'HIGH' || risk.priority === 'MODERATE') {
      const taskReason =
        risk.priority === 'HIGH'
          ? `High clinical indicators (BP ${screeningData.measurements.systolicBp}/${screeningData.measurements.diastolicBp}, Sugar ${screeningData.measurements.bloodGlucoseMgdl || '-'}) — Schedule PHC Saoner medical checkup`
          : `Borderline risk parameters (BMI ${screeningData.measurements.bmi}) — Diet & lifestyle counseling follow-up`;

      const newTask: NCDFollowupTask = {
        id: `NCD-TSK-${Date.now().toString().slice(-4)}`,
        beneficiaryId: screeningData.beneficiaryId,
        beneficiaryName: benName,
        dueDate: new Date(Date.now() + (risk.priority === 'HIGH' ? 7 : 30) * 24 * 60 * 60 * 1000)
          .toISOString()
          .split('T')[0],
        reason: taskReason,
        priority: risk.priority,
        status: 'Pending',
        assignedAsha: screeningData.screenedBy,
        createdAt: now,
      };

      this.tasks.unshift(newTask);
      this.persist('ncd_tasks', this.tasks);

      // If urgent referral required, auto-draft referral
      if (risk.requiresImmediateReferral) {
        const autoReferral: NCDReferral = {
          id: `NCD-REF-${Date.now().toString().slice(-4)}`,
          beneficiaryId: screeningData.beneficiaryId,
          referralDate: new Date().toISOString().split('T')[0],
          reason: `Urgent clinical referral: Uncontrolled Hypertension (BP ${screeningData.measurements.systolicBp}/${screeningData.measurements.diastolicBp}) / Hyperglycemia`,
          referredFacility: 'Primary Health Centre (PHC) Saoner',
          referringAsha: screeningData.screenedBy,
          priority: 'HIGH',
          status: 'Created',
          followUpNotes: 'Auto-flagged by NCD clinical risk engine. Escort patient for physician evaluation.',
          createdAt: now,
        };
        this.referrals.unshift(autoReferral);
        this.persist('ncd_referrals', this.referrals);
        syncNewNCDReferral(autoReferral);
      }

      syncNewNCDFollowup(newTask);
    }

    // Sync New Screening and Risk Assessment directly to Supabase ncd tables
    syncNewNCDScreening(newScreening);
    syncNewNCDRiskAssessment(risk);

    this.notify();
    return newScreening;
  }

  // Action: Save or Update Visual Screening Record
  public saveVisualScreening(record: Omit<VisualScreeningRecord, 'id' | 'assessedAt'>): VisualScreeningRecord {
    const existingIndex = this.visualRecords.findIndex(
      (v) => v.beneficiaryId === record.beneficiaryId && v.area === record.area
    );

    const now = new Date().toISOString();
    let updatedRecord: VisualScreeningRecord;

    if (existingIndex >= 0) {
      updatedRecord = {
        ...this.visualRecords[existingIndex],
        ...record,
        assessedAt: now,
      };
      this.visualRecords[existingIndex] = updatedRecord;
    } else {
      updatedRecord = {
        ...record,
        id: `VIS-${Date.now().toString().slice(-4)}`,
        assessedAt: now,
      };
      this.visualRecords.unshift(updatedRecord);
    }

    this.persist('ncd_visual_screenings', this.visualRecords);

    // If flagged abnormal (e.g. diabetic foot ulcer or edema), create follow-up task
    if (record.isFlaggedAbnormal) {
      const ben = this.getBeneficiaryById(record.beneficiaryId);
      const visualTask: NCDFollowupTask = {
        id: `NCD-TSK-VIS-${Date.now().toString().slice(-4)}`,
        beneficiaryId: record.beneficiaryId,
        beneficiaryName: ben?.fullName || 'Beneficiary',
        dueDate: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
        reason: `Visual screening alert on ${record.area} (${record.possibleCondition}) — Clinical examination required at PHC`,
        priority: record.area === 'feet' ? 'HIGH' : 'MODERATE',
        status: 'Pending',
        assignedAsha: ben?.ashaName || 'ASHA Worker',
        createdAt: now,
      };
      this.tasks.unshift(visualTask);
      this.persist('ncd_tasks', this.tasks);
      syncNewNCDFollowup(visualTask);
    }

    // Sync Visual Screening Record directly to Supabase ncd tables
    syncNewNCDVisualRecord(updatedRecord);

    this.notify();
    return updatedRecord;
  }

  // Action: Create or Update Referral
  public createReferral(data: Omit<NCDReferral, 'id' | 'createdAt'>): NCDReferral {
    const newRef: NCDReferral = {
      ...data,
      id: `NCD-REF-${Date.now().toString().slice(-4)}`,
      createdAt: new Date().toISOString(),
    };
    this.referrals.unshift(newRef);
    this.persist('ncd_referrals', this.referrals);
    
    // Sync New NCD Referral directly to Supabase ncd tables
    syncNewNCDReferral(newRef);

    this.notify();
    return newRef;
  }

  public updateReferralStatus(refId: string, status: NCDReferral['status'], notes?: string) {
    const ref = this.referrals.find((r) => r.id === refId);
    if (ref) {
      ref.status = status;
      if (notes) ref.followUpNotes = notes;
      if (status === 'Completed') {
        ref.completionDate = new Date().toISOString().split('T')[0];
      }
      this.persist('ncd_referrals', this.referrals);
      this.notify();
    }
  }

  public updateTaskStatus(taskId: string, status: NCDFollowupTask['status']) {
    const task = this.tasks.find((t) => t.id === taskId);
    if (task) {
      task.status = status;
      this.persist('ncd_tasks', this.tasks);
      this.notify();
    }
  }
}

export const ncdStore = new NCDStore();
