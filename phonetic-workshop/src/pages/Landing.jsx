import React from "react";
import { Link } from "react-router-dom";
import { useReveal, useStaggerReveal } from "../hooks/useReveal";

/* ── Inline SVG Icon Components ───────────────────── */
const IconWave = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-svg">
    <path d="M12 2v20M6 6v12M18 6v12M3 10v4M21 10v4M9 4v16M15 4v16" />
  </svg>
);

const IconGlobe = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-svg">
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10" />
  </svg>
);

const IconChart = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-svg">
    <path d="M18 20V10M12 20V4M6 20v-6" />
  </svg>
);

const IconIpa = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-svg">
    <path d="M4 7h16M4 12h10M4 17h12" />
    <circle cx="19" cy="17" r="3" />
  </svg>
);

const IconShield = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-svg">
    <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
  </svg>
);

const IconHeadphones = () => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className="icon-svg">
    <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
    <path d="M21 19a2 2 0 0 1-2 2h-1a2 2 0 0 1-2-2v-3a2 2 0 0 1 2-2h3zM3 19a2 2 0 0 0 2 2h1a2 2 0 0 0 2-2v-3a2 2 0 0 0-2-2H3z" />
  </svg>
);

const CheckSvg = () => (
  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round">
    <path d="M20 6L9 17l-5-5" />
  </svg>
);

