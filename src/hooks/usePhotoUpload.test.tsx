import React, { useState } from 'react';
import { act, renderHook } from '@testing-library/react';
import { describe, expect, it, vi, afterEach } from 'vitest';

import type { Photo } from '../components/form/PhotoUploader';
import { usePhotoUpload } from './usePhotoUpload';

function makeFile(name: string, type: string) {
  return new File(['content'], name, { type });
}

function useHarness(max = 2) {
  const [photos, setPhotos] = useState<Photo[]>([]);
  return usePhotoUpload({ max, photos, setPhotos });
}

describe('usePhotoUpload', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('adds only image files up to the configured max', async () => {
    const createObjectURL = vi
      .spyOn(URL, 'createObjectURL')
      .mockImplementation((file) => `blob:${(file as File).name}`);

    const { result } = renderHook(() => useHarness(2));

    await act(async () => {
      await result.current.addFiles([
        makeFile('one.png', 'image/png'),
        makeFile('two.jpg', 'image/jpeg'),
        makeFile('notes.txt', 'text/plain'),
      ]);
    });

    expect(createObjectURL).toHaveBeenCalledTimes(2);
    expect(result.current.photos).toHaveLength(2);
    expect(result.current.photos.map((photo) => photo.url)).toEqual([
      'blob:one.png',
      'blob:two.jpg',
    ]);
  });

  it('revokes the preview URL when a photo is removed', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation((file) => `blob:${(file as File).name}`);
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const { result } = renderHook(() => useHarness(2));

    await act(async () => {
      await result.current.addFiles([makeFile('one.png', 'image/png')]);
    });

    act(() => {
      result.current.removePhoto(0);
    });

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:one.png');
    expect(result.current.photos).toEqual([]);
  });

  it('revokes every preview URL on reset and unmount', async () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation((file) => `blob:${(file as File).name}`);
    const revokeObjectURL = vi.spyOn(URL, 'revokeObjectURL').mockImplementation(() => {});

    const { result, unmount } = renderHook(() => useHarness(3));

    await act(async () => {
      await result.current.addFiles([
        makeFile('one.png', 'image/png'),
        makeFile('two.jpg', 'image/jpeg'),
      ]);
    });

    act(() => {
      result.current.resetPhotos();
    });

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:one.png');
    expect(revokeObjectURL).toHaveBeenCalledWith('blob:two.jpg');
    expect(result.current.photos).toEqual([]);

    await act(async () => {
      await result.current.addFiles([makeFile('three.png', 'image/png')]);
    });

    unmount();

    expect(revokeObjectURL).toHaveBeenCalledWith('blob:three.png');
  });
});
