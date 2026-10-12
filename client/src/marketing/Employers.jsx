import { Link } from 'react-router-dom';
import { Icon, PageHero, SectionHead, CtaBand } from './parts';

const FEATURES = [
  { icon: 'video', title: 'Video introductions', text: 'Hear how each candidate communicates before you spend time on an interview.' },
  { icon: 'doc', title: 'Redacted profiles', text: 'Every candidate comes with a clear summary of skills and achievements, in a shareable link for your hiring managers.' },
  { icon: 'clock', title: 'Interview on your schedule', text: 'Request an interview slot straight from a candidate profile. We confirm it with the candidate.' },
  { icon: 'globe', title: 'Offshore, not out of touch', text: 'English-proficient professionals comfortable working US hours and US tools.' },
];

const MODELS = [
  { title: 'Direct hire', text: 'You hire the person, we find them. Ideal for long-term roles that become part of your core team.' },
  { title: 'Dedicated team', text: 'A group of professionals working exclusively for you, managed day to day by your leaders.' },
  { title: 'Contract / project', text: 'Flexible capacity for a defined scope or season, with a simple path to convert to permanent.' },
];

export default function Employers() {
  return (
    <>
      <PageHero
        eyebrow="For employers"
        title="Fill roles faster, with people you've seen and vetted"
        text="Skip the endless resume pile. We bring you a shortlist of screened offshore candidates, each with a video introduction and skills summary."
      >
        <div className="mk-actions">
          <Link to="/contact" className="mk-btn mk-btn-primary">Request talent</Link>
        </div>
      </PageHero>

      <section className="mk-section">
        <div className="mk-container">
          <SectionHead eyebrow="What you get" title="A hiring process designed for confidence" />
          <div className="mk-grid mk-grid-4">
            {FEATURES.map((f) => (
              <article key={f.title} className="mk-card">
                <Icon name={f.icon} />
                <h3>{f.title}</h3>
                <p>{f.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-tint">
        <div className="mk-container">
          <SectionHead
            eyebrow="Engagement models"
            title="Choose how you want to work with us"
            text="We'll recommend the model that fits your goals, then price it clearly up front."
          />
          <div className="mk-grid mk-grid-3">
            {MODELS.map((m) => (
              <article key={m.title} className="mk-card mk-card-plain">
                <h3>{m.title}</h3>
                <p>{m.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <CtaBand
        title="Tell us who you're looking for"
        text="Share the role, the skills and the timeline. We'll reply with next steps."
        primary={{ to: '/contact', label: 'Request talent' }}
      />
    </>
  );
}
