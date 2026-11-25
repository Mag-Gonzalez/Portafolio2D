# Auditoría de referencia — adrienlamy.fr

- **Fecha:** 2026-11-25
- **URL auditada:** <https://adrienlamy.fr/>
- **Variante observada:** <https://adrienlamy.fr/?ref=landing.love> (mismo contenido)
- **Objetivo:** servir de referencia para una reconstrucción futura en React/Next.js.
- **Estado:** auditoría cerrada a nivel de documento. **No se ha construido la web, no se han instalado dependencias y no se ha modificado código fuente.**

## 1. Convenciones de evidencia

| Marca | Significado |
| --- | --- |
| `[OBSERVADO]` | Medido/detectado en el navegador real, en la red o en el bundle publicado. |
| `[ESTIMADO]` | Interpretación razonable derivada de lo observado; no debe tratarse como hecho. |
| `[PENDIENTE]` | No verificable con las herramientas disponibles en esta sesión. |
| `[NO OBSERVADO]` | Se buscó/examinó y no apareció evidencia. |

## 2. Método

1. [OBSERVADO] Navegador Chromium real integrado, pestaña principal a **912 × 766 px**.
2. [OBSERVADO] Inspección de DOM, estilos computados, `getBoundingClientRect()`, `elementFromPoint()`, eventos sintéticos (`mouseenter`, `click`) y `browser.press` para teclado real sintético.
3. [OBSERVADO] Lectura de red (documento, JS, CSS, fuente, imágenes, texturas WebGL y vídeos) y consola.
4. [OBSERVADO] Muestreo del canvas WebGL mediante lectura de píxeles y render ASCII, porque `browser.screenshot` falló en esta sesión.
5. [OBSERVADO] Iframes a **390 × 844**, **768 × 1024** y **1440 × 900** para layout responsive estático. `requestAnimationFrame` está throttled dentro de los iframes: GSAP/WebGL no son fiables allí.
6. [OBSERVADO] El bundle público `assets/index-syGRYt4a.js` se usó **solo como corroboración** de nombres de eventos, constantes y secuencias; nunca sustituyó la interacción explorada.

### Limitaciones materiales

- [PENDIENTE] `browser.screenshot` devolvió: *“Screenshot needs a visible tab. Call browser.tabs.focus and keep its desktop window visible.”* No hay capturas bitmap de esta sesión.
- [PENDIENTE] No hay emulación táctil ni dispositivo móvil real: no se verificaron drag táctil, inercia, pinza ni `touch-action`.
- [PENDIENTE] `window.resizeTo(1440,900)` cambió `outerWidth` pero no `innerWidth`; se usaron iframes para los anchos grandes.
- [PENDIENTE] A 912 px, `.responsive-layer` intercepta el puntero real (`elementFromPoint` devuelve el overlay), por lo que parte de la exploración usó eventos sintéticos.
- [NO OBSERVADO] Audio: no se detectó `AudioContext` en el bundle ni sonido durante vídeos/interacciones.

## 3. Resumen ejecutivo

[OBSERVADO] La referencia es una **experiencia de una sola página** donde un canvas WebGL fijo ocupa el fondo y una capa DOM superimpuesta contiene el contenido. La interacción principal no es scroll tradicional, sino un **arrastre de una mano** que revela el panel de contenido; una **cabeza** cambia de expresión al hover/drag. Existe una capa de vídeo (media layer), un Easter Egg Konami y un switch de tema.

[OBSERVADO] La experiencia está construida con **Vue 3 + Vite**, Three.js r170 con postprocesado, GSAP (ScrollTrigger/Observer/Flip/SplitText/CustomEase), OverlayScrollbars y Google Analytics. La fuente es **Comic CAT**.

[OBSERVADO] El diseño es intencionalmente “toy/editorial”: rojo corporal, negro carbón, gris y blanco; tipografía comic; sprites/texturas WebGL con head, hand, flames, scribbles y ruido.

## 4. Hallazgos clave

### 4.1 Arquitectura visual

