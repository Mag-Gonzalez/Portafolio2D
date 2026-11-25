import { useSyncExternalStore } from "react";
import { portfolioProjects } from "@/data/portfolioData";
import type { PanelSide } from "@/lib/eventBus";

export type { PanelSide } from "@/lib/eventBus";

export type LoadPhase = "idle" | "loading" | "ready";
export type FaceState = "default" | "surprised" | "frowning" | "frank";
export type UiState = "hidden" | "visible";
export type MediaKey = "claynosaurz" | "konami";
export type Theme = "light" | "dark";

export const PANEL_SIDES: PanelSide[] = ["left", "top", "right"];
export const DEFAULT_PANEL: PanelSide = "right";
export const MAX_SCROLL_INDEX = 3;

const clampProgress = (progress: number) =>
  Math.min(1, Math.max(0, progress));

const zeroProgress = (): Record<PanelSide, number> => ({
  left: 0,
  top: 0,
  right: 0,
});

export interface PortfolioState {
  loadPhase: LoadPhase;
  face: FaceState;
  // Derivado de `activePanel`: se mantiene como campo para no romper los
  // consumidores existentes de `ui`.
  ui: UiState;
  activePanel: PanelSide | null;
  // Progreso independiente por borde; solo un panel puede estar activo.
  panelProgress: Record<PanelSide, number>;
  panelDragSide: PanelSide | null;
  // Alias del panel activo, conservados para AvatarScene y la escena z0.
  panelDragProgress: number;
  panelDragging: boolean;
  // Carrusel vertical: 0 = escena inicial; 1..3 = paneles que suben.
  scrollIndex: number;
  media: MediaKey | null;
  activeProjectId: string | null;
  theme: Theme;
  // [OBSERVADO] `.mobile-switch.is-on` convive con `.side-panel.is-light`.
  switchOn: boolean;
  scrollLocked: boolean;
}

export const FACE_TITLES: Record<FaceState, string> = {
  default: "Adrien Lamy :D",
  surprised: "Adrien Lamy :o",
  frowning: "Adrien Lamy x/",
  frank: "frank leboeuf :D",
};

const initialState: PortfolioState = {
  loadPhase: "idle",
  face: "default",
  ui: "hidden",
  activePanel: null,
  panelProgress: zeroProgress(),
  panelDragSide: null,
  panelDragProgress: 0,
  panelDragging: false,
  scrollIndex: 0,
  media: null,
  activeProjectId: null,
  theme: "light",
  switchOn: true,
  scrollLocked: false,
};

let state: PortfolioState = initialState;
const listeners = new Set<() => void>();

function setState(patch: Partial<PortfolioState>): void {
  state = { ...state, ...patch };
  listeners.forEach((listener) => listener());
}

const closedPanels = (): Partial<PortfolioState> => ({
  activePanel: null,
  ui: "hidden",
  panelProgress: zeroProgress(),
  panelDragSide: null,
  panelDragProgress: 0,
  panelDragging: false,
});

// Un único panel activo: abrir uno descarta el progreso de los otros dos.
function panelPatch(
  side: PanelSide,
  progress: number,
  activePanel: PanelSide | null,
  panelDragSide: PanelSide | null,
): Partial<PortfolioState> {
  const value = clampProgress(progress);
  const panelProgress = zeroProgress();
  panelProgress[side] = value;
  return {
    activePanel,
    ui: activePanel ? "visible" : "hidden",
    panelProgress,
    panelDragSide,
    panelDragProgress: value,
    panelDragging: panelDragSide !== null,
  };
}

export const portfolioStore = {
  subscribe(listener: () => void): () => void {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },
  getSnapshot(): PortfolioState {
    return state;
  },
  getServerSnapshot(): PortfolioState {
    return initialState;
  },
};

export function usePortfolioStore(): PortfolioState {
  return useSyncExternalStore(
    portfolioStore.subscribe,
    portfolioStore.getSnapshot,
    portfolioStore.getServerSnapshot,
  );
}

export const actions = {
  setLoadPhase(loadPhase: LoadPhase): void {
    setState({ loadPhase });
  },
  setFace(face: FaceState): void {
    setState({ face });
  },
  showUi(side: PanelSide = DEFAULT_PANEL): void {
    setState(panelPatch(side, 1, side, null));
  },
  hideUi(side?: PanelSide): void {
    if (side && state.activePanel !== side) return;
    setState({ ...closedPanels(), scrollIndex: 0 });
  },
  scrollNext(): void {
    const next = Math.min(MAX_SCROLL_INDEX, state.scrollIndex + 1);
    setState({ ...closedPanels(), scrollIndex: next });
  },
  scrollPrev(): void {
    const next = Math.max(0, state.scrollIndex - 1);
    setState({ ...closedPanels(), scrollIndex: next });
  },
  scrollTo(index: number): void {
    const next = Math.min(MAX_SCROLL_INDEX, Math.max(0, Math.round(index)));
    setState({ ...closedPanels(), scrollIndex: next });
  },
  startPanelDrag(side: PanelSide = DEFAULT_PANEL): void {
    const fromProgress = state.panelProgress[side] ?? 0;
    setState(panelPatch(side, fromProgress, side, side));
  },
  setPanelDragProgress(
    progress: number,
    side: PanelSide = state.panelDragSide ?? DEFAULT_PANEL,
  ): void {
    const value = clampProgress(progress);
    const panelProgress = { ...state.panelProgress, [side]: value };
    setState({
      panelProgress,
      panelDragProgress: value,
    });
  },
  endPanelDrag(
    progress: number,
    side: PanelSide = state.panelDragSide ?? DEFAULT_PANEL,
  ): void {
    const value = clampProgress(progress);
    setState(panelPatch(side, value, value > 0 ? side : null, null));
  },
  showMedia(mediaKey: MediaKey): void {
    setState({ media: mediaKey, activeProjectId: null, scrollLocked: true });
  },
  hideMedia(): void {
    setState({ media: null, scrollLocked: false });
  },
  showProjectDetail(projectId: string): void {
    setState({ media: null, activeProjectId: projectId, scrollLocked: true });
  },
  hideProjectDetail(): void {
    setState({ activeProjectId: null, scrollLocked: false });
  },
  navigateProjectDetail(direction: "prev" | "next"): void {
    const ids = portfolioProjects.map((project) => project.id);
    const currentIndex = ids.indexOf(state.activeProjectId ?? "");
    if (currentIndex === -1 || ids.length === 0) return;

    const offset = direction === "next" ? 1 : -1;
    const nextIndex = (currentIndex + offset + ids.length) % ids.length;
    setState({ activeProjectId: ids[nextIndex] });
  },
  setTheme(theme: Theme): void {
    setState({
      theme,
      switchOn: theme === "light",
    });
  },
  toggleTheme(): void {
    actions.setTheme(state.theme === "light" ? "dark" : "light");
  },
};
