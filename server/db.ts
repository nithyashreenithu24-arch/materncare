import fs from 'fs';
import path from 'path';
import { predictGestationalDiabetes, predictCervicalCancer, PredictionResult } from './ml_engine.js';
import { generatePersonalizedNutritionPlan, NutritionPlan } from './nutrition_engine.js';

const STORAGE_FILE = path.join(process.cwd(), 'data', 'clinical_registry.json');

export interface SupplementAdherence {
  ironFolicAcid: boolean;
  calciumVitD: boolean;
  prenatalMultivitamin: boolean;
  dhaOmega3: boolean;
  adherenceRating: 'Full' | 'Partial' | 'Missed';
  reminderEnabled: boolean;
  reminderTime?: string;
  notes?: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'patient' | 'doctor' | 'admin';
  phone?: string;
  avatar?: string;
  assignedDoctorId?: string;
  specialty?: string; // For doctors
  clinicLocation?: string;
  createdAt: string;
  supplementReminderEnabled?: boolean;
  supplementReminderTime?: string;
  supplementReminderFrequency?: 'daily' | 'twice_daily';
}

export interface HealthRecord {
  id: string;
  patientId: string;
  recordedAt: string;
  // Demographics
  age: number;
  gestationalWeeks?: number;
  location: string;
  // Anthropometrics
  heightCm: number;
  weightKg: number;
  bmi: number;
  // Vitals
  bloodPressureSys: number;
  bloodPressureDia: number;
  heartRate: number;
  // Lab values
  fastingBloodSugar: number; // mg/dL
  postPrandialBloodSugar: number; // mg/dL
  hba1c?: number; // %
  hemoglobin: number; // g/dL
  // Obstetric
  gravidity: number;
  parity: number;
  priorGDM: boolean;
  priorComplications?: string;
  // Cervical
  papSmearHistory: 'never' | 'normal_recent' | 'abnormal_past' | 'abnormal_recent';
  hpvStatus: 'negative' | 'positive_high_risk' | 'unknown';
  smokingStatus: boolean;
  smokingYears: number;
  sexualPartners: number;
  hormonalContraceptiveYears: number;
  familyHistoryCervical: boolean;
  stdsHistory: boolean;
  // General
  chronicDiseases: string[];
  medications: string[];
  allergies: string[];
  notes?: string;
  supplementAdherence?: SupplementAdherence;
}

export interface AuditLog {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'LOGIN' | 'LOGOUT' | 'DATA_UPDATE' | 'PREDICTION_RUN' | 'NUTRITION_GENERATE' | 'REPORT_DOWNLOAD' | 'MODEL_RETRAIN' | 'ROLE_CHANGE' | 'REGISTER';
  details: string;
  ipAddress?: string;
}

export interface ChatMessage {
  id: string;
  sender: 'user' | 'assistant';
  content: string;
  timestamp: string;
  metadata?: {
    conditionTopic?: string;
    clinicalReference?: string;
  };
}

export interface DoctorNote {
  id: string;
  patientId: string;
  doctorId: string;
  doctorName: string;
  timestamp: string;
  noteText: string;
  recommendations: string[];
}

export interface DirectMessage {
  id: string;
  patientId: string;
  senderId: string;
  senderName: string;
  senderRole: 'patient' | 'doctor';
  recipientId: string;
  recipientName: string;
  timestamp: string;
  content: string;
  tag?: 'Symptom Inquiry' | 'Lab Result' | 'Nutrition & Diet' | 'Medication' | 'General Query';
  isUrgent?: boolean;
  status: 'sent' | 'delivered' | 'read';
}

