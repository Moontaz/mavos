import type { Metadata } from 'next';
import './globals.css';
import { MavosShell } from '@/components/layout/MavosShell';

export const metadata: Metadata = {
  title: 'MAVOS — My Voice',
  description: 'MAVOS is a voice-controlled web experience. Your voice. Your interface.',
  openGraph: {
    title: 'MAVOS — My Voice',
    description: 'A web experience that understands voice as an interface.',
    type: 'website',
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body><MavosShell>{children}</MavosShell></body></html>;
}
