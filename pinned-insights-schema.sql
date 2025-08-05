-- Pinned Insights Feature Schema
-- Allows users to pin/favorite AI insights for future reference

-- Pinned insights table - stores user's favorite insights
CREATE TABLE pinned_insights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  insight_type VARCHAR(20) NOT NULL CHECK (insight_type IN ('project_specific', 'pattern_analysis')),
  
  -- For project-specific insights (from individual post-mortems)
  ai_insight_id UUID REFERENCES ai_insights(id) ON DELETE CASCADE,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE,
  
  -- For pattern analysis insights (from cross-project pattern recognition)
  pattern_insight_id UUID REFERENCES pattern_insights(id) ON DELETE CASCADE,
  
  -- Metadata
  pinned_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  notes TEXT, -- Optional user notes about why they pinned this insight
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  
  -- Ensure proper referential integrity based on insight type
  CONSTRAINT valid_insight_reference CHECK (
    (insight_type = 'project_specific' AND ai_insight_id IS NOT NULL AND pattern_insight_id IS NULL) OR
    (insight_type = 'pattern_analysis' AND pattern_insight_id IS NOT NULL AND ai_insight_id IS NULL)
  ),
  
  -- Prevent duplicate pins of the same insight
  CONSTRAINT unique_project_insight_pin UNIQUE (user_id, ai_insight_id),
  CONSTRAINT unique_pattern_insight_pin UNIQUE (user_id, pattern_insight_id)
);

-- Enable Row Level Security
ALTER TABLE pinned_insights ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own pinned insights" ON pinned_insights
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own pinned insights" ON pinned_insights
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own pinned insights" ON pinned_insights
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own pinned insights" ON pinned_insights
  FOR DELETE USING (auth.uid() = user_id);

-- Indexes for performance
CREATE INDEX idx_pinned_insights_user_id ON pinned_insights(user_id);
CREATE INDEX idx_pinned_insights_type ON pinned_insights(insight_type);
CREATE INDEX idx_pinned_insights_pinned_at ON pinned_insights(pinned_at DESC);
CREATE INDEX idx_pinned_insights_ai_insight ON pinned_insights(ai_insight_id) WHERE ai_insight_id IS NOT NULL;
CREATE INDEX idx_pinned_insights_pattern_insight ON pinned_insights(pattern_insight_id) WHERE pattern_insight_id IS NOT NULL;

-- Comments for documentation
COMMENT ON TABLE pinned_insights IS 'Stores user-pinned AI insights for easy reference';
COMMENT ON COLUMN pinned_insights.insight_type IS 'Either project_specific (from post-mortems) or pattern_analysis (from cross-project patterns)';
COMMENT ON COLUMN pinned_insights.notes IS 'Optional user notes about why this insight is valuable to them';