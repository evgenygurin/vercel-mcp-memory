-- Enable pgvector extension for vector similarity search
CREATE EXTENSION IF NOT EXISTS vector;

-- Create memories table with vector embeddings
CREATE TABLE IF NOT EXISTS memories (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    content TEXT NOT NULL,
    embedding vector(1536),  -- OpenAI text-embedding-3-small dimensions
    metadata JSONB DEFAULT '{}',
    user_id TEXT DEFAULT 'default',
    category TEXT,
    created_at TIMESTAMP DEFAULT NOW(),
    updated_at TIMESTAMP DEFAULT NOW()
);

-- Index for fast semantic search using cosine similarity
-- ivfflat is optimized for approximate nearest neighbor search
CREATE INDEX IF NOT EXISTS memories_embedding_idx
ON memories
USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);

-- Full-text search index for fallback text search (supports Russian)
CREATE INDEX IF NOT EXISTS memories_content_fts_idx
ON memories
USING gin(to_tsvector('russian', content));

-- Indexes for filtering
CREATE INDEX IF NOT EXISTS memories_category_idx ON memories(category);
CREATE INDEX IF NOT EXISTS memories_user_idx ON memories(user_id);
CREATE INDEX IF NOT EXISTS memories_created_at_idx ON memories(created_at DESC);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to auto-update updated_at on row modification
CREATE TRIGGER update_memories_updated_at
BEFORE UPDATE ON memories
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Create a view for memory stats
CREATE OR REPLACE VIEW memory_stats AS
SELECT
    COUNT(*) as total_memories,
    COUNT(DISTINCT category) as total_categories,
    COUNT(DISTINCT user_id) as total_users,
    MIN(created_at) as oldest_memory,
    MAX(created_at) as newest_memory
FROM memories;
