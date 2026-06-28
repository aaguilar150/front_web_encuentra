import { Dispatch, SetStateAction, useEffect, useRef } from 'react';

import type { Photo } from '../components/form/PhotoUploader';

interface UsePhotoUploadOptions {
  max: number;
  photos: Photo[];
  setPhotos: Dispatch<SetStateAction<Photo[]>>;
  onAdd?: () => void;
}

function revokePhoto(photo?: Photo) {
  if (photo?.url) {
    URL.revokeObjectURL(photo.url);
  }
}

async function isValidImageFile(file: File): Promise<boolean> {
  try {
    const buf = await file.slice(0, 12).arrayBuffer();
    const b = new Uint8Array(buf);
    if (b[0] === 0xFF && b[1] === 0xD8 && b[2] === 0xFF) return true;                        // JPEG
    if (b[0] === 0x89 && b[1] === 0x50 && b[2] === 0x4E && b[3] === 0x47) return true;       // PNG
    if (b[0] === 0x47 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x38) return true;       // GIF
    if (b[0] === 0x52 && b[1] === 0x49 && b[2] === 0x46 && b[3] === 0x46 &&
        b[8] === 0x57 && b[9] === 0x45 && b[10] === 0x42 && b[11] === 0x50) return true;     // WebP
    if (b[0] === 0x42 && b[1] === 0x4D) return true;                                         // BMP
    if (b[0] === 0x49 && b[1] === 0x49 && b[2] === 0x2A && b[3] === 0x00) return true;       // TIFF LE
    if (b[0] === 0x4D && b[1] === 0x4D && b[2] === 0x00 && b[3] === 0x2A) return true;       // TIFF BE
    if (b[4] === 0x66 && b[5] === 0x74 && b[6] === 0x79 && b[7] === 0x70) return true;       // HEIC/HEIF/AVIF
    return false;
  } catch {
    return file.type.startsWith('image/');
  }
}

export function usePhotoUpload({ max, photos, setPhotos, onAdd }: UsePhotoUploadOptions) {
  const latestPhotosRef = useRef(photos);

  useEffect(() => {
    latestPhotosRef.current = photos;
  }, [photos]);

  useEffect(() => {
    return () => {
      latestPhotosRef.current.forEach(revokePhoto);
    };
  }, []);

  const addFiles = async (files: FileList | File[]) => {
    const candidates = Array.from(files);
    const validated = (await Promise.all(
      candidates.map(async (file) => ((await isValidImageFile(file)) ? file : null))
    )).filter((f): f is File => f !== null);

    setPhotos((prev) => {
      const room = max - prev.length;
      if (room <= 0) return prev;
      const next = validated.slice(0, room).map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      return [...prev, ...next];
    });

    onAdd?.();
  };

  const removePhoto = (index: number) => {
    setPhotos((prev) => {
      const target = prev[index];
      revokePhoto(target);
      return prev.filter((_, currentIndex) => currentIndex !== index);
    });
  };

  const resetPhotos = () => {
    setPhotos((prev) => {
      prev.forEach(revokePhoto);
      return [];
    });
  };

  return {
    photos,
    addFiles,
    removePhoto,
    resetPhotos,
  };
}
