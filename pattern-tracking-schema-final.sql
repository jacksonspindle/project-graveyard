-- Safe Pattern Tracking Schema - Final Version
-- This version handles existing tables and policies correctly

-- Step 1: Create missing tables
CREATE TABLE IF NOT EXISTS user_patterns (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  pattern_type VARCHAR(50) NOT NULL,
  pattern_name VARCHAR(100) NOT NULL,
  pattern_value JSONB NOT NULL,
  frequency INTEGER DEFAULT 1,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
  first_detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_detected_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS project_metadata (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  total_days_active INTEGER,
  first_commit_date TIMESTAMP WITH TIME ZONE,
  last_commit_date TIMESTAMP WITH TIME ZONE,
  peak_activity_day VARCHAR(10),
  peak_activity_hour INTEGER CHECK (peak_activity_hour >= 0 AND peak_activity_hour <= 23),
  estimated_lines_of_code INTEGER,
  estimated_commit_count INTEGER,
  libraries_count INTEGER,
  files_count INTEGER,
  first_commit_type VARCHAR(50),
  has_readme BOOLEAN DEFAULT false,
  has_tests BOOLEAN DEFAULT false,
  has_documentation BOOLEAN DEFAULT false,
  github_repo_url TEXT,
  github_stars INTEGER DEFAULT 0,
  github_forks INTEGER DEFAULT 0,
  github_last_activity TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS pattern_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_text TEXT NOT NULL,
  insight_type VARCHAR(50) NOT NULL,
  related_pattern_ids UUID[] DEFAULT '{}',
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
  projects_analyzed INTEGER DEFAULT 0,
  first_generated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  last_validated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  times_shown INTEGER DEFAULT 0,
  user_feedback VARCHAR(20),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS user_learning_metrics (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  metric_name VARCHAR(100) NOT NULL,
  metric_value DECIMAL(10,2) NOT NULL,
  measurement_period VARCHAR(20) NOT NULL,
  measurement_date DATE NOT NULL,
  previous_value DECIMAL(10,2),
  change_percentage DECIMAL(5,2),
  trend VARCHAR(20),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

CREATE TABLE IF NOT EXISTS pattern_triggers (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  pattern_name VARCHAR(100) NOT NULL,
  trigger_condition JSONB NOT NULL,
  min_occurrences INTEGER DEFAULT 2,
  confidence_threshold DECIMAL(3,2) DEFAULT 0.70,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Step 2: Enable RLS (safe to run even if already enabled)
ALTER TABLE user_patterns ENABLE ROW LEVEL SECURITY;
ALTER TABLE project_metadata ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_learning_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE pattern_triggers ENABLE ROW LEVEL SECURITY;

-- Step 3: Drop existing policies and recreate them (safest approach)
-- User patterns policies
DROP POLICY IF EXISTS "Users can view their own patterns" ON user_patterns;
DROP POLICY IF EXISTS "Users can create their own patterns" ON user_patterns;
DROP POLICY IF EXISTS "Users can update their own patterns" ON user_patterns;

CREATE POLICY "Users can view their own patterns" ON user_patterns
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own patterns" ON user_patterns
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own patterns" ON user_patterns
  FOR UPDATE USING (auth.uid() = user_id);

-- Project metadata policies
DROP POLICY IF EXISTS "Users can view metadata for their projects" ON project_metadata;
DROP POLICY IF EXISTS "Users can create metadata for their projects" ON project_metadata;
DROP POLICY IF EXISTS "Users can update metadata for their projects" ON project_metadata;

CREATE POLICY "Users can view metadata for their projects" ON project_metadata
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_metadata.project_id 
      AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can create metadata for their projects" ON project_metadata
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_metadata.project_id 
      AND projects.user_id = auth.uid()
    )
  );
CREATE POLICY "Users can update metadata for their projects" ON project_metadata
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = project_metadata.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Pattern insights policies
DROP POLICY IF EXISTS "Users can view their own pattern insights" ON pattern_insights;
DROP POLICY IF EXISTS "Users can create their own pattern insights" ON pattern_insights;
DROP POLICY IF EXISTS "Users can update their own pattern insights" ON pattern_insights;

CREATE POLICY "Users can view their own pattern insights" ON pattern_insights
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own pattern insights" ON pattern_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update their own pattern insights" ON pattern_insights
  FOR UPDATE USING (auth.uid() = user_id);

-- User learning metrics policies
DROP POLICY IF EXISTS "Users can view their own learning metrics" ON user_learning_metrics;
DROP POLICY IF EXISTS "Users can create their own learning metrics" ON user_learning_metrics;

CREATE POLICY "Users can view their own learning metrics" ON user_learning_metrics
  FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can create their own learning metrics" ON user_learning_metrics
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Pattern triggers policies
DROP POLICY IF EXISTS "Authenticated users can view pattern triggers" ON pattern_triggers;

CREATE POLICY "Authenticated users can view pattern triggers" ON pattern_triggers
  FOR SELECT USING (auth.role() = 'authenticated');

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_user_patterns_user_id ON user_patterns(user_id);
CREATE INDEX IF NOT EXISTS idx_user_patterns_type ON user_patterns(pattern_type);
CREATE INDEX IF NOT EXISTS idx_user_patterns_active ON user_patterns(is_active);
CREATE INDEX IF NOT EXISTS idx_project_metadata_project_id ON project_metadata(project_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_user_id ON pattern_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_active ON pattern_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_user_learning_metrics_user_id ON user_learning_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_metrics_date ON user_learning_metrics(measurement_date);

-- Step 5: Create triggers if update function exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        DROP TRIGGER IF EXISTS update_user_patterns_updated_at ON user_patterns;
        CREATE TRIGGER update_user_patterns_updated_at BEFORE UPDATE ON user_patterns
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
        DROP TRIGGER IF EXISTS update_project_metadata_updated_at ON project_metadata;
        CREATE TRIGGER update_project_metadata_updated_at BEFORE UPDATE ON project_metadata
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
        DROP TRIGGER IF EXISTS update_pattern_insights_updated_at ON pattern_insights;
        CREATE TRIGGER update_pattern_insights_updated_at BEFORE UPDATE ON pattern_insights
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
            
        DROP TRIGGER IF EXISTS update_pattern_triggers_updated_at ON pattern_triggers;
        CREATE TRIGGER update_pattern_triggers_updated_at BEFORE UPDATE ON pattern_triggers
            FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
    END IF;
END $$;

-- Step 6: Insert default pattern triggers
INSERT INTO pattern_triggers (pattern_name, trigger_condition, min_occurrences, confidence_threshold) 
VALUES
    ('weekend_warrior', '{"conditions": [{"field": "first_commit_day", "operator": "in", "value": ["friday", "saturday", "sunday"]}, {"field": "death_within_days", "operator": "<=", "value": 3}]}'::jsonb, 2, 0.75),
    ('auth_curse', '{"conditions": [{"field": "first_commit_type", "operator": "=", "value": "auth"}, {"field": "total_days_active", "operator": "<=", "value": 7}]}'::jsonb, 2, 0.80),
    ('scope_creeper', '{"conditions": [{"field": "libraries_count", "operator": ">", "value": 5}, {"field": "files_count", "operator": ">", "value": 20}, {"field": "death_cause", "operator": "=", "value": "over_scoped"}]}'::jsonb, 2, 0.70),
    ('serial_starter', '{"conditions": [{"field": "days_between_projects", "operator": "<=", "value": 3}]}'::jsonb, 3, 0.85),
    ('perfectionist_paralysis', '{"conditions": [{"field": "has_readme", "operator": "=", "value": true}, {"field": "estimated_lines_of_code", "operator": "<=", "value": 100}, {"field": "total_days_active", "operator": ">=", "value": 14}]}'::jsonb, 2, 0.75)
ON CONFLICT DO NOTHING;

-- Step 7: Verify everything was created
SELECT 
    'Pattern tracking schema deployment completed!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_patterns') as user_patterns,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_metadata') as project_metadata,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pattern_insights') as pattern_insights,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_learning_metrics') as user_learning_metrics,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pattern_triggers') as pattern_triggers,
    (SELECT COUNT(*) FROM pattern_triggers) as default_triggers_count;