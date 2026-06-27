/**
 * BACK → FRONT. DTO del GET (snake_case) → modelo de dominio (camelCase).
 */
import { FoundPerson, FoundPersonStatus } from '../../../domain/found-person/found-person.model';
import { FoundPersonResponseDto } from '../dto/found-person-response.dto';

export function toFoundPerson(dto: FoundPersonResponseDto): FoundPerson {
  return {
    id: dto.id,
    name: dto.full_name,
    ci: dto.identity_card,
    hospitalName: dto.shelter_name,
    locationAddress: dto.location_address,
    contactPhone: dto.contact_phone,
    physicalDescription: dto.physical_description,
    imageUrl: dto.image_url,
    dateFound: dto.found_at,
    status: dto.status as FoundPersonStatus,
  };
}

/** Para GET /api/found-persons (list). */
export const mapFoundPersonList = (dtos: FoundPersonResponseDto[]): FoundPerson[] =>
  dtos.map(toFoundPerson);
