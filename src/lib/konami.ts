// Secuencia [OBSERVADO] en docs/reference/SECTION_BREAKDOWN.md.
export const KONAMI_SEQUENCE: readonly string[] = [
  "ArrowUp",
  "ArrowUp",
  "ArrowDown",
  "ArrowDown",
  "ArrowLeft",
  "ArrowRight",
  "ArrowLeft",
  "ArrowRight",
  "b",
  "a",
] as const;

export function createKonamiDetector(onComplete: () => void): (key: string) => void {
  let index = 0;

  return (key: string) => {
    if (key === KONAMI_SEQUENCE[index]) {
      index += 1;
      if (index === KONAMI_SEQUENCE.length) {
        index = 0;
        onComplete();
      }
      return;
    }

    index = key === KONAMI_SEQUENCE[0] ? 1 : 0;
  };
}
