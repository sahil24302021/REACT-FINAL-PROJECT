import React, { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";

export default function Navbar() {
  const location = useLocation();
  const path = location.pathname;
  const [menuOpen, setMenuOpen] = useState(false);

  // Close menu on route change
  useEffect(() => {
    setMenuOpen(false);
  }, [path]);

  // Close menu on resize above mobile
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth > 768) setMenuOpen(false);
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Prevent body scroll when menu open
  useEffect(() => {
    document.body.style.overflow = menuOpen ? "hidden" : "";
    return () => { document.body.style.overflow = ""; };
  }, [menuOpen]);

  return (
    <nav className="navbar">
      <div className="navbar-inner">
        <Link to="/" className="navbar-logo">
          <span className="logo-icon">◇</span>
          Phonetic Workshop
        </Link>

        {/* Desktop links */}
        <div className="navbar-links">
          <Link
            to="/workshop"
            className={`nav-link ${path === "/workshop" ? "active" : ""}`}
          >
            Workshop
          </Link>
          <Link
            to="/progress"
            className={`nav-link ${path === "/progress" ? "active" : ""}`}
          >
            Progress
          </Link>
          <Link
            to="/guide"
            className={`nav-link ${path === "/guide" ? "active" : ""}`}
          >
            Guide
          </Link>
          <Link to="/workshop" className="nav-cta">
            Start Training →
          </Link>
        </div>

        {/* Mobile hamburger */}
        <button
          className={`hamburger ${menuOpen ? "open" : ""}`}
          onClick={() => setMenuOpen(!menuOpen)}
          aria-label="Toggle navigation menu"
        >
          <span className="ham-line" />
          <span className="ham-line" />
          <span className="ham-line" />
        </button>
      </div>

      {/* Mobile overlay menu */}
      {menuOpen && <div className="mobile-backdrop" onClick={() => setMenuOpen(false)} />}
      <div className={`mobile-menu ${menuOpen ? "open" : ""}`}>
        <Link
          to="/workshop"
          className={`mobile-link ${path === "/workshop" ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M12 1a3 3 0 0 0-3 3v8a3 3 0 0 0 6 0V4a3 3 0 0 0-3-3z"/>
            <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
          </svg>
          Workshop
        </Link>
        <Link
          to="/progress"
          className={`mobile-link ${path === "/progress" ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M18 20V10M12 20V4M6 20v-6" />
          </svg>
          Progress
        </Link>
        <Link
          to="/guide"
          className={`mobile-link ${path === "/guide" ? "active" : ""}`}
        >
          <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round">
            <path d="M4 7h16M4 12h10M4 17h12"/>
            <circle cx="19" cy="17" r="3"/>
          </svg>
          Guide
        </Link>
        <Link to="/workshop" className="mobile-cta">
          Start Training →
        </Link>
      </div>
    </nav>
  );
}
