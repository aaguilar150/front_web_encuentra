/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

export interface FoundPerson {
  id: string;
  name: string;
  ci: string;
  hospitalName: string;
  locationAddress: string;
  contactPhone: string;
  physicalDescription: string;
  imageUrl: string;
  dateFound: string;
  status: 'refugiado' | 'hospitalizado' | 'desconocido' | 'reunificado';
}

export interface MatchResult {
  foundPerson: FoundPerson;
  similarity: number; // 0 to 1 scale (e.g. 0.85 = 85% similarity)
  distance: number; // The exact mathematical distance from ChromaDB (e.g., < 1 is high certainty)
  isCertain: boolean; // distance < 1
}

export interface SearchRequest {
  requesterCi: string;
  missingPersonImage: string; // Data URL or file name
  dateRequested: string;
}

export interface Testimonial {
  id: string | number;
  name: string;
  role?: string;         // Ej: "Familiar", "Rescatista", "Voluntario"
  content: string;       // El texto del testimonio o descripción del histórico
  dateReported?: string; // Fecha en que se registró
  imageUrl?: string;     // Por si el histórico incluye foto del reencuentro
}