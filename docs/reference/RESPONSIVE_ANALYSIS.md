# Análisis responsive — adrienlamy.fr

> Medido con iframes a 390 × 844, 768 × 1024 y 1440 × 900, más pestaña principal a 912 × 766.
> [OBSERVADO] = medido; [ESTIMADO] = deducido; [PENDIENTE] = no verificable.

## 1. Breakpoints CSS [OBSERVADO en `index-DNSZeNd5.css`]

| Breakpoint | px (base 16px) | Uso observado |
| --- | --- | --- |
| `min-width: 48em` | 768 | Ajustes tipográficos/layout menores |
| `min-width: 64em` | 1024 | Activa modo desktop: oculta `.responsive-layer`, cambia `.side-panel` |
| `min-width: 90em` | 1440 | Grilla de proyectos 2 columnas; oculta título de proyectos |
| `min-width: 120em` | 1920 | Ajustes de escala grandes |
| `min-width: 131.25em` | 2100 | Ajustes extremos |

También hay reglas compuestas [OBSERVADO]:

- `@media (min-width: 64em) and (max-height: 750px)`
- `@media (min-width: 64em) and (max-height: 750px) and (max-width: 1400px)`
- `@media (min-width: 90em) and (min-height: 1200px)`

[ESTIMADO] Estas reglas adaptan la altura del panel cuando el viewport es ancho pero bajo (laptops). No se midieron individualmente.

## 2. Clasificación JS de dispositivo [OBSERVADO en bundle]

El bundle usa un parser de UA:

```js
this.os = this.uaParser.getOS();
this.isMobile = this.device.type === "mobile";
this.isTablet = this.device.type === "tablet" || macTouch;
this.isDesktop = !this.isMobile && !this.isTablet;
```

[OBSERVADO] `window.isDesktop` se expone desde el manager WebGL. En los iframes, aunque el ancho sea 390 px, el UA sigue siendo escritorio: `.content.is-desktop` y `.side-panel.is-desktop` permanecen presentes.

[ESTIMADO] Por tanto hay **dos sistemas paralelos**:

1. CSS por ancho (`64em`, `90em`, …) controla la visibilidad de capas y grillas.
2. JS por UA controla qué escena WebGL y qué helper DOM se activan.

[ESTIMADO] En un dispositivo móvil real, la rama no-desktop probablemente cambia la escena y el switch; no se pudo verificar.

## 3. Matriz de layout medida

| Medida | 390 × 844 | 768 × 1024 | 912 × 766 | 1440 × 900 |
| --- | --- | --- | --- | --- |
| `innerWidth` | 390 | 768 | 912 | 1440 |
| `scrollWidth` documento | 390 | 768 | 912 | 1440 |
| `scrollHeight` documento | 1905 | 2089 | 1824 | 900 |
| `.content` class | `is-desktop` | `is-desktop` | `is-desktop` | `is-desktop` |
| `.responsive-layer` | visible, `pointer-events: auto` | visible, `pointer-events: auto` | visible [OBSERVADO por `elementFromPoint`] | `display: none` |
| `.side-panel` position | `relative` | `relative` | `relative` | `fixed` |
| `.side-panel` box | `[8, 802, 375, 1095]` | `[77, 973, 614, 1039]` | `[91, 728, 729.6, 1005]` | `[310, 0, 1116, 900]` |
| `.projects__list` | flex column, `gap: 14px` | flex column [ESTIMADO/medido parcial] | flex/block [OBSERVADO parcial] | grid `282px 282px`, `gap: 16px 32px` |
| `.projects__title` | visible | visible | visible | `display: none` |
| Columnas `opacity` | `0` | `0` | `1` tras drag en pestaña real | `0` en iframe estático |
| Switch box | `[188, 704, 0, 0]` | `[376, 822, 0, 0]` | `[448, 636, 0, 0]` | `[0, 0, 0, 0]` |
| Fuente | Comic CAT | Comic CAT | Comic CAT | Comic CAT |

[OBSERVADO] El switch tiene caja 0 × 0 en todos los casos medidos; aun así responde a `.click()` y cambia estado. Su visibilidad depende de GSAP/FIRST_RENDER, no solo de CSS.

