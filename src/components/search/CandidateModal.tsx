import { Heart, MapPin, Phone, X } from 'lucide-react';

import { FoundPerson } from '../../types';

interface CandidateModalProps {
  candidate: FoundPerson | null;
  onClose: () => void;
  waLink: (phone: string) => string;
}

export default function CandidateModal({ candidate, onClose, waLink }: CandidateModalProps) {
  if (!candidate) return null;

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all" onClick={onClose}>
      <div
        className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="relative shrink-0">
          <img
            src={candidate.imageUrl}
            alt={candidate.name}
            className="w-full h-64 sm:h-72 object-contain"
            referrerPolicy="no-referrer"
          />
          <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/70 to-transparent p-4 pt-10">
            <h4 className="font-bold text-white text-xl leading-tight">{candidate.name}</h4>
            {!!candidate.ci && !/desconocido|no aplica/i.test(candidate.ci) && (
              <p className="text-xs text-white/80 font-mono mt-0.5">Cédula: {candidate.ci}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="absolute top-3 right-3 text-white bg-black/30 hover:bg-black/50 p-1.5 rounded-full transition-all backdrop-blur-sm"
          >
            <X size={18} />
          </button>
        </div>

        <div className="overflow-y-auto p-5 sm:p-6 space-y-4 text-sm" id="candidate-detail-pane">
          <div>
            <span className="font-bold text-slate-700 block mb-1">Ubicación Actual:</span>
            <p className="text-slate-600 flex items-start gap-1.5">
              <MapPin size={16} className="text-rose-500 shrink-0 mt-0.5" />
              <span><strong>{candidate.hospitalName}</strong> - {candidate.locationAddress}</span>
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">Descripción Física y Estado:</span>
            <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-200/50 rounded-xl p-3 font-sans italic text-xs">
              "{candidate.physicalDescription}"
            </p>
          </div>

          <div>
            <span className="font-bold text-slate-700 block mb-1">Contacto de Enlace o Rescate:</span>
            <p className="text-slate-700 flex items-center gap-2 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/50">
              <Phone size={14} className="text-slate-400 shrink-0" />
              {candidate.contactPhone}
            </p>
          </div>

          <div className="pt-4 border-t border-slate-200/60">
            <a
              href={waLink(candidate.contactPhone)}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2"
              id="btn-request-reunion"
            >
              <Heart size={16} />
              Contactar vía WhatsApp
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}
