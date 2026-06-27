# application

Orquesta el negocio para la UI. Importa de `domain`; nunca al revés.

Por área contiene tres piezas:

- `dto/` — interfaces que reflejan la forma **del backend** (snake_case).
  `*-request.dto.ts` = lo que se envía (`POST`). `*-response.dto.ts` = lo que
  llega (`GET`/`list`).
- `mappers/` — traducción pura entre front (camelCase) y back (snake_case):
  - `*-request.mapper.ts`: modelo front → request DTO (**front → back**).
  - `*-response.mapper.ts`: response DTO → modelo front (**back → front**).
- `use-cases/` — un archivo por acción. Recibe un repositorio (interfaz de
  `domain`) por inyección y devuelve modelos de dominio. Aquí se aplican
  reglas + se llama al repo. La UI solo invoca casos de uso.

Áreas: `found-person/`, `search/`.
