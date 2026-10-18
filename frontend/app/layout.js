import './globals.css';
import { Caveat, Inter, Poppins } from 'next/font/google';
import { AuthProvider } from '@/lib/auth';

const inter = Inter({ subsets: ['latin'], variable: '--font-inter', display: 'swap' });
const poppins = Poppins({ subsets: ['latin'], weight: ['500', '600', '700'], variable: '--font-poppins', display: 'swap' });
const script = Caveat({ subsets: ['latin'], weight: ['600'], variable: '--font-script', display: 'swap' });

export const metadata = {
  title: "Murang'a County Public Service Requests",
  description: 'Send a request to the county, follow its progress and rate how it was handled.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={`${inter.variable} ${poppins.variable} ${script.variable}`}>
      <body><AuthProvider>{children}</AuthProvider></body>
    </html>
  );
}
