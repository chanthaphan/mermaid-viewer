import type { Metadata } from 'next';
import { Sarabun, Prompt, Kanit, IBM_Plex_Sans_Thai, Noto_Sans_Thai, Chakra_Petch } from 'next/font/google';
import './globals.css';

const sarabun = Sarabun({ subsets: ['thai', 'latin'], weight: ['400', '600'], variable: '--font-sarabun', display: 'swap' });
const prompt = Prompt({ subsets: ['thai', 'latin'], weight: ['400', '600'], variable: '--font-prompt', display: 'swap' });
const kanit = Kanit({ subsets: ['thai', 'latin'], weight: ['400', '600'], variable: '--font-kanit', display: 'swap' });
const ibmPlexThai = IBM_Plex_Sans_Thai({ subsets: ['thai'], weight: ['400', '600'], variable: '--font-ibm-plex-thai', display: 'swap' });
const notoSansThai = Noto_Sans_Thai({ subsets: ['thai'], weight: ['400', '600'], variable: '--font-noto-sans-thai', display: 'swap' });
const chakraPetch = Chakra_Petch({ subsets: ['thai', 'latin'], weight: ['400', '600'], variable: '--font-chakra-petch', display: 'swap' });

export const metadata: Metadata = {
  title: 'Mermaid Viewer',
  description: 'Live Mermaid diagram editor and viewer',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${sarabun.variable} ${prompt.variable} ${kanit.variable} ${ibmPlexThai.variable} ${notoSansThai.variable} ${chakraPetch.variable}`}>
      <body>{children}</body>
    </html>
  );
}