## 4. Capa bloqueante responsive [OBSERVADO]

A 390 px:

```text
.responsive-layer
  position: fixed
  z-index: 300
  background: rgb(28, 28, 28)
  pointer-events: auto
  box: [0, 0, 375.2, 828.8]
  display: flex / align-items: center / justify-content: center
```

Mensaje:

> Please don't break my website.
> Responsive has been a nightmare, I promise I'll fix it soon.
> (soon === it's been one year)

[OBSERVADO] `document.elementFromPoint(center)` devuelve `.responsive-layer__message`, por lo que cualquier hover/click real a 390/768/912 px se queda en la capa.

[ESTIMADO] Es una decisión de diseño: la referencia “confiesa” que el responsive fue difícil y bloquea la interacción por debajo de 1024 px en vez de ofrecer una versión móvil completa.

## 5. Columnas y proyectos

[OBSERVADO] 390 px:

- `.content-column--left`: `[40, 856, 311, 401]`, `opacity: 0`.
- `.content-column--right`: `[40, 1299, 311, 544]`, `opacity: 0`.
- `.projects__list`: `display: flex; flex-direction: column; gap: 14px`.

[OBSERVADO] 1440 px:

- `.content-column--left`: `[379, 495, 350, 311]`, `opacity: 0` en iframe.
- `.content-column--right`: `[761, 495, 596, 321]`, `opacity: 0` en iframe.
- `.projects__list`: `display: grid; grid-template-columns: 282px 282px; gap: 16px 32px`.

[ESTIMADO] El diseño de escritorio es una columna de texto a la izquierda y una grilla de proyectos a la derecha, dentro de un panel fijo que ocupa ≈ 77.5vw.

## 6. Scroll

[OBSERVADO] A 912 px:

| `scrollY` | `.side-panel` y |
| --- | --- |
| 0 | 728 |
| 600 | 128 |
| 1072.8 (máx.) | -345 |

[OBSERVADO] A 1440 px el documento mide exactamente el viewport (`scrollHeight = 900`) y el panel es `fixed`, por lo que no hay scroll de página.

[ESTIMADO] La experiencia “real” a 1440 px no depende del scroll; el drag de la mano debe desplazar/activar el panel dentro de la viewport.

[PENDIENTE]: verificar a 1440 px con rAF activo si el drag de mano mueve el panel o solo cambia opacidad.

## 7. Limitaciones del método responsive

- [OBSERVADO] Los iframes tienen `requestAnimationFrame` throttled: GSAP/WebGL no animan de forma fiable allí. Solo se validó layout estático y cambios de clase por `.click()`.
- [PENDIENTE] No hay emulación táctil real; no se verificó `touchstart/touchmove`, `touch-action` ni inercia.
- [PENDIENTE] `window.resizeTo(1440,900)` no cambió `innerWidth`; no se pudo probar el mismo tab en varios anchos con rAF activo.
- [PENDIENTE] No se capturaron screenshots; las posiciones se basan en bounding boxes y muestreo ASCII del canvas.

## 8. Recomendación para la reconstrucción [ESTIMADO]

1. **Separar dos modos explícitos**: `desktop experience` (≥1024 px y UA no móvil) y `responsive notice` (<1024 px). No mezclar UA con ancho en la misma condición sin documentarlo.
2. **Clonar primero, corregir después**: replicar el overlay bloqueante para alcanzar paridad; proponer como mejora una versión móvil real solo si el usuario lo aprueba.
3. **Usar `svh`/`dvh`** para el media layer y el overlay, evitando `100vh` dependiente de barras del navegador.
4. **Parametrizar hit areas** WebGL en coordenadas normalizadas `[0..1]` para que el drag funcione en cualquier aspect ratio.
5. **Proveer fallback teclado** (`Enter` sobre un botón invisible “Abrir contenido”) sin inventar que exista en la referencia; documentar como mejora.

## 9. Riesgo principal

[ESTIMADO] El mayor riesgo no es la grilla, sino **reproducir accidentalmente una experiencia móvil que la referencia no tiene**. Cualquier “mejora responsive” debe ser una decisión explícita y registrada como divergencia.
