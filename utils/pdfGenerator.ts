'use client';

import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import QRCode from 'qrcode';
import { weddingData } from '@/data';
import { getTranslation, type Language } from '@/i18n/translations';

export type GuestData = {
  firstName: string;
  lastName: string;
  attendanceType: 'single' | 'couple';
  partnerFirstName?: string;
  partnerLastName?: string;
};

export type InvitationMetadata = {
  fileName: string;
  invitationCode: string;
  verificationHash: string;
};

const scheduleTranslationKeys = [
  { title: 'guestArrival', description: 'guestArrivalDesc' },
  { title: 'ceremony', description: 'ceremonyDesc' },
  { title: 'reception', description: 'receptionDesc' },
  { title: 'firstDance', description: 'firstDanceDesc' },
] as const;

const getLocale = (language: Language) => {
  if (language === 'fr') return 'fr-FR';
  if (language === 'it') return 'it-IT';
  return 'en-GB';
};

const localize = (language: Language, key: string) => getTranslation(language, key);

export const generatePdfInvitation = async (
  guestData: GuestData,
  language: Language = 'en'
): Promise<InvitationMetadata> => {
  const scheduleHtml = weddingData.schedule
    .map((event, index) => {
      const translationKeys = scheduleTranslationKeys[index];
      const translatedTitle = translationKeys
        ? localize(language, translationKeys.title)
        : event.title;
      const translatedDescription = translationKeys
        ? localize(language, translationKeys.description)
        : event.description;

      return `
        <div style="margin: 10px 0 14px 0;">
          <p style="font-size: 12px; color: #8b5a6e; margin: 0; letter-spacing: 0.4px;">
            <strong>${escapeHtml(event.time)}</strong> — ${escapeHtml(translatedTitle)}
          </p>
          <p style="font-size: 11px; color: #9b7280; margin: 6px 0 0 0; line-height: 1.4;">
            ${escapeHtml(translatedDescription)}
          </p>
        </div>
      `;
    })
    .join('');

  const formattedWeddingDate = new Date(weddingData.weddingDate).toLocaleDateString(
    getLocale(language),
    {
      weekday: 'long',
      day: 'numeric',
      month: 'long',
      year: 'numeric',
    }
  );

  const sanitizedFirst = guestData.firstName.replace(/[^a-z0-9]/gi, '');
  const sanitizedLast = guestData.lastName.replace(/[^a-z0-9]/gi, '');
  const sanitizedPartnerFirst = (guestData.partnerFirstName || '').replace(/[^a-z0-9]/gi, '');
  const sanitizedPartnerLast = (guestData.partnerLastName || '').replace(/[^a-z0-9]/gi, '');
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const randomSuffix = Math.random().toString(36).slice(2, 8);
  const fileName = `lydie-elie-invitation-${language}-${sanitizedFirst}-${sanitizedLast}${sanitizedPartnerFirst ? `-${sanitizedPartnerFirst}-${sanitizedPartnerLast}` : ''}-${timestamp}-${randomSuffix}.pdf`;

  const invitationCode = buildInvitationCode();
  const verificationHash = await buildVerificationHash({
    firstName: guestData.firstName,
    lastName: guestData.lastName,
    attendanceType: guestData.attendanceType,
    partnerFirstName: guestData.partnerFirstName,
    partnerLastName: guestData.partnerLastName,
    invitationCode,
    timestamp,
  });
  const guestCount = guestData.attendanceType === 'couple' ? 2 : 1;
  const primaryGuestFullName = `${guestData.firstName} ${guestData.lastName}`.trim();
  const partnerGuestFullName = `${guestData.partnerFirstName || ''} ${guestData.partnerLastName || ''}`.trim();
  const invitedGuestsText =
    guestData.attendanceType === 'couple' && partnerGuestFullName
      ? `${primaryGuestFullName} & ${partnerGuestFullName}`
      : primaryGuestFullName;

  const checkInUrl = buildCheckInUrl(invitationCode, verificationHash, invitedGuestsText, guestCount);
  const qrCodeDataUrl = await QRCode.toDataURL(checkInUrl, {
    width: 180,
    margin: 1,
    color: {
      dark: '#2f1a1f',
      light: '#fff9f7',
    },
  });

  // Create a temporary container for the invitation
  const container = document.createElement('div');
  
  // Use visibility: visible but position off-screen so it renders properly
  container.style.position = 'absolute';
  container.style.left = '-99999px';
  container.style.top = '0';
  container.style.width = '794px'; // A4 width at 96 DPI
  container.style.height = '1123px'; // A4 height at 96 DPI
  container.style.overflow = 'hidden';

  container.innerHTML = `
    <div style="
      width: 100%;
      height: 100%;
      padding: 40px;
      font-family: Georgia, 'Times New Roman', serif;
      background: linear-gradient(135deg, #fff9f7 0%, #fff5f3 100%);
      border: 2px solid #d7aeb8;
      box-shadow: inset 0 0 0 8px #fff9f7, inset 0 0 0 10px #e9c8cf;
      position: relative;
      display: flex;
      flex-direction: column;
      justify-content: center;
      align-items: center;
      text-align: center;
      box-sizing: border-box;
      overflow: hidden;
    ">
      <div style="position: absolute; top: 20px; left: 20px; font-size: 28px; color: #d59aaa;">❀</div>
      <div style="position: absolute; top: 20px; right: 20px; font-size: 28px; color: #d59aaa;">❀</div>
      <div style="position: absolute; bottom: 20px; left: 20px; font-size: 28px; color: #d59aaa;">❀</div>
      <div style="position: absolute; bottom: 20px; right: 20px; font-size: 28px; color: #d59aaa;">❀</div>

      <div style="margin-bottom: 30px;">
        <p style="font-size: 14px; letter-spacing: 4px; color: #a86c7c; text-transform: uppercase; margin: 0;">
          ${escapeHtml(localize(language, 'pdfInvitationTitle'))}
        </p>
        <h1 style="font-size: 52px; margin: 25px 0; color: #3d1f2a; font-weight: normal;">
          Lydie & Elie
        </h1>
        <p style="font-size: 14px; letter-spacing: 3px; color: #8b5a6e; margin: 10px 0;">
          ${escapeHtml(localize(language, 'pdfAreDelightedToInvite'))}
        </p>
        <p style="font-size: 32px; color: #5a3d42; margin: 15px 0; font-weight: bold;">
          ${escapeHtml(invitedGuestsText)}
        </p>
      </div>

      <div style="margin: 40px 0; border-top: 3px solid #d4a5b0; border-bottom: 3px solid #d4a5b0; padding: 35px 0; width: 100%; max-width: 600px;">
        <p style="font-size: 13px; letter-spacing: 3px; color: #a86c7c; text-transform: uppercase; margin: 0 0 20px 0;">
          ${escapeHtml(localize(language, 'pdfToCelebrate'))}
        </p>
        <p style="font-size: 18px; color: #3d1f2a; margin: 12px 0; text-transform: capitalize;">
          ${escapeHtml(formattedWeddingDate)}
        </p>
        <p style="font-size: 16px; color: #5a3d42; margin: 25px 0; font-weight: bold;">
          ${escapeHtml(weddingData.venue.name)}
        </p>
        <p style="font-size: 13px; color: #8b5a6e;">
          ${escapeHtml(weddingData.venue.address)}
        </p>
      </div>

      <div style="margin-top: 50px; width: 100%; max-width: 620px;">
        <p style="font-size: 12px; color: #a86c7c; letter-spacing: 2px; margin: 10px 0 14px 0; text-transform: uppercase;">
          ${escapeHtml(localize(language, 'pdfEventSchedule'))}
        </p>
        ${scheduleHtml}
      </div>

      <div style="margin-top: 60px; font-size: 11px; color: #a86c7c; text-align: center;">
        <p style="margin: 5px 0;">
          <strong>${escapeHtml(localize(language, 'pdfGuestCount'))}:</strong> ${guestCount}
        </p>
        <div style="margin: 16px auto 8px auto; width: 130px; border: 1px solid #dfbcc5; background: #fff; padding: 6px; border-radius: 10px;">
          <img src="${qrCodeDataUrl}" alt="QR" style="width: 100%; height: auto; display: block;" />
        </div>
        <p style="margin: 3px 0; font-size: 10px; letter-spacing: 1px; text-transform: uppercase;">
          ${escapeHtml(localize(language, 'pdfScanToValidate'))}
        </p>
        <p style="margin: 5px 0;">
          <strong>${escapeHtml(localize(language, 'pdfGenerated'))}:</strong> ${new Date().toLocaleDateString(
            getLocale(language)
          )}
        </p>
        <p style="margin: 12px 0 0 0; font-size: 10px; letter-spacing: 0.8px; color: #9e6f7a; text-transform: uppercase;">
          ${escapeHtml(localize(language, 'pdfValidIfListed'))}
        </p>
      </div>
    </div>
  `;

  document.body.appendChild(container);

  try {
    // Give browser time to render the content
    await new Promise((resolve) => setTimeout(resolve, 500));

    // Render HTML to canvas with optimal settings
    const canvas = await html2canvas(container, {
      scale: 2,
      useCORS: true,
      backgroundColor: '#fff9f7',
      logging: false,
      allowTaint: true,
      imageTimeout: 15000,
      ignoreElements: (element) => {
        return element.tagName === 'SCRIPT' || element.tagName === 'STYLE';
      },
    });

    // Verify canvas has actual data
    if (!canvas || canvas.width === 0 || canvas.height === 0) {
      throw new Error('Canvas rendering failed - invalid dimensions');
    }

    // Check canvas has pixel data
    const canvasData = canvas.getContext('2d');
    if (!canvasData) {
      throw new Error('Canvas context not available');
    }

    // Convert to image data - use JPEG for reliability
    const imgData = canvas.toDataURL('image/jpeg', 0.92);

    if (!imgData || imgData.length < 500) {
      throw new Error('Image rendering failed - output too small or empty');
    }

    // Get actual canvas dimensions to calculate proper PDF dimensions
    const canvasWidth = canvas.width;
    const canvasHeight = canvas.height;
    const ratio = canvasWidth / canvasHeight;

    // Create PDF document
    const pdf = new jsPDF({
      orientation: 'portrait',
      unit: 'mm',
      format: 'a4',
    });

    const pdfWidth = 210; // A4 width in mm
    const pdfHeight = pdfWidth / ratio;

    // Add image to PDF
    pdf.addImage(imgData, 'JPEG', 0, 0, pdfWidth, pdfHeight);

    // Save with sanitized filename
    pdf.save(fileName);
    return {
      fileName,
      invitationCode,
      verificationHash,
    };
  } catch (error) {
    const errorMsg = error instanceof Error ? error.message : String(error);
    console.error('PDF generation error:', errorMsg);
    throw new Error(`Failed to generate invitation: ${errorMsg}`);
  } finally {
    // Clean up
    if (document.body.contains(container)) {
      document.body.removeChild(container);
    }
  }
};

