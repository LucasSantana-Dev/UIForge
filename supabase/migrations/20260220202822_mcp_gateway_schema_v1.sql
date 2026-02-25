-- MCP Gateway Schema Setup
-- Create dedicated schema for MCP Gateway tables in existing UIForge Supabase project

-- Create MCP Gateway schema
CREATE SCHEMA mcp_gateway;

-- Virtual Servers Configuration
CREATE TABLE mcp_gateway.virtual_servers (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL UNIQUE,
  description text,
  tools jsonb NOT NULL DEFAULT '[]'::jsonb,
  config jsonb NOT NULL DEFAULT '{}'::jsonb,
  is_active boolean DEFAULT true,
  created_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now())
);

-- Tool Registry
CREATE TABLE mcp_gateway.tools (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  name text NOT NULL,
  server_name text NOT NULL,
  description text,
  metadata jsonb DEFAULT '{}'::jsonb,
  is_available boolean DEFAULT true,
  last_seen timestamp with time zone,
  created_at timestamp with time zone DEFAULT now()
);

-- Service Metrics
CREATE TABLE mcp_gateway.service_metrics (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  service_name text NOT NULL,
  metric_type text NOT NULL,
  value numeric NOT NULL,
  timestamp timestamp with time zone DEFAULT now(),
  metadata jsonb DEFAULT '{}'::jsonb
);

-- Gateway Configuration
CREATE TABLE mcp_gateway.gateway_config (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  config_key text NOT NULL UNIQUE,
  config_value jsonb NOT NULL,
  description text,
  updated_at timestamp with time zone DEFAULT timezone('utc'::text, now()),
  updated_by uuid references auth.users(id)
);

-- Auth Tokens for Gateway
CREATE TABLE mcp_gateway.auth_tokens (
  id uuid DEFAULT gen_random_uuid() PRIMARY KEY,
  token_hash text NOT NULL UNIQUE,
  user_id uuid NOT NULL,
  expires_at timestamp with time zone NOT NULL,
  permissions jsonb DEFAULT '[]'::jsonb,
  created_at timestamp with time zone DEFAULT now(),
  last_used timestamp with time zone,
  FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Indexes for performance
CREATE INDEX idx_virtual_servers_name ON mcp_gateway.virtual_servers (name);
CREATE INDEX idx_virtual_servers_active ON mcp_gateway.virtual_servers (is_active) WHERE is_active = true;
CREATE INDEX idx_tools_server_name ON mcp_gateway.tools (server_name);
CREATE INDEX idx_tools_available ON mcp_gateway.tools (is_available) WHERE is_available = true;
CREATE INDEX idx_service_metrics_service_type ON mcp_gateway.service_metrics (service_name, metric_type);
CREATE INDEX idx_service_metrics_timestamp ON mcp_gateway.service_metrics (timestamp DESC);
CREATE INDEX idx_auth_tokens_user_id ON mcp_gateway.auth_tokens (user_id);
CREATE INDEX idx_auth_tokens_expires_at ON mcp_gateway.auth_tokens (expires_at);

-- Comments
COMMENT ON SCHEMA mcp_gateway IS 'MCP Gateway database schema';
COMMENT ON TABLE mcp_gateway.virtual_servers IS 'Virtual server configurations for tool collections';
COMMENT ON TABLE mcp_gateway.tools IS 'Registry of available MCP tools and their metadata';
COMMENT ON TABLE mcp_gateway.service_metrics IS 'Performance and usage metrics for gateway services';
COMMENT ON TABLE mcp_gateway.gateway_config IS 'Gateway configuration settings';
COMMENT ON TABLE mcp_gateway.auth_tokens IS 'Authentication tokens for API access';;
