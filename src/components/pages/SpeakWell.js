import React, { useState, useRef, useEffect, useCallback } from "react";

const ML_URL      = process.env.REACT_APP_ML_URL      || "";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

// ── Design tokens ─────────────────────────────────────────────────
const T = {
  bg:       "#f5f5f7",
  surface:  "#ffffff",
  border:   "rgba(0,0,0,0.08)",
  text:     "#1d1d1f",
  muted:    "#6e6e73",
  hint:     "#aeaeb2",
  green:    "#34c759",
  yellow:   "#ff9f0a",
  red:      "#ff3b30",
  blue:     "#0071e3",
  radius:   "14px",
  radiusSm: "10px",
  font:     "-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",
};

// ── Reusable components ───────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{
    background: T.surface, borderRadius: T.radius,
    border: `1px solid ${T.border}`, padding: "20px",
    ...style,
  }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontSize: 11, fontWeight: 600, color: T.muted, letterSpacing: ".06em",
    textTransform: "uppercase", marginBottom: 8 }}>{children}</p>
);

const StatusPill = ({ color, label }) => {
  const map = {
    green:  { bg:"rgba(52,199,89,.12)",  border:"rgba(52,199,89,.3)",  text:"#1a7a34" },
    yellow: { bg:"rgba(255,159,10,.12)", border:"rgba(255,159,10,.3)", text:"#7a4a00" },
    red:    { bg:"rgba(255,59,48,.12)",  border:"rgba(255,59,48,.3)",  text:"#a80000" },
    neutral:{ bg:"rgba(0,0,0,.05)",      border:"rgba(0,0,0,.12)",     text: T.muted  },
  };
  const c = map[color] || map.neutral;
  return (
    <span style={{
      display:"inline-flex", alignItems:"center", gap:5,
      padding:"4px 11px", borderRadius:20,
      background:c.bg, border:`1px solid ${c.border}`,
      fontSize:12, fontWeight:600, color:c.text, whiteSpace:"nowrap",
    }}>
      <span style={{ width:6, height:6, borderRadius:"50%",
        background: color==="green"?T.green:color==="yellow"?T.yellow:color==="red"?T.red:T.hint }} />
      {label}
    </span>
  );
};

// ── Score Arc ─────────────────────────────────────────────────────
function ScoreArc({ score }) {
  const r    = 44, circ = 2 * Math.PI * r;
  const col  = score >= 75 ? T.green : score >= 50 ? T.yellow : score > 0 ? T.red : T.hint;
  const prog = (score / 100) * circ;
  const lbl  = score >= 75 ? "Excellent" : score >= 50 ? "Good" : score > 0 ? "Improve" : "Waiting";
  return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center" }}>
      <svg width="108" height="108" viewBox="0 0 108 108">
        <circle cx="54" cy="54" r={r} fill="none" stroke={T.border} strokeWidth="7" />
        <circle cx="54" cy="54" r={r} fill="none" stroke={col} strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={`${prog} ${circ}`}
          strokeDashoffset={circ / 4}
          style={{ transition:"stroke-dasharray .45s cubic-bezier(.4,0,.2,1),stroke .3s" }} />
        <text x="54" y="48" textAnchor="middle" fontSize="24" fontWeight="600"
          fill={col} fontFamily={T.font}>{score > 0 ? score : "—"}</text>
        <text x="54" y="64" textAnchor="middle" fontSize="10" fill={T.muted}
          fontFamily={T.font}>{lbl}</text>
      </svg>
    </div>
  );
}

