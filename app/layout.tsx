import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { BottomNavigation } from "@/app/components/BottomNavigation";
import { TopNavigation } from "@/app/components/TopNavigation";
import { ThemeProvider } from "@/app/components/ThemeProvider";
import { createClient } from "@/utils/supabase/server";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Money Log MVP",
  description: "Personal finance tracking for the rest of us.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const supabase = await createClient()
  const { data: { user } } = await supabase.auth.getUser()

  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-50 text-gray-900 min-h-screen flex flex-col`}
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          <TopNavigation userEmail={user?.email} />
          <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 pb-24 pt-24">
            {children}
          </main>
          <BottomNavigation />
        </ThemeProvider>
      </body>
    </html>
  );
}
