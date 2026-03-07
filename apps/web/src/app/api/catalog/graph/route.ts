import { NextResponse } from 'next/server';
import { getCatalogGraph } from '@/lib/services/catalog.service';

export async function GET() {
  const graph = await getCatalogGraph();
  return NextResponse.json(graph);
}