// In-memory Database state
class Database {
  users: Map<string, User> = new Map();
  healthRecords: Map<string, HealthRecord[]> = new Map(); // patientId -> records array
  predictions: Map<string, { gdm: PredictionResult; cervical: PredictionResult; calculatedAt: string }> = new Map();
  nutritionPlans: Map<string, NutritionPlan> = new Map();
  doctorNotes: Map<string, DoctorNote[]> = new Map();
  chatHistories: Map<string, ChatMessage[]> = new Map();
  directMessages: Map<string, DirectMessage[]> = new Map(); // patientId -> DirectMessage array
  auditLogs: AuditLog[] = [];

  constructor() {
    this.seedInitialData();
    this.loadFromStorage();
  }

  private saveToStorage() {
    try {
      const dataDir = path.dirname(STORAGE_FILE);
      if (!fs.existsSync(dataDir)) {
        fs.mkdirSync(dataDir, { recursive: true });
      }
      const data = {
        users: Array.from(this.users.entries()),
        healthRecords: Array.from(this.healthRecords.entries()),
        predictions: Array.from(this.predictions.entries()),
        nutritionPlans: Array.from(this.nutritionPlans.entries()),
        doctorNotes: Array.from(this.doctorNotes.entries()),
        chatHistories: Array.from(this.chatHistories.entries()),
        directMessages: Array.from(this.directMessages.entries()),
        auditLogs: this.auditLogs,
      };
      fs.writeFileSync(STORAGE_FILE, JSON.stringify(data, null, 2));
    } catch (err) {
      console.error('Failed to save to permanent storage:', err);
    }
  }

  private loadFromStorage() {
    try {
      if (fs.existsSync(STORAGE_FILE)) {
        const raw = fs.readFileSync(STORAGE_FILE, 'utf-8');
        const data = JSON.parse(raw);
        
        if (data.users) this.users = new Map(data.users);
        if (data.healthRecords) this.healthRecords = new Map(data.healthRecords);
        if (data.predictions) this.predictions = new Map(data.predictions);
        if (data.nutritionPlans) this.nutritionPlans = new Map(data.nutritionPlans);
        if (data.doctorNotes) this.doctorNotes = new Map(data.doctorNotes);
        if (data.chatHistories) this.chatHistories = new Map(data.chatHistories);
        if (data.directMessages) this.directMessages = new Map(data.directMessages);
        if (data.auditLogs) this.auditLogs = data.auditLogs;
      }
    } catch (err) {
      console.error('Failed to load from permanent storage:', err);
    }
  }

  public save() {
    this.saveToStorage();
  }

