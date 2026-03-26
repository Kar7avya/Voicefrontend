import React, { useState, useRef, useEffect, useCallback } from "react";

const ML_URL      = process.env.REACT_APP_ML_URL      || "";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

// ── Design tokens ─────────────────────────────────────────────────
const T = {
  bg:"#f5f5f7", surface:"#ffffff", border:"rgba(0,0,0,0.08)",
  text:"#1d1d1f", muted:"#6e6e73", hint:"#aeaeb2",
  green:"#34c759", yellow:"#ff9f0a", red:"#ff3b30", blue:"#0071e3",
  radius:"14px", radiusSm:"10px",
  font:"-apple-system,BlinkMacSystemFont,'SF Pro Display','Helvetica Neue',sans-serif",
};

// ── Hand connections for canvas drawing ───────────────────────────
const HAND_CONN = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];
const POSE_CONN = [
  [11,12],[11,23],[12,24],[23,24],
  [11,13],[13,15],[12,14],[14,16],
  [23,25],[25,27],[24,26],[26,28],
];
const QUALITY_COLOR = {
  good:    "#32c95a",
  bad:     "#ff3b30",
  warning: "#ff9f0a",
  ok:      "rgba(255,255,255,0.5)",
};

// ── Draw skeleton on canvas using landmark data ───────────────────
function drawSkeleton(ctx, W, H, handLms, poseLms, gestures) {
  ctx.clearRect(0, 0, W, H);

  // Pose — thin white lines
  if (poseLms?.length) {
    ctx.strokeStyle = "rgba(255,255,255,0.5)";
    ctx.lineWidth   = 1.5;
    POSE_CONN.forEach(([a, b]) => {
      if (poseLms[a]?.v > 0.5 && poseLms[b]?.v > 0.5) {
        ctx.beginPath();
        ctx.moveTo(poseLms[a].x * W, poseLms[a].y * H);
        ctx.lineTo(poseLms[b].x * W, poseLms[b].y * H);
        ctx.stroke();
      }
    });
    [11,12,13,14,15,16,23,24,25,26,27,28].forEach(i => {
      if (poseLms[i]?.v > 0.5) {
        ctx.beginPath();
        ctx.arc(poseLms[i].x * W, poseLms[i].y * H, 4, 0, Math.PI * 2);
        ctx.fillStyle   = "rgba(255,255,255,0.8)";
        ctx.strokeStyle = "rgba(180,180,180,0.6)";
        ctx.lineWidth   = 1;
        ctx.fill(); ctx.stroke();
      }
    });
  }

  // Hands — colored by quality
  handLms.forEach((lms, hi) => {
    const q   = gestures?.[hi]?.quality || "ok";
    const col = QUALITY_COLOR[q] || QUALITY_COLOR.ok;

    // Lines
    ctx.strokeStyle = col;
    ctx.lineWidth   = 2;
    HAND_CONN.forEach(([a, b]) => {
      ctx.beginPath();
      ctx.moveTo(lms[a].x * W, lms[a].y * H);
      ctx.lineTo(lms[b].x * W, lms[b].y * H);
      ctx.stroke();
    });

    // Dots
    lms.forEach((lm, li) => {
      const r = li === 0 ? 6 : 4;
      ctx.beginPath();
      ctx.arc(lm.x * W, lm.y * H, r, 0, Math.PI * 2);
      ctx.fillStyle   = col;
      ctx.strokeStyle = "rgba(255,255,255,0.9)";
      ctx.lineWidth   = 1;
      ctx.fill(); ctx.stroke();
    });
  });
}

// ── Reusable UI ───────────────────────────────────────────────────
const Card = ({ children, style }) => (
  <div style={{ background:T.surface, borderRadius:T.radius,
    border:`1px solid ${T.border}`, padding:"18px", ...style }}>{children}</div>
);

const Label = ({ children }) => (
  <p style={{ fontSize:11, fontWeight:600, color:T.muted, letterSpacing:".06em",
    textTransform:"uppercase", marginBottom:8 }}>{children}</p>
);

