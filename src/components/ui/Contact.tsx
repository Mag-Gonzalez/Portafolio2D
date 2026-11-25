import { contact } from "@/data/portfolioData";
import CopyEmailButton from "./CopyEmailButton";

export default function Contact() {
  return (
    <section className="contact" aria-labelledby="contact-title">
      <h3 className="contact__title" id="contact-title">
        Trabajemos juntos
      </h3>
      <p className="contact__hint text text--grey">
        ¿Tienes una idea en mente? Escríbeme o copia mi correo.
      </p>
      <div className="contact__links">
        <a
          className="cta-link contact__link"
          href={contact.githubUrl}
          target="_blank"
          rel="noopener noreferrer"
        >
          <span className="cta-link__label label-link">GitHub</span>
          <span className="cta-link__icon label-link" aria-hidden="true">
            →
          </span>
        </a>
        <CopyEmailButton />
      </div>
    </section>
  );
}
