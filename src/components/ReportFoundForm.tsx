/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { UserCheck, Megaphone, Camera, AlertCircle, MapPin, Phone, Building, User, HelpCircle, PlusCircle } from 'lucide-react';
import { FoundPerson } from '../types';
import { reportarEncontrado, ResultadoRegistro } from '../api';
import PhotoUploader, { Photo } from './form/PhotoUploader';
import HelpModal, { HelpStep } from './form/HelpModal';
import DocumentInput from './form/DocumentInput';
import LocationCombobox from './form/LocationCombobox';
import { useFormDraft } from './form/useFormDraft';
import { usePhotoUpload } from '../hooks/usePhotoUpload';
import ChildToggle from './report/ChildToggle';
import ReportSuccess from './report/ReportSuccess';
import TextField from './form/TextField';
import TextAreaField from './form/TextAreaField';
import PhoneField from './form/PhoneField';
import { useSavedLocations } from '../hooks/useSavedLocations';

interface ReportFoundFormProps {
  onAddPerson: (person: FoundPerson) => void;
}

const MAX_IMAGES = 1;

const HELP_STEPS: HelpStep[] = [
  { n: 1, t: 'Capturar Foto', d: 'Carga una o varias fotos. El rostro debe estar bien iluminado y de frente.' },
  { n: 2, t: 'Definir Edad', d: 'Indica si es menor de edad. Si lo es, se ocultan nombre y apellido y se pide la identificación del responsable.' },
  { n: 3, t: 'Refugio y Contacto', d: 'Ingresa el refugio/hospital y el teléfono del responsable (obligatorios).' },
  { n: 4, t: 'Indexación Facial', d: 'Al enviar, el rostro se procesa y queda disponible de inmediato para las búsquedas.' },
];

