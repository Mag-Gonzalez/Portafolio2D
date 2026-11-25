# Criterios de validación — reconstrucción React/Next.js

> Criterios propuestos para aceptar la reconstrucción. Cada fila es verificable por DOM, estilo computado, red o interacción.
> `INT-*` = identificador del [`INTERACTION_INVENTORY.md`](./INTERACTION_INVENTORY.md).

## 1. Matriz funcional

| ID | Criterio | Método | Resultado esperado | Auto | Prioridad |
| --- | --- | --- | --- | --- | --- |
| `INT-001` | Hover cabeza | `mouseenter` sobre zona normalizada | `cursor: grab`; `document.title === "Adrien Lamy :o"` | Parcial | P0 |
| `INT-002` | Drag cabeza | `mousedown` + `mousemove` + `mouseup` | Durante drag `cursor: grabbing` y título `x/`; al soltar `:o` dentro / `:D` fuera | No | P0 |
| `INT-003` | Drag mano abre UI | Arrastre con `dx < -0.333 * viewportWidth` | Columnas `opacity: 1`, `pointer-events: auto`, evento `UI_SHOW` | Parcial | P0 |
| `INT-004` | Close sign cierra UI | Clic en zona normalizada de cierre | `is-hidden`, `opacity: 0`, `pointer-events: none`, evento `UI_HIDE` | Parcial | P0 |
| `INT-005` | Hover CTA | `mouseenter` en `.cta-link` | Icono `translateX(16px)`, color `rgb(255,255,255)`, chars con stagger | Sí | P2 |
| `INT-006` | Copiar email | Interceptar `navigator.clipboard.writeText` + clic | Texto exacto `hey@adrienlamy.fr`; tooltip animate | Sí | P2 |
| `INT-007` | Media Claynosaurz | Clic `.cta-media` | `.media-layer.is-visible`, `body.has-scroll-lock`, `src` contiene `claynosaurz.webm`, autoplay | Sí | P1 |
| `INT-008` | Cerrar media | Clic `.media-layer__close-button` | Tras ≈ 2.3 s: sin `is-visible`, sin scroll lock, `paused === true`, `currentTime === 0`, `src === ""` | Sí | P1 |
| `INT-009` | Konami | `browser.press` de 10 teclas | Título `frank leboeuf :D`, media visible, MP4 Frank, `SCRIBBLES_HIDE` | Sí | P2 |
| `INT-010` | Switch tema | Clic `.mobile-switch` | Alterna `.is-on`, `.side-panel.is-light`, colores e imagen on/off | Sí | P3 |
| `INT-011` | Enlaces | Leer atributos | 11 `href` exactos, `target="_blank"`, `rel="noopener noreferrer"` | Sí | P1 |
| `INT-012` | Scroll 912 px | `scrollTo` | `scrollHeight === 1824` (referencia); panel relativo se mueve 1:1 | Sí | P2 |

## 2. Criterios por sección

| Sección | Criterio | Esperado |
| --- | --- | --- |
| Portada | Canvas | `position: fixed`, `z-index: 0`, `data-engine` o equivalente documentado |
| Título | Estados | `Adrien Lamy :D`, `:o`, `x/`, `frank leboeuf :D` |
| About | Texto | Título y 3 párrafos exactos de `SECTION_BREAKDOWN.md` |
| Contacto | Elementos | 2 `<a>` + 1 `<button>`; email `hey@adrienlamy.fr` |
| Proyectos | Cantidad | 10 proyectos; Claynosaurz con `button.cta-media`, resto con `<a>` |
| Media | Controles | `controls`, `autoplay`, `playsinline` |
| Responsive | Overlay | Visible < 1024 px, `pointer-events: auto`; `display: none` ≥ 1024 px |
| Switch | Imágenes | `tex-ui-switch-fe-on.webp` / `tex-ui-switch-fe-off.webp` |
| Konami | Secuencia | `↑↑↓↓←→←→ba`, sin aceleradores ni input editable activo |

## 3. Criterios visuales

[OBSERVADO] No hay screenshots de la auditoría: `browser.screenshot` falló por tab no visible. Por tanto los criterios visuales deben ejecutarse **después** de generar un baseline propio.

