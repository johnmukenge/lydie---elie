"use client";

import { useEffect, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

type HeroProps = {
  names: string;
  dateText: string;
  locationText: string;
  heroImage: string;
};

export default function Hero({ names, dateText, locationText, heroImage }: HeroProps) {
  const { t } = useLanguage();
  const [offsetY, setOffsetY] = useState(0);

  useEffect(() => {
    const onScroll = () => setOffsetY(window.scrollY * 0.15);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <section className="relative min-h-screen overflow-hidden">
      <div
        className="absolute inset-0 will-change-transform"
        style={{ transform: `translateY(${offsetY}px)` }}
      >
        <div
          className="h-[110%] w-full bg-cover bg-center"
          style={{ backgroundImage: `url(${heroImage})` }}
          aria-hidden
        />
      </div>

      <div className="absolute inset-0 bg-gradient-to-b from-black/40 via-rose-900/20 to-rose-950/45" />

      <div className="relative z-10 mx-auto flex min-h-screen max-w-6xl flex-col items-center justify-center px-4 text-center sm:px-6 lg:px-8">
        <p className="fade-in-up text-xs uppercase tracking-[0.28em] text-rose-100">
          {t('weddingInvitation')}
        </p>
        <h1 className="fade-in-up fade-in-delay-1 mt-4 font-serif text-5xl text-ivory-50 sm:text-6xl lg:text-7xl">
          {names}
        </h1>
        <p className="fade-in-up fade-in-delay-2 mt-4 text-sm tracking-[0.18em] text-rose-100 sm:text-base">
          {dateText} · {locationText}
        </p>

        <a
          href="#details"
          className="fade-in-up fade-in-delay-3 mt-10 rounded-full border border-white/60 bg-white/10 px-6 py-3 text-xs uppercase tracking-[0.22em] text-white backdrop-blur-sm transition hover:bg-white/20"
        >
          {t('discoverDetails')}
        </a>
      </div>
    </section>
  );
}
