import { createClient } from '@/lib/supabase/server';
import { sendWelcomeEmail } from '@/lib/email/auth-emails';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    const supabase = await createClient();
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user?.email) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    await sendWelcomeEmail(user.email);

    return NextResponse.json({ message: 'Welcome email sent' });
  } catch {
    return NextResponse.json({ error: 'Failed to send welcome email' }, { status: 500 });
  }
}
