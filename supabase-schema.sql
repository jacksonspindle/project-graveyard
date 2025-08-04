-- Enable Row Level Security
ALTER DEFAULT PRIVILEGES REVOKE EXECUTE ON FUNCTIONS FROM PUBLIC;

-- Create custom types
CREATE TYPE death_cause AS ENUM (
  'lost_interest',
  'over_scoped', 
  'better_solution_existed',
  'technical_roadblock',
  'life_got_in_way',
  'other'
);

CREATE TYPE revival_status AS ENUM (
  'buried',
  'reviving', 
  'revived'
);

-- Projects table
CREATE TABLE projects (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  name TEXT NOT NULL,
  description TEXT,
  death_date DATE NOT NULL,
  death_cause death_cause NOT NULL,
  epitaph TEXT CHECK (char_length(epitaph) <= 100),
  tech_stack TEXT[] DEFAULT '{}',
  revival_status revival_status DEFAULT 'buried',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Post-mortems table
CREATE TABLE post_mortems (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  what_problem TEXT,
  what_went_wrong TEXT,
  lessons_learned TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Code snippets table
CREATE TABLE code_snippets (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  project_id UUID REFERENCES projects(id) ON DELETE CASCADE NOT NULL,
  title TEXT NOT NULL,
  code TEXT NOT NULL,
  language TEXT NOT NULL,
  tags TEXT[] DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Analytics events table
CREATE TABLE analytics_events (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  event_type TEXT NOT NULL,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT timezone('utc'::text, now()) NOT NULL
);

-- Enable Row Level Security
ALTER TABLE projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE post_mortems ENABLE ROW LEVEL SECURITY;
ALTER TABLE code_snippets ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- Row Level Security Policies

-- Projects policies
CREATE POLICY "Users can view their own projects" ON projects
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own projects" ON projects
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects" ON projects
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects" ON projects
  FOR DELETE USING (auth.uid() = user_id);

-- Post-mortems policies
CREATE POLICY "Users can view post-mortems for their projects" ON post_mortems
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = post_mortems.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create post-mortems for their projects" ON post_mortems
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = post_mortems.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update post-mortems for their projects" ON post_mortems
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = post_mortems.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete post-mortems for their projects" ON post_mortems
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = post_mortems.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Code snippets policies
CREATE POLICY "Users can view code snippets for their projects" ON code_snippets
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = code_snippets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create code snippets for their projects" ON code_snippets
  FOR INSERT WITH CHECK (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = code_snippets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update code snippets for their projects" ON code_snippets
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = code_snippets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete code snippets for their projects" ON code_snippets
  FOR DELETE USING (
    EXISTS (
      SELECT 1 FROM projects 
      WHERE projects.id = code_snippets.project_id 
      AND projects.user_id = auth.uid()
    )
  );

-- Analytics events policies
CREATE POLICY "Users can view their own analytics events" ON analytics_events
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own analytics events" ON analytics_events
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- Functions for updating timestamps
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = timezone('utc'::text, now());
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Triggers for updated_at
CREATE TRIGGER update_projects_updated_at BEFORE UPDATE ON projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_post_mortems_updated_at BEFORE UPDATE ON post_mortems
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_code_snippets_updated_at BEFORE UPDATE ON code_snippets
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Indexes for performance
CREATE INDEX idx_projects_user_id ON projects(user_id);
CREATE INDEX idx_projects_death_date ON projects(death_date);
CREATE INDEX idx_projects_death_cause ON projects(death_cause);
CREATE INDEX idx_post_mortems_project_id ON post_mortems(project_id);
CREATE INDEX idx_code_snippets_project_id ON code_snippets(project_id);
CREATE INDEX idx_analytics_events_user_id ON analytics_events(user_id);
CREATE INDEX idx_analytics_events_event_type ON analytics_events(event_type);