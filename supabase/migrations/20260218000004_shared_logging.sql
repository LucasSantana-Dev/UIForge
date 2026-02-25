-- Create shared logging table for all Siza ecosystem projects

CREATE EXTENSION IF NOT EXISTS pg_trgm;

CREATE TABLE IF NOT EXISTS shared_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    service_name VARCHAR(50) NOT NULL,
    service_version VARCHAR(20),
    environment VARCHAR(20) NOT NULL,
    level VARCHAR(10) NOT NULL,
    message TEXT NOT NULL,
    context JSONB,
    correlation_id UUID,
    user_id UUID,
    session_id UUID,
    request_id VARCHAR(255),
    trace_id VARCHAR(255),
    span_id VARCHAR(255),
    tags JSONB,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_shared_logs_timestamp ON shared_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_shared_logs_service_name ON shared_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_shared_logs_level ON shared_logs(level);
CREATE INDEX IF NOT EXISTS idx_shared_logs_correlation_id ON shared_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_trace_id ON shared_logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_user_id ON shared_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_session_id ON shared_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_request_id ON shared_logs(request_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_context_service ON shared_logs USING GIN ((context->>'service_name') gin_trgm_ops);
CREATE INDEX IF NOT EXISTS idx_shared_logs_tags_service ON shared_logs USING GIN ((tags->>'service_name') gin_trgm_ops);

ALTER TABLE shared_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Service role full access to shared_logs"
  ON shared_logs FOR ALL
  TO service_role
  USING (true);

CREATE POLICY "Authenticated users can read shared_logs"
  ON shared_logs FOR SELECT
  TO authenticated
  USING (true);

CREATE POLICY "Authenticated users can insert shared_logs"
  ON shared_logs FOR INSERT
  TO authenticated
  WITH CHECK (true);
