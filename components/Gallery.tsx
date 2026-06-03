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

      <div className="mt-10 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4">
        {images.map((image, index) => (
          <figure
            key={image.id}
            className="fade-in-up group relative overflow-hidden rounded-2xl shadow-soft"
            style={{ animationDelay: `${index * 120}ms` }}
          >
            <Image
              src={image.src}
              alt={image.alt}
              width={900}
              height={1200}
              className="h-44 w-full object-cover transition duration-700 group-hover:scale-105 sm:h-64"
              sizes="(max-width: 640px) 50vw, 33vw"
            />
            <div className="absolute inset-0 bg-gradient-to-t from-black/25 to-transparent opacity-0 transition-opacity duration-500 group-hover:opacity-100" />
          </figure>
        ))}
      </div>
    </section>
  );
}
