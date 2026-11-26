"use client";

import {
  useEffect,
  useRef,
  useState,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import gsap from "gsap";
import {
  HAND_FINGER_DARK,
  HAND_FINGER_MAX_SCALE,
  HAND_FINGER_ORIGIN,
  HAND_FINGER_WHITE,
  HAND_FIST_DARK,
  HAND_FIST_WHITE,
  HAND_VIEW_BOX,
} from "@/lib/handAssets";
import { experienceBus, type PanelSide } from "@/lib/eventBus";
import { usePortfolioStore } from "@/store/portfolioStore";

type DragState = {
  extent: number;
  fromOpen: boolean;
  moved: boolean;
  // Progreso actual y base desde la que se mide el arrastre manual. La
  // apertura automática mientras se mantiene presionado actualiza ambos.
  progress: number;
  baseProgress: number;
  pointerAtBase: number;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const PANEL_LABELS: Record<PanelSide, string> = {
  left: "Sobre mí",
  top: "Mis proyectos",
  right: "Trabajemos juntos",
};

const HAND_DOODLE_COPY: Record<
  PanelSide,
  { action: string; detail: string }
> = {
  right: { action: "¡Jala el dedo!", detail: "para sacar contacto" },
  left: { action: "¡Jala el dedo!", detail: "para sacar mi info" },
  top: { action: "¡Jala el dedo!", detail: "para ver proyectos" },
};

function HandDoodle({ side }: { side: PanelSide }) {
  const copy = HAND_DOODLE_COPY[side];

  if (side === "top") {
    return (
      <div className="hand-doodle hand-doodle--top" aria-hidden="true">
        <svg
          className="hand-doodle__figure"
          viewBox="0 0 58 62"
          fill="none"
          aria-hidden="true"
        >
          {/* Signo de pregunta y flecha hacia abajo */}
          <path
            d="M11 10C11 6 17 5 18 9C19 12 14 13 14 16"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <circle cx="14" cy="20.5" r="1.4" fill="currentColor" />
          {/* Cabeza estilo muñeco scribble */}
          <path
            d="M28 19C35 18.5 40 23.5 39.5 30C39 36.5 34 40 28 39.5C22 39 18 34.5 18.5 28.5C19 22.5 23 19.5 28 19Z"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Ojos y boquita */}
          <circle cx="25.5" cy="27" r="1.5" fill="currentColor" />
          <circle cx="32.5" cy="27.5" r="1.5" fill="currentColor" />
          <path
            d="M26.5 33C28 34.5 30.5 34.5 31.8 33"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Cuerpo y brazo jalando hacia abajo */}
          <path
            d="M28.5 39.5C28 44 28.5 48 28.5 52"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          <path
            d="M28 43C23 41 20 35 18 28"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M29 43C34 46 37 50 40 54"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Piernas */}
          <path
            d="M28.5 52L23 59M28.5 52L34 59"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Flecha de jalar hacia abajo */}
          <path
            d="M48 16C49 27 49 38 48.5 49M43.5 43.5L48.5 50.5L53.5 43.5"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="hand-doodle__text">
          <span className="hand-doodle__action">{copy.action}</span>
          <span className="hand-doodle__detail">{copy.detail}</span>
        </div>
      </div>
    );
  }

  if (side === "left") {
    return (
      <div className="hand-doodle hand-doodle--left" aria-hidden="true">
        <svg
          className="hand-doodle__figure"
          viewBox="0 0 66 68"
          fill="none"
          aria-hidden="true"
        >
          {/* Pose inclinada jalando con fuerza hacia la derecha */}
          <path
            d="M28 21C35 20.5 40 25.5 39.5 32C39 38.5 34 42 27.5 41.5C21 41 17 36.5 17.5 30.5C18 24.5 22 21.5 28 21Z"
            stroke="currentColor"
            strokeWidth="2.6"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <circle cx="31.5" cy="29.5" r="1.5" fill="currentColor" />
          <circle cx="24.5" cy="30" r="1.5" fill="currentColor" />
          {/* Sonrisa traviesa */}
          <path
            d="M25 35.5C27 38 30.5 38 32.5 35"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
          />
          {/* Cuerpo inclinado jalando */}
          <path
            d="M28 41.5C29.5 46 31 50 32.5 54"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Brazos extendidos hacia el dedo (izquierda) */}
          <path
            d="M28.5 45C21 45 14 43 8 39"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          <path
            d="M29.5 47C22 49 15 48 9 44"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
          />
          {/* Piernas apoyadas para jalar */}
          <path
            d="M32.5 54L25 63M32.5 54L41 62"
            stroke="currentColor"
            strokeWidth="2.5"
            strokeLinecap="round"
          />
          {/* Flecha indicando jalar hacia la derecha (en SVG pre-flip apunta a la izquierda) */}
          <path
            d="M44 13C35 12 26 12 18 14M23 9.5L16.5 14.5L22.5 19"
            stroke="currentColor"
            strokeWidth="2.4"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </svg>
        <div className="hand-doodle__text">
          <span className="hand-doodle__action">{copy.action}</span>
          <span className="hand-doodle__detail">{copy.detail}</span>
        </div>
      </div>
    );
  }

  return (
    <div className={`hand-doodle hand-doodle--${side}`} aria-hidden="true">
      <svg
        className="hand-doodle__figure"
        viewBox="0 0 64 68"
        fill="none"
        aria-hidden="true"
      >
        {/* Signo de pregunta estilo referencia */}
        <path
          d="M22 8C22 4 29 3.5 29.5 7.5C30 10.5 25.5 11.5 25.5 14.5"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <circle cx="25.5" cy="18.5" r="1.4" fill="currentColor" />
        {/* Cabeza redonda del muñeco */}
        <path
          d="M32 23C39 22.5 44 27.5 43.5 34C43 40.5 38 44 31.5 43.5C25 43 21 38.5 21.5 32.5C22 26.5 26 23.5 32 23Z"
          stroke="currentColor"
          strokeWidth="2.6"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        {/* Ojos y boca sorprendida/esfuerzo */}
        <circle cx="35.5" cy="31" r="1.5" fill="currentColor" />
        <circle cx="28.5" cy="31.5" r="1.5" fill="currentColor" />
        <ellipse
          cx="32"
          cy="37"
          rx="2.3"
          ry="2.6"
          stroke="currentColor"
          strokeWidth="2"
        />
        {/* Cuerpo */}
        <path
          d="M32 43.5C31.5 48 31 52 31.5 55.5"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Brazo estirado jalando el dedo hacia el centro */}
        <path
          d="M31.5 47C23 45 16 42 10 38"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        <path
          d="M32 47.5C38 45 43 41 47 36"
          stroke="currentColor"
          strokeWidth="2.4"
          strokeLinecap="round"
        />
        {/* Piernas en pose de jalar */}
        <path
          d="M31.5 55.5L24.5 63.5M31.5 55.5L39 63"
          stroke="currentColor"
          strokeWidth="2.5"
          strokeLinecap="round"
        />
        {/* Flechita que indica hacia dónde jalar */}
        <path
          d="M21 51C14 50 9 48 5 44M9.5 41.5L4.5 43.5L6.5 48.5"
          stroke="currentColor"
          strokeWidth="2.2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
      </svg>
      <div className="hand-doodle__text">
        <span className="hand-doodle__action">{copy.action}</span>
        <span className="hand-doodle__detail">{copy.detail}</span>
      </div>
    </div>
  );
}

