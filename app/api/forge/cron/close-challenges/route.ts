import { NextResponse } from 'next/server';
import { closeExpiredChallenges } from '@/lib/forge';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const updated = await closeExpiredChallenges();
    return NextResponse.json({ success: true, closedCount: updated?.length || 0 });
  } catch (error: any) {
    console.error('[CRON CLOSE CHALLENGES]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
