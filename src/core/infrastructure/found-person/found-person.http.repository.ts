/**
 * Implementación HTTP de FoundPersonRepository.
 */
import { FoundPerson } from '../../domain/found-person/found-person.model';
import { FoundPersonRepository } from '../../domain/found-person/found-person.repository';
import { FoundPersonResponseDto } from '../../application/found-person/dto/found-person-response.dto';
import { toFoundPersonRequestDto } from '../../application/found-person/mappers/found-person-request.mapper';
import {
  mapFoundPersonList,
  toFoundPerson,
} from '../../application/found-person/mappers/found-person-response.mapper';
import { httpClient } from '../http/http-client';

export function createFoundPersonHttpRepository(): FoundPersonRepository {
  return {
    async list() {
      const dtos = await httpClient.get<FoundPersonResponseDto[]>('/found-persons');
      return mapFoundPersonList(dtos);
    },
    async register(person: FoundPerson) {
      const dto = await httpClient.post<FoundPersonResponseDto>(
        '/report',
        toFoundPersonRequestDto(person),
      );
      return toFoundPerson(dto);
    },
  };
}
