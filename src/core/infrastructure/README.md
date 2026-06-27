# infrastructure

El *cómo*: implementa las interfaces de repositorio de `domain` usando mappers
de `application`. Aquí viven `axios`, URLs y adaptadores. Sin reglas de negocio.

- `http/` — cliente HTTP fino compartido.
- `found-person/` — `found-person.http.repository.ts` (backend real) y
  `found-person.in-memory.repository.ts` (mock con `INITIAL_FOUND_PERSONS`
  mientras no hay back).
- `search/` — `search.http.repository.ts`.

Elige la implementación al construir el caso de uso (composition root, p.ej.
en `src/App.tsx` o un `container.ts`): hoy mock, mañana HTTP, sin tocar UI ni
dominio.
