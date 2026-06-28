# application / search

- `dto/` — `search-request.dto.ts` (POST /api/search), `match-result-response.dto.ts`
  (item del resultado del cotejo).
- `mappers/` — `search-request.mapper.ts` (front→back) y
  `match-result-response.mapper.ts` (back→front, mapea la lista de coincidencias).
- `use-cases/` — `search-by-image.use-case.ts`.