- [OBSERVADO] `canvas.webgl-container__canvas`, `position: fixed`, `z-index: 0`, `data-engine="three.js r170"`, DPR activo (1140 × 957 backing store para 912 × 766 CSS px).
- [OBSERVADO] `.content.is-desktop`, `z-index: 100`, contiene `.side-panel`.
- [OBSERVADO] `.media-layer`, `z-index: 300`, `position: fixed`, fuera de vista hasta `MEDIA_SHOW`.
- [OBSERVADO] `.responsive-layer`, `z-index: 300`, `position: fixed`, visible por debajo de `64em`.

### 4.2 Estado inicial

- [OBSERVADO] Título del documento/WebGL: `Adrien Lamy :D`.
- [OBSERVADO] En el canvas: cabeza a la izquierda y mano a la derecha sobre fondo rojo `#ff0b36`.
- [OBSERVADO] Columnas de contenido con `opacity: 0` y `pointer-events: none` hasta que se arrastra la mano.
- [OBSERVADO] El panel lateral a 912 px está en flujo relativo: a `scrollY = 0` su caja es `[91, 728, 729.6, 1005]`; a `scrollY = 600`, `[91, 128, 729.6, 1005]`. A 1440 px sí es `position: fixed` con caja `[310, 0, 1116, 900]`.

### 4.3 Interacciones verificadas

| ID | Interacción | Resultado |
| --- | --- | --- |
| `INT-001` | Hover sobre la cabeza | Cursor `grab`, título `Adrien Lamy :o`. |
| `INT-002` | Drag de la cabeza | Cursor `grabbing`, título `Adrien Lamy x/`; al soltar vuelve a `:o` o `:D` según hover. |
| `INT-003` | Drag de la mano hacia la izquierda | Umbral aprox. `dragTotalRel.x * -1 >= .333`; columnas `opacity: 0 → 1`, panel negro, contenido interactivo. |
| `INT-004` | Clic en signo de cierre WebGL | Oculta UI (`is-hidden`, `opacity: 0`, `pointer-events: none`). |
| `INT-005` | Hover en CTA | Flecha `x: 0 → 16px`, gris → blanco; chars con stagger ≈ 0.02 s y elastic. |
| `INT-006` | Clic en copiar email | `navigator.clipboard.writeText('hey@adrienlamy.fr')`; tooltip “Copied!” con stagger. |
| `INT-007` | Clic en `Watch` de Claynosaurz | Abre `/videos/claynosaurz.webm`, bloquea scroll, anima el reproductor. |
| `INT-008` | Cierre de media | Sale `is-visible`, desbloquea scroll tras ≈ 2.3 s, pausa/resetea vídeo. |
| `INT-009` | Konami `↑↑↓↓←→←→ba` | Abre `/videos/salut-cest-frank-leboeuf-vous-voulez-savoir-combien-vaut-votre-voiture.mp4`, ocurre `SCRIBBLES_HIDE`, título `frank leboeuf :D`. |
| `INT-010` | Switch de tema | Cambia `.mobile-switch.is-on`, `.side-panel.is-light`, colores de texto e imagen on/off. |
| `INT-012` | Scroll de escritorio | Documento de 1824 px; el panel relativo se desplaza 1:1 con scroll a 912 px. |

Detalle completo en [`INTERACTION_INVENTORY.md`](./INTERACTION_INVENTORY.md).

### 4.4 Secciones de contenido

1. **Portada WebGL / personaje** — fondo rojo, cabeza, mano, título dinámico.
2. **Panel lateral** — columna izquierda (About + contacto) y derecha (proyectos + media CTA).
3. **About** — “Sup, I'm Adrien Lamy, Creative Dev Mercenary Based in Paris (the french one)” + 3 párrafos.
4. **Contacto** — LinkedIn, Portfolio y email copiable.
5. **Proyectos** — 10 entradas con enlaces `Visit`/`Case`.
6. **Media layer** — reproductor con máscara de teléfono y dos vídeos posibles.
7. **Capa responsive** — mensaje de disculpa bajo `64em`.
8. **Switch de tema** — en DOM, oculto en escritorio por animación/breakpoint.
9. **Easter egg Konami** — estado alternativo del título y vídeo.

Detalle en [`SECTION_BREAKDOWN.md`](./SECTION_BREAKDOWN.md).

### 4.5 Stack detectado

