import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Vercel MCP Memory',
  description: 'Custom MCP memory server with semantic search on Vercel',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body style={{ margin: 0, padding: 0 }}>{children}</body>
    </html>
  );
}
