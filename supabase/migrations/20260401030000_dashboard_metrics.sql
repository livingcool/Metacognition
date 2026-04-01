-- 1. Create Decisions table for Decision Archaeology
CREATE TABLE IF NOT EXISTS decisions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  session_id UUID REFERENCES sessions(id) ON DELETE SET NULL,
  description TEXT NOT NULL,
  predicted_confidence INTEGER NOT NULL CHECK (predicted_confidence >= 0 AND predicted_confidence <= 100),
  assumptions JSONB NOT NULL DEFAULT '[]'::jsonb,
  outcome_note TEXT,
  actual_outcome_binary BOOLEAN, -- True if the prediction was essentially correct
  calibration_gap INTEGER, -- Difference (e.g., |predicted - actual|)
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'resolved')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  resolved_at TIMESTAMPTZ
);

-- 2. Add Dashboard-specific fields to Cognitive Profiles
ALTER TABLE cognitive_profiles 
ADD COLUMN IF NOT EXISTS weekly_insight TEXT,
ADD COLUMN IF NOT EXISTS calibration_score INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS belief_update_rate FLOAT DEFAULT 0,
ADD COLUMN IF NOT EXISTS radar_data JSONB DEFAULT '{
  "curiosity": 50,
  "analyticalDepth": 50,
  "skepticism": 50,
  "reflectiveTendency": 50,
  "openness": 50,
  "decisiveness": 50
}'::jsonb;

-- 3. Create Daily Snapshots table for Heatmap and Timeline
CREATE TABLE IF NOT EXISTS daily_cognitive_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id TEXT REFERENCES users(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  calibration_score INTEGER NOT NULL,
  assumption_load INTEGER NOT NULL,
  belief_update_count INTEGER NOT NULL DEFAULT 0,
  dominant_bias TEXT,
  radar_data JSONB NOT NULL,
  UNIQUE(user_id, snapshot_date)
);

-- 4. Enable RLS
ALTER TABLE decisions ENABLE ROW LEVEL SECURITY;
ALTER TABLE daily_cognitive_snapshots ENABLE ROW LEVEL SECURITY;

-- 5. Policies
CREATE POLICY "Users can manage their own decisions" ON decisions FOR ALL USING (auth.uid()::text = user_id);
CREATE POLICY "Users can view their own snapshots" ON daily_cognitive_snapshots FOR SELECT USING (auth.uid()::text = user_id);
