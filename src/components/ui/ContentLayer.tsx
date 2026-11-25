"use client";

import { useEffect, useRef, type CSSProperties } from "react";
import { profile } from "@/data/portfolioData";
import { experienceBus, type PanelSide } from "@/lib/eventBus";
import { usePortfolioStore } from "@/store/portfolioStore";
import About from "./About";
import Contact from "./Contact";
import MobileSwitch from "./MobileSwitch";
import PanelHandle from "./PanelHandle";
import ProjectList from "./ProjectList";
import ScrollCarousel from "./ScrollCarousel";

const PANEL_LABELS: Record<PanelSide, string> = {
  left: "Sobre mí",
  top: "Mis proyectos",
  right: "Trabajemos juntos",
};

const PANELS: PanelSide[] = ["left", "top", "right"];

export default function ContentLayer() {
  const {
    ui,
    activePanel,
    scrollIndex,
    theme,
    switchOn,
    media,
    activeProjectId,
    panelProgress,
    panelDragSide,
  } = usePortfolioStore();
  const shellsRef = useRef<HTMLDivElement>(null);

  // Clic/tap fuera de los paneles cierra el activo, salvo durante un drag o
  // con media activo. Los tiradores viven fuera de los shells y se excluyen.
  useEffect(() => {
    if (ui !== "visible" || media || activeProjectId || panelDragSide) return;

    const onPointerDown = (event: globalThis.PointerEvent) => {
      if (shellsRef.current?.contains(event.target as Node)) return;
      const element = event.target instanceof Element ? event.target : null;
      if (element?.closest(".mobile-switch")) return;
      if (element?.closest(".panel-handle-wrap")) return;
      experienceBus.emit({ type: "UI_HIDE" });
    };

    window.addEventListener("pointerdown", onPointerDown);
    return () => window.removeEventListener("pointerdown", onPointerDown);
  }, [ui, media, activeProjectId, panelDragSide]);

  return (
    <div className={`content ${ui === "visible" ? "is-visible" : "is-hidden"}`}>
      {scrollIndex === 0 &&
        PANELS.filter((side) => ui === "hidden" || side === activePanel).map(
          (side) => (
            <PanelHandle key={side} side={side} />
          ),
        )}

      <main className="page view-home">
        <h1 className="sr-only">Who am I? {profile.name}</h1>
        <h2 className="sr-only">{profile.role}</h2>
        <MobileSwitch />

        <div ref={shellsRef} className="panel-shells">
          {PANELS.map((side) => {
            const progress = panelProgress[side];
            const hidden = 1 - progress;
            const shellStyle = {
              "--panel-hidden": hidden,
            } as CSSProperties;

            return (
              <div
                key={side}
                data-panel={side}
                className={`panel-shell panel-shell--${side}${
                  panelDragSide === side ? " is-dragging" : ""
                }${progress > 0 ? " is-engaged" : ""}`}
                style={shellStyle}
              >
                <div
                  className={`side-panel${theme === "light" ? " is-light" : ""}${
                    switchOn ? " is-on" : ""
                  }`}
                  style={{ opacity: Math.min(1, progress * 5) }}
                  aria-hidden={progress === 0}
                >
                  <div className="side-panel__header">
                    <span className="side-panel__label">
                      {PANEL_LABELS[side]}
                    </span>
                    <button
                      type="button"
                      className="side-panel__close"
                      aria-label={`Cerrar ${PANEL_LABELS[side]}`}
                      onClick={() =>
                        experienceBus.emit({ type: "UI_HIDE", side })
                      }
                    >
                      ×
                    </button>
                  </div>

                  <div className="side-panel__content">
                    <div className="tab-panel">
                      {side === "left" && <About />}
                      {side === "top" && <ProjectList />}
                      {side === "right" && <Contact />}
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </main>

      <ScrollCarousel />
    </div>
  );
}