// ── Mini Timeline ─────────────────────────────────────────────────
function MiniTimeline({ scores }) {
  const last = scores.slice(-70);
  if (last.length < 2) return null;
  const W = 230, H = 48;
  const pts = last.map((s, i) => ({
    x: (i / (last.length - 1)) * W,
    y: H - (s / 100) * H,
  }));
  const pl  = pts.map(p => `${p.x},${p.y}`).join(" ");
  const avg = Math.round(last.reduce((a, b) => a + b, 0) / last.length);
  const col = avg >= 75 ? T.green : avg >= 50 ? T.yellow : T.red;
  const lp  = pts[pts.length - 1];
  return (
    <div style={{ marginTop: 14 }}>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:6 }}>
        <span style={{ fontSize:11, color:T.muted }}>Session timeline</span>
        <span style={{ fontSize:11, fontWeight:600, color:col }}>avg {avg}</span>
      </div>
      <svg viewBox={`0 0 ${W} ${H}`} width="100%" style={{ display:"block", overflow:"visible" }}>
        <defs>
          <linearGradient id="tg" x1="0" y1="0" x2="0" y2="1">
            <stop offset="0%" stopColor={col} stopOpacity=".18"/>
            <stop offset="100%" stopColor={col} stopOpacity="0"/>
          </linearGradient>
        </defs>
        {[25,50,75].map(v => (
          <line key={v} x1="0" y1={H-(v/100)*H} x2={W} y2={H-(v/100)*H}
            stroke={T.border} strokeDasharray="3,3"/>
        ))}
        <polygon points={`0,${H} ${pl} ${W},${H}`} fill="url(#tg)"/>
        <polyline points={pl} fill="none" stroke={col} strokeWidth="1.5" strokeLinejoin="round"/>
        <circle cx={lp.x} cy={lp.y} r="3" fill={col}/>
      </svg>
    </div>
  );
}

// ── Feedback list ─────────────────────────────────────────────────
function FeedbackList({ analysis, error }) {
  if (error) return (
    <div style={{ padding:"12px 14px", borderRadius:T.radiusSm,
      background:"rgba(255,59,48,.07)", border:`1px solid rgba(255,59,48,.2)` }}>
      <p style={{ fontSize:12, fontWeight:600, color:T.red, marginBottom:2 }}>Connection error</p>
      <p style={{ fontSize:11, color:T.muted }}>{error}</p>
    </div>
  );
  if (!analysis) return (
    <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
      <p style={{ fontSize:13, color:T.muted, lineHeight:1.6 }}>
        Start a session to receive real-time gesture feedback.
      </p>
      {[["#34c759","Correct gesture"],["#ff9f0a","Needs attention"],["#ff3b30","Incorrect"]].map(([c,l]) => (
        <div key={l} style={{ display:"flex", alignItems:"center", gap:7, fontSize:12, color:T.muted }}>
          <div style={{ width:7, height:7, borderRadius:"50%", background:c, flexShrink:0 }}/>{l}
        </div>
      ))}
    </div>
  );

  const { issues=[], positives=[], gestures=[] } = analysis;
  return (
    <div style={{ display:"flex", flexDirection:"column", gap:6 }}>
      {gestures.length > 0 && (
        <div style={{ display:"flex", flexWrap:"wrap", gap:5, marginBottom:4 }}>
          {gestures.map((g, i) => {
            const tagC = g.quality==="good"
              ? { bg:"rgba(52,199,89,.1)",  text:"#1a7a34",  border:"rgba(52,199,89,.25)"  }
              : g.quality==="bad"
              ? { bg:"rgba(255,59,48,.1)",  text:"#a80000",  border:"rgba(255,59,48,.25)"  }
              : g.quality==="warning"
              ? { bg:"rgba(255,159,10,.1)", text:"#7a4a00",  border:"rgba(255,159,10,.25)" }
              : { bg:"rgba(0,0,0,.05)",     text:T.muted,    border:T.border };
            return (
              <span key={i} style={{ fontSize:11, fontWeight:600, padding:"3px 9px",
                borderRadius:20, background:tagC.bg, color:tagC.text,
                border:`1px solid ${tagC.border}`, textTransform:"capitalize" }}>
                {g.gesture.replace("_"," ")}
              </span>
            );
          })}
        </div>
      )}
      {positives.map((p, i) => (
        <div key={i} style={{ display:"flex", gap:7, alignItems:"flex-start",
          fontSize:12, lineHeight:1.55, color:T.text }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:1 }}
            stroke={T.green} strokeWidth="2.5" strokeLinecap="round">
            <polyline points="20 6 9 17 4 12"/>
          </svg>
          {p}
        </div>
      ))}
      {issues.map((p, i) => (
        <div key={i} style={{ display:"flex", gap:7, alignItems:"flex-start",
          fontSize:12, lineHeight:1.55, color:T.text }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" style={{ flexShrink:0, marginTop:1 }}
            stroke={T.yellow} strokeWidth="2.5" strokeLinecap="round">
            <circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/>
            <line x1="12" y1="16" x2="12.01" y2="16"/>
          </svg>
          {p}
        </div>
      ))}
      {!positives.length && !issues.length && (
        <p style={{ fontSize:12, color:T.muted }}>Analysing your gestures…</p>
      )}
    </div>
  );
}

