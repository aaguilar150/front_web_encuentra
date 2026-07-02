import { describe, it, expect, vi } from 'vitest';
import { isValidImageFile, filterValidImages, appendImages } from './PhotoUploader';

// jsdom no implementa slice().arrayBuffer() de forma fiable, así que garantizamos
// los bytes que verá isValidImageFile para probar la lógica de firma (magic bytes).
function fileWithBytes(bytes: number[], name: string, type = 'image/png'): File {
  const f = new File([new Uint8Array(bytes)], name, { type });
  const buf = new Uint8Array(bytes).buffer;
  // @ts-expect-error override solo para el test
  f.slice = () => ({ arrayBuffer: async () => buf });
  return f;
}

const PNG = [0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a];
const pngFile = () => fileWithBytes(PNG, 'real.png');
const fakeFile = () => fileWithBytes([0x00, 0x01, 0x02, 0x03], 'fake.png'); // MIME image, bytes falsos

describe('isValidImageFile (magic bytes)', () => {
  it('acepta un PNG real por su firma', async () => {
    expect(await isValidImageFile(pngFile())).toBe(true);
  });
  it('rechaza un archivo con MIME image pero bytes falsos', async () => {
    expect(await isValidImageFile(fakeFile())).toBe(false);
  });
});

describe('filterValidImages', () => {
  it('deja solo las imágenes reales', async () => {
    const out = await filterValidImages([pngFile(), fakeFile()]);
    expect(out).toHaveLength(1);
    expect(out[0].name).toBe('real.png');
  });
});

describe('appendImages', () => {
  it('respeta el máximo y crea preview', () => {
    vi.spyOn(URL, 'createObjectURL').mockImplementation((f) => `blob:${(f as File).name}`);
    const out = appendImages([], [pngFile(), pngFile()], 1);
    expect(out).toHaveLength(1);
    expect(out[0].url).toContain('blob:');
  });
});
