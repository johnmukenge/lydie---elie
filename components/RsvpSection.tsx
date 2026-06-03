"use client";

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import RsvpModal from '@/components/RsvpModal';

type RsvpSectionProps = {
  names: string;
};

export default function RsvpSection({ names }: RsvpSectionProps) {
  const { t } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);

  return (
    <section className="mx-auto max-w-6xl px-4 pb-24 pt-4 text-center sm:px-6 lg:px-8">
      <div className="fade-in-up rounded-3xl bg-gradient-to-r from-champagne-100 to-rose-100 p-10 shadow-soft">
        <p className="text-xs uppercase tracking-[0.22em] text-rose-700">{t('willYouJoinUs')}</p>
        <h2 className="mt-3 font-serif text-3xl text-rose-950 sm:text-4xl">{t('rsvp')}</h2>
        <p className="mx-auto mt-3 max-w-2xl text-sm leading-relaxed text-rose-800">
          {t('yourPresence')} {names}.
        </p>

        <button
          type="button"
          onClick={() => setIsOpen(true)}
          className="mt-7 rounded-full bg-rose-700 px-7 py-3 text-xs font-semibold uppercase tracking-[0.2em] text-white transition hover:bg-rose-800"
        >
          {t('openRsvp')}
        </button>
      </div>

      <RsvpModal isOpen={isOpen} onClose={() => setIsOpen(false)} coupleName={names} />
    </section>
  );
}
