# domain

Corazón de la app. **Puro TypeScript**: sin `axios`, sin React, sin DTOs del
backend. No importa de `application` ni `infrastructure`.

Contiene por área:
- `*.model.ts` — entidades del negocio (camelCase) + inputs de formulario +
  reglas/factories puras.
- `*.repository.ts` — **interfaz** del repositorio (el contrato que la
  infraestructura implementará). Define el *qué*, no el *cómo*.

Áreas: `found-person/`, `search/`.
