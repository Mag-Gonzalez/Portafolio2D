# Inventario de interacciones — adrienlamy.fr

**Convenciones de confianza**

| Nivel | Significado |
| --- | --- |
| Alta | Ejecutada y medida en navegador real con cambio de DOM/estilo/API observable. |
| Media | Confirmada en bundle y/o por efecto secundario, pero no ejecutada directamente. |
| Baja | Inferida; requiere verificación con dispositivo/capturas. |

**Nota sobre el método** [OBSERVADO]: a 912 px, `.responsive-layer` intercepta el puntero real. Las interacciones `INT-001` a `INT-008` se exploraron con eventos sintéticos sobre los elementos correctos; `INT-009` usó `browser.press`; `INT-010` usó `.click()` sintético dentro de un iframe. Esto se indica en cada fila.

## 1. Tabla principal

| ID | Interacción | Trigger | Precondición | Efecto observado | Evidencia | Confianza | Estado |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `INT-001` | Hover cabeza | `mouseenter` sintético sobre sprite WebGL | Estado `default`, UI cerrada | Cursor `grab`; `document.title` → `Adrien Lamy :o` | `document.body.style.cursor`, `title` | Alta | Verificado |
| `INT-002` | Drag cabeza | `mousedown` + `mousemove` sobre zona ≈ `x 274–547, y 192–479` a 912 px | `INT-001` o estado `surprised` | Cursor `grabbing`; título → `Adrien Lamy x/`. Al soltar: `:o` si sigue hover, `:D` si no | `title`, cursor, eventos `FACE_DRAG_START/END` en bundle | Alta | Verificado |
| `INT-003` | Drag mano → abrir UI | `mousedown` ≈ `(760, 380)` y arrastre hacia ≈ `x 300` | UI cerrada; columnas `opacity: 0` | Umbral `dragTotalRel.x * -1 >= .333`; columnas `opacity: 0 → 1`; panel WebGL negro; `.side-panel__content` interactivo | Estilos computados + bundle `FINGER_DRAG_*`, `UI_SHOW` | Alta | Verificado |
| `INT-004` | Cerrar UI | Clic en signo WebGL aprox. `x 80–200, y 260–440` | UI abierta | Columnas `is-hidden`, `opacity: 0`, `pointer-events: none`; título vuelve a `default` | `UI_HIDE` + clases observadas | Alta | Verificado |
| `INT-005` | Hover CTA | `mouseenter` sintético en `.cta-link` | UI abierta | Flecha `x: 0 → 16 px`, color `#c9c9c9 → #fff`; chars `scaleX: 1 → 0.5 → elastic`, `x: 0 → 16`, stagger ≈ 0.02 s, duración ≈ 0.5 s | Inline transforms de GSAP | Alta | Verificado (sintético) |
| `INT-006` | Copiar email | Clic en `button.cta-copy.contact__link` | UI abierta | `navigator.clipboard.writeText("hey@adrienlamy.fr")`; tooltip “Copied!” animado | API interceptada + transforms de chars | Alta | Verificado |
| `INT-007` | Abrir media desde proyecto | Clic en `button.cta-media` (“Watch”, Claynosaurz) | UI abierta | `body.has-scroll-lock`; `.media-layer.is-visible`; player de `translate(0,100vh) rotate(-30deg) scale(0.5,0.8)` a `translate3d(0,0,0) scale(1.6712,1.6712)`; vídeo `/videos/claynosaurz.webm` autoplay con controles | Clases, estilos, red, `video.currentTime` | Alta | Verificado |
| `INT-008` | Cerrar media | Clic en `.media-layer__close-button` | Media abierta | `is-visible` removido; scroll desbloqueado ≈ 2.3 s después; vídeo pausado y `src=""`; flash blanco `opacity: 1 → 0`; UI reabierta | Clases, `video`, body class, transforms | Alta | Verificado |
| `INT-009` | Konami | Secuencia real de teclado `↑ ↑ ↓ ↓ ← → ← → b a` | Cualquier estado (probado con UI abierta y scroll parcial) | `MEDIA_SHOW({mediaKey:"konami"})`; `SCRIBBLES_HIDE`; título `frank leboeuf :D`; vídeo MP4 Frank Leboeuf; autoplay; scroll lock. Tras cerrar, título sigue `frank` | `browser.press` + `document.title`, red, clases | Alta | Verificado |
| `INT-010` | Switch de tema | Clic en `button.mobile-switch` | Switch presente en DOM (0 × 0 px en escritorio por animación/breakpoint) | Alterna `.is-on`, texto “Switch to Dark/Light mode”, imagen on/off y `.side-panel.is-light`; colores de texto cambiados | DOM + estilos computados en iframe | Alta | Verificado (sintético) |
| `INT-011` | Enlaces de proyectos / contacto | Clic en `a.cta-link` | UI abierta | `href` y `target="_blank"` verificados; **no se navegó** | Atributos DOM | Media | Destinos verificados; navegación no ejecutada |
| `INT-012` | Scroll nativo | Rueda / `window.scrollTo` | Documento de 1824 px a 912 × 766 | `scrollY` 0 → 600 → 1072.8; panel relativo se desplaza 1:1; sin animación scroll-linked observada | `scrollY`, bounding boxes | Alta | Verificado |
| `INT-013` | Hover real sobre enlaces | Puntero real del navegador | 912 px | Bloqueado: `elementFromPoint()` devuelve `.responsive-layer` | `elementFromPoint` | Alta | No verificable aquí |
| `INT-014` | Drag/hover táctil real | Dedo en móvil/tablet | — | Sin emulación táctil disponible | — | Baja | Pendiente |
| `INT-015` | Navegación por teclado / foco | `Tab`, `Enter`, `Space` | — | No se verificó orden de foco ni activación por teclado de controles WebGL | — | Baja | Pendiente |
| `INT-016` | Audio | Reproducción de vídeos | — | No se detectó `AudioContext` ni sonido | Bundle + reproducción | Media | No observado |

