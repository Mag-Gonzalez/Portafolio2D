"use client";

import { useEffect, useRef, useState, type PointerEvent } from "react";
import { experienceBus } from "@/lib/eventBus";
import { actions, FACE_TITLES, usePortfolioStore } from "@/store/portfolioStore";

type Zone = "head" | "hand" | "close" | null;
type DragState = {
  kind: "head" | "hand";
  startX: number;
  opened: boolean;
};

// Zonas normalizadas [ESTIMADO] a partir de las medidas a 912x766 en
// docs/reference/INTERACTION_INVENTORY.md. Se escalan con el viewport.
const ZONES = {
  head: { x0: 0.3, x1: 0.6, y0: 0.25, y1: 0.63 },
  hand: { x0: 0.78, x1: 0.96, y0: 0.4, y1: 0.62 },
  close: { x0: 0.07, x1: 0.23, y0: 0.3, y1: 0.58 },
} as const;

function getZone(nx: number, ny: number): Zone {
  if (nx >= ZONES.close.x0 && nx <= ZONES.close.x1 && ny >= ZONES.close.y0 && ny <= ZONES.close.y1) {
    return "close";
  }
  if (nx >= ZONES.head.x0 && nx <= ZONES.head.x1 && ny >= ZONES.head.y0 && ny <= ZONES.head.y1) {
    return "head";
  }
  if (nx >= ZONES.hand.x0 && nx <= ZONES.hand.x1 && ny >= ZONES.hand.y0 && ny <= ZONES.hand.y1) {
    return "hand";
  }
  return null;
}

