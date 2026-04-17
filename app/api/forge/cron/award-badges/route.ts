import { NextResponse } from 'next/server';
import { awardSystemBadges } from '@/lib/forge';

export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization');
  if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
    return new NextResponse('Unauthorized', { status: 401 });
  }

  try {
    const result = await awardSystemBadges();
    return NextResponse.json(result);
  } catch (error: any) {
    console.error('[CRON AWARD BADGES]', error);
    return new NextResponse(error.message || 'Internal Server Error', { status: 500 });
  }
}
