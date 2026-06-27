/**
 * BACK → FRONT. Lista de coincidencias del backend → modelo de dominio.
 * Deriva similarity (0..100) e isCertain desde la distancia coseno.
 */
import { MatchResult } from '../../../domain/search/match-result.model';
import { toFoundPerson } from '../../found-person/mappers/found-person-response.mapper';
import { MatchResultResponseDto } from '../dto/match-result-response.dto';

export function toMatchResult(dto: MatchResultResponseDto): MatchResult {
  const similarity = Math.max(0, Math.min(100, Math.round((1.5 - dto.distance) * 100)));
  return {
    foundPerson: toFoundPerson(dto.found_person),
    similarity,
    distance: dto.distance,
    isCertain: dto.distance < 1,
  };
}

/** Ordena por cercanía (distancia ascendente), como espera la UI. */
export const mapMatchResultList = (dtos: MatchResultResponseDto[]): MatchResult[] =>
  dtos.map(toMatchResult).sort((a, b) => a.distance - b.distance);