// ── Summary Modal ─────────────────────────────────────────────────
function SummaryModal({ data, onClose }) {
  const rc = { Excellent:T.green, Good:T.blue, "Needs Improvement":T.yellow, Poor:T.red };
  if (!data) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,.45)", backdropFilter:"blur(12px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20,
    }}>
      <div style={{
        background:T.surface, borderRadius:20, padding:28,
        width:"100%", maxWidth:400, fontFamily:T.font,
        animation:"slideUp .25s cubic-bezier(.4,0,.2,1)",
      }}>
        <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start", marginBottom:22 }}>
          <div>
            <p style={{ fontSize:12, color:T.muted, marginBottom:4 }}>Session complete</p>
            <p style={{ fontSize:32, fontWeight:700, letterSpacing:"-.02em", color:T.text, lineHeight:1 }}>
              {data.avg_score}<span style={{ fontSize:18, color:T.muted, fontWeight:400 }}>/100</span>
            </p>
            <p style={{ fontSize:13, fontWeight:600, marginTop:4, color:rc[data.rating]||T.text }}>
              {data.rating}
            </p>
          </div>
          <button onClick={onClose} style={{ width:30, height:30, borderRadius:"50%",
            background:"rgba(0,0,0,.06)", border:"none", cursor:"pointer",
            display:"flex", alignItems:"center", justifyContent:"center", color:T.muted }}>
            ✕
          </button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8, marginBottom:20 }}>
          {[["Best",data.max_score],["Duration",`${Math.floor((data.duration_seconds||0)/60)}m`],["Frames",data.total_frames]].map(([l,v]) => (
            <div key={l} style={{ background:T.bg, borderRadius:T.radiusSm, padding:"12px 10px", textAlign:"center" }}>
              <p style={{ fontSize:17, fontWeight:600, color:T.text, letterSpacing:"-.01em" }}>{v}</p>
              <p style={{ fontSize:10, color:T.muted, marginTop:2, textTransform:"uppercase", letterSpacing:".04em" }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:20 }}>
          <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase",
            letterSpacing:".05em", marginBottom:8 }}>Quality distribution</p>
          <div style={{ height:6, borderRadius:6, overflow:"hidden", display:"flex", background:T.bg }}>
            <div style={{ width:`${data.good_percent}%`, background:T.green, height:"100%", transition:"width .5s" }}/>
            <div style={{ width:`${data.warn_percent}%`, background:T.yellow, height:"100%", transition:"width .5s" }}/>
            <div style={{ width:`${data.bad_percent}%`,  background:T.red,   height:"100%", transition:"width .5s" }}/>
          </div>
          <div style={{ display:"flex", gap:14, marginTop:7 }}>
            {[[T.green,`${data.good_percent}% good`],[T.yellow,`${data.warn_percent}% warn`],[T.red,`${data.bad_percent}% poor`]].map(([c,l]) => (
              <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:6, height:6, borderRadius:"50%", background:c }}/>
                <span style={{ fontSize:11, color:T.muted }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {data.tips?.length > 0 && (
          <div style={{ marginBottom:22 }}>
            <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase",
              letterSpacing:".05em", marginBottom:8 }}>Recommendations</p>
            {data.tips.map((tip, i) => (
              <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start",
                fontSize:12, color:T.muted, lineHeight:1.55, marginBottom:5 }}>
                <span style={{ color:T.blue, fontWeight:700, flexShrink:0 }}>→</span>{tip}
              </div>
            ))}
          </div>
        )}

        <button onClick={onClose} style={{
          width:"100%", height:44, borderRadius:T.radiusSm,
          background:T.text, color:"#fff", border:"none",
          fontSize:14, fontWeight:600, cursor:"pointer", letterSpacing:"-.01em",
          fontFamily:T.font,
        }}>Practice again</button>
      </div>
      <style>{`@keyframes slideUp{from{opacity:0;transform:translateY(16px)}to{opacity:1;transform:translateY(0)}}`}</style>
    </div>
  );
}