function ScoreArc({ score }) {
  const r = 40, circ = 2 * Math.PI * r;
  const col = score>=75?T.green:score>=50?T.yellow:score>0?T.red:T.hint;
  return (
    <svg width="100" height="100" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r={r} fill="none" stroke={T.border} strokeWidth="6"/>
      <circle cx="50" cy="50" r={r} fill="none" stroke={col} strokeWidth="6"
        strokeLinecap="round"
        strokeDasharray={`${(score/100)*circ} ${circ}`}
        strokeDashoffset={circ/4}
        style={{ transition:"stroke-dasharray .4s,stroke .3s" }}/>
      <text x="50" y="46" textAnchor="middle" fontSize="20" fontWeight="600"
        fill={col} fontFamily={T.font}>{score>0?score:"—"}</text>
      <text x="50" y="60" textAnchor="middle" fontSize="9" fill={T.muted}
        fontFamily={T.font}>{score>=75?"excellent":score>=50?"good":score>0?"improve":"waiting"}</text>
    </svg>
  );
}

// ── Snapshot grid ─────────────────────────────────────────────────
function SnapshotGrid({ snapshots }) {
  if (!snapshots?.length) return (
    <p style={{ fontSize:12, color:T.hint, textAlign:"center", padding:"20px 0" }}>
      Key moments will appear here during your session
    </p>
  );
  return (
    <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
      {snapshots.map((s, i) => (
        <div key={i} style={{ borderRadius:8, overflow:"hidden",
          border:`1px solid ${T.border}`, position:"relative" }}>
          <img src={`data:image/jpeg;base64,${s.img}`} alt=""
            style={{ width:"100%", display:"block" }}/>
          <div style={{ position:"absolute", bottom:0, left:0, right:0,
            padding:"3px 6px", background:"rgba(0,0,0,.55)",
            fontSize:10, color:"#fff", fontFamily:"monospace" }}>
            {s.time}s · {s.score}
          </div>
        </div>
      ))}
    </div>
  );
}

