/**
 * FRONT → BACK. Modelo de dominio (camelCase) → DTO del POST (snake_case).
 */
import { FoundPerson } from '../../../domain/found-person/found-person.model';
import { FoundPersonRequestDto } from '../dto/found-person-request.dto';

export function toFoundPersonRequestDto(person: FoundPerson): FoundPersonRequestDto {
  return {
    full_name: person.name,
    identity_card: person.ci,
    shelter_name: person.hospitalName,
    location_address: person.locationAddress,
    contact_phone: person.contactPhone,
    physical_description: person.physicalDescription,
    image_base64: person.imageUrl,
    found_at: person.dateFound,
    status: person.status,
  };
}
