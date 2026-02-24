import { NextResponse } from 'next/server';
import { verifyWebhookSignature, processWebhookEvent } from '@/lib/stripe/webhooks';

export async function POST(request: Request) {
  try {
    const body = await request.text();
    const signature = request.headers.get('stripe-signature');

    if (!signature) {
      return NextResponse.json({ error: 'Missing signature' }, { status: 400 });
    }

    const event = await verifyWebhookSignature(body, signature);
    await processWebhookEvent(event);

    return NextResponse.json({ received: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Webhook processing failed';
    return NextResponse.json({ error: message }, { status: 400 });
  }
}
