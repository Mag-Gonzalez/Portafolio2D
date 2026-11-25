// Contrato documentado en docs/reference/TECHNICAL_ARCHITECTURE.md.
// Los nombres se conservan para poder validar con los criterios de docs/reference/.

// Los tres accesos comparten contrato; `side` es opcional para conservar los
// emisores antiguos (escena y fallback) que siguen apuntando al panel derecho.
export type PanelSide = "left" | "top" | "right";

export type ExperienceEvent =
  | { type: "WEBGL_LOAD_START" }
  | { type: "WEBGL_LOAD_PROGRESS"; progress: number }
  | { type: "WEBGL_LOAD_COMPLETE" }
  | { type: "FIRST_RENDER" }
  | { type: "MOUSE_DOWN" | "MOUSE_UP" | "MOUSE_MOVE" | "MOUSE_HAS_MOVED" }
  | { type: "DRAG_START" | "DRAG_MOVE" | "DRAG_END" }
  | { type: "FACE_DRAG_START" | "FACE_DRAG_END" }
  | { type: "FINGER_DRAG_START" | "FINGER_DRAG_END"; side?: PanelSide }
  | { type: "UI_SHOW" | "UI_HIDE"; side?: PanelSide }
  | { type: "MEDIA_SHOW"; mediaKey: "claynosaurz" | "konami" }
  | { type: "MEDIA_HIDE" }
  | { type: "SCRIBBLES_HIDE" }
  // Extensión para la vista detallada de proyectos en Media Layer (z300).
  | { type: "PROJECT_DETAIL_SHOW"; projectId: string }
  | { type: "PROJECT_DETAIL_HIDE" }
  | { type: "PROJECT_DETAIL_NAVIGATE"; direction: "prev" | "next" }
  // INT-003: el tirador derecho arrastra el panel en tiempo real y el avatar
  // reacciona al progreso (0 = cerrado, 1 = abierto).
  | { type: "PANEL_DRAG_START"; side?: PanelSide }
  | { type: "PANEL_DRAG_PROGRESS"; progress: number; side?: PanelSide }
  | { type: "PANEL_DRAG_END"; progress: number; committed: boolean; side?: PanelSide }
  // Carrusel vertical: 0 = escena inicial, 1..3 = paneles que suben.
  | { type: "SCROLL_PANEL_NEXT" | "SCROLL_PANEL_PREV" }
  | { type: "SCROLL_PANEL_GOTO"; index: number }
  | { type: "MOBILE_SWITCH_TOGGLE"; isSwitchOn: boolean };


export type ExperienceEventType = ExperienceEvent["type"];

type Listener = (event: ExperienceEvent) => void;
type Handler<T extends ExperienceEventType> = (
  event: Extract<ExperienceEvent, { type: T }>,
) => void;

class TypedEventBus {
  private readonly listeners = new Map<ExperienceEventType, Set<Listener>>();

  on<T extends ExperienceEventType>(type: T, handler: Handler<T>): () => void {
    const listener = handler as unknown as Listener;
    const current = this.listeners.get(type) ?? new Set<Listener>();
    current.add(listener);
    this.listeners.set(type, current);
    return () => this.off(type, listener as unknown as Handler<T>);
  }

  off<T extends ExperienceEventType>(type: T, handler: Handler<T>): void {
    const current = this.listeners.get(type);
    if (!current) return;
    current.delete(handler as unknown as Listener);
    if (current.size === 0) this.listeners.delete(type);
  }

  emit(event: ExperienceEvent): void {
    this.listeners.get(event.type)?.forEach((listener) => listener(event));
  }

  clear(): void {
    this.listeners.clear();
  }
}

export const experienceBus = new TypedEventBus();
