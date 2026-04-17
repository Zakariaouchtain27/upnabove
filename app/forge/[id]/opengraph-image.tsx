import { ImageResponse } from 'next/og';
import { createClient } from '@/lib/supabase/server';

// Route segment config
export const runtime = 'edge';

// Image metadata
export const alt = 'The Forge Arena | UpnAbove';
export const size = {
  width: 1200,
  height: 630,
};

export const contentType = 'image/png';

// Image generation
export default async function Image({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = await params;
  const supabase = await createClient();
  
  // Fetch challenge title nicely
  const { data: challenge } = await supabase
    .from('forge_challenges')
    .select('title, status')
    .eq('id', resolvedParams.id)
    .single();

  const title = challenge?.title || 'Unknown Drop';
  const status = challenge?.status ? challenge.status.toUpperCase() : 'UNKNOWN';

  return new ImageResponse(
    (
      <div
        style={{
          height: '100%',
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: '#05050A',
          backgroundImage: 'radial-gradient(circle at 20% 0%, rgba(124, 58, 237, 0.4) 0%, transparent 60%)',
          position: 'relative',
        }}
      >
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          gap: '12px',
          padding: '8px 24px',
          borderRadius: '999px',
          backgroundColor: 'rgba(124, 58, 237, 0.1)',
          border: '1px solid rgba(124, 58, 237, 0.3)',
          marginBottom: '32px',
        }}>
           <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="#7C3AED" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m15 12-8.5 8.5c-.83.83-2.17.83-3 0 0 0 0 0 0 0a2.12 2.12 0 0 1 0-3L12 9"/><path d="M17.64 15 22 10.64"/><path d="m20.91 11.7-1.25-1.25c-.6-.6-.93-1.4-.93-2.25v-.86L16 4.6V3.86a3.17 3.17 0 0 0-.93-2.25L13.8 3.8l-1.25 1.25"/><path d="m11.23 8.35-1.25-1.25c-.6-.6-1.4-.93-2.25-.93H6.87L4.13 8.91"/></svg>
           <span style={{ color: '#7C3AED', fontSize: 18, fontWeight: 'bold', textTransform: 'uppercase', letterSpacing: '4px' }}>THE FORGE ARENA</span>
        </div>

        <h1 style={{
          fontSize: 80,
          fontWeight: 900,
          color: 'white',
          textAlign: 'center',
          maxWidth: '900px',
          lineHeight: 1.1,
          fontFamily: 'system-ui, -apple-system, sans-serif',
          margin: 0,
          padding: 0,
        }}>
          {title}
        </h1>

        <div style={{
           display: 'flex',
           alignItems: 'center',
           marginTop: '60px',
           gap: '16px'
        }}>
           <div style={{ width: 12, height: 12, borderRadius: '50%', backgroundColor: status === 'LIVE' ? '#F43F5E' : '#7C3AED' }} />
           <span style={{ color: 'rgba(255, 255, 255, 0.7)', fontSize: 24, fontWeight: 'bold', letterSpacing: '8px' }}>STATUS: {status}</span>
        </div>
      </div>
    ),
    {
      ...size,
    }
  );
}
