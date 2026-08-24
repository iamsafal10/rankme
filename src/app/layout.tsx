import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: 'RankMe | SDE Resume Race',
  description: 'Are you the fast-moving Hare or the slow-and-steady Tortoise? Drop your resume, join the anonymous leaderboard, and let the community decide.',
  openGraph: {
    title: 'RankMe | SDE Resume Race',
    description: 'Are you the fast-moving Hare or the slow-and-steady Tortoise? Drop your resume, join the anonymous leaderboard, and let the community decide.',
    siteName: 'RankMe',
    locale: 'en_US',
    type: 'website',
  },
};

import { IdentifyVisitor } from "@/components/IdentifyVisitor";

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <IdentifyVisitor />
        {children}
      </body>
    </html>
  );
}
