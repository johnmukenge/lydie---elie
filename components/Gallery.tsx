'use client';

import Image from 'next/image';
import type { GalleryItem } from '@/data';
import { useLanguage } from '@/context/LanguageContext';

type GalleryProps = {
  images: GalleryItem[];
};

export default function Gallery({ images }: GalleryProps) {
  const { t } = useLanguage();

  return (
    <section id="gallery" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
      <div className="fade-in-up text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-600">{t('moments')}</p>
        <h2 className="mt-3 font-serif text-3xl text-rose-950 sm:text-4xl">{t('gallery')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm text-rose-700">{t('galleryNote')}</p>
      </div>

      <div className="mt-10 columns-2 gap-3 sm:columns-3 sm:gap-4">
        {images.map((image, index) => (
          <figure
            key={image.id}
            className="fade-in-up relative mb-3 break-inside-avoid overflow-hidden rounded-2xl border border-rose-100 bg-gradient-to-b from-rose-50 to-white shadow-soft transition-shadow duration-300 hover:shadow-md sm:mb-4"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <div
              className="relative w-full bg-white/90"
              style={{ aspectRatio: `${image.width} / ${image.height}` }}
            >
              <Image
                src={image.src}
                alt={image.alt}
                fill
                className="object-contain p-2"
                sizes="(max-width: 640px) 50vw, 33vw"
              />
            </div>
          </figure>
        ))}
      </div>
    </section>
  );
}
