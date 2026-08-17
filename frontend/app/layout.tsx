import type { Metadata } from "next";
import { Geist, Geist_Mono, Raleway } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import "./globals.css";
import { cn } from "@/lib/utils";

const raleway = Raleway({subsets:['latin'],variable:'--font-sans'});

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LivePoll — Real-time Quizzes & Polling",
  description:
    "Create live quiz sessions, join with a room code, and compete in real time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn("h-full antialiased font-sans", geistSans.variable, geistMono.variable, raleway.variable)}
    >
      <body className="min-h-full flex flex-col font-sans">
        <QueryProvider>
          {children}
          <AppToaster />
        </QueryProvider>
      </body>
    </html>
  );
}