| ID | Verificación | Método | Umbral propuesto [ESTIMADO] |
| --- | --- | --- | --- |
| `VIS-001` | Estado idle 912 × 766 | Captura + muestreo ASCII del canvas | Cabeza izquierda, mano derecha, fondo rojo dominante |
| `VIS-002` | UI abierta 1440 × 900 | Captura | Panel fijo `[310,0,1116,900]`, 2 columnas, grilla 2× N |
| `VIS-003` | Media abierta | Captura | Player centrado, sin rotación residual, máscara de teléfono visible |
| `VIS-004` | Konami | Captura | Título “frank leboeuf :D”, garabatos ocultos |
| `VIS-005` | Tema | Captura | Contraste invertido en About/proyectos, icono switch coherente |
| `VIS-006` | Overlay 390 px | Captura | Mensaje centrado sobre `#1c1c1c`, sin contenido subyacente visible |

[ESTIMADO] Comparación por diferencia de píxeles solo después de fijar: mismo viewport, mismo DPR, mismo estado de animación (esperar a que GSAP termine).

## 4. Criterios de color y tipografía

| Token | Valor observado | Verificación |
| --- | --- | --- |
| Fondo WebGL | `#ff0b36` | Muestreo de píxel / CSS |
| Negro | `#1c1c1c` | `.responsive-layer`, `.about__title` en light |
| Gris claro | `#c9c9c9` | `.about__description` en dark |
| Gris oscuro | `#343434` | `.about__description` en light |
| Blanco | `#fff` | `.project__title`, CTA hover |
| Fuente | `"Comic CAT", sans-serif` | `getComputedStyle(document.body).fontFamily` |

## 5. Criterios de red y recursos

- [OBSERVADO] Lista esperada en la referencia: `index-*.js`, `index-*.css`, `Comic_CAT.woff2`, texturas WebGL, 6 imágenes UI, 2 vídeos.
- [ESTIMADO] En la reconstrucción se aceptan rutas distintas si el contenido es equivalente; documentar el mapa de recursos.
- El vídeo **no** debe cargarse en `idle` [OBSERVADO en la referencia: `src=""` antes de abrir].
- No debe haber 4xx/5xx propios ni errores no capturados en consola.

## 6. Criterios de accesibilidad [ESTIMADO — mejora]

| Criterio | Esperado |
| --- | --- |
| `h1.sr-only` / `h2.sr-only` | Presentes con el texto exacto |
| Foco | `outline` visible en buttons/links |
| Teclado | `Enter` activa copiar, switch y CTA; alternativa para abrir UI |
| `prefers-reduced-motion` | Sin stagger/elastic; UI accesible sin drag |
| `aria-live` | “Copied!” anunciado |
| Canvas | `aria-hidden` si el DOM contiene equivalente |

[OBSERVADO] Estas mejoras **no** se verificaron en la referencia; no deben contarse como paridad, sino como divergencia aprobada.

## 7. Criterios de estado y limpieza

| Situación | Criterio |
| --- | --- |
| Cerrar media y recargar | Sin `has-scroll-lock` persistente |
| Cerrar media y abrir de nuevo | `video.currentTime === 0` al inicio |
| Konami durante media | No debe duplicar listeners ni timelines [ESTIMADO] |
| Cambiar de tema dos veces | Estado vuelve al original exacto |
| `document.hidden` | rAF pausado [ESTIMADO, no observado en referencia] |
| StrictMode de React | Timelines no duplicados (`gsap.context` + cleanup) |

## 8. Matriz de pendientes que aún pueden invalidar la paridad

| ID | Pendiente | Impacto |
| --- | --- | --- |
| `INT-013` | Hover real sin overlay | Puede revelar estados no vistos con eventos sintéticos |
| `INT-014` | Gestos táctiles | La rama móvil puede ser distinta a la de escritorio |
| `INT-015` | Foco/teclado | Puede existir navegación oculta no detectada |
| `INT-016` | Audio | Confirmar que no hay audio en vídeos |
| `VIS-*` | Baseline visual | Sin esto no se puede afirmar similitud, solo estructura |
| `ANIM-*` | Easing exacto | Solo se conocen valores medidos, no curvas fuente |

## 9. Protocolo de aceptación

1. Ejecutar criterios funcionales `INT-001`…`INT-012`.
2. Generar baseline visual y ejecutar `VIS-001`…`VIS-006`.
3. Registrar cada fallo con ID, viewport, estado y evidencia.
4. Corregir y repetir solo la fila fallida + una prueba de regresión adyacente.
5. Obtener aprobación explícita antes de pasar a mejoras (responsive real, GA4, audio, etc.).
