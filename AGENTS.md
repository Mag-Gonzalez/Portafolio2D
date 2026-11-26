# AGENTS.md

Reglas del proyecto `Portafolio_2D`.

- **Stack objetivo:** React + Next.js. **Meta:** 27 nov 2026.
- **Responsive real:** móvil y tablet deben conservar todas las funcionalidades y mantener alta fidelidad visual respecto a la referencia. **No bloquear bajo `64em`** ni reproducir `.responsive-layer` como barrera.
- **Referencia:** respetar lo documentado en `docs/reference/`. Distinguir siempre `[OBSERVADO]`, `[ESTIMADO]` y `[PENDIENTE]`; no inventar interacciones ni presentar suposiciones como hechos.
- **Ejecución:** trabajar en pasos cortos y verificables, sin cambios colaterales y sin dependencias no justificadas. No crear carpetas de código ni instalar paquetes sin aprobación explícita.
- **Cierre:** detenerse al terminar cada tarea para revisión, reportando evidencia, decisiones y pendientes antes de continuar.

<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->
