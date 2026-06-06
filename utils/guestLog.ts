'use client';

import type { Language } from '@/i18n/translations';
import type { GuestData } from '@/utils/pdfGenerator';

export type GuestLogEntry = GuestData & {
  id: string;
  language: Language;
  pdfFileName: string;
  invitationCode: string;
  verificationHash: string;
  attendanceCount: number;
  status: 'confirmed';
  checkInStatus: 'pending' | 'checked-in';
  createdAt: string;
};

export type GuestCheckInResult = 'checked-in' | 'already-checked-in' | 'not-found';

const STORAGE_KEY = 'wedding_guest_log';
const ACCESS_SESSION_KEY = 'wedding_guest_log_access';
const DEFAULT_ACCESS_CODE = '9297';
const LEGACY_ACCESS_CODE = 'wedding-admin';
const API_ENDPOINT = '/api/guest-log';

const isBrowser = () => typeof window !== 'undefined';

const getGuestLogLocal = (): GuestLogEntry[] => {
  if (!isBrowser()) return [];

  const rawValue = window.localStorage.getItem(STORAGE_KEY);
  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsedValue) ? (parsedValue as GuestLogEntry[]) : [];
  } catch {
    return [];
  }
};

const saveGuestLogLocal = (entries: GuestLogEntry[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

const syncLocalMirror = (entries: GuestLogEntry[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

type GuestLogApiResponse = {
  entries?: GuestLogEntry[];
  entry?: GuestLogEntry | null;
  result?: GuestCheckInResult;
  added?: number;
  skipped?: number;
  error?: string;
};

async function requestGuestLogApi(
  payload?: Record<string, unknown>
): Promise<GuestLogApiResponse | null> {
  try {
    const response = await fetch(API_ENDPOINT, {
      method: payload ? 'POST' : 'GET',
      headers: payload ? { 'Content-Type': 'application/json' } : undefined,
      body: payload ? JSON.stringify(payload) : undefined,
    });

    if (!response.ok) return null;

    return (await response.json()) as GuestLogApiResponse;
  } catch {
    return null;
  }
}

export const getGuestLog = async (): Promise<GuestLogEntry[]> => {
  const apiResult = await requestGuestLogApi();

  if (apiResult?.entries) {
    syncLocalMirror(apiResult.entries);
    return apiResult.entries;
  }

  return getGuestLogLocal();
};

export const saveGuestLogEntry = (
  guestData: GuestData,
  language: Language,
  invitationData: {
    fileName: string;
    invitationCode: string;
    verificationHash: string;
  }
): Promise<GuestLogEntry[]> => {
  return (async () => {
    const apiResult = await requestGuestLogApi({
      action: 'add',
      guestData,
      language,
      invitationData,
    });

    if (apiResult?.entries) {
      syncLocalMirror(apiResult.entries);
      return apiResult.entries;
    }

    throw new Error('Registration could not be saved on the server. Please try again.');
  })();
};

export const findGuestByInvitation = async (
  invitationCode: string,
  verificationHash: string
): Promise<GuestLogEntry | null> => {
  const apiResult = await requestGuestLogApi({
    action: 'find',
    invitationCode,
    verificationHash,
  });

  if (typeof apiResult?.entry !== 'undefined') {
    return apiResult.entry ?? null;
  }

  const normalizedCode = invitationCode.trim().toUpperCase();
  const normalizedHash = verificationHash.trim().toUpperCase();

  return getGuestLogLocal().find(
    (entry) =>
      entry.invitationCode.trim().toUpperCase() === normalizedCode &&
      entry.verificationHash.trim().toUpperCase() === normalizedHash
  ) || null;
};

export const checkInGuestByInvitation = (
  invitationCode: string,
  verificationHash: string
): Promise<GuestCheckInResult> => {
  return (async () => {
  const apiResult = await requestGuestLogApi({
    action: 'checkin',
    invitationCode,
    verificationHash,
  });

  if (apiResult?.result) {
    if (apiResult.entries) {
      syncLocalMirror(apiResult.entries);
    }

    return apiResult.result;
  }

  const entries = getGuestLogLocal();
  const normalizedCode = invitationCode.trim().toUpperCase();
  const normalizedHash = verificationHash.trim().toUpperCase();
  const targetIndex = entries.findIndex(
    (entry) =>
      entry.invitationCode.trim().toUpperCase() === normalizedCode &&
      entry.verificationHash.trim().toUpperCase() === normalizedHash
  );

  if (targetIndex === -1) {
    return 'not-found';
  }

  if (entries[targetIndex].checkInStatus === 'checked-in') {
    return 'already-checked-in';
  }

  entries[targetIndex] = {
    ...entries[targetIndex],
    checkInStatus: 'checked-in',
  };

  saveGuestLogLocal(entries);
  return 'checked-in';
  })();
};

export const downloadGuestLogFile = (entries: GuestLogEntry[] = getGuestLogLocal()) => {
  if (!isBrowser()) return;

  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: 'application/json',
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'guest-log.json';
  link.click();
  URL.revokeObjectURL(downloadUrl);
};

export const downloadGuestLogCsv = (entries: GuestLogEntry[] = getGuestLogLocal()) => {
  if (!isBrowser()) return;

  const headers = [
    'invitationCode',
    'verificationHash',
    'firstName',
    'lastName',
    'attendanceType',
    'partnerFirstName',
    'partnerLastName',
    'attendanceCount',
    'status',
    'checkInStatus',
    'createdAt',
    'language',
    'pdfFileName',
  ];

  const rows = entries.map((entry) =>
    [
      entry.invitationCode,
      entry.verificationHash,
      entry.firstName,
      entry.lastName,
      entry.attendanceType,
      entry.partnerFirstName || '',
      entry.partnerLastName || '',
      String(entry.attendanceCount),
      entry.status,
      entry.checkInStatus,
      entry.createdAt,
      entry.language,
      entry.pdfFileName,
    ]
      .map(escapeCsvValue)
      .join(',')
  );

  const csvContent = [headers.join(','), ...rows].join('\n');

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = 'guest-log.csv';
  link.click();
  URL.revokeObjectURL(downloadUrl);
};

export const hasGuestLogAccess = () => {
  if (!isBrowser()) return false;
  return window.sessionStorage.getItem(ACCESS_SESSION_KEY) === 'granted';
};

export const grantGuestLogAccess = (code: string) => {
  if (!isBrowser()) return false;

  const expectedCode = (process.env.NEXT_PUBLIC_GUEST_LOG_ACCESS_CODE || '').trim();
  const normalizedCode = code.trim();

  const isAllowed = expectedCode
    ? normalizedCode === expectedCode
    : normalizedCode === DEFAULT_ACCESS_CODE || normalizedCode === LEGACY_ACCESS_CODE;

  if (isAllowed) {
    window.sessionStorage.setItem(ACCESS_SESSION_KEY, 'granted');
  }

  return isAllowed;
};

export const importGuestLog = (incoming: GuestLogEntry[]): { added: number; skipped: number } => {
  const existing = getGuestLogLocal();
  const existingCodes = new Set(existing.map((e) => e.invitationCode));
  const newEntries = incoming.filter((e) => !existingCodes.has(e.invitationCode));
  saveGuestLogLocal([...newEntries, ...existing]);
  return { added: newEntries.length, skipped: incoming.length - newEntries.length };
};

export const importGuestLogRemote = async (
  incoming: GuestLogEntry[]
): Promise<{ added: number; skipped: number }> => {
  const apiResult = await requestGuestLogApi({ action: 'import', incoming });

  if (typeof apiResult?.added === 'number' && typeof apiResult?.skipped === 'number') {
    if (apiResult.entries) {
      syncLocalMirror(apiResult.entries);
    }

    return {
      added: apiResult.added,
      skipped: apiResult.skipped,
    };
  }

  return importGuestLog(incoming);
};

function escapeCsvValue(value: unknown) {
  const normalized = value == null ? '' : String(value);

  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}
