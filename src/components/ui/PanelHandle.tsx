"use client";

import {
  useRef,
  type CSSProperties,
  type MouseEvent,
  type PointerEvent,
} from "react";
import { HAND_NORMAL_URI, HAND_STRETCH_URI } from "@/lib/handAssets";
import { experienceBus, type PanelSide } from "@/lib/eventBus";
import { usePortfolioStore } from "@/store/portfolioStore";

type DragState = {
  start: number;
  extent: number;
  fromOpen: boolean;
  moved: boolean;
};

const clamp01 = (value: number) => Math.min(1, Math.max(0, value));

const PANEL_LABELS: Record<PanelSide, string> = {
  left: "Sobre mí",
  top: "Mis proyectos",
  right: "Trabajemos juntos",
};

// El frame base tiene el puño a la derecha y el dedo hacia la izquierda.
// Derecha arrastra a la izquierda; izquierda y arriba arrastran en positivo.
const DRAG_DIRECTION: Record<PanelSide, number> = {
  left: 1,
  top: 1,
  right: -1,
};

export default function PanelHandle({ side }: { side: PanelSide }) {
  const { panelProgress, panelDragSide } = usePortfolioStore();
  const dragRef = useRef<DragState | null>(null);
  const lastProgressRef = useRef(0);

  const progress = panelProgress[side];
  const dragging = panelDragSide === side;
  // [OBSERVADO] Los dos frames comparten el puño: el crossfade solo estira
  // el dedo. Se activa mientras arrastra y antes de que el panel llegue al 100%.
  const stretchOpacity = dragging ? Math.min(1, progress * 2) : 0;
  const handRotate = dragging
    ? Math.max(-4, Math.min(4, (progress - 0.5) * 8))
    : 0;

  const readPointer = (event: PointerEvent<HTMLButtonElement>) =>
    side === "top" ? event.clientY : event.clientX;

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const panel = document.querySelector<HTMLElement>(
      `[data-panel="${side}"] .side-panel`,
    );
    const rect = panel?.getBoundingClientRect();
    const extent =
      side === "top"
        ? rect?.height ?? window.innerHeight
        : rect?.width ?? window.innerWidth;
    const fromOpen = progress >= 0.99;

    event.preventDefault();
    event.currentTarget.setPointerCapture(event.pointerId);
    dragRef.current = {
      start: readPointer(event),
      extent: Math.max(extent, 1),
      fromOpen,
      moved: false,
    };
    lastProgressRef.current = fromOpen ? 1 : 0;

    experienceBus.emit({ type: "FINGER_DRAG_START", side });
    experienceBus.emit({ type: "DRAG_START" });
    experienceBus.emit({ type: "PANEL_DRAG_START", side });
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    const delta =
      (readPointer(event) - drag.start) * DRAG_DIRECTION[side];
    if (Math.abs(delta) > 5) drag.moved = true;

    const nextProgress = drag.fromOpen
      ? clamp01(1 - delta / drag.extent)
      : clamp01(delta / drag.extent);
    lastProgressRef.current = nextProgress;

    experienceBus.emit({
      type: "PANEL_DRAG_PROGRESS",
      progress: nextProgress,
      side,
    });
    experienceBus.emit({ type: "DRAG_MOVE" });
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    const drag = dragRef.current;
    if (!drag) return;

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }

    // Umbral ~30% del recorrido: al abrir se supera; al cerrar se pierde.
    const committed = drag.moved
      ? drag.fromOpen
        ? lastProgressRef.current <= 0.7
        : lastProgressRef.current >= 0.3
      : !drag.fromOpen;
    const target = committed ? 1 : 0;

    experienceBus.emit({
      type: "PANEL_DRAG_END",
      progress: target,
      committed,
      side,
    });
    experienceBus.emit({ type: "DRAG_END" });
    experienceBus.emit({ type: "FINGER_DRAG_END", side });
    experienceBus.emit({
      type: committed ? "UI_SHOW" : "UI_HIDE",
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
          "--stretch-opacity": stretchOpacity,
          "--hand-rotate": `${handRotate}deg`,
        } as CSSProperties
      }
    >
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
        <span
          className="panel-handle__frame panel-handle__frame--rest"
          style={{ backgroundImage: `url(${HAND_NORMAL_URI})` }}
          aria-hidden="true"
        />
        <span
          className="panel-handle__frame panel-handle__frame--stretch"
          style={{ backgroundImage: `url(${HAND_STRETCH_URI})` }}
          aria-hidden="true"
        />
      </button>
    </div>
  );
}
