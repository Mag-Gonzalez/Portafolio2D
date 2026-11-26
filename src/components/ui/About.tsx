import { profile, stack } from "@/data/portfolioData";

export default function About() {
  return (
    <section className="about" aria-labelledby="about-title">
      <div className="about__layout">
        <div className="about__main">
          <div className="about__badges">
            <span className="panel-pill panel-pill--accent">{profile.role}</span>
            <span className="panel-pill">{profile.location}</span>
          </div>
          <h3 className="about__title title" id="about-title">
            {profile.name}
          </h3>
          <div className="about__description text text--grey">
            {profile.bio.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </div>

        <div className="stack" aria-labelledby="stack-title">
          <h4 className="stack__title" id="stack-title">
            Stack tecnológico
          </h4>
          <div className="stack__groups">
            {stack.map((group) => (
              <div className="stack__group" key={group.category}>
                <h5 className="stack__category">{group.category}</h5>
                <ul className="stack__items">
                  {group.items.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
