import type { Metadata } from 'next';
import { GeistSans } from 'geist/font/sans';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { GlobalBackground } from '@/components/GlobalBackground';

export const metadata: Metadata = {
  title: "UpnAbove — Rise up. Find work. Go above.",
  description:
    "UpnAbove is a global job marketplace connecting top talent with the world's best employers. Search jobs, build your career, and go above.",
  keywords: ["jobs", "careers", "hiring", "remote work", "job marketplace"],
  metadataBase: new URL("https://upnabove-zeta.vercel.app"),
  verification: {
    google: "_6ky2YebI_Uhfek75-H0VrlreE9bXYm4eEQtraGcasU",
  },
  openGraph: {
    title: "UpnAbove — Rise up. Find work. Go above.",
    description: "A global job marketplace connecting talent with opportunity.",
    url: "https://upnabove-zeta.vercel.app",
    siteName: "UpnAbove",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "UpnAbove — Rise up. Find work. Go above.",
    description: "A global job marketplace connecting talent with opportunity.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${GeistSans.variable} ${GeistMono.variable}`}>
      <body className="font-sans min-h-screen flex flex-col antialiased bg-transparent text-foreground transition-colors duration-300">
        <GlobalBackground />
        
        {/* Subtle noise texture overlay for a physical, premium feel */}
        <div className="fixed inset-0 z-[-10] opacity-[0.04] pointer-events-none mix-blend-overlay">
          <svg className="w-full h-full">
            <filter id="noiseFilter">
              <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
          </svg>
        </div>

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <Navbar />
            <main className="flex-grow pt-24">{children}</main>
            <Footer />
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
