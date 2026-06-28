/**
 * Modelos de dominio del cotejo facial (camelCase).
 */
import { FoundPerson } from '../found-person/found-person.model';

export interface MatchResult {
  foundPerson: FoundPerson;
  similarity: number; // 0..100
  distance: number;   // distancia coseno de ChromaDB (< 1 = certeza)
  isCertain: boolean; // distance < 1
}

/** Datos que captura `SearchMissingForm` para lanzar el cotejo. */
export interface SearchByImageInput {
  requesterCi: string;
  image: string; // dataURL o base64
}