// ── History session card ──────────────────────────────────────────
function SessionCard({ s, onDelete }) {
  const rc = { Excellent:T.green, Good:T.blue, "Needs Improvement":T.yellow, Poor:T.red };
  const dur = s.duration_seconds
    ? `${Math.floor(s.duration_seconds/60)}m ${s.duration_seconds%60}s` : "—";
  return (
    <div style={{
      background:T.surface, borderRadius:T.radius,
      border:`1px solid ${T.border}`, padding:"16px 18px",
      transition:"border-color .2s",
    }}
    onMouseEnter={e=>e.currentTarget.style.borderColor="rgba(0,0,0,.18)"}
    onMouseLeave={e=>e.currentTarget.style.borderColor=T.border}>
      <div style={{ display:"flex", justifyContent:"space-between", alignItems:"flex-start" }}>
        <div style={{ flex:1, minWidth:0 }}>
          <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:6 }}>
            <p style={{ fontSize:14, fontWeight:600, color:T.text,
              overflow:"hidden", textOverflow:"ellipsis", whiteSpace:"nowrap" }}>{s.name}</p>
            <span style={{ fontSize:12, fontWeight:600, color:rc[s.rating]||T.muted,
              flexShrink:0 }}>{s.rating}</span>
          </div>
          <div style={{ display:"flex", gap:16, fontSize:12, color:T.muted, marginBottom:10, flexWrap:"wrap" }}>
            <span>{new Date(s.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
            <span>{dur}</span>
            <span>Score <strong style={{ color:T.text }}>{s.avg_score}</strong></span>
            <span>{s.total_frames} frames</span>
          </div>
          <div style={{ height:4, borderRadius:4, overflow:"hidden",
            display:"flex", background:T.bg }}>
            <div style={{ width:`${s.good_percent}%`, background:T.green, height:"100%" }}/>
            <div style={{ width:`${s.warn_percent}%`, background:T.yellow,height:"100%" }}/>
            <div style={{ width:`${s.bad_percent}%`,  background:T.red,   height:"100%" }}/>
          </div>
          <div style={{ display:"flex", gap:12, marginTop:5, fontSize:11, color:T.hint }}>
            <span>{s.good_percent}% good</span>
            <span>{s.warn_percent}% warning</span>
            <span>{s.bad_percent}% poor</span>
          </div>
        </div>
        <button onClick={() => onDelete(s.id)} style={{
          marginLeft:12, width:28, height:28, borderRadius:"50%",
          background:"transparent", border:`1px solid ${T.border}`,
          cursor:"pointer", color:T.hint, fontSize:13, flexShrink:0,
          display:"flex", alignItems:"center", justifyContent:"center",
          transition:"all .15s",
        }}
        onMouseEnter={e=>{e.currentTarget.style.background="rgba(255,59,48,.08)";e.currentTarget.style.color=T.red;e.currentTarget.style.borderColor="rgba(255,59,48,.3)"}}
        onMouseLeave={e=>{e.currentTarget.style.background="transparent";e.currentTarget.style.color=T.hint;e.currentTarget.style.borderColor=T.border}}>
          ✕
        </button>
      </div>
    </div>
  );
}

