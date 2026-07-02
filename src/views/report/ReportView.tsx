/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Vista "Reportar Persona Encontrada" (flujo rescatista):
 * captura foto + datos → registra e indexa → pantalla de éxito (con alerta si un
 * familiar ya buscaba a la persona).
 * Validación en `report.schema.ts`; red en `core/container`.
 */
import React, { useState, useRef } from 'react';
import { PlusCircle, Camera, AlertCircle, MapPin, Phone, Building, Check, Heart, User, HelpCircle, Megaphone } from 'lucide-react';
import { reportarEncontrado, ResultadoRegistro } from '../../core/container';
import PhotoUploader, { Photo, appendImages, filterValidImages } from '../../components/form/PhotoUploader';
import DocumentInput, { SearchDocTipo } from '../../components/form/DocumentInput';
import LocationCombobox from '../../components/form/LocationCombobox';
import { useSavedLocations } from '../../hooks/useSavedLocations';
import Field from '../../components/form/Field';
import ChildToggle from '../../components/form/ChildToggle';
import PhoneField from '../../components/form/PhoneField';
import { useFormDraft } from '../../components/form/useFormDraft';
import { Card, ViewHeader, Button, InputLabel, FieldError, FieldsetLegend, Box } from '../../components/ui';
import HelpModal, { HelpStep } from '../../components/modals/HelpModal';
import ReportSuccess from '../../components/report/ReportSuccess';
import { validateReport } from './report.schema';

// ponytail: capacidad — el back acepta varias fotos del mismo registro.
const MAX_IMAGES = 1;

const HELP_STEPS: HelpStep[] = [
  { n: 1, t: 'Capturar Foto', d: 'Carga una o varias fotos. El rostro debe estar bien iluminado y de frente.' },
  { n: 2, t: 'Definir Edad', d: 'Indica si es menor de edad. Si lo es, se ocultan nombre y apellido y se pide la identificación del responsable.' },
  { n: 3, t: 'Refugio y Contacto', d: 'Ingresa el refugio/hospital y el teléfono del responsable (obligatorios).' },
  { n: 4, t: 'Indexación Facial', d: 'Al enviar, el rostro se procesa y queda disponible de inmediato para las búsquedas.' },
];

