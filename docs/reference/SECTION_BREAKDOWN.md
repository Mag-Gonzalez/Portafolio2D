# Desglose por secciones — adrienlamy.fr

Orden de aparición lógica, no necesariamente orden visual inicial (muchas secciones están ocultas hasta `UI_SHOW`).

> Convenciones: `[OBSERVADO]`, `[ESTIMADO]`, `[PENDIENTE]`, `[NO OBSERVADO]` según [`REFERENCE_AUDIT.md`](./REFERENCE_AUDIT.md).

## 0. Capa base / portada WebGL

| Campo | Valor |
| --- | --- |
| Selector | `div.webgl-container > canvas.webgl-container__canvas` |
| z-index | `0`, `position: fixed` |
| Tamaño observado | CSS `912 × 766`; backing store `1140 × 957` (DPR ≈ 1.25) |
| Motor | `data-engine="three.js r170"` |
| Composición ASCII observada | Cabeza/sprite a la izquierda, mano a la derecha, fondo rojo |
| Título inicial | `Adrien Lamy :D` |
| Títulos posibles | `Adrien Lamy :D`, `Adrien Lamy :o`, `Adrien Lamy x/`, `frank leboeuf :D` [OBSERVADO en bundle `ar` + título real] |

**Etiquetas semánticas ocultas** [OBSERVADO]:

```html
<h1 class="sr-only">Who am I? Adrien Lamy</h1>
<h2 class="sr-only">Somewhat Creative Developer</h2>
```

**Estados**

- [OBSERVADO] `default` → `surprised` en hover de cabeza (`INT-001`).
- [OBSERVADO] `surprised` → `frowning` en drag de cabeza (`INT-002`).
- [OBSERVADO] `frank` tras Konami + `SCRIBBLES_HIDE` (`INT-009`). Tras cerrar el vídeo, el título **permanece** `frank leboeuf :D` en la sesión observada.

**Pendiente** [PENDIENTE]: confirmar si `frank` se restablece al recargar o si algún otro evento lo revierte.

---

## 1. Panel lateral / `side-panel`

| Campo | 912 × 766 | 1440 × 900 [iframe] |
| --- | --- | --- |
| Selector | `.side-panel.is-desktop` | `.side-panel.is-desktop` |
| Posición | `relative` | `fixed` |
| Caja a `scrollY = 0` | `[91, 728, 729.6, 1005]` | `[310, 0, 1116, 900]` |
| Ancho | `80vw` aprox. (`729.6 px`) | `1116 px` |
| Variable CSS observada | `--c255c6c6: 77.5vw` | — |
| Clases de tema | `side-panel is-light is-desktop` / `side-panel is-desktop` | ídem |

[OBSERVADO] Antes de `UI_SHOW`, las columnas internas tienen `opacity: 0` y `pointer-events: none`. Después del drag de la mano, `opacity: 1` y el contenido pasa a ser interactivo.

[OBSERVADO] A 912 px el panel está en flujo normal: `scrollY = 0 → y = 728`, `scrollY = 600 → y = 128`, `scrollY = máx (1072.8) → y ≈ -345`. No se observó animación ligada al scroll; el movimiento es 1:1 con el scroll nativo.

[OBSERVADO] `.side-panel__content` contiene dos columnas:

- `.content-column--left`: About + contacto.
- `.content-column--right`: proyectos + CTA de media.

**Pendiente** [PENDIENTE]: verificar si a 1440 px el drag de mano sigue siendo necesario o si el panel ya aparece por breakpoint (en el iframe estático las columnas seguían con `opacity: 0`).

---

## 2. About

| Campo | Valor |
| --- | --- |
| Selector | `.about`, `.about__title.title`, `.about__description.text.text--grey` |
| Ubicación | Columna izquierda |
| Fuente | `"Comic CAT", sans-serif` [OBSERVADO] |

**Título exacto** [OBSERVADO]:

> Sup, I'm Adrien Lamy,
> Creative Dev Mercenary
> Based in Paris (the french one)

**Párrafos exactos** [OBSERVADO]:

1. “I usually roam the internet designing, concepting and building lively and immersive experiences.”
2. “Passionate about animation and storytelling, I work with clients and agencies to bring ideas to digital life in the most creative ways possible.”
3. “I also make latte art in my free time.”

**Colores** [OBSERVADO]:

| Estado del panel | Título | Descripción |
| --- | --- | --- |
| `is-light` | `#1c1c1c` | `#343434` |
| sin `is-light` | `#ffffff` | `#c9c9c9` |