// ── Main SpeakWell component ──────────────────────────────────────
export default function SpeakWell() {
  const videoRef    = useRef(null);
  const streamRef   = useRef(null);
  const canvasRef   = useRef(document.createElement("canvas"));
  const intervalRef = useRef(null);
  const timerRef    = useRef(null);
  const scoresRef   = useRef([]);
  const timelineRef = useRef([]);

  const [tab,           setTab]           = useState("practice");
  const [camReady,      setCamReady]      = useState(false);
  const [recording,     setRecording]     = useState(false);
  const [elapsed,       setElapsed]       = useState(0);
  const [analysis,      setAnalysis]      = useState(null);
  const [annotated,     setAnnotated]     = useState(null);
  const [scores,        setScores]        = useState([]);
  const [mlOn,          setMlOn]          = useState(false);
  const [apiError,      setApiError]      = useState("");
  const [sessName,      setSessName]      = useState("");
  const [sessions,      setSessions]      = useState([]);
  const [stats,         setStats]         = useState(null);
  const [loadingHist,   setLoadingHist]   = useState(false);
  const [summaryData,   setSummaryData]   = useState(null);
  const [saving,        setSaving]        = useState(false);

  // Camera init
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video:{ width:640, height:480, facingMode:"user" }, audio:false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play();
            setCamReady(true);
          };
        }
      }).catch(e => setApiError("Camera: " + e.message));
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  // Load history when tab switches
  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setLoadingHist(true);
    try {
      const [sr, st] = await Promise.all([
        fetch(`${BACKEND_URL}/api/speakwell/sessions`).then(r => r.json()),
        fetch(`${BACKEND_URL}/api/speakwell/stats`).then(r => r.json()),
      ]);
      setSessions(sr.sessions || []);
      setStats(st.stats || null);
    } catch (e) { setApiError("Could not load history"); }
    setLoadingHist(false);
  };

  const analyzeFrame = useCallback(async () => {
    const video = videoRef.current;
    if (!video || video.readyState < 2) return;
    const canvas = canvasRef.current;
    canvas.width = 640; canvas.height = 480;
    canvas.getContext("2d").drawImage(video, 0, 0, 640, 480);
    const frame = canvas.toDataURL("image/jpeg", 0.72);
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
      const sc = data.analysis?.score || 0;
      scoresRef.current.push(sc);
      timelineRef.current.push({ timestamp: Date.now(), score: sc });
      setScores([...scoresRef.current]);
    } catch (e) {
      setMlOn(false);
      setApiError(e.message);
    }
  }, []);

  const startSession = () => {
    scoresRef.current = []; timelineRef.current = [];
    setScores([]); setElapsed(0); setRecording(true);
    setAnalysis(null); setAnnotated(null);
    intervalRef.current = setInterval(analyzeFrame, 200);
    timerRef.current    = setInterval(() => setElapsed(p => p + 1), 1000);
  };

  const stopSession = async () => {
    setRecording(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    const sc = scoresRef.current;
    if (!sc.length) return;
    setSaving(true);
    try {
      const sumRes  = await fetch(`${ML_URL}/analyze_session`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ scores: sc }),
      });
      const summary = await sumRes.json();

      await fetch(`${BACKEND_URL}/api/speakwell/sessions`, {
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
          total_frames:     sc.length,
          rating:           summary.rating,
          tips:             summary.tips,
          score_timeline:   timelineRef.current,
        }),
      });

      setSummaryData({ ...summary, duration_seconds: elapsed });
      setSessName("");
    } catch (e) { setApiError("Save failed: " + e.message); }
    setSaving(false);
  };

  const deleteSession = async id => {
    try {
      await fetch(`${BACKEND_URL}/api/speakwell/sessions/${id}`, { method:"DELETE" });
      setSessions(p => p.filter(s => s.id !== id));
    } catch (e) { setApiError(e.message); }
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const borderCol = analysis?.color==="green" ? "rgba(52,199,89,.45)"
    : analysis?.color==="red"    ? "rgba(255,59,48,.45)"
    : analysis?.color==="yellow" ? "rgba(255,159,10,.45)"
    : T.border;

  const statusLabel = analysis?.color==="green"  ? "Good gesture"
    : analysis?.color==="yellow" ? "Needs attention"
    : analysis?.color==="red"    ? "Incorrect gesture"
    : "Ready";

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:T.font,
      color:T.text, WebkitFontSmoothing:"antialiased" }}>

      {/* Summary modal */}
      {summaryData && <SummaryModal data={summaryData} onClose={() => setSummaryData(null)} />}

      {/* Header */}
      <div style={{ background:"rgba(245,245,247,.85)", backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:960, margin:"0 auto", padding:"0 20px",
          height:52, display:"flex", alignItems:"center", justifyContent:"space-between" }}>
          <div style={{ display:"flex", alignItems:"center", gap:8 }}>
            <div style={{ width:28, height:28, borderRadius:8, background:T.text,
              display:"flex", alignItems:"center", justifyContent:"center" }}>
              <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
                stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
                <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
                <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
                <line x1="12" y1="19" x2="12" y2="22"/>
              </svg>
            </div>
            <span style={{ fontSize:15, fontWeight:600, letterSpacing:"-.02em" }}>SpeakWell</span>
          </div>

          <div style={{ display:"flex", gap:2 }}>
            {["practice","history"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:"6px 14px", borderRadius:T.radiusSm, border:"none",
                fontSize:13, fontWeight:500, cursor:"pointer",
                letterSpacing:"-.01em", textTransform:"capitalize",
                background: tab===t ? T.text : "transparent",
                color:      tab===t ? "#fff" : T.muted,
                transition:"all .15s",
              }}>{t}</button>
            ))}
          </div>

          <div style={{ display:"flex", alignItems:"center", gap:6,
            padding:"4px 10px", borderRadius:20,
            background: mlOn ? "rgba(52,199,89,.1)" : "rgba(0,0,0,.05)",
            border:`1px solid ${mlOn ? "rgba(52,199,89,.3)" : T.border}` }}>
            <div style={{ width:6, height:6, borderRadius:"50%",
              background: mlOn ? T.green : T.hint }}/>
            <span style={{ fontSize:11, fontWeight:600,
              color: mlOn ? "#1a7a34" : T.muted }}>
              {mlOn ? "ML live" : "ML offline"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:960, margin:"0 auto", padding:"28px 20px" }}>

        {/* Error banner */}
        {apiError && (
          <div style={{ padding:"10px 16px", borderRadius:T.radiusSm, marginBottom:16,
            background:"rgba(255,59,48,.07)", border:`1px solid rgba(255,59,48,.2)`,
            fontSize:12, color:T.red, display:"flex", alignItems:"center", gap:8 }}>
            <span>⚠</span>{apiError}
            <button onClick={() => setApiError("")} style={{ marginLeft:"auto",
              background:"none", border:"none", cursor:"pointer", color:T.hint }}>✕</button>
          </div>
        )}

        {/* ── PRACTICE TAB ─────────────────────────────────────── */}
        {tab === "practice" && (
          <div>
            <div style={{ display:"flex", alignItems:"center",
              justifyContent:"space-between", marginBottom:20, flexWrap:"wrap", gap:10 }}>
              <div>
                <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-.03em",
                  color:T.text, marginBottom:2 }}>Practice</h1>
                <p style={{ fontSize:13, color:T.muted }}>Real-time gesture analysis</p>
              </div>
              <input value={sessName} onChange={e => setSessName(e.target.value)}
                placeholder="Session name"
                disabled={recording}
                style={{ height:36, borderRadius:T.radiusSm,
                  border:`1px solid ${T.border}`, padding:"0 14px",
                  fontSize:13, background:T.surface, color:T.text,
                  outline:"none", width:220, fontFamily:T.font }} />
            </div>

            <div style={{ display:"grid", gridTemplateColumns:"1fr 268px",
              gap:16, alignItems:"start" }}>

              {/* Camera card */}
              <div style={{ borderRadius:T.radius, overflow:"hidden",
                background:"#000", border:`2px solid ${borderCol}`,
                transition:"border-color .3s", position:"relative" }}>

                <div style={{ position:"relative", aspectRatio:"16/10" }}>
                  <video ref={videoRef} muted playsInline
                    style={{ width:"100%", height:"100%", objectFit:"cover", display:"block",
                      opacity: annotated ? 0 : 1, position: annotated ? "absolute" : "relative" }} />
                  {annotated && (
                    <img src={annotated} alt=""
                      style={{ width:"100%", height:"100%", objectFit:"cover",
                        display:"block", position:"absolute", inset:0 }} />
                  )}
                  {!camReady && (
                    <div style={{ position:"absolute", inset:0, display:"flex",
                      alignItems:"center", justifyContent:"center" }}>
                      <p style={{ color:"rgba(255,255,255,.3)", fontSize:13 }}>Starting camera…</p>
                    </div>
                  )}

                  {/* Status badge */}
                  <div style={{ position:"absolute", top:12, left:12 }}>
                    <StatusPill color={analysis?.color||"neutral"} label={statusLabel} />
                  </div>

                  {/* Timer */}
                  {recording && (
                    <div style={{ position:"absolute", top:12, right:12,
                      display:"flex", alignItems:"center", gap:6,
                      padding:"5px 12px", borderRadius:20,
                      background:"rgba(0,0,0,.6)", backdropFilter:"blur(8px)",
                      color:"#fff", fontSize:13, fontFamily:"monospace" }}>
                      <div style={{ width:7, height:7, borderRadius:"50%",
                        background:T.red, animation:"blink 1.1s infinite" }}/>
                      {fmt(elapsed)}
                    </div>
                  )}

                  {/* FPS */}
                  {recording && (
                    <div style={{ position:"absolute", bottom:10, right:12,
                      fontSize:11, color:"rgba(255,255,255,.25)", fontFamily:"monospace" }}>
                      5fps
                    </div>
                  )}
                </div>

                {/* Controls */}
                <div style={{ padding:"14px 16px", display:"flex", gap:8,
                  borderTop:`1px solid rgba(255,255,255,.06)`,
                  background:"rgba(10,10,10,.95)" }}>
                  {!recording ? (
                    <button onClick={startSession} disabled={!camReady} style={{
                      flex:1, height:38, borderRadius:T.radiusSm, border:"none",
                      background: camReady ? T.green : "rgba(52,199,89,.3)",
                      color:"#fff", fontSize:13, fontWeight:600, cursor: camReady ? "pointer" : "not-allowed",
                      fontFamily:T.font, letterSpacing:"-.01em", display:"flex",
                      alignItems:"center", justifyContent:"center", gap:6,
                    }}>
                      <svg width="12" height="12" viewBox="0 0 24 24" fill="#fff"><polygon points="5 3 19 12 5 21 5 3"/></svg>
                      {camReady ? "Start session" : "Starting camera…"}
                    </button>
                  ) : (
                    <button onClick={stopSession} disabled={saving} style={{
                      flex:1, height:38, borderRadius:T.radiusSm, border:"none",
                      background:T.red, color:"#fff", fontSize:13, fontWeight:600,
                      cursor:"pointer", fontFamily:T.font, letterSpacing:"-.01em",
                      display:"flex", alignItems:"center", justifyContent:"center", gap:6,
                    }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff"><rect x="3" y="3" width="18" height="18" rx="2"/></svg>
                      {saving ? "Saving…" : "Stop & save"}
                    </button>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Card>
                  <Label>Gesture score</Label>
                  <ScoreArc score={analysis?.score || 0} />
                  <MiniTimeline scores={scores} />
                </Card>

                <Card>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    alignItems:"center", marginBottom:12 }}>
                    <Label style={{ marginBottom:0 }}>Live feedback</Label>
                    {analysis && (
                      <span style={{ fontSize:11, color:T.hint,
                        background:T.bg, padding:"2px 8px", borderRadius:10 }}>
                        
                      </span>
                    )}
                  </div>
                  <FeedbackList analysis={analysis} error={""} />
                </Card>
              </div>
            </div>

            {/* Tips row */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
              gap:10, marginTop:16 }}>
              {[
                ["🤲","Open palms","Face palms outward to signal openness"],
                ["📐","Gesture zone","Keep hands between waist and shoulders"],
                ["⚖️","Symmetry","Use both hands equally for emphasis"],
                ["✋","No fists","Closed hands signal tension or anxiety"],
              ].map(([icon,title,desc]) => (
                <Card key={title} style={{ padding:"14px 16px" }}>
                  <div style={{ fontSize:20, marginBottom:8 }}>{icon}</div>
                  <p style={{ fontSize:12, fontWeight:600, marginBottom:4 }}>{title}</p>
                  <p style={{ fontSize:11, color:T.muted, lineHeight:1.55 }}>{desc}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ──────────────────────────────────────── */}
        {tab === "history" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:20 }}>
              <div>
                <h1 style={{ fontSize:26, fontWeight:700, letterSpacing:"-.03em",
                  marginBottom:2 }}>History</h1>
                <p style={{ fontSize:13, color:T.muted }}>Your practice sessions</p>
              </div>
              <button onClick={loadHistory} style={{
                height:34, padding:"0 14px", borderRadius:T.radiusSm,
                border:`1px solid ${T.border}`, background:T.surface,
                fontSize:12, color:T.muted, cursor:"pointer", fontFamily:T.font,
                display:"flex", alignItems:"center", gap:5,
              }}>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none"
                  stroke="currentColor" strokeWidth="2" strokeLinecap="round"
                  style={{ animation: loadingHist ? "spin 1s linear infinite" : "none" }}>
                  <polyline points="23 4 23 10 17 10"/>
                  <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/>
                </svg>
                Refresh
              </button>
            </div>

            {/* Stats */}
            {stats && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                gap:10, marginBottom:20 }}>
                {[
                  ["Sessions",    stats.total_sessions ?? 0],
                  ["Avg score",   stats.overall_avg    ?? "—"],
                  ["Best score",  stats.best_score     ?? "—"],
                  ["Minutes",     stats.total_minutes  ? `${stats.total_minutes}m` : "0m"],
                ].map(([l,v]) => (
                  <Card key={l} style={{ textAlign:"center" }}>
                    <p style={{ fontSize:24, fontWeight:700, letterSpacing:"-.02em",
                      color:T.text, marginBottom:4 }}>{v}</p>
                    <p style={{ fontSize:11, color:T.muted, textTransform:"uppercase",
                      letterSpacing:".05em" }}>{l}</p>
                  </Card>
                ))}
              </div>
            )}

            {loadingHist ? (
              <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                {[1,2,3].map(i => (
                  <div key={i} style={{ height:100, borderRadius:T.radius,
                    background:T.surface, border:`1px solid ${T.border}`,
                    animation:"pulse 1.4s ease-in-out infinite" }} />
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"60px 20px" }}>
                <div style={{ fontSize:40, marginBottom:14, opacity:.3 }}>🎤</div>
                <p style={{ fontSize:15, color:T.muted, marginBottom:6 }}>No sessions yet</p>
                <p style={{ fontSize:13, color:T.hint }}>Complete a practice session to see it here</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {sessions.map(s => (
                  <SessionCard key={s.id} s={s} onDelete={deleteSession} />
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      <style>{`
        @keyframes blink { 0%,100%{opacity:1} 50%{opacity:.2} }
        @keyframes spin   { to{transform:rotate(360deg)} }
        @keyframes pulse  { 0%,100%{opacity:.6} 50%{opacity:.3} }
        * { box-sizing: border-box; margin: 0; padding: 0; }
      `}</style>
    </div>
  );
}