  seedInitialData() {
    // 1. Doctor 1 (Maternal-Fetal Medicine)
    const docId = 'doc-1';
    this.users.set(docId, {
      id: docId,
      name: 'Dr. Ananya Sharma, MD',
      email: 'doctor@matern.org',
      role: 'doctor',
      phone: '+91 98201 54321',
      specialty: 'Maternal-Fetal Medicine & Obstetrics',
      clinicLocation: 'Apollo Cradle Maternal Centre, New Delhi',
      createdAt: new Date('2025-01-10').toISOString(),
    });

    // 1b. Doctor 2 (Gynecologic Oncology & Cervical Prevention)
    const doc2Id = 'doc-2';
    this.users.set(doc2Id, {
      id: doc2Id,
      name: 'Dr. Rajesh Varma, MD, DGO',
      email: 'rajesh.varma@matern.org',
      role: 'doctor',
      phone: '+91 98112 34567',
      specialty: 'Gynecologic Oncology & Preventive Colposcopy',
      clinicLocation: 'Apollo Comprehensive Cancer Centre, Mumbai',
      createdAt: new Date('2025-01-15').toISOString(),
    });

    // 2. Admin
    const adminId = 'admin-1';
    this.users.set(adminId, {
      id: adminId,
      name: 'Dr. Vikram Malhotra (Clinical Admin)',
      email: 'admin@matern.org',
      role: 'admin',
      phone: '+91 99100 87654',
      clinicLocation: 'National Maternal Registry HQ',
      createdAt: new Date('2025-01-01').toISOString(),
    });

    // 3. Patient 1: Priya Patel (GDM Risk Watch)
    const pat1Id = 'pat-1';
    this.users.set(pat1Id, {
      id: pat1Id,
      name: 'Priya Patel',
      email: 'patient@matern.org',
      role: 'patient',
      phone: '+91 97123 45678',
      assignedDoctorId: docId,
      clinicLocation: 'New Delhi, India',
      createdAt: new Date('2025-02-14').toISOString(),
      supplementReminderEnabled: true,
      supplementReminderTime: '09:00 AM',
      supplementReminderFrequency: 'daily',
    });

    // Patient 1 Longitudinal Records
    const pat1Records: HealthRecord[] = [
      {
        id: 'rec-1a',
        patientId: pat1Id,
        recordedAt: new Date(Date.now() - 42 * 24 * 60 * 60 * 1000).toISOString(),
        age: 28,
        gestationalWeeks: 18,
        location: 'New Delhi',
        heightCm: 161,
        weightKg: 64,
        bmi: 24.7,
        bloodPressureSys: 118,
        bloodPressureDia: 76,
        heartRate: 78,
        fastingBloodSugar: 92,
        postPrandialBloodSugar: 122,
        hba1c: 5.3,
        hemoglobin: 11.4,
        gravidity: 2,
        parity: 1,
        priorGDM: false,
        priorComplications: 'Uncomplicated first pregnancy (delivered 2022)',
        papSmearHistory: 'normal_recent',
        hpvStatus: 'negative',
        smokingStatus: false,
        smokingYears: 0,
        sexualPartners: 1,
        hormonalContraceptiveYears: 2,
        familyHistoryCervical: false,
        stdsHistory: false,
        chronicDiseases: [],
        medications: ['Prenatal Multivitamin', 'Iron-Folic Acid'],
        allergies: ['Penicillin'],
        notes: 'Initial second trimester booking visit. Vitals stable.',
      },
      {
        id: 'rec-1b',
        patientId: pat1Id,
        recordedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        age: 28,
        gestationalWeeks: 22,
        location: 'New Delhi',
        heightCm: 161,
        weightKg: 66.5,
        bmi: 25.6,
        bloodPressureSys: 122,
        bloodPressureDia: 78,
        heartRate: 80,
        fastingBloodSugar: 104,
        postPrandialBloodSugar: 138,
        hba1c: 5.6,
        hemoglobin: 11.1,
        gravidity: 2,
        parity: 1,
        priorGDM: false,
        papSmearHistory: 'normal_recent',
        hpvStatus: 'negative',
        smokingStatus: false,
        smokingYears: 0,
        sexualPartners: 1,
        hormonalContraceptiveYears: 2,
        familyHistoryCervical: false,
        stdsHistory: false,
        chronicDiseases: [],
        medications: ['Prenatal Multivitamin', 'Iron-Folic Acid'],
        allergies: ['Penicillin'],
        notes: 'Follow-up visit. Mild post-prandial blood sugar rise noted (138 mg/dL).',
      },
      {
        id: 'rec-1c',
        patientId: pat1Id,
        recordedAt: new Date().toISOString(),
        age: 28,
        gestationalWeeks: 24,
        location: 'New Delhi',
        heightCm: 161,
        weightKg: 67.2,
        bmi: 25.9,
        bloodPressureSys: 124,
        bloodPressureDia: 80,
        heartRate: 82,
        fastingBloodSugar: 108,
        postPrandialBloodSugar: 142,
        hba1c: 5.7,
        hemoglobin: 10.9,
        gravidity: 2,
        parity: 1,
        priorGDM: false,
        papSmearHistory: 'normal_recent',
        hpvStatus: 'negative',
        smokingStatus: false,
        smokingYears: 0,
        sexualPartners: 1,
        hormonalContraceptiveYears: 2,
        familyHistoryCervical: false,
        stdsHistory: false,
        chronicDiseases: [],
        medications: ['Prenatal Multivitamin', 'Iron-Folic Acid'],
        allergies: ['Penicillin'],
        notes: '24-week glucose screening shows borderline GDM elevation. Nutrition and self-monitoring advised.',
      },
    ];
    this.healthRecords.set(pat1Id, pat1Records);

    // Initial predictions for pat-1
    const pat1Gdm = predictGestationalDiabetes({
      age: 28,
      bmi: 25.9,
      pregnancies: 2,
      glucose: 142,
      bloodPressureSys: 124,
      bloodPressureDia: 80,
      familyHistoryDiabetes: true,
      priorGDM: false,
      hba1c: 5.7,
    });
    const pat1Cervical = predictCervicalCancer({
      age: 28,
      hpvPositive: false,
      priorAbnormalPap: false,
      smokingStatus: false,
      sexualPartners: 1,
      hormonalContraceptiveYears: 2,
      familyHistoryCervical: false,
      stdsHistory: false,
    });
    this.predictions.set(pat1Id, {
      gdm: pat1Gdm,
      cervical: pat1Cervical,
      calculatedAt: new Date().toISOString(),
    });

    // Nutrition plan for pat-1
    this.nutritionPlans.set(
      pat1Id,
      generatePersonalizedNutritionPlan({
        patientId: pat1Id,
        patientName: 'Priya Patel',
        weightKg: 67.2,
        heightCm: 161,
        bmi: 25.9,
        gestationalWeeks: 24,
        bloodSugarFasting: 108,
        bloodSugarPostPrandial: 142,
        hemoglobinG_dL: 10.9,
        bloodPressureSys: 124,
        gdmRiskLevel: pat1Gdm.riskCategory,
        cervicalRiskLevel: pat1Cervical.riskCategory,
        dietaryPreference: 'vegetarian',
      })
    );

    // 4. Patient 2: Meera Krishnan (High GDM Risk)
    const pat2Id = 'pat-2';
    this.users.set(pat2Id, {
      id: pat2Id,
      name: 'Meera Krishnan',
      email: 'meera.krishnan@example.com',
      role: 'patient',
      phone: '+91 98450 12345',
      assignedDoctorId: docId,
      clinicLocation: 'Bengaluru, India',
      createdAt: new Date('2025-01-20').toISOString(),
    });

    const pat2Records: HealthRecord[] = [
      {
        id: 'rec-2a',
        patientId: pat2Id,
        recordedAt: new Date().toISOString(),
        age: 34,
        gestationalWeeks: 26,
        location: 'Bengaluru',
        heightCm: 156,
        weightKg: 78,
        bmi: 32.1,
        bloodPressureSys: 134,
        bloodPressureDia: 88,
        heartRate: 86,
        fastingBloodSugar: 126,
        postPrandialBloodSugar: 178,
        hba1c: 6.2,
        hemoglobin: 10.4,
        gravidity: 3,
        parity: 2,
        priorGDM: true,
        priorComplications: 'Gestational Diabetes in 2nd pregnancy requiring dietary restriction',
        papSmearHistory: 'normal_recent',
        hpvStatus: 'negative',
        smokingStatus: false,
        smokingYears: 0,
        sexualPartners: 1,
        hormonalContraceptiveYears: 3,
        familyHistoryCervical: false,
        stdsHistory: false,
        chronicDiseases: ['Mild gestational hypertension'],
        medications: ['Labetalol 100mg', 'Prenatal Vitamin', 'Calcium D3'],
        allergies: ['Sulfa drugs'],
        notes: 'High risk profile. Prior GDM history, elevated BMI 32.1, fasting glucose 126.',
      },
    ];
    this.healthRecords.set(pat2Id, pat2Records);
    const pat2Gdm = predictGestationalDiabetes({
      age: 34,
      bmi: 32.1,
      pregnancies: 3,
      glucose: 178,
      bloodPressureSys: 134,
      bloodPressureDia: 88,
      familyHistoryDiabetes: true,
      priorGDM: true,
      hba1c: 6.2,
    });
    const pat2Cervical = predictCervicalCancer({
      age: 34,
      hpvPositive: false,
      priorAbnormalPap: false,
      smokingStatus: false,
      sexualPartners: 1,
    });
    this.predictions.set(pat2Id, { gdm: pat2Gdm, cervical: pat2Cervical, calculatedAt: new Date().toISOString() });
    this.nutritionPlans.set(
      pat2Id,
      generatePersonalizedNutritionPlan({
        patientId: pat2Id,
        patientName: 'Meera Krishnan',
        weightKg: 78,
        heightCm: 156,
        bmi: 32.1,
        gestationalWeeks: 26,
        bloodSugarFasting: 126,
        bloodSugarPostPrandial: 178,
        hemoglobinG_dL: 10.4,
        bloodPressureSys: 134,
        gdmRiskLevel: 'High',
        cervicalRiskLevel: 'Low',
        dietaryPreference: 'vegetarian',
      })
    );

    // 5. Patient 3: Sunita Rao (Cervical Cancer Screening Follow-up)
    const pat3Id = 'pat-3';
    this.users.set(pat3Id, {
      id: pat3Id,
      name: 'Sunita Rao',
      email: 'sunita.rao@example.com',
      role: 'patient',
      phone: '+91 94220 98765',
      assignedDoctorId: doc2Id,
      clinicLocation: 'Mumbai, India',
      createdAt: new Date('2025-02-01').toISOString(),
    });

    const pat3Records: HealthRecord[] = [
      {
        id: 'rec-3a',
        patientId: pat3Id,
        recordedAt: new Date().toISOString(),
        age: 39,
        location: 'Mumbai',
        heightCm: 164,
        weightKg: 62,
        bmi: 23.1,
        bloodPressureSys: 120,
        bloodPressureDia: 78,
        heartRate: 74,
        fastingBloodSugar: 90,
        postPrandialBloodSugar: 112,
        hba1c: 5.1,
        hemoglobin: 12.2,
        gravidity: 2,
        parity: 2,
        priorGDM: false,
        papSmearHistory: 'abnormal_recent',
        hpvStatus: 'positive_high_risk',
        smokingStatus: true,
        smokingYears: 8,
        sexualPartners: 3,
        hormonalContraceptiveYears: 6,
        familyHistoryCervical: true,
        stdsHistory: true,
        chronicDiseases: [],
        medications: ['Iron supplement'],
        allergies: [],
        notes: 'Referred following abnormal Pap showing low-grade squamous intraepithelial lesion (LSIL) and positive HPV 16.',
      },
    ];
    this.healthRecords.set(pat3Id, pat3Records);
    const pat3Gdm = predictGestationalDiabetes({
      age: 39,
      bmi: 23.1,
      pregnancies: 2,
      glucose: 112,
      bloodPressureSys: 120,
      bloodPressureDia: 78,
      familyHistoryDiabetes: false,
    });
    const pat3Cervical = predictCervicalCancer({
      age: 39,
      hpvPositive: true,
      priorAbnormalPap: true,
      smokingStatus: true,
      smokingYears: 8,
      sexualPartners: 3,
      hormonalContraceptiveYears: 6,
      familyHistoryCervical: true,
      stdsHistory: true,
    });
    this.predictions.set(pat3Id, { gdm: pat3Gdm, cervical: pat3Cervical, calculatedAt: new Date().toISOString() });
    this.nutritionPlans.set(
      pat3Id,
      generatePersonalizedNutritionPlan({
        patientId: pat3Id,
        patientName: 'Sunita Rao',
        weightKg: 62,
        heightCm: 164,
        bmi: 23.1,
        bloodSugarFasting: 90,
        bloodSugarPostPrandial: 112,
        hemoglobinG_dL: 12.2,
        bloodPressureSys: 120,
        gdmRiskLevel: 'Low',
        cervicalRiskLevel: 'High',
        dietaryPreference: 'non-vegetarian',
      })
    );

    // Initial doctor notes
    this.doctorNotes.set(pat1Id, [
      {
        id: 'dn-1',
        patientId: pat1Id,
        doctorId: docId,
        doctorName: 'Dr. Ananya Sharma',
        timestamp: new Date().toISOString(),
        noteText: 'Reviewed 24-week glucose values. Post-prandial reading 142 mg/dL warrants strict adherence to the Low-GI meal plan. Maintain active daily walking for 20-30 minutes post meals.',
        recommendations: [
          'Perform 75g OGTT confirmation test within 7 days',
          'Follow 6-meal daily split (3 main + 3 protein-rich snacks)',
          'Avoid sweet beverages and white rice at dinner',
        ],
      },
    ]);

    this.doctorNotes.set(pat3Id, [
      {
        id: 'dn-301',
        patientId: pat3Id,
        doctorId: doc2Id,
        doctorName: 'Dr. Rajesh Varma',
        timestamp: new Date().toISOString(),
        noteText: 'Referred for cytology abnormalities (LSIL) with positive HPV 16 typing. Colposcopic magnification and cervical surface evaluation arranged for next week. Patient reassured regarding low immediate neoplastic progression when monitored promptly.',
        recommendations: [
          'Undergo colposcopic assessment with Lugol iodine wash',
          'Repeat HPV-DNA typing and triage cytology at 6-month interval',
          'Dietary antioxidant optimization (rich in folate and Vitamin C)',
        ],
      },
    ]);

    // Initial audit logs
    this.auditLogs.push(
      {
        id: 'log-1',
        timestamp: new Date(Date.now() - 3600000).toISOString(),
        userId: 'doc-1',
        userName: 'Dr. Ananya Sharma',
        userRole: 'doctor',
        action: 'LOGIN',
        details: 'Clinician authenticated via JWT session',
      },
      {
        id: 'log-2',
        timestamp: new Date(Date.now() - 2400000).toISOString(),
        userId: 'pat-1',
        userName: 'Priya Patel',
        userRole: 'patient',
        action: 'DATA_UPDATE',
        details: 'Patient submitted 24-week vitals and glucose records',
      },
      {
        id: 'log-3',
        timestamp: new Date(Date.now() - 1200000).toISOString(),
        userId: 'pat-1',
        userName: 'Priya Patel',
        userRole: 'patient',
        action: 'PREDICTION_RUN',
        details: 'Evaluated GDM Risk (Medium: 48%) and Cervical Cancer Risk (Low: 8%)',
      }
    );

    // Initial Chat history
    this.chatHistories.set(pat1Id, [
      {
        id: 'm1',
        sender: 'assistant',
        content: 'Namaste Priya! I am your Matern Health Companion. I can provide evidence-based educational guidance regarding gestational diabetes, prenatal nutrition, cervical screening, and your test results. What would you like to explore today?',
        timestamp: new Date(Date.now() - 1800000).toISOString(),
      },
    ]);

    // Seed Doctor-Patient Communication Messages for Priya Patel (pat-1)
    this.directMessages.set(pat1Id, [
      {
        id: 'dm-1',
        patientId: pat1Id,
        senderId: pat1Id,
        senderName: 'Priya Patel',
        senderRole: 'patient',
        recipientId: docId,
        recipientName: 'Dr. Ananya Sharma',
        timestamp: new Date(Date.now() - 18 * 60 * 60 * 1000).toISOString(),
        content: 'Namaste Dr. Ananya, my 2-hour post-meal blood sugar came out to 138 mg/dL today after lunch. I felt slightly dizzy around 3 PM. Should I modify my dinner plan?',
        tag: 'Lab Result',
        status: 'read',
      },
      {
        id: 'dm-2',
        patientId: pat1Id,
        senderId: docId,
        senderName: 'Dr. Ananya Sharma',
        senderRole: 'doctor',
        recipientId: pat1Id,
        recipientName: 'Priya Patel',
        timestamp: new Date(Date.now() - 16 * 60 * 60 * 1000).toISOString(),
        content: 'Hello Priya. A reading of 138 mg/dL is slightly above our optimal prenatal ceiling of 120-130 mg/dL, which explains the mild sluggishness. Please replace any refined grain with ragi or bajra roti for dinner, take a gentle 15-minute post-meal stroll, and check your fasting glucose tomorrow at 7:30 AM. If you notice visual flashes or headache, contact our triage immediately.',
        tag: 'Nutrition & Diet',
        status: 'read',
      },
      {
        id: 'dm-3',
        patientId: pat1Id,
        senderId: pat1Id,
        senderName: 'Priya Patel',
        senderRole: 'patient',
        recipientId: docId,
        recipientName: 'Dr. Ananya Sharma',
        timestamp: new Date(Date.now() - 14 * 60 * 60 * 1000).toISOString(),
        content: 'Understood Doctor! I followed the low-GI dinner plan and took a 20-minute walk. Fasting sugar this morning was 92 mg/dL. Also set my daily supplement reminder for 09:00 AM. Thank you!',
        tag: 'Symptom Inquiry',
        status: 'read',
      },
      {
        id: 'dm-4',
        patientId: pat1Id,
        senderId: docId,
        senderName: 'Dr. Ananya Sharma',
        senderRole: 'doctor',
        recipientId: pat1Id,
        recipientName: 'Priya Patel',
        timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
        content: 'Excellent progress, Priya! 92 mg/dL fasting is right in our target zone (<95 mg/dL). Keep up the steady hydration and supplement adherence. See you for the scheduled 26-week scan on Thursday.',
        tag: 'General Query',
        status: 'delivered',
      },
    ]);

    // Seed Doctor-Patient Communication Messages for Sunita Rao (pat-3)
    this.directMessages.set(pat3Id, [
      {
        id: 'dm-301',
        patientId: pat3Id,
        senderId: pat3Id,
        senderName: 'Sunita Rao',
        senderRole: 'patient',
        recipientId: doc2Id,
        recipientName: 'Dr. Rajesh Varma',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        content: 'Doctor, I received my Pap smear report showing LSIL and positive HPV 16. I am feeling very anxious about what this means for cancer risk. What are the next steps?',
        tag: 'Lab Result',
        isUrgent: true,
        status: 'read',
      },
      {
        id: 'dm-302',
        patientId: pat3Id,
        senderId: doc2Id,
        senderName: 'Dr. Rajesh Varma',
        senderRole: 'doctor',
        recipientId: pat3Id,
        recipientName: 'Sunita Rao',
        timestamp: new Date(Date.now() - 20 * 60 * 60 * 1000).toISOString(),
        content: 'Sunita, please take a deep breath. Having positive HPV with LSIL indicates early surface cellular changes, NOT cancer. The majority of these changes are reversible or easily managed when detected early. I have scheduled a colposcopy review for you next Tuesday where we will examine the cervical surface under magnification. Please avoid douching or intercourse 48 hours prior.',
        tag: 'Lab Result',
        status: 'read',
      },
    ]);
  }

  logAction(userId: string, action: AuditLog['action'], details: string) {
    const user = this.users.get(userId);
    const newLog: AuditLog = {
      id: `log-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      timestamp: new Date().toISOString(),
      userId,
      userName: user ? user.name : 'Unknown User',
      userRole: user ? user.role : 'guest',
      action,
      details,
    };
    this.auditLogs.unshift(newLog);
    if (this.auditLogs.length > 500) {
      this.auditLogs.pop();
    }
    this.saveToStorage();
  }
}

export const db = new Database();
