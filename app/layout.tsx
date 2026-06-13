import type { Metadata } from "next";
import { Geist, Geist_Mono, Fraunces } from "next/font/google";
import "./globals.css";
import { ThemeProvider } from "@/components/theme-provider";
import { Toaster } from "@/components/ui/sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
  display: "swap",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
  display: "swap",
});

// Editorial display serif — used for page titles, heroes, marketing headlines.
const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  display: "swap",
});

const description =
  "Modern lunch & member management for private dining clubs — sign-ups, waitlists, venues and wine, without the 2007 clunk.";

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

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} ${fraunces.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
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
