"use client";

import { experienceBus } from "@/lib/eventBus";
import { usePortfolioStore } from "@/store/portfolioStore";

export default function MobileSwitch() {
  const { switchOn } = usePortfolioStore();
  // Etiqueta [OBSERVADO]: `is-on` muestra "Switch to Dark mode".
  const label = switchOn ? "Switch to Dark mode" : "Switch to Light mode";

  return (
    <button
      type="button"
      className={`mobile-switch${switchOn ? " is-on" : ""}`}
      onClick={() =>
        experienceBus.emit({
          type: "MOBILE_SWITCH_TOGGLE",
          isSwitchOn: !switchOn,
        })
      }
    >
      <span className="sr-only">{label}</span>
      <span className="mobile-switch__visual" aria-hidden="true">
        {switchOn ? "A" : "B"}
      </span>
    </button>
  );
}
