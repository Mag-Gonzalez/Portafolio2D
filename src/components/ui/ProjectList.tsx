"use client";

import { portfolioProjects } from "@/data/portfolioData";
import { experienceBus } from "@/lib/eventBus";

export default function ProjectList() {
  return (
    <section className="projects" aria-labelledby="projects-title">
      <h3 className="projects__title title" id="projects-title">
        Mis proyectos
      </h3>
      <div className="projects__list">
        {portfolioProjects.map((project) => (
          <article className="project" key={project.id}>
            <div
              className="project__preview"
              style={{ backgroundColor: project.preview.accent }}
              aria-hidden="true"
            >
              <span>{project.preview.glyph}</span>
            </div>
            <div className="project__info">
              <div className="project__meta label-link">
                {project.year} · {project.role}
              </div>
              <div className="project__title text">{project.title}</div>
              <div className="project__description text text--grey">
                {project.summary}
              </div>
              <ul className="project__stack">
                {project.stack.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              className="cta-link project__link"
              onClick={() =>
                experienceBus.emit({
                  type: "PROJECT_DETAIL_SHOW",
                  projectId: project.id,
                })
              }
              aria-label={`Ver detalle de ${project.title}`}
            >
              <span className="cta-link__label label-link">
                Explorar / Ver detalle
              </span>
              <span className="cta-link__icon label-link" aria-hidden="true">
                →
              </span>
            </button>
          </article>
        ))}
      </div>
    </section>
  );
}
