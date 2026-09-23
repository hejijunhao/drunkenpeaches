import type { Metadata, Viewport } from "next";
import { Geist_Mono, Hanken_Grotesk, Newsreader } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const hanken = Hanken_Grotesk({
  variable: "--font-hanken",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

const newsreader = Newsreader({
  variable: "--font-newsreader",
  subsets: ["latin"],
  display: "swap",
  style: ["normal", "italic"],
  axes: ["opsz"],
});

const description =
  "The members' book for private dining clubs — luncheons, the list, the cellar. By invitation.";

export const metadata: Metadata = {
  title: {
    default: "Drunken Peaches",
    template: "%s · Drunken Peaches",
  },
  description,
  applicationName: "Drunken Peaches",
  keywords: [
    "dining club",
    "members club",
    "private club",
    "lunch sign-ups",
    "waitlist",
    "wine",
  ],
  openGraph: {
    title: "Drunken Peaches",
    description,
    siteName: "Drunken Peaches",
    type: "website",
  },
  twitter: {
    card: "summary",
    title: "Drunken Peaches",
    description,
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f6f1e7" },
    { media: "(prefers-color-scheme: dark)", color: "#1c1715" },
  ],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${hanken.variable} ${geistMono.variable} ${newsreader.variable} h-full antialiased`}
    >
      <body className="flex min-h-full flex-col bg-background text-foreground">
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
