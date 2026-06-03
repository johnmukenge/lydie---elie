"use client";

import { useEffect, useMemo, useState } from 'react';

type CountdownValues = {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
  isExpired: boolean;
};

const getDiff = (targetDate: string): CountdownValues => {
  const now = new Date().getTime();
  const target = new Date(targetDate).getTime();
  const distance = target - now;

  if (distance <= 0) {
    return { days: 0, hours: 0, minutes: 0, seconds: 0, isExpired: true };
  }

  return {
    days: Math.floor(distance / (1000 * 60 * 60 * 24)),
    hours: Math.floor((distance / (1000 * 60 * 60)) % 24),
    minutes: Math.floor((distance / (1000 * 60)) % 60),
    seconds: Math.floor((distance / 1000) % 60),
    isExpired: false,
  };
};

export const useCountdown = (targetDate: string): CountdownValues => {
  // Keep initial render deterministic across server and client to avoid hydration mismatch.
  const [countdown, setCountdown] = useState<CountdownValues>({
    days: 0,
    hours: 0,
    minutes: 0,
    seconds: 0,
    isExpired: false,
  });

  useEffect(() => {
    // Sync once on mount, then update every second.
    setCountdown(getDiff(targetDate));

    const interval = window.setInterval(() => {
      setCountdown(getDiff(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  return useMemo(() => countdown, [countdown]);
};
