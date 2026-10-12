import { Link } from 'react-router-dom';
import { Icon, SectionHead, CtaBand } from './parts';

const SERVICES = [
  {
    icon: 'users',
    title: 'Direct hire placement',
    text: 'We source, screen and present vetted offshore candidates for permanent roles on your team.',
  },
  {
    icon: 'bolt',
    title: 'Dedicated remote teams',
    text: 'Build a full team in support, engineering, finance or operations without opening an office.',
  },
  {
    icon: 'clock',
    title: 'Contract & flex staffing',
    text: 'Scale up for a project or a busy season and scale back down without the overhead.',
  },
  {
    icon: 'shield',
    title: 'Employer of record',
    text: 'We can handle local contracts, payroll and compliance so your hires are set up properly.',
  },
];

const STEPS = [
  { n: '01', title: 'Tell us what you need', text: 'Share the roles, skills, hours and budget. We scope it with you on a short call.' },
  { n: '02', title: 'We source and vet', text: 'We search our talent network, review resumes, and screen on skills, English and fit.' },
  { n: '03', title: 'Meet your shortlist', text: 'Review video introductions and redacted profiles, then request interviews directly.' },
  { n: '04', title: 'Hire and onboard', text: 'Pick your people. We support onboarding, and stay on hand once they have started.' },
];

const ROLES = [
  'Customer support', 'Software engineering', 'Virtual assistants', 'Accounting & bookkeeping',
  'Sales development', 'Marketing & design', 'Data & operations', 'Healthcare admin',
];

const WHY = [
  { title: 'Cost savings that last', text: 'Access skilled professionals at a fraction of a typical US salary.' },
  { title: 'Time zone coverage', text: 'Talent that can work your hours, or extend your coverage past the US workday.' },
  { title: 'Transparent vetting', text: 'See a video introduction and a skills summary for every candidate before you commit.' },
  { title: 'One partner, no surprises', text: 'Clear pricing, one point of contact, and support after the hire.' },
];

export default function Home() {
  return (
    <>
      <section className="mk-hero">
        <div className="mk-container mk-hero-inner">
          <div className="mk-hero-copy">
            <span className="mk-eyebrow">Offshore recruitment for US companies</span>
            <h1>
              Hire world-class talent, <span className="mk-grad">powered up</span> and ready to work.
            </h1>
            <p className="mk-lead">
              Voltra Global finds, vets and places skilled offshore professionals with US businesses,
              so you can grow your team faster and for less.
            </p>
            <div className="mk-actions">
              <Link to="/contact" className="mk-btn mk-btn-primary">Request talent</Link>
              <Link to="/talent" className="mk-btn mk-btn-ghost">I'm looking for work</Link>
            </div>
            <ul className="mk-hero-points">
              <li>Vetted candidates</li>
              <li>Video introductions</li>
              <li>US time zone ready</li>
            </ul>
          </div>
          <div className="mk-hero-art" aria-hidden="true">
            <div className="mk-glow" />
            <img src="/logo-mark.png" alt="" />
          </div>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-container">
          <SectionHead
            eyebrow="What we do"
            title="Staffing solutions built around your team"
            text="Whether you need one specialist or an entire department, we match the engagement model to the way you work."
          />
          <div className="mk-grid mk-grid-4">
            {SERVICES.map((s) => (
              <article key={s.title} className="mk-card">
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-dark" id="how-it-works">
        <div className="mk-container">
          <SectionHead
            dark
            eyebrow="How it works"
            title="From brief to first day in four steps"
            text="A simple, transparent process so you always know where your search stands."
          />
          <ol className="mk-steps">
            {STEPS.map((s) => (
              <li key={s.n}>
                <span className="mk-step-n">{s.n}</span>
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      <section className="mk-section">
        <div className="mk-container mk-split">
          <div>
            <SectionHead
              left
              eyebrow="Roles we fill"
              title="Talent across the functions you need"
              text="We recruit for a wide range of remote roles. Don't see yours? Ask us, we'll source it."
            />
            <Link to="/employers" className="mk-link">See how we work with employers →</Link>
          </div>
          <div className="mk-chips">
            {ROLES.map((r) => (
              <span key={r} className="mk-chip">{r}</span>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-tint">
        <div className="mk-container">
          <SectionHead
            eyebrow="Why Voltra Global"
            title="The advantages of going offshore, without the guesswork"
          />
          <div className="mk-grid mk-grid-2">
            {WHY.map((w) => (
              <div key={w.title} className="mk-why">
                <span className="mk-tick"><Icon name="check" small /></span>
                <div>
                  <h3>{w.title}</h3>
                  <p>{w.text}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Ready to build your offshore team?"
        text="Tell us about the roles you're hiring for and we'll come back with a plan."
        primary={{ to: '/contact', label: 'Request talent' }}
        secondary={{ to: '/apply', label: 'Create a candidate profile' }}
      />
    </>
  );
}
