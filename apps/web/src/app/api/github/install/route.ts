import { verifySession } from '@/lib/api/auth';
import { getAppInstallUrl } from '@/lib/github/client';
import { NextResponse } from 'next/server';

export async function GET() {
  try {
    await verifySession();
    const installUrl = getAppInstallUrl();
    return NextResponse.redirect(installUrl);
  } catch {
    return NextResponse.redirect('/auth/login');
  }
}
