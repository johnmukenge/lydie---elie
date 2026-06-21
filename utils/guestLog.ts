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

export type GuestLogVariant = 'religious' | 'traditional';

const DEFAULT_VARIANT: GuestLogVariant = 'religious';
const DEFAULT_ACCESS_CODE = '9297';
const LEGACY_ACCESS_CODE = 'wedding-admin';
const API_ENDPOINT = '/api/guest-log';

type GuestLogConfig = {
  storageKey: string;
  accessSessionKey: string;
  downloadFileName: string;
  apiEndpoint: string;
};

const getGuestLogConfig = (variant: GuestLogVariant = DEFAULT_VARIANT): GuestLogConfig => {
  if (variant === 'traditional') {
    return {
      storageKey: 'traditional_wedding_guest_log',
      accessSessionKey: 'traditional_wedding_guest_log_access',
      downloadFileName: 'traditional-guest-log.json',
      apiEndpoint: `${API_ENDPOINT}?variant=traditional`,
    };
  }

  return {
    storageKey: 'wedding_guest_log',
    accessSessionKey: 'wedding_guest_log_access',
    downloadFileName: 'guest-log.json',
    apiEndpoint: `${API_ENDPOINT}?variant=religious`,
  };
};

const isBrowser = () => typeof window !== 'undefined';

const getGuestLogLocal = (variant: GuestLogVariant = DEFAULT_VARIANT): GuestLogEntry[] => {
  if (!isBrowser()) return [];

  const { storageKey } = getGuestLogConfig(variant);

  const rawValue = window.localStorage.getItem(storageKey);
  if (!rawValue) return [];

  try {
    const parsedValue = JSON.parse(rawValue) as unknown;
    return Array.isArray(parsedValue) ? (parsedValue as GuestLogEntry[]) : [];
  } catch {
    return [];
  }
};

const saveGuestLogLocal = (entries: GuestLogEntry[], variant: GuestLogVariant = DEFAULT_VARIANT) => {
  if (!isBrowser()) return;
  const { storageKey } = getGuestLogConfig(variant);
  window.localStorage.setItem(storageKey, JSON.stringify(entries));
};

const syncLocalMirror = (entries: GuestLogEntry[], variant: GuestLogVariant = DEFAULT_VARIANT) => {
  if (!isBrowser()) return;
  const { storageKey } = getGuestLogConfig(variant);
  window.localStorage.setItem(storageKey, JSON.stringify(entries));
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
  payload?: Record<string, unknown>,
  variant: GuestLogVariant = DEFAULT_VARIANT
): Promise<GuestLogApiResponse | null> {
  try {
    const { apiEndpoint } = getGuestLogConfig(variant);
    const response = await fetch(apiEndpoint, {
      method: payload ? 'POST' : 'GET',
      headers: payload ? { 'Content-Type': 'application/json' } : undefined,
      body: payload ? JSON.stringify({ ...payload, variant }) : undefined,
    });

    if (!response.ok) return null;

    return (await response.json()) as GuestLogApiResponse;
  } catch {
    return null;
  }
}

export const getGuestLog = async (variant: GuestLogVariant = DEFAULT_VARIANT): Promise<GuestLogEntry[]> => {
  const apiResult = await requestGuestLogApi(undefined, variant);

  if (apiResult?.entries) {
    syncLocalMirror(apiResult.entries, variant);
    return apiResult.entries;
  }

  return getGuestLogLocal(variant);
};

export const saveGuestLogEntry = (
  guestData: GuestData,
  language: Language,
  invitationData: {
    fileName: string;
    invitationCode: string;
    verificationHash: string;
  },
  variant: GuestLogVariant = DEFAULT_VARIANT
): Promise<GuestLogEntry[]> => {
  return (async () => {
    // Check if firstName starts with "Couple" - parse as shortcut format.
    const isCoupleFormat = /^\s*couple\b/i.test(guestData.firstName?.trim() || '');
    let processedGuestData = guestData;

    if (isCoupleFormat && guestData.attendanceType === 'couple') {
      // Extract names from "Couple ..." format and accept even one token (e.g. "Couple Didier").
      const coupleText = (guestData.firstName || '').replace(/^\s*couple\s*/i, '').trim();
      const nameParts = coupleText ? coupleText.split(/\s+/) : [];

      const firstName = nameParts[0] || 'Couple';
      const lastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : '';

      processedGuestData = {
        firstName,
        lastName,
        attendanceType: 'couple',
        partnerFirstName: firstName,
        partnerLastName: lastName,
      };
    }

    const apiResult = await requestGuestLogApi({
      action: 'add',
      guestData: processedGuestData,
      language,
      invitationData,
      coupleFormat: isCoupleFormat, // Flag to tell API to create duplicate entries
    }, variant);

    if (apiResult?.entries) {
      syncLocalMirror(apiResult.entries, variant);
      return apiResult.entries;
    }

    throw new Error('Registration could not be saved on the server. Please try again.');
  })();
};

