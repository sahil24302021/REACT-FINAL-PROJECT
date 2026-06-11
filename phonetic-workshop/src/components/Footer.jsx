import React from "react";
import { Link } from "react-router-dom";

export default function Footer() {
  return (
    <footer className="footer">
      <div className="footer-inner">
        <div className="footer-brand">
          <div className="footer-logo">
            <span className="logo-icon" style={{width:28,height:28,fontSize:14,borderRadius:6}}>◇</span>
            <span style={{fontFamily:"var(--font-heading)",fontWeight:700,fontSize:16}}>Phonetic Workshop</span>
          </div>
          <p className="footer-desc">
            Browser-based phonetics laboratory for accent and dialect training.
            Powered by Web Audio API and Web Speech API.
          </p>
        </div>

        <div className="footer-links-group">
          <h4 className="footer-heading">Navigate</h4>
          <Link to="/" className="footer-link">Home</Link>
          <Link to="/workshop" className="footer-link">Workshop</Link>
          <Link to="/progress" className="footer-link">Progress</Link>
          <Link to="/guide" className="footer-link">Guide</Link>
        </div>


      </div>

      <div className="footer-bottom">
        <p className="footer-text">
          Phonetic Workshop — Smart Dialect & Accent Training · 100% Client-Side Private
        </p>
      </div>
    </footer>
  );
}
