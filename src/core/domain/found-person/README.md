# domain / found-person

Persona hallada por rescatistas e indexada para cotejo facial.

- `found-person.model.ts` — entidad `FoundPerson` (camelCase), `RegisterFoundPersonInput`
  (datos crudos del form) y `buildFoundPerson()` (factory que aplica la regla de
  **protección de menores**: si `isChild`, oculta nombre/cédula/dirección).
- `found-person.repository.ts` — interfaz `FoundPersonRepository`.

La regla de protección de menores vive aquí (es negocio), NO en el componente.
