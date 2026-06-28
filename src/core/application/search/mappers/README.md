# mappers (search)

- `search-request.mapper.ts` → **front → back**: `SearchByImageInput` → `SearchRequestDto`.
- `match-result-response.mapper.ts` → **back → front**: `MatchResultResponseDto[]` →
  `MatchResult[]`. Deriva `similarity` e `isCertain` a partir de `distance`
  (regla de presentación que hoy vive en el componente).
