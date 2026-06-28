import { useState } from 'react';
import { UserRoundSearch, Camera, AlertCircle, FileText, Heart, MapPin, Phone, ArrowRight, HelpCircle, X, Flag } from 'lucide-react';
import { useForm,  } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';

import { buscarPersona, reportarPublicacion } from '@/api';

import PhotoUploader, {type Photo } from '../form/PhotoUploader';
import HelpModal, { HelpStep } from '../form/HelpModal';
import DocumentInput from '../form/DocumentInput';
import { inputClasses } from '../form/Field';
import { fieldError } from '../form/fieldError';
import { searchByImageSchema, searchByImageDefaults,  } from './missing.schema';

import type{ FoundPerson, MatchResult } from '@/types';

const MAX_IMAGES = 1;
const PAGE_SIZE = 6;

const waLink = (phone: string) => {
  let d = (phone || '').replace(/\D/g, '');
  if (d.startsWith('58')) {
    /* ya internacional */
  } else if (d.startsWith('0')) {
    d = `58${d.slice(1)}`;
  } else {
    d = `58${d}`;
  }
  return `https://wa.me/${d}`;
};

const HELP_STEPS: HelpStep[] = [
  { n: 1, t: 'Subir Fotografía', d: 'Sube una foto del rostro de la persona que buscas. Se requiere visibilidad frontal clara.' },
  { n: 2, t: 'Cotejo Facial AI', d: 'El sistema extrae un vector facial (embedding) y lo compara por distancia coseno en ChromaDB.' },
  { n: 3, t: 'Ver Coincidencias', d: 'Los resultados se ordenan por semejanza. Verás la descripción física y el centro de refugio.' },
  { n: 4, t: 'Contacto Seguro', d: 'Ante una coincidencia cierta, solicita el reencuentro y preséntate con tu identificación oficial.' },
];

const toPhotos = (v: unknown) => v as Photo[];