export default function ReportFoundForm({ onAddPerson }: ReportFoundFormProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [photos, setPhotos] = useFormDraft<Photo[]>('report.photos', []);
  const [isChild, setIsChild] = useFormDraft('report.isChild', false);
  const [nombre, setNombre] = useFormDraft('report.nombre', '');
  const [apellido, setApellido] = useFormDraft('report.apellido', '');
  const [docTipo, setDocTipo] = useFormDraft('report.docTipo', 'V');
  const [docNumero, setDocNumero] = useFormDraft('report.docNumero', '');
  const [refugio, setRefugio] = useFormDraft('report.refugio', '');
  const [ubicacion, setUbicacion] = useFormDraft('report.ubicacion', '');
  const [telPrefijo, setTelPrefijo] = useFormDraft('report.telPrefijo', '0424');
  const [telNumero, setTelNumero] = useFormDraft('report.telNumero', '');
  const [docRespTipo, setDocRespTipo] = useFormDraft('report.docRespTipo', 'V');
  const [docResponsable, setDocResponsable] = useFormDraft('report.docResponsable', '');
  const [descripcion, setDescripcion] = useFormDraft('report.descripcion', '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultadoRegistro | null>(null);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) => setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));

  const { locations, remember, forget } = useSavedLocations();
  const inFlight = useRef(false);

  const { addFiles, removePhoto, resetPhotos } = usePhotoUpload({
    max: MAX_IMAGES,
    photos,
    setPhotos,
    onAdd: () => clearError('photos'),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return;

    const errs: Record<string, string> = {};
    if (photos.length === 0) errs.photos = 'Adjunta al menos una fotografía clara del rostro.';
    if (!refugio.trim()) errs.refugio = 'Indica el refugio, hospital o centro receptor.';
    if (telNumero.length !== 7) errs.telefono = 'El teléfono debe tener 7 dígitos.';
    if (isChild && !docResponsable.trim()) errs.docResponsable = 'La identificación del responsable es obligatoria para un menor.';

    if (Object.keys(errs).length) {
      setErrors(errs);
      return;
    }

    setErrors({});
    setShowConfirmModal(true);
  };

  const confirmSubmit = async () => {
    setShowConfirmModal(false);
    if (inFlight.current) return;

    const telefonoResponsable = `${telPrefijo}${telNumero}`;
    const docResponsableFull = docResponsable.trim() ? `${docRespTipo}-${docResponsable.trim()}` : '';

    inFlight.current = true;
    setIsSubmitting(true);
    try {
      const res = await reportarEncontrado({
        files: photos.map((p) => p.file),
        esMenor: isChild,
        nombre,
        apellido,
        docTipo,
        docNumero,
        refugio,
        ubicacion,
        telefonoResponsable,
        docResponsable: docResponsableFull,
        descripcion,
      });
      setResult(res);
      remember(ubicacion);

      onAddPerson({
        id: res.person_id,
        name: isChild ? 'Menor protegido' : [nombre, apellido].filter(Boolean).join(' ').trim() || 'Desconocido',
        ci: isChild ? 'No Aplica (Menor de edad)' : docNumero.trim() ? `${docTipo}-${docNumero.trim()}` : 'Desconocido',
        hospitalName: refugio.trim(),
        locationAddress: ubicacion.trim(),
        contactPhone: telefonoResponsable.trim(),
        physicalDescription: descripcion.trim(),
        imageUrl: photos[0]?.url ?? '',
        dateFound: new Date().toISOString(),
        status: 'refugiado',
      });
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : 'No se pudo registrar. Intenta de nuevo.' });
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    resetPhotos();
    setIsChild(false);
    setNombre('');
    setApellido('');
    setDocTipo('V');
    setDocNumero('');
    setRefugio('');
    setUbicacion('');
    setTelPrefijo('0424');
    setTelNumero('');
    setDocRespTipo('V');
    setDocResponsable('');
    setDescripcion('');
    setResult(null);
    setErrors({});
  };

  const FieldError = ({ field }: { field: string }) =>
    errors[field] ? <p className="text-xs text-red-600 mt-1 flex items-center gap-1"><AlertCircle size={13} className="shrink-0" />{errors[field]}</p> : null;

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-blue-500 p-4 sm:p-6" id="report-found-view">
      <div className="flex flex-col gap-4 pb-4 mb-4 border-b border-blue-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 shadow-sm">
            <Megaphone size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Encontré a alguien</h2>
            <p className="text-sm text-slate-500 leading-snug">Agrega a una persona encontrada a la base de datos.</p>
          </div>
        </div>
        
        <div className="flex justify-center w-full mt-1">
          <button
            type="button"
            onClick={() => setShowHelp(true)}
            className="flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl text-xs font-black border-2 border-amber-500 bg-amber-500/15 text-amber-800 hover:bg-amber-500/25 hover:border-amber-600 transition-all active:scale-[0.98]"
            id="btn-toggle-report-help"
          >
            <HelpCircle size={16} className="shrink-0" />
            ¿CÓMO FUNCIONA?
          </button>
        </div>
      </div>

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cómo reportar una persona encontrada"
        steps={HELP_STEPS}
        accent="blue"
        id="report-help-modal"
      />

      {result ? (
        <ReportSuccess result={result} onReset={handleResetForm} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {errors._form && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm" id="report-error">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{errors._form}</span>
            </div>
          )}

          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={14} className="text-blue-600" />
                Fotos de la persona <span className="text-rose-500">*</span>
              </label>
              {photos.length > 0 && <span className="text-[11px] font-semibold text-slate-400">{photos.length}/{MAX_IMAGES}</span>}
            </div>
            <PhotoUploader photos={photos} max={MAX_IMAGES} accent="blue" error={!!errors.photos} onAdd={addFiles} onRemove={removePhoto} />
            <FieldError field="photos" />
          </div>

          <ChildToggle isChild={isChild} onToggle={() => setIsChild(!isChild)} />

          {!isChild && (
            <fieldset className="space-y-4">
              <legend className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                <User size={13} className="text-slate-400" />
                Datos de la persona
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <TextField label="Nombre" optional value={nombre} onChange={setNombre} placeholder="Ej: Juan" maxLength={80} id="person-name-input" />
                <TextField label="Apellido" optional value={apellido} onChange={setApellido} placeholder="Ej: Gómez" maxLength={80} id="person-lastname-input" />
              </div>

              <div className="space-y-1.5">
                <label htmlFor="person-doc-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Documento de identidad <span className="text-slate-400 font-medium normal-case">(opcional)</span>
                </label>
                <DocumentInput tipo={docTipo} numero={docNumero} onTipo={setDocTipo} onNumero={setDocNumero} accent="blue" numeroId="person-doc-input" />
              </div>
            </fieldset>
          )}

          <fieldset className="space-y-4">
            <legend className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
              <MapPin size={13} className="text-slate-400" />
              Ubicación y contacto
            </legend>

            <TextField
              label="Refugio, Hospital o Ente Receptivo"
              required
              value={refugio}
              onChange={(v) => { setRefugio(v); clearError('refugio'); }}
              placeholder="Ej: Refugio Polideportivo de Catia"
              icon={Building}
              error={errors.refugio}
              id="refugio-input"
            />

            <div className="space-y-1.5">
              <label htmlFor="ubicacion-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Dónde se encontró <span className="text-slate-400 font-medium normal-case">(opcional)</span>
              </label>
              <LocationCombobox value={ubicacion} onChange={setUbicacion} options={locations} onForget={forget} accent="blue" id="ubicacion-input" />
            </div>

            <div className="space-y-1.5">
              <label htmlFor="contact-phone-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Teléfono del responsable <span className="text-rose-500">*</span>
              </label>
              <PhoneField
                prefix={telPrefijo}
                number={telNumero}
                onPrefixChange={setTelPrefijo}
                onNumberChange={(value) => {
                  setTelNumero(value);
                  clearError('telefono');
                }}
                accent="blue"
                error={errors.telefono}
                id="contact-phone-input"
              />
              <FieldError field="telefono" />
            </div>

            {isChild && (
              <div className="space-y-1.5">
                <label htmlFor="doc-responsable-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Identificación del responsable <span className="text-rose-500">*</span>
                </label>
                <DocumentInput
                  tipo={docRespTipo}
                  numero={docResponsable}
                  onTipo={setDocRespTipo}
                  onNumero={(v) => { setDocResponsable(v); clearError('docResponsable'); }}
                  accent="blue"
                  error={!!errors.docResponsable}
                  numeroId="doc-responsable-input"
                />
                {errors.docResponsable ? (
                  <FieldError field="docResponsable" />
                ) : (
                  <p className="text-[11px] text-amber-600">Obligatorio para registrar a un menor.</p>
                )}
              </div>
            )}

            <TextAreaField
              label="Descripción"
              optional
              counter
              value={descripcion}
              onChange={setDescripcion}
              placeholder="Describe ropa, señas, estado físico, edad aproximada..."
              maxLength={350}
              rows={4}
              id="observation-input"
            />
          </fieldset>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-rose-500">*</span> Campos obligatorios
          </p>

          <button
            type="submit"
            disabled={isSubmitting}
            className="w-full py-3.5 bg-blue-600 hover:bg-blue-700 disabled:opacity-60 disabled:cursor-not-allowed text-white font-bold text-base rounded-xl transition-all shadow-md hover:shadow-lg flex items-center justify-center gap-2"
            id="btn-submit-report"
          >
            <Megaphone size={20} />
            {isSubmitting ? 'Registrando…' : 'Registrar que lo encontré'}
          </button>
        </form>
      )}

      {showConfirmModal && (
        <div className="fixed inset-0 z-[80] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm" onClick={() => setShowConfirmModal(false)}>
          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-sm p-6 text-center animate-[fadeIn_0.2s_ease-out]" onClick={(e) => e.stopPropagation()}>
            <div className="w-16 h-16 bg-blue-100 text-blue-600 rounded-full flex items-center justify-center mx-auto mb-4">
              <Megaphone size={32} />
            </div>
            <h3 className="text-lg font-bold text-slate-800 mb-2">Confirmar reporte</h3>
            <p className="text-sm text-slate-600 mb-6">
              ¿Confirmas que encontraste a esta persona y deseas reportarla oficialmente como encontrada? Esta información es vital para sus familiares.
            </p>
            <div className="flex gap-3">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="flex-1 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold rounded-xl transition-all"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmSubmit}
                className="flex-1 py-2.5 bg-blue-600 hover:bg-blue-700 text-white font-bold rounded-xl transition-all shadow-md"
              >
                Sí, reportar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
