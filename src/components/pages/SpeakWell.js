import React, { useState, useRef, useEffect } from "react";

const ML_URL      = process.env.REACT_APP_ML_URL      || "";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

// ── Styles (inline so no extra CSS file needed) ───────────────────
const s = {
  page:       { maxWidth: 900, margin: "0 auto", padding: "24px 16px", fontFamily: "system-ui,sans-serif" },
  heading:    { fontSize: 22, fontWeight: 600, marginBottom: 4 },
  sub:        { fontSize: 13, color: "#888", marginBottom: 20 },
  grid:       { display: "grid", gridTemplateColumns: "1fr 260px", gap: 16, alignItems: "start" },
  camBox:     { borderRadius: 12, overflow: "hidden", background: "#000", border: "2px solid #e5e7eb", transition: "border-color .3s" },
  camArea:    { position: "relative", aspectRatio: "16/10" },
  video:      { width: "100%", height: "100%", objectFit: "cover", display: "block" },
  badge:      { position: "absolute", top: 10, left: 10, padding: "4px 12px", borderRadius: 20, fontSize: 12, fontWeight: 600, backdropFilter: "blur(6px)" },
  timer:      { position: "absolute", top: 10, right: 10, display: "flex", alignItems: "center", gap: 6, padding: "4px 12px", borderRadius: 20, background: "rgba(0,0,0,.55)", color: "#fff", fontSize: 12, fontFamily: "monospace" },
  dot:        { width: 8, height: 8, borderRadius: "50%", background: "#ef4444" },
  footer:     { padding: "12px 14px", display: "flex", gap: 8, borderTop: "1px solid #f3f4f6" },
  btnGreen:   { flex: 1, height: 36, borderRadius: 10, border: "none", background: "#22c55e", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  btnRed:     { flex: 1, height: 36, borderRadius: 10, border: "none", background: "#ef4444", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" },
  mlPill:     { display: "flex", alignItems: "center", gap: 5, padding: "0 12px", borderRadius: 10, border: "1px solid #e5e7eb", fontSize: 12, color: "#888" },
  panel:      { display: "flex", flexDirection: "column", gap: 14 },
  card:       { borderRadius: 12, border: "1px solid #e5e7eb", background: "#fff", padding: 16 },
  cardTitle:  { fontSize: 12, fontWeight: 600, color: "#888", textTransform: "uppercase", letterSpacing: ".04em", marginBottom: 12 },
  fbItem:     { display: "flex", gap: 7, alignItems: "flex-start", fontSize: 12, lineHeight: 1.5, marginBottom: 5 },
  tag:        { display: "inline-block", fontSize: 11, fontWeight: 600, padding: "3px 9px", borderRadius: 10, marginRight: 4, marginBottom: 4, textTransform: "capitalize" },
  histCard:   { borderRadius: 12, border: "1px solid #e5e7eb", padding: "12px 14px", marginBottom: 8, background: "#fff" },
  bar:        { height: 4, borderRadius: 4, overflow: "hidden", display: "flex", background: "#f3f4f6", marginTop: 6 },
  error:      { padding: "10px 14px", borderRadius: 10, background: "#fef2f2", border: "1px solid #fecaca", color: "#b91c1c", fontSize: 12, marginBottom: 12 },
  statRow:    { display: "grid", gridTemplateColumns: "repeat(4,1fr)", gap: 8, marginBottom: 16 },
  statCard:   { borderRadius: 10, border: "1px solid #e5e7eb", padding: 12, textAlign: "center", background: "#fff" },
  statVal:    { fontSize: 20, fontWeight: 600, marginBottom: 2 },
  statLbl:    { fontSize: 11, color: "#888" },
};

// ── Score ring SVG ────────────────────────────────────────────────
function ScoreRing({ score }) {
  const r   = 40, circ = 2 * Math.PI * r;
  const col = score >= 75 ? "#22c55e" : score >= 50 ? "#f59e0b" : score > 0 ? "#ef4444" : "#d1d5db";
  return (
    <div style={{ textAlign: "center" }}>
      <svg width="100" height="100" viewBox="0 0 100 100">
        <circle cx="50" cy="50" r={r} fill="none" stroke="#f3f4f6" strokeWidth="6" />
        <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="6"
          strokeLinecap="round"
          strokeDasharray={`${(score/100)*circ} ${circ}`}
          strokeDashoffset={circ/4}
          style={{ transition: "stroke-dasharray .4s, stroke .3s" }} />
        <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="600" fill={col}>{score > 0 ? score : "—"}</text>
        <text x="50" y="60" textAnchor="middle" fontSize="9"  fill="#9ca3af">
          {score >= 75 ? "excellent" : score >= 50 ? "good" : score > 0 ? "improve" : "waiting"}
        </text>
      </svg>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function SpeakWell() {
  const videoRef   = useRef(null);
  const streamRef  = useRef(null);
  const canvasRef  = useRef(document.createElement("canvas"));
  const intervalRef = useRef(null);
  const timerRef   = useRef(null);
  const scoresRef  = useRef([]);
  const timelineRef = useRef([]);

  const [tab,          setTab]          = useState("practice");  // practice | history
  const [camReady,     setCamReady]     = useState(false);
  const [recording,    setRecording]    = useState(false);
  const [elapsed,      setElapsed]      = useState(0);
  const [analysis,     setAnalysis]     = useState(null);
  const [annotated,    setAnnotated]    = useState(null);
  const [sessionScores,setSessionScores]= useState([]);
  const [mlOn,         setMlOn]         = useState(false);
  const [apiError,     setApiError]     = useState("");
  const [sessName,     setSessName]     = useState("");
  const [sessions,     setSessions]     = useState([]);
  const [stats,        setStats]        = useState(null);
  const [loadingHist,  setLoadingHist]  = useState(false);

  // Start camera
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video: { width:640, height:480, facingMode:"user" }, audio:false })
      .then((stream) => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => { videoRef.current.play(); setCamReady(true); };
        }
      }).catch((e) => setApiError("Camera error: " + e.message));
    return () => streamRef.current?.getTracks().forEach((t) => t.stop());
  }, []);

  // Load history when tab switches
  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setLoadingHist(true);
    try {
      const [sr, st] = await Promise.all([
        fetch(`${BACKEND_URL}/api/sessions`).then((r) => r.json()),
        fetch(`${BACKEND_URL}/api/stats`).then((r) => r.json()),
      ]);
      setSessions(sr.sessions || []);
      setStats(st.stats || null);
    } catch (e) { setApiError("Could not load history: " + e.message); }
    setLoadingHist(false);
  };

  // Capture + analyze frame
  const analyzeFrame = async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = canvasRef.current;
    canvas.width = 640; canvas.height = 480;
    canvas.getContext("2d").drawImage(video, 0, 0, 640, 480);
    const frame = canvas.toDataURL("image/jpeg", 0.7);
    try {
      const res  = await fetch(`${ML_URL}/analyze`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ frame }),
        signal: AbortSignal.timeout(5000),
      });
      if (!res.ok) throw new Error(`ML ${res.status}`);
      const data = await res.json();
      setAnalysis(data.analysis);
      setAnnotated(data.annotated_frame);
      setMlOn(true);
      setApiError("");
      const score = data.analysis?.score || 0;
      scoresRef.current.push(score);
      timelineRef.current.push({ timestamp: Date.now(), score });
      setSessionScores([...scoresRef.current]);
    } catch (e) {
      setMlOn(false);
      setApiError(e.message);
    }
  };

  const startSession = () => {
    scoresRef.current   = [];
    timelineRef.current = [];
    setSessionScores([]);
    setElapsed(0);
    setRecording(true);
    intervalRef.current = setInterval(analyzeFrame, 200);
    timerRef.current    = setInterval(() => setElapsed((p) => p + 1), 1000);
  };

  const stopSession = async () => {
    setRecording(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    const scores = scoresRef.current;
    if (!scores.length) return;
    try {
      // Get ML summary
      const sumRes = await fetch(`${ML_URL}/analyze_session`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ scores }),
      });
      const summary = await sumRes.json();

      // Save to backend → Supabase
      await fetch(`${BACKEND_URL}/api/sessions`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          name:             sessName || `Session ${new Date().toLocaleString()}`,
          created_at:       new Date().toISOString(),
          duration_seconds: elapsed,
          avg_score:        summary.avg_score,
          max_score:        summary.max_score,
          good_percent:     summary.good_percent,
          warn_percent:     summary.warn_percent,
          bad_percent:      summary.bad_percent,
          total_frames:     scores.length,
          rating:           summary.rating,
          tips:             summary.tips,
          score_timeline:   timelineRef.current,
        }),
      });
      alert(`Session saved! Score: ${summary.avg_score} — ${summary.rating}`);
      setSessName("");
    } catch (e) { setApiError("Save failed: " + e.message); }
  };

  const deleteSession = async (id) => {
    try {
      await fetch(`${BACKEND_URL}/api/sessions/${id}`, { method:"DELETE" });
      setSessions((p) => p.filter((s) => s.id !== id));
    } catch (e) { setApiError(e.message); }
  };

  const fmt = (s) => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const bCol = analysis?.color === "green" ? "#22c55e" : analysis?.color === "red" ? "#ef4444" : analysis?.color === "yellow" ? "#f59e0b" : "#e5e7eb";
  const rc   = { Excellent:"#22c55e", Good:"#3b82f6", "Needs Improvement":"#f59e0b", Poor:"#ef4444" };

  return (
    <div style={s.page}>
      {/* Header */}
      <h1 style={s.heading}>🎤 SpeakWell — Gesture Coach</h1>
      <p style={s.sub}>Real-time hand gesture analysis for public speakers</p>

      {/* Tabs */}
      <div style={{ display:"flex", gap:6, marginBottom:20 }}>
        {["practice","history"].map((t) => (
          <button key={t} onClick={() => setTab(t)} style={{
            padding:"7px 18px", borderRadius:9, border:"1px solid #e5e7eb", cursor:"pointer",
            background: tab===t ? "#111" : "#fff", color: tab===t ? "#fff" : "#555",
            fontSize:13, fontWeight:600, textTransform:"capitalize",
          }}>{t}</button>
        ))}
      </div>

      {apiError && <div style={s.error}>⚠ {apiError}</div>}

      {/* ── PRACTICE TAB ── */}
      {tab === "practice" && (
        <>
          <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:14 }}>
            <input value={sessName} onChange={(e) => setSessName(e.target.value)}
              placeholder="Session name (optional)"
              disabled={recording}
              style={{ height:34, borderRadius:9, border:"1px solid #e5e7eb", padding:"0 12px", fontSize:13, width:220 }} />
          </div>

          <div style={{ ...s.grid }}>
            {/* Camera */}
            <div style={{ ...s.camBox, borderColor: bCol }}>
              <div style={s.camArea}>
                <video ref={videoRef} style={{ ...s.video, display: annotated ? "none" : "block" }} muted playsInline />
                {annotated && <img src={annotated} alt="" style={{ ...s.video, position:"absolute", inset:0 }} />}
                {!camReady && (
                  <div style={{ position:"absolute", inset:0, display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <p style={{ color:"rgba(255,255,255,.4)", fontSize:13 }}>Starting camera...</p>
                  </div>
                )}
                {/* Status badge */}
                <div style={{ ...s.badge,
                  background: analysis?.color==="green" ? "rgba(34,197,94,.2)" : analysis?.color==="yellow" ? "rgba(245,158,11,.2)" : analysis?.color==="red" ? "rgba(239,68,68,.2)" : "rgba(255,255,255,.1)",
                  border: `1px solid ${bCol}40`,
                  color: analysis?.color==="green" ? "#4ade80" : analysis?.color==="yellow" ? "#fbbf24" : analysis?.color==="red" ? "#f87171" : "rgba(255,255,255,.5)",
                }}>
                  {analysis?.color==="green" ? "✓ Good gesture" : analysis?.color==="yellow" ? "⚠ Needs attention" : analysis?.color==="red" ? "✗ Incorrect" : "● Ready"}
                </div>
                {recording && (
                  <div style={s.timer}>
                    <div style={{ ...s.dot, animation:"pulse 1s infinite" }} />
                    {fmt(elapsed)}
                  </div>
                )}
              </div>
              <div style={s.footer}>
                {!recording ? (
                  <button style={s.btnGreen} onClick={startSession} disabled={!camReady}>
                    ▶ Start Session
                  </button>
                ) : (
                  <button style={s.btnRed} onClick={stopSession}>
                    ⏹ Stop & Save
                  </button>
                )}
                <div style={{ ...s.mlPill, borderColor: mlOn ? "#bbf7d0" : "#e5e7eb", color: mlOn ? "#15803d" : "#9ca3af", background: mlOn ? "#f0fdf4" : "#fff" }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background: mlOn ? "#22c55e" : "#d1d5db" }} />
                  {mlOn ? "ML live" : "ML off"}
                </div>
              </div>
            </div>

            {/* Right panel */}
            <div style={s.panel}>
              {/* Score */}
              <div style={s.card}>
                <div style={s.cardTitle}>Gesture Score</div>
                <ScoreRing score={analysis?.score || 0} />
                {sessionScores.length > 1 && (
                  <div style={{ marginTop:10 }}>
                    <div style={{ display:"flex", justifyContent:"space-between", fontSize:11, color:"#9ca3af", marginBottom:5 }}>
                      <span>Timeline</span>
                      <span>avg {Math.round(sessionScores.reduce((a,b)=>a+b,0)/sessionScores.length)}</span>
                    </div>
                    <svg viewBox="0 0 220 40" width="100%" style={{ display:"block" }}>
                      {(() => {
                        const last = sessionScores.slice(-60);
                        if (last.length < 2) return null;
                        const pts = last.map((s,i) => ({ x:(i/(last.length-1))*220, y:40-(s/100)*40 }));
                        const avg = Math.round(last.reduce((a,b)=>a+b,0)/last.length);
                        const col = avg>=75?"#22c55e":avg>=50?"#f59e0b":"#ef4444";
                        return (
                          <>
                            <polyline points={pts.map(p=>`${p.x},${p.y}`).join(" ")} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>
                            <circle cx={pts[pts.length-1].x} cy={pts[pts.length-1].y} r="2.5" fill={col}/>
                          </>
                        );
                      })()}
                    </svg>
                  </div>
                )}
              </div>

              {/* Feedback */}
              <div style={s.card}>
                <div style={s.cardTitle}>Live Feedback</div>
                {!analysis ? (
                  <p style={{ fontSize:12, color:"#9ca3af" }}>Start session to see feedback</p>
                ) : (
                  <>
                    {analysis.gestures?.map((g,i) => (
                      <span key={i} style={{ ...s.tag,
                        background: g.quality==="good"?"#dcfce7":g.quality==="bad"?"#fee2e2":g.quality==="warning"?"#fef9c3":"#f3f4f6",
                        color: g.quality==="good"?"#15803d":g.quality==="bad"?"#b91c1c":g.quality==="warning"?"#92400e":"#6b7280",
                      }}>{g.gesture.replace("_"," ")}</span>
                    ))}
                    {analysis.positives?.map((p,i) => (
                      <div key={i} style={s.fbItem}><span style={{ color:"#22c55e", fontSize:13 }}>✓</span><span style={{ color:"#374151" }}>{p}</span></div>
                    ))}
                    {analysis.issues?.map((p,i) => (
                      <div key={i} style={s.fbItem}><span style={{ color:"#f59e0b", fontSize:13 }}>⚠</span><span style={{ color:"#374151" }}>{p}</span></div>
                    ))}
                  </>
                )}
              </div>
            </div>
          </div>

          {/* Tips */}
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)", gap:10, marginTop:16 }}>
            {[["🤲","Open palms","Face palms outward"],["📐","Gesture zone","Waist to shoulder"],["⚖️","Balance","Both hands even"],["✋","No fists","Stay relaxed"]].map(([icon,title,desc]) => (
              <div key={title} style={{ ...s.card, padding:12 }}>
                <div style={{ fontSize:18, marginBottom:6 }}>{icon}</div>
                <p style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{title}</p>
                <p style={{ fontSize:11, color:"#9ca3af" }}>{desc}</p>
              </div>
            ))}
          </div>
        </>
      )}

      {/* ── HISTORY TAB ── */}
      {tab === "history" && (
        <>
          {loadingHist ? (
            <p style={{ color:"#9ca3af", fontSize:13 }}>Loading from Supabase...</p>
          ) : (
            <>
              {/* Stats */}
              {stats && (
                <div style={s.statRow}>
                  {[["Sessions",stats.total_sessions],["Avg Score",stats.overall_avg],["Best",stats.best_score],["Minutes",`${stats.total_minutes}m`]].map(([l,v]) => (
                    <div key={l} style={s.statCard}>
                      <div style={s.statVal}>{v ?? "—"}</div>
                      <div style={s.statLbl}>{l}</div>
                    </div>
                  ))}
                </div>
              )}

              {sessions.length === 0 ? (
                <p style={{ color:"#9ca3af", fontSize:13, textAlign:"center", padding:40 }}>No sessions yet — start practising!</p>
              ) : (
                sessions.map((s) => (
                  <div key={s.id} style={s.histCard || { borderRadius:12, border:"1px solid #e5e7eb", padding:"12px 14px", marginBottom:8, background:"#fff" }}>
                    <div style={{ display:"flex", justifyContent:"space-between", alignItems:"center", marginBottom:6 }}>
                      <span style={{ fontSize:13, fontWeight:600 }}>{s.name}</span>
                      <div style={{ display:"flex", gap:8, alignItems:"center" }}>
                        <span style={{ fontSize:12, fontWeight:600, color: rc[s.rating] || "#888" }}>{s.rating}</span>
                        <button onClick={() => deleteSession(s.id)}
                          style={{ border:"none", background:"none", cursor:"pointer", color:"#ef4444", fontSize:14 }}>🗑</button>
                      </div>
                    </div>
                    <div style={{ display:"flex", gap:16, fontSize:12, color:"#9ca3af", marginBottom:8 }}>
                      <span>{new Date(s.created_at).toLocaleDateString()}</span>
                      <span>{Math.floor(s.duration_seconds/60)}m {s.duration_seconds%60}s</span>
                      <span>Score: <strong style={{ color:"#111" }}>{s.avg_score}</strong></span>
                      <span>{s.total_frames} frames</span>
                    </div>
                    <div style={{ height:4, borderRadius:4, overflow:"hidden", display:"flex", background:"#f3f4f6" }}>
                      <div style={{ width:`${s.good_percent}%`, background:"#22c55e", height:"100%" }} />
                      <div style={{ width:`${s.warn_percent}%`, background:"#f59e0b", height:"100%" }} />
                      <div style={{ width:`${s.bad_percent}%`,  background:"#ef4444", height:"100%" }} />
                    </div>
                    <div style={{ display:"flex", gap:12, fontSize:11, color:"#9ca3af", marginTop:4 }}>
                      <span>{s.good_percent}% good</span>
                      <span>{s.warn_percent}% warn</span>
                      <span>{s.bad_percent}% poor</span>
                    </div>
                  </div>
                ))
              )}
              <button onClick={loadHistory} style={{ fontSize:12, color:"#6b7280", background:"none", border:"1px solid #e5e7eb", borderRadius:8, padding:"6px 14px", cursor:"pointer", marginTop:4 }}>
                ↺ Refresh
              </button>
            </>
          )}
        </>
      )}

      <style>{`@keyframes pulse{0%,100%{opacity:1}50%{opacity:.3}}`}</style>
    </div>
  );
}