---

## 3. Contacto

| Campo | Valor |
| --- | --- |
| Selector | `.about__contact.contact` |
| Ubicación | Columna izquierda, debajo de About |
| Elementos | 1 enlace LinkedIn, 1 enlace Portfolio, 1 botón copiar email |

### Enlaces [OBSERVADO]

| Etiqueta | `href` | Target |
| --- | --- | --- |
| Linkedin | `https://www.linkedin.com/in/adrien-lamy` | `_blank`, `rel="noopener noreferrer"` |
| Portfolio | `https://adrienlamy.fr` | `_blank`, `rel="noopener noreferrer"` |

### Copiar email [OBSERVADO]

- Selector: `button.cta-copy.contact__link`.
- Texto visible: `hey@adrienlamy.fr`.
- `sr-only`: `hey@adrienlamy.fr` y `Copied!`.
- Al hacer clic se llamó a `navigator.clipboard.writeText("hey@adrienlamy.fr")` (interceptado en la prueba).
- Tooltip: `.cta-copy__tooltip.tooltip > .tooltip__label`, 7 chars `C o p i e d !`.
- Animación: chars desde `translateY(17px)` → overshoot ≈ `-1.7px` → casi `0` → vuelta a `17px` en ≈ 1.8 s, con stagger ≈ 60 ms entre chars.

[NO OBSERVADO]: fallback `document.execCommand('copy')` (no se llamó; la API moderna funcionó).

---

## 4. Proyectos

| Campo | Valor |
| --- | --- |
| Selector | `.projects`, `.projects__list`, `.project`, `.project__title.text`, `.project__description.text.text--grey`, `.project__link` |
| Ubicación | Columna derecha |
| 390 / 768 px | `.projects__list` es `display: flex; flex-direction: column; gap: 14px` |
| 1440 px | `.projects__list` es `display: grid; grid-template-columns: 282px 282px; gap: 16px 32px` |
| Título de sección | Visible bajo `90em`, `display: none` a 1440 px [OBSERVADO] |

### Listado y destinos [OBSERVADO]

| # | Proyecto | Descripción | CTA | `href` |
| --- | --- | --- | --- | --- |
| 1 | INHERITED - ME, MYSELF & SAM | — | Visit | `https://mms.inherited.band/` |
| 2 | Melius | — | Visit | `https://www.melius.com/` |
| 3 | Blast Explore | — | Visit | `https://explore.blast.co.uk/` |
| 4 | Claynosaurz Booster Packs | WebGL - with Claynosaurz | Watch (media) | `button.cta-media` |
| 5 | Myli.io | — | Visit | `https://www.myli.io/` |
| 6 | The Maison of All Victories | — | Case | `https://cosmicshelter.com/work/lvmh-the-maison-of-all-victories` |
| 7 | Virgin Galactic | — | Case | `https://dogstudio.co/cases/virgin-galactic/` |
| 8 | Sprite X Marvel | — | Case | `https://dogstudio.co/cases/sprite-x-marvel/` |
| 9 | Dept Pioneer | — | Case | `https://dogstudio.co/cases/dept-pioneer/` |
| 10 | Copie Double | — | Visit | `https://crabelab.adrienlamy.fr/en/copie-double` |

[OBSERVADO] Los enlaces externos tienen `target="_blank"` y `rel="noopener noreferrer"`. **No se navegó a ellos** durante la auditoría.

[ESTIMADO] “Watch” en Claynosaurz es un `button` porque abre media layer local, no un enlace externo.

---

## 5. Media layer

| Campo | Valor |
| --- | --- |
| Selector | `.media-layer`, `.media-layer__player.media-player`, `.media-player__video.video-wrapper`, `video.video-wrapper__video` |
| z-index | `300`, `position: fixed` |
| Estado cerrado | Clase `media-layer`, `pointer-events: none`, reproductor en `translate(0px, 100vh) rotate(-30deg) scale(0.5, 0.8)` |
| Estado abierto | Clase `media-layer is-visible`, `pointer-events: auto`, `body.has-scroll-lock`, reproductor en `translate3d(0px, 0px, 0px) scale(1.6712, 1.6712)` |
| Controles | `controls`, `autoplay`, `playsinline` [OBSERVADO] |
| Vídeos | `/videos/claynosaurz.webm` (112 s) y `/videos/salut-cest-frank-leboeuf-vous-voulez-savoir-combien-vaut-votre-voiture.mp4` (Konami) |
| Cierre | `.media-layer__close-button.close-button` con `img.close-button__icon` (`/images/media/tex-phone-close.webp`) |
| Flash | `.video-wrapper__flash`, opacidad `0 → 1 → 0` durante cierre [OBSERVADO] |

