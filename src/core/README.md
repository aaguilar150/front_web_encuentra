# Core — Clean Architecture

Núcleo de la app **Reencuentro S.O.S**. Dependencias apuntan **hacia adentro**:

```
infrastructure ──▶ application ──▶ domain
   (HTTP, BD)        (casos uso,        (modelos puros
                      DTOs, mappers)     + interfaces repo)
```

Regla de oro: **una capa solo importa de las de adentro**.
`domain` no importa de nadie. `application` importa solo `domain`.
`infrastructure` implementa interfaces de `domain`/`application`. La UI
(`src/components`) solo habla con `application` (casos de uso).

## Capas

| Carpeta | Qué vive aquí | Qué NO debe vivir |
|---|---|---|
| `domain/` | Modelos (entidades camelCase), interfaces de repositorio, reglas de negocio puras | `axios`, React, snake_case del back |
| `application/` | Casos de uso + DTOs (forma del back) + **mappers** (front↔back) | Llamadas HTTP concretas, JSX |
| `infrastructure/` | Implementaciones de repos (HTTP, mock en memoria) | Reglas de negocio |
| `shared/` | Tipos transversales (`Result`, paginación) | Lógica de un solo dominio |

## Áreas (dominios)

Cada capa se subdivide por área: `found-person` y `search`. Para crear un
área nueva, copia la estructura de `found-person` (es la referencia completa).

## Flujo de mappers (lo que pidió el negocio)

- **Front → Back** (`*-request.mapper.ts`): modelo del front (camelCase) → DTO
  request (snake_case) que se envía en `POST`.
- **Back → Front** (`*-response.mapper.ts`): DTO response (snake_case) de un
  `GET`/`list` → modelo del front (camelCase) que consume la UI.
