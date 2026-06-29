import { AlertCircle, ArrowRight, ArrowDown, FileText, Flag, MapPin, RefreshCw } from 'lucide-react';

import { MatchResult } from '../../types';

interface MatchGridProps {
  results: MatchResult[];
  page: number;
  pageSize: number;
  reportedIds: string[];
  confirmingId: string | null;
  resultsError: string | null;
  onResetSearch: () => void;
  onOpenCandidate: (personId: string) => void;
  onConfirmReport: (personId: string | null) => void;
  onReportPublication: (personId: string) => void;
  onPageChange: (nextPage: number) => void;
}

export default function MatchGrid({
  results,
  page,
  pageSize,
  reportedIds,
  confirmingId,
  resultsError,
  onResetSearch,
  onOpenCandidate,
  onConfirmReport,
  onReportPublication,
  onPageChange,
}: MatchGridProps) {
  const totalPages = Math.ceil(results.length / pageSize);
  const pageItems = results.slice(page * pageSize, page * pageSize + pageSize);

  return (
    <div className="space-y-6" id="search-results-section">
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-rose-50/50 border border-rose-100 rounded-xl p-5">
        <div>
          <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Comparación completada con éxito</p>
          <h3 className="text-sm font-semibold text-slate-800 mt-0.5">Se encontraron {results.length} registros coincidentes.</h3>
        </div>
        <button
          onClick={onResetSearch}
          className="w-full sm:w-auto py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
          id="btn-re-search"
        >
          <RefreshCw size={16} />
          Buscar de nuevo
        </button>
      </div>

      {resultsError && (
        <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm">
          <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
          <span>{resultsError}</span>
        </div>
      )}

      <div className="space-y-3">
        <div className="flex flex-col items-center justify-center text-center gap-1.5 my-6">
          <p className="text-sm font-black text-rose-600 uppercase tracking-wider">
            Posibles coincidencias ({results.length})
          </p>
          <p className="text-[11px] font-bold text-slate-500 uppercase tracking-wide">
            Toca una para ver sus datos
          </p>
          <div className="mt-1 text-rose-500">
            <ArrowDown size={22} strokeWidth={3} className="animate-bounce" />
          </div>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {pageItems.map((result, index) => {
            const person = result.foundPerson;
            const hasCi = !!person.ci && !/desconocido|no aplica/i.test(person.ci);
            const isReported = reportedIds.includes(person.id);
            const isConfirming = confirmingId === person.id;

            return (
              <div
                key={person.id}
                role="button"
                tabIndex={isReported ? -1 : 0}
                onClick={() => !isReported && onOpenCandidate(person.id)}
                onKeyDown={(event) => {
                  if (!isReported && (event.key === 'Enter' || event.key === ' ')) {
                    event.preventDefault();
                    onOpenCandidate(person.id);
                  }
                }}
                className={`group text-left bg-white rounded-2xl border overflow-hidden transition-all ${
                  isReported ? 'border-slate-200 opacity-60 cursor-default' : 'border-slate-200 hover:border-rose-300 hover:shadow-lg cursor-pointer'
                }`}
                id={`match-card-${index}`}
              >
                <img
                  src={person.imageUrl}
                  alt={person.name}
                  className={`w-full h-56 object-contain bg-slate-100 ${isReported ? 'grayscale' : ''}`}
                  referrerPolicy="no-referrer"
                />
                <div className="p-4 space-y-2">
                  <h4 className="text-base font-bold text-slate-800 leading-tight">{person.name}</h4>
                  <p className="text-sm text-slate-600 flex items-start gap-1.5">
                    <MapPin size={15} className="text-rose-500 shrink-0 mt-0.5" />
                    <span className="line-clamp-2">{person.hospitalName}</span>
                  </p>
                  {hasCi && (
                    <p className="text-xs text-slate-500 font-mono flex items-center gap-1.5">
                      <FileText size={13} className="text-slate-400 shrink-0" />
                      {person.ci}
                    </p>
                  )}

                  {isReported ? (
                    <p className="flex items-center gap-1.5 text-xs font-bold text-amber-600 pt-1">
                      <Flag size={13} /> Reportado como falso. ¡Gracias!
                    </p>
                  ) : isConfirming ? (
                    <div className="flex items-center justify-between gap-2 pt-1" onClick={(event) => event.stopPropagation()}>
                      <span className="text-xs font-semibold text-slate-600">¿Reportar como falso?</span>
                      <div className="flex items-center gap-1.5 shrink-0">
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onReportPublication(person.id);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all"
                        >
                          Sí
                        </button>
                        <button
                          type="button"
                          onClick={(event) => {
                            event.stopPropagation();
                            onConfirmReport(null);
                          }}
                          className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-slate-100 hover:bg-slate-200 text-slate-600 transition-all"
                        >
                          No
                        </button>
                      </div>
                    </div>
                  ) : (
                    <div className="flex items-center justify-between gap-2 pt-1">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-rose-600 group-hover:gap-2 transition-all">
                        Ver información <ArrowRight size={15} />
                      </span>
                      <button
                        type="button"
                        onClick={(event) => {
                          event.stopPropagation();
                          onConfirmReport(person.id);
                        }}
                        className="p-1.5 rounded-full text-slate-400 hover:text-amber-600 hover:bg-amber-50 transition-all shrink-0"
                        title="Reportar como falso"
                        aria-label="Reportar como falso"
                      >
                        <Flag size={15} />
                      </button>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between gap-3 pt-2">
            <button
              type="button"
              onClick={() => onPageChange(Math.max(0, page - 1))}
              disabled={page === 0}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              <ArrowRight size={15} className="rotate-180" /> Anterior
            </button>
            <span className="text-xs font-semibold text-slate-500 tabular-nums">Página {page + 1} de {totalPages}</span>
            <button
              type="button"
              onClick={() => onPageChange(Math.min(totalPages - 1, page + 1))}
              disabled={page >= totalPages - 1}
              className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
            >
              Siguiente <ArrowRight size={15} />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
