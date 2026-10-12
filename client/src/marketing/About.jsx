import { PageHero, SectionHead, CtaBand } from './parts';

const VALUES = [
  { title: 'Quality over volume', text: 'We would rather show you three right people than thirty maybes.' },
  { title: 'Transparency', text: 'Clear process, clear pricing, and candidates you can actually see before you hire.' },
  { title: 'Respect for talent', text: 'Great offshore professionals deserve fair roles and honest communication.' },
];

export default function About() {
  return (
    <>
      <PageHero
        eyebrow="About us"
        title="Bridging US businesses and global talent"
        text="Voltra Global is a recruitment and staffing agency that sources skilled professionals offshore and places them with US companies."
      />
      <section className="mk-section">
        <div className="mk-container mk-narrow mk-prose">
          <h2>Why we exist</h2>
          <p>
            US companies are competing for a limited pool of local talent at rising cost, while
            highly capable professionals elsewhere in the world lack access to those opportunities.
            We built Voltra Global to connect the two, with a hiring process that is fast, vetted
            and transparent.
          </p>
          <p>
            Our own applicant tracking platform lets us manage every candidate from first contact
            to placement, and gives your team a clean, redacted view of each candidate so you can
            decide with confidence.
          </p>
        </div>
      </section>
      <section className="mk-section mk-section-tint">
        <div className="mk-container">
          <SectionHead eyebrow="What we value" title="How we work" />
          <div className="mk-grid mk-grid-3">
            {VALUES.map((v) => (
              <article key={v.title} className="mk-card mk-card-plain">
                <h3>{v.title}</h3>
                <p>{v.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>
      <CtaBand
        title="Let's talk about your hiring needs"
        text="We'd love to learn about your team."
        primary={{ to: '/contact', label: 'Contact us' }}
      />
    </>
  );
}
