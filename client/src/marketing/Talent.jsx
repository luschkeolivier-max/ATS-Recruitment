import { Link } from 'react-router-dom';
import { Icon, PageHero, SectionHead, CtaBand } from './parts';

const STEPS = [
  { icon: 'doc', title: 'Create your profile', text: 'Share your details, upload your resume and add your LinkedIn and WhatsApp.' },
  { icon: 'video', title: 'Record a video introduction', text: 'Show employers who you are. A short video sets you apart from every other resume.' },
  { icon: 'users', title: 'Get matched', text: 'Our recruiters review your profile and put you forward for roles with US companies.' },
];

export default function Talent() {
  return (
    <>
      <PageHero
        eyebrow="For talent"
        title="Your next role could be with a US company"
        text="Voltra Global connects skilled professionals around the world with US businesses hiring remotely. Create your profile once and let us put you in front of employers."
      >
        <div className="mk-actions">
          <Link to="/apply" className="mk-btn mk-btn-primary">Create your profile</Link>
        </div>
      </PageHero>

      <section className="mk-section">
        <div className="mk-container">
          <SectionHead eyebrow="How it works" title="Three steps to get in front of employers" />
          <div className="mk-grid mk-grid-3">
            {STEPS.map((s) => (
              <article key={s.title} className="mk-card">
                <Icon name={s.icon} />
                <h3>{s.title}</h3>
                <p>{s.text}</p>
              </article>
            ))}
          </div>
        </div>
      </section>

      <section className="mk-section mk-section-tint">
        <div className="mk-container mk-narrow">
          <SectionHead
            eyebrow="Your privacy"
            title="Employers see your work, not your contact details"
            text="When we share your profile with a hiring manager, we show your first name, video, skills and achievements. Your contact details stay with us, and we arrange interviews for you."
          />
        </div>
      </section>

      <CtaBand
        title="Ready to be seen?"
        text="It takes a few minutes to create your profile."
        primary={{ to: '/apply', label: 'Create your profile' }}
      />
    </>
  );
}
