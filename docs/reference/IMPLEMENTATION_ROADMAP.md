# Hoja de ruta de implementación — reconstrucción React/Next.js

> Plan propuesto. **No ejecutar sin aprobación explícita.** Ordena el trabajo por dependencias, no por dificultad visual.
> Los IDs `INT-*` referencian [`INTERACTION_INVENTORY.md`](./INTERACTION_INVENTORY.md).

## Principios rectores

1. Primero la **máquina de estados**, después el look.
2. El canvas WebGL es un **control**, no un fondo decorativo.
3. Toda divergencia respecto a la referencia queda registrada.
4. Cada fase termina con una verificación observable (ver [`VALIDATION_CRITERIA.md`](./VALIDATION_CRITERIA.md)).

---

## Fase 0 — Fundación y contrato (sin UI visible)

**Objetivo:** dejar el esqueleto Next.js y el contrato de eventos.

**Tareas**

- Crear app Next.js con una sola ruta `/`.
- Añadir `Comic_CAT.woff2` como fuente local.
- Definir tokens de color: `#ff0b36`, `#1c1c1c`, `#c9c9c9`, `#343434`, `#fff`.
- Implementar `lib/events.ts` y el store con los estados de `TECHNICAL_ARCHITECTURE.md`.
- Configurar capas z: canvas 0, content 100, media 300, responsive 300.

**Salida**

- `document.title === "Adrien Lamy :D"`.
- Store con `ui: "hidden"`, `media: null`, `theme: "light"`.
- Sin canvas aún o con placeholder rojo.

**Riesgos:** over-engineering del store. Mantenerlo plano.

---

## Fase 1 — DOM estático y responsive gate

**Objetivo:** replicar la estructura textual y los breakpoints.

**Tareas**

- `SidePanel`, `About`, `Contact`, `ProjectList` con el contenido exacto de `SECTION_BREAKDOWN.md`.
- `a.cta-link` con los 11 `href` verificados (2 contacto + 9 proyectos; Claynosaurz es botón).
- `button.cta-copy` con `sr-only` y tooltip “Copied!”.
- `ResponsiveLayer` visible < `64em`, `display: none` ≥ `64em`.
- Columnas con `opacity: 0; pointer-events: none` en estado `ui: hidden`.
- Grilla de proyectos 2 columnas a `90em`; flex column por debajo.

**Salida**

- A 390/768: overlay visible y `pointer-events: auto`.
- A 1440: `.side-panel` fijo `[310,0,1116,900]`, grilla `282px 282px`.
- Textos y enlaces idénticos a la referencia.

**Riesgo:** “arreglar” el responsive por iniciativa. No hacerlo sin aprobación.

---

## Fase 2 — Escena WebGL base

**Objetivo:** reproducción visual mínima del canvas.

**Tareas**

- Canvas `fixed`, z0, DPR limitado.
- Fondo rojo `#ff0b36`.
- Sprites/texturas: head, hand, scribbles, noises (o placeholders si las texturas no están disponibles).
- Título dinámico mapeado al store: `default/surprised/frowning/frank`.
- Eventos `WEBGL_LOAD_*` y `FIRST_RENDER`.
- Composer simple; añadir passes solo si el baseline lo exige.

**Salida**

- Muestreo ASCII equivalente: cabeza izquierda, mano derecha.
- `document.title` cambia cuando cambia `face`.

**Riesgo:** invertir tiempo en shaders antes de validar hit areas. Mantener simple.

---

## Fase 3 — Gestos núcleo (`INT-001` a `INT-004`)

**Objetivo:** que la experiencia se pueda “abrir”.

**Tareas**

- Hit areas normalizadas para cabeza y mano.
- Hover cabeza → `face: surprised`, cursor `grab`.
- Drag cabeza → `face: frowning`, cursor `grabbing`; restore al soltar.
- Drag mano con umbral `dragTotalRel.x * -1 >= 0.333` → `UI_SHOW`.
- Close sign → `UI_HIDE`.
- Emitir `FACE_DRAG_*`, `FINGER_DRAG_*`.

**Salida**

- Columnas `opacity: 0 → 1` y `.side-panel__content` interactivo tras el drag.
- Cierre devuelve columnas a `opacity: 0`, `is-hidden`.

**Riesgo:** zonas absolutas en píxeles. Usar coordenadas normalizadas.

---

## Fase 4 — CTA, copia y proyectos (`INT-005`, `INT-006`, `INT-011`)