// Helper function to escape HTML special characters
function escapeHtml(text: string): string {
  const map: { [key: string]: string } = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  };
  return text.replace(/[&<>"']/g, (m) => map[m]);
}

function buildInvitationCode() {
  const datePart = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const randomPart = Math.random().toString(36).slice(2, 8).toUpperCase();
  return `LE-${datePart}-${randomPart}`;
}

async function buildVerificationHash(payload: Record<string, string | undefined>) {
  const normalized = Object.entries(payload)
    .map(([key, value]) => `${key}:${value || ''}`)
    .join('|');

  if (typeof window !== 'undefined' && window.crypto?.subtle) {
    const encoded = new TextEncoder().encode(normalized);
    const digest = await window.crypto.subtle.digest('SHA-256', encoded);
    const bytes = Array.from(new Uint8Array(digest))
      .slice(0, 8)
      .map((byte) => byte.toString(16).padStart(2, '0'))
      .join('');
    return bytes.toUpperCase();
  }

  let hash = 0;
  for (let i = 0; i < normalized.length; i++) {
    hash = (hash << 5) - hash + normalized.charCodeAt(i);
    hash |= 0;
  }

  return Math.abs(hash).toString(16).toUpperCase();
}

function buildCheckInUrl(
  invitationCode: string,
  verificationHash: string,
  guestName: string,
  guestCount: number
) {
  const baseUrl =
    process.env.NEXT_PUBLIC_APP_URL ||
    (typeof window !== 'undefined' ? window.location.origin : 'https://example.com');

  const url = new URL(baseUrl);
  url.searchParams.set('checkin', '1');
  url.searchParams.set('invitation', invitationCode);
  url.searchParams.set('hash', verificationHash);
  // Encode guest info directly in the URL so QR works on any device
  url.searchParams.set('guest', btoa(unescape(encodeURIComponent(guestName))));
  url.searchParams.set('count', String(guestCount));
  return url.toString();
}
