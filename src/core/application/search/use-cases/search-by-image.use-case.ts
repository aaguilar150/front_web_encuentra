/**
 * Caso de uso: cotejar un rostro contra la base indexada.
 */
import { SearchByImageInput } from '../../../domain/search/match-result.model';
import { SearchRepository } from '../../../domain/search/search.repository';

export function makeSearchByImage(repo: SearchRepository) {
  return (input: SearchByImageInput) => repo.searchByImage(input);
}
