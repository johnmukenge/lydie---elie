// ─────────────────────────────────────────────────────────────────────────────
// TRADITIONAL WEDDING PAGE — TEMPORAIREMENT DÉSACTIVÉE
// Décommenter le bloc ci-dessous pour réactiver la page.
// ─────────────────────────────────────────────────────────────────────────────

// import type { Metadata } from 'next';
// import { traditionalWeddingData } from '@/data';
// import TraditionalPageContent from '@/components/TraditionalPageContent';
//
// export const metadata: Metadata = {
//   title: 'Lydie & Elie | Save the Date Traditionnel',
//   description:
//     'Save the date pour le mariage traditionnel congolais de Lydie et Elie à Kinshasa, avec un design inspiré des motifs textiles et le programme de la célébration.',
//   openGraph: {
//     title: 'Lydie & Elie Save the Date Traditionnel',
//     description:
//       'Une invitation save the date au style traditionnel congolais, avec motif textile, programme et date du 16/07/2026.',
//     images: [{ url: traditionalWeddingData.heroImage }],
//   },
// };
//
// export default function TraditionalPage() {
//   return <TraditionalPageContent />;
// }

import { redirect } from 'next/navigation';

export default function TraditionalPage() {
  redirect('/');
}
