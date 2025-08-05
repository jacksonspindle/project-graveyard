-- Update pinned_insights table to store exact content at time of pinning
-- This ensures pinned insights show the EXACT original text, even if regenerated

ALTER TABLE pinned_insights 
ADD COLUMN pinned_content TEXT NOT NULL DEFAULT '',
ADD COLUMN pinned_insight_type VARCHAR(50),  
ADD COLUMN pinned_confidence_score DECIMAL(3,2),
ADD COLUMN project_name TEXT,
ADD COLUMN project_epitaph TEXT;

-- Update the constraint to allow content without requiring foreign key references
-- This way we can store the exact content even if the original gets deleted/updated
ALTER TABLE pinned_insights 
DROP CONSTRAINT IF EXISTS valid_insight_reference;

-- Add new constraint that allows storing content directly
ALTER TABLE pinned_insights 
ADD CONSTRAINT valid_insight_reference CHECK (
  -- Either store references to existing insights
  (insight_type = 'project_specific' AND ai_insight_id IS NOT NULL AND pattern_insight_id IS NULL) OR
  (insight_type = 'pattern_analysis' AND pattern_insight_id IS NOT NULL AND ai_insight_id IS NULL) OR
  -- Or store the content directly (for pinned snapshots)
  (pinned_content IS NOT NULL AND pinned_content != '')
);

-- Comment the new fields
COMMENT ON COLUMN pinned_insights.pinned_content IS 'Stores the exact insight text at the time of pinning to preserve original wording';
COMMENT ON COLUMN pinned_insights.pinned_insight_type IS 'Type of insight when it was pinned (coaching, warning, etc.)';
COMMENT ON COLUMN pinned_insights.pinned_confidence_score IS 'Confidence score when the insight was pinned';
COMMENT ON COLUMN pinned_insights.project_name IS 'Project name at time of pinning (for project-specific insights)';
COMMENT ON COLUMN pinned_insights.project_epitaph IS 'Project epitaph at time of pinning (for project-specific insights)';