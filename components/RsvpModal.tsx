'use client';

import { useState } from 'react';
import { useLanguage } from '@/context/LanguageContext';
import { generatePdfInvitation } from '@/utils/pdfGenerator';
import type { GuestData } from '@/utils/pdfGenerator';
import {
  downloadGuestLogCsv,
  downloadGuestLogFile,
  getGuestLog,
  grantGuestLogAccess,
  hasGuestLogAccess,
  saveGuestLogEntry,
  type GuestLogVariant,
} from '@/utils/guestLog';

type RsvpModalProps = {
  isOpen: boolean;
  onClose: () => void;
  coupleName: string;
  variant?: GuestLogVariant;
};

export default function RsvpModal({ isOpen, onClose, coupleName, variant = 'religious' }: RsvpModalProps) {
  const { t, language } = useLanguage();
  const [step, setStep] = useState<'confirm' | 'form'>('confirm');
  const [formData, setFormData] = useState<GuestData>({
    firstName: '',
    lastName: '',
    attendanceType: 'single',
    partnerFirstName: '',
    partnerLastName: '',
  });
  const [isSubmitting, setIsSubmitting] = useState(false);

  if (!isOpen) return null;

  const handleConfirmYes = () => {
    setStep('form');
  };

  const handleConfirmNo = () => {
    setStep('confirm');
    onClose();
  };

  const handleFormChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const isCouple = formData.attendanceType === 'couple';
    
    // Check if this is a "Couple Name Surname" format
    const isCoupleFormat = formData.firstName?.trim().toLowerCase().startsWith('couple ');
    
    if (!formData.firstName || !formData.lastName) {
      alert(t('formError') || 'Please fill in all fields');
      return;
    }

    // For couple type: either "Couple Name Surname" format OR separate first/last names for both
    if (isCouple && !isCoupleFormat && (!formData.partnerFirstName || !formData.partnerLastName)) {
      alert(t('formError') || 'Please fill in all fields');
      return;
    }

    setIsSubmitting(true);
    try {
      const invitationMetadata = await generatePdfInvitation(formData, language);
      await saveGuestLogEntry(formData, language, invitationMetadata, variant);
      // Reset form and close modal
      setStep('confirm');
      setFormData({
        firstName: '',
        lastName: '',
        attendanceType: 'single',
        partnerFirstName: '',
        partnerLastName: '',
      });
      onClose();
    } catch (error) {
      console.error('PDF generation error:', error);
      const errorMsg = error instanceof Error ? error.message : 'Unknown error';
      alert(`Unable to generate invitation: ${errorMsg}. Please try again or contact support.`);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleCancel = () => {
    setStep('confirm');
    setFormData({
      firstName: '',
      lastName: '',
      attendanceType: 'single',
      partnerFirstName: '',
      partnerLastName: '',
    });
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-rose-950/50 p-4 backdrop-blur-sm">
      <div className="w-full max-w-md rounded-3xl bg-white p-8 shadow-xl fade-in-up">
        {step === 'confirm' ? (
          <>
            <h3 className="font-serif text-2xl text-rose-950">{t('confirmPresence')}</h3>

            <div className="mt-8 flex flex-col gap-3">
              <button
                type="button"
                className="rounded-full bg-rose-700 px-6 py-3 text-sm font-semibold text-white transition hover:bg-rose-800"
                onClick={handleConfirmYes}
              >
                {t('confirmYes')}
              </button>
              <button
                type="button"
                className="rounded-full border border-rose-200 px-6 py-3 text-sm font-semibold text-rose-800 transition hover:bg-rose-50"
                onClick={handleConfirmNo}
              >
                {t('confirmNo')}
              </button>
              <button
                type="button"
                className="mt-2 rounded-full border border-rose-100 px-6 py-2 text-xs font-semibold text-rose-700 transition hover:bg-rose-50"
                onClick={handleCancel}
              >
                {t('formCancel')}
              </button>
              <button
                type="button"
                className="rounded-full border border-rose-200 px-6 py-2 text-xs font-semibold text-rose-800 transition hover:bg-rose-50"
                onClick={async () => {
                  if (!hasGuestLogAccess(variant)) {
                    const code = window.prompt(t('guestRegistryAccessPrompt'));
                    if (!code) return;

                    const isAllowed = grantGuestLogAccess(code, variant);
                    if (!isAllowed) {
                      alert(t('guestRegistryAccessDenied'));
                      return;
                    }
                  }

                  const entries = await getGuestLog(variant);
                  downloadGuestLogFile(entries, variant);
                  downloadGuestLogCsv(entries, variant);
                }}
              >
                {t('downloadGuestRegistry')}
              </button>
            </div>
          </>
        ) : (
          <>
            <h3 className="font-serif text-2xl text-rose-950">{t('rsvp')}</h3>
            <p className="mt-2 text-sm text-rose-800">
              {t('yourPresence')} {coupleName}.
            </p>

            <form onSubmit={handleFormSubmit} className="mt-6 space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
                  {t('formAttendanceType')}
                </label>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, attendanceType: 'single' }))}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      formData.attendanceType === 'single'
                        ? 'border-rose-600 bg-rose-100 text-rose-800'
                        : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    {t('formSingle')}
                  </button>
                  <button
                    type="button"
                    onClick={() => setFormData((prev) => ({ ...prev, attendanceType: 'couple' }))}
                    className={`rounded-lg border px-4 py-2 text-sm font-semibold transition ${
                      formData.attendanceType === 'couple'
                        ? 'border-rose-600 bg-rose-100 text-rose-800'
                        : 'border-rose-200 text-rose-700 hover:bg-rose-50'
                    }`}
                  >
                    {t('formCouple')}
                  </button>
                </div>
                <p className="mt-2 text-xs text-rose-600">
                  💡 For couple: enter "Couple Name Surname" in the name field (e.g., "Couple Pippo Baudo") to auto-register both of you.
                </p>
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
                  {t('formName')}
                </label>
                <input
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="Lydie"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
                  {t('formFamilyName')}
                </label>
                <input
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleFormChange}
                  className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                  placeholder="Dupont"
                />
              </div>

              {formData.attendanceType === 'couple' && (
                <>
                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
                      {t('formPartnerName')}
                    </label>
                    <input
                      type="text"
                      name="partnerFirstName"
                      value={formData.partnerFirstName || ''}
                      onChange={handleFormChange}
                      className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      placeholder="Elie"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold uppercase tracking-wide text-rose-700">
                      {t('formPartnerFamilyName')}
                    </label>
                    <input
                      type="text"
                      name="partnerLastName"
                      value={formData.partnerLastName || ''}
                      onChange={handleFormChange}
                      className="mt-1 w-full rounded-lg border border-rose-200 px-4 py-2 text-sm focus:border-rose-400 focus:outline-none focus:ring-2 focus:ring-rose-200"
                      placeholder="Mukendi"
                    />
                  </div>
                </>
              )}

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="flex-1 rounded-full bg-rose-700 px-4 py-2 text-sm font-semibold text-white transition hover:bg-rose-800 disabled:opacity-50"
                >
                  {isSubmitting ? t('formGenerating') : t('formSubmit')}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  className="flex-1 rounded-full border border-rose-200 px-4 py-2 text-sm font-semibold text-rose-800 transition hover:bg-rose-50"
                >
                  {t('formCancel')}
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