export default function ExperienceScene() {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const state = usePortfolioStore();
  const [drag, setDrag] = useState<DragState | null>(null);
  const [cursor, setCursor] = useState("default");

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const draw = () => {
      const rect = container.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return;

      const dpr = Math.min(window.devicePixelRatio || 1, 2);
      canvas.width = Math.round(rect.width * dpr);
      canvas.height = Math.round(rect.height * dpr);

      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      const width = rect.width;
      const height = rect.height;
      const ink = state.theme === "light" ? "#1c1c1c" : "#ffffff";

      ctx.fillStyle = "#ff0b36";
      ctx.fillRect(0, 0, width, height);

      // Cabeza placeholder: se sustituirá por el avatar/WebGL en una fase posterior.
      const headX = width * 0.45;
      const headY = height * 0.44;
      const radius = Math.min(width, height) * 0.15;
      ctx.beginPath();
      ctx.arc(headX, headY, radius, 0, Math.PI * 2);
      ctx.fillStyle = ink;
      ctx.fill();

      ctx.fillStyle = "#ff0b36";
      ctx.beginPath();
      ctx.arc(headX - radius * 0.35, headY - radius * 0.2, radius * 0.08, 0, Math.PI * 2);
      ctx.arc(headX + radius * 0.35, headY - radius * 0.2, radius * 0.08, 0, Math.PI * 2);
      ctx.fill();

      ctx.strokeStyle = "#ff0b36";
      ctx.lineWidth = Math.max(2, radius * 0.06);
      ctx.beginPath();
      if (state.face === "frowning") {
        ctx.arc(headX, headY + radius * 0.5, radius * 0.28, Math.PI, Math.PI * 2);
      } else {
        ctx.arc(headX, headY + radius * 0.22, radius * 0.3, 0, Math.PI);
      }
      ctx.stroke();

      // Mano placeholder: arrastrarla abre el contenido.
      const handW = width * 0.13;
      const handH = height * 0.16;
      ctx.fillStyle = ink;
      ctx.fillRect(width * 0.84 - handW / 2, height * 0.5 - handH / 2, handW, handH);

      if (state.ui === "visible") {
        const closeX = width * 0.15;
        const closeY = height * 0.44;
        const size = Math.min(width, height) * 0.05;
        ctx.strokeStyle = ink;
        ctx.lineWidth = Math.max(2, size * 0.18);
        ctx.beginPath();
        ctx.moveTo(closeX - size, closeY - size);
        ctx.lineTo(closeX + size, closeY + size);
        ctx.moveTo(closeX + size, closeY - size);
        ctx.lineTo(closeX - size, closeY + size);
        ctx.stroke();
      }

      ctx.fillStyle = "#ffffff";
      ctx.textAlign = "center";
      ctx.font = `700 ${Math.max(16, Math.min(width, height) * 0.045)}px "Comic CAT", "Comic Sans MS", cursive`;
      ctx.fillText(FACE_TITLES[state.face], width / 2, height * 0.12);
    };

    draw();
    const observer = new ResizeObserver(draw);
    observer.observe(container);
    return () => observer.disconnect();
  }, [state.face, state.theme, state.ui, state.loadPhase]);

  const readPointer = (event: PointerEvent<HTMLDivElement>) => {
    const rect = event.currentTarget.getBoundingClientRect();
    return {
      nx: (event.clientX - rect.left) / Math.max(rect.width, 1),
      ny: (event.clientY - rect.top) / Math.max(rect.height, 1),
      width: Math.max(rect.width, 1),
    };
  };

  const handlePointerDown = (event: PointerEvent<HTMLDivElement>) => {
    const { nx, ny } = readPointer(event);
    const zone = getZone(nx, ny);

    experienceBus.emit({ type: "MOUSE_DOWN" });
    experienceBus.emit({ type: "DRAG_START" });

    if (zone === "close" && state.ui === "visible") {
      experienceBus.emit({ type: "UI_HIDE" });
      return;
    }
    if (zone !== "head" && zone !== "hand") return;

    event.currentTarget.setPointerCapture(event.pointerId);
    setDrag({ kind: zone, startX: event.clientX, opened: false });

    if (zone === "head") {
      experienceBus.emit({ type: "FACE_DRAG_START" });
      actions.setFace("frowning");
    } else {
      experienceBus.emit({ type: "FINGER_DRAG_START", side: "right" });
    }
  };

  const handlePointerMove = (event: PointerEvent<HTMLDivElement>) => {
    const { nx, ny, width } = readPointer(event);

    if (!drag) {
      const zone = getZone(nx, ny);
      setCursor(
        zone === "head" || zone === "hand"
          ? "grab"
          : zone === "close" && state.ui === "visible"
            ? "pointer"
            : "default",
      );
      if (zone === "head" && state.face !== "frank") {
        actions.setFace("surprised");
      } else if (zone !== "head" && state.face === "surprised") {
        actions.setFace("default");
      }
      return;
    }

    experienceBus.emit({ type: "MOUSE_MOVE" });
    experienceBus.emit({ type: "DRAG_MOVE" });

    if (drag.kind === "head") {
      setCursor("grabbing");
      return;
    }

    const ratio = (event.clientX - drag.startX) / width;
    if (!drag.opened && ratio <= -0.333) {
      experienceBus.emit({ type: "UI_SHOW", side: "right" });
      setDrag({ ...drag, opened: true });
    }
  };

  const handlePointerUp = (event: PointerEvent<HTMLDivElement>) => {
    if (!drag) return;
    const { nx, ny } = readPointer(event);

    if (drag.kind === "head") {
      experienceBus.emit({ type: "FACE_DRAG_END" });
      actions.setFace(
        state.face === "frank"
          ? "frank"
          : getZone(nx, ny) === "head"
            ? "surprised"
            : "default",
      );
    } else if (drag.opened) {
      experienceBus.emit({ type: "FINGER_DRAG_END" });
    }

    experienceBus.emit({ type: "DRAG_END" });
    experienceBus.emit({ type: "MOUSE_UP" });

    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setDrag(null);
    setCursor("default");
  };

  const handlePointerLeave = () => {
    if (drag) return;
    setCursor("default");
    if (state.face === "surprised") actions.setFace("default");
  };

  return (
    <div
      ref={containerRef}
      className="webgl-container"
      style={{ cursor }}
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={handlePointerUp}
      onPointerCancel={handlePointerUp}
      onPointerLeave={handlePointerLeave}
    >
      <canvas ref={canvasRef} className="webgl-container__canvas" aria-hidden="true" />
      {/* [ESTIMADO] Pista visual del carrusel. El avance real ocurre con
          rueda/swipe o flechas; el fondo sigue visible detrás de los paneles. */}
      {state.ui === "hidden" && state.scrollIndex === 0 && (
        <div className="scene-open-button" aria-hidden="true">
          Desliza <span aria-hidden="true">↓</span>
        </div>
      )}
    </div>
  );
}
