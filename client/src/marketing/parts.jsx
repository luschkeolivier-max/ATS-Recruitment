import { Link } from 'react-router-dom';

const PATHS = {
  users: 'M16 11a4 4 0 1 0-8 0 4 4 0 0 0 8 0Zm-12 9a8 8 0 0 1 16 0',
  bolt: 'M13 2 4 14h7l-1 8 9-12h-7l1-8Z',
  clock: 'M12 7v5l3 2m6-2a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z',
  shield: 'M12 3 5 6v5c0 4.5 3 8 7 10 4-2 7-5.5 7-10V6l-7-3Zm-3 9 2 2 4-4',
  check: 'm5 12 5 5 9-10',
  globe: 'M12 3a9 9 0 1 0 0 18 9 9 0 0 0 0-18Zm-9 9h18M12 3c2.5 2.5 3.5 5.5 3.5 9s-1 6.5-3.5 9c-2.5-2.5-3.5-5.5-3.5-9s1-6.5 3.5-9Z',
  video: 'M4 7h10a2 2 0 0 1 2 2v6a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2V9a2 2 0 0 1 2-2Zm14 3 4-2v8l-4-2',
  doc: 'M7 3h7l5 5v13H7V3Zm7 0v5h5M10 13h6M10 17h6',
};

export function Icon({ name, small }) {
  return (
    <svg
      className={small ? 'mk-icon mk-icon-sm' : 'mk-icon'}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      <path d={PATHS[name]} />
    </svg>
  );
}

export function SectionHead({ eyebrow, title, text, left, dark }) {
  return (
    <div className={`mk-head ${left ? 'is-left' : ''} ${dark ? 'is-dark' : ''}`}>
      {eyebrow && <span className="mk-eyebrow">{eyebrow}</span>}
      <h2>{title}</h2>
      {text && <p>{text}</p>}
    </div>
  );
}

export function PageHero({ eyebrow, title, text, children }) {
  return (
    <section className="mk-page-hero">
      <div className="mk-container">
        <span className="mk-eyebrow">{eyebrow}</span>
        <h1>{title}</h1>
        <p className="mk-lead">{text}</p>
        {children}
      </div>
    </section>
  );
}

export function CtaBand({ title, text, primary, secondary }) {
  return (
    <section className="mk-cta">
      <div className="mk-container mk-cta-inner">
        <div>
          <h2>{title}</h2>
          <p>{text}</p>
        </div>
        <div className="mk-actions">
          <Link to={primary.to} className="mk-btn mk-btn-primary">{primary.label}</Link>
          {secondary && (
            <Link to={secondary.to} className="mk-btn mk-btn-ghost">{secondary.label}</Link>
          )}
        </div>
      </div>
    </section>
  );
}
