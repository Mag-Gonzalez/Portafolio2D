"use client";

import { useEffect, useRef, useState } from "react";
import { contact } from "@/data/portfolioData";

const EMAIL = contact.email;

async function copyEmail(text: string): Promise<void> {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }

  // Fallback para contextos sin Clipboard API (sin dependencias extra).
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  const copied = document.execCommand("copy");
  document.body.removeChild(textarea);
  if (!copied) throw new Error("No se pudo copiar el email");
}

export default function CopyEmailButton() {
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
    },
    [],
  );

  const handleClick = async () => {
    try {
      await copyEmail(EMAIL);
      setCopied(false);
      // Reinicia el feedback aunque se haga clic varias veces seguidas.
      window.requestAnimationFrame(() => setCopied(true));
      if (timeoutRef.current !== null) window.clearTimeout(timeoutRef.current);
      timeoutRef.current = window.setTimeout(() => setCopied(false), 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <button
      type="button"
      className={`cta-copy contact__link${copied ? " is-copied" : ""}`}
      onClick={handleClick}
      aria-label={`Copiar email ${EMAIL}`}
    >
      <span className="cta-copy__label label-link">{EMAIL}</span>
      <span className="cta-copy__icon label-link" aria-hidden="true">
        →
      </span>
      <span className="cta-copy__tooltip tooltip" aria-hidden="true">
        <span className="tooltip__label label-link">Copied!</span>
      </span>
      <span className="sr-only" aria-live="polite">
        {copied ? "Copied!" : ""}
      </span>
    </button>
  );
}
