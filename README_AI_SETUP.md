# 🤖 AI Integration Setup Guide

## What We've Built

I've implemented the Claude Post-Mortem Analysis feature as outlined in the AI integration plan. Here's what's been added:

### ✅ Completed Features

1. **Database Schema**: Added `ai_insights` table with proper RLS policies
2. **API Client**: Created Claude API integration with prompt templates
3. **UI Components**: Built `AIInsights` component with loading states
4. **Database Helpers**: Extended Supabase client with AI insights methods
5. **Type Definitions**: Added TypeScript types for AI insights
6. **Integration**: Added AI insights to project detail pages

### 🔧 Setup Required

To complete the AI integration, you need to:

#### 1. Apply Database Schema Changes

Run this SQL in your Supabase SQL editor:

```sql
-- Add new enum type
CREATE TYPE insight_type AS ENUM (
  'pattern_recognition',
  'coaching',
  'questions',
  'strategies'
);

-- Create AI insights table
CREATE TABLE ai_insights (
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

-- Add trigger for updated_at
CREATE TRIGGER update_ai_insights_updated_at BEFORE UPDATE ON ai_insights
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Add indexes
CREATE INDEX idx_ai_insights_project_id ON ai_insights(project_id);
CREATE INDEX idx_ai_insights_post_mortem_id ON ai_insights(post_mortem_id);
CREATE INDEX idx_ai_insights_insight_type ON ai_insights(insight_type);
```

#### 2. Add Anthropic API Key

1. Get your API key from [Anthropic Console](https://console.anthropic.com/)
2. Update your `.env.local` file:

```bash
# Replace 'your_api_key_here' with your actual API key
ANTHROPIC_API_KEY=your_actual_api_key_here
```

3. If deploying to Vercel, add the same environment variable in your Vercel dashboard

### 🚀 How It Works

1. **Create/Edit Post-Mortem**: Users fill out their reflection
2. **AI Analysis**: Click "Generate Insights" to analyze the post-mortem
3. **Smart Insights**: Claude provides 4 types of insights:
   - 🔍 **Pattern Recognition**: Identifies recurring themes
   - 💡 **Coaching**: Provides actionable advice
   - ❓ **Questions**: Asks deeper reflection questions
   - 🎯 **Strategies**: Suggests concrete improvement tactics

### 🧪 Current Status

- **Mock Mode**: Currently uses intelligent mock insights while you set up the API key
- **Database Ready**: All database operations are functional
- **UI Complete**: Full user interface with loading states and error handling
- **Claude Integration**: Real Claude API integration ready (needs API key)

### 🔄 Next Steps

After completing the setup:

1. Test the feature with a post-mortem
2. Add your actual Anthropic API key to enable real Claude analysis
3. Monitor usage and costs in the Anthropic console
4. Consider implementing caching for cost optimization

### 💡 Future Enhancements

The architecture supports the full AI integration plan:

- **Phase 2**: Personal growth intelligence and pattern dashboards
- **Phase 3**: Predictive coaching and project risk assessment
- **Advanced**: Community insights and gamification

### 🐛 Troubleshooting

- **"Generate Insights" not working**: Check that the database schema is applied
- **Mock insights only**: Verify your Anthropic API key is set correctly
- **Permissions errors**: Ensure RLS policies are properly applied

The AI integration is now ready to transform your Project Graveyard into an intelligent growth coaching tool! 🎉