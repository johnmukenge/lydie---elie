"use client";

import { Suspense, useMemo } from 'react';
import { weddingData } from '@/data';
import Hero from '@/components/Hero';
import Countdown from '@/components/Countdown';
import Gallery from '@/components/Gallery';
import AudioPlayer from '@/components/AudioPlayer';
import RsvpSection from '@/components/RsvpSection';
import LanguageSwitcher from '@/components/LanguageSwitcher';
import GuestCheckInPanel from '@/components/GuestCheckInPanel';
import CheckInAdminPanel from '@/components/CheckInAdminPanel';
// import WeddingTypeSelector from '@/components/WeddingTypeSelector'; // TRADITIONAL — TEMPORAIREMENT DÉSACTIVÉ
import { useLanguage } from '@/context/LanguageContext';

const getLocale = (language: 'en' | 'fr' | 'it') => {
  if (language === 'fr') return 'fr-FR';
  if (language === 'it') return 'it-IT';
  return 'en-GB';
};

const scheduleTranslationKeys = [
  { title: 'guestArrival', description: 'guestArrivalDesc' },
  { title: 'ceremony', description: 'ceremonyDesc' },
  { title: 'reception', description: 'receptionDesc' },
  { title: 'firstDance', description: 'firstDanceDesc' },
] as const;

export default function PageContent() {
  const { language, t } = useLanguage();

  const formattedDate = useMemo(() => {
    return new Date(weddingData.weddingDate).toLocaleDateString(getLocale(language), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, [language]);

  return (
    <main className="bg-rose-50 text-rose-900">
      <LanguageSwitcher />
      {/* <WeddingTypeSelector currentType="religious" /> */}{/* TRADITIONAL — TEMPORAIREMENT DÉSACTIVÉ */}
      <Suspense fallback={null}>
        <GuestCheckInPanel />
      </Suspense>
      <Suspense fallback={null}>
        <CheckInAdminPanel />
      </Suspense>

      <Hero
        names={weddingData.couple.displayName}
        dateText={formattedDate}
        locationText={weddingData.venue.city}
        heroImage={weddingData.heroImage}
      />

      <section id="details" className="mx-auto max-w-6xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="fade-in-up text-center">
          <p className="text-xs uppercase tracking-[0.25em] text-rose-600">{t('untilWeDoIT')}</p>
          <h2 className="mt-3 font-serif text-3xl text-rose-950 sm:text-4xl">{t('countdown')}</h2>
        </div>

        <div className="fade-in-up fade-in-delay-1 mx-auto mt-8 max-w-3xl">
          <Countdown targetDate={weddingData.weddingDate} />
        </div>

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {weddingData.schedule.map((item, index) => {
            const translationKeys = scheduleTranslationKeys[index];
            return (
              <article
                key={`${item.time}-${index}`}
                className="fade-in-up rounded-2xl bg-white/80 p-6 shadow-soft"
                style={{ animationDelay: `${index * 120}ms` }}
              >
                <p className="text-xs uppercase tracking-[0.22em] text-rose-500">{item.time}</p>
                <h3 className="mt-2 font-serif text-2xl text-rose-900">
                  {translationKeys ? t(translationKeys.title) : item.title}
                </h3>
                <p className="mt-3 text-sm leading-relaxed text-rose-800">
                  {translationKeys ? t(translationKeys.description) : item.description}
                </p>
              </article>
            );
          })}
        </div>

        <div className="fade-in-up fade-in-delay-2 mt-8 rounded-2xl border border-rose-100 bg-white/70 p-5 text-sm text-rose-800 shadow-soft">
          <p>
            <span className="font-semibold">{t('venue')}:</span> {weddingData.venue.name}, {weddingData.venue.address}
          </p>
          <p className="mt-2">
            <span className="font-semibold">{t('dressCode')}:</span> {weddingData.dressCode}
          </p>
        </div>
      </section>

      <Gallery images={weddingData.gallery} />
      <RsvpSection names={weddingData.couple.displayName} />
      <AudioPlayer src={weddingData.audioUrl} />
    </main>
  );
}
