CREATE SEQUENCE IF NOT EXISTS complaint_ref_seq START 1;

CREATE TABLE IF NOT EXISTS sectors (
  id SERIAL PRIMARY KEY,
  slug TEXT UNIQUE NOT NULL,
  name TEXT UNIQUE NOT NULL,
  description TEXT
);

CREATE TABLE IF NOT EXISTS wards (
  id SERIAL PRIMARY KEY,
  name TEXT NOT NULL,
  sub_county TEXT NOT NULL,
  UNIQUE (name, sub_county)
);

CREATE TABLE IF NOT EXISTS users (
  id SERIAL PRIMARY KEY,
  full_name TEXT NOT NULL,
  email TEXT UNIQUE NOT NULL,
  national_id TEXT UNIQUE,
  phone TEXT,
  password_hash TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('citizen','admin')) DEFAULT 'citizen',
  ward_id INT REFERENCES wards(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS complaints (
  id SERIAL PRIMARY KEY,
  reference TEXT UNIQUE NOT NULL,
  citizen_id INT NOT NULL REFERENCES users(id),
  sector_id INT NOT NULL REFERENCES sectors(id),
  ward_id INT NOT NULL REFERENCES wards(id),
  title TEXT NOT NULL,
  description TEXT NOT NULL,
  location_details TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  status TEXT NOT NULL DEFAULT 'submitted'
    CHECK (status IN ('submitted','under_review','in_progress','resolved','rejected')),
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  resolved_at TIMESTAMPTZ
);
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS latitude DOUBLE PRECISION;
ALTER TABLE complaints ADD COLUMN IF NOT EXISTS longitude DOUBLE PRECISION;

CREATE INDEX IF NOT EXISTS idx_complaints_sector ON complaints(sector_id);
CREATE INDEX IF NOT EXISTS idx_complaints_ward ON complaints(ward_id);
CREATE INDEX IF NOT EXISTS idx_complaints_status ON complaints(status);
CREATE INDEX IF NOT EXISTS idx_complaints_created ON complaints(created_at);
CREATE INDEX IF NOT EXISTS idx_complaints_citizen ON complaints(citizen_id);

CREATE TABLE IF NOT EXISTS complaint_photos (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  url TEXT NOT NULL,
  public_id TEXT NOT NULL,
  size INT
);

CREATE TABLE IF NOT EXISTS complaint_updates (
  id SERIAL PRIMARY KEY,
  complaint_id INT NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  status TEXT NOT NULL,
  note TEXT,
  updated_by INT REFERENCES users(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS feedback (
  id SERIAL PRIMARY KEY,
  complaint_id INT UNIQUE NOT NULL REFERENCES complaints(id) ON DELETE CASCADE,
  citizen_id INT NOT NULL REFERENCES users(id),
  rating INT NOT NULL CHECK (rating BETWEEN 1 AND 5),
  comment TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

CREATE TABLE IF NOT EXISTS notifications (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  complaint_id INT REFERENCES complaints(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  is_read BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT now()
);
CREATE INDEX IF NOT EXISTS idx_notifications_user ON notifications(user_id, is_read);

CREATE TABLE IF NOT EXISTS password_resets (
  id SERIAL PRIMARY KEY,
  user_id INT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  token_hash TEXT UNIQUE NOT NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ
);
