"use client";

import { portfolioProjects } from "@/data/portfolioData";
import { experienceBus } from "@/lib/eventBus";
import { usePortfolioStore } from "@/store/portfolioStore";

const PENDING_SOURCES = {
  claynosaurz: "/videos/claynosaurz.webm",
  konami:
    "/videos/salut-cest-frank-leboeuf-vous-voulez-savoir-combien-vaut-votre-voiture.mp4",
} as const;

export default function MediaLayer() {
  const { media, activeProjectId } = usePortfolioStore();
  const projectIndex = portfolioProjects.findIndex(
    (project) => project.id === activeProjectId,
  );
  const project = projectIndex >= 0 ? portfolioProjects[projectIndex] : null;
  const isOpen = Boolean(media || project);

  const close = () => {
    if (project) {
      experienceBus.emit({ type: "PROJECT_DETAIL_HIDE" });
      return;
    }
    experienceBus.emit({ type: "MEDIA_HIDE" });
  };

  return (
    <div
      className={`media-layer${isOpen ? " is-visible" : ""}`}
      aria-hidden={!isOpen}
      aria-modal={isOpen || undefined}
      role={isOpen ? "dialog" : undefined}
      aria-labelledby={project ? "project-detail-title" : undefined}
      data-media-key={media ?? undefined}
      data-project-id={project?.id}
    >
      {isOpen && (
        <button
          type="button"
          className="media-layer__close-button close-button"
          aria-label={project ? "Cerrar detalle del proyecto" : "Cerrar media"}
          onClick={close}
        >
          ×
        </button>
      )}

      {project ? (
        <article className="project-detail">
          <div
            className="project-detail__preview"
            style={{ backgroundColor: project.preview.accent }}
            aria-hidden="true"
          >
            <span className="project-detail__glyph">{project.preview.glyph}</span>
            <span className="project-detail__caption">
              {project.preview.caption}
            </span>
          </div>

          <div className="project-detail__body">
            <p className="project-detail__meta label-link">
              {project.year} · {project.role}
            </p>
            <h2 className="project-detail__title" id="project-detail-title">
              {project.title}
            </h2>
            <p className="project-detail__summary">{project.summary}</p>
            <p className="project-detail__description">{project.description}</p>

            <section className="project-detail__section" aria-label="Stack">
              <h3>Stack / Arquitectura</h3>
              <ul className="tag-list">
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </section>

            <section className="project-detail__section" aria-label="Aspectos destacados">
              <h3>Highlights</h3>
              <ul className="project-detail__highlights">
                {project.highlights.map((highlight) => (
                  <li key={highlight}>{highlight}</li>
                ))}
              </ul>
            </section>

            <div className="project-detail__links">
              <a
                className="cta-link"
                href={project.repoUrl}
                target="_blank"
                rel="noopener noreferrer"
              >
                <span className="cta-link__label label-link">GitHub</span>
                <span className="cta-link__icon label-link" aria-hidden="true">
                  →
                </span>
              </a>
              {project.demoUrl && (
                <a
                  className="cta-link"
                  href={project.demoUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <span className="cta-link__label label-link">Demo</span>
                  <span className="cta-link__icon label-link" aria-hidden="true">
                    →
                  </span>
                </a>
              )}
            </div>

            <nav
              className="project-detail__nav"
              aria-label="Navegación entre proyectos"
            >
              <button
                type="button"
                onClick={() =>
                  experienceBus.emit({
                    type: "PROJECT_DETAIL_NAVIGATE",
                    direction: "prev",
                  })
                }
              >
                Anterior
              </button>
              <span className="project-detail__counter" aria-live="polite">
                {projectIndex + 1} / {portfolioProjects.length}
              </span>
              <button
                type="button"
                onClick={() =>
                  experienceBus.emit({
                    type: "PROJECT_DETAIL_NAVIGATE",
                    direction: "next",
                  })
                }
              >
                Siguiente
              </button>
            </nav>
          </div>
        </article>
      ) : (
        <div className="media-layer__player media-player">
          <div className="media-player__video video-wrapper">
            {/* [PENDIENTE] Assets de vídeo no copiados todavía. Se conserva la ruta
                documentada para conectar el reproductor en una fase posterior. */}
            <div
              className="video-wrapper__placeholder"
              role="img"
              aria-label={
                media === "konami" ? "frank leboeuf :D" : "Claynosaurz Booster Packs"
              }
              data-video-src={media ? PENDING_SOURCES[media] : undefined}
            >
              <span className="video-wrapper__title">
                {media === "konami" ? "frank leboeuf :D" : "Claynosaurz Booster Packs"}
              </span>
              <span className="video-wrapper__hint">Vídeo pendiente de integración</span>
            </div>
            <div className="video-wrapper__flash" aria-hidden="true" />
          </div>
        </div>
      )}
    </div>
  );
}
