import React, { useState, useRef, useEffect } from "react";

const LANGUAGES = ["Hindi", "English", "Tamil", "Telugu", "Malayalam"];
const MOODS = [
  { label: "Neutral", emoji: "😐" },
  { label: "Happy", emoji: "😊" },
  { label: "Sad", emoji: "😢" },
  { label: "Angry", emoji: "😠" },
  { label: "Calm", emoji: "😌" },
  { label: "Excited", emoji: "🤩" },
];
const AGES = ["Child", "Young", "Adult", "Elderly"];

export default function VoiceForge() {
  const [text, setText] = useState("");
  const [language, setLanguage] = useState("Hindi");
  const [gender, setGender] = useState("male");
  const [age, setAge] = useState("Young");
  const [mood, setMood] = useState("Neutral");
  const [loading, setLoading] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const progressRef = useRef(null);

  const words = text.trim() ? text.trim().split(/\s+/).length : 0;
  const chars = text.length;

  useEffect(() => {
    let interval;
    if (playing) {
      interval = setInterval(() => {
        setProgress((p) => {
          if (p >= 100) { setPlaying(false); return 0; }
          return p + 0.8;
        });
      }, 50);
    }
    return () => clearInterval(interval);
  }, [playing]);

  const handleGenerate = () => {
    if (!text.trim()) return;
    setLoading(true);
    setGenerated(false);
    setProgress(0);
    setTimeout(() => {
      setLoading(false);
      setGenerated(true);
    }, 2500);
  };

  return (
    <>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&family=Plus+Jakarta+Sans:wght@600;700;800&display=swap');

        * { box-sizing: border-box; margin: 0; padding: 0; }

        .vf-root {
          min-height: 100vh;
          font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
          background: #0a0a0a;
          color: #e5e5e7;
          -webkit-font-smoothing: antialiased;
          -moz-osx-font-smoothing: grayscale;
        }

        .vf-root ::selection {
          background: rgba(100, 143, 255, 0.25);
          color: #fff;
        }

        /* ── Ambient Background ── */
        .vf-ambient {
          position: fixed; inset: 0; z-index: 0; pointer-events: none;
          background:
            radial-gradient(ellipse 80% 50% at 50% -10%, rgba(56, 62, 90, 0.35) 0%, transparent 60%),
            radial-gradient(circle at 20% 80%, rgba(30, 40, 70, 0.15) 0%, transparent 40%),
            radial-gradient(circle at 85% 70%, rgba(40, 45, 65, 0.12) 0%, transparent 35%);
        }

        /* ── Navigation ── */
        .vf-nav {
          position: sticky; top: 0; z-index: 100;
          backdrop-filter: saturate(180%) blur(20px);
          -webkit-backdrop-filter: saturate(180%) blur(20px);
          background: rgba(10, 10, 10, 0.72);
          border-bottom: 0.5px solid rgba(255,255,255,0.08);
        }
        .vf-nav-inner {
          max-width: 1200px; margin: 0 auto;
          padding: 0 24px; height: 52px;
          display: flex; align-items: center; justify-content: space-between;
        }
        .vf-logo {
          display: flex; align-items: center; gap: 10px;
        }
        .vf-logo-icon {
          width: 28px; height: 28px; border-radius: 7px;
          background: linear-gradient(135deg, #86868b 0%, #d2d2d7 50%, #86868b 100%);
          display: flex; align-items: center; justify-content: center;
          box-shadow: 0 1px 3px rgba(0,0,0,0.5), inset 0 1px 0 rgba(255,255,255,0.15);
        }
        .vf-logo-icon span {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 800; font-size: 15px; color: #1d1d1f;
        }
        .vf-logo-text {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-weight: 700; font-size: 17px; letter-spacing: -0.3px;
          color: #f5f5f7;
        }
        .vf-nav-links {
          display: flex; align-items: center; gap: 24px;
        }
        .vf-nav-links a {
          font-size: 12px; font-weight: 500; color: #86868b;
          text-decoration: none; transition: color 0.2s;
        }
        .vf-nav-links a:hover { color: #f5f5f7; }
        .vf-nav-btn {
          font-size: 11px; font-weight: 600; color: #f5f5f7;
          background: rgba(255,255,255,0.08);
          border: 0.5px solid rgba(255,255,255,0.12);
          padding: 6px 16px; border-radius: 980px;
          cursor: pointer; transition: all 0.2s;
        }
        .vf-nav-btn:hover { background: rgba(255,255,255,0.14); }

        /* ── Layout ── */
        .vf-main {
          position: relative; z-index: 1;
          max-width: 1200px; margin: 0 auto;
          padding: 48px 24px 80px;
          display: grid; grid-template-columns: 1fr; gap: 24px;
        }
        @media (min-width: 1024px) {
          .vf-main { grid-template-columns: 7fr 5fr; }
        }

        /* ── Glass Cards ── */
        .vf-card {
          background: rgba(28, 28, 30, 0.55);
          backdrop-filter: blur(40px);
          -webkit-backdrop-filter: blur(40px);
          border: 0.5px solid rgba(255,255,255,0.06);
          border-radius: 18px;
          box-shadow:
            0 0 0 0.5px rgba(255,255,255,0.04),
            0 2px 8px rgba(0,0,0,0.3),
            0 12px 40px rgba(0,0,0,0.15);
          overflow: hidden;
          transition: box-shadow 0.3s ease, border-color 0.3s ease;
        }
        .vf-card:hover {
          border-color: rgba(255,255,255,0.1);
          box-shadow:
            0 0 0 0.5px rgba(255,255,255,0.06),
            0 4px 16px rgba(0,0,0,0.35),
            0 16px 48px rgba(0,0,0,0.2);
        }

        /* ── Editor ── */
        .vf-editor-header {
          padding: 14px 20px;
          display: flex; justify-content: space-between; align-items: center;
          border-bottom: 0.5px solid rgba(255,255,255,0.05);
          background: rgba(255,255,255,0.015);
        }
        .vf-editor-label {
          font-size: 11px; font-weight: 600;
          letter-spacing: 0.8px; text-transform: uppercase;
          color: #636366;
        }
        .vf-model-badge {
          font-size: 10px; font-weight: 600;
          padding: 3px 10px; border-radius: 6px;
          background: rgba(100, 143, 255, 0.08);
          border: 0.5px solid rgba(100, 143, 255, 0.15);
          color: #648fff;
          letter-spacing: 0.5px;
        }
        .vf-textarea {
          width: 100%; height: 240px;
          background: transparent;
          border: none; outline: none; resize: none;
          padding: 24px;
          font-family: 'Inter', sans-serif;
          font-size: 16px; line-height: 1.75;
          color: #e5e5e7;
          caret-color: #648fff;
        }
        .vf-textarea::placeholder { color: #3a3a3c; }
        .vf-editor-footer {
          padding: 12px 20px;
          display: flex; justify-content: space-between; align-items: center;
          border-top: 0.5px solid rgba(255,255,255,0.04);
          background: rgba(255,255,255,0.01);
        }
        .vf-stat {
          font-size: 10px; font-weight: 600;
          letter-spacing: 1.2px; color: #48484a;
          display: flex; gap: 16px;
        }

        /* ── Controls Row ── */
        .vf-controls-row {
          display: grid; grid-template-columns: 1fr 1fr; gap: 12px;
        }
        .vf-control-card { padding: 16px 18px; }
        .vf-control-label {
          font-size: 10px; font-weight: 700;
          letter-spacing: 1.2px; text-transform: uppercase;
          color: #636366; margin-bottom: 10px;
        }
        .vf-select {
          width: 100%;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
          padding: 9px 14px;
          font-family: 'Inter', sans-serif;
          font-size: 13px; font-weight: 500;
          color: #e5e5e7;
          appearance: none; outline: none; cursor: pointer;
          transition: border-color 0.2s, background 0.2s;
          background-image: url("data:image/svg+xml,%3Csvg width='10' height='6' viewBox='0 0 10 6' fill='none' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath d='M1 1L5 5L9 1' stroke='%23636366' stroke-width='1.5' stroke-linecap='round' stroke-linejoin='round'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 12px center;
        }
        .vf-select:hover { background: rgba(255,255,255,0.06); border-color: rgba(255,255,255,0.14); }
        .vf-select:focus { border-color: rgba(100,143,255,0.4); box-shadow: 0 0 0 3px rgba(100,143,255,0.08); }
        .vf-select option { background: #1c1c1e; color: #e5e5e7; }

        .vf-toggle-group {
          display: flex; padding: 3px;
          background: rgba(255,255,255,0.04);
          border: 0.5px solid rgba(255,255,255,0.08);
          border-radius: 10px;
        }
        .vf-toggle-btn {
          flex: 1; padding: 8px 0;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          text-transform: capitalize;
          border: none; cursor: pointer;
          border-radius: 8px;
          transition: all 0.25s ease;
          background: transparent; color: #636366;
        }
        .vf-toggle-btn.active {
          background: linear-gradient(135deg, #e5e5e7, #d2d2d7);
          color: #1d1d1f;
          box-shadow: 0 1px 4px rgba(0,0,0,0.3), 0 0 1px rgba(255,255,255,0.15);
        }
        .vf-toggle-btn:not(.active):hover { color: #a1a1a3; }

        /* ── Right Panel ── */
        .vf-settings-title {
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700; color: #f5f5f7;
          display: flex; align-items: center; gap: 8px;
          margin-bottom: 24px;
        }
        .vf-pulse-dot {
          width: 6px; height: 6px; border-radius: 50%;
          background: #648fff;
          box-shadow: 0 0 8px rgba(100,143,255,0.5);
          animation: vf-pulse 2s ease-in-out infinite;
        }
        @keyframes vf-pulse {
          0%, 100% { opacity: 1; transform: scale(1); }
          50% { opacity: 0.5; transform: scale(0.8); }
        }

        /* ── Mood Grid ── */
        .vf-mood-grid {
          display: grid; grid-template-columns: repeat(3, 1fr); gap: 8px;
        }
        .vf-mood-btn {
          display: flex; flex-direction: column;
          align-items: center; justify-content: center;
          padding: 14px 8px;
          border-radius: 14px;
          border: 0.5px solid rgba(255,255,255,0.06);
          background: rgba(255,255,255,0.02);
          cursor: pointer; transition: all 0.25s ease;
          font-family: 'Inter', sans-serif;
        }
        .vf-mood-btn:hover {
          background: rgba(255,255,255,0.05);
          border-color: rgba(255,255,255,0.12);
          transform: translateY(-1px);
        }
        .vf-mood-btn.active {
          background: rgba(100,143,255,0.06);
          border-color: rgba(100,143,255,0.25);
          box-shadow: 0 0 20px rgba(100,143,255,0.06);
        }
        .vf-mood-emoji { font-size: 22px; margin-bottom: 4px; }
        .vf-mood-label {
          font-size: 9px; font-weight: 700;
          letter-spacing: 0.8px; text-transform: uppercase;
          color: #636366;
        }
        .vf-mood-btn.active .vf-mood-label { color: #648fff; }

        /* ── Age Pills ── */
        .vf-age-row { display: flex; flex-wrap: wrap; gap: 8px; }
        .vf-age-pill {
          padding: 8px 18px; border-radius: 980px;
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          border: 0.5px solid rgba(255,255,255,0.08);
          background: transparent; color: #86868b;
          cursor: pointer; transition: all 0.25s ease;
        }
        .vf-age-pill:hover {
          border-color: rgba(255,255,255,0.2);
          color: #d2d2d7;
        }
        .vf-age-pill.active {
          background: linear-gradient(135deg, #e5e5e7, #c7c7cc);
          border-color: transparent;
          color: #1d1d1f;
          box-shadow: 0 1px 6px rgba(0,0,0,0.3);
        }

        /* ── Generate Button ── */
        .vf-generate {
          width: 100%; padding: 16px;
          border: none; border-radius: 14px;
          font-family: 'Plus Jakarta Sans', sans-serif;
          font-size: 14px; font-weight: 700;
          letter-spacing: -0.2px;
          cursor: pointer; transition: all 0.3s ease;
          position: relative; overflow: hidden;
        }
        .vf-generate.ready {
          background: linear-gradient(135deg, #d2d2d7 0%, #f5f5f7 50%, #d2d2d7 100%);
          background-size: 200% 200%;
          animation: vf-shimmer 3s ease infinite;
          color: #1d1d1f;
          box-shadow: 0 2px 12px rgba(210,210,215,0.15), 0 0 1px rgba(255,255,255,0.3);
        }
        .vf-generate.ready:hover {
          box-shadow: 0 4px 20px rgba(210,210,215,0.25), 0 0 1px rgba(255,255,255,0.5);
          transform: scale(1.005);
        }
        .vf-generate.ready:active { transform: scale(0.98); }
        .vf-generate.disabled {
          background: rgba(255,255,255,0.04);
          color: #48484a; cursor: not-allowed;
        }

        @keyframes vf-shimmer {
          0% { background-position: 200% 0%; }
          100% { background-position: -200% 0%; }
        }

        .vf-spinner {
          display: inline-block;
          width: 16px; height: 16px;
          border: 2px solid rgba(0,0,0,0.15);
          border-top-color: #1d1d1f;
          border-radius: 50%;
          animation: vf-spin 0.7s linear infinite;
          margin-right: 10px; vertical-align: middle;
        }
        @keyframes vf-spin { to { transform: rotate(360deg); } }

        /* ── Audio Player ── */
        .vf-player {
          transition: opacity 0.5s ease, transform 0.5s ease;
        }
        .vf-player.hidden { opacity: 0.3; transform: translateY(8px); pointer-events: none; }
        .vf-player.visible { opacity: 1; transform: translateY(0); }

        .vf-player-header {
          display: flex; justify-content: space-between; align-items: center;
          margin-bottom: 20px;
        }
        .vf-player-label {
          font-size: 11px; font-weight: 700;
          letter-spacing: 1px; text-transform: uppercase;
          color: #636366;
        }
        .vf-player-quality {
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 10px; font-weight: 500;
          color: #648fff;
        }

        /* Waveform */
        .vf-waveform {
          display: flex; align-items: flex-end;
          gap: 2px; height: 48px; margin-bottom: 20px;
        }
        .vf-wave-bar {
          flex: 1; border-radius: 2px;
          transition: height 0.3s ease, opacity 0.3s ease;
        }
        .vf-wave-bar.idle {
          background: linear-gradient(to top, rgba(100,143,255,0.08), rgba(100,143,255,0.2));
          opacity: 0.4;
        }
        .vf-wave-bar.playing {
          background: linear-gradient(to top, rgba(100,143,255,0.3), rgba(100,143,255,0.8));
          animation: vf-wave 1s ease-in-out infinite alternate;
        }
        @keyframes vf-wave {
          from { height: 15%; opacity: 0.5; }
          to { height: 90%; opacity: 1; }
        }

        /* Play controls */
        .vf-play-row { display: flex; align-items: center; gap: 16px; }
        .vf-play-btn {
          width: 48px; height: 48px; border-radius: 50%;
          background: linear-gradient(135deg, #f5f5f7, #d2d2d7);
          border: none; cursor: pointer;
          display: flex; align-items: center; justify-content: center;
          font-size: 18px; color: #1d1d1f;
          box-shadow: 0 2px 8px rgba(0,0,0,0.3), inset 0 1px 0 rgba(255,255,255,0.3);
          transition: all 0.2s ease;
        }
        .vf-play-btn:hover { transform: scale(1.06); box-shadow: 0 4px 14px rgba(0,0,0,0.4); }
        .vf-play-btn:active { transform: scale(0.95); }

        .vf-progress-wrap { flex: 1; }
        .vf-progress-track {
          height: 4px; border-radius: 2px;
          background: rgba(255,255,255,0.06);
          overflow: hidden;
        }
        .vf-progress-fill {
          height: 100%; border-radius: 2px;
          background: linear-gradient(90deg, #648fff, #a0b8ff);
          transition: width 0.05s linear;
        }
        .vf-progress-times {
          display: flex; justify-content: space-between;
          margin-top: 6px;
          font-family: 'SF Mono', 'Fira Code', monospace;
          font-size: 10px; color: #48484a;
        }

        .vf-download {
          width: 100%; margin-top: 20px;
          padding: 12px;
          border-radius: 10px;
          background: rgba(255,255,255,0.03);
          border: 0.5px solid rgba(255,255,255,0.06);
          font-family: 'Inter', sans-serif;
          font-size: 12px; font-weight: 600;
          color: #a1a1a3;
          cursor: pointer; transition: all 0.2s;
        }
        .vf-download:hover {
          background: rgba(255,255,255,0.06);
          border-color: rgba(255,255,255,0.12);
          color: #e5e5e7;
        }

        /* ── Footer ── */
        .vf-footer {
          max-width: 1200px; margin: 0 auto;
          padding: 40px 24px;
          border-top: 0.5px solid rgba(255,255,255,0.04);
          display: flex; flex-wrap: wrap;
          justify-content: space-between; align-items: center;
          gap: 16px;
        }
        .vf-footer-copy {
          font-size: 11px; font-weight: 500;
          color: #48484a; letter-spacing: 0.3px;
        }
        .vf-footer-links {
          display: flex; gap: 28px;
        }
        .vf-footer-links a {
          font-size: 11px; font-weight: 600;
          color: #636366; text-decoration: none;
          letter-spacing: 0.5px; text-transform: uppercase;
          transition: color 0.2s;
        }
        .vf-footer-links a:hover { color: #648fff; }

        .vf-spacer { height: 24px; }

        /* Section spacing */
        .vf-section { margin-bottom: 20px; }

        /* ── Responsive ── */
        @media (max-width: 640px) {
          .vf-mood-grid { grid-template-columns: repeat(2, 1fr); }
          .vf-controls-row { grid-template-columns: 1fr; }
          .vf-nav-links { display: none; }
        }
      `}</style>

      <div className="vf-root">
        <div className="vf-ambient" />

        {/* ━━ NAVIGATION ━━ */}
        <nav className="vf-nav">
          <div className="vf-nav-inner">
            <div className="vf-logo">
              <div className="vf-logo-icon"><span>V</span></div>
              <span className="vf-logo-text">VoiceForge</span>
            </div>
            <div className="vf-nav-links">
              <a href="#">Documentation</a>
              <a href="#">Pricing</a>
              <button className="vf-nav-btn">Account</button>
            </div>
          </div>
        </nav>

        {/* ━━ MAIN LAYOUT ━━ */}
        <main className="vf-main">

          {/* ── LEFT: EDITOR ── */}
          <div>
            <div className="vf-card" style={{ marginBottom: 12 }}>
              <div className="vf-editor-header">
                <span className="vf-editor-label">Script Editor</span>
                <span className="vf-model-badge">XTTS-V2</span>
              </div>
              <textarea
                className="vf-textarea"
                value={text}
                onChange={(e) => setText(e.target.value)}
                placeholder="Paste your script here… Hindi, English, Tamil, Telugu, Malayalam"
              />
              <div className="vf-editor-footer">
                <div className="vf-stat">
                  <span>{words} WORDS</span>
                  <span>{chars} CHARS</span>
                </div>
                <span className="vf-stat">EST. {Math.ceil(words / 2.5)}s</span>
              </div>
            </div>

            <div className="vf-controls-row">
              <div className="vf-card vf-control-card">
                <div className="vf-control-label">Language</div>
                <select
                  className="vf-select"
                  value={language}
                  onChange={(e) => setLanguage(e.target.value)}
                >
                  {LANGUAGES.map((l) => (
                    <option key={l} value={l}>{l}</option>
                  ))}
                </select>
              </div>
              <div className="vf-card vf-control-card">
                <div className="vf-control-label">Gender</div>
                <div className="vf-toggle-group">
                  {["male", "female"].map((g) => (
                    <button
                      key={g}
                      className={`vf-toggle-btn ${gender === g ? "active" : ""}`}
                      onClick={() => setGender(g)}
                    >
                      {g}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* ── RIGHT: CONFIG & OUTPUT ── */}
          <div>
            <div className="vf-card" style={{ padding: 24, marginBottom: 12 }}>
              <div className="vf-settings-title">
                <span className="vf-pulse-dot" />
                Voice Settings
              </div>

              {/* Mood */}
              <div className="vf-section">
                <div className="vf-control-label">Emotional Tone</div>
                <div className="vf-mood-grid">
                  {MOODS.map((m) => (
                    <button
                      key={m.label}
                      className={`vf-mood-btn ${mood === m.label ? "active" : ""}`}
                      onClick={() => setMood(m.label)}
                    >
                      <span className="vf-mood-emoji">{m.emoji}</span>
                      <span className="vf-mood-label">{m.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Age */}
              <div className="vf-section">
                <div className="vf-control-label">Age Group</div>
                <div className="vf-age-row">
                  {AGES.map((a) => (
                    <button
                      key={a}
                      className={`vf-age-pill ${age === a ? "active" : ""}`}
                      onClick={() => setAge(a)}
                    >
                      {a}
                    </button>
                  ))}
                </div>
              </div>

              {/* Generate */}
              <button
                className={`vf-generate ${loading || !text.trim() ? "disabled" : "ready"}`}
                onClick={handleGenerate}
                disabled={loading || !text.trim()}
              >
                {loading ? (
                  <><span className="vf-spinner" /> Synthesizing…</>
                ) : (
                  "Generate High-Fidelity Audio"
                )}
              </button>
            </div>

            {/* ── Audio Player ── */}
            <div className={`vf-card vf-player ${generated ? "visible" : "hidden"}`} style={{ padding: 24 }}>
              <div className="vf-player-header">
                <span className="vf-player-label">Output Audio</span>
                <span className="vf-player-quality">24-bit · 48 kHz</span>
              </div>

              <div className="vf-waveform">
                {Array.from({ length: 48 }).map((_, i) => (
                  <div
                    key={i}
                    className={`vf-wave-bar ${playing ? "playing" : "idle"}`}
                    style={{
                      animationDelay: `${i * 0.04}s`,
                      height: playing ? undefined : `${12 + Math.random() * 45}%`,
                    }}
                  />
                ))}
              </div>

              <div className="vf-play-row">
                <button className="vf-play-btn" onClick={() => setPlaying(!playing)}>
                  {playing ? "⏸" : "▶"}
                </button>
                <div className="vf-progress-wrap">
                  <div className="vf-progress-track">
                    <div className="vf-progress-fill" style={{ width: `${progress}%` }} />
                  </div>
                  <div className="vf-progress-times">
                    <span>{`00:${String(Math.floor((progress / 100) * 42)).padStart(2, "0")}`}</span>
                    <span>00:42</span>
                  </div>
                </div>
              </div>

              <button className="vf-download">Download WAV (PCM)</button>
            </div>
          </div>
        </main>

        {/* ━━ FOOTER ━━ */}
        <footer className="vf-footer">
          <span className="vf-footer-copy">© 2024 VoiceForge AI · Powered by XTTS-v2</span>
          <div className="vf-footer-links">
            <a href="#">Safety</a>
            <a href="#">API</a>
            <a href="#">Privacy</a>
          </div>
        </footer>
      </div>
    </>
  );
}
