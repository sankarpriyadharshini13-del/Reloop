import ScanClient from '@/components/ScanClient';

export const metadata = {
  title: 'Scan your e-waste',
  description:
    'Upload a photo of an old electronic device to see what it is, whether it is recyclable, how much CO2 you save and where to recycle it.',
};

export default function ScanPage() {
  return <ScanClient />;
}
