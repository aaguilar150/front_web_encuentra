/**
 * Mock en memoria de FoundPersonRepository. Reemplaza a src/data.ts mientras
 * no exista backend.
 */
import { FoundPerson } from '../../domain/found-person/found-person.model';
import { FoundPersonRepository } from '../../domain/found-person/found-person.repository';
import { INITIAL_FOUND_PERSONS } from '../../../data';

export function createFoundPersonInMemoryRepository(
  seed: FoundPerson[] = INITIAL_FOUND_PERSONS,
): FoundPersonRepository {
  const store = [...seed];
  return {
    async list() {
      return [...store];
    },
    async register(person: FoundPerson) {
      store.unshift(person);
      return person;
    },
  };
}
