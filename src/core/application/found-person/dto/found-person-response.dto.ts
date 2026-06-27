/**
 * Item devuelto por el backend en GET /api/found-persons (snake_case).
 * Forma del back, NO se usa en la UI.
 */
export interface FoundPersonResponseDto {
  id: string;
  full_name: string;
  identity_card: string;
  shelter_name: string;
  location_address: string;
  contact_phone: string;
  physical_description: string;
  image_url: string;
  found_at: string; // ISO
  status: string;
}