**Objetivo:** animaciones finas del panel.

**Tareas**

- `SplitText`-like por carácter para `.cta-link`.
- Hover: flecha `x 16px`, color gris→blanco, chars stagger 0.02 s, elastic.
- `CopyEmailButton`: `navigator.clipboard.writeText("hey@adrienlamy.fr")`.
- Tooltip con stagger 0.06 s, overshoot y retorno ≈ 1.8 s.
- Verificar los 11 destinos y `target="_blank"`.

**Salida**

- API de clipboard interceptada devuelve el email exacto.
- Transform de chars medible en rAF.

**Riesgo:** `navigator.clipboard` requiere contexto seguro; añadir fallback documentado.

---

## Fase 5 — Media layer y Konami (`INT-007` a `INT-009`)

**Objetivo:** capa modal con dos vídeos.

**Tareas**

- `MediaLayer` con z300, `pointer-events` condicionado a `is-visible`.
- Animación entrada: `translateY(100vh) rotate(-30deg) scale(.5,.8)` → `translate3d(0,0,0) scale(...)`.
- `body.has-scroll-lock` al abrir; cleanup al cerrar (~2.3 s).
- Vídeo `claynosaurz.webm` desde CTA Watch.
- Detector Konami exacto de 10 teclas.
- `SCRIBBLES_HIDE` + título `frank leboeuf :D` + MP4.
- Flash blanco al cerrar; `pause()`, `currentTime=0`, `src=""`.

**Salida**

- Ambas rutas de media abren y cierran sin scroll bloqueado.
- `document.title === "frank leboeuf :D"` tras Konami.

**Riesgo:** scroll lock huérfano. Centralizar en un único efecto con cleanup.

---

## Fase 6 — Tema y pulido (`INT-010`, responsive)

**Objetivo:** switch y accesibilidad.

**Tareas**

- `MobileSwitch` con `MOBILE_SWITCH_TOGGLE`.
- Clases `.is-on` / `.side-panel.is-light`; colores `#1c1c1c/#343434` ↔ `#fff/#c9c9c9`.
- Imágenes on/off.
- Ajustes `64em`, `90em`, `120em`, `131.25em` y reglas de altura.
- Reducir movimiento con `prefers-reduced-motion` (mejora declarada).
- Fallback teclado para abrir UI (mejora declarada).

**Salida**

- Toggle cambia clases y colores en ambos sentidos.
- Sin regresión en overlay responsive.

**Riesgo:** confundir el texto invertido del switch. Modelar `theme` real.

---

## Fase 7 — Validación y cierre

**Objetivo:** demostrar paridad y documentar divergencias.

**Tareas**

- Ejecutar la matriz de [`VALIDATION_CRITERIA.md`](./VALIDATION_CRITERIA.md).
- Capturar screenshots de baseline (pendiente en la auditoría por fallo de herramienta).
- Comparar 390/768/1440 y estados: idle, ui-open, media, konami, theme.
- Revisar consola sin errores y red sin 4xx/5xx propios.
- Registrar decisiones: clonar vs mejorar responsive, usar GSAP vs WAAPI, incluir GA4 o no.

**Salida**

- Reporte de cumplimiento por `INT-*`.
- Lista de divergencias aprobadas.

**Riesgo:** dar por terminado sin baseline visual. No hacerlo.

---

## Prioridades resumidas

| Prioridad | Elemento | Por qué |
| --- | --- | --- |
| P0 | Estado + event bus | Todo depende de él |
| P0 | Drag mano / UI_SHOW | Es la entrada al contenido |
| P0 | Head hover/drag + título | Es la identidad visual |
| P1 | Media layer + scroll lock | Segunda interacción más visible |
| P1 | Responsive gate | Define qué usuario ve qué |
| P2 | CTA hover / tooltip | Detalle de calidad |
| P2 | Konami | Easter egg, no core |
| P3 | Switch tema | Presente pero oculto en escritorio |
| P3 | GA4 | No necesario para paridad funcional |

## Criterio de “listo para aprobación”

La fase 7 solo puede cerrarse cuando:

1. Todos los `INT-001`…`INT-010` pasan con evidencia.
2. `INT-013`…`INT-016` siguen marcados como pendientes/no observados o se han verificado con nueva herramienta.
3. Existe baseline visual o se documenta explícitamente su ausencia.
4. El usuario ha aprobado las divergencias propuestas.
