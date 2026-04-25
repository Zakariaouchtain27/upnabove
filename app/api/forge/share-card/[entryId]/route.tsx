import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';
import { NextRequest } from 'next/server';

export const runtime = 'edge';

async function loadInterFont(weight: 400 | 700 | 900) {
  const url = `https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuLyfAZ9hiJ-Ek-_EeA.woff`;
  const res = await fetch(url);
  return res.arrayBuffer();
}

export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ entryId: string }> }
) {
  try {
    const { entryId } = await params;
    const [interRegular, interBold] = await Promise.all([
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuI6fAZ9hiJ-Ek-_EeA.woff').then(r => r.arrayBuffer()),
      fetch('https://fonts.gstatic.com/s/inter/v13/UcCO3FwrK3iLTeHuS_fvQtMwCp50KnMw2boKoduKmMEVuFuYAZ9hiJ-Ek-_EeA.woff').then(r => r.arrayBuffer()),
    ]);

    const supabase = await createClient();

    const { data: entry } = await supabase
      .from('forge_entries')
      .select(`
         codename, vote_count, rank, ai_score, is_revealed,
         forge_challenges ( title, difficulty ),
         candidates ( first_name, last_name )
      `)
      .eq('id', entryId)
      .single();

    if (!entry) {
      return new ImageResponse(
        (
          <div style={{ display: 'flex', width: '100%', height: '100%', background: '#09090b', color: 'white', alignItems: 'center', justifyContent: 'center', fontFamily: 'Inter' }}>
            <p style={{ fontSize: 48, color: '#71717a' }}>Entry Not Found</p>
          </div>
        ),
        { width: 1200, height: 630, fonts: [{ name: 'Inter', data: interRegular, weight: 400 }] }
      );
    }

    const challenge = entry.forge_challenges as any;
    const candidate = entry.candidates as any;
    const isRevealed = entry.is_revealed;
    const displayName = isRevealed && candidate
      ? `${candidate.first_name} ${candidate.last_name}`
      : entry.codename;

    const formatRank = (rank: number) => {
      if (!rank) return 'Unranked';
      const r = rank % 10, j = rank % 100;
      if (r === 1 && j !== 11) return rank + 'st';
      if (r === 2 && j !== 12) return rank + 'nd';
      if (r === 3 && j !== 13) return rank + 'rd';
      return rank + 'th';
    };

    return new ImageResponse(
      (
        <div
          style={{
            display: 'flex',
            flexDirection: 'column',
            width: '100%',
            height: '100%',
            backgroundColor: '#09090b',
            backgroundImage: 'linear-gradient(135deg, #09090b 35%, #2e1065 100%)',
            padding: '72px 80px',
            fontFamily: 'Inter',
          }}
        >
          {/* Top bar */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '48px' }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '16px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', backgroundColor: '#22C55E' }} />
              <span style={{ color: '#22C55E', fontSize: '22px', fontWeight: 700, letterSpacing: '3px', textTransform: 'uppercase' }}>
                Live Arena
              </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', backgroundColor: '#7C3AED', borderRadius: '40px', padding: '12px 28px' }}>
              <span style={{ color: 'white', fontSize: '22px', fontWeight: 800, letterSpacing: '3px', textTransform: 'uppercase' }}>
                The Forge
              </span>
            </div>
          </div>

          {/* Challenge title */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, justifyContent: 'center', gap: '16px' }}>
            <span style={{ fontSize: '22px', color: '#6d28d9', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '4px' }}>
              {challenge?.difficulty?.toUpperCase() || 'CHALLENGE'}
            </span>
            <h1 style={{ fontSize: '76px', fontWeight: 900, color: 'white', margin: 0, lineHeight: 1.05, letterSpacing: '-2px' }}>
              {challenge?.title || 'Unknown Arena'}
            </h1>
            <p style={{ fontSize: '40px', color: '#a1a1aa', margin: 0, fontWeight: 400, marginTop: '8px' }}>
              Ghost:{' '}
              <span style={{ color: isRevealed ? '#a78bfa' : '#f43f5e', fontWeight: 800 }}>
                {displayName}
              </span>
              {isRevealed && (
                <span style={{ marginLeft: '20px', fontSize: '26px', color: '#10b981', fontWeight: 700, background: 'rgba(16,185,129,0.12)', padding: '6px 18px', borderRadius: '20px' }}>
                  ✓ Revealed
                </span>
              )}
            </p>
          </div>

          {/* Divider */}
          <div style={{ display: 'flex', width: '100%', height: '2px', background: 'linear-gradient(90deg, rgba(124,58,237,0.6) 0%, rgba(255,255,255,0.05) 100%)', marginBottom: '40px' }} />

          {/* Stats row */}
          <div style={{ display: 'flex', gap: '80px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '20px', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Rank</span>
              <span style={{ fontSize: '60px', color: 'white', fontWeight: 900, lineHeight: 1 }}>
                {formatRank(entry.rank || 0)}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '20px', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>Votes</span>
              <span style={{ fontSize: '60px', color: '#f43f5e', fontWeight: 900, lineHeight: 1 }}>
                {entry.vote_count ?? 0}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
              <span style={{ fontSize: '20px', color: '#52525b', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '2px' }}>AI Score</span>
              <span style={{ fontSize: '60px', color: '#3b82f6', fontWeight: 900, lineHeight: 1 }}>
                {entry.ai_score ?? 0}
                <span style={{ fontSize: '30px', color: '#60a5fa' }}>/100</span>
              </span>
            </div>

            {/* Spacer + UpnAbove branding */}
            <div style={{ display: 'flex', flex: 1, justifyContent: 'flex-end', alignItems: 'flex-end' }}>
              <span style={{ fontSize: '22px', color: '#3f3f46', fontWeight: 600, letterSpacing: '2px' }}>
                upnabove.com
              </span>
            </div>
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
    console.error('[share-card OG error]', e);
    return new Response('Failed to generate image', { status: 500 });
  }
}
