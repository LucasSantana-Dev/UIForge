import { OFFICIAL_GOLDEN_PATHS } from '../src/lib/governance/official-golden-paths.ts';
import { createServiceRoleClient } from './sync-helpers.ts';

const SYNC_CONTEXT = 'golden paths synchronization';

async function main() {
  const supabase = createServiceRoleClient(SYNC_CONTEXT);

  const payload = OFFICIAL_GOLDEN_PATHS.map((item) => ({
    name: item.name,
    display_name: item.display_name,
    description: item.description,
    type: item.type,
    lifecycle: item.lifecycle,
    framework: item.framework,
    language: item.language,
    stack: item.stack,
    tags: item.tags,
    parameters: item.parameters,
    steps: item.steps,
    is_official: item.is_official,
    includes_ci: item.includes_ci,
    includes_testing: item.includes_testing,
    includes_linting: item.includes_linting,
    includes_monitoring: item.includes_monitoring,
    includes_docker: item.includes_docker,
    catalog_type: item.catalog_type,
    catalog_lifecycle: item.catalog_lifecycle,
    icon: item.icon,
    metadata: {},
  }));

  const { data, error } = await supabase
    .from('golden_path_templates')
    .upsert(payload, { onConflict: 'name' })
    .select('id, name, updated_at');

  if (error) {
    throw new Error(`Golden paths sync failed: ${error.message}`);
  }

  console.log(`Synced ${data?.length ?? 0} official golden paths.`);
  for (const row of data ?? []) {
    console.log(`- ${row.name} (${row.id})`);
  }
}

try {
  await main();
} catch (error) {
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
