import type { Metadata } from "next";
import { Geist_Mono, Plus_Jakarta_Sans, Raleway } from "next/font/google";
import { QueryProvider } from "@/components/providers/query-provider";
import { AppToaster } from "@/components/providers/app-toaster";
import "./globals.css";
import { cn } from "@/lib/utils";

const raleway = Raleway({ subsets: ["latin"], variable: "--font-sans" });

const plusJakarta = Plus_Jakarta_Sans({
  subsets: ["latin"],
  variable: "--font-display",
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "LivePoll | Real-time Quizzes & Polling",
  description:
    "Create live quiz sessions, join with a room code, and compete in real time.",
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html
      lang="en"
      className={cn(
        "h-full antialiased font-sans",
        geistMono.variable,
        plusJakarta.variable,
        raleway.variable,
      )}
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
