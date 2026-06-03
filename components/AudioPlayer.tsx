"use client";

import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';

type AudioPlayerProps = {
  src: string;
};

export default function AudioPlayer({ src }: AudioPlayerProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [requiresGesture, setRequiresGesture] = useState(false);
  const { t } = useLanguage();
  const mp3FallbackSrc = src.toLowerCase().endsWith('.amr')
    ? src.replace(/\.amr$/i, '.mp3')
    : null;

  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    // Try autoplay on mount. Most browsers require interaction, so we handle fallback below.
    const tryAutoplay = async () => {
      try {
        audio.volume = 0.25;
        await audio.play();
        setIsPlaying(true);
        setRequiresGesture(false);
      } catch {
        setRequiresGesture(true);
      }
    };

    void tryAutoplay();

    // First user gesture unlocks audio playback when autoplay is blocked.
    const unlockAudio = async () => {
      if (!audioRef.current) return;
      try {
        await audioRef.current.play();
        setIsPlaying(true);
        setRequiresGesture(false);
      } catch {
        setRequiresGesture(true);
      }
    };

    window.addEventListener('pointerdown', unlockAudio, { once: true });
    window.addEventListener('keydown', unlockAudio, { once: true });

    return () => {
      window.removeEventListener('pointerdown', unlockAudio);
      window.removeEventListener('keydown', unlockAudio);
    };
  }, []);

  const togglePlayback = async () => {
    const audio = audioRef.current;
    if (!audio) return;

    if (audio.paused) {
      await audio.play();
      setIsPlaying(true);
      return;
    }

    audio.pause();
    setIsPlaying(false);
  };

  return (
    <div className="fixed bottom-4 right-4 z-40 flex items-center gap-3 rounded-full bg-white/85 px-4 py-2 shadow-soft backdrop-blur">
      <audio ref={audioRef} loop preload="auto">
        <source src={src} type={src.toLowerCase().endsWith('.amr') ? 'audio/amr' : undefined} />
        {mp3FallbackSrc ? <source src={mp3FallbackSrc} type="audio/mpeg" /> : null}
      </audio>
      <button
        type="button"
        onClick={togglePlayback}
        className="rounded-full bg-rose-700 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-white transition hover:bg-rose-800"
        aria-label={isPlaying ? t('pauseMusic') : t('playMusic')}
      >
        {isPlaying ? t('pauseMusic') : t('playMusic')}
      </button>
      {requiresGesture ? (
        <span className="max-w-[140px] text-[10px] leading-tight text-rose-700">
          {t('tapToEnable')}
        </span>
      ) : null}
    </div>
  );
}