export default function ReportView({ onBack }: { onBack?: () => void }) {
  const [showHelp, setShowHelp] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  // Persistido entre cambios de pestaña (draft 'report.*')
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isChild, setIsChild] = useFormDraft('report.isChild', false);
  const [nombre, setNombre] = useFormDraft('report.nombre', '');
  const [apellido, setApellido] = useFormDraft('report.apellido', '');
  const [docTipo, setDocTipo] = useFormDraft<SearchDocTipo>('report.docTipo', 'V');
  const [docNumero, setDocNumero] = useFormDraft('report.docNumero', '');
  const [refugio, setRefugio] = useFormDraft('report.refugio', '');
  const [ubicacion, setUbicacion] = useFormDraft('report.ubicacion', '');
  const [telPrefijo, setTelPrefijo] = useFormDraft('report.telPrefijo', '0424');
  const [telNumero, setTelNumero] = useFormDraft('report.telNumero', '');
  const [docRespTipo, setDocRespTipo] = useFormDraft<SearchDocTipo>('report.docRespTipo', 'V');
  const [docResponsable, setDocResponsable] = useFormDraft('report.docResponsable', '');
  const [descripcion, setDescripcion] = useFormDraft('report.descripcion', '');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultadoRegistro | null>(null);
  // Errores por campo: { photos, refugio, telefono, docResponsable, _form }
  const [errors, setErrors] = useState<Record<string, string>>({});
  const clearError = (field: string) => setErrors((prev) => (prev[field] ? { ...prev, [field]: '' } : prev));

  const { locations, remember, forget } = useSavedLocations();
  const inFlight = useRef(false); // evita registros duplicados si el usuario satura el botón

  const addFiles = async (files: FileList | File[]) => {
    const valid = await filterValidImages(files); // valida por magic bytes
    if (!valid.length) return;
    setPhotos((prev) => appendImages(prev, valid, MAX_IMAGES));
    clearError('photos');
  };
  const removePhoto = (idx: number) => {
    URL.revokeObjectURL(photos[idx]?.url ?? ''); // libera el preview
    setPhotos((prev) => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (inFlight.current) return; // ya hay un registro en curso

    const { ok, errors: errs } = validateReport({ photos, refugio, telNumero, isChild, docResponsable });
    if (!ok) {
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
    } catch (err) {
      setErrors({ _form: err instanceof Error ? err.message : 'No se pudo registrar. Intenta de nuevo.' });
    } finally {
      inFlight.current = false;
      setIsSubmitting(false);
    }
  };

  const handleResetForm = () => {
    setPhotos([]);
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

  const isFormValid = photos.length > 0 && refugio.trim() !== '' && telNumero.length === 7 && (!isChild || docResponsable.trim() !== '');

  return (
    <Card id="report-found-view" className="flex flex-col items-center">
      <div className="w-full max-w-lg pb-4 mb-4">
        <div className="flex justify-between items-start mb-6">
          <button 
            type="button" 
            onClick={result ? handleResetForm : onBack}
            className="flex items-center gap-2 text-blue-600 font-bold hover:text-blue-700 transition-colors"
          >
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="15 18 9 12 15 6"></polyline>
            </svg>
            Volver
          </button>
          
          {!result && (
            <button
              type="button"
              onClick={() => setShowHelp(true)}
              className="p-1.5 bg-blue-50 text-blue-600 hover:bg-blue-100 rounded-full transition-all shadow-sm"
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

        {!result && (
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-blue-600 text-white rounded-xl shrink-0 shadow-sm">
                <PlusCircle size={22} />
              </div>
              <h2 className="text-[1.35rem] font-bold text-slate-800 leading-tight">Reportar Persona Encontrada</h2>
            </div>
            <p className="text-slate-500 text-sm leading-snug">
              Agrega a una persona encontrada a la base de datos.
            </p>
          </div>
        )}
      </div>

      <HelpModal
        open={showHelp}
        onClose={() => setShowHelp(false)}
        title="Cómo reportar una persona encontrada"
        steps={HELP_STEPS}
        accent="emerald"
        id="report-help-modal"
      />

      {result ? (
        <ReportSuccess result={result} onReset={handleResetForm} onBack={onBack} />
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5 w-full max-w-lg">
          {errors._form && (
            <Box accent="red" className="p-3.5 flex items-start gap-2.5 text-sm" id="report-error">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{errors._form}</span>
            </Box>
          )}

          {/* Fotos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={14} className="text-blue-600" />
                Fotos de la persona <span className="text-rose-500">*</span>
              </label>
              {photos.length > 0 && <span className="text-[11px] font-semibold text-slate-400">{photos.length}/{MAX_IMAGES}</span>}
            </div>
            <PhotoUploader photos={photos} max={MAX_IMAGES} accent="blue" error={!!errors.photos} onAdd={addFiles} onRemove={removePhoto} />
            <FieldError message={errors.photos} />
          </div>

          {/* Switch de menor de edad */}
          <ChildToggle value={isChild} onChange={setIsChild} />

          {/* Sección: identidad */}
          <fieldset className="space-y-4">
            <FieldsetLegend icon={User}>Datos de la persona</FieldsetLegend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <Field label="Nombre" optional value={nombre} onChange={setNombre} placeholder="Ej: Juan" maxLength={80} id="person-name-input" />
              <Field label="Apellido" optional value={apellido} onChange={setApellido} placeholder="Ej: Gómez" maxLength={80} id="person-lastname-input" />
            </div>

            {/* Documento propio solo para adultos */}
            {!isChild && (
              <div className="space-y-1.5">
                <InputLabel htmlFor="person-doc-input" optional>Documento de identidad</InputLabel>
                <DocumentInput tipo={docTipo} numero={docNumero} onTipo={setDocTipo} onNumero={setDocNumero} accent="blue" numeroId="person-doc-input" />
              </div>
            )}
          </fieldset>

          {/* Sección: ubicación y contacto */}
          <fieldset className="space-y-4">
            <FieldsetLegend icon={MapPin}>Ubicación y contacto</FieldsetLegend>

            <Field
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
              <InputLabel htmlFor="ubicacion-input" optional>Dónde se encontró</InputLabel>
              <LocationCombobox value={ubicacion} onChange={setUbicacion} options={locations} onForget={forget} accent="blue" id="ubicacion-input" />
            </div>

            <div className="space-y-1.5">
              <InputLabel htmlFor="contact-phone-input" required>Teléfono del responsable</InputLabel>
              <PhoneField
                prefijo={telPrefijo}
                numero={telNumero}
                onPrefijo={setTelPrefijo}
                onNumero={(v) => { setTelNumero(v); clearError('telefono'); }}
                error={!!errors.telefono}
                id="contact-phone-input"
              />
              <FieldError message={errors.telefono} />
            </div>

            {/* Identificación del responsable: obligatoria si es menor */}
            {isChild && (
              <div className="space-y-1.5">
                <InputLabel htmlFor="doc-responsable-input" required>Identificación del responsable</InputLabel>
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
                  <FieldError message={errors.docResponsable} />
                ) : (
                  <p className="text-[11px] text-amber-600">Obligatorio para registrar a un menor.</p>
                )}
              </div>
            )}

            <Field
              label="Descripción"
              optional
              multiline
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

          <Button type="submit" variant="primary" accent="blue" size="xl" fullWidth icon={PlusCircle} disabled={isSubmitting || !isFormValid} id="btn-submit-report">
            {isSubmitting ? 'Registrando…' : 'Reportar Persona Encontrada'}
          </Button>
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
    </Card>
  );
}
