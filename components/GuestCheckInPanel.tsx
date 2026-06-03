'use client';

import { useMemo, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import {
  checkInGuestByInvitation,
  findGuestByInvitation,
  grantGuestLogAccess,
  hasGuestLogAccess,
} from '@/utils/guestLog';

export default function GuestCheckInPanel() {
  const { t } = useLanguage();
  const searchParams = useSearchParams();
  const [feedback, setFeedback] = useState<string>('');
  const [alreadyDone, setAlreadyDone] = useState(false);

  const invitationCode = searchParams.get('invitation') || '';
  const verificationHash = searchParams.get('hash') || '';
  const guestEncoded = searchParams.get('guest') || '';
  const countParam = parseInt(searchParams.get('count') || '1', 10);
  const guestCountParam = isNaN(countParam) ? 1 : countParam;
  const isCheckInMode = searchParams.get('checkin') === '1' && !!invitationCode && !!verificationHash;

  // Decode guest name from URL (self-contained — works on any device)
  const guestNameFromUrl = useMemo(() => {
    if (!guestEncoded) return '';
    try {
      return decodeURIComponent(escape(atob(guestEncoded)));
    } catch {
      return '';
    }
  }, [guestEncoded]);

  // Also try to find guest in local registry (same device)
  const guest = useMemo(() => {
    if (!isCheckInMode) return null;
    return findGuestByInvitation(invitationCode, verificationHash);
  }, [invitationCode, verificationHash, isCheckInMode]);

  const displayName = guest
    ? `${guest.firstName} ${guest.lastName}${guest.attendanceType === 'couple' && guest.partnerFirstName ? ` & ${guest.partnerFirstName} ${guest.partnerLastName}` : ''}`
    : guestNameFromUrl;

  const displayCount = guest ? guest.attendanceCount : guestCountParam;

  if (!isCheckInMode) return null;

  const handleValidate = () => {
    if (!hasGuestLogAccess()) {
      const code = window.prompt(t('guestRegistryAccessPrompt'));
      if (!code) return;
      const isAllowed = grantGuestLogAccess(code);
      if (!isAllowed) {
        setFeedback(t('guestRegistryAccessDenied'));
        return;
      }
    }

    // If guest is in local registry, use it
    if (guest) {
      const result = checkInGuestByInvitation(invitationCode, verificationHash);
      if (result === 'checked-in') {
        setFeedback(t('checkInSuccess'));
        setAlreadyDone(false);
        return;
      }
      if (result === 'already-checked-in') {
        setFeedback(t('checkInAlreadyDone'));
        setAlreadyDone(true);
        return;
      }
    }

    // Guest not in local registry — store a minimal record and mark as checked-in
    if (!guest && displayName) {
      const entries = JSON.parse(localStorage.getItem('wedding_guest_log') || '[]');
      const existing = entries.find(
        (e: { invitationCode: string; verificationHash: string }) =>
          e.invitationCode === invitationCode && e.verificationHash === verificationHash
      );
      if (existing) {
        if (existing.checkInStatus === 'checked-in') {
          setFeedback(t('checkInAlreadyDone'));
          setAlreadyDone(true);
          return;
        }
        existing.checkInStatus = 'checked-in';
        localStorage.setItem('wedding_guest_log', JSON.stringify(entries));
      } else {
        const nameParts = displayName.split('&')[0].trim().split(' ');
        const newEntry = {
          id: `scan-${Date.now()}`,
          firstName: nameParts[0] || displayName,
          lastName: nameParts.slice(1).join(' ') || '',
          attendanceType: guestCountParam > 1 ? 'couple' : 'single',
          attendanceCount: displayCount,
          invitationCode,
          verificationHash,
          status: 'confirmed',
          checkInStatus: 'checked-in',
          language: 'fr',
          createdAt: new Date().toISOString(),
          pdfFileName: '',
        };
        entries.push(newEntry);
        localStorage.setItem('wedding_guest_log', JSON.stringify(entries));
      }
      setFeedback(t('checkInSuccess'));
      setAlreadyDone(false);
      return;
    }

    setFeedback(t('checkInNotFound'));
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-rose-950/60 p-4 backdrop-blur-sm">
      <div className="w-full max-w-sm rounded-3xl border border-rose-200 bg-white p-8 shadow-2xl text-center">
        <p className="text-xs uppercase tracking-[0.25em] text-rose-500">{t('checkInMode')}</p>
        <h2 className="mt-2 font-serif text-2xl text-rose-950">{t('checkInTitle')}</h2>

        <div className="mt-6 rounded-2xl bg-rose-50 px-5 py-4 text-left space-y-2 text-sm text-rose-800">
          <p>
            <span className="font-semibold">Invité :</span>{' '}
            {displayName || <span className="italic text-rose-400">inconnu</span>}
          </p>
          <p>
            <span className="font-semibold">Personnes :</span> {displayCount}
          </p>
          <p className="text-xs text-rose-400 break-all">
            <span className="font-semibold">Code :</span> {invitationCode}
          </p>
        </div>

        {!feedback ? (
          <button
            type="button"
            onClick={handleValidate}
            className="mt-6 w-full rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold uppercase tracking-wide text-white transition hover:bg-rose-800"
          >
            {t('checkInValidateButton')}
          </button>
        ) : (
          <div className={`mt-6 rounded-2xl px-4 py-3 text-sm font-semibold ${alreadyDone ? 'bg-amber-50 text-amber-800' : 'bg-green-50 text-green-800'}`}>
            {feedback}
          </div>
        )}

        <a
          href="/"
          className="mt-4 block text-xs text-rose-400 hover:text-rose-600"
        >
          ← Retour au site
        </a>
      </div>
    </div>
  );
}
