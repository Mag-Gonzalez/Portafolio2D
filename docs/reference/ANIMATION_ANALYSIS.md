# Análisis de animaciones — adrienlamy.fr

> Todas las medidas son a 912 × 766 salvo indicación. [OBSERVADO] = medido; [ESTIMADO] = deducido; [PENDIENTE] = no verificable.

## 1. Sistema de animación

[OBSERVADO] Capas:

1. **WebGL**: Three.js r170, `EffectComposer`/passes, render loop con capa de FPS (`maxFps: 144` en bundle).
2. **DOM**: GSAP + plugins `ScrollTrigger`, `Observer`, `Flip`, `SplitText`, `CustomEase` (nombres presentes en el bundle).
3. **Scroll containers**: OverlayScrollbars para el contenido interno del panel.

[OBSERVADO] El bundle declara una línea de tiempo global (`It = new Timeline Lite root`) y múltiples timelines por componente. Los transforms inline observados (`translate: none; rotate: none; scale: none; transform: ...`) son huella de GSAP.

[ESTIMADO] La reconstrucción puede lograr fidelidad con GSAP + `@gsap/react`, o con Web Animations API si se acepta perder algo de elasticidad/stagger. La decisión debe tomarse después de validar el baseline visual.

---

## 2. Carga y primer render

| Evento | Momento | Efecto observado |
| --- | --- | --- |
| `WEBGL_LOAD_START` | Inicio de carga de texturas | Arranque de escena |
| `WEBGL_LOAD_PROGRESS` | Durante carga | Progreso interno |
| `WEBGL_LOAD_COMPLETE` | Texturas listas | Habilita interacción |
| `FIRST_RENDER` | Primer frame | En móvil dispara animación de entrada del switch con `delay: 0.85` [bundle] |

[OBSERVADO] Recursos precargados: ruido azul/perlin, scribbles, mano, headParts, texturas blanco/negro, fuente Comic CAT.

[PENDIENTE]: medir tiempos reales de carga; la red mostró las peticiones pero no se hizo trace de rendimiento.

---

## 3. Cabeza: hover y drag

### 3.1 Hover (`INT-001`)

[OBSERVADO] Zona aprox. `x 274–547`, `y 192–479`.

| Estado | Título | Cursor |
| --- | --- | --- |
| Reposo | `Adrien Lamy :D` | `auto` |
| Hover | `Adrien Lamy :o` | `grab` |

[ESTIMADO] El cambio de expresión es un swap de textura/sprite o de uniforms en el shader de `headParts`, no una animación CSS.

### 3.2 Drag (`INT-002`)

[OBSERVADO] Durante el arrastre: cursor `grabbing`, título `Adrien Lamy x/`. Al soltar:

- Si el puntero sigue dentro de la zona → `Adrien Lamy :o`.
- Si sale → `Adrien Lamy :D`.

[PENDIENTE]: curva exacta de retorno, duración y si hay easing elástico en el sprite. No se pudo aislar del muestreo ASCII.

---

## 4. Mano y apertura de UI (`INT-003`, `INT-004`)

[OBSERVADO] Origen del drag ≈ `(760, 380)`. Umbral extraído del bundle:

```js
dragTotalRel.x * -1 >= 0.333
```

[OBSERVADO] Al superarlo:

- `.content-column--left` / `--right`: `opacity: 0 → 1`.
- `pointer-events: none → auto` en `.side-panel__content`.
- Aparece un panel negro renderizado en WebGL (fondo del panel, no un `div` de fondo).
- Se emite `UI_SHOW`.

[OBSERVADO] El cierre WebGL (zona aprox. `x 80–200`, `y 260–440`) emite `UI_HIDE` y deja columnas en `opacity: 0` + `is-hidden`.

[ESTIMADO] La mano probablemente tiene seguimiento continuo del puntero con rotación/traslación suave; solo se verificó el estado final del drag.

[PENDIENTE]: duración del tween de `UI_SHOW`/`UI_HIDE` y easing exacto.

---

## 5. CTA links (`INT-005`)

[OBSERVADO] Sobre `.cta-link`:

| Propiedad | Reposo | Hover |
| --- | --- | --- |
| Icono `→` | `translate(0px, 0px)` | `translate(16px, 0px)` |
| Color icono/chars | `rgb(201,201,201)` | `rgb(255,255,255)` |
| Chars `SplitText` | `scaleX: 1`, `x: 0` | `scaleX: 0.5 → elástico → 1`, `x: 16` |
| Stagger | — | ≈ `0.02 s` por char |
| Duración | — | ≈ `0.5 s` [ESTIMADO por muestreo] |

[ESTIMADO] El patrón “scaleX comprime + x desplaza + elastic settle” es intencionalmente cartoon; en React puede replicarse con `gsap.fromTo` sobre spans generados por carácter.

---

