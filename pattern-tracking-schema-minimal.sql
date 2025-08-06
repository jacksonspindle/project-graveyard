-- Minimal Pattern Tracking Schema - No DROP statements
-- Only creates missing tables and policies, never drops anything

-- Step 1: Create missing tables only
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

-- Step 2: Enable RLS on new tables only
DO $$ 
BEGIN
    -- Only enable RLS if table exists (user_patterns already has RLS)
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'project_metadata') THEN
        ALTER TABLE project_metadata ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pattern_insights') THEN
        ALTER TABLE pattern_insights ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'user_learning_metrics') THEN
        ALTER TABLE user_learning_metrics ENABLE ROW LEVEL SECURITY;
    END IF;
    
    IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_name = 'pattern_triggers') THEN
        ALTER TABLE pattern_triggers ENABLE ROW LEVEL SECURITY;
    END IF;
END $$;

-- Step 3: Create policies only if they don't exist (using DO blocks)
DO $$
BEGIN
    -- Project metadata policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_metadata' AND policyname = 'Users can view metadata for their projects') THEN
        CREATE POLICY "Users can view metadata for their projects" ON project_metadata
          FOR SELECT USING (
            EXISTS (
              SELECT 1 FROM projects 
              WHERE projects.id = project_metadata.project_id 
              AND projects.user_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_metadata' AND policyname = 'Users can create metadata for their projects') THEN
        CREATE POLICY "Users can create metadata for their projects" ON project_metadata
          FOR INSERT WITH CHECK (
            EXISTS (
              SELECT 1 FROM projects 
              WHERE projects.id = project_metadata.project_id 
              AND projects.user_id = auth.uid()
            )
          );
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'project_metadata' AND policyname = 'Users can update metadata for their projects') THEN
        CREATE POLICY "Users can update metadata for their projects" ON project_metadata
          FOR UPDATE USING (
            EXISTS (
              SELECT 1 FROM projects 
              WHERE projects.id = project_metadata.project_id 
              AND projects.user_id = auth.uid()
            )
          );
    END IF;

    -- Pattern insights policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pattern_insights' AND policyname = 'Users can view their own pattern insights') THEN
        CREATE POLICY "Users can view their own pattern insights" ON pattern_insights
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pattern_insights' AND policyname = 'Users can create their own pattern insights') THEN
        CREATE POLICY "Users can create their own pattern insights" ON pattern_insights
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pattern_insights' AND policyname = 'Users can update their own pattern insights') THEN
        CREATE POLICY "Users can update their own pattern insights" ON pattern_insights
          FOR UPDATE USING (auth.uid() = user_id);
    END IF;

    -- User learning metrics policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_learning_metrics' AND policyname = 'Users can view their own learning metrics') THEN
        CREATE POLICY "Users can view their own learning metrics" ON user_learning_metrics
          FOR SELECT USING (auth.uid() = user_id);
    END IF;
    
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'user_learning_metrics' AND policyname = 'Users can create their own learning metrics') THEN
        CREATE POLICY "Users can create their own learning metrics" ON user_learning_metrics
          FOR INSERT WITH CHECK (auth.uid() = user_id);
    END IF;

    -- Pattern triggers policies
    IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE tablename = 'pattern_triggers' AND policyname = 'Authenticated users can view pattern triggers') THEN
        CREATE POLICY "Authenticated users can view pattern triggers" ON pattern_triggers
          FOR SELECT USING (auth.role() = 'authenticated');
    END IF;
END $$;

-- Step 4: Create indexes
CREATE INDEX IF NOT EXISTS idx_project_metadata_project_id ON project_metadata(project_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_user_id ON pattern_insights(user_id);
CREATE INDEX IF NOT EXISTS idx_pattern_insights_active ON pattern_insights(is_active);
CREATE INDEX IF NOT EXISTS idx_user_learning_metrics_user_id ON user_learning_metrics(user_id);
CREATE INDEX IF NOT EXISTS idx_user_learning_metrics_date ON user_learning_metrics(measurement_date);

-- Step 5: Create triggers if function exists
DO $$ 
BEGIN
    IF EXISTS (SELECT 1 FROM pg_proc WHERE proname = 'update_updated_at_column') THEN
        -- Check if triggers don't exist before creating
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_project_metadata_updated_at') THEN
            CREATE TRIGGER update_project_metadata_updated_at BEFORE UPDATE ON project_metadata
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pattern_insights_updated_at') THEN
            CREATE TRIGGER update_pattern_insights_updated_at BEFORE UPDATE ON pattern_insights
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
        
        IF NOT EXISTS (SELECT 1 FROM pg_trigger WHERE tgname = 'update_pattern_triggers_updated_at') THEN
            CREATE TRIGGER update_pattern_triggers_updated_at BEFORE UPDATE ON pattern_triggers
                FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
        END IF;
    END IF;
END $$;

-- Step 6: Insert default pattern triggers only if they don't exist
INSERT INTO pattern_triggers (pattern_name, trigger_condition, min_occurrences, confidence_threshold) 
SELECT 'weekend_warrior', '{"conditions": [{"field": "first_commit_day", "operator": "in", "value": ["friday", "saturday", "sunday"]}, {"field": "death_within_days", "operator": "<=", "value": 3}]}'::jsonb, 2, 0.75
WHERE NOT EXISTS (SELECT 1 FROM pattern_triggers WHERE pattern_name = 'weekend_warrior');

INSERT INTO pattern_triggers (pattern_name, trigger_condition, min_occurrences, confidence_threshold) 
SELECT 'auth_curse', '{"conditions": [{"field": "first_commit_type", "operator": "=", "value": "auth"}, {"field": "total_days_active", "operator": "<=", "value": 7}]}'::jsonb, 2, 0.80
WHERE NOT EXISTS (SELECT 1 FROM pattern_triggers WHERE pattern_name = 'auth_curse');

INSERT INTO pattern_triggers (pattern_name, trigger_condition, min_occurrences, confidence_threshold) 
SELECT 'scope_creeper', '{"conditions": [{"field": "libraries_count", "operator": ">", "value": 5}, {"field": "files_count", "operator": ">", "value": 20}, {"field": "death_cause", "operator": "=", "value": "over_scoped"}]}'::jsonb, 2, 0.70
WHERE NOT EXISTS (SELECT 1 FROM pattern_triggers WHERE pattern_name = 'scope_creeper');

INSERT INTO pattern_triggers (pattern_name, trigger_condition, min_occurrences, confidence_threshold) 
SELECT 'serial_starter', '{"conditions": [{"field": "days_between_projects", "operator": "<=", "value": 3}]}'::jsonb, 3, 0.85
WHERE NOT EXISTS (SELECT 1 FROM pattern_triggers WHERE pattern_name = 'serial_starter');

INSERT INTO pattern_triggers (pattern_name, trigger_condition, min_occurrences, confidence_threshold) 
SELECT 'perfectionist_paralysis', '{"conditions": [{"field": "has_readme", "operator": "=", "value": true}, {"field": "estimated_lines_of_code", "operator": "<=", "value": 100}, {"field": "total_days_active", "operator": ">=", "value": 14}]}'::jsonb, 2, 0.75
WHERE NOT EXISTS (SELECT 1 FROM pattern_triggers WHERE pattern_name = 'perfectionist_paralysis');

-- Step 7: Verify everything
SELECT 
    'Pattern tracking schema completed successfully!' as status,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_patterns') as user_patterns,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'project_metadata') as project_metadata,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pattern_insights') as pattern_insights,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'user_learning_metrics') as user_learning_metrics,
    (SELECT COUNT(*) FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'pattern_triggers') as pattern_triggers;