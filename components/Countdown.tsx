"use client";

import { useCountdown } from '@/hooks/useCountdown';
import { useLanguage } from '@/context/LanguageContext';

type CountdownProps = {
  targetDate: string;
};

const Block = ({ value, label }: { value: number; label: string }) => (
  <div className="rounded-2xl bg-white/70 px-4 py-5 text-center shadow-soft backdrop-blur sm:px-6">
    <p className="font-serif text-3xl text-rose-900 sm:text-4xl">{value}</p>
    <p className="mt-1 text-xs uppercase tracking-[0.2em] text-rose-700">{label}</p>
  </div>
);

export default function Countdown({ targetDate }: CountdownProps) {
  const { days, hours, minutes, seconds, isExpired } = useCountdown(targetDate);
  const { t } = useLanguage();

  if (isExpired) {
    return (
      <p className="rounded-2xl bg-white/70 px-6 py-4 text-center text-sm text-rose-800 shadow-soft backdrop-blur">
        {t('celebration')}. {t('yourPresence')}
      </p>
    );
  }

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4">
      <Block value={days} label={t('days')} />
      <Block value={hours} label={t('hours')} />
      <Block value={minutes} label={t('minutes')} />
      <Block value={seconds} label={t('seconds')} />
    </div>
  );
}
