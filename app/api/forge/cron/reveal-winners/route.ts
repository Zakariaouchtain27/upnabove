import { NextResponse } from 'next/server';
import { processWinnerReveals } from '@/lib/forge';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const revealed = await processWinnerReveals();
    return NextResponse.json({ success: true, revealedCount: revealed?.length || 0 });
  } catch (error: any) {
    console.error('[CRON REVEAL WINNERS]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
