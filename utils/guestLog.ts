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
const DEFAULT_ACCESS_CODE = 'wedding-admin';

const isBrowser = () => typeof window !== 'undefined';

export const getGuestLog = (): GuestLogEntry[] => {
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

const saveGuestLog = (entries: GuestLogEntry[]) => {
  if (!isBrowser()) return;
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(entries));
};

export const saveGuestLogEntry = (
  guestData: GuestData,
  language: Language,
  invitationData: {
    fileName: string;
    invitationCode: string;
    verificationHash: string;
  }
): GuestLogEntry[] => {
  const attendanceCount = guestData.attendanceType === 'couple' ? 2 : 1;

  const entry: GuestLogEntry = {
    ...guestData,
    id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
    language,
    pdfFileName: invitationData.fileName,
    invitationCode: invitationData.invitationCode,
    verificationHash: invitationData.verificationHash,
    attendanceCount,
    status: 'confirmed',
    checkInStatus: 'pending',
    createdAt: new Date().toISOString(),
  };

  const updatedLog = [entry, ...getGuestLog()];

  saveGuestLog(updatedLog);

  return updatedLog;
};

export const findGuestByInvitation = (invitationCode: string, verificationHash: string) => {
  const normalizedCode = invitationCode.trim().toUpperCase();
  const normalizedHash = verificationHash.trim().toUpperCase();

  return getGuestLog().find(
    (entry) =>
      entry.invitationCode.trim().toUpperCase() === normalizedCode &&
      entry.verificationHash.trim().toUpperCase() === normalizedHash
  );
};

export const checkInGuestByInvitation = (
  invitationCode: string,
  verificationHash: string
): GuestCheckInResult => {
  const entries = getGuestLog();
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

  saveGuestLog(entries);
  return 'checked-in';
};

export const downloadGuestLogFile = (entries: GuestLogEntry[] = getGuestLog()) => {
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

export const downloadGuestLogCsv = (entries: GuestLogEntry[] = getGuestLog()) => {
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

  const expectedCode =
    (process.env.NEXT_PUBLIC_GUEST_LOG_ACCESS_CODE || DEFAULT_ACCESS_CODE).trim();
  const isAllowed = code.trim() === expectedCode;

  if (isAllowed) {
    window.sessionStorage.setItem(ACCESS_SESSION_KEY, 'granted');
  }

  return isAllowed;
};

export const importGuestLog = (incoming: GuestLogEntry[]): { added: number; skipped: number } => {
  const existing = getGuestLog();
  const existingCodes = new Set(existing.map((e) => e.invitationCode));
  const newEntries = incoming.filter((e) => !existingCodes.has(e.invitationCode));
  saveGuestLog([...newEntries, ...existing]);
  return { added: newEntries.length, skipped: incoming.length - newEntries.length };
};

function escapeCsvValue(value: unknown) {
  const normalized = value == null ? '' : String(value);

  if (normalized.includes(',') || normalized.includes('"') || normalized.includes('\n')) {
    return `"${normalized.replace(/"/g, '""')}"`;
  }

  return normalized;
}