## 6. Copiar email (`INT-006`)

[OBSERVADO] Tooltip `.cta-copy__tooltip` con 7 chars. Secuencia medida:

| Tiempo | `translateY` chars (C → !) |
| --- | --- |
| Antes | `17px` todos |
| +40 ms | `6.84, 9.68, 12.81, 16.05, 17, 17, 17` |
| +120 ms | `-1.05, -0.31, 0.80, 2.32, 4.29, 6.71, 9.53` |
| +260 ms | `≈ -1.7` todos (overshoot) |
| +520 ms | `≈ 0.06–0.13` (casi settle) |
| +1000 ms | `≈ 0.26–1.36` (rebote pequeño) |
| +1800 ms | `17px` todos (oculto) |

[OBSERVADO] El contenedor `.tooltip` mantiene `opacity: 1`; la visibilidad se controla por el desplazamiento de los chars dentro del clip del button.

[ESTIMADO] Stagger ≈ 60 ms, easing elástico/back-out, duración total ≈ 1.8 s.

---

## 7. Media layer (`INT-007`, `INT-008`)

### 7.1 Entrada

[OBSERVADO] Valores medidos:

| Estado | `.media-player` transform |
| --- | --- |
| Cerrado | `translate(0px, 100vh) rotate(-30deg) scale(0.5, 0.8)` |
| Abierto (≈ 2 s) | `translate3d(0px, 0px, 0px) scale(1.6712, 1.6712)` |

[OBSERVADO] `body.has-scroll-lock` se aplica inmediatamente; `.media-layer` pasa a `is-visible` y `pointer-events: auto`.

[ESTIMADO] La rotación se interpola a `0deg`; la escala final grande simula acercamiento desde un teléfono. El valor `1.6712` puede depender del viewport, por lo que debe parametrizarse.

### 7.2 Salida

[OBSERVADO]:

- `.media-layer.is-visible` se elimina.
- `.video-wrapper__flash` hace `opacity: 0 → 1 → 0`.
- `video.pause()`, `currentTime = 0`, `src = ""`.
- Scroll se desbloquea ≈ **2.3 s** después del clic.
- Vuelve a abrirse la UI (columnas visibles).

[PENDIENTE]: medir cada tramo de la salida con rAF; solo se midió el estado final y el desbloqueo.

---

## 8. Konami (`INT-009`)

[OBSERVADO] Aparte de abrir media con otro vídeo, dispara `SCRIBBLES_HIDE` y cambia el título a `frank leboeuf :D`.

[ESTIMADO] `SCRIBBLES_HIDE` probablemente oculta la capa de garabatos/textura `tex_scribbles_*` y revela una variante del título. No se aisló visualmente por falta de capturas.

[OBSERVADO] El título no volvió a `Adrien Lamy :D` tras cerrar el vídeo en la sesión probada.

---

## 9. Switch de tema (`INT-010`)

[OBSERVADO] Dentro del iframe:

| Estado | Clase switch | Imagen visible | Clase panel | Título About |
| --- | --- | --- | --- | --- |
| Inicial | `is-on` | `tex-ui-switch-fe-on.webp` | `is-light` | `#1c1c1c` |
| Tras clic | sin `is-on` | `tex-ui-switch-fe-off.webp` | sin `is-light` | `#ffffff` |

[OBSERVADO] Bundle: `Be.trigger(Fe.MOBILE_SWITCH_TOGGLE, { isSwitchOn: t.value })` y un timeline GSAP que anima `scale` del botón desde 0.

[OBSERVADO] En escritorio el botón tiene caja `0 × 0` (animación/breakpoint), aunque sigue siendo clicable vía DOM.

[PENDIENTE]: confirmar el cambio de paleta WebGL cuando rAF no esté throttled.

---

## 10. Responsive overlay

[OBSERVADO] No es animado: `display: flex`/`none` según `min-width: 64em`. No se observaron transiciones de entrada/salida.

---

## 11. Tabla resumen para implementación

| Animación | Duración aproximada | Easing estimado | Prioridad |
| --- | --- | --- | --- |
| Hover CTA | 0.5 s | `back/elastic.out` sobre stagger 0.02 s | Alta |
| Tooltip copiar | 1.8 s | `elastic/back.out`, stagger 0.06 s | Media |
| Drag mano → UI | no medido | `power3.out` [ESTIMADO] | Crítica |
| Media entrada | ≈ 2 s | `expo/power3.out` [ESTIMADO] | Alta |
| Media salida | ≈ 2.3 s | `power2.inOut` + flash | Alta |
| Cabeza hover/drag | no medido | swap de estado | Crítica |
| Switch tema | no medido | `scale` con back.out [bundle] | Media |
| Konami | inmediato + media | — | Baja |

[ESTIMADO] La prioridad “crítica” se refiere a la narrativa interactiva, no a dificultad técnica.
