"use client";

import { useEffect, type ReactNode } from "react";
import { experienceBus } from "@/lib/eventBus";
import { createKonamiDetector } from "@/lib/konami";
import { actions, FACE_TITLES, usePortfolioStore } from "@/store/portfolioStore";

export default function ExperienceRoot({ children }: { children: ReactNode }) {
  const { face, scrollLocked, activeProjectId, media, ui, scrollIndex } =
    usePortfolioStore();

  // Conecta el bus documentado con el store plano. El placeholder no tiene
  // texturas reales, por lo que la carga se marca como lista al montar.
  useEffect(() => {
    const unsubscribers = [
      experienceBus.on("WEBGL_LOAD_START", () => actions.setLoadPhase("loading")),
      experienceBus.on("WEBGL_LOAD_PROGRESS", ({ progress }) => {
        if (progress >= 100) actions.setLoadPhase("ready");
      }),
      experienceBus.on("WEBGL_LOAD_COMPLETE", () => actions.setLoadPhase("ready")),
      experienceBus.on("FIRST_RENDER", () => actions.setLoadPhase("ready")),
      experienceBus.on("FACE_DRAG_START", () => actions.setFace("frowning")),
      experienceBus.on("FACE_DRAG_END", () => actions.setFace("default")),
      experienceBus.on("UI_SHOW", ({ side }) => actions.showUi(side)),
      experienceBus.on("UI_HIDE", ({ side }) => {
        actions.hideUi(side);
        actions.setFace("default");
      }),
      experienceBus.on("MEDIA_SHOW", ({ mediaKey }) => actions.showMedia(mediaKey)),
      experienceBus.on("MEDIA_HIDE", () => actions.hideMedia()),
      experienceBus.on("PROJECT_DETAIL_SHOW", ({ projectId }) =>
        actions.showProjectDetail(projectId),
      ),
      experienceBus.on("PROJECT_DETAIL_HIDE", () => actions.hideProjectDetail()),
      experienceBus.on("PROJECT_DETAIL_NAVIGATE", ({ direction }) =>
        actions.navigateProjectDetail(direction),
      ),
      experienceBus.on("PANEL_DRAG_START", ({ side }) =>
        actions.startPanelDrag(side),
      ),
      experienceBus.on("PANEL_DRAG_PROGRESS", ({ progress, side }) =>
        actions.setPanelDragProgress(progress, side),
      ),
      experienceBus.on("PANEL_DRAG_END", ({ progress, side }) =>
        actions.endPanelDrag(progress, side),
      ),
      experienceBus.on("SCROLL_PANEL_NEXT", () => actions.scrollNext()),
      experienceBus.on("SCROLL_PANEL_PREV", () => actions.scrollPrev()),
      experienceBus.on("SCROLL_PANEL_GOTO", ({ index }) =>
        actions.scrollTo(index),
      ),
      experienceBus.on("SCRIBBLES_HIDE", () => actions.setFace("frank")),
      experienceBus.on("MOBILE_SWITCH_TOGGLE", ({ isSwitchOn }) => {
        actions.setTheme(isSwitchOn ? "light" : "dark");
      }),
    ];

    experienceBus.emit({ type: "WEBGL_LOAD_START" });
    experienceBus.emit({ type: "WEBGL_LOAD_PROGRESS", progress: 100 });
    experienceBus.emit({ type: "WEBGL_LOAD_COMPLETE" });
    experienceBus.emit({ type: "FIRST_RENDER" });

    return () => unsubscribers.forEach((unsubscribe) => unsubscribe());
  }, []);

  useEffect(() => {
    document.title = FACE_TITLES[face];
  }, [face]);

  useEffect(() => {
    document.body.classList.toggle("has-scroll-lock", scrollLocked);
    return () => document.body.classList.remove("has-scroll-lock");
  }, [scrollLocked]);

  // Escape cierra primero la vista detallada y, si no está activa, el media
  // legado; ambas rutas liberan el scroll lock desde el store.
  useEffect(() => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key !== "Escape") return;
      if (activeProjectId) {
        experienceBus.emit({ type: "PROJECT_DETAIL_HIDE" });
      } else if (media) {
        experienceBus.emit({ type: "MEDIA_HIDE" });
      } else if (scrollIndex > 0) {
        experienceBus.emit({ type: "SCROLL_PANEL_GOTO", index: 0 });
      } else if (ui === "visible") {
        experienceBus.emit({ type: "UI_HIDE" });
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [activeProjectId, media, ui, scrollIndex]);

  useEffect(() => {
    const detect = createKonamiDetector(() => {
      experienceBus.emit({ type: "MEDIA_SHOW", mediaKey: "konami" });
      experienceBus.emit({ type: "SCRIBBLES_HIDE" });
    });

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null;
      const isEditable =
        target?.isContentEditable === true ||
        ["INPUT", "TEXTAREA", "SELECT"].includes(target?.tagName ?? "");
      if (isEditable) return;
      detect(event.key);
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, []);

  return <>{children}</>;
}
