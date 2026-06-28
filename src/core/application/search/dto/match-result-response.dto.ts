/**
 * Item devuelto por POST /api/search (snake_case).
 * Embebe la persona hallada con la misma forma que found-person.
 */
import { FoundPersonResponseDto } from '../../found-person/dto/found-person-response.dto';

export interface MatchResultResponseDto {
  found_person: FoundPersonResponseDto;
  distance: number; // distancia coseno de ChromaDB
}
