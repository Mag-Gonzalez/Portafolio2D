# Arquitectura técnica — observada y propuesta React/Next.js

## 1. Stack observado en la referencia

| Capa | Tecnología | Evidencia |
| --- | --- | --- |
| Framework | Vue 3 + Vite | `#app[data-v-app]`, atributos `data-v-*`, bundles `index-*.js/css` hashed |
| Render 3D | Three.js **r170** | `canvas[data-engine="three.js r170"]`, clases `EffectComposer`, shaders en bundle |
| Postprocesado | `postprocessing` / passes propias | `passSubComposition`, `subsceneAlpha.renderTarget`, `texAlpha/texBeta` |
| Animación DOM | GSAP 3 | `ScrollTrigger`, `Observer`, `Flip`, `SplitText`, `CustomEase`, `TimelineLite` |
| Scroll interno | OverlayScrollbars | Clases `os-*`, `uI={... scrollbars.theme ...}` en bundle |
| Detección dispositivo | UAParser.js | `this.uaParser`, `isMobile`, `isTablet`, `isDesktop`, `isIOS` |
| Analítica | Google Analytics 4 | `G-C215R1M0J7`, `gtag/js`, `/g/collect` |
| Fuente | Comic CAT | `/fonts/Comic_CAT.woff2` |
| Audio | No detectado | Sin `AudioContext` en bundle [NO OBSERVADO] |

[OBSERVADO] El bundle es un único JS de **≈ 842 KB** minificado (842,444 caracteres medidos por fetch). El CSS es ≈ 33 KB.

[OBSERVADO] No hay rutas más allá de `/` en el router:

```js
{ history: createWebHistory("/"), routes: [{ path: "/", name: "home", component: ViewHome }] }
```

## 2. Arquitectura observada por capas

```text
document
├── canvas.webgl-container__canvas        z 0   fixed   (Three.js)
├── .content.is-desktop                   z 100
│   └── .side-panel.is-desktop(.is-light?)
│       ├── .content-column--left
│       │   ├── .about
│       │   └── .contact  (links + copy)
│       └── .content-column--right
│           └── .projects  (+ .cta-media)
├── .media-layer(.is-visible)             z 300 fixed   (video/phone)
└── .responsive-layer                     z 300 fixed   (< 64em)
```

[OBSERVADO] El panel negro que aparece al arrastrar la mano se renderiza en WebGL; el DOM solo aporta texto/enlaces. Esto explica que las columnas cambien de opacidad pero el fondo no tenga un `div` negro.

[OBSERVADO] Event bus interno (`Be.on/trigger`) desacopla escena y DOM. Los eventos están listados en [`INTERACTION_INVENTORY.md`](./INTERACTION_INVENTORY.md).

## 3. Mapa de estado observado

| Estado | Activador | Indicadores |
| --- | --- | --- |
| `loading` | inicio | `WEBGL_LOAD_*`, texturas |
| `idle` | primer render | título `Adrien Lamy :D`, columnas ocultas |
| `face-hover` | hover cabeza | `:o`, cursor `grab` |
| `face-drag` | drag cabeza | `x/`, cursor `grabbing` |
| `ui-visible` | drag mano | columnas `opacity: 1`, `UI_SHOW` |
| `ui-hidden` | close sign | `UI_HIDE`, `is-hidden` |
| `media-claynosaurz` | CTA Watch | `MEDIA_SHOW`, `/videos/claynosaurz.webm` |
| `media-konami` | Konami | `SCRIBBLES_HIDE`, `frank leboeuf :D`, MP4 |
| `theme-light` / `theme-dark` | switch | `.is-light`, `.is-on`, colores |

[ESTIMADO] No todos estos estados son excluyentes: `ui-visible` puede coexistir con `media-*` y con cualquiera de los temas.

## 4. Propuesta de arquitectura React/Next.js

> Esta sección es **propuesta**, no observación. Debe implementarse solo tras aprobación.

### 4.1 Estructura de archivos sugerida

```text
app/
  layout.tsx                 # metadata, fuente local, estados globales
  page.tsx                   # única ruta "/"
  globals.css                # tokens, capas z, resets, sr-only
components/
  experience/
    ExperienceCanvas.tsx     # client, dynamic import, canvas fixed
    SceneProvider.tsx        # init Three, composer, resize, rAF
    HeadHitArea.tsx          # normalización de hover/drag
    HandHitArea.tsx          # drag -> UI_SHOW
    CloseSignHitArea.tsx     # click -> UI_HIDE
  ui/
    SidePanel.tsx
    About.tsx
    Contact.tsx
    CopyEmailButton.tsx
    ProjectList.tsx
    MediaCta.tsx
    MobileSwitch.tsx
    ResponsiveLayer.tsx
  media/
    MediaLayer.tsx
    VideoPlayer.tsx
lib/
  events.ts                  # tipado del bus (mismos nombres observados)
  experience-store.ts        # Zustand/useSyncExternalStore
  viewport.ts                # normalización de hit areas
  konami.ts                  # detector de secuencia
  animations/
    cta.ts
    tooltip.ts
    media.ts
public/
  fonts/Comic_CAT.woff2
  images/...
  videos/...
  webgl/textures/...
```

