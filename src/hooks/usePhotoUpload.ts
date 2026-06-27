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

  const addFiles = (files: FileList | File[]) => {
    const images = Array.from(files).filter((file) => file.type.startsWith('image/'));

    setPhotos((prev) => {
      const room = max - prev.length;
      if (room <= 0) return prev;
      const next = images.slice(0, room).map((file) => ({
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