// ── AI Coaching card ──────────────────────────────────────────────
function CoachingCard({ coaching, loading }) {
  if (loading) return (
    <Card>
      <Label>AI Coaching</Label>
      <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
        {[100, 80, 90].map((w, i) => (
          <div key={i} style={{ height:12, width:`${w}%`, borderRadius:6,
            background:T.bg, animation:"pulse 1.4s ease-in-out infinite" }}/>
        ))}
      </div>
    </Card>
  );
  if (!coaching) return null;

  const ratingCol = {
    Excellent:T.green, Good:T.blue,
    "Needs Improvement":T.yellow, Beginner:T.red, Poor:T.red,
  };

  return (
    <Card>
      <div style={{ display:"flex", justifyContent:"space-between",
        alignItems:"center", marginBottom:12 }}>
        <Label style={{ marginBottom:0 }}>AI Coaching</Label>
        <span style={{ fontSize:11, fontWeight:600,
          color:ratingCol[coaching.rating]||T.muted }}>
          {coaching.rating}
        </span>
      </div>
      <p style={{ fontSize:13, fontWeight:600, color:T.text,
        marginBottom:8, lineHeight:1.4 }}>{coaching.headline}</p>
      <p style={{ fontSize:12, color:T.muted, lineHeight:1.65,
        marginBottom:12 }}>{coaching.body}</p>
      {coaching.actions?.length > 0 && (
        <div>
          <p style={{ fontSize:11, color:T.hint, textTransform:"uppercase",
            letterSpacing:".05em", marginBottom:6 }}>Action items</p>
          {coaching.actions.map((a, i) => (
            <div key={i} style={{ display:"flex", gap:8, alignItems:"flex-start",
              fontSize:12, color:T.muted, lineHeight:1.55, marginBottom:5 }}>
              <span style={{ color:T.blue, fontWeight:700, flexShrink:0 }}>
                {i+1}.
              </span>{a}
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}

// ── Summary modal ─────────────────────────────────────────────────
function SummaryModal({ data, onClose }) {
  const rc = { Excellent:T.green, Good:T.blue,
    "Needs Improvement":T.yellow, Poor:T.red };
  if (!data) return null;
  return (
    <div style={{ position:"fixed", inset:0, zIndex:1000,
      background:"rgba(0,0,0,.45)", backdropFilter:"blur(12px)",
      display:"flex", alignItems:"center", justifyContent:"center", padding:20 }}>
      <div style={{ background:T.surface, borderRadius:20, padding:26,
        width:"100%", maxWidth:420, fontFamily:T.font }}>
        <div style={{ display:"flex", justifyContent:"space-between",
          alignItems:"flex-start", marginBottom:20 }}>
          <div>
            <p style={{ fontSize:12, color:T.muted, marginBottom:4 }}>Session saved</p>
            <p style={{ fontSize:30, fontWeight:700, letterSpacing:"-.02em",
              color:T.text, lineHeight:1 }}>
              {data.avg_score}
              <span style={{ fontSize:16, color:T.muted, fontWeight:400 }}>/100</span>
            </p>
            <p style={{ fontSize:13, fontWeight:600, marginTop:4,
              color:rc[data.rating]||T.text }}>{data.rating}</p>
          </div>
          <button onClick={onClose} style={{ width:28, height:28, borderRadius:"50%",
            background:"rgba(0,0,0,.06)", border:"none", cursor:"pointer",
            color:T.muted, fontSize:14 }}>✕</button>
        </div>

        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          gap:8, marginBottom:18 }}>
          {[["Best",data.max_score],
            ["Duration",`${Math.floor((data.duration_seconds||0)/60)}m`],
            ["Frames",data.total_frames]].map(([l,v])=>(
            <div key={l} style={{ background:T.bg, borderRadius:T.radiusSm,
              padding:"10px 8px", textAlign:"center" }}>
              <p style={{ fontSize:16, fontWeight:600, color:T.text }}>{v}</p>
              <p style={{ fontSize:10, color:T.muted, marginTop:2,
                textTransform:"uppercase", letterSpacing:".04em" }}>{l}</p>
            </div>
          ))}
        </div>

        <div style={{ marginBottom:18 }}>
          <div style={{ height:5, borderRadius:5, overflow:"hidden",
            display:"flex", background:T.bg }}>
            <div style={{ width:`${data.good_percent}%`,
              background:T.green, height:"100%" }}/>
            <div style={{ width:`${data.warn_percent}%`,
              background:T.yellow, height:"100%" }}/>
            <div style={{ width:`${data.bad_percent}%`,
              background:T.red, height:"100%" }}/>
          </div>
          <div style={{ display:"flex", gap:14, marginTop:6 }}>
            {[[T.green,`${data.good_percent}% good`],
              [T.yellow,`${data.warn_percent}% warn`],
              [T.red,`${data.bad_percent}% poor`]].map(([c,l])=>(
              <div key={l} style={{ display:"flex", alignItems:"center", gap:4 }}>
                <div style={{ width:5, height:5, borderRadius:"50%", background:c }}/>
                <span style={{ fontSize:11, color:T.muted }}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        <button onClick={onClose} style={{ width:"100%", height:42,
          borderRadius:T.radiusSm, background:T.text, color:"#fff",
          border:"none", fontSize:13, fontWeight:600, cursor:"pointer",
          fontFamily:T.font }}>
          View coaching report
        </button>
      </div>
    </div>
  );
}

// ── Main component ────────────────────────────────────────────────
export default function SpeakWell() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);   // overlay canvas — drawn client-side
  const captureRef  = useRef(null);   // hidden capture canvas
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);
  const timerRef    = useRef(null);
  const scoresRef   = useRef([]);
  const gestureLogRef = useRef([]);
  const snapshotTimerRef = useRef(null);
  const frameCountRef  = useRef(0);
  const lastResultRef  = useRef(null);

  const [tab,         setTab]         = useState("practice");
  const [camReady,    setCamReady]    = useState(false);
  const [recording,   setRecording]   = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [analysis,    setAnalysis]    = useState(null);
  const [scores,      setScores]      = useState([]);
  const [mlOn,        setMlOn]        = useState(false);
  const [apiError,    setApiError]    = useState("");
  const [sessName,    setSessName]    = useState("");
  const [sessions,    setSessions]    = useState([]);
  const [stats,       setStats]       = useState(null);
  const [loadingHist, setLoadingHist] = useState(false);
  const [summaryData, setSummaryData] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [snapshots,   setSnapshots]   = useState([]);
  const [coaching,    setCoaching]    = useState(null);
  const [coachLoading,setCoachLoading]= useState(false);

  // ── Camera init ───────────────────────────────────────────────
  useEffect(() => {
    navigator.mediaDevices
      .getUserMedia({ video:{ width:640,height:480,facingMode:"user" }, audio:false })
      .then(stream => {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current.play(); setCamReady(true);
          };
        }
      }).catch(e => setApiError("Camera: " + e.message));
    return () => streamRef.current?.getTracks().forEach(t => t.stop());
  }, []);

  useEffect(() => {
    if (tab === "history") loadHistory();
  }, [tab]);

  const loadHistory = async () => {
    setLoadingHist(true);
    try {
      const [sr, st] = await Promise.all([
        fetch(`${BACKEND_URL}/api/speakwell/sessions`).then(r=>r.json()),
        fetch(`${BACKEND_URL}/api/speakwell/stats`).then(r=>r.json()),
      ]);
      setSessions(sr.sessions || []);
      setStats(st.stats || null);
    } catch (e) { setApiError("Could not load history"); }
    setLoadingHist(false);
  };

  // ── FAST frame analysis — no annotated image returned ────────
  const analyzeFrame = useCallback(async () => {
    const video = videoRef.current;
    const canvas = canvasRef.current;
    if (!video || video.readyState < 2 || !canvas) return;

    // Capture frame
    const cap = captureRef.current;
    cap.width = 640; cap.height = 480;
    cap.getContext("2d").drawImage(video, 0, 0, 640, 480);
    const frame = cap.toDataURL("image/jpeg", 0.6);   // lower quality = faster transfer

    // Take snapshot every 15 seconds of good/bad moments
    const takeSnap = frameCountRef.current % 75 === 0 && scoresRef.current.length > 5;
    frameCountRef.current++;

    try {
      const res = await fetch(`${ML_URL}/analyze`, {
        method:"POST",
        headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ frame, take_snapshot: takeSnap }),
        signal: AbortSignal.timeout(4000),
      });
      if (!res.ok) throw new Error(`ML ${res.status}`);
      const data = await res.json();

      // Draw skeleton on canvas — this is instant, no lag
      const ctx = canvas.getContext("2d");
      drawSkeleton(ctx, canvas.width, canvas.height,
        data.hand_lms || [], data.pose_lms || [], data.analysis?.gestures);

      setAnalysis(data.analysis);
      setMlOn(true);
      setApiError("");

      const sc = data.analysis?.score || 0;
      scoresRef.current.push(sc);
      setScores([...scoresRef.current]);

      // Log gestures for coaching
      (data.analysis?.gestures || []).forEach(g => {
        gestureLogRef.current.push(g.gesture);
      });

      lastResultRef.current = data.analysis;

      // Save snapshot if returned
      if (data.snapshot) {
        setSnapshots(prev => [...prev.slice(-5), {
          img:   data.snapshot,
          time:  elapsed,
          score: sc,
        }]);
      }

    } catch (e) {
      setMlOn(false);
      // Don't show error for timeouts — just skip frame
      if (!e.message.includes("timeout")) setApiError(e.message);
    }
  }, [elapsed]);

  const startSession = () => {
    scoresRef.current    = [];
    gestureLogRef.current = [];
    frameCountRef.current = 0;
    setScores([]); setElapsed(0); setRecording(true);
    setAnalysis(null); setSnapshots([]); setCoaching(null);
    setApiError("");

    // Resize canvas to match video
    if (canvasRef.current && videoRef.current) {
      canvasRef.current.width  = videoRef.current.videoWidth  || 640;
      canvasRef.current.height = videoRef.current.videoHeight || 480;
    }

    // Send frame every 250ms = 4fps to ML — fast enough, low enough lag
    intervalRef.current = setInterval(analyzeFrame, 250);
    timerRef.current    = setInterval(() => setElapsed(p => p+1), 1000);
  };

  const stopSession = async () => {
    setRecording(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);

    // Clear canvas
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }

    const sc = scoresRef.current;
    if (!sc.length) return;
    setSaving(true);

    try {
      // 1. Get session summary
      const sumRes  = await fetch(`${ML_URL}/analyze_session`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({ scores: sc }),
      });
      const summary = await sumRes.json();

      // 2. Get AI coaching
      setCoachLoading(true);
      const coachRes  = await fetch(`${ML_URL}/coaching`, {
        method:"POST", headers:{"Content-Type":"application/json"},
        body: JSON.stringify({
          scores:       sc,
          gesture_log:  gestureLogRef.current,
          duration_seconds: elapsed,
        }),
      });
      const coachData = await coachRes.json();
      setCoaching(coachData.coaching);
      setCoachLoading(false);

      // 3. Save to backend → Supabase
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
          score_timeline:   sc.map((s, i) => ({ t: i * 0.25, score: s })),
          coaching:         coachData.coaching,
          snapshots:        snapshots.map(s => ({ time:s.time, score:s.score })),
        }),
      });

      setSummaryData({ ...summary, duration_seconds: elapsed });
      setSessName("");
    } catch (e) {
      setApiError("Save failed: " + e.message);
    }
    setSaving(false);
  };

  const fmt = s => `${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const borderCol = analysis?.color==="green" ? "rgba(52,199,89,.5)"
    : analysis?.color==="red"    ? "rgba(255,59,48,.5)"
    : analysis?.color==="yellow" ? "rgba(255,159,10,.5)"
    : T.border;

  const statusLabel = analysis?.color==="green"  ? "Good gesture"
    : analysis?.color==="yellow" ? "Needs attention"
    : analysis?.color==="red"    ? "Incorrect"
    : "Ready";

  return (
    <div style={{ background:T.bg, minHeight:"100vh", fontFamily:T.font,
      color:T.text, WebkitFontSmoothing:"antialiased" }}>

      {summaryData && (
        <SummaryModal data={summaryData} onClose={() => setSummaryData(null)} />
      )}

      {/* Header */}
      <div style={{ background:"rgba(245,245,247,.85)", backdropFilter:"blur(20px)",
        borderBottom:`1px solid ${T.border}`, position:"sticky", top:0, zIndex:100 }}>
        <div style={{ maxWidth:980, margin:"0 auto", padding:"0 20px",
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
            <span style={{ fontSize:15, fontWeight:600, letterSpacing:"-.02em" }}>
              SpeakWell
            </span>
          </div>
          <div style={{ display:"flex", gap:2 }}>
            {["practice","history"].map(t => (
              <button key={t} onClick={() => setTab(t)} style={{
                padding:"6px 14px", borderRadius:T.radiusSm, border:"none",
                fontSize:13, fontWeight:500, cursor:"pointer",
                letterSpacing:"-.01em", textTransform:"capitalize",
                background: tab===t ? T.text : "transparent",
                color:      tab===t ? "#fff" : T.muted, transition:"all .15s",
              }}>{t}</button>
            ))}
          </div>
          <div style={{ display:"flex", alignItems:"center", gap:5,
            padding:"4px 10px", borderRadius:20,
            background: mlOn?"rgba(52,199,89,.1)":"rgba(0,0,0,.05)",
            border:`1px solid ${mlOn?"rgba(52,199,89,.3)":T.border}` }}>
            <div style={{ width:6, height:6, borderRadius:"50%",
              background: mlOn?T.green:T.hint }}/>
            <span style={{ fontSize:11, fontWeight:600,
              color: mlOn?"#1a7a34":T.muted }}>
              {mlOn ? "ML live" : "ML offline"}
            </span>
          </div>
        </div>
      </div>

      <div style={{ maxWidth:980, margin:"0 auto", padding:"24px 20px" }}>

        {apiError && (
          <div style={{ padding:"9px 14px", borderRadius:T.radiusSm, marginBottom:14,
            background:"rgba(255,59,48,.07)", border:`1px solid rgba(255,59,48,.2)`,
            fontSize:12, color:T.red, display:"flex", alignItems:"center", gap:8 }}>
            ⚠ {apiError}
            <button onClick={() => setApiError("")} style={{ marginLeft:"auto",
              background:"none", border:"none", cursor:"pointer", color:T.hint }}>✕</button>
          </div>
        )}

        {/* ── PRACTICE TAB ─────────────────────────────────── */}
        {tab === "practice" && (
          <div>
            <div style={{ display:"flex", alignItems:"center",
              justifyContent:"space-between", marginBottom:18, flexWrap:"wrap", gap:10 }}>
              <div>
                <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:"-.03em",
                  marginBottom:2 }}>Practice</h1>
                <p style={{ fontSize:13, color:T.muted }}>
                  Live gesture analysis — skeleton drawn locally for zero lag
                </p>
              </div>
              <input value={sessName} onChange={e=>setSessName(e.target.value)}
                placeholder="Session name" disabled={recording}
                style={{ height:34, borderRadius:T.radiusSm,
                  border:`1px solid ${T.border}`, padding:"0 12px",
                  fontSize:13, background:T.surface, color:T.text,
                  outline:"none", width:200, fontFamily:T.font }}/>
            </div>

            <div style={{ display:"grid",
              gridTemplateColumns:"1fr 270px", gap:14, alignItems:"start" }}>

              {/* Camera +canvas overlay */}
              <div style={{ borderRadius:T.radius, overflow:"hidden",
                background:"#000", border:`2px solid ${borderCol}`,
                transition:"border-color .3s", position:"relative" }}>

                <div style={{ position:"relative", aspectRatio:"4/3" }}>
                  <video ref={videoRef} muted playsInline
                    style={{ width:"100%", height:"100%",
                      objectFit:"cover", display:"block" }}/>

                  {/* Canvas drawn on top of video — skeleton lives here */}
                  <canvas ref={canvasRef}
                    style={{ position:"absolute", inset:0,
                      width:"100%", height:"100%", pointerEvents:"none" }}/>

                  {!camReady && (
                    <div style={{ position:"absolute", inset:0, display:"flex",
                      alignItems:"center", justifyContent:"center" }}>
                      <p style={{ color:"rgba(255,255,255,.3)", fontSize:13 }}>
                        Starting camera…
                      </p>
                    </div>
                  )}

                  {/* Status pill */}
                  <div style={{ position:"absolute", top:10, left:10,
                    display:"inline-flex", alignItems:"center", gap:5,
                    padding:"4px 11px", borderRadius:20,
                    background: analysis?.color==="green"  ? "rgba(52,199,89,.18)"
                      : analysis?.color==="yellow" ? "rgba(255,159,10,.18)"
                      : analysis?.color==="red"    ? "rgba(255,59,48,.18)"
                      : "rgba(0,0,0,.35)",
                    border:`1px solid ${borderCol}`,
                    backdropFilter:"blur(6px)",
                    fontSize:12, fontWeight:600,
                    color: analysis?.color==="green"  ? "#1a7a34"
                      : analysis?.color==="yellow" ? "#7a4a00"
                      : analysis?.color==="red"    ? "#a80000"
                      : "rgba(255,255,255,.6)" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%",
                      background: analysis?.color==="green"  ? T.green
                        : analysis?.color==="yellow" ? T.yellow
                        : analysis?.color==="red"    ? T.red
                        : "rgba(255,255,255,.4)" }}/>
                    {statusLabel}
                  </div>

                  {/* Timer */}
                  {recording && (
                    <div style={{ position:"absolute", top:10, right:10,
                      display:"flex", alignItems:"center", gap:5,
                      padding:"4px 11px", borderRadius:20,
                      background:"rgba(0,0,0,.6)", backdropFilter:"blur(8px)",
                      color:"#fff", fontSize:13, fontFamily:"monospace" }}>
                      <div style={{ width:6, height:6, borderRadius:"50%",
                        background:T.red, animation:"blink 1.1s infinite" }}/>
                      {fmt(elapsed)}
                    </div>
                  )}
                </div>

                {/* Controls bar */}
                <div style={{ padding:"12px 14px", display:"flex", gap:8,
                  background:"rgba(8,8,8,.96)",
                  borderTop:"1px solid rgba(255,255,255,.06)" }}>
                  {!recording ? (
                    <button onClick={startSession} disabled={!camReady} style={{
                      flex:1, height:36, borderRadius:T.radiusSm, border:"none",
                      background: camReady?T.green:"rgba(52,199,89,.3)",
                      color:"#fff", fontSize:13, fontWeight:600,
                      cursor: camReady?"pointer":"not-allowed",
                      fontFamily:T.font, display:"flex",
                      alignItems:"center", justifyContent:"center", gap:6 }}>
                      <svg width="11" height="11" viewBox="0 0 24 24" fill="#fff">
                        <polygon points="5 3 19 12 5 21 5 3"/>
                      </svg>
                      {camReady ? "Start session" : "Starting camera…"}
                    </button>
                  ) : (
                    <button onClick={stopSession} disabled={saving} style={{
                      flex:1, height:36, borderRadius:T.radiusSm, border:"none",
                      background:T.red, color:"#fff", fontSize:13, fontWeight:600,
                      cursor:"pointer", fontFamily:T.font,
                      display:"flex", alignItems:"center",
                      justifyContent:"center", gap:6 }}>
                      <svg width="10" height="10" viewBox="0 0 24 24" fill="#fff">
                        <rect x="3" y="3" width="18" height="18" rx="2"/>
                      </svg>
                      {saving ? "Saving…" : "Stop & save"}
                    </button>
                  )}
                </div>
              </div>

              {/* Right panel */}
              <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                <Card>
                  <Label>Score</Label>
                  <div style={{ display:"flex", justifyContent:"center" }}>
                    <ScoreArc score={analysis?.score || 0} />
                  </div>
                  {scores.length > 1 && (
                    <div style={{ marginTop:10 }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        fontSize:11, color:T.muted, marginBottom:5 }}>
                        <span>Timeline</span>
                        <span style={{ fontWeight:600 }}>
                          avg {Math.round(scores.reduce((a,b)=>a+b,0)/scores.length)}
                        </span>
                      </div>
                      <svg viewBox="0 0 220 40" width="100%"
                        style={{ display:"block", overflow:"visible" }}>
                        {(() => {
                          const last = scores.slice(-60);
                          if (last.length < 2) return null;
                          const avg = Math.round(last.reduce((a,b)=>a+b,0)/last.length);
                          const col = avg>=75?T.green:avg>=50?T.yellow:T.red;
                          const pts = last.map((s,i) => ({
                            x:(i/(last.length-1))*220, y:40-(s/100)*40
                          }));
                          return <>
                            <polyline
                              points={pts.map(p=>`${p.x},${p.y}`).join(" ")}
                              fill="none" stroke={col} strokeWidth="1.5"
                              strokeLinejoin="round"/>
                            <circle cx={pts[pts.length-1].x}
                              cy={pts[pts.length-1].y} r="2.5" fill={col}/>
                          </>;
                        })()}
                      </svg>
                    </div>
                  )}
                </Card>

                <Card>
                  <Label>Feedback</Label>
                  {!analysis ? (
                    <p style={{ fontSize:12, color:T.muted }}>
                      Start session to see feedback
                    </p>
                  ) : (
                    <div style={{ display:"flex", flexDirection:"column", gap:5 }}>
                      {analysis.gestures?.map((g,i) => (
                        <span key={i} style={{ fontSize:11, fontWeight:600,
                          padding:"3px 9px", borderRadius:20, display:"inline-block",
                          textTransform:"capitalize", width:"fit-content",
                          background: g.quality==="good"?"rgba(52,199,89,.1)":
                            g.quality==="bad"?"rgba(255,59,48,.1)":
                            g.quality==="warning"?"rgba(255,159,10,.1)":"rgba(0,0,0,.05)",
                          color: g.quality==="good"?"#1a7a34":
                            g.quality==="bad"?"#a80000":
                            g.quality==="warning"?"#7a4a00":T.muted }}>
                          {g.gesture.replace("_"," ")}
                        </span>
                      ))}
                      {analysis.positives?.slice(0,2).map((p,i) => (
                        <div key={i} style={{ display:"flex", gap:6,
                          fontSize:11, color:T.muted, lineHeight:1.5 }}>
                          <span style={{ color:T.green }}>✓</span>{p}
                        </div>
                      ))}
                      {analysis.issues?.slice(0,2).map((p,i) => (
                        <div key={i} style={{ display:"flex", gap:6,
                          fontSize:11, color:T.muted, lineHeight:1.5 }}>
                          <span style={{ color:T.yellow }}>⚠</span>{p}
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              </div>
            </div>

            {/* Snapshots + coaching — shown after session */}
            {(snapshots.length > 0 || coaching || coachLoading) && (
              <div style={{ display:"grid",
                gridTemplateColumns:"1fr 1fr", gap:14, marginTop:14 }}>
                <Card>
                  <Label>Session snapshots</Label>
                  <SnapshotGrid snapshots={snapshots} />
                </Card>
                <CoachingCard coaching={coaching} loading={coachLoading} />
              </div>
            )}

            {/* Tips */}
            <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
              gap:10, marginTop:14 }}>
              {[
                ["🤲","Open palms","Face palms outward"],
                ["📐","Gesture zone","Waist to shoulder"],
                ["⚖️","Symmetry","Both hands equal"],
                ["✋","No fists","Stay relaxed"],
              ].map(([ic,t,d]) => (
                <Card key={t} style={{ padding:"12px 14px" }}>
                  <div style={{ fontSize:18, marginBottom:6 }}>{ic}</div>
                  <p style={{ fontSize:12, fontWeight:600, marginBottom:3 }}>{t}</p>
                  <p style={{ fontSize:11, color:T.muted, lineHeight:1.5 }}>{d}</p>
                </Card>
              ))}
            </div>
          </div>
        )}

        {/* ── HISTORY TAB ──────────────────────────────────── */}
        {tab === "history" && (
          <div>
            <div style={{ display:"flex", justifyContent:"space-between",
              alignItems:"center", marginBottom:18 }}>
              <div>
                <h1 style={{ fontSize:24, fontWeight:700, letterSpacing:"-.03em",
                  marginBottom:2 }}>History</h1>
                <p style={{ fontSize:13, color:T.muted }}>
                  Your practice sessions
                </p>
              </div>
              <button onClick={loadHistory} style={{ height:32, padding:"0 12px",
                borderRadius:T.radiusSm, border:`1px solid ${T.border}`,
                background:T.surface, fontSize:12, color:T.muted,
                cursor:"pointer", fontFamily:T.font }}>
                Refresh
              </button>
            </div>

            {stats && (
              <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
                gap:10, marginBottom:18 }}>
                {[["Sessions",stats.total_sessions??0],
                  ["Avg score",stats.overall_avg??"—"],
                  ["Best",stats.best_score??"—"],
                  ["Minutes",stats.total_minutes?`${stats.total_minutes}m`:"0m"]
                ].map(([l,v])=>(
                  <Card key={l} style={{ textAlign:"center" }}>
                    <p style={{ fontSize:22, fontWeight:700, letterSpacing:"-.02em",
                      color:T.text, marginBottom:4 }}>{v}</p>
                    <p style={{ fontSize:10, color:T.muted, textTransform:"uppercase",
                      letterSpacing:".05em" }}>{l}</p>
                  </Card>
                ))}
              </div>
            )}

            {loadingHist ? (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {[1,2,3].map(i=>(
                  <div key={i} style={{ height:90, borderRadius:T.radius,
                    background:T.surface, border:`1px solid ${T.border}`,
                    animation:"pulse 1.4s ease-in-out infinite" }}/>
                ))}
              </div>
            ) : sessions.length === 0 ? (
              <div style={{ textAlign:"center", padding:"50px 20px" }}>
                <div style={{ fontSize:36, marginBottom:12, opacity:.3 }}>🎤</div>
                <p style={{ fontSize:14, color:T.muted }}>No sessions yet</p>
              </div>
            ) : (
              <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
                {sessions.map(s => {
                  const rc={Excellent:T.green,Good:T.blue,
                    "Needs Improvement":T.yellow,Poor:T.red};
                  const dur=s.duration_seconds
                    ?`${Math.floor(s.duration_seconds/60)}m ${s.duration_seconds%60}s`:"—";
                  return (
                    <Card key={s.id} style={{ padding:"14px 16px" }}>
                      <div style={{ display:"flex", justifyContent:"space-between",
                        alignItems:"flex-start" }}>
                        <div style={{ flex:1, minWidth:0 }}>
                          <div style={{ display:"flex", gap:8, alignItems:"center",
                            marginBottom:5 }}>
                            <p style={{ fontSize:13, fontWeight:600, color:T.text,
                              overflow:"hidden", textOverflow:"ellipsis",
                              whiteSpace:"nowrap" }}>{s.name}</p>
                            <span style={{ fontSize:11, fontWeight:600, flexShrink:0,
                              color:rc[s.rating]||T.muted }}>{s.rating}</span>
                          </div>
                          <div style={{ display:"flex", gap:14, fontSize:11,
                            color:T.muted, marginBottom:8, flexWrap:"wrap" }}>
                            <span>{new Date(s.created_at).toLocaleDateString("en-US",{month:"short",day:"numeric"})}</span>
                            <span>{dur}</span>
                            <span>Score <strong style={{color:T.text}}>{s.avg_score}</strong></span>
                          </div>
                          <div style={{ height:3, borderRadius:3, overflow:"hidden",
                            display:"flex", background:T.bg }}>
                            <div style={{width:`${s.good_percent}%`,background:T.green,height:"100%"}}/>
                            <div style={{width:`${s.warn_percent}%`,background:T.yellow,height:"100%"}}/>
                            <div style={{width:`${s.bad_percent}%`,background:T.red,height:"100%"}}/>
                          </div>
                        </div>
                      </div>
                    </Card>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Hidden capture canvas */}
      <canvas ref={captureRef} style={{ display:"none" }}/>

      <style>{`
        @keyframes blink  { 0%,100%{opacity:1} 50%{opacity:.15} }
        @keyframes pulse  { 0%,100%{opacity:.7} 50%{opacity:.3}  }
        * { box-sizing:border-box; margin:0; padding:0; }
      `}</style>
    </div>
  );
}