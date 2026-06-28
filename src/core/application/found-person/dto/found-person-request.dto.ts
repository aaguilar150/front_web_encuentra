/**
 * Cuerpo enviado al backend en POST /api/report (snake_case).
 * Forma del back, NO se usa en la UI.
 */
export interface FoundPersonRequestDto {
  full_name: string;
  identity_card: string;
  shelter_name: string;
  location_address: string;
  contact_phone: string;
  physical_description: string;
  image_base64: string;
  found_at: string; // ISO
  status: string;
}
