/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { Search, Camera, AlertCircle, HelpCircle, User } from 'lucide-react';
import { FoundPerson, MatchResult } from '../types';
import { buscarPersona, reportarPublicacion } from '../api';
import PhotoUploader, { Photo } from './form/PhotoUploader';
import HelpModal, { HelpStep } from './form/HelpModal';
import DocumentInput from './form/DocumentInput';
import { useFormDraft } from './form/useFormDraft';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import AnalysisProgress from './search/AnalysisProgress';
import CandidateModal from './search/CandidateModal';
import SearchResultsList from './search/SearchResultsList';
import TextField from './form/TextField';

// ponytail: capacity knob — set to 1 for single-photo mode, raise to allow more
const MAX_IMAGES = 1;
const PAGE_SIZE = 6;

// Arma el enlace de WhatsApp a partir del teléfono (normaliza a internacional +58).
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
  { n: 1, t: 'Subir Fotografía', d: 'Sube una foto del rostro de la persona que buscas. Asegúrate de que no salga con otra persona y no sea un flyer (cartel de búsqueda).' },
  { n: 2, t: 'Datos de la Persona', d: 'Llena el nombre y la cédula. Puede ser solo uno de los dos si no te sabes ambos (o el nombre o la cédula).' },
  { n: 3, t: 'Ver Coincidencias', d: 'El sistema buscará coincidencias con las personas reportadas. Verás su foto, descripción y ubicación.' },
  { n: 4, t: 'Contacto Seguro', d: 'Ante una coincidencia cierta, solicita el reencuentro y preséntate en el lugar con tu identificación oficial.' },
];

interface SearchMissingFormProps {
  onBack: () => void;
}

