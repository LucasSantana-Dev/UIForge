ALTER TABLE plan_limits DROP CONSTRAINT IF EXISTS plan_limits_plan_check;
ALTER TABLE plan_limits ADD CONSTRAINT plan_limits_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'enterprise'));

ALTER TABLE subscriptions DROP CONSTRAINT IF EXISTS subscriptions_plan_check;
ALTER TABLE subscriptions ADD CONSTRAINT subscriptions_plan_check
  CHECK (plan IN ('free', 'pro', 'team', 'enterprise'));

INSERT INTO plan_limits (plan, generations_per_month, max_projects, max_components_per_project, features)
VALUES (
  'team',
  2500,
  -1,
  -1,
  '{"seats": 5, "shared_projects": true, "usage_dashboard": true, "template_sharing": true, "team_management": true}'::jsonb
) ON CONFLICT (plan) DO NOTHING;
