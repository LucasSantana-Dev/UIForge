import { NextResponse } from 'next/server';
import { getCatalogStats } from '@/lib/services/catalog.service';

export async function GET() {
  const stats = await getCatalogStats();
  return NextResponse.json(stats);
}