export default function Landing() {
  /* Scroll-reveal refs */
  const [featuresRef, featuresVisible] = useReveal();
  const featuresGridRef = useStaggerReveal(100);
  const [howRef, howVisible] = useReveal();
  const stepsGridRef = useStaggerReveal(120);
  const [testimonialsRef, testimonialsVisible] = useReveal();
  const testimonialsGridRef = useStaggerReveal(150);
  const [ctaRef, ctaVisible] = useReveal();

  /* Scroll handler for anchor links */
  const scrollToFeatures = (e) => {
    e.preventDefault();
    document.getElementById('features')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  /* Animated waveform bars — 40 bars for performance */
  const bars = Array.from({ length: 40 }, (_, i) => {
    const height = 20 + Math.sin(i * 0.3) * 40 + Math.random() * 30;
    const delay = i * 0.03;
    return (
      <div
        key={i}
        className="wave-bar"
        style={{ height: `${height}px`, animationDelay: `${delay}s` }}
      />
    );
  });

  return (
    <div className="landing-page">
      {/* ── Hero ─────────────────────────────────────── */}
      <section className="hero">
        <div className="hero-badge">
          <span className="badge-dot" />
          100% Private — All Processing Happens in Your Browser
        </div>

        <h1>
          Master Any English
          <br />
          <span className="gradient-text">Accent & Dialect</span>
        </h1>

        <p className="hero-subtitle">
          A browser-based phonetics laboratory that analyzes your pronunciation
          in real-time using FFT spectral analysis, IPA tokenization, and
          acoustic correlation matching. No servers, no uploads — just you and
          your microphone.
        </p>

        <div className="hero-actions">
          <Link to="/workshop" className="btn-primary">
            Start Training →
          </Link>
          <button onClick={scrollToFeatures} className="btn-secondary">
            Learn How It Works
          </button>
        </div>

        <div className="hero-visual">
          <div className="hero-waveform">{bars}</div>
        </div>
      </section>

      {/* ── Trust Bar ────────────────────────────────── */}
      <section className="trust-section">
        <div className="trust-inner">
          <div className="trust-item">
            <div className="trust-check"><CheckSvg /></div>
            <span>No sign-up required</span>
          </div>
          <div className="trust-item">
            <div className="trust-check"><CheckSvg /></div>
            <span>Zero data leaves your device</span>
          </div>
          <div className="trust-item">
            <div className="trust-check"><CheckSvg /></div>
            <span>Works offline after first load</span>
          </div>
          <div className="trust-item">
            <div className="trust-check"><CheckSvg /></div>
            <span>Built with Web Audio API</span>
          </div>
        </div>
      </section>

      {/* ── Features ─────────────────────────────────── */}
      <section className="features-section" id="features">
        <div ref={featuresRef} className={`section-header reveal ${featuresVisible ? "revealed" : ""}`}>
          <div className="section-overline">Features</div>
          <h2 className="section-title">
            Everything You Need for Accent Training
          </h2>
          <p className="section-subtitle">
            Professional-grade phonetic analysis tools, right in your browser. No
            installations, no accounts, no data leaves your device.
          </p>
        </div>

        <div className="features-grid" ref={featuresGridRef}>
          <div className="feature-card reveal-child">
            <div className="feature-icon purple"><IconWave /></div>
            <h3>Real-Time FFT Analysis</h3>
            <p>
              Your microphone audio is piped through a native Web Audio
              AnalyserNode that performs Fast Fourier Transform analysis at 60
              frames per second, extracting live frequency and amplitude data
              instantly.
            </p>
          </div>

          <div className="feature-card reveal-child">
            <div className="feature-icon green"><IconGlobe /></div>
            <h3>3 English Dialects</h3>
            <p>
              Train with General American (en-US), Received Pronunciation
              (en-GB), and Australian English (en-AU). Each dialect has unique
              IPA mappings and reference formant signatures for accurate
              comparison.
            </p>
          </div>

          <div className="feature-card reveal-child">
            <div className="feature-icon orange"><IconChart /></div>
            <h3>Pearson Correlation Scoring</h3>
            <p>
              Your live waveform is compared against pre-computed dialect
              reference frequency patterns using the Pearson Correlation
              Coefficient, giving you a scientific accuracy score for every
              attempt.
            </p>
          </div>

          <div className="feature-card reveal-child">
            <div className="feature-icon purple"><IconIpa /></div>
            <h3>IPA Token Matrix</h3>
            <p>
              Every word is broken down into individual phoneme tiles showing
              both the letter and its IPA symbol. After recording, each tile
              is color-coded to show which sounds you nailed and which need work.
            </p>
          </div>

          <div className="feature-card reveal-child">
            <div className="feature-icon green"><IconShield /></div>
            <h3>100% Client-Side Private</h3>
            <p>
              All audio processing happens entirely in your browser using the
              Web Audio API. No audio data is ever sent to any server. Your
              privacy is architecturally guaranteed.
            </p>
          </div>

          <div className="feature-card reveal-child">
            <div className="feature-icon orange"><IconHeadphones /></div>
            <h3>Speech Recognition</h3>
            <p>
              Built-in Web Speech API integration listens to what you say and
              transcribes it in real-time. The transcription is compared against
              the target phrase for textual accuracy feedback.
            </p>
          </div>
        </div>
      </section>

      {/* ── How It Works ─────────────────────────────── */}
      <section className="how-section">
        <div className="how-grid">
          <div ref={howRef} className={`section-header reveal ${howVisible ? "revealed" : ""}`}>
            <div className="section-overline">How It Works</div>
            <h2 className="section-title">Three Simple Steps</h2>
            <p className="section-subtitle">
              Start improving your pronunciation in under a minute.
            </p>
          </div>

          <div className="steps-container" ref={stepsGridRef}>
            <div className="step-card reveal-child">
              <div className="step-number">1</div>
              <h3>Choose Your Target</h3>
              <p>
                Select the English dialect you want to practice — American,
                British, or Australian — and pick a training phrase from our
                curated library.
              </p>
            </div>
            <div className="step-card reveal-child">
              <div className="step-number">2</div>
              <h3>Speak & Record</h3>
              <p>
                Click the record button and speak the phrase. Your audio is
                analyzed in real-time — you'll see the waveform animate as you
                talk.
              </p>
            </div>
            <div className="step-card reveal-child">
              <div className="step-number">3</div>
              <h3>Get Instant Feedback</h3>
              <p>
                See your accuracy score, per-phoneme breakdown, and where your
                pronunciation drifts from the target accent pattern.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ── Testimonials ─────────────────────────────── */}
      <section className="testimonials-section">
        <div ref={testimonialsRef} className={`section-header reveal ${testimonialsVisible ? "revealed" : ""}`}>
          <div className="section-overline">What Users Say</div>
          <h2 className="section-title">Built for Real Learners</h2>
          <p className="section-subtitle">
            Used by language students, accent coaches, and phonetics researchers.
          </p>
        </div>

        <div className="testimonials-grid" ref={testimonialsGridRef}>
          <div className="testimonial-card reveal-child">
            <p className="tc-quote">
              "The IPA token matrix is brilliant — I can finally see exactly which
              sounds I'm mispronouncing instead of just getting a vague score."
            </p>
            <div className="tc-author">
              <div className="tc-avatar">PK</div>
              <div>
                <div className="tc-name">Priya K.</div>
                <div className="tc-role">ESL Student, Mumbai</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card reveal-child">
            <p className="tc-quote">
              "I use this with my students for accent reduction. The FFT visualization
              makes abstract phonetics concepts tangible and visual."
            </p>
            <div className="tc-author">
              <div className="tc-avatar">JM</div>
              <div>
                <div className="tc-name">Dr. James Morton</div>
                <div className="tc-role">Linguistics Professor, UCL</div>
              </div>
            </div>
          </div>

          <div className="testimonial-card reveal-child">
            <p className="tc-quote">
              "Love that everything runs in the browser. No account, no uploads,
              no privacy concerns. Just open the page and start training."
            </p>
            <div className="tc-author">
              <div className="tc-avatar">SL</div>
              <div>
                <div className="tc-name">Sarah Liu</div>
                <div className="tc-role">Voice Coach, Sydney</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Stats Bar ────────────────────────────────── */}
      <section className="stats-bar">
        <div className="stats-inner">
          <div className="stat-item">
            <span className="stat-value">15+</span>
            <span className="stat-label">Training Phrases</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">3</span>
            <span className="stat-label">English Dialects</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">60fps</span>
            <span className="stat-label">Real-Time FFT</span>
          </div>
          <div className="stat-item">
            <span className="stat-value">100%</span>
            <span className="stat-label">Client-Side Private</span>
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────── */}
      <section ref={ctaRef} className={`cta-section reveal ${ctaVisible ? "revealed" : ""}`}>
        <div className="cta-card">
          <h2 className="cta-title">Ready to Perfect Your Accent?</h2>
          <p className="cta-subtitle">
            No sign-up required. Open the workshop and start training immediately.
          </p>
          <Link to="/workshop" className="btn-primary btn-lg">
            Open the Workshop →
          </Link>
        </div>
      </section>
    </div>
  );
}
