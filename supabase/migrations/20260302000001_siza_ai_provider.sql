-- Add 'siza' as a valid AI provider and track routing decisions

-- Update the generations provider check constraint
ALTER TABLE generations
  DROP CONSTRAINT IF EXISTS generations_ai_provider_check;

ALTER TABLE generations
  ADD CONSTRAINT generations_ai_provider_check
  CHECK (ai_provider IN ('openai', 'anthropic', 'google', 'siza'));

-- Add routing tracking columns
ALTER TABLE generations
  ADD COLUMN IF NOT EXISTS routed_provider text,
  ADD COLUMN IF NOT EXISTS routing_reason text;

-- Constraint for routing reason values
ALTER TABLE generations
  ADD CONSTRAINT generations_routing_reason_check
  CHECK (
    routing_reason IS NULL
    OR routing_reason IN ('default', 'vision', 'quality', 'free-tier', 'quota-fallback')
  );

-- Constraint for routed provider values
ALTER TABLE generations
  ADD CONSTRAINT generations_routed_provider_check
  CHECK (
    routed_provider IS NULL
    OR routed_provider IN ('openai', 'anthropic', 'google')
  );

-- Index for siza routing analytics
CREATE INDEX IF NOT EXISTS idx_generations_siza_routing
  ON generations (ai_provider, routing_reason)
  WHERE ai_provider = 'siza';
