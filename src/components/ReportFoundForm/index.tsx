import  { useState } from 'react';
import { UserRoundPlus, Camera, AlertCircle, MapPin, Phone, Building, Check, Heart, User, HelpCircle, Baby } from 'lucide-react';
import { useForm, } from '@tanstack/react-form';
import { useSelector } from '@tanstack/react-store';

import { Button } from '@/components/ui/button';
import ChildToggle from '@/components/ui/child-toggle';
import { reportarEncontrado, ResultadoRegistro } from '@/api';
import PhotoUploader, { Photo } from '../form/PhotoUploader';
import HelpModal, { HelpStep } from '../form/HelpModal';
import DocumentInput from '../form/DocumentInput';
import LocationCombobox, { useSavedLocations } from '../form/LocationCombobox';
import Field, { inputClasses } from '../form/Field';
import { fieldError } from '../form/fieldError';

import { reportFoundSchema, reportFoundDefaults, PHONE_PREFIXES, type DocTipo, type TelPrefijo } from './found.schema';

import type{ FoundPerson } from '@/types';

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

const toPhotos = (v: unknown) => v as Photo[];

export default function ReportFoundForm({ onAddPerson }: ReportFoundFormProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [result, setResult] = useState<ResultadoRegistro | null>(null);
  const [serverError, setServerError] = useState<string | null>(null);

  const { locations, remember, forget } = useSavedLocations();

  const form = useForm({
    defaultValues: reportFoundDefaults,
    validators: { onSubmit: reportFoundSchema },
    onSubmit: async ({ value }) => {
      setServerError(null);
      try {
        const telefonoResponsable = `${value.telPrefijo}${value.telNumero}`;
        const docResponsableFull = value.docResponsable.trim()
          ? `${value.docRespTipo}-${value.docResponsable.trim()}`
          : '';

        const res = await reportarEncontrado({
          files: toPhotos(value.photos).map((p) => p.file),
          esMenor: value.esMenor,
          nombre: value.nombre,
          apellido: value.apellido,
          docTipo: value.docTipo,
          docNumero: value.docNumero,
          refugio: value.refugio,
          ubicacion: value.ubicacion,
          telefonoResponsable,
          docResponsable: docResponsableFull,
          descripcion: value.descripcion,
        });
        setResult(res);
        remember(value.ubicacion);

        onAddPerson({
          id: res.person_id,
          name: value.esMenor
            ? 'Menor protegido'
            : [value.nombre, value.apellido].filter(Boolean).join(' ').trim() || 'Desconocido',
          ci: value.esMenor
            ? 'No Aplica (Menor de edad)'
            : value.docNumero.trim()
              ? `${value.docTipo}-${value.docNumero.trim()}`
              : 'Desconocido',
          hospitalName: value.refugio.trim(),
          locationAddress: value.ubicacion.trim(),
          contactPhone: telefonoResponsable.trim(),
          physicalDescription: value.descripcion.trim(),
          imageUrl: toPhotos(value.photos)[0]?.url ?? '',
          dateFound: new Date().toISOString(),
          status: 'refugiado',
        });
      } catch (err) {
        setServerError(err instanceof Error ? err.message : 'No se pudo registrar. Intenta de nuevo.');
      }
    },
  });
  const esMenor = useSelector(form.store, (state) => state.values.esMenor);
  const docTipo = useSelector(form.store, (state) => state.values.docTipo);
  const docRespTipo = useSelector(form.store, (state) => state.values.docRespTipo);
  const telPrefijo = useSelector(form.store, (state) => state.values.telPrefijo);
  const isSubmitting = useSelector(form.store, (state) => state.isSubmitting);
  const clearTelNumeroMeta = () => form.setFieldMeta('telNumero', (prev) => ({ ...prev, errors: [] }));

  const addFiles = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    form.setFieldValue('photos', (prev) => {
      const current = toPhotos(prev);
      const room = MAX_IMAGES - current.length;
      return [...current, ...imgs.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))];
    });
  };
  const removePhoto = (idx: number) => form.setFieldValue('photos', (prev) => toPhotos(prev).filter((_, i) => i !== idx));

  const handleResetForm = () => {
    form.reset();
    setResult(null);
    setServerError(null);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6" id="report-found-view">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <UserRoundPlus size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Reportar Persona Encontrada</h2>
            <p className="text-sm text-slate-500 leading-snug">Agrega a una persona encontrada a la base de datos.</p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="bg-slate-50"
          onClick={() => setShowHelp(true)}
          id="btn-toggle-report-help"
        >
          <HelpCircle size={15} />
          ¿CÓMO FUNCIONA?
        </Button>
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
        <div className="text-center py-10 px-4 max-w-md mx-auto" id="report-success-screen">
          <div className="w-14 h-14 bg-emerald-50 text-emerald-500 rounded-full flex items-center justify-center mx-auto mb-4 border border-emerald-100 shadow-sm">
            <Check size={28} />
          </div>
          <h3 className="text-lg font-bold text-slate-900">¡Registro Exitoso!</h3>
          <p className="text-sm text-slate-600 mt-2 leading-relaxed">
            La persona quedó indexada. Su rostro ya puede coincidir con las búsquedas de sus seres queridos.
          </p>
          <p className="text-xs text-slate-400 font-mono mt-2">Código de registro: {result.codigo}</p>

          {result.alerta && (
            <div className="mt-5 bg-emerald-50 border border-emerald-200 rounded-xl p-4 text-left text-sm space-y-1.5">
              <p className="font-bold text-emerald-800 flex items-center gap-1.5">
                <Heart size={15} className="fill-emerald-500 text-emerald-500" /> ¡Un familiar ya la buscaba!
              </p>
              {result.alerta.familiar_nombre && (
                <p className="text-slate-600"><strong>Familiar:</strong> {result.alerta.familiar_nombre}</p>
              )}
              {result.alerta.familiar_telefono && (
                <p className="text-slate-600 flex items-center gap-1.5">
                  <Phone size={14} className="text-emerald-600" /> {result.alerta.familiar_telefono}
                </p>
              )}
              <p className="text-[11px] text-emerald-700">Coincidencia {result.alerta.coincidencia}% · confianza {result.alerta.confianza}.</p>
            </div>
          )}

          <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center">
            <Button
              variant="dark"
              size="sm"
              className="rounded-lg"
              onClick={handleResetForm}
              id="btn-add-more"
            >
              Reportar Otra Persona
            </Button>
          </div>
        </div>
      ) : (
        <form onSubmit={(e) => { e.preventDefault(); form.handleSubmit(); }} className="space-y-5">
          {serverError && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm" id="report-error">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{serverError}</span>
            </div>
          )}

          {/* Photos */}
          <form.Field name="photos">
            {(field) => (
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-2">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                    <Camera size={14} className="text-blue-600" />
                    Fotos de la persona <span className="text-rose-500">*</span>
                  </label>
                  {toPhotos(field.state.value).length > 0 && (
                    <span className="text-[11px] font-semibold text-slate-400">
                      {toPhotos(field.state.value).length}/{MAX_IMAGES}
                    </span>
                  )}
                </div>
                <PhotoUploader
                  photos={toPhotos(field.state.value)}
                  max={MAX_IMAGES}
                  accent="blue"
                  error={!!field.state.meta.errors?.[0]}
                  onAdd={addFiles}
                  onRemove={removePhoto}
                />
                {field.state.meta.errors?.[0] && (
                  <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                    <AlertCircle size={13} className="shrink-0" />
                    {fieldError(field.state.meta.errors[0])}
                  </p>
                )}
              </div>
            )}
          </form.Field>

          {/* Child Toggle Switch */}
          <form.Field name="esMenor">
            {(field) => (
              <div className="bg-amber-50/40 border-2 border-amber-200/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="child-toggle-container">
                <div>
                  <span className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                    <Baby size={20} className="text-amber-500" />
                    ¿Es menor de edad?
                  </span>
                  <p className="text-xs text-slate-500 mt-1">Actívalo para aplicar protección de identidad (oculta nombre y apellido).</p>
                </div>
                <ChildToggle
                  value={field.state.value}
                  onChange={field.handleChange}
                />
              </div>
            )}
          </form.Field>

          {/* Section: Identity (hidden for minors) */}
          {!esMenor && (
            <fieldset className="space-y-4">
              <legend className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                <User size={13} className="text-slate-400" />
                Datos de la persona
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <form.Field name="nombre">
                  {(field) => (
                    <Field label="Nombre" optional value={field.state.value} onChange={(v) => field.handleChange(v)} placeholder="Ej: Juan" maxLength={80} id="person-name-input" />
                  )}
                </form.Field>
                <form.Field name="apellido">
                  {(field) => (
                    <Field label="Apellido" optional value={field.state.value} onChange={(v) => field.handleChange(v)} placeholder="Ej: Gómez" maxLength={80} id="person-lastname-input" />
                  )}
                </form.Field>
              </div>

              <div className="space-y-1.5">
                <label htmlFor="person-doc-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Documento de identidad <span className="text-slate-400 font-medium normal-case">(opcional)</span>
                </label>
                <form.Field name="docNumero">
                  {(field) => (
                    <DocumentInput
                      tipo={docTipo}
                      numero={field.state.value}
                      onTipo={(v) => form.setFieldValue('docTipo', v)}
                      onNumero={(v) => field.handleChange(v.replace(/\D/g, ''))}
                      accent="blue"
                      numeroId="person-doc-input"
                    />
                  )}
                </form.Field>
              </div>
            </fieldset>
          )}

          {/* Section: Location & contact */}
          <fieldset className="space-y-4">
            <legend className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
              <MapPin size={13} className="text-slate-400" />
              Ubicación y contacto
            </legend>

            <form.Field name="refugio">
              {(field) => (
                <Field
                  label="Refugio, Hospital o Ente Receptivo"
                  required
                  value={field.state.value}
                  onChange={(v) => { field.handleChange(v); field.setMeta((prev) => ({ ...prev, errors: [] })); }}
                  placeholder="Ej: Refugio Polideportivo de Catia"
                  icon={Building}
                  error={fieldError(field.state.meta.errors?.[0])}
                  id="refugio-input"
                />
              )}
            </form.Field>

            <form.Field name="ubicacion">
              {(field) => (
                <div className="space-y-1.5">
                  <label htmlFor="ubicacion-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Dónde se encontró <span className="text-slate-400 font-medium normal-case">(opcional)</span>
                  </label>
                  <LocationCombobox value={field.state.value} onChange={(v) => { field.handleChange(v); field.setMeta((prev) => ({ ...prev, errors: [] })); }} options={locations} onForget={forget} accent="blue" id="ubicacion-input" />
                </div>
              )}
            </form.Field>

            <div className="space-y-1.5">
              <label htmlFor="contact-phone-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Teléfono del responsable <span className="text-rose-500">*</span>
              </label>
              <form.Field name="telNumero">
                {(field) => (
                  <>
                    <div className="flex gap-2">
                      <select
                        value={telPrefijo}
                        onChange={(e) => { form.setFieldValue('telPrefijo', e.target.value as TelPrefijo); clearTelNumeroMeta(); }}
                        className="px-3 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-800 text-sm outline-none transition-all font-bold shadow-sm shrink-0"
                        aria-label="Prefijo telefónico"
                      >
                        {PHONE_PREFIXES.map((p) => (
                          <option key={p} value={p}>{p}</option>
                        ))}
                      </select>
                      <div className="relative flex-1">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                          <Phone size={16} className="text-slate-400" />
                        </div>
                        <input
                          type="tel"
                          inputMode="numeric"
                          placeholder="8135166"
                          maxLength={7}
                          value={field.state.value}
                          onChange={(e) => { field.handleChange(e.target.value.replace(/\D/g, '')); field.setMeta((prev) => ({ ...prev, errors: [] })); }}
                          className={inputClasses('blue', !!field.state.meta.errors?.[0], true)}
                          id="contact-phone-input"
                        />
                      </div>
                    </div>
                    {field.state.meta.errors?.[0] && (
                      <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                        <AlertCircle size={13} className="shrink-0" />
                        {fieldError(field.state.meta.errors[0])}
                      </p>
                    )}
                  </>
                )}
              </form.Field>
            </div>

            {esMenor && (
              <div className="space-y-1.5">
                <label htmlFor="doc-responsable-input" className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Identificación del responsable <span className="text-rose-500">*</span>
                </label>
                <form.Field name="docResponsable">
                  {(field) => (
                    <>
                      <DocumentInput
                        tipo={docRespTipo}
                        numero={field.state.value}
                        onTipo={(v) => form.setFieldValue('docRespTipo', v as DocTipo)}
                        onNumero={(v) => { field.handleChange(v.replace(/\D/g, '')); field.setMeta((prev) => ({ ...prev, errors: [] })); }}
                        accent="blue"
                        error={!!field.state.meta.errors?.[0]}
                        numeroId="doc-responsable-input"
                      />
                      {field.state.meta.errors?.[0] ? (
                        <p className="text-xs text-red-600 mt-1 flex items-center gap-1">
                          <AlertCircle size={13} className="shrink-0" />
                          {fieldError(field.state.meta.errors[0])}
                        </p>
                      ) : (
                        <p className="text-[11px] text-amber-600">Obligatorio para registrar a un menor.</p>
                      )}
                    </>
                  )}
                </form.Field>
              </div>
            )}

            <form.Field name="descripcion">
              {(field) => (
                <Field
                  label="Descripción"
                  optional
                  multiline
                  counter
                  value={field.state.value}
                  onChange={(v) => { field.handleChange(v); field.setMeta((prev) => ({ ...prev, errors: [] })); }}
                  placeholder="Describe ropa, señas, estado físico, edad aproximada..."
                  maxLength={350}
                  rows={4}
                  id="observation-input"
                />
              )}
            </form.Field>
          </fieldset>

          <p className="text-[11px] text-slate-400 flex items-center gap-1.5">
            <span className="text-rose-500">*</span> Campos obligatorios
          </p>

          <Button
            type="submit"
            className="w-full"
            disabled={isSubmitting}
            id="btn-submit-report"
          >
            <UserRoundPlus size={20} />
            {isSubmitting ? 'Registrando…' : 'Reportar Persona Encontrada'}
          </Button>
        </form>
      )}
    </div>
  );
}
