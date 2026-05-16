import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SilentIntent — Treasury Proof Console',
  description: 'Confidential spend authorization for AI agents. Disclose by exception.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
