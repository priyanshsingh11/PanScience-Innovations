-- Create tables for Multimedia RAG Application

-- 1. Uploaded Files Table
CREATE TABLE IF NOT EXISTS uploaded_files (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id TEXT NOT NULL,
    name TEXT NOT NULL,
    type TEXT NOT NULL,
    status TEXT DEFAULT 'processing',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 2. Chat History Table
CREATE TABLE IF NOT EXISTS chat_history (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES uploaded_files(id),
    user_id TEXT NOT NULL,
    role TEXT NOT NULL, -- 'user' or 'assistant'
    content TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 3. Media Timestamps Table
CREATE TABLE IF NOT EXISTS media_timestamps (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES uploaded_files(id),
    text TEXT NOT NULL,
    start_time FLOAT NOT NULL,
    end_time FLOAT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 4. Summaries Table
CREATE TABLE IF NOT EXISTS summaries (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    file_id UUID REFERENCES uploaded_files(id),
    summary TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Disable Row Level Security (RLS) for testing
ALTER TABLE uploaded_files DISABLE ROW LEVEL SECURITY;
ALTER TABLE chat_history DISABLE ROW LEVEL SECURITY;
ALTER TABLE media_timestamps DISABLE ROW LEVEL SECURITY;
ALTER TABLE summaries DISABLE ROW LEVEL SECURITY;

-- Note: Policies are disabled when RLS is disabled, 
-- but we'll leave them commented out in the schema file for future reference.
/*
CREATE POLICY "Users can view their own files" ON uploaded_files
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own files" ON uploaded_files
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

CREATE POLICY "Users can update their own files" ON uploaded_files
    FOR UPDATE USING (auth.uid()::text = user_id);

-- Policies for chat_history
CREATE POLICY "Users can view their own chat history" ON chat_history
    FOR SELECT USING (auth.uid()::text = user_id);

CREATE POLICY "Users can insert their own chat history" ON chat_history
    FOR INSERT WITH CHECK (auth.uid()::text = user_id);

-- Policies for media_timestamps (linked via file_id)
CREATE POLICY "Users can view timestamps for their own files" ON media_timestamps
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM uploaded_files 
            WHERE uploaded_files.id = media_timestamps.file_id 
            AND uploaded_files.user_id = auth.uid()::text
        )
    );

-- Policies for summaries (linked via file_id)
CREATE POLICY "Users can view summaries for their own files" ON summaries
    FOR SELECT USING (
        EXISTS (
            SELECT 1 FROM uploaded_files 
            WHERE uploaded_files.id = summaries.file_id 
            AND uploaded_files.user_id = auth.uid()::text
        )
    );
