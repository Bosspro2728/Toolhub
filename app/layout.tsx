import './globals.css';
import type { Metadata } from 'next';
import { ThemeProvider } from '@/components/layout/theme-provider';
import MainLayout from '@/components/layout/main-layout';
import { Toaster } from '@/components/ui/sonner';
export const dynamic = 'force-dynamic';
export const metadata: Metadata = {
  title: 'ToolHub - Online Services Platform',
  description: 'A comprehensive platform offering various online tools and services',
};

export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body>
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem>
          <MainLayout>{children}</MainLayout>
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}