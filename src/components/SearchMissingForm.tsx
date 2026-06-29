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
import MatchGrid from './search/MatchGrid';
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

export default function SearchMissingForm() {
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

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-rose-500 p-4 sm:p-6" id="search-missing-view">
      <div className="flex flex-col gap-4 pb-4 mb-4 border-b border-rose-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-rose-600 text-white rounded-xl shrink-0 shadow-sm">
            <Search size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Quiero buscar a alguien</h2>
            <p className="text-sm text-slate-500 leading-snug">Sube una foto y busca coincidencias por reconocimiento facial.</p>
          </div>
        </div>
        
        <div className="flex justify-center w-full mt-1">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black border-2 border-amber-500 bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 hover:border-amber-600 transition-all active:scale-[0.98]"
            id="btn-toggle-help"
          >
            <HelpCircle size={16} className="shrink-0" />
            ¿CÓMO FUNCIONA?
          </button>
        </div>
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
        <form onSubmit={startAnalysis} className="space-y-5">
          {/* Step 1: Image Selection */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={14} className="text-rose-600" />
                Fotos de la persona
              </label>
              {photos.length > 0 && <span className="text-[11px] font-semibold text-slate-400">{photos.length}/{MAX_IMAGES}</span>}
            </div>

            <PhotoUploader photos={photos} max={MAX_IMAGES} accent="rose" error={!!error} disabled={isAnalyzing} onAdd={addFiles} onRemove={removePhoto} />
            {error && (
              <p className="text-xs text-red-600 mt-1 flex items-center gap-1" id="search-error">
                <AlertCircle size={13} className="shrink-0" />{error}
              </p>
            )}

            {/* Identidad de la persona buscada: basta UNO de los dos */}
            <div className="space-y-2 pt-1">
              <div>
                <p className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                  <User size={14} className="text-rose-600" />
                  Datos de la persona que buscas <span className="text-rose-500">*</span>
                </p>
                <p className="text-[11px] text-slate-400 mt-0.5 ml-5">Completa su nombre o su cedula
                  <strong> (no hacen falta ambos).</strong></p>
              </div>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <TextField
                    label="Nombre"
                    id="search-nombre"
                    placeholder="Nombre de quien buscas"
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
                <div className="space-y-1.5">
                  <label htmlFor="search-doc" className="text-[11px] font-semibold text-slate-500 normal-case block">Cédula</label>
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
              </div>
              {idError && (
                <p className="text-xs text-red-600 flex items-center gap-1"><AlertCircle size={13} className="shrink-0" />{idError}</p>
              )}
            </div>
          </div>

          {/* Action Trigger / Scanning Simulation overlay */}
          {isAnalyzing ? (
            <AnalysisProgress step={analysisStep} progress={analysisProgress} />
          ) : (
            <button
              type="submit"
              className="w-full py-3.5 bg-rose-600 hover:bg-rose-700 text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
              id="btn-trigger-search"
            >
              <Search size={20} />
              Iniciar Búsqueda
            </button>
          )}
        </form>
      ) : (
        <MatchGrid
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
        />
      )}

      <CandidateModal candidate={selectedCandidate} onClose={() => setSelectedCandidate(null)} waLink={waLink} />
    </div>
  );
}
