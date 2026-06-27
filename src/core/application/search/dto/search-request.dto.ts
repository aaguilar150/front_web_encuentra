/**
 * Cuerpo enviado al backend en POST /api/search (snake_case).
 */
export interface SearchRequestDto {
  requester_identity_card: string;
  query_image_base64: string;
}
