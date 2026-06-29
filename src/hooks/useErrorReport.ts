import { useState } from 'react';

type ReportErrorFn = (description: string) => Promise<unknown>;

export function useErrorReport(reportError: ReportErrorFn) {
  const [isOpen, setIsOpen] = useState(false);
  const [errorText, setErrorText] = useState('');
  const [sending, setSending] = useState(false);
  const [sent, setSent] = useState(false);
  const [sendError, setSendError] = useState<string | null>(null);

  const openModal = () => {
    setErrorText('');
    setSent(false);
    setSendError(null);
    setIsOpen(true);
  };

  const closeModal = () => {
    setIsOpen(false);
  };

  const submit = async () => {
    if (errorText.trim().length < 3 || sending) return;

    setSending(true);
    setSendError(null);

    try {
      await reportError(errorText);
      setSent(true);
      setErrorText('');
    } catch (error) {
      setSendError(error instanceof Error ? error.message : 'No se pudo enviar el reporte. Intenta de nuevo.');
    } finally {
      setSending(false);
    }
  };

  return {
    isOpen,
    errorText,
    sending,
    sent,
    sendError,
    setErrorText,
    openModal,
    closeModal,
    submit,
  };
}