export const findGuestByInvitation = async (
  invitationCode: string,
  verificationHash: string,
  variant: GuestLogVariant = DEFAULT_VARIANT
): Promise<GuestLogEntry | null> => {
  const apiResult = await requestGuestLogApi({
    action: 'find',
    invitationCode,
    verificationHash,
  }, variant);

  if (typeof apiResult?.entry !== 'undefined') {
    return apiResult.entry ?? null;
  }

  const normalizedCode = invitationCode.trim().toUpperCase();
  const normalizedHash = verificationHash.trim().toUpperCase();

  return getGuestLogLocal(variant).find(
    (entry) =>
      entry.invitationCode.trim().toUpperCase() === normalizedCode &&
      entry.verificationHash.trim().toUpperCase() === normalizedHash
  ) || null;
};

export const checkInGuestByInvitation = (
  invitationCode: string,
  verificationHash: string,
  variant: GuestLogVariant = DEFAULT_VARIANT
): Promise<GuestCheckInResult> => {
  return (async () => {
  const apiResult = await requestGuestLogApi({
    action: 'checkin',
    invitationCode,
    verificationHash,
  }, variant);

  if (apiResult?.result) {
    if (apiResult.entries) {
      syncLocalMirror(apiResult.entries, variant);
    }

    return apiResult.result;
  }

  const entries = getGuestLogLocal(variant);
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

  saveGuestLogLocal(entries, variant);
  return 'checked-in';
  })();
};

export const downloadGuestLogFile = (
  entries: GuestLogEntry[] = getGuestLogLocal(),
  variant: GuestLogVariant = DEFAULT_VARIANT
) => {
  if (!isBrowser()) return;

  const { downloadFileName } = getGuestLogConfig(variant);

  const blob = new Blob([JSON.stringify(entries, null, 2)], {
    type: 'application/json',
  });

  const downloadUrl = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = downloadUrl;
  link.download = downloadFileName;
  link.click();
  URL.revokeObjectURL(downloadUrl);
};

export const downloadGuestLogCsv = (
  entries: GuestLogEntry[] = getGuestLogLocal(),
  variant: GuestLogVariant = DEFAULT_VARIANT
) => {
  if (!isBrowser()) return;

  const { downloadFileName } = getGuestLogConfig(variant);

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
  link.download = downloadFileName.replace('.json', '.csv');
  link.click();
  URL.revokeObjectURL(downloadUrl);
};

export const hasGuestLogAccess = (variant: GuestLogVariant = DEFAULT_VARIANT) => {
  if (!isBrowser()) return false;
  const { accessSessionKey } = getGuestLogConfig(variant);
  return window.sessionStorage.getItem(accessSessionKey) === 'granted';
};

export const grantGuestLogAccess = (code: string, variant: GuestLogVariant = DEFAULT_VARIANT) => {
  if (!isBrowser()) return false;

  const expectedCode = (process.env.NEXT_PUBLIC_GUEST_LOG_ACCESS_CODE || '').trim();
  const normalizedCode = code.trim();

  const isAllowed = expectedCode
    ? normalizedCode === expectedCode
    : normalizedCode === DEFAULT_ACCESS_CODE || normalizedCode === LEGACY_ACCESS_CODE;

  if (isAllowed) {
    const { accessSessionKey } = getGuestLogConfig(variant);
    window.sessionStorage.setItem(accessSessionKey, 'granted');
  }

  return isAllowed;
};

export const importGuestLog = (
  incoming: GuestLogEntry[],
  variant: GuestLogVariant = DEFAULT_VARIANT
): { added: number; skipped: number } => {
  const existing = getGuestLogLocal(variant);
  const existingCodes = new Set(existing.map((e) => e.invitationCode));
  const newEntries = incoming.filter((e) => !existingCodes.has(e.invitationCode));
  saveGuestLogLocal([...newEntries, ...existing], variant);
  return { added: newEntries.length, skipped: incoming.length - newEntries.length };
};

export const importGuestLogRemote = async (
  incoming: GuestLogEntry[],
  variant: GuestLogVariant = DEFAULT_VARIANT
): Promise<{ added: number; skipped: number }> => {
  const apiResult = await requestGuestLogApi({ action: 'import', incoming }, variant);

  if (typeof apiResult?.added === 'number' && typeof apiResult?.skipped === 'number') {
    if (apiResult.entries) {
      syncLocalMirror(apiResult.entries, variant);
    }

    return {
      added: apiResult.added,
      skipped: apiResult.skipped,
    };
  }

  return importGuestLog(incoming, variant);
};

function escapeCsvValue(value: unknown) {
  const normalized = value == null ? '' : String(value);

  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}
