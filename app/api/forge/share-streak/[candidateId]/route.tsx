import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ candidateId: string }> }
) {
  try {
    const { candidateId } = await params;
    const { searchParams } = new URL(request.url);
    const streak = parseInt(searchParams.get('streak') || '7', 10);

    const [interRegular, interBold] = await Promise.all([
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff').then(r => r.arrayBuffer()),
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff').then(r => r.arrayBuffer()),
    ]);

    const supabase = await createClient();
    const { data: candidate } = await supabase
      .from('candidates')
      .select('first_name, last_name')
      .eq('id', candidateId)
      .single();

    if (!candidate) return new Response('Not found', { status: 404 });

    const displayName = `${candidate.first_name} ${candidate.last_name}`;

    // Streak colour theming
    const streakConfig =
      streak >= 30
        ? { label: '30-Day Legend', accent: '#f59e0b', glow: 'rgba(245,158,11,0.35)', emoji: '🏆' }
        : streak >= 14
        ? { label: '14-Day Streak', accent: '#a78bfa', glow: 'rgba(167,139,250,0.35)', emoji: '⚡' }
        : { label: '7-Day Streak', accent: '#f43f5e', glow: 'rgba(244,63,94,0.35)', emoji: '🔥' };

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#09090b',
            backgroundImage:
              `radial-gradient(ellipse 80% 60% at 50% 0%, ${streakConfig.glow} 0%, transparent 70%), linear-gradient(180deg, #09090b 30%, #18181b 100%)`,
            padding: '80px',
            fontFamily: 'Inter',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* Streak badge */}
          <div
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '16px',
              backgroundColor: `${streakConfig.accent}22`,
              border: `2px solid ${streakConfig.accent}55`,
              borderRadius: '50px',
              padding: '16px 36px',
              marginBottom: '48px',
            }}
          >
            <span style={{ fontSize: '36px' }}>{streakConfig.emoji}</span>
            <span style={{ fontSize: '28px', color: streakConfig.accent, fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>
              {streakConfig.label}
            </span>
          </div>

          {/* Big number */}
          <div style={{ display: 'flex', alignItems: 'baseline', gap: '12px', marginBottom: '24px' }}>
            <span
              style={{
                fontSize: '160px',
                fontWeight: 900,
                color: streakConfig.accent,
                lineHeight: 1,
                letterSpacing: '-6px',
                textShadow: `0 0 80px ${streakConfig.glow}`,
              }}
            >
              {streak}
            </span>
            <span style={{ fontSize: '72px', color: '#52525b', fontWeight: 700, alignSelf: 'flex-end', paddingBottom: '16px' }}>
              days
            </span>
          </div>

          {/* Name line */}
          <p style={{ fontSize: '44px', color: '#e4e4e7', margin: 0, fontWeight: 500, textAlign: 'center', lineHeight: 1.3 }}>
            <span style={{ color: 'white', fontWeight: 800 }}>{displayName}</span>
            {' '}hasn't missed a single Forge challenge.
          </p>

          {/* Divider */}
          <div style={{ display: 'flex', width: '200px', height: '2px', background: `${streakConfig.accent}44`, marginTop: '56px', marginBottom: '40px', borderRadius: '2px' }} />

          {/* Branding */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
            <div style={{ display: 'flex', backgroundColor: '#7C3AED', borderRadius: '30px', padding: '10px 24px' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>
                The Forge
              </span>
            </div>
            <span style={{ color: '#3f3f46', fontSize: '22px', fontWeight: 600, letterSpacing: '2px' }}>
              by UpnAbove
            </span>
          </div>
        </div>
      ),
      {
        width: 1200,
        height: 630,
        fonts: [
          { name: 'Inter', data: interRegular, weight: 400, style: 'normal' },
          { name: 'Inter', data: interBold, weight: 800, style: 'normal' },
        ],
      }
    );
  } catch (e: any) {
    console.error('[share-streak OG error]', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
