import { AlertTriangle, CheckCircle } from 'lucide-react';

interface ErrorReportModalProps {
  isOpen: boolean;
  errorText: string;
  sending: boolean;
  sent: boolean;
  sendError: string | null;
  onChangeText: (value: string) => void;
  onClose: () => void;
  onSubmit: () => void | Promise<void>;
}

export default function ErrorReportModal({
  isOpen,
  errorText,
  sending,
  sent,
  sendError,
  onChangeText,
  onClose,
  onSubmit,
}: ErrorReportModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm">
      <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 relative">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-slate-400 hover:text-slate-600 text-xl font-bold"
        >
          &times;
        </button>
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 bg-amber-100 text-amber-600 rounded-lg">
            <AlertTriangle size={20} />
          </div>
          <h3 className="text-lg font-bold text-slate-800">Reportar un Error</h3>
        </div>

        {sent ? (
          <div className="text-center py-4">
            <div className="w-12 h-12 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-3 border border-emerald-100">
              <CheckCircle size={26} />
            </div>
            <p className="text-sm font-semibold text-slate-800">¡Gracias por tu reporte!</p>
            <p className="text-xs text-slate-500 mt-1">Lo revisaremos pronto.</p>
            <button
              onClick={onClose}
              className="mt-5 px-4 py-2 text-sm font-semibold bg-slate-900 hover:bg-slate-800 text-white rounded-lg transition-all"
            >
              Cerrar
            </button>
          </div>
        ) : (
          <>
            <p className="text-sm text-slate-600 mb-4">
              Describe brevemente el problema que encontraste para que podamos solucionarlo lo antes posible.
            </p>
            <textarea
              maxLength={350}
              value={errorText}
              onChange={(event) => onChangeText(event.target.value)}
              className="w-full border border-slate-200 rounded-xl p-3 text-sm min-h-[100px] focus:ring-2 focus:ring-amber-500 focus:border-amber-500 outline-none"
              placeholder="Ej: La imagen no carga, el botón de enviar no funciona..."
            ></textarea>
            <p className="text-[10px] text-slate-400 text-right mt-1 tabular-nums">{errorText.length}/350</p>
            {sendError && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                <AlertTriangle size={13} className="shrink-0" />
                {sendError}
              </p>
            )}
            <div className="mt-4 flex justify-end gap-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-semibold text-slate-600 hover:bg-slate-50 rounded-lg transition-all"
              >
                Cancelar
              </button>
              <button
                onClick={onSubmit}
                disabled={errorText.trim().length < 3 || sending}
                className="px-4 py-2 text-sm font-semibold bg-amber-500 hover:bg-amber-600 disabled:opacity-50 disabled:cursor-not-allowed text-white rounded-lg shadow-sm transition-all"
              >
                {sending ? 'Enviando…' : 'Enviar Reporte'}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
