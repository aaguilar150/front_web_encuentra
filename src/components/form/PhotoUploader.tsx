/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 *
 * Subida de fotos (drag&drop + grilla de miniaturas) compartida por ambos forms.
 */
import React, { useRef } from 'react';
import { Upload, X, Camera } from 'lucide-react';

export type Photo = { file: File; url: string };

/**
 * Seguridad: valida que el archivo SEA una imagen por sus "magic bytes" (firma
 * binaria), no por su MIME (que el cliente puede falsear). Cubre JPEG, PNG, GIF,
 * WebP, BMP, TIFF y HEIC/HEIF/AVIF. Si no se puede leer, cae al MIME como respaldo.
 */
export async function isValidImageFile(file: File): Promise<boolean> {
  try {
    const b = new Uint8Array(await file.slice(0, 12).arrayBuffer());
    if (b[0] === 0xff && b[1] === 0xd8 && b[2] === 0xff) return true; // JPEG
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4e && b[3] === 0x47) return true; // PNG
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return true; // GIF
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true; // WebP
    if (b[0] === 0x42 && b[1] === 0x4d) return true; // BMP
    if (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2a && b[3] === 0x00) return true; // TIFF LE
    if (b[0] === 0x4d && b[1] === 0x4d && b[2] === 0x00 && b[3] === 0x2a) return true; // TIFF BE
    if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return true; // HEIC/HEIF/AVIF (ftyp)
    return false;
  } catch {
    return file.type.startsWith('image/');
  }
}

/** Filtra una lista a solo imágenes reales (validadas por magic bytes). */
export async function filterValidImages(files: FileList | File[]): Promise<File[]> {
  const arr = Array.from(files);
  const checked = await Promise.all(arr.map(async (f) => ((await isValidImageFile(f)) ? f : null)));
  return checked.filter((f): f is File => f !== null);
}

/**
 * Agrega archivos (ya validados) a la lista respetando `max` y crea el objectURL
 * de preview. La validación de tipo se hace antes con `filterValidImages`.
 */
export function appendImages(prev: Photo[], files: File[], max: number): Photo[] {
  const room = max - prev.length;
  if (room <= 0) return prev;
  return [...prev, ...files.slice(0, room).map((file) => ({ file, url: URL.createObjectURL(file) }))];
}

const ACCENTS = {
  rose: {
    zoneEmpty: 'border-rose-600 bg-rose-50/40',
    zoneFilled: 'border-rose-300 bg-rose-50/20',
    iconWrap: 'bg-rose-50 text-rose-500',
    add: 'border-rose-300 text-rose-500 hover:border-rose-500 hover:bg-rose-50',
  },
  blue: {
    zoneEmpty: 'border-blue-600 bg-blue-50/30',
    zoneFilled: 'border-blue-300 bg-blue-50/20',
    iconWrap: 'bg-blue-50 text-blue-500',
    add: 'border-blue-300 text-blue-500 hover:border-blue-500 hover:bg-blue-50',
  },
};

interface Props {
  photos: Photo[];
  max: number;
  accent: keyof typeof ACCENTS;
  error?: boolean;
  disabled?: boolean;
  onAdd: (files: FileList | File[]) => void;
  onRemove: (idx: number) => void;
}

export default function PhotoUploader({ photos, max, accent, error, disabled, onAdd, onRemove }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const cameraRef = useRef<HTMLInputElement>(null);
  const a = ACCENTS[accent];
  const zone = error ? 'border-red-400 bg-red-50/30' : photos.length ? a.zoneFilled : a.zoneEmpty;
  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) onAdd(e.target.files);
    e.target.value = '';
  };

  return (
    <>
      {/* Subir desde archivos/galería (incluye HEIC/HEIF de iPhone) */}
      <input type="file" ref={inputRef} onChange={handleInput} accept="image/*,.heic,.heif" multiple={max > 1} className="hidden" />
      {/* Tomar foto con la cámara (capture abre la cámara en móvil) */}
      <input type="file" ref={cameraRef} onChange={handleInput} accept="image/*,.heic,.heif" capture="environment" className="hidden" />
      <div
        onDragOver={(e) => { e.preventDefault(); e.stopPropagation(); }}
        onDrop={(e) => { e.preventDefault(); e.stopPropagation(); if (e.dataTransfer.files) onAdd(e.dataTransfer.files); }}
        className={`border-2 border-dashed rounded-xl p-4 transition-all ${zone} ${disabled ? 'opacity-60 pointer-events-none' : ''}`}
        id="image-dropzone"
      >
        {photos.length === 0 ? (
          <div className="text-center py-4">
            <div className={`w-11 h-11 rounded-full ${a.iconWrap} flex items-center justify-center mx-auto mb-2`}>
              <Upload size={20} />
            </div>
            <p className="text-sm font-semibold text-slate-700">Haz clic o arrastra las fotos aquí</p>
            <p className="text-xs text-slate-400 mt-0.5">JPG, PNG, WebP, HEIC y más — rostro frontal claro{max > 1 ? ` (hasta ${max})` : ''}</p>
            <div className="flex items-center justify-center gap-2 mt-3">
              <button type="button" onClick={() => inputRef.current?.click()} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 ${a.add} text-xs font-bold transition-all`}>
                <Upload size={15} /> Subir foto
              </button>
              <button type="button" onClick={() => cameraRef.current?.click()} className={`inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg border-2 ${a.add} text-xs font-bold transition-all`}>
                <Camera size={15} /> Tomar foto
              </button>
            </div>
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2.5">
            {photos.map((p, idx) => (
              <div key={idx} className="relative aspect-square">
                <img src={p.url} alt={`Foto ${idx + 1}`} className="w-full h-full object-contain bg-slate-100 rounded-lg border border-slate-200 shadow-sm" />
                <button
                  type="button"
                  onClick={() => onRemove(idx)}
                  className="absolute -top-1.5 -right-1.5 bg-white text-slate-500 p-1 rounded-full shadow-md border border-slate-200 hover:text-rose-600 hover:border-rose-200 transition-all z-10"
                  aria-label="Quitar foto"
                >
                  <X size={13} strokeWidth={3} />
                </button>
              </div>
            ))}
            {photos.length < max && (
              <>
                <button
                  type="button"
                  onClick={() => inputRef.current?.click()}
                  className={`aspect-square rounded-lg border-2 border-dashed ${a.add} flex flex-col items-center justify-center gap-1 transition-all`}
                >
                  <Upload size={18} />
                  <span className="text-[10px] font-bold">Subir</span>
                </button>
                <button
                  type="button"
                  onClick={() => cameraRef.current?.click()}
                  className={`aspect-square rounded-lg border-2 border-dashed ${a.add} flex flex-col items-center justify-center gap-1 transition-all`}
                >
                  <Camera size={18} />
                  <span className="text-[10px] font-bold">Cámara</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </>
  );
}
