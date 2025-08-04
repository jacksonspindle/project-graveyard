-- AI Insights Migration - Run this in Supabase SQL Editor
-- Only adds the new AI insights functionality to existing database

-- Create the insight_type enum (only if it doesn't exist)
DO $$ BEGIN
    CREATE TYPE insight_type AS ENUM (
        'pattern_recognition',
        'coaching',
        'questions',
        'strategies'
    );
EXCEPTION
    WHEN duplicate_object THEN null;
END $$;

-- Create AI insights table
CREATE TABLE IF NOT EXISTS ai_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  post_mortem_id UUID REFERENCES post_mortems(id) ON DELETE CASCADE NOT NULL,
  insight_type insight_type NOT NULL,
  content TEXT NOT NULL,
  confidence_score DECIMAL(3,2) CHECK (confidence_score >= 0.00 AND confidence_score <= 1.00),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable RLS
ALTER TABLE ai_insights ENABLE ROW LEVEL SECURITY;

-- Add RLS policies
CREATE POLICY "Users can view AI insights for their projects" ON ai_insights
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = ai_insights.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create AI insights for their projects" ON ai_insights
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = ai_insights.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Add trigger for updated_at (only if the function exists)
DO $$ BEGIN
    CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
        FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
EXCEPTION
    WHEN undefined_function THEN 
        RAISE NOTICE 'update_updated_at_column function not found, skipping trigger';
END $$;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_ai_insights_project_id ON ai_insights(project_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_post_mortem_id ON ai_insights(post_mortem_id);
CREATE INDEX IF NOT EXISTS idx_ai_insights_insight_type ON ai_insights(insight_type);