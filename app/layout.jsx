import '@fontsource-variable/bricolage-grotesque';
import '@fontsource-variable/dm-sans';
import './globals.css';
import Navbar from '@/components/Navbar';
import ReLoopGuide from '@/components/ReLoopGuide';

const description =
  'Snap a photo of old electronics. ReLoop identifies the item, tells you if it is recyclable, how much CO2 you save, and where the nearest recycling centers are.';

export const metadata = {
  title: {
    default: 'ReLoop | One Photo Can Save The Planet',
    template: '%s | ReLoop',
  },
  description,
  applicationName: 'ReLoop',
  keywords: ['e-waste', 'recycling', 'electronics', 'sustainability', 'CO2', 'AI'],
  openGraph: {
    title: 'ReLoop | One Photo Can Save The Planet',
    description,
    type: 'website',
    siteName: 'ReLoop',
  },
  twitter: {
    card: 'summary',
    title: 'ReLoop | One Photo Can Save The Planet',
    description,
  },
};

export const viewport = {
  themeColor: '#0f172a',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body>
        <Navbar />
        <main>{children}</main>
        <ReLoopGuide />
      </body>
    </html>
  );
}
