import { promises as fs } from 'fs';
import path from 'path';
import { NextResponse } from 'next/server';
import { list, put } from '@vercel/blob';

type Language = 'en' | 'fr' | 'it';

type GuestData = {
  firstName: string;
  lastName: string;
  attendanceType: 'single' | 'couple';
  partnerFirstName?: string;
  partnerLastName?: string;
};

type GuestLogEntry = GuestData & {
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

type GuestCheckInResult = 'checked-in' | 'already-checked-in' | 'not-found';

export const runtime = 'nodejs';

const BLOB_FILE_NAME = 'guest-log.json';

const resolveLocalFilePath = () => {
  if (process.env.GUEST_LOG_FILE_PATH) return process.env.GUEST_LOG_FILE_PATH;
  if (process.env.VERCEL) return '/tmp/guest-log.json';
  return path.join(process.cwd(), 'data', 'guest-log.json');
};

const useBlob = () => Boolean(process.env.BLOB_READ_WRITE_TOKEN);

async function readEntriesFromBlob(): Promise<GuestLogEntry[]> {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) return [];

  const { blobs } = await list({ prefix: BLOB_FILE_NAME, limit: 1, token });
  const fileBlob = blobs[0];

  if (!fileBlob) return [];

  const response = await fetch(fileBlob.url, { cache: 'no-store' });
  if (!response.ok) return [];

  const data = (await response.json()) as unknown;
  return Array.isArray(data) ? (data as GuestLogEntry[]) : [];
}

async function writeEntriesToBlob(entries: GuestLogEntry[]) {
  const token = process.env.BLOB_READ_WRITE_TOKEN;
  if (!token) {
    throw new Error('Missing BLOB_READ_WRITE_TOKEN');
  }

  await put(BLOB_FILE_NAME, JSON.stringify(entries, null, 2), {
    access: 'public',
    addRandomSuffix: false,
    contentType: 'application/json',
    token,
  });
}

async function readEntriesFromFile(): Promise<GuestLogEntry[]> {
  const filePath = resolveLocalFilePath();

  try {
    const raw = await fs.readFile(filePath, 'utf-8');
    const parsed = JSON.parse(raw) as unknown;
    return Array.isArray(parsed) ? (parsed as GuestLogEntry[]) : [];
  } catch {
    return [];
  }
}

async function writeEntriesToFile(entries: GuestLogEntry[]) {
  const filePath = resolveLocalFilePath();
  await fs.mkdir(path.dirname(filePath), { recursive: true });
  await fs.writeFile(filePath, JSON.stringify(entries, null, 2), 'utf-8');
}

async function readEntries(): Promise<GuestLogEntry[]> {
  if (useBlob()) {
    return readEntriesFromBlob();
  }

  return readEntriesFromFile();
}

async function writeEntries(entries: GuestLogEntry[]) {
  if (useBlob()) {
    await writeEntriesToBlob(entries);
    return;
  }

  await writeEntriesToFile(entries);
}

function normalize(value: string) {
  return value.trim().toUpperCase();
}

export async function GET() {
  const entries = await readEntries();
  return NextResponse.json({
    entries,
    storage: useBlob() ? 'blob' : process.env.VERCEL ? 'tmp-file' : 'local-file',
  });
}

export async function POST(request: Request) {
  const parsedBody = (await request.json()) as
    | {
        action?: 'add' | 'find' | 'checkin' | 'import';
        guestData?: GuestData;
        language?: Language;
        invitationData?: {
          fileName: string;
          invitationCode: string;
          verificationHash: string;
        };
        invitationCode?: string;
        verificationHash?: string;
        incoming?: GuestLogEntry[];
      }
    | undefined;

  const body = parsedBody || {};

  const action = body?.action;
  const entries = await readEntries();

  if (action === 'add' && body.guestData && body.language && body.invitationData) {
    const attendanceCount = body.guestData.attendanceType === 'couple' ? 2 : 1;
    const normalizedCode = normalize(body.invitationData.invitationCode);
    const normalizedHash = normalize(body.invitationData.verificationHash);

    const existing = entries.find(
      (entry) =>
        normalize(entry.invitationCode) === normalizedCode &&
        normalize(entry.verificationHash) === normalizedHash
    );

    if (!existing) {
      const entry: GuestLogEntry = {
        ...body.guestData,
        id: `guest-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
        language: body.language,
        pdfFileName: body.invitationData.fileName,
        invitationCode: body.invitationData.invitationCode,
        verificationHash: body.invitationData.verificationHash,
        attendanceCount,
        status: 'confirmed',
        checkInStatus: 'pending',
        createdAt: new Date().toISOString(),
      };

      entries.unshift(entry);
      await writeEntries(entries);
    }

    return NextResponse.json({ entries });
  }

  if (action === 'find' && body.invitationCode && body.verificationHash) {
    const normalizedCode = normalize(body.invitationCode);
    const normalizedHash = normalize(body.verificationHash);

    const entry =
      entries.find(
        (guest) =>
          normalize(guest.invitationCode) === normalizedCode &&
          normalize(guest.verificationHash) === normalizedHash
      ) || null;

    return NextResponse.json({ entry });
  }

  if (action === 'checkin' && body.invitationCode && body.verificationHash) {
    const normalizedCode = normalize(body.invitationCode);
    const normalizedHash = normalize(body.verificationHash);

    const index = entries.findIndex(
      (guest) =>
        normalize(guest.invitationCode) === normalizedCode &&
        normalize(guest.verificationHash) === normalizedHash
    );

    let result: GuestCheckInResult = 'not-found';

    if (index !== -1) {
      if (entries[index].checkInStatus === 'checked-in') {
        result = 'already-checked-in';
      } else {
        entries[index] = {
          ...entries[index],
          checkInStatus: 'checked-in',
        };

        await writeEntries(entries);
        result = 'checked-in';
      }
    }

    return NextResponse.json({ result, entries });
  }

  if (action === 'import' && Array.isArray(body.incoming)) {
    const existingCodes = new Set(entries.map((entry) => entry.invitationCode));
    const toAdd = body.incoming.filter((entry) => !existingCodes.has(entry.invitationCode));
    const updated = [...toAdd, ...entries];

    await writeEntries(updated);

    return NextResponse.json({
      entries: updated,
      added: toAdd.length,
      skipped: body.incoming.length - toAdd.length,
    });
  }

  return NextResponse.json({ error: 'Unsupported action' }, { status: 400 });
}
