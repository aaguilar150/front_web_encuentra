# infrastructure / search

Implementación de `SearchRepository`:

- `search.http.repository.ts` — `POST /api/search` con mappers de `application`.

(La simulación actual del cotejo vive en `SearchMissingForm`; al conectar el
back, mover esa lógica a un repo mock aquí siguiendo el patrón in-memory de
found-person.)
