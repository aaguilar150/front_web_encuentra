/**
 * Tipos transversales. Sin dependencias de otras capas.
 */

/** Resultado de un caso de uso: éxito con dato, o error con mensaje. */
export type Result<T> =
  | { ok: true; value: T }
  | { ok: false; error: string };

export const ok = <T>(value: T): Result<T> => ({ ok: true, value });
export const fail = <T = never>(error: string): Result<T> => ({ ok: false, error });

/** Forma típica de una respuesta paginada del backend (snake_case). */
export interface PaginatedResponseDto<T> {
  items: T[];
  total: number;
  page: number;
  page_size: number;
}