### 4.2 Decisiones técnicas propuestas

| Decisión | Recomendación | Razón |
| --- | --- | --- |
| Framework | Next.js App Router | Una sola ruta; `layout` para metadata/fuente. |
| Canvas | `dynamic(() => import(...), { ssr: false })` | WebGL no debe ejecutarse en servidor. |
| Estado | Zustand o `useSyncExternalStore` sobre un store plano | Evita prop-drilling entre DOM y escena. |
| Comunicación | Bus de eventos tipado con los nombres observados | Permite sustituir Three por canvas 2D en tests. |
| Animación | GSAP + `@gsap/react` para fidelidad; alternativa WAAPI | El reference usa GSAP; SplitText/CustomEase son parte del look. |
| Estilos | CSS Modules o Tailwind + CSS vars para tokens | El stack observado es CSS hashed; los tokens son simples. |
| Fuente | `next/font/local` con `Comic_CAT.woff2` | Evita FOIT y mantiene el nombre familia. |
| Vídeo | Carga diferida; `preload="none"`; `src` solo al abrir | Coincide con lo observado y reduce peso inicial. |
| Analítica | Optional, detrás de consentimiento | GA4 presente en referencia; no es esencial para la réplica. |

### 4.3 Contrato de eventos propuesto

```ts
export type ExperienceEvent =
  | { type: "WEBGL_LOAD_START" }
  | { type: "WEBGL_LOAD_PROGRESS"; progress: number }
  | { type: "WEBGL_LOAD_COMPLETE" }
  | { type: "FIRST_RENDER" }
  | { type: "MOUSE_DOWN" | "MOUSE_UP" | "MOUSE_MOVE" | "MOUSE_HAS_MOVED" }
  | { type: "DRAG_START" | "DRAG_MOVE" | "DRAG_END" }
  | { type: "FACE_DRAG_START" | "FACE_DRAG_END" }
  | { type: "FINGER_DRAG_START" | "FINGER_DRAG_END" }
  | { type: "UI_SHOW" | "UI_HIDE" }
  | { type: "MEDIA_SHOW"; mediaKey: "claynosaurz" | "konami" }
  | { type: "MEDIA_HIDE" }
  | { type: "SCRIBBLES_HIDE" }
  | { type: "MOBILE_SWITCH_TOGGLE"; isSwitchOn: boolean };
```

[ESTIMADO] Conservar los nombres facilita comparar con el bundle y con los criterios de validación.

### 4.4 Store mínimo propuesto

```ts
type ExperienceState = {
  loadPhase: "idle" | "loading" | "ready";
  face: "default" | "surprised" | "frowning" | "frank";
  ui: "hidden" | "visible";
  media: null | "claynosaurz" | "konami";
  theme: "light" | "dark";
  scrollLocked: boolean;
};
```

[ESTIMADO] `face` y `media` deben ser derivables del título para poder verificar con `document.title` como en la auditoría.

### 4.5 Accesibilidad y degradación [ESTIMADO — mejora, no observada]

- `prefers-reduced-motion`: desactivar elastic/stagger y mostrar UI sin drag.
- Foco visible en todos los `button`/`a`.
- Alternativa teclada para `UI_SHOW` (botón `sr-only` con `aria-label="Abrir contenido"`).
- `aria-live="polite"` para “Copied!” (el reference usa `sr-only`, sin verificar live region).
- `aria-hidden` en canvas decorativo si el contenido equivalente existe en DOM.
- Fallback 2D si WebGL no está disponible: fondo rojo + sprites estáticos + botones reales.

## 5. Riesgos técnicos

| Riesgo | Mitigación propuesta |
| --- | --- |
| Hit areas dependientes del viewport | Guardar zonas normalizadas y convertir en `pointer` event; test en 3 aspect ratios. |
| Scroll lock pegado tras cerrar media | `useEffect` cleanup + timeout centralizado; assert en tests. |
| Konami activo mientras se escribe en un input | Ignorar si `event.target` es editable (el reference no lo hace; sería divergencia). |
| GSAP + React strict mode duplicando timelines | `gsap.context()` y cleanup en cada componente. |
| Tema invertido | Modelar `theme` por estado real, no por texto del botón. |
| Peso WebGL | Dynamic import, DPR cap, pausa de rAF con `document.hidden`. |

## 6. No aplicable / pendiente

- [PENDIENTE] No se verificó si la referencia usa SSR (es Vite puro, por lo que no).
- [PENDIENTE] No se conoce el sistema de build interno de sprites ni los shaders exactos.
- [PENDIENTE] No se midió rendimiento/FPS real.
- [NO OBSERVADO] No hay API, base de datos ni persistencia.