## 2. Secuencia Konami verificada

[OBSERVADO] Código exacto extraído del bundle:

```js
[
  "ArrowUp", "ArrowUp",
  "ArrowDown", "ArrowDown",
  "ArrowLeft", "ArrowRight",
  "ArrowLeft", "ArrowRight",
  "b", "a"
]
```

[OBSERVADO] Callback:

```js
Be.trigger(Fe.MEDIA_SHOW, { mediaKey: "konami" });
Be.trigger(Fe.SCRIBBLES_HIDE);
```

[OBSERVADO] Medición antes/después:

| Campo | Antes | Después de la secuencia | Tras 2 s | Tras cerrar |
| --- | --- | --- | --- | --- |
| `document.title` | `frank leboeuf :D` (de prueba previa) | `frank leboeuf :D` | `frank leboeuf :D` | `frank leboeuf :D` |
| `.media-layer` | `media-layer` | `media-layer is-visible` | `media-layer is-visible` | `media-layer` |
| `body.className` | `""` | `has-scroll-lock` | `has-scroll-lock` | `""` |
| `video.src` | `""` | MP4 Frank | MP4 Frank | `""` |
| `video.paused` | `true` | `true` (inicio) | `false`, `currentTime ≈ 8.03` | `true`, `time = 0` |

Nota: el título ya era `frank` por una ejecución anterior en la misma pestaña; en una carga limpia el cambio a `frank` ocurre en el momento de la secuencia [OBSERVADO por el bundle].

## 3. Bus de eventos interno [OBSERVADO en bundle]

| Evento | Productor probable | Consumidor observado / efecto |
| --- | --- | --- |
| `WEBGL_LOAD_START` | Escena WebGL | Arranque de carga |
| `WEBGL_LOAD_PROGRESS` | Carga de texturas | Progreso |
| `WEBGL_LOAD_COMPLETE` | Carga de texturas | Habilita interacción |
| `FIRST_RENDER` | Render loop | Animaciones de entrada en móvil |
| `MOUSE_DOWN`, `MOUSE_UP` | Pointer global | Inicio/fin de gesto |
| `MOUSE_MOVE` | Pointer global | Seguimiento de cabeza/mano |
| `MOUSE_HAS_MOVED` | Pointer global | Diferencia click vs drag |
| `DRAG_START`, `DRAG_MOVE`, `DRAG_END` | Pointer global | Estado genérico de arrastre |
| `FACE_DRAG_START`, `FACE_DRAG_END` | Sprite cabeza | Título `frowning` |
| `FINGER_DRAG_START`, `FINGER_DRAG_END` | Sprite mano | `UI_SHOW` / `UI_HIDE` |
| `UI_SHOW`, `UI_HIDE` | Control UI | Columnas y panel |
| `MEDIA_SHOW`, `MEDIA_HIDE` | CTA Watch / Konami / close | Media layer + scroll lock |
| `SCRIBBLES_HIDE` | Konami | Cambio de título/frank |
| `MOBILE_SWITCH_TOGGLE` | Switch | Paleta DOM/WebGL |

[ESTIMADO] La reconstrucción puede conservar estos nombres como contrato entre DOM y WebGL; ver [`TECHNICAL_ARCHITECTURE.md`](./TECHNICAL_ARCHITECTURE.md).

## 4. Umbrales y zonas [OBSERVADO]

| Elemento | Valor | Condición |
| --- | --- | --- |
| Hit area cabeza | aprox. `x 274–547`, `y 192–479` a 912 × 766 | Hover/drag |
| Origen drag mano | aprox. `(760, 380)` a 912 × 766 | Arrastre hacia la izquierda |
| Umbral apertura UI | `dragTotalRel.x * -1 >= 0.333` | Extraído del bundle |
| Zona cierre WebGL | aprox. `x 80–200`, `y 260–440` a 912 px | Clic tras abrir UI |
| Caja responsive layer | `[0, 0, 375.2, 828.8]` a 390 px | Intercepta todo el viewport |

[ESTIMADO] Estas zonas deben normalizarse respecto al viewport en la reconstrucción; no copiar píxeles absolutos.

## 5. Estado no verificado

- [PENDIENTE] Comportamiento del drag si se suelta fuera del canvas o si el puntero sale de la ventana.
- [PENDIENTE] Si `UI_HIDE` cambia también el título de `frank` a `default` en una sesión limpia.
- [PENDIENTE] Reacción del switch con `prefers-reduced-motion`.
- [PENDIENTE] Si los enlaces externos abren nueva pestaña real (solo se verificó el atributo).
- [PENDIENTE] Si el hover de la mano produce un estado previo distinto al drag.
