/**
 * Contrato del repositorio de cotejo facial.
 */
import { MatchResult, SearchByImageInput } from './match-result.model';

export interface SearchRepository {
  /** POST /api/search — devuelve coincidencias ordenadas por semejanza. */
  searchByImage(input: SearchByImageInput): Promise<MatchResult[]>;
}
