// ─── Patient ───────────────────────────────────────
export interface Patient {
  id: string;
  created_at: string;
  name: string;
  age: number | null;
  gender: 'Male' | 'Female' | 'Other' | null;
  phone: string;
  alt_phone: string | null;
  address: string;
  area: string | null;
  patient_type: 'clinic' | 'home_visit';
  diagnosis: string | null;
  referred_by: string | null;
  notes: string | null;
  is_active: boolean;
}

export type PatientInsert = Omit<Patient, 'id' | 'created_at'>;
export type PatientUpdate = Partial<PatientInsert>;

// ─── Session Package ───────────────────────────────
export interface SessionPackage {
  id: string;
  patient_id: string;
  package_name: string | null;
  total_sessions: number;
  completed_sessions: number;
  session_fee: number | null;
  package_fee: number | null;
  start_date: string | null;
  end_date: string | null;
  status: 'active' | 'completed' | 'paused' | 'cancelled';
  payment_status: 'paid' | 'partial' | 'pending';
  amount_paid: number;
  notes: string | null;
  created_at: string;
  // Joined fields
  patient?: Patient;
}

export type SessionPackageInsert = Omit<SessionPackage, 'id' | 'created_at' | 'patient'>;
export type SessionPackageUpdate = Partial<SessionPackageInsert>;

// ─── Session ───────────────────────────────────────
export interface Session {
  id: string;
  patient_id: string;
  package_id: string | null;
  session_number: number | null;
  scheduled_at: string;
  visit_type: 'clinic' | 'home_visit';
  status: 'scheduled' | 'completed' | 'cancelled' | 'no_show';
  treatment_given: string | null;
  pain_score_before: number | null;
  pain_score_after: number | null;
  notes: string | null;
  duration_minutes: number;
  created_at: string;
  // Joined fields
  patient?: Patient;
  session_packages?: SessionPackage;
}

export type SessionInsert = Omit<Session, 'id' | 'created_at' | 'patient' | 'session_packages'>;
export type SessionUpdate = Partial<SessionInsert>;

// ─── Patient Report ────────────────────────────────
export interface PatientReport {
  id: string;
  patient_id: string;
  file_name: string;
  file_url: string;
  file_type: 'xray' | 'mri' | 'prescription' | 'other' | null;
  uploaded_at: string;
  notes: string | null;
  // Joined
  patient?: Patient;
}

export type PatientReportInsert = Omit<PatientReport, 'id' | 'uploaded_at' | 'patient'>;

// ─── Notification ──────────────────────────────────
export interface Notification {
  id: string;
  title: string;
  message: string;
  type: 'appointment' | 'payment' | 'system' | 'reminder';
  is_read: boolean;
  created_at: string;
  related_patient_id: string | null;
}

export type NotificationInsert = Omit<Notification, 'id' | 'created_at'>;

// ─── Dashboard Stats ───────────────────────────────
export interface DashboardStats {
  totalActivePatients: number;
  todaySessions: number;
  sessionsThisMonth: number;
  revenueThisMonth: number;
}

export interface MonthlyRevenue {
  month: string;
  revenue: number;
}

export interface PatientTypeCount {
  type: string;
  count: number;
}

export interface RecentActivityItem {
  id: string;
  action: string;
  description: string;
  timestamp: string;
  type: 'patient' | 'session' | 'payment' | 'package';
}

// ─── Common ────────────────────────────────────────
export interface SelectOption {
  value: string;
  label: string;
}

export const DIAGNOSES = [
  'Frozen Shoulder',
  'Knee Osteoarthritis',
  'Low Back Pain',
  'Cervical Spondylosis',
  'Post-Fracture Rehab',
  'Stroke Rehabilitation',
  'Sciatica',
  'Tennis Elbow',
  'Sports Injury',
  'Plantar Fasciitis',
] as const;

export const TREATMENTS = [
  'IFT (Interferential Therapy)',
  'TENS',
  'Ultrasound Therapy',
  'Hot Pack',
  'Cold Pack',
  'Exercise Therapy',
  'Manual Therapy',
  'Traction',
  'Dry Needling',
  'Kinesio Taping',
  'Wax Bath',
] as const;

export const PACKAGE_TEMPLATES = [
  '5 Session Package',
  '10 Session Package',
  '15 Session Package',
  '20 Session Package',
  'Monthly Package (Unlimited)',
] as const;