export default function SearchMissingForm({ onBack }: SearchMissingFormProps) {
  const [showHelp, setShowHelp] = useState(false);
  // Persistido entre cambios de pestaña (draft 'search.*')
  const [photos, setPhotos] = useFormDraft<Photo[]>('search.photos', []);
  const [qNombre, setQNombre] = useFormDraft('search.qNombre', '');
  const [qDocTipo, setQDocTipo] = useFormDraft('search.qDocTipo', 'V');
  const [qDocNumero, setQDocNumero] = useFormDraft('search.qDocNumero', '');
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [analysisProgress, setAnalysisProgress] = useState(0);
  const [analysisStep, setAnalysisStep] = useState('');
  const [searchResults, setSearchResults] = useState<MatchResult[] | null>(null);
  const [selectedCandidate, setSelectedCandidate] = useState<FoundPerson | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [idError, setIdError] = useState<string | null>(null);
  const [resultsError, setResultsError] = useState<string | null>(null);
  const [reportedIds, setReportedIds] = useState<string[]>([]);
  const [page, setPage] = useState(0);
  const [confirmingId, setConfirmingId] = useState<string | null>(null);

  const inFlight = useRef(false); // evita peticiones duplicadas si el usuario satura el botón

  const { addFiles, removePhoto, resetPhotos } = usePhotoUpload({
    max: MAX_IMAGES,
    photos,
    setPhotos,
    onAdd: () => setError(null),
  });

  const startAnalysis = (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return; // ya hay una búsqueda en curso, ignora el reintento

    // Valida todo de una: ambos errores salen en el mismo click
    const noPhoto = photos.length === 0;
    const noId = !qNombre.trim() && !qDocNumero.trim();
    setError(noPhoto ? 'Por favor, selecciona o sube al menos una foto de la persona que buscas.' : null);
    setIdError(noId ? 'Indica al menos el nombre o la cédula de quien buscas.' : null);
    if (noPhoto || noId) return;

    inFlight.current = true;
    setIsAnalyzing(true);
    setAnalysisProgress(0);
    setAnalysisStep('Subiendo fotos...');
    setPage(0);
    setResultsError(null);

    // Loader paced to ~10s: climbs smoothly toward 95% and waits there until the
    // backend responds; on response it snaps straight to 100% (early or late).
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

    buscarPersona({
      files: photos.map((p) => p.file),
      nombre: qNombre,
      docTipo: qDocTipo,
      docNumero: qDocNumero,
    })
      .then((results) => {
        done = true;
        inFlight.current = false;
        clearInterval(tick);
        setAnalysisProgress(100);
        setAnalysisStep('Búsqueda completada.');
        setSearchResults(results);
        setIsAnalyzing(false);
      })
      .catch((err) => {
        done = true;
        inFlight.current = false;
        clearInterval(tick);
        setIsAnalyzing(false);
        setAnalysisProgress(0);
        setError(err instanceof Error ? err.message : 'No se pudo completar la búsqueda. Intenta de nuevo.');
      });
  };

  const handleResetSearch = () => {
    resetPhotos();
    setIdError(null);
    setError(null);
    setResultsError(null);
    setSearchResults(null);
    setSelectedCandidate(null);
    setReportedIds([]);
    setPage(0);
  };

  const handleReportPublication = async (personId: string) => {
    setReportedIds((prev) => [...prev, personId]);
    setConfirmingId(null);
    setResultsError(null);

    try {
      await reportarPublicacion(personId);
    } catch {
      setReportedIds((prev) => prev.filter((currentId) => currentId !== personId));
      setResultsError('No se pudo enviar el reporte en este momento. Intenta de nuevo.');
    }
  };

  const handleOpenCandidate = (personId: string) => {
    const person = searchResults?.find((result) => result.foundPerson.id === personId)?.foundPerson ?? null;
    setSelectedCandidate(person);
  };

  const isFormValid = photos.length > 0 && (qNombre.trim() !== '' || qDocNumero.trim() !== '');

  if (searchResults) {
    return (
      <>
        <SearchResultsList
          results={searchResults}
          page={page}
          pageSize={PAGE_SIZE}
          reportedIds={reportedIds}
          confirmingId={confirmingId}
          resultsError={resultsError}
          onResetSearch={handleResetSearch}
          onOpenCandidate={handleOpenCandidate}
          onConfirmReport={setConfirmingId}
          onReportPublication={(personId) => {
            void handleReportPublication(personId);
          }}
          onPageChange={setPage}
          onBack={onBack}
        />
        <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} waLink={waLink} />
      </>
    );
  }

  return (
    <div className="w-full flex flex-col items-center" id="search-missing-view">
      <div className="w-full max-w-lg pb-4 mb-4">
        <div className="flex justify-between items-start mb-6">
          <button 
            type="button" 
            onClick={isAnalyzing ? handleResetSearch : onBack}
            className="flex items-center gap-2 text-rose-600 font-bold hover:text-rose-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Volver
          </button>
          
          {!isAnalyzing && (
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="p-1.5 bg-rose-50 text-rose-600 hover:bg-rose-100 rounded-full transition-all shadow-sm"
              title="Ver instrucciones"
              aria-label="Ver instrucciones"
            >
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                <circle cx="12" cy="12" r="10"></circle>
                <path d="M12 16v-4"></path>
                <path d="M12 8h.01"></path>
              </svg>
            </button>
          )}
        </div>

        {!isAnalyzing && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 shadow-sm">
                <Search size={22} />
              </div>
              <h2 className="text-[1.35rem] font-bold text-slate-800 leading-tight">Busco a alguien</h2>
            </div>
            <p className="text-slate-500 text-sm leading-snug">
              Sube una foto y busca coincidencias con reconocimiento facial en segundos.
            </p>
          </div>
        )}
      </div>

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Procedimiento de Búsqueda y Reencuentro"
        steps={HELP_STEPS}
        accent="rose"
        id="help-procedure-modal"
      />

      <div className="w-full max-w-lg">
        {isAnalyzing ? (
          <AnalysisProgress step={analysisStep} progress={analysisProgress} />
        ) : (
          <form onSubmit={startAnalysis} className="space-y-6">
            
          {/* Step 1: Image Selection */}
          <div className="space-y-4">
            <div className="flex items-center justify-between gap-2">
              <label className="text-sm font-bold text-slate-800 tracking-tight">
                Foto de la persona
              </label>
            </div>

            <PhotoUploader photos={photos} max={MAX_IMAGES} accent="rose" error={!!error} disabled={isAnalyzing} onAdd={addFiles} onRemove={removePhoto} />
            {error && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1" id="search-error">
                <AlertCircle size={13} className="shrink-0" />{error}
              </p>
            )}

            {/* Identidad de la persona buscada */}
            <div className="space-y-4 pt-2">
              <div className="space-y-2">
                  <TextField
                    label="Nombre de la persona"
                    id="search-nombre"
                    placeholder="Juan Pérez"
                    maxLength={80}
                    value={qNombre}
                    onChange={(value) => {
                      setQNombre(value);
                      setIdError(null);
                    }}
                    accent="rose"
                    invalid={!!idError}
                  />
              </div>
              <div className="space-y-2">
                <label htmlFor="search-doc" className="text-sm font-bold text-slate-800 tracking-tight block">Cédula</label>
                <DocumentInput
                  tipo={qDocTipo}
                  numero={qDocNumero}
                  onTipo={setQDocTipo}
                  onNumero={(v) => { setQDocNumero(v); setIdError(null); }}
                  accent="rose"
                  error={!!idError}
                  numeroId="search-doc"
                />
              </div>
              {idError && (
                <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={13} className="shrink-0" />{idError}</p>
              )}
            </div>
          </div>

              <button
                type="submit"
                disabled={!isFormValid || isAnalyzing}
                className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2 mt-4"
                id="btn-trigger-search"
              >
                <Search size={20} />
                Iniciar Búsqueda
              </button>
            </form>
        )}
      </div>

      <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} waLink={waLink} />
    </div>
  );
}
