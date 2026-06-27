/**
 * Caso de uso: registrar una persona hallada.
 * Aplica la regla de protección de menores y delega en el repositorio.
 */
import {
  RegisterFoundPersonInput,
  buildFoundPerson,
} from '../../../domain/found-person/found-person.model';
import { FoundPersonRepository } from '../../../domain/found-person/found-person.repository';

const defaultId = () => `usr_${Math.random().toString(36).slice(2, 11)}_${Date.now()}`;
const defaultNow = () => new Date().toISOString();

export function makeRegisterFoundPerson(
  repo: FoundPersonRepository,
  idFactory: () => string = defaultId,
  now: () => string = defaultNow,
) {
  return (input: RegisterFoundPersonInput) => {
    const person = buildFoundPerson(input, idFactory, now);
    return repo.register(person);
  };
}