// El frame base tiene el puño a la derecha y el dedo hacia la izquierda.
// Derecha arrastra a la izquierda; izquierda y arriba arrastran en positivo.
const DRAG_DIRECTION: Record<PanelSide, number> = {
  left: 1,
  top: 1,
  right: -1,
};

export default function PanelHandle({ side }: { side: PanelSide }) {
  const { panelProgress, panelDragSide } = usePortfolioStore();
  const [reducedMotion, setReducedMotion] = useState(false);
  const dragRef = useRef<DragState | null>(null);
  const fingerRef = useRef<SVGGElement>(null);
  const fingerTweenRef = useRef<gsap.core.Tween | null>(null);

  const progress = panelProgress[side];
  const dragging = panelDragSide === side;
  const handRotate = dragging
    ? Math.max(-4, Math.min(4, (progress - 0.5) * 8))
    : 0;

  useEffect(() => {
    const query = window.matchMedia("(prefers-reduced-motion: reduce)");
    setReducedMotion(query.matches);
    const onChange = (event: MediaQueryListEvent) => setReducedMotion(event.matches);
    query.addEventListener("change", onChange);
    return () => query.removeEventListener("change", onChange);
  }, []);

  useEffect(
    () => () => {
      fingerTweenRef.current?.kill();
    },
    [],
  );

  const readPointer = (event: PointerEvent<HTMLButtonElement>) =>
    side === "top" ? event.clientY : event.clientX;

  const emitProgress = (value: number) => {
    experienceBus.emit({
      type: "PANEL_DRAG_PROGRESS",
      progress: clamp01(value),
      side,
    });
    experienceBus.emit({ type: "DRAG_MOVE" });
  };

  // El estiramiento acompaña al recorrido real del dedo: 0 = reposo, 1 = tope.
  const stretchFinger = (amount: number, duration = 0.14) => {
    const target = fingerRef.current;
    if (!target) return;

    const scale = 1 + (HAND_FINGER_MAX_SCALE - 1) * clamp01(amount);
    fingerTweenRef.current?.kill();
    if (reducedMotion) {
      gsap.set(target, { scaleX: scale, svgOrigin: HAND_FINGER_ORIGIN });
      return;
    }

    fingerTweenRef.current = gsap.to(target, {
      scaleX: scale,
      svgOrigin: HAND_FINGER_ORIGIN,
      duration,
      ease: "power2.out",
      overwrite: "auto",
    });
  };

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const panel = document.querySelector<HTMLElement>(
      `[data-panel="${side}"] .side-panel`,
    );
    const rect = panel?.getBoundingClientRect();
    const rawExtent =
      side === "top"
        ? rect?.height ?? window.innerHeight
        : rect?.width ?? window.innerWidth;
    const extent =
      side === "top"
        ? Math.max(Math.min(rawExtent, 420), 200)
        : Math.max(Math.min(rawExtent, 760), 240);
    const fromOpen = progress >= 0.99;
    const initialProgress = fromOpen ? 1 : 0;
    const pointer = readPointer(event);

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      extent: Math.max(extent, 1),
      fromOpen,
      moved: false,
      progress: initialProgress,
      baseProgress: initialProgress,
      pointerAtBase: pointer,
    };
    experienceBus.emit({ type: "FINGER_DRAG_START", side });
    experienceBus.emit({ type: "DRAG_START" });
    experienceBus.emit({ type: "PANEL_DRAG_START", side });
    stretchFinger(0);
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const pointer = readPointer(event);
    let delta = (pointer - drag.pointerAtBase) * DRAG_DIRECTION[side];
    if (!drag.moved) {
      if (Math.abs(delta) <= 5) return;
      drag.moved = true;
      drag.baseProgress = drag.progress;
      drag.pointerAtBase = pointer;
      delta = 0;
    }

    drag.progress = clamp01(drag.baseProgress + delta / drag.extent);
    emitProgress(drag.progress);
    stretchFinger(drag.fromOpen ? 1 - drag.progress : drag.progress);
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    stretchFinger(0, 0.3);

    // Solo se confirma si hubo arrastre real y se superó el umbral. Un clic
    // sin recorrido deja el panel exactamente como estaba.
    const committed =
      drag.moved &&
      (drag.fromOpen ? drag.progress <= 0.7 : drag.progress >= 0.3);
    const target = drag.moved ? (committed ? 1 : 0) : drag.fromOpen ? 1 : 0;

    experienceBus.emit({
      type: "PANEL_DRAG_END",
      progress: target,
      committed,
      side,
    });
    experienceBus.emit({ type: "DRAG_END" });
    experienceBus.emit({ type: "FINGER_DRAG_END", side });
    experienceBus.emit({
      type: target > 0 ? "UI_SHOW" : "UI_HIDE",
      side,
    });

    dragRef.current = null;
  };

  // `detail === 0` identifica la activación por teclado (Enter/Space).
  const handleKeyboardClick = (event: MouseEvent<HTMLButtonElement>) => {
    if (event.detail !== 0) return;
    experienceBus.emit({
      type: progress > 0 ? "UI_HIDE" : "UI_SHOW",
      side,
    });
  };

  return (
    <div
      className={`panel-handle-wrap${dragging ? " is-dragging" : ""}`}
      data-side={side}
      style={
        {
          "--hand-rotate": `${handRotate}deg`,
          "--panel-progress": progress,
        } as CSSProperties
      }
    >
      {progress < 0.05 && !dragging && <HandDoodle side={side} />}
      <button
        type="button"
        className="panel-handle"
        aria-label={`${progress > 0 ? "Cerrar" : "Abrir"} ${PANEL_LABELS[side]}`}
        aria-expanded={progress > 0}
        onClick={handleKeyboardClick}
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
      >
        <svg
          className="panel-handle__svg"
          viewBox={HAND_VIEW_BOX}
          aria-hidden="true"
          focusable="false"
        >
          <g ref={fingerRef}>
            <path d={HAND_FINGER_DARK} fill="#1c1c1c" />
            <path d={HAND_FINGER_WHITE} fill="#ffffff" />
          </g>
          <path d={HAND_FIST_DARK} fill="#1c1c1c" />
          <path d={HAND_FIST_WHITE} fill="#ffffff" />
        </svg>
      </button>
    </div>
  );
}