| Capa | Tecnología | Evidencia |
| --- | --- | --- |
| UI | Vue 3 + Vite | `#app[data-v-app]`, `data-v-*`, bundles hashed. |
| 3D | Three.js r170 + postprocessing | `data-engine`, `EffectComposer`, shaders/pass en bundle. |
| Animación | GSAP + ScrollTrigger + Observer + Flip + SplitText + CustomEase | Nombres y plugins en bundle; transforms inline observados. |
| Scroll UI | OverlayScrollbars | Clases `os-*` y configuración en bundle. |
| Utilidades | UAParser.js | `this.uaParser`, `isMobile/isTablet/isDesktop` en bundle. |
| Analítica | Google Analytics G-C215R1M0J7 | `gtag/js`, `/g/collect`. |
| Fuente | Comic CAT | `/fonts/Comic_CAT.woff2`, `font-family: "Comic CAT", sans-serif`. |

Detalle en [`TECHNICAL_ARCHITECTURE.md`](./TECHNICAL_ARCHITECTURE.md).

## 5. Recursos observados

- JS: `/assets/index-syGRYt4a.js`
- CSS: `/assets/index-DNSZeNd5.css`
- Fuente: `/fonts/Comic_CAT.woff2`
- Imágenes UI: `/images/ctas/tex-ui-switch-fe-on.webp`, `/images/ctas/tex-ui-switch-fe-off.webp`, `/images/media/tex-phone-close.webp`, `/images/media/tex-phone-portrait-{back,front}.webp`, `/images/media/tex-phone-landscape-{back,front}.webp`
- Texturas WebGL: `/webgl/textures/noises/*`, `/webgl/textures/scribbles/*`, `/webgl/textures/hand/tex_hand.webp`, `/webgl/textures/headParts/*`, `/webgl/textures/commons/{white,black}.jpg`
- Vídeos: `/videos/claynosaurz.webm`, `/videos/salut-cest-frank-leboeuf-vous-voulez-savoir-combien-vaut-votre-voiture.mp4`

## 6. Riesgos para la reconstrucción

1. **Riesgo alto — WebGL como narrativa, no decoración.** La cabeza, la mano y el signo de cierre son controles. Una réplica solo visual pierde la interacción central.
2. **Riesgo alto — Responsive intencionalmente roto.** La capa bajo `64em` bloquea el puntero; reproducirla “mejorada” cambia la experiencia. Debe decidirse explícitamente si se clona o se corrige.
3. **Riesgo medio — Hit areas WebGL.** Las zonas dependen del viewport y del sprite; no son botones DOM. Necesitan raycasting o zonas normalizadas.
4. **Riesgo medio — Animaciones encadenadas.** Media y Konami bloquean scroll y restauran estado con retardos ~2 s; una implementación ingenua puede dejar el scroll bloqueado.
5. **Riesgo medio — Tema.** Los rótulos del switch parecen invertidos respecto al estado (`is-on` ↔ `is-light`); conviene modelar el estado subyacente, no el texto.
6. **Riesgo bajo — Accesibilidad.** No se verificó foco por teclado ni `prefers-reduced-motion`; la reconstrucción debe añadirlos como mejora, marcándolos como no observados en la referencia.

## 7. Pendiente explícito

- Capturas visuales reales y baseline de comparación (bloqueado por `browser.screenshot`).
- Verificación táctil real y de gestos en móvil/tablet.
- Hover real sobre enlaces a 1440 px sin overlay (solo se hizo sintético a 912 px).
- Comportamiento de foco/teclado y lectores de pantalla.
- Confirmación de si el cambio de paleta WebGL acompaña al switch cuando rAF no está throttled.
- Duración precisa de la animación de cierre de UI y de los tweens internos de cabeza/mano.

## 8. Conclusión

[OBSERVADO] La referencia tiene una arquitectura clara: **canvas fijo + capa DOM revelada por gesto + media layer modal + Easter egg**. La reconstrucción debe priorizar primero la máquina de estados y el bus de eventos, después la fidelidad visual y por último las animaciones finas.

[ESTIMADO] El orden de implementación recomendado está en [`IMPLEMENTATION_ROADMAP.md`](./IMPLEMENTATION_ROADMAP.md) y los criterios de aceptación en [`VALIDATION_CRITERIA.md`](./VALIDATION_CRITERIA.md).
