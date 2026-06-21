"use client";

import { Suspense, useMemo } from 'react';
import { traditionalWeddingData } from '@/data';
import Countdown from '@/components/Countdown';
import Gallery from '@/components/Gallery';
import AudioPlayer from '@/components/AudioPlayer';
import RsvpSection from '@/components/RsvpSection';
import GuestCheckInPanel from '@/components/GuestCheckInPanel';
import CheckInAdminPanel from '@/components/CheckInAdminPanel';
import { getTranslation } from '@/i18n/translations';

const getLocale = (language: 'en' | 'fr' | 'it') => {
  if (language === 'fr') return 'fr-FR';
  if (language === 'it') return 'it-IT';
  return 'en-GB';
};

const scheduleTranslationKeys = [
  { title: 'familyArrival', description: 'familyArrivalDesc' },
  { title: 'traditionalCeremony', description: 'traditionalCeremonyDesc' },
  { title: 'dances', description: 'dancesDesc' },
  { title: 'feast', description: 'feastDesc' },
] as const;

export default function TraditionalPageContent() {
  const language = 'fr';
  const t = (key: string) => getTranslation(language, key);

  const formattedDate = useMemo(() => {
    return new Date(traditionalWeddingData.weddingDate).toLocaleDateString(getLocale(language), {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    });
  }, []);

  const motifStyle = {
    backgroundImage:
      'radial-gradient(circle at 12% 18%, rgba(30, 64, 175, 0.95) 0 7%, transparent 7.2%), radial-gradient(circle at 24% 32%, rgba(180, 83, 9, 0.9) 0 2.2%, transparent 2.4%), radial-gradient(circle at 78% 22%, rgba(153, 27, 27, 0.95) 0 6%, transparent 6.2%), radial-gradient(circle at 71% 38%, rgba(37, 99, 235, 0.9) 0 4.2%, transparent 4.4%), radial-gradient(circle at 18% 78%, rgba(37, 99, 235, 0.95) 0 7%, transparent 7.2%), radial-gradient(circle at 35% 76%, rgba(180, 83, 9, 0.88) 0 2.1%, transparent 2.3%), radial-gradient(circle at 60% 70%, rgba(153, 27, 27, 0.92) 0 8%, transparent 8.2%), radial-gradient(circle at 84% 76%, rgba(37, 99, 235, 0.95) 0 6%, transparent 6.2%), repeating-linear-gradient(140deg, rgba(76, 29, 149, 0.12) 0 1px, transparent 1px 18px), repeating-linear-gradient(35deg, rgba(180, 83, 9, 0.08) 0 1px, transparent 1px 24px), linear-gradient(135deg, #f8f1e3 0%, #fff8ee 42%, #f8efe6 100%)',
  } as const;

  return (
    <main className="bg-[#fbf4ea] text-amber-950">
      <section className="relative overflow-hidden border-b border-amber-200/70">
        <div className="absolute inset-0 opacity-95" style={motifStyle} aria-hidden />
        <div className="absolute inset-0 bg-gradient-to-b from-white/40 via-transparent to-[#f6e7d4]/75" aria-hidden />

        <div className="relative mx-auto flex min-h-screen max-w-7xl items-center px-4 py-16 sm:px-6 lg:px-8">
          <div className="grid w-full gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-center">
            <div className="fade-in-up max-w-2xl">
              <p className="inline-flex rounded-full border border-amber-300 bg-white/70 px-4 py-1 text-xs uppercase tracking-[0.3em] text-amber-800 shadow-sm backdrop-blur">
                Save the date · Mariage traditionnel congolais
              </p>
              <h1 className="mt-6 font-serif text-5xl leading-tight text-amber-950 sm:text-6xl lg:text-7xl">
                Lydie & Elie
              </h1>
              <p className="mt-5 max-w-xl text-base leading-8 text-amber-900/90 sm:text-lg">
                Une célébration élégante inspirée des tissus congolais, des couleurs royales et de l’esprit des grandes alliances familiales.
              </p>

              <div className="mt-8 flex flex-wrap items-center gap-4">
                <a
                  href="#details"
                  className="rounded-full bg-amber-900 px-6 py-3 text-xs uppercase tracking-[0.22em] text-white shadow-lg transition hover:bg-amber-800"
                >
                  Découvrir le programme
                </a>
                <div className="rounded-full border border-amber-300 bg-white/70 px-5 py-3 text-sm text-amber-900 shadow-sm backdrop-blur">
                  {formattedDate} · Kinshasa
                </div>
              </div>
            </div>

            <div className="fade-in-up fade-in-delay-1 lg:justify-self-end">
              <div className="relative mx-auto max-w-xl overflow-hidden rounded-[2rem] border border-white/70 bg-white/50 p-4 shadow-[0_24px_80px_rgba(120,53,15,0.18)] backdrop-blur-md">
                <div className="absolute inset-0 opacity-85" style={motifStyle} aria-hidden />
                <div className="relative rounded-[1.65rem] border border-amber-100/80 bg-white/82 px-8 py-10 text-center shadow-inner">
                  <p className="text-xs uppercase tracking-[0.32em] text-amber-700">Invitation</p>
                  <h2 className="mt-4 font-serif text-4xl text-amber-950 sm:text-5xl">Save the date</h2>
                  <div className="mx-auto mt-6 h-px w-20 bg-gradient-to-r from-transparent via-amber-700 to-transparent" />
                  <p className="mt-6 text-base uppercase tracking-[0.28em] text-amber-700">16 juillet 2026</p>
                  <p className="mt-2 text-sm leading-7 text-amber-900/90">Salle Événementiel · New Foncobel · Kinshasa</p>
                  <div className="mt-8 grid grid-cols-3 gap-3 text-center text-xs uppercase tracking-[0.2em] text-amber-800">
                    <div className="rounded-2xl bg-white/80 py-4 shadow-sm">
                      <span className="block text-2xl font-serif text-amber-950">16</span>
                      Juil.
                    </div>
                    <div className="rounded-2xl bg-white/80 py-4 shadow-sm">
                      <span className="block text-2xl font-serif text-amber-950">14h</span>
                      Cérémonie
                    </div>
                    <div className="rounded-2xl bg-white/80 py-4 shadow-sm">
                      <span className="block text-2xl font-serif text-amber-950">2026</span>
                      Année
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <Suspense fallback={null}>
        <GuestCheckInPanel variant="traditional" />
      </Suspense>
      <Suspense fallback={null}>
        <CheckInAdminPanel variant="traditional" />
      </Suspense>

      <section id="details" className="mx-auto max-w-7xl px-4 py-20 sm:px-6 lg:px-8">
        <div className="grid gap-8 lg:grid-cols-[0.9fr_1.1fr] lg:items-start">
          <div className="fade-in-up rounded-[2rem] border border-amber-200 bg-white/75 p-8 shadow-soft backdrop-blur">
            <p className="text-xs uppercase tracking-[0.25em] text-amber-600">{t('untilWeDoIT')}</p>
            <h2 className="mt-3 font-serif text-3xl text-amber-950 sm:text-4xl">{t('countdown')}</h2>
            <p className="mt-4 text-sm leading-7 text-amber-800">
              Une journée de tradition, de joie et de couleurs pour célébrer l’union de nos familles.
            </p>
            <div className="mt-8">
              <Countdown targetDate={traditionalWeddingData.weddingDate} />
            </div>
          </div>

          <div className="grid gap-6 md:grid-cols-2">
            {traditionalWeddingData.schedule.map((item, index) => {
              const translationKeys = scheduleTranslationKeys[index];
              return (
                <article
                  key={`${item.time}-${index}`}
                  className="fade-in-up overflow-hidden rounded-[1.65rem] border border-white/70 p-6 shadow-soft"
                  style={{
                    animationDelay: `${index * 120}ms`,
                    background:
                      index % 2 === 0
                        ? 'linear-gradient(145deg, rgba(255, 247, 214, 0.98) 0%, rgba(253, 230, 138, 0.92) 100%)'
                        : 'linear-gradient(145deg, rgba(153, 27, 27, 0.96) 0%, rgba(127, 29, 29, 0.98) 100%)',
                  }}
                >
                  <p className={`text-xs uppercase tracking-[0.22em] ${index % 2 === 0 ? 'text-amber-700' : 'text-amber-100'}`}>
                    {item.time}
                  </p>
                  <h3 className={`mt-2 font-serif text-2xl ${index % 2 === 0 ? 'text-amber-950' : 'text-white'}`}>
                    {translationKeys ? t(translationKeys.title) : item.title}
                  </h3>
                  <p className={`mt-3 text-sm leading-relaxed ${index % 2 === 0 ? 'text-amber-800' : 'text-rose-50'}`}>
                    {translationKeys ? t(translationKeys.description) : item.description}
                  </p>
                </article>
              );
            })}
          </div>
        </div>

        <div className="fade-in-up fade-in-delay-2 mt-8 rounded-[1.75rem] border border-amber-200 bg-white/80 p-6 text-sm text-amber-900 shadow-soft backdrop-blur">
          <p>
            <span className="font-semibold text-amber-700">{t('venue')}:</span> {traditionalWeddingData.venue.name}, {traditionalWeddingData.venue.address}
          </p>
          <p className="mt-2">
            <span className="font-semibold text-amber-700">{t('dressCode')}:</span> {traditionalWeddingData.dressCode}
          </p>
        </div>
      </section>

      <Gallery images={traditionalWeddingData.gallery} />
      <RsvpSection names={traditionalWeddingData.couple.displayName} variant="traditional" />
      <AudioPlayer src={traditionalWeddingData.audioUrl} />
    </main>
  );
}
