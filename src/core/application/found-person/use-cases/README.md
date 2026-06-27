# use-cases (found-person)

Una acción por archivo. Reciben el repositorio (interfaz de `domain`) por
inyección → testeable con un mock. Devuelven modelos de dominio. La UI invoca
estos casos de uso, nunca el repo directo.

- `register-found-person.use-case.ts` — aplica protección de menores (factory
  de dominio) y registra.
- `list-found-persons.use-case.ts` — lista personas indexadas.
