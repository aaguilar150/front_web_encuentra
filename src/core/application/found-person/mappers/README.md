# mappers (found-person)

Funciones puras, sin estado, sin I/O. Único lugar donde camelCase ↔ snake_case.

- `found-person-request.mapper.ts` → **front → back**: `FoundPerson` → `FoundPersonRequestDto`.
- `found-person-response.mapper.ts` → **back → front**: `FoundPersonResponseDto` → `FoundPerson`
  (incluye `mapFoundPersonList` para los `GET`/`list`).