[OBSERVADO] Imágenes de maqueta alrededor del player:

- `/images/media/tex-phone-portrait-back.webp`
- `/images/media/tex-phone-portrait-front.webp`
- `/images/media/tex-phone-landscape-back.webp`
- `/images/media/tex-phone-landscape-front.webp`

[OBSERVADO] El vídeo se carga/pone `src` al abrir y se vacía al cerrar. El cierre tarda ≈ 2.3 s en desbloquear scroll.

[PENDIENTE]: el botón de cierre mostró `transform: translate(0px, 25vh) scale(0, 0)` incluso con media abierta en la medición final; no se verificó visualmente su aparición en escritorio (puede estar reservado a móvil/WebGL).

---

## 6. Capa responsive / aviso

| Campo | Valor |
| --- | --- |
| Selector | `.responsive-layer`, `.responsive-layer__message.title.title--white` |
| Visible | `min-width < 64em` [OBSERVADO a 390 y 768 px] |
| Oculto | `display: none` a 1440 px (`= 90em`) [OBSERVADO] |
| Estilos | `position: fixed`, `z-index: 300`, `background: #1c1c1c`, `pointer-events: auto`, centrado |
| Caja a 390 px | `[0, 0, 375.2, 828.8]` |
| Elemento under pointer | `.responsive-layer__message` [OBSERVADO] |

**Texto exacto** [OBSERVADO]:

> Please don't break my website.
> Responsive has been a nightmare, I promise I'll fix it soon.
> (soon === it's been one year)

[OBSERVADO] A 912 px esta capa intercepta hover/click reales; por eso se usaron eventos sintéticos para explorar el contenido subyacente.

---

## 7. Switch de tema / `mobile-switch`

| Campo | Valor |
| --- | --- |
| Selector | `button.mobile-switch`, `.mobile-switch__image--on/--off` |
| Estado inicial observado | `.mobile-switch.is-on`, texto `Switch to Dark mode`, imagen `tex-ui-switch-fe-on.webp`, `.side-panel.is-light` |
| Tras clic | sin `is-on`, texto `Switch to Light mode`, imagen `tex-ui-switch-fe-off.webp`, `.side-panel` sin `is-light` |
| Imágenes | `/images/ctas/tex-ui-switch-fe-on.webp`, `/images/ctas/tex-ui-switch-fe-off.webp` |

[OBSERVADO] El toggle cambia colores:

| Estado | `.about__title` | `.about__description` | `.project__title` |
| --- | --- | --- | --- |
| `is-on` + `is-light` | `#1c1c1c` | `#343434` | `#1c1c1c` |
| sin `is-on` / sin `is-light` | `#ffffff` | `#c9c9c9` | `#ffffff` |

[OBSERVADO] Emite `MOBILE_SWITCH_TOGGLE` con `{ isSwitchOn: boolean }` (confirmado en bundle).

[PENDIENTE]: el cambio visual WebGL de paleta no se pudo confirmar dentro del iframe por rAF throttled.

---

## 8. Easter egg Konami

[OBSERVADO] Secuencia exacta detectada en bundle y ejecutada con `browser.press`:

`ArrowUp, ArrowUp, ArrowDown, ArrowDown, ArrowLeft, ArrowRight, ArrowLeft, ArrowRight, b, a`

Efectos [OBSERVADO]:

1. `MEDIA_SHOW` con `mediaKey: "konami"`.
2. `SCRIBBLES_HIDE`.
3. `document.title` → `frank leboeuf :D`.
4. `body.has-scroll-lock`.
5. Vídeo MP4 Frank Leboeuf, autoplay, controles.
6. Cierre: se desbloquea scroll, se vacía `src`, el título permanece `frank leboeuf :D`.

[ESTIMADO] Es una sección “oculta” más que un layout: comparte el media layer con el CTA de Claynosaurz.

---

## 9. Lo que NO se observó

- [NO OBSERVADO] Footer.
- [NO OBSERVADO] Navegación entre rutas: solo existe `/` en el router del bundle.
- [NO OBSERVADO] Audio o `AudioContext`.
- [NO OBSERVADO] Formularios, login, carrito o estado persistente en `localStorage`.
- [NO OBSERVADO] Imágenes de proyecto individuales cargadas desde la red (los proyectos son texto + enlaces).