export default function SearchMissingForm() {
  const [showHelp, setShowHelp] = useState(false);
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [searchResults, setSearchResults] = useState<MatchResult[] | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<FoundPerson | null>(null);
  const [searchError, setSearchError] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const form = useForm({
    defaultValues: searchByImageDefaults,
    validators: { onSubmit: searchByImageSchema },
    onSubmit: async ({ value }) => {
      setSearchError(null);

      setIsAnalyzing(true);
      setAnalysisProgress(0);
      setAnalysisStep('Subiendo fotos...');
      setPage(0);

      const TOTAL_MS = 10000;
      const start = Date.now();
      let done = false;

      const tick = setInterval(() => {
        if (done) return;
        const pct = Math.min(95, ((Date.now() - start) / TOTAL_MS) * 100);
        setAnalysisProgress(Math.round(pct));
        setAnalysisStep(
          pct < 20 ? 'Normalizando imagen...' :
          pct < 45 ? 'Extrayendo rasgos faciales...' :
          pct < 70 ? 'Consultando base de datos...' :
          'Comparando coincidencias...'
        );
      }, 100);

      try {
        const results = await buscarPersona({
          files: toPhotos(value.photos).map((p) => p.file),
          nombre: value.qNombre,
          docTipo: value.qDocTipo,
          docNumero: value.qDocNumero,
        });
        done = true;
        clearInterval(tick);
        setAnalysisProgress(100);
        setAnalysisStep('Búsqueda completada.');
        setTimeout(() => {
          setSearchResults(results);
          setIsAnalyzing(false);
        }, 400);
      } catch (err) {
        done = true;
        clearInterval(tick);
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        setSearchError(err instanceof Error ? err.message : 'No se pudo completar la búsqueda. Intenta de nuevo.');
      }
    },
  });

  const qDocTipo = useSelector(form.store, (state) => state.values.qDocTipo);
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);

  const addFiles = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    form.setFieldValue('photos', (prev: unknown) => {
      const current = toPhotos(prev);
      const room = MAX_IMAGES - current.length;
      return [...current, ...imgs.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))];
    });
  };
  const removePhoto = (idx: number) => form.setFieldValue('photos', (prev: unknown) => toPhotos(prev).filter((_, i) => i !== idx));

  const handleResetSearch = () => {
    form.reset();
    setSearchResults(null);
    setSelectedCandidate(null);
    setReportedIds([]);
    setPage(0);
  };

  const totalPages = searchResults ? Math.ceil(searchResults.length / PAGE_SIZE) : 0;
  const pageItems = searchResults ? searchResults.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE) : [];

  const photos = useSelector(form.store, (state) => state.values.photos);

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6" id="search-missing-view">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-50 text-rose-600 rounded-xl shrink-0">
            <UserRoundSearch size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Buscar Familiar</h2>
            <p className="text-sm text-slate-500 leading-snug">Sube una foto y busca coincidencias por reconocimiento facial.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 transition-all"
          id="btn-toggle-help"
        >
          <HelpCircle size={15} />
          ¿CÓMO FUNCIONA?
        </button>
      </div>

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Procedimiento de Búsqueda y Reencuentro"
        steps={HELP_STEPS}
        accent="rose"
        id="help-procedure-modal"
      />

      {!searchResults ? (
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-5">
          {searchError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{searchError}</span>
            </div>
          )}
          <div className="space-y-3">
            <form.Field name="photos">
              {(field) => {
                const photoError = fieldError(field.state.meta.errors?.[0]);
                return (
                  <div className="space-y-3">
                    <div className="flex items-center justify-between gap-2">
                      <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                        <Camera size={14} className="text-blue-600" />
                        Fotos de la persona
                      </label>
                      {toPhotos(photos).length > 0 && <span className="text-[11px] font-semibold text-slate-400">{toPhotos(photos).length}/{MAX_IMAGES}</span>}
                    </div>
                    <PhotoUploader photos={toPhotos(photos)} max={MAX_IMAGES} accent="blue" error={!!photoError} disabled={isAnalyzing} onAdd={addFiles} onRemove={removePhoto} />
                    {photoError && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1" id="search-error">
                        <AlertCircle size={13} className="shrink-0" />{photoError}
                      </p>
                    )}
                  </div>
                );
              }}
            </form.Field>

            <div className="space-y-2 pt-1">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider">
                  Datos de la persona que buscas <span className="text-rose-500">*</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5">Completa su nombre o su cedula
                  <strong> (no hacen falta ambos).</strong></p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <form.Field name="qNombre">
                  {(field) => (
                    <div className="space-y-1.5">
                      <label htmlFor="search-nombre" className="text-[11px] font-semibold text-slate-500 normal-case block">Nombre</label>
                      <input
                        id="search-nombre"
                        type="text"
                        placeholder="Nombre completo de quien buscas"
                        maxLength={80}
                        value={field.state.value}
                        onChange={(e) => { field.handleChange(e.target.value); field.setMeta((prev) => ({ ...prev, errors: [] })); }}
                        className={inputClasses('rose', !!field.state.meta.errors?.[0])}
                      />
                    </div>
                  )}
                </form.Field>
                <form.Field name="qDocNumero">
                  {(field) => {
                    const qDocNumeroError = field.state.meta.errors?.[0];
                    return (
                      <div className="space-y-1.5">
                        <label htmlFor="search-doc" className="text-[11px] font-semibold text-slate-500 normal-case block">Cédula</label>
                        <DocumentInput
                          tipo={qDocTipo}
                          numero={field.state.value}
                          onTipo={(v) => form.setFieldValue('qDocTipo', v)}
                          onNumero={(v) => { field.handleChange(v); field.setMeta((prev) => ({ ...prev, errors: [] })); }}
                          accent="rose"
                          error={!!qDocNumeroError}
                          numeroId="search-doc"
                        />
                      </div>
                    );
                  }}
                </form.Field>
              </div>
              <form.Field name="qDocNumero">
                {(field) => field.state.meta.errors?.[0] && (
                  <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={13} className="shrink-0" />{fieldError(field.state.meta.errors[0])}</p>
                )}
              </form.Field>
            </div>
          </div>

          {isAnalyzing ? (
            <div className="space-y-2.5 bg-slate-50 border border-slate-100 rounded-xl p-4" id="analysis-status">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="text-slate-600 font-medium truncate">{analysisStep}</span>
                <span className="text-rose-600 font-bold tabular-nums shrink-0">{analysisProgress}%</span>
              </div>
              <div className="w-full h-2.5 bg-slate-200 rounded-full overflow-hidden">
                <div
                  className="h-full bg-rose-500 rounded-full transition-[width] duration-200 ease-linear"
                  style={{ width: `${analysisProgress}%` }}
                ></div>
              </div>
              <p className="text-[11px] text-slate-400">Reconocimiento facial en proceso, no cierres esta ventana.</p>
            </div>
          ) : (
            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              id="btn-trigger-search"
            >
              <UserRoundSearch size={20} />
              Iniciar Búsqueda
            </button>
          )}
        </form>
      ) : (
        <div className="space-y-6" id="search-results-section">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 bg-rose-50/50 border border-rose-100 rounded-xl p-5">
            <div>
              <p className="text-xs font-bold text-rose-800 uppercase tracking-wider">Comparación completada con éxito</p>
              <h3 className="text-sm font-semibold text-slate-800 mt-0.5">Se encontraron {searchResults.length} registros coincidentes.</h3>
            </div>
            <button
              onClick={handleResetSearch}
              className="w-full sm:w-auto py-2.5 px-5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-sm rounded-xl transition-all shadow-md flex items-center justify-center gap-2 shrink-0"
              id="btn-re-search"
            >
              <UserRoundSearch size={18} />
              Buscar de nuevo
            </button>
          </div>

          <div className="space-y-3">
            <p className="text-xs font-bold text-slate-500 uppercase tracking-wide">Posibles coincidencias — toca una para ver sus datos:</p>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {pageItems.map((result, idx) => {
                const person = result.foundPerson;
                const hasCi = !!person.ci && !/desconocido|no aplica/i.test(person.ci);
                const isReported = reportedIds.includes(person.id);
                const isConfirming = confirmingId === person.id;

                return (
                  <div
                    key={person.id}
                    role="button"
                    tabIndex={isReported ? -1 : 0}
                    onClick={() => !isReported && setSelectedCandidate(person)}
                    onKeyDown={(e) => {
                      if (!isReported && (e.key === 'Enter' || e.key === ' ')) {
                        e.preventDefault();
                        setSelectedCandidate(person);
                      }
                    }}
                    className={`group text-left bg-white rounded-2xl border overflow-hidden transition-all ${
                      isReported
                        ? 'border-slate-200 opacity-60 cursor-default'
                        : 'border-slate-200 hover:border-rose-300 hover:shadow-lg cursor-pointer'
                    }`}
                    id={`match-card-${idx}`}
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
                        <div className="flex items-center justify-between gap-2 pt-1" onClick={(e) => e.stopPropagation()}>
                          <span className="text-xs font-semibold text-slate-600">¿Reportar como falso?</span>
                          <div className="flex items-center gap-1.5 shrink-0">
                            <button
                              type="button"
                              onClick={(e) => {
                                e.stopPropagation();
                                setReportedIds((prev) => [...prev, person.id]);
                                setConfirmingId(null);
                                reportarPublicacion(person.id).catch(() => {});
                              }}
                              className="px-2.5 py-1 rounded-md text-[11px] font-bold bg-amber-500 hover:bg-amber-600 text-white transition-all"
                            >
                              Sí
                            </button>
                            <button
                              type="button"
                              onClick={(e) => { e.stopPropagation(); setConfirmingId(null); }}
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
                            onClick={(e) => { e.stopPropagation(); setConfirmingId(person.id); }}
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
                  onClick={() => setPage((p) => Math.max(0, p - 1))}
                  disabled={page === 0}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  <ArrowRight size={15} className="rotate-180" /> Anterior
                </button>
                <span className="text-xs font-semibold text-slate-500 tabular-nums">Página {page + 1} de {totalPages}</span>
                <button
                  type="button"
                  onClick={() => setPage((p) => Math.min(totalPages - 1, p + 1))}
                  disabled={page >= totalPages - 1}
                  className="inline-flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold border border-slate-200 text-slate-700 hover:bg-slate-50 disabled:opacity-40 disabled:cursor-not-allowed transition-all"
                >
                  Siguiente <ArrowRight size={15} />
                </button>
              </div>
            )}
          </div>
        </div>
      )}

      {selectedCandidate && (
        <div className="fixed inset-0 z-60 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm transition-all" onClick={() => setSelectedCandidate(null)}>
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-md relative flex flex-col max-h-[90vh] overflow-hidden animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="relative shrink-0">
              <img
                src={selectedCandidate.imageUrl}
                alt={selectedCandidate.name}
                className="w-full h-64 sm:h-72 object-contain"
                referrerPolicy="no-referrer"
              />
              <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/70 to-transparent p-4 pt-10">
                <h4 className="font-bold text-white text-xl leading-tight">{selectedCandidate.name}</h4>
                {!!selectedCandidate.ci && !/desconocido|no aplica/i.test(selectedCandidate.ci) && (
                  <p className="text-xs text-white/80 font-mono mt-0.5">Cédula: {selectedCandidate.ci}</p>
                )}
              </div>
              <button
                onClick={() => setSelectedCandidate(null)}
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
                  <span><strong>{selectedCandidate.hospitalName}</strong> - {selectedCandidate.locationAddress}</span>
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Descripción Física y Estado:</span>
                <p className="text-slate-600 leading-relaxed bg-slate-50 border border-slate-200/50 rounded-xl p-3 font-sans italic text-xs">
                  "{selectedCandidate.physicalDescription}"
                </p>
              </div>

              <div>
                <span className="font-bold text-slate-700 block mb-1">Contacto de Enlace o Rescate:</span>
                <p className="text-slate-700 flex items-center gap-2 font-mono bg-slate-50 px-3 py-2 rounded-lg border border-slate-200/50">
                  <Phone size={14} className="text-slate-400 shrink-0" />
                  {selectedCandidate.contactPhone}
                </p>
              </div>

              <div className="pt-4 border-t border-slate-200/60">
                <a
                  href={waLink(selectedCandidate.contactPhone)}
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
      )}
    </div>
  );
}
