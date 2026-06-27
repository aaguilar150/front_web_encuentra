/**
 * Implementación HTTP de SearchRepository.
 */
import { SearchByImageInput } from '../../domain/search/match-result.model';
import { SearchRepository } from '../../domain/search/search.repository';
import { MatchResultResponseDto } from '../../application/search/dto/match-result-response.dto';
import { toSearchRequestDto } from '../../application/search/mappers/search-request.mapper';
import { mapMatchResultList } from '../../application/search/mappers/match-result-response.mapper';
import { httpClient } from '../http/http-client';

export function createSearchHttpRepository(): SearchRepository {
  return {
    async searchByImage(input: SearchByImageInput) {
      const dtos = await httpClient.post<MatchResultResponseDto[]>(
        '/search',
        toSearchRequestDto(input),
      );
      return mapMatchResultList(dtos);
    },
  };
}
