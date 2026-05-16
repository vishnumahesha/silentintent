import type { Metadata } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'SilentIntent — Treasury Proof Console',
  description: 'Confidential spend authorization for AI agents. Private policy in. Public authorization out.',
  openGraph: {
    title: 'SilentIntent — Treasury Proof Console',
    description: 'Confidential spend authorization for AI agents.',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'SilentIntent — Treasury Proof Console',
    description: 'Confidential spend authorization for AI agents.',
  },
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
