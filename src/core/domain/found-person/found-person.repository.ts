/**
 * Contrato del repositorio. La infraestructura lo implementa (HTTP, mock).
 * El dominio define el QUÉ; el CÓMO vive en infrastructure.
 */
import { FoundPerson } from './found-person.model';

export interface FoundPersonRepository {
  /** GET /api/found-persons — lista para indexado/cotejo. */
  list(): Promise<FoundPerson[]>;
  /** POST /api/report — registra e indexa una persona hallada. */
  register(person: FoundPerson): Promise<FoundPerson>;
}
