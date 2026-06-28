/**
 * FRONT → BACK. Input del form → DTO del POST /api/search.
 */
import { SearchByImageInput } from '../../../domain/search/match-result.model';
import { SearchRequestDto } from '../dto/search-request.dto';

export function toSearchRequestDto(input: SearchByImageInput): SearchRequestDto {
  return {
    requester_identity_card: input.requesterCi,
    query_image_base64: input.image,
  };
}
