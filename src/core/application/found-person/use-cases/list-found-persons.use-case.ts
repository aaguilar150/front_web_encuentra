/**
 * Caso de uso: listar personas halladas e indexadas.
 */
import { FoundPersonRepository } from '../../../domain/found-person/found-person.repository';

export function makeListFoundPersons(repo: FoundPersonRepository) {
  return () => repo.list();
}
