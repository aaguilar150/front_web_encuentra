# application / found-person

Caso de referencia completo. Copia esta estructura para áreas nuevas.

- `dto/` — `found-person-request.dto.ts` (POST /api/report),
  `found-person-response.dto.ts` (GET /api/found-persons).
- `mappers/` — `found-person-request.mapper.ts` (front→back) y
  `found-person-response.mapper.ts` (back→front, usado por `list`).
- `use-cases/` — `register-found-person.use-case.ts`, `list-found-persons.use-case.ts`.
