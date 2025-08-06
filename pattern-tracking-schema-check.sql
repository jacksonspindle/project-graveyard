-- Check which pattern tracking tables already exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN (
    'user_patterns',
    'project_metadata', 
    'pattern_insights',
    'user_learning_metrics',
    'pattern_triggers'
)
ORDER BY table_name;