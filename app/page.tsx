import type { Metadata } from 'next';
import { weddingData } from '@/data';
import PageContent from '@/components/PageContent';

export const metadata: Metadata = {
  title: 'Lydie & Elie | Wedding Invitation',
  description:
    'Celebrate with Lydie and Elie in Kinshasa. View event details, countdown, gallery, and RSVP.',
  openGraph: {
    title: 'Lydie & Elie Wedding Invitation',
    description:
      'A romantic wedding celebration in Kinshasa with ceremony, reception, and special moments.',
    images: [{ url: weddingData.heroImage }],
  },
};

export default function Page() {
  return <PageContent />;
}
