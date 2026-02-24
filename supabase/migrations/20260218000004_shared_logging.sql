-- Create shared logging table for all Siza ecosystem projects
-- This table will store structured logs from all services with service identification

CREATE TABLE IF NOT EXISTS shared_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    timestamp TIMESTAMPTZ DEFAULT NOW(),
    service_name VARCHAR(50) NOT NULL, -- Service that generated the log (mcp-gateway, siza-mcp, siza-webapp)
    service_version VARCHAR(20), -- Version of the service
    environment VARCHAR(20) NOT NULL, -- Environment (development, staging, production)
    level VARCHAR(10) NOT NULL, -- Log level (trace, debug, info, warn, error, fatal)
    message TEXT NOT NULL, -- Log message
    context JSONB, -- Additional context data
    correlation_id UUID, -- Correlation ID for request tracing
    user_id UUID, -- User identifier if available
    session_id UUID, -- Session identifier if available
    request_id VARCHAR(255), -- Request identifier
    trace_id VARCHAR(255), -- Sentry trace ID
    span_id VARCHAR(255), -- Sentry span ID
    tags JSONB, -- Additional tags for filtering
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for optimal performance
CREATE INDEX IF NOT EXISTS idx_shared_logs_timestamp ON shared_logs(timestamp DESC);
CREATE INDEX IF NOT EXISTS idx_shared_logs_service_name ON shared_logs(service_name);
CREATE INDEX IF NOT EXISTS idx_shared_logs_level ON shared_logs(level);
CREATE INDEX IF NOT EXISTS idx_shared_logs_correlation_id ON shared_logs(correlation_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_trace_id ON shared_logs(trace_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_user_id ON shared_logs(user_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_session_id ON shared_logs(session_id);
CREATE INDEX IF NOT EXISTS idx_shared_logs_request_id ON shared_logs(request_id);

-- Create indexes for JSONB fields for better query performance
CREATE INDEX IF NOT EXISTS idx_shared_logs_context_service ON shared_logs USING GIN ((context->>'service_name') gin_trgm_ops_ops);
CREATE INDEX IF NOT EXISTS idx_shared_logs_tags_service ON shared_logs USING GIN ((tags->>'service_name') gin_trgm_ops_ops);

-- Enable Row Level Security (RLS) for shared logs
ALTER TABLE shared_logs ENABLE ROW LEVEL SECURITY;

-- Create policy for shared logs
CREATE POLICY shared_logs_policy ON shared_logs FOR ALL USING (
    PERFORM (authentication.check(uid(), 'logged_in') OR (EXISTS (
        SELECT 1 FROM project_members WHERE user_id = uid()
    ))
);

-- Create policy for service-specific access
CREATE POLICY service_logs_policy ON shared_logs FOR ALL USING (
    PERFORM (authentication.check(uid(), 'logged_in') OR (EXISTS (
        SELECT 1 FROM project_members WHERE user_id = uid()
    )) AND (service_name = current_setting('app.current_service_name', 'unknown'))
);

-- Grant permissions
GRANT ALL ON shared_logs TO authenticated;
GRANT ALL ON shared_logs TO service_role;
GRANT SELECT ON shared_logs TO authenticated;
GRANT SELECT ON shared_logs TO service_role;
GRANT UPDATE ON shared_logs TO authenticated;
GRANT INSERT ON shared_logs TO authenticated;
GRANT UPDATE ON shared_logs TO service_role;
GRANT USAGE ON shared_logs TO authenticated;
GRANT USAGE ON shared_logs TO service_role;

-- Comments
COMMENT ON TABLE shared_logs IS 'Shared logging table for Siza ecosystem';
COMMENT ON COLUMN shared_logs.service_name IS 'Name of the service that generated the log';
COMMENT ON COLUMN shared_logs.correlation_id IS 'Correlation ID for request tracing across services';
COMMENT ON COLUMN shared_logs.trace_id IS 'Sentry trace ID for distributed tracing';
COMMENT ON COLUMN shared_logs.span_id IS 'Sentry span ID for operation tracing';
COMMENT ON COLUMN shared_logs.context IS 'Additional structured context data as JSON';
COMMENT ON COLUMN shared_logs.tags IS 'Tags for filtering and categorization';