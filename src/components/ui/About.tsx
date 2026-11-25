import { profile, stack } from "@/data/portfolioData";

export default function About() {
  return (
    <section className="about" aria-labelledby="about-title">
      <p className="about__eyebrow label-link">
        {profile.role} · {profile.location}
      </p>
      <h3 className="about__title title" id="about-title">
        {profile.name}
      </h3>
      <div className="about__description text text--grey">
        {profile.bio.map((paragraph) => (
          <p key={paragraph}>{paragraph}</p>
        ))}
      </div>

      <div className="stack" aria-labelledby="stack-title">
        <h4 className="stack__title" id="stack-title">
          Stack
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
    </section>
  );
}
