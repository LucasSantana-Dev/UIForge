import { verifySession } from '@/lib/api/auth';
import { createClient } from '@/lib/supabase/server';
import { successResponse, errorResponse } from '@/lib/api/response';
import type { APIError } from '@/lib/api/errors';
import { apiErrorResponse } from '@/lib/api/response';

export async function POST() {
  try {
    const { user } = await verifySession();
    const supabase = await createClient();
    const completedAt = new Date().toISOString();

    const { error } = await supabase.from('profiles').upsert(
      {
        id: user.id,
        onboarding_completed_at: completedAt,
      },
      { onConflict: 'id' }
    );

    if (error) {
      return errorResponse('Failed to complete onboarding', 500);
    }

    return successResponse({ completed: true });
  } catch (err) {
    if ((err as APIError).statusCode) {
      return apiErrorResponse(err as APIError);
    }
    return errorResponse('An unexpected error occurred', 500);
  }
}
