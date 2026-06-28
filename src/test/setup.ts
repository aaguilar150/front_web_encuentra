/**
 * Setup global de vitest (jsdom). Carga los matchers de jest-dom y rellena
 * APIs de URL que jsdom no implementa (usadas por la subida de fotos).
 */
import '@testing-library/jest-dom/vitest';

if (!URL.createObjectURL) {
  URL.createObjectURL = () => 'blob:mock';
}
if (!URL.revokeObjectURL) {
  URL.revokeObjectURL = () => {};
}
