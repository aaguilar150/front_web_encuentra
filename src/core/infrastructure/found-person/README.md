# infrastructure / found-person

Implementaciones de `FoundPersonRepository`:

- `found-person.http.repository.ts` — habla con el backend real vía `httpClient`
  + mappers.
- `found-person.in-memory.repository.ts` — mock con `INITIAL_FOUND_PERSONS`
  para desarrollo sin backend (lo que hoy hace `src/data.ts`).
