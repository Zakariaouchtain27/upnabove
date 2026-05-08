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

const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL ?? "https://upnabove.work";

export const metadata: Metadata = {
  metadataBase: new URL(BASE_URL),

  title: {
    default: "upNabove — Rise up. Find work. Go above.",
    template: "%s | upNabove",
  },
  description:
    "upNabove is a global tech job marketplace and skills arena. Search thousands of remote & on-site engineering, design, and product jobs. Prove your skills in live coding challenges and get hired.",
  keywords: [
    "tech jobs",
    "software engineer jobs",
    "remote developer jobs",
    "coding challenges",
    "developer job board",
    "programming jobs",
    "startup jobs",
    "hire developers",
    "job marketplace",
  ],
  authors: [{ name: "upNabove", url: BASE_URL }],
  applicationName: "upNabove",
  creator: "upNabove",
  publisher: "upNabove",

  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-snippet": -1,
      "max-image-preview": "large",
      "max-video-preview": -1,
    },
  },

  alternates: {
    canonical: BASE_URL,
  },

  verification: {
    google: "_6ky2YebI_Uhfek75-H0VrlreE9bXYm4eEQtraGcasU",
  },

  openGraph: {
    title: "upNabove — Rise up. Find work. Go above.",
    description:
      "Find your next tech role or prove your skills in live coding challenges. The job board built for developers.",
    url: BASE_URL,
    siteName: "upNabove",
    type: "website",
    locale: "en_US",
    images: [
      {
        url: `${BASE_URL}/og-image.png`,
        width: 1200,
        height: 630,
        alt: "upNabove — Tech Jobs & Coding Challenges",
      },
    ],
  },

  twitter: {
    card: "summary_large_image",
    title: "upNabove — Rise up. Find work. Go above.",
    description:
      "Find your next tech role or prove your skills in live coding challenges.",
    images: [`${BASE_URL}/og-image.png`],
    creator: "@upnabove",
    site: "@upnabove",
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
