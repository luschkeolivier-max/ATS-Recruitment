import { useEffect, useState } from 'react';
import { Link, NavLink, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import '../styles/marketing.css';

const LINKS = [
  { to: '/employers', label: 'For Employers' },
  { to: '/talent', label: 'For Talent' },
  { to: '/about', label: 'About' },
  { to: '/contact', label: 'Contact' },
];

export default function MarketingLayout() {
  const [open, setOpen] = useState(false);
  const { user } = useAuth();
  const { pathname } = useLocation();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [pathname]);

  return (
    <div className="mk">
      <header className="mk-header">
        <div className="mk-container mk-header-inner">
          <Link to="/" className="mk-logo" aria-label="Voltra Global home">
            <img src="/logo-mark.png" alt="" />
            <span>Voltra Global</span>
          </Link>
          <button
            className="mk-menu-btn"
            aria-expanded={open}
            aria-controls="mk-nav"
            onClick={() => setOpen((o) => !o)}
          >
            {open ? 'Close' : 'Menu'}
          </button>
          <nav id="mk-nav" className={`mk-nav ${open ? 'is-open' : ''}`}>
            {LINKS.map((l) => (
              <NavLink key={l.to} to={l.to} className={({ isActive }) => (isActive ? 'active' : '')}>
                {l.label}
              </NavLink>
            ))}
            <Link to={user ? '/jobs' : '/login'} className="mk-nav-staff">
              {user ? 'Open ATS' : 'Staff login'}
            </Link>
            <Link to="/contact" className="mk-btn mk-btn-primary mk-btn-sm">
              Hire talent
            </Link>
          </nav>
        </div>
      </header>

      <main>
        <Outlet />
      </main>

      <footer className="mk-footer">
        <div className="mk-container mk-footer-grid">
          <div>
            <div className="mk-logo mk-logo-light">
              <img src="/logo-mark.png" alt="" />
              <span>Voltra Global</span>
            </div>
            <p className="mk-footer-tag">
              Offshore recruitment and staffing for US companies. Vetted talent, ready to work in
              your time zone.
            </p>
          </div>
          <div>
            <h4>Company</h4>
            <Link to="/employers">For Employers</Link>
            <Link to="/talent">For Talent</Link>
            <Link to="/about">About</Link>
            <Link to="/contact">Contact</Link>
          </div>
          <div>
            <h4>Get started</h4>
            <Link to="/contact">Request talent</Link>
            <Link to="/apply">Create a candidate profile</Link>
            <Link to="/login">Staff login</Link>
          </div>
        </div>
        <div className="mk-container mk-footer-bottom">
          <span>© {new Date().getFullYear()} Voltra Global. All rights reserved.</span>
        </div>
      </footer>
    </div>
  );
}
