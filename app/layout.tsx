import type { Metadata, Viewport } from 'next';
import { Inter } from 'next/font/google';
import { GeistMono } from 'geist/font/mono';
import './globals.css';
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';
import { ThemeProvider } from '@/components/ThemeProvider';
import { ToastProvider } from '@/components/ui/Toast';
import { GlobalBackground } from '@/components/GlobalBackground';
import { NuqsAdapter } from 'nuqs/adapters/next/app';

const inter = Inter({
  subsets: ['latin'],
  weight: ['300', '400', '500', '600', '700', '800', '900'],
  variable: '--font-inter',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  viewportFit: 'cover',
  themeColor: '#050a14',
};

export const metadata: Metadata = {
  title: "upNabove — Rise up. Find work. Go above.",
  description:
    "upNabove is a global job marketplace connecting top talent with the world's best employers. Search jobs, build your career, and go above.",
  keywords: ["jobs", "careers", "hiring", "remote work", "job marketplace"],
  metadataBase: new URL("https://upnabove-zeta.vercel.app"),
  verification: {
    google: "_6ky2YebI_Uhfek75-H0VrlreE9bXYm4eEQtraGcasU",
  },
  openGraph: {
    title: "upNabove — Rise up. Find work. Go above.",
    description: "A global job marketplace connecting talent with opportunity.",
    url: "https://upnabove-zeta.vercel.app",
    siteName: "upNabove",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "upNabove — Rise up. Find work. Go above.",
    description: "A global job marketplace connecting talent with opportunity.",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning className={`dark ${inter.variable} ${GeistMono.variable}`}>
      <body className="font-sans min-h-screen flex flex-col antialiased bg-transparent text-foreground transition-colors duration-300">
        <GlobalBackground />

        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          forcedTheme="dark"
          enableSystem={false}
          disableTransitionOnChange
        >
          <ToastProvider>
            <NuqsAdapter>
              <Navbar />
              <main className="flex-grow">{children}</main>
              <Footer />
            </NuqsAdapter>
          </ToastProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
