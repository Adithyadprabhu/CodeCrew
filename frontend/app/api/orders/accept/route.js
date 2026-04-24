import { NextResponse } from 'next/server';

/**
 * POST /api/orders/accept
 * Body: { orderId: string, status: 'accepted' | 'rejected' }
 *
 * In a real backend this would update a database and emit a WebSocket event.
 * Here we return a structured notification payload so the client can persist it.
 */
export async function POST(request) {
  try {
    const body = await request.json();
    const { orderId, status, sellerName, material, buyerId } = body;

    if (!orderId || !status) {
      return NextResponse.json({ error: 'orderId and status are required' }, { status: 400 });
    }

    const validStatuses = ['accepted', 'rejected'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Build the notification payload
    const notification = {
      orderId,
      buyerId: buyerId || 'buyer123',
      message:
        status === 'accepted'
          ? `Your order for ${material || 'material'} has been accepted by ${sellerName || 'the seller'}`
          : `Your order for ${material || 'material'} was declined by ${sellerName || 'the seller'}`,
      type: 'order',
      status,
      sellerName: sellerName || 'EcoCycle Seller',
      material: material || 'Material',
      timestamp: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      orderId,
      status,
      notification,
    });
  } catch {
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
