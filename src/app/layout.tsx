import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'Neuro Memory Trainer',
  description:
    'Single-player memory training experience leveraging evidence-based cognitive techniques.',
};

type RootLayoutProps = {
  children: React.ReactNode;
};

export default function RootLayout({ children }: RootLayoutProps) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className="min-h-screen bg-slate-950 text-slate-50 antialiased">
        {children}
      </body>
    </html>
  );
}
