import { contact, profile } from "@/data/portfolioData";
import CopyEmailButton from "./CopyEmailButton";

export default function Contact() {
  return (
    <section className="contact" aria-labelledby="contact-title">
      <div className="contact__card">
        <span className="panel-pill panel-pill--accent">
          Disponible para proyectos
        </span>
        <h3 className="contact__title" id="contact-title">
          Trabajemos juntos
        </h3>
        <p className="contact__hint text text--grey">
          ¿Tienes una idea, producto digital o experiencia interactiva en mente?
          Escríbeme directo o explora mi código.
        </p>

        <div className="contact__links">
          <CopyEmailButton />
          <a
            className="cta-link contact__link contact__link--card"
            href={contact.githubUrl}
            target="_blank"
            rel="noopener noreferrer"
          >
            <span className="cta-link__label label-link">GitHub · Mag-Gonzalez</span>
            <span className="cta-link__icon label-link" aria-hidden="true">
              →
            </span>
          </a>
        </div>

        <div className="contact__meta">
          <div className="contact__meta-item">
            <span className="contact__meta-label">Ubicación</span>
            <span className="contact__meta-value">{profile.location}</span>
          </div>
          <div className="contact__meta-item">
            <span className="contact__meta-label">Especialidad</span>
            <span className="contact__meta-value">{profile.role}</span>
          </div>
        </div>
      </div>
    </section>
  );
}
