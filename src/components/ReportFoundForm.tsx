/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState, useRef } from 'react';
import { PlusCircle, Camera, Upload, AlertCircle, FileText, MapPin, Phone, Building, Check, Heart, User, HelpCircle, Baby, X } from 'lucide-react';
import { FoundPerson } from '../types';
import { reportarEncontrado, ResultadoRegistro } from '../api';

interface ReportFoundFormProps {
  onAddPerson: (person: FoundPerson) => void;
}

// ponytail: capacity knob — backend accepts varias fotos del mismo registro
const MAX_IMAGES = 5;
type Photo = { file: File; url: string };

export default function ReportFoundForm({ onAddPerson }: ReportFoundFormProps) {
  const [showHelp, setShowHelp] = useState(false);
  const [photos, setPhotos] = useState<Photo[]>([]);
  const [isChild, setIsChild] = useState(false);
  const [nombre, setNombre] = useState('');
  const [apellido, setApellido] = useState('');
  const [docTipo, setDocTipo] = useState('V');
  const [docNumero, setDocNumero] = useState('');
  const [refugio, setRefugio] = useState('');
  const [ubicacion, setUbicacion] = useState('');
  const [telefonoResponsable, setTelefonoResponsable] = useState('');
  const [docResponsable, setDocResponsable] = useState('');
  const [descripcion, setDescripcion] = useState('');

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState<ResultadoRegistro | null>(null);
  const [error, setError] = useState<string | null>(null);

  const fileInputRef = useRef<HTMLInputElement>(null);

  const addFiles = (files: FileList | File[]) => {
    const imgs = Array.from(files).filter((f) => f.type.startsWith('image/'));
    setPhotos((prev) => {
      const room = MAX_IMAGES - prev.length;
      return [...prev, ...imgs.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))];
    });
    setError(null);
  };
  const removePhoto = (idx: number) => setPhotos((prev) => prev.filter((_, i) => i !== idx));
  const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) addFiles(e.target.files);
    e.target.value = '';
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (photos.length === 0) {
      setError('Es obligatorio adjuntar al menos una fotografía clara del rostro.');
      return;
    }
    if (!refugio.trim()) {
      setError('Indica el refugio, hospital o centro donde se encuentra la persona.');
      return;
    }
    if (!telefonoResponsable.trim()) {
      setError('Proporciona el teléfono del responsable para coordinar.');
      return;
    }
    if (isChild && !docResponsable.trim()) {
      setError('Para un menor, la identificación del responsable es obligatoria.');
      return;
    }

    setError(null);
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
        docResponsable,
        descripcion,
      });
      setResult(res);

      // Bump the local "personas reportadas" badge in App (cosmetic).
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
      setError(err instanceof Error ? err.message : 'No se pudo registrar. Intenta de nuevo.');
    } finally {
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
    setTelefonoResponsable('');
    setDocResponsable('');
    setDescripcion('');
    setResult(null);
    setError(null);
  };

  const inputClass =
    'w-full px-3.5 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-800 text-sm placeholder-slate-400 outline-none transition-all font-medium shadow-sm';

  return (
    <div className="bg-white rounded-2xl shadow-sm border border-slate-100 p-4 sm:p-6" id="report-found-view">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pb-3 mb-4 border-b border-slate-100">
        <div className="flex items-center gap-3">
          <div className="p-2.5 bg-blue-50 text-blue-600 rounded-xl shrink-0">
            <PlusCircle size={22} />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-800 leading-tight">Reportar Persona Encontrada</h2>
            <p className="text-sm text-slate-500 leading-snug">Agrega a una persona encontrada a la base de datos.</p>
          </div>
        </div>
        <button
          type="button"
          onClick={() => setShowHelp(true)}
          className="flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-bold border bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100 transition-all"
          id="btn-toggle-report-help"
        >
          <HelpCircle size={15} />
          ¿CÓMO FUNCIONA?
        </button>
      </div>

      {showHelp && (
        <div
          className="fixed inset-0 z-[70] flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-sm"
          onClick={() => setShowHelp(false)}
          id="report-help-modal"
        >
          <div
            className="bg-white rounded-2xl shadow-2xl w-full max-w-2xl relative p-5 sm:p-6 max-h-[90vh] overflow-y-auto animate-[fadeIn_0.2s_ease-out]"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              onClick={() => setShowHelp(false)}
              className="absolute top-4 right-4 text-slate-400 hover:text-slate-700 bg-slate-100 hover:bg-slate-200 p-1.5 rounded-full transition-all"
            >
              <X size={18} />
            </button>
            <h3 className="text-base font-bold text-emerald-950 flex items-center gap-2 pr-8 mb-5">
              <HelpCircle size={18} className="text-emerald-600 shrink-0" />
              Cómo reportar una persona encontrada
            </h3>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {[
                { n: 1, t: 'Capturar Foto', d: 'Carga una o varias fotos. El rostro debe estar bien iluminado y de frente.' },
                { n: 2, t: 'Definir Edad', d: 'Indica si es menor de edad. Si lo es, se ocultan nombre y apellido y se pide la identificación del responsable.' },
                { n: 3, t: 'Refugio y Contacto', d: 'Ingresa el refugio/hospital y el teléfono del responsable (obligatorios).' },
                { n: 4, t: 'Indexación Facial', d: 'Al enviar, el rostro se procesa y queda disponible de inmediato para las búsquedas.' },
              ].map((s) => (
                <div key={s.n} className="bg-emerald-50/50 p-4 rounded-xl border border-emerald-100 flex gap-3">
                  <span className="inline-flex w-6 h-6 items-center justify-center rounded-full bg-emerald-600 text-white text-xs font-black shrink-0">{s.n}</span>
                  <div className="space-y-1">
                    <h4 className="text-sm font-bold text-slate-800">{s.t}</h4>
                    <p className="text-xs text-slate-500 leading-snug">{s.d}</p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
            <button
              onClick={handleResetForm}
              className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold text-xs rounded-lg transition-all"
              id="btn-add-more"
            >
              Reportar Otra Persona
            </button>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-5">
          {error && (
            <div className="p-3.5 bg-red-50 border border-red-200 text-red-700 rounded-xl flex items-start gap-2.5 text-sm" id="report-error">
              <AlertCircle size={18} className="mt-0.5 shrink-0 text-red-500" />
              <span>{error}</span>
            </div>
          )}

          {/* Photos */}
          <div className="space-y-3">
            <div className="flex items-center justify-between gap-2">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider flex items-center gap-1.5">
                <Camera size={14} className="text-blue-600" />
                Fotos de la persona <span className="text-rose-500">*</span>
              </label>
              {photos.length > 0 && (
                <span className="text-[11px] font-semibold text-slate-400">{photos.length}/{MAX_IMAGES}</span>
              )}
            </div>

            <input type="file" ref={fileInputRef} onChange={handleImageUpload} accept="image/*" multiple={MAX_IMAGES > 1} className="hidden" />

            <div
              className={`border-2 border-dashed rounded-xl p-4 transition-all ${photos.length ? 'border-blue-300 bg-blue-50/20' : 'border-blue-600 bg-blue-50/30'}`}
            >
              {photos.length === 0 ? (
                <button type="button" onClick={() => fileInputRef.current?.click()} className="w-full text-center py-5">
                  <div className="w-11 h-11 rounded-full bg-blue-50 text-blue-500 flex items-center justify-center mx-auto mb-2">
                    <Upload size={20} />
                  </div>
                  <p className="text-sm font-semibold text-slate-700">Haz clic para subir las fotos</p>
                  <p className="text-xs text-slate-400 mt-0.5">JPG o PNG — rostro frontal claro{MAX_IMAGES > 1 ? ` (hasta ${MAX_IMAGES})` : ''}</p>
                </button>
              ) : (
                <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
                  {photos.map((p, idx) => (
                    <div key={idx} className="relative aspect-square">
                      <img src={p.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-cover rounded-lg border border-slate-200 shadow-sm" />
                      <button
                        type="button"
                        onClick={() => removePhoto(idx)}
                        className="absolute -top-1.5 -right-1.5 bg-white text-slate-500 p-1 rounded-full shadow-md border border-slate-200 hover:text-rose-600 hover:border-rose-200 transition-all z-10"
                        aria-label="Quitar foto"
                      >
                        <X size={13} strokeWidth={3} />
                      </button>
                    </div>
                  ))}
                  {photos.length < MAX_IMAGES && (
                    <button
                      type="button"
                      onClick={() => fileInputRef.current?.click()}
                      className="aspect-square rounded-lg border-2 border-dashed border-blue-300 text-blue-500 hover:border-blue-500 hover:bg-blue-50 flex flex-col items-center justify-center gap-1 transition-all"
                    >
                      <Upload size={18} />
                      <span className="text-[10px] font-bold">Agregar</span>
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Child Toggle Switch */}
          <div className="bg-amber-50/40 border-2 border-amber-200/60 rounded-xl p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-sm" id="child-toggle-container">
            <div>
              <span className="text-sm font-black text-slate-800 uppercase tracking-wider flex items-center gap-2">
                <Baby size={20} className="text-amber-500" />
                ¿Es menor de edad?
              </span>
              <p className="text-xs text-slate-500 mt-1">Actívalo para aplicar protección de identidad (oculta nombre y apellido).</p>
            </div>
            <button
              type="button"
              onClick={() => setIsChild(!isChild)}
              aria-pressed={isChild}
              className={`px-6 py-3 rounded-xl text-sm font-extrabold transition-all duration-300 shrink-0 flex items-center justify-center gap-2 shadow-sm border-2 ${
                isChild
                  ? 'bg-amber-500 border-amber-500 hover:bg-amber-600 text-white shadow-[0_4px_20px_rgba(245,158,11,0.4)] scale-105'
                  : 'bg-white border-amber-400 text-amber-700 hover:bg-amber-100 hover:border-amber-500 hover:shadow-md'
              }`}
              id="btn-toggle-child"
            >
              {isChild ? <Check size={18} /> : <Baby size={18} />}
              {isChild ? 'MENOR PROTEGIDO' : 'SÍ, ES MENOR'}
            </button>
          </div>

          {/* Section: Identity (hidden for minors) */}
          {!isChild && (
            <fieldset className="space-y-4">
              <legend className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
                <User size={13} className="text-slate-400" />
                Datos de la persona
              </legend>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Nombre <span className="text-slate-400 font-medium normal-case">(opcional)</span>
                  </label>
                  <input type="text" placeholder="Ej: Juan" value={nombre} onChange={(e) => setNombre(e.target.value)} className={inputClass} id="person-name-input" />
                </div>
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                    Apellido <span className="text-slate-400 font-medium normal-case">(opcional)</span>
                  </label>
                  <input type="text" placeholder="Ej: Gómez" value={apellido} onChange={(e) => setApellido(e.target.value)} className={inputClass} id="person-lastname-input" />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Documento de identidad <span className="text-slate-400 font-medium normal-case">(opcional)</span>
                </label>
                <div className="flex gap-2">
                  <select
                    value={docTipo}
                    onChange={(e) => setDocTipo(e.target.value)}
                    className="px-3 py-2.5 bg-white border border-slate-200 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 rounded-xl text-slate-800 text-sm outline-none transition-all font-bold shadow-sm shrink-0"
                    aria-label="Tipo de documento"
                  >
                    <option value="V">V</option>
                    <option value="E">E</option>
                    <option value="P">P</option>
                  </select>
                  <input type="text" placeholder="Ej: 12345678" value={docNumero} onChange={(e) => setDocNumero(e.target.value)} className={inputClass} id="person-doc-input" />
                </div>
              </div>
            </fieldset>
          )}

          {/* Section: Location & contact */}
          <fieldset className="space-y-4">
            <legend className="text-[11px] font-black text-slate-400 uppercase tracking-widest mb-2.5 flex items-center gap-2">
              <MapPin size={13} className="text-slate-400" />
              Ubicación y contacto
            </legend>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Refugio, Hospital o Ente Receptivo <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                {!refugio && (
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Building size={16} className="text-slate-400" />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Ej: Refugio Polideportivo de Catia"
                  value={refugio}
                  onChange={(e) => setRefugio(e.target.value)}
                  className={`${inputClass} ${refugio ? 'pl-3.5' : 'pl-10'}`}
                  id="refugio-input"
                />
              </div>
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Dónde se encontró <span className="text-slate-400 font-medium normal-case">(opcional)</span>
              </label>
              <input type="text" placeholder="Ej: Plaza Bolívar, Caracas" value={ubicacion} onChange={(e) => setUbicacion(e.target.value)} className={inputClass} id="ubicacion-input" />
            </div>

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Teléfono del responsable <span className="text-rose-500">*</span>
              </label>
              <div className="relative">
                {!telefonoResponsable && (
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none">
                    <Phone size={16} className="text-slate-400" />
                  </div>
                )}
                <input
                  type="text"
                  placeholder="Ej: 0414-9999999"
                  value={telefonoResponsable}
                  onChange={(e) => setTelefonoResponsable(e.target.value)}
                  className={`${inputClass} ${telefonoResponsable ? 'pl-3.5' : 'pl-10'}`}
                  id="contact-phone-input"
                />
              </div>
            </div>

            {isChild && (
              <div className="space-y-1.5">
                <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                  Identificación del responsable <span className="text-rose-500">*</span>
                </label>
                <input
                  type="text"
                  placeholder="Ej: V-11111111"
                  value={docResponsable}
                  onChange={(e) => setDocResponsable(e.target.value)}
                  className={inputClass}
                  id="doc-responsable-input"
                />
                <p className="text-[11px] text-amber-600">Obligatorio para registrar a un menor.</p>
              </div>
            )}

            <div className="space-y-1.5">
              <label className="text-xs font-bold text-slate-700 uppercase tracking-wider block">
                Descripción <span className="text-slate-400 font-medium normal-case">(opcional)</span>
              </label>
              <textarea
                placeholder="Describe ropa, señas, estado físico, edad aproximada..."
                rows={4}
                value={descripcion}
                onChange={(e) => setDescripcion(e.target.value)}
                className={`${inputClass} resize-none`}
                id="observation-input"
              />
            </div>
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
            <PlusCircle size={20} />
            {isSubmitting ? 'Registrando…' : 'Reportar Persona Encontrada'}
          </button>
        </form>
      )}
    </div>
  );
}
