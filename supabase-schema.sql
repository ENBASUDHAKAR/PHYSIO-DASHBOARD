-- ═══════════════════════════════════════════════
-- SRI KAVITHA PHYSIOTHERAPY — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ═══════════════════════════════════════════════

-- 1. PATIENTS TABLE
CREATE TABLE IF NOT EXISTS patients (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  created_at timestamptz DEFAULT now(),
  name text NOT NULL,
  age integer,
  gender text CHECK (gender IN ('Male', 'Female', 'Other')),
  phone text NOT NULL,
  alt_phone text,
  address text NOT NULL,
  area text,
  patient_type text CHECK (patient_type IN ('clinic', 'home_visit')) NOT NULL,
  diagnosis text,
  referred_by text,
  notes text,
  is_active boolean DEFAULT true
);

-- 2. SESSION PACKAGES TABLE
CREATE TABLE IF NOT EXISTS session_packages (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  package_name text,
  total_sessions integer NOT NULL,
  completed_sessions integer DEFAULT 0,
  session_fee numeric(10,2),
  package_fee numeric(10,2),
  start_date date,
  end_date date,
  status text CHECK (status IN ('active','completed','paused','cancelled')) DEFAULT 'active',
  payment_status text CHECK (payment_status IN ('paid','partial','pending')) DEFAULT 'pending',
  amount_paid numeric(10,2) DEFAULT 0,
  notes text,
  created_at timestamptz DEFAULT now()
);

-- 3. SESSIONS TABLE
CREATE TABLE IF NOT EXISTS sessions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  package_id uuid REFERENCES session_packages(id) ON DELETE SET NULL,
  session_number integer,
  scheduled_at timestamptz NOT NULL,
  visit_type text CHECK (visit_type IN ('clinic', 'home_visit')) NOT NULL,
  status text CHECK (status IN ('scheduled','completed','cancelled','no_show')) DEFAULT 'scheduled',
  treatment_given text,
  pain_score_before integer CHECK (pain_score_before BETWEEN 0 AND 10),
  pain_score_after integer CHECK (pain_score_after BETWEEN 0 AND 10),
  notes text,
  duration_minutes integer DEFAULT 45,
  created_at timestamptz DEFAULT now()
);

-- 4. PATIENT REPORTS TABLE
CREATE TABLE IF NOT EXISTS patient_reports (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  patient_id uuid REFERENCES patients(id) ON DELETE CASCADE,
  file_name text NOT NULL,
  file_url text NOT NULL,
  file_type text,
  uploaded_at timestamptz DEFAULT now(),
  notes text
);

-- 5. NOTIFICATIONS TABLE
CREATE TABLE IF NOT EXISTS notifications (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  message text NOT NULL,
  type text CHECK (type IN ('appointment','payment','system','reminder')) DEFAULT 'system',
  is_read boolean DEFAULT false,
  created_at timestamptz DEFAULT now(),
  related_patient_id uuid REFERENCES patients(id) ON DELETE SET NULL
);

-- ═══════════════════════════════════════════════
-- ROW LEVEL SECURITY (RLS) POLICIES
-- ═══════════════════════════════════════════════

ALTER TABLE patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE session_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE patient_reports ENABLE ROW LEVEL SECURITY;
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Authenticated users can do everything
CREATE POLICY "Auth full access" ON patients FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON session_packages FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON sessions FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON patient_reports FOR ALL USING (auth.role() = 'authenticated');
CREATE POLICY "Auth full access" ON notifications FOR ALL USING (auth.role() = 'authenticated');

-- ═══════════════════════════════════════════════
-- ENABLE REALTIME
-- ═══════════════════════════════════════════════

ALTER PUBLICATION supabase_realtime ADD TABLE sessions;
ALTER PUBLICATION supabase_realtime ADD TABLE notifications;

-- ═══════════════════════════════════════════════
-- STORAGE BUCKET (run separately or via dashboard)
-- ═══════════════════════════════════════════════
-- 1. Create bucket: "patient-reports" (private)
-- 2. Storage policy for authenticated users:
--    INSERT: auth.role() = 'authenticated'
--    SELECT: auth.role() = 'authenticated'
--    DELETE: auth.role() = 'authenticated'
