'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'next/navigation';
import {
  checkInGuestByInvitation,
  downloadGuestLogCsv,
  downloadGuestLogFile,
  getGuestLog,
  grantGuestLogAccess,
  hasGuestLogAccess,
  importGuestLogRemote,
  type GuestLogVariant,
  type GuestLogEntry,
} from '@/utils/guestLog';

type CheckInAdminPanelProps = {
  variant?: GuestLogVariant;
};

export default function CheckInAdminPanel({ variant = 'religious' }: CheckInAdminPanelProps) {
  const searchParams = useSearchParams();
  const [guests, setGuests] = useState<GuestLogEntry[]>([]);
  const [hasAccess, setHasAccess] = useState(false);
  const [search, setSearch] = useState('');
  const [feedback, setFeedback] = useState('');
  const [feedbackType, setFeedbackType] = useState<'ok' | 'warn' | 'err'>('ok');
  const importRef = useRef<HTMLInputElement>(null);

  const isAdminMode = searchParams.get('mode') === 'admin';

  const refresh = useCallback(async () => {
    const entries = await getGuestLog(variant);
    setGuests(entries);
  }, [variant]);

  useEffect(() => {
    if (!isAdminMode) return;
    if (hasGuestLogAccess(variant)) {
      setHasAccess(true);
      void refresh();
    }
  }, [isAdminMode, refresh, variant]);

  if (!isAdminMode) return null;

  const handleUnlock = async () => {
    const code = window.prompt('Code d\'accès (4 chiffres) :');
    if (!code) return;
    if (grantGuestLogAccess(code, variant)) {
      setHasAccess(true);
      await refresh();
    } else {
      alert('Code invalide.');
    }
  };

  const showFeedback = (msg: string, type: 'ok' | 'warn' | 'err' = 'ok') => {
    setFeedback(msg);
    setFeedbackType(type);
    setTimeout(() => setFeedback(''), 4000);
  };

  const handleCheckIn = async (entry: GuestLogEntry) => {
    const result = await checkInGuestByInvitation(entry.invitationCode, entry.verificationHash, variant);
    await refresh();
    if (result === 'checked-in')
      showFeedback(`✅ ${entry.firstName} ${entry.lastName} — Check-in confirmé !`, 'ok');
    else if (result === 'already-checked-in')
      showFeedback(`⚠️ ${entry.firstName} ${entry.lastName} — déjà enregistré.`, 'warn');
    else showFeedback(`❌ Invité introuvable.`, 'err');
  };

  const handleImport = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (evt) => {
      void (async () => {
        try {
          const parsed = JSON.parse(evt.target?.result as string) as GuestLogEntry[];
          const { added, skipped } = await importGuestLogRemote(parsed, variant);
          await refresh();
          showFeedback(`✅ ${added} ajouté(s), ${skipped} ignoré(s) (déjà présents).`, 'ok');
        } catch {
          showFeedback('❌ Fichier invalide.', 'err');
        }
      })();
    };
    reader.readAsText(file);
    e.target.value = '';
  };

  const filtered = useMemo(() => {
    const q = search.toLowerCase().trim();
    if (!q) return guests;
    return guests.filter(
      (g) =>
        (g.firstName && g.lastName && `${g.firstName} ${g.lastName}`.toLowerCase().includes(q)) ||
        (g.partnerFirstName && g.partnerLastName && `${g.partnerFirstName} ${g.partnerLastName}`.toLowerCase().includes(q)) ||
        (g.invitationCode && g.invitationCode.toLowerCase().includes(q))
    );
  }, [guests, search]);

  const totalInvitations = guests.length;
  const totalPersons = guests.reduce((s, g) => s + g.attendanceCount, 0);
  const checkedInInvitations = guests.filter((g) => g.checkInStatus === 'checked-in').length;
  const checkedInPersons = guests
    .filter((g) => g.checkInStatus === 'checked-in')
    .reduce((s, g) => s + g.attendanceCount, 0);

  const feedbackColors = {
    ok: 'bg-green-50 border-green-200 text-green-800',
    warn: 'bg-amber-50 border-amber-200 text-amber-800',
    err: 'bg-red-50 border-red-200 text-red-800',
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-rose-50">
      <div className="mx-auto max-w-2xl px-4 py-10">
        {/* Header */}
        <div className="mb-8 text-center">
          <p className="text-xs uppercase tracking-[0.3em] text-rose-400">Lydie & Elie — 19 juillet 2026</p>
          <h1 className="mt-1 font-serif text-3xl text-rose-950">Check-In Admin</h1>
        </div>

        {!hasAccess ? (
          <div className="rounded-3xl border border-rose-200 bg-white p-10 text-center shadow-soft">
            <p className="mb-2 text-2xl">🔒</p>
            <p className="mb-6 text-sm text-rose-700">Entrez le code d&apos;accès pour continuer</p>
            <button
              onClick={handleUnlock}
              className="rounded-full bg-rose-700 px-8 py-3 text-sm font-semibold text-white hover:bg-rose-800 transition"
            >
              Déverrouiller
            </button>
            <div className="mt-6">
              <a href="/" className="text-xs text-rose-400 hover:text-rose-600">← Retour au site</a>
            </div>
          </div>
        ) : (
          <>
            {/* Stats */}
            <div className="mb-6 grid grid-cols-2 gap-3 sm:grid-cols-4">
              {[
                { label: 'Invitations', value: totalInvitations },
                { label: 'Personnes', value: totalPersons },
                { label: 'Arrivés', value: checkedInInvitations },
                { label: 'Pers. arrivées', value: checkedInPersons },
              ].map((s) => (
                <div
                  key={s.label}
                  className="rounded-2xl border border-rose-200 bg-white p-4 text-center shadow-soft"
                >
                  <p className="text-2xl font-bold text-rose-800">{s.value}</p>
                  <p className="mt-0.5 text-[10px] uppercase tracking-wide text-rose-400">{s.label}</p>
                </div>
              ))}
            </div>

            {/* Progress bar */}
            {totalInvitations > 0 && (
              <div className="mb-6">
                <div className="mb-1 flex justify-between text-xs text-rose-500">
                  <span>Progression arrivées</span>
                  <span>{Math.round((checkedInInvitations / totalInvitations) * 100)}%</span>
                </div>
                <div className="h-2 w-full overflow-hidden rounded-full bg-rose-100">
                  <div
                    className="h-full rounded-full bg-rose-600 transition-all"
                    style={{ width: `${(checkedInInvitations / totalInvitations) * 100}%` }}
                  />
                </div>
              </div>
            )}

            {/* Actions */}
            <div className="mb-4 flex flex-wrap gap-2">
              <button
                onClick={async () => {
                  await refresh();
                  showFeedback('✅ Liste actualisée.', 'ok');
                }}
                className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
              >
                ↻ Actualiser
              </button>
              <button
                onClick={() => importRef.current?.click()}
                className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
              >
                ↑ Importer JSON
              </button>
              <input ref={importRef} type="file" accept=".json" className="hidden" onChange={handleImport} />
              <button
                  onClick={() => downloadGuestLogFile(guests, variant)}
                className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
              >
                ↓ Export JSON
              </button>
              <button
                  onClick={() => downloadGuestLogCsv(guests, variant)}
                className="rounded-full border border-rose-200 bg-white px-4 py-1.5 text-xs font-semibold text-rose-700 hover:bg-rose-50 transition"
              >
                ↓ Export CSV
              </button>
            </div>

            {/* Feedback */}
            {feedback && (
              <div className={`mb-4 rounded-2xl border px-4 py-3 text-sm font-semibold ${feedbackColors[feedbackType]}`}>
                {feedback}
              </div>
            )}

            {/* Search */}
            <input
              type="search"
              placeholder="Rechercher par nom ou code..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="mb-4 w-full rounded-xl border border-rose-200 bg-white px-4 py-2.5 text-sm focus:outline-none focus:ring-2 focus:ring-rose-300"
            />

            {/* Guest list */}
            {guests.length === 0 ? (
              <div className="rounded-3xl border border-dashed border-rose-200 p-10 text-center">
                <p className="text-rose-400 text-sm">Aucun invité enregistré sur cet appareil.</p>
                <p className="mt-2 text-xs text-rose-300">
                  Importez le fichier guest-log.json depuis l&apos;appareil où les RSVP ont été collectées.
                </p>
              </div>
            ) : filtered.length === 0 ? (
              <p className="py-6 text-center text-sm text-rose-400">Aucun résultat pour &ldquo;{search}&rdquo;</p>
            ) : (
              <div className="space-y-3">
                {filtered.map((entry) => {
                  const checkedIn = entry.checkInStatus === 'checked-in';
                  return (
                    <div
                      key={entry.id}
                      className={`flex items-center justify-between rounded-2xl border px-5 py-4 shadow-soft transition ${
                        checkedIn ? 'border-green-200 bg-green-50' : 'border-rose-200 bg-white'
                      }`}
                    >
                      <div className="min-w-0">
                        <p className="truncate font-semibold text-rose-950">
                          {entry.firstName} {entry.lastName}
                          {entry.attendanceType === 'couple' && entry.partnerFirstName && (
                            <span className="font-normal text-rose-500">
                              {' '}& {entry.partnerFirstName} {entry.partnerLastName}
                            </span>
                          )}
                        </p>
                        <p className="mt-0.5 text-xs text-rose-400">
                          {entry.invitationCode} · {entry.attendanceCount}{' '}
                          {entry.attendanceCount > 1 ? 'personnes' : 'personne'}
                        </p>
                      </div>
                      <div className="ml-3 shrink-0">
                        {checkedIn ? (
                          <span className="rounded-full bg-green-100 px-3 py-1 text-xs font-semibold text-green-700">
                            ✓ Arrivé
                          </span>
                        ) : (
                          <button
                            onClick={() => handleCheckIn(entry)}
                            className="rounded-full bg-rose-700 px-4 py-1.5 text-xs font-semibold text-white hover:bg-rose-800 transition"
                          >
                            Check-in
                          </button>
                        )}
                      </div>
                    </div>
                  );
                })}
              </div>
            )}

            <div className="mt-8 space-y-1 text-center text-xs text-rose-300">
              <p>Les RSVP sont désormais enregistrés côté serveur dans un fichier central.</p>
              <p>Conservez l&apos;export JSON comme sauvegarde de sécurité.</p>
              <a href="/" className="mt-2 block text-rose-400 hover:text-rose-600">← Retour au site</a>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
