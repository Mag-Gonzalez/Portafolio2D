"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { experienceBus } from "@/lib/eventBus";
import { usePortfolioStore } from "@/store/portfolioStore";
import About from "./About";
import Contact from "./Contact";
import ProjectList from "./ProjectList";

const PANELS = [
  { label: "Sobre mí", content: <About /> },
  { label: "Mis proyectos", content: <ProjectList /> },
  { label: "Trabajemos juntos", content: <Contact /> },
];

const STEP_COOLDOWN = 620;
const SWIPE_THRESHOLD = 48;

export default function ScrollCarousel() {
  const { scrollIndex, theme, switchOn } = usePortfolioStore();
  const lastStepRef = useRef(0);
  const touchRef = useRef<number | null>(null);

  useEffect(() => {
    document.body.classList.toggle("has-scroll-carousel", scrollIndex > 0);
    return () => document.body.classList.remove("has-scroll-carousel");
  }, [scrollIndex]);

  useEffect(() => {
    const step = (direction: 1 | -1) => {
      const now = Date.now();
      if (now - lastStepRef.current < STEP_COOLDOWN) return;
      lastStepRef.current = now;
      experienceBus.emit({
        type: direction > 0 ? "SCROLL_PANEL_NEXT" : "SCROLL_PANEL_PREV",
      });
    };

    const onWheel = (event: WheelEvent) => {
      if (Math.abs(event.deltaY) < 8) return;
      event.preventDefault();
      step(event.deltaY > 0 ? 1 : -1);
    };

    const onTouchStart = (event: TouchEvent) => {
      touchRef.current = event.touches[0]?.clientY ?? null;
    };

    const onTouchMove = (event: TouchEvent) => {
      if (touchRef.current !== null) event.preventDefault();
    };

    const onTouchEnd = (event: TouchEvent) => {
      const startY = touchRef.current;
      touchRef.current = null;
      if (startY === null) return;
      const endY = event.changedTouches[0]?.clientY;
      if (endY === undefined) return;
      const delta = startY - endY;
      if (Math.abs(delta) < SWIPE_THRESHOLD) return;
      step(delta > 0 ? 1 : -1);
    };

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.isContentEditable === true ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (isEditable) return;
      if (event.key === "ArrowDown") {
        event.preventDefault();
        step(1);
      } else if (event.key === "ArrowUp") {
        event.preventDefault();
        step(-1);
      }
    };

    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchmove", onTouchMove, { passive: false });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKeyDown);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKeyDown);
    };
  }, []);

  return (
    <section
      className={`scroll-carousel${scrollIndex > 0 ? " is-active" : ""}`}
      data-index={scrollIndex}
      aria-hidden={scrollIndex === 0}
      aria-label="Paneles del portafolio"
    >
      {PANELS.map((panel, index) => {
        const number = index + 1;
        const offset = number - scrollIndex;
        const placement =
          offset === 0 ? "is-active" : offset < 0 ? "is-past" : "is-next";

        return (
          <article
            key={panel.label}
            className={`scroll-panel ${placement}`}
            style={{ "--panel-step": offset } as CSSProperties}
            aria-hidden={number !== scrollIndex}
          >
            <div
              className={`side-panel${theme === "light" ? " is-light" : ""}${
                switchOn ? " is-on" : ""
              }`}
            >
              <div className="side-panel__header">
                <span className="side-panel__label">{panel.label}</span>
                <span className="scroll-panel__counter">
                  {String(number).padStart(2, "0")} / 03
                </span>
                <button
                  type="button"
                  className="side-panel__close"
                  aria-label={`Volver al inicio desde ${panel.label}`}
                  onClick={() =>
                    experienceBus.emit({ type: "SCROLL_PANEL_GOTO", index: 0 })
                  }
                >
                  ×
                </button>
              </div>
              <div className="side-panel__content">
                <div className="tab-panel">{panel.content}</div>
              </div>
            </div>
          </article>
        );
      })}
    </section>
  );
}
