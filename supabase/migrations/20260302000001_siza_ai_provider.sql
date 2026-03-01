-- Add Siza AI routing metadata to generations table
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS routed_provider TEXT,
  ADD COLUMN IF NOT EXISTS routing_reason TEXT;

COMMENT ON COLUMN generations.routed_provider IS 'The actual provider used when Siza AI routes the request';
COMMENT ON COLUMN generations.routing_reason IS 'Why Siza AI chose this provider (default, vision, quality, free-tier, quota-fallback)';
