"use client";

import { experienceBus } from "@/lib/eventBus";

export default function MediaCta() {
  return (
    <button
      type="button"
      className="cta-media"
      onClick={() => experienceBus.emit({ type: "MEDIA_SHOW", mediaKey: "claynosaurz" })}
    >
      <span className="cta-link__icon label-link" aria-hidden="true">
        →
      </span>
      <span className="cta-link__label label-link">Watch</span>
    </button>
  );
}
