import React, { useState, useRef, useEffect, useCallback } from "react";

const ML_URL      = process.env.REACT_APP_ML_URL      || "";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

const HAND_CONN = [[0,1],[1,2],[2,3],[3,4],[0,5],[5,6],[6,7],[7,8],[0,9],[9,10],[10,11],[11,12],[0,13],[13,14],[14,15],[15,16],[0,17],[17,18],[18,19],[19,20],[5,9],[9,13],[13,17]];
const POSE_CONN = [[11,12],[11,13],[13,15],[12,14],[14,16],[11,23],[12,24],[23,24],[23,25],[25,27],[24,26],[26,28]];
const Q_COLOR   = { good:"#30d158", bad:"#ff453a", warning:"#ffd60a", ok:"rgba(255,255,255,0.4)" };

function drawSkeleton(canvas, landmarks, analysis) {
  if (!canvas || !landmarks) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const { hands=[], pose=[] } = landmarks;
  if (pose.length) {
    ctx.strokeStyle="rgba(255,255,255,0.3)"; ctx.lineWidth=2; ctx.lineCap="round";
    POSE_CONN.forEach(([a,b])=>{
      if(pose[a]?.v>0.4&&pose[b]?.v>0.4){
        ctx.beginPath(); ctx.moveTo(pose[a].x*W,pose[a].y*H);
        ctx.lineTo(pose[b].x*W,pose[b].y*H); ctx.stroke();
      }
    });
    [11,12,13,14,15,16,23,24,25,26,27,28].forEach(i=>{
      if(pose[i]?.v>0.4){
        ctx.beginPath(); ctx.arc(pose[i].x*W,pose[i].y*H,4,0,Math.PI*2);
        ctx.fillStyle="rgba(255,255,255,0.6)"; ctx.fill();
      }
    });
  }
  hands.forEach((lms,hi)=>{
    const q=analysis?.gestures?.find(g=>g.hand===hi)?.quality||"ok";
    const col=Q_COLOR[q];
    ctx.strokeStyle=col; ctx.lineWidth=2.5; ctx.lineCap="round";
    HAND_CONN.forEach(([a,b])=>{
      ctx.beginPath(); ctx.moveTo(lms[a].x*W,lms[a].y*H);
      ctx.lineTo(lms[b].x*W,lms[b].y*H); ctx.stroke();
    });
    lms.forEach((lm,i)=>{
      ctx.beginPath(); ctx.arc(lm.x*W,lm.y*H,i===0?6:4,0,Math.PI*2);
      ctx.fillStyle=col; ctx.fill();
      ctx.strokeStyle="rgba(255,255,255,0.8)"; ctx.lineWidth=1.5; ctx.stroke();
    });
  });
}

function ScoreRing({ score, size=120 }) {
  const r=size*0.38, circ=2*Math.PI*r;
  const col=score>=75?"#30d158":score>=50?"#ffd60a":score>0?"#ff453a":"rgba(255,255,255,0.15)";
  const lbl=score>=75?"Excellent":score>=50?"Good":score>0?"Improve":"—";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none" stroke={col} strokeWidth="6"
        strokeLinecap="round" strokeDasharray={`${(score/100)*circ} ${circ}`}
        strokeDashoffset={circ/4} style={{transition:"stroke-dasharray .5s,stroke .3s"}}/>
      <text x={size/2} y={size/2-6} textAnchor="middle" fontSize={size*0.22}
        fontWeight="700" fill={col} fontFamily="-apple-system,sans-serif">{score>0?score:"—"}</text>
      <text x={size/2} y={size/2+14} textAnchor="middle" fontSize={size*0.1}
        fill="rgba(255,255,255,0.4)" fontFamily="-apple-system,sans-serif">{lbl}</text>
    </svg>
  );
}

// ── Deep Result Modal ─────────────────────────────────────────────
function DeepResultModal({ data, onClose, onHistory }) {
  if (!data) return null;
  const col = data.avg_score>=75?"#30d158":data.avg_score>=50?"#ffd60a":"#ff453a";
  const m   = data.metrics || {};

  const MetricBox = ({ label, value, unit="" }) => (
    <div style={{ background:"rgba(255,255,255,0.05)", borderRadius:12,
      padding:"12px 10px", textAlign:"center" }}>
      <p style={{ fontSize:17, fontWeight:700, color:"#fff", letterSpacing:"-.01em" }}>
        {value ?? "—"}{unit}
      </p>
      <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:3,
        textTransform:"uppercase", letterSpacing:".05em" }}>{label}</p>
    </div>
  );

  const gestureDist = data.gesture_distribution || {};

  return (
    <div style={{ position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.8)", backdropFilter:"blur(20px)",
      overflowY:"auto", fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif" }}>
      <div style={{ maxWidth:460, margin:"0 auto", padding:"24px 16px 48px" }}>
        <div style={{ background:"rgba(28,28,30,0.98)",
          border:"1px solid rgba(255,255,255,0.08)",
          borderRadius:24, overflow:"hidden",
          animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)" }}>

          {/* Header */}
          <div style={{ padding:"28px 24px 20px", textAlign:"center",
            borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <ScoreRing score={data.avg_score} size={120}/>
            <p style={{ fontSize:24, fontWeight:700, color:"#fff",
              letterSpacing:"-.02em", marginTop:12 }}>{data.rating}</p>
            <p style={{ fontSize:13, color:"rgba(255,255,255,0.35)", marginTop:4 }}>
              {data.total_frames} frames · {data.duration_seconds}s · {data.fps_actual} fps
            </p>
          </div>

          {/* Score distribution */}
          <div style={{ padding:"20px 24px",
            borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
              Quality distribution
            </p>
            <div style={{ height:6, borderRadius:6, overflow:"hidden",
              display:"flex", background:"rgba(255,255,255,0.06)", marginBottom:8 }}>
              <div style={{ width:`${data.good_percent}%`,background:"#30d158",transition:"width .6s" }}/>
              <div style={{ width:`${data.warn_percent}%`,background:"#ffd60a",transition:"width .6s" }}/>
              <div style={{ width:`${data.bad_percent}%`, background:"#ff453a",transition:"width .6s" }}/>
            </div>
            <div style={{ display:"flex", gap:16 }}>
              {[["#30d158",`${data.good_percent}% good`],
                ["#ffd60a",`${data.warn_percent}% warn`],
                ["#ff453a",`${data.bad_percent}% poor`]].map(([c,l])=>(
                <div key={l} style={{ display:"flex", alignItems:"center", gap:5 }}>
                  <div style={{ width:6,height:6,borderRadius:"50%",background:c }}/>
                  <span style={{ fontSize:11,color:"rgba(255,255,255,0.35)" }}>{l}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Deep metrics */}
          <div style={{ padding:"20px 24px",
            borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>
              Performance metrics
            </p>
            <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
              <MetricBox label="Hand visibility" value={m.hand_visibility_pct} unit="%"/>
              <MetricBox label="Confidence" value={m.confidence_rate} unit="%"/>
              <MetricBox label="Consistency" value={m.score_variance ? 100-Math.min(m.score_variance/4,100)|0 : null} unit="%"/>
              <MetricBox label="Left elbow" value={m.avg_elbow_angle_left} unit="°"/>
              <MetricBox label="Right elbow" value={m.avg_elbow_angle_right} unit="°"/>
              <MetricBox label="Motion pace" value={m.avg_wrist_velocity ? (m.avg_wrist_velocity<0.005?"Static":m.avg_wrist_velocity>0.05?"Fast":"Good") : null}/>
            </div>
          </div>

          {/* Gesture breakdown */}
          <div style={{ padding:"20px 24px",
            borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
            <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)",
              textTransform:"uppercase", letterSpacing:".06em", marginBottom:12 }}>
              Gesture breakdown
            </p>
            <div style={{ display:"flex", flexDirection:"column", gap:8 }}>
              {[
                ["Open palm", gestureDist.open_palm_pct||0, "#30d158"],
                ["Neutral",   gestureDist.neutral_pct||0,   "rgba(255,255,255,0.3)"],
                ["Pointing",  gestureDist.pointing_pct||0,  "#ffd60a"],
                ["Fist",      gestureDist.fist_pct||0,      "#ff453a"],
              ].map(([label, pct, barCol])=>(
                <div key={label}>
                  <div style={{ display:"flex", justifyContent:"space-between",
                    marginBottom:4 }}>
                    <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)" }}>{label}</span>
                    <span style={{ fontSize:12, fontWeight:600, color:"#fff" }}>{pct}%</span>
                  </div>
                  <div style={{ height:4, borderRadius:4, background:"rgba(255,255,255,0.06)" }}>
                    <div style={{ width:`${pct}%`, height:"100%", borderRadius:4,
                      background:barCol, transition:"width .6s" }}/>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Strengths */}
          {data.strengths?.length > 0 && (
            <div style={{ padding:"20px 24px",
              borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)",
                textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
                Strengths
              </p>
              {data.strengths.map((s,i)=>(
                <div key={i} style={{ display:"flex", gap:10, alignItems:"flex-start",
                  marginBottom:7 }}>
                  <span style={{ color:"#30d158", fontSize:14, flexShrink:0 }}>✓</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.7)",
                    lineHeight:1.55 }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Coaching */}
          {(data.coaching?.length>0 || data.issues?.length>0) && (
            <div style={{ padding:"20px 24px",
              borderBottom:"1px solid rgba(255,255,255,0.06)" }}>
              <p style={{ fontSize:11, color:"rgba(255,255,255,0.35)",
                textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
                Coaching
              </p>
              {data.issues?.map((s,i)=>(
                <div key={`i${i}`} style={{ display:"flex", gap:10, alignItems:"flex-start",
                  marginBottom:7 }}>
                  <span style={{ color:"#ff453a", fontSize:14, flexShrink:0 }}>!</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.7)",
                    lineHeight:1.55 }}>{s}</span>
                </div>
              ))}
              {data.coaching?.map((s,i)=>(
                <div key={`c${i}`} style={{ display:"flex", gap:10, alignItems:"flex-start",
                  marginBottom:7 }}>
                  <span style={{ color:"#0a84ff", fontWeight:700,
                    fontSize:13, flexShrink:0 }}>→</span>
                  <span style={{ fontSize:13, color:"rgba(255,255,255,0.55)",
                    lineHeight:1.55 }}>{s}</span>
                </div>
              ))}
            </div>
          )}

          {/* Buttons */}
          <div style={{ padding:"20px 24px", display:"flex", gap:10 }}>
            <button onClick={onHistory} style={{
              flex:1, height:46, borderRadius:14,
              background:"rgba(255,255,255,0.08)",
              border:"1px solid rgba(255,255,255,0.1)",
              color:"#fff", fontSize:14, fontWeight:600,
              cursor:"pointer", fontFamily:"inherit",
            }}>View history</button>
            <button onClick={onClose} style={{
              flex:1, height:46, borderRadius:14,
              background:"#fff", border:"none",
              color:"#000", fontSize:14, fontWeight:600,
              cursor:"pointer", fontFamily:"inherit",
            }}>Practice again</button>
          </div>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.95)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// ── History View ──────────────────────────────────────────────────
function HistoryView({ onBack }) {
  const [sessions,  setSessions]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);
  const [expanded,  setExpanded]  = useState(null);

  useEffect(()=>{
    (async()=>{
      try {
        const [sr,st] = await Promise.all([
          fetch(`${BACKEND_URL}/api/speakwell/sessions`).then(r=>r.json()),
          fetch(`${BACKEND_URL}/api/speakwell/stats`).then(r=>r.json()),
        ]);
        setSessions(sr.sessions||[]);
        setStats(st.stats||null);
      } catch{}
      setLoading(false);
    })();
  },[]);

  const del = async id => {
    await fetch(`${BACKEND_URL}/api/speakwell/sessions/${id}`,{method:"DELETE"});
    setSessions(p=>p.filter(s=>s.id!==id));
  };

  const rc={Excellent:"#30d158",Good:"#0a84ff","Needs Improvement":"#ffd60a",Poor:"#ff453a"};

  return (
    <div style={{ minHeight:"100vh", background:"#000",
      fontFamily:"-apple-system,BlinkMacSystemFont,sans-serif", color:"#fff" }}>
      <div style={{ position:"sticky", top:0, zIndex:10,
        background:"rgba(0,0,0,0.85)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        padding:"0 20px", height:56,
        display:"flex", alignItems:"center", justifyContent:"space-between" }}>
        <button onClick={onBack} style={{ display:"flex", alignItems:"center", gap:6,
          background:"none", border:"none", color:"#0a84ff",
          fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:500 }}>
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
            <path d="M8 1L1 7.5L8 14" stroke="#0a84ff" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span style={{ fontSize:16, fontWeight:600 }}>History</span>
        <div style={{ width:50 }}/>
      </div>

      <div style={{ maxWidth:680, margin:"0 auto", padding:"24px 16px" }}>
        {stats && (
          <div style={{ display:"grid", gridTemplateColumns:"repeat(4,1fr)",
            gap:8, marginBottom:24 }}>
            {[["Sessions",stats.total_sessions??0],["Avg",stats.overall_avg??"—"],
              ["Best",stats.best_score??"—"],["Minutes",stats.total_minutes?`${stats.total_minutes}m`:"0m"]
            ].map(([l,v])=>(
              <div key={l} style={{ background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:16, padding:"16px 12px", textAlign:"center" }}>
                <p style={{ fontSize:22, fontWeight:700, letterSpacing:"-.02em" }}>{v}</p>
                <p style={{ fontSize:10, color:"rgba(255,255,255,0.35)", marginTop:4,
                  textTransform:"uppercase", letterSpacing:".05em" }}>{l}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{ textAlign:"center", padding:60 }}>
            <div style={{ width:32, height:32, borderRadius:"50%",
              border:"2px solid rgba(255,255,255,0.1)",
              borderTop:"2px solid #fff", animation:"spin 1s linear infinite",
              margin:"0 auto" }}/>
          </div>
        ) : sessions.length===0 ? (
          <div style={{ textAlign:"center", padding:"60px 20px" }}>
            <p style={{ fontSize:40, marginBottom:16 }}>🎤</p>
            <p style={{ fontSize:17, fontWeight:600, marginBottom:8 }}>No sessions yet</p>
            <p style={{ fontSize:14, color:"rgba(255,255,255,0.35)" }}>
              Complete a practice session to see results here
            </p>
          </div>
        ) : (
          <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
            {sessions.map(s=>{
              const da = s.deep_analysis;
              const isExp = expanded===s.id;
              return (
                <div key={s.id} style={{ background:"rgba(255,255,255,0.05)",
                  border:"1px solid rgba(255,255,255,0.08)",
                  borderRadius:18, overflow:"hidden" }}>
                  {/* Main row */}
                  <div style={{ padding:"18px 20px" }}>
                    <div style={{ display:"flex", justifyContent:"space-between",
                      alignItems:"flex-start", marginBottom:10 }}>
                      <div style={{ flex:1, minWidth:0 }}>
                        <p style={{ fontSize:15, fontWeight:600,
                          overflow:"hidden", textOverflow:"ellipsis",
                          whiteSpace:"nowrap", marginBottom:4 }}>{s.name}</p>
                        <div style={{ display:"flex", gap:12, fontSize:12,
                          color:"rgba(255,255,255,0.35)", flexWrap:"wrap" }}>
                          <span>{new Date(s.created_at).toLocaleDateString("en-US",
                            {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                          <span>{Math.floor(s.duration_seconds/60)}m {s.duration_seconds%60}s</span>
                          <span>Score <strong style={{color:"#fff"}}>{s.avg_score}</strong></span>
                        </div>
                      </div>
                      <div style={{ display:"flex", alignItems:"center", gap:8, flexShrink:0 }}>
                        <span style={{ fontSize:12, fontWeight:700,
                          color:rc[s.rating]||"#fff" }}>{s.rating}</span>
                        <button onClick={()=>del(s.id)} style={{
                          width:28, height:28, borderRadius:"50%",
                          background:"rgba(255,59,48,0.12)",
                          border:"1px solid rgba(255,59,48,0.25)",
                          color:"#ff453a", cursor:"pointer", fontSize:13,
                          display:"flex", alignItems:"center", justifyContent:"center" }}>✕
                        </button>
                      </div>
                    </div>

                    {/* Score bar */}
                    <div style={{ height:4, borderRadius:4, overflow:"hidden",
                      display:"flex", background:"rgba(255,255,255,0.06)", marginBottom:6 }}>
                      <div style={{ width:`${s.good_percent}%`,background:"#30d158",height:"100%" }}/>
                      <div style={{ width:`${s.warn_percent}%`,background:"#ffd60a",height:"100%" }}/>
                      <div style={{ width:`${s.bad_percent}%`, background:"#ff453a",height:"100%" }}/>
                    </div>
                    <div style={{ display:"flex", gap:12, fontSize:11,
                      color:"rgba(255,255,255,0.25)" }}>
                      <span>{s.good_percent}% good</span>
                      <span>{s.warn_percent}% warn</span>
                      <span>{s.bad_percent}% poor</span>
                      <span style={{ marginLeft:"auto" }}>{s.total_frames} frames</span>
                    </div>

                    {/* Toggle deep analysis */}
                    {da && (
                      <button onClick={()=>setExpanded(isExp?null:s.id)} style={{
                        marginTop:12, background:"rgba(10,132,255,0.1)",
                        border:"1px solid rgba(10,132,255,0.25)",
                        borderRadius:10, padding:"5px 12px",
                        color:"#0a84ff", fontSize:12, fontWeight:600,
                        cursor:"pointer", fontFamily:"inherit" }}>
                        {isExp?"Hide deep analysis ↑":"View deep analysis ↓"}
                      </button>
                    )}
                  </div>

                  {/* Deep analysis expanded */}
                  {da && isExp && (
                    <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)",
                      padding:"20px", display:"flex", flexDirection:"column", gap:16 }}>

                      {/* Metrics row */}
                      <div>
                        <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)",
                          textTransform:"uppercase", letterSpacing:".06em", marginBottom:10 }}>
                          Metrics
                        </p>
                        <div style={{ display:"grid", gridTemplateColumns:"repeat(3,1fr)", gap:8 }}>
                          {[
                            ["Hand visibility", `${da.metrics?.hand_visibility_pct??'—'}%`],
                            ["Confidence",      `${da.metrics?.confidence_rate??'—'}%`],
                            ["Left elbow",      da.metrics?.avg_elbow_angle_left ? `${da.metrics.avg_elbow_angle_left}°` : "—"],
                            ["Right elbow",     da.metrics?.avg_elbow_angle_right? `${da.metrics.avg_elbow_angle_right}°`: "—"],
                            ["Motion",          da.metrics?.avg_wrist_velocity?(da.metrics.avg_wrist_velocity<0.005?"Static":da.metrics.avg_wrist_velocity>0.05?"Fast":"Good"):"—"],
                            ["Open palm",       `${da.gesture_distribution?.open_palm_pct??0}%`],
                          ].map(([l,v])=>(
                            <div key={l} style={{ background:"rgba(255,255,255,0.04)",
                              borderRadius:10, padding:"10px 8px", textAlign:"center" }}>
                              <p style={{ fontSize:14, fontWeight:600, color:"#fff" }}>{v}</p>
                              <p style={{ fontSize:9, color:"rgba(255,255,255,0.3)",
                                marginTop:2, textTransform:"uppercase" }}>{l}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Strengths */}
                      {da.strengths?.length>0 && (
                        <div>
                          <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)",
                            textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                            Strengths
                          </p>
                          {da.strengths.map((s,i)=>(
                            <div key={i} style={{ display:"flex", gap:8,
                              alignItems:"flex-start", marginBottom:5 }}>
                              <span style={{ color:"#30d158", flexShrink:0 }}>✓</span>
                              <span style={{ fontSize:12, color:"rgba(255,255,255,0.6)",
                                lineHeight:1.5 }}>{s}</span>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Coaching */}
                      {da.coaching?.length>0 && (
                        <div>
                          <p style={{ fontSize:10, color:"rgba(255,255,255,0.3)",
                            textTransform:"uppercase", letterSpacing:".06em", marginBottom:8 }}>
                            Coaching
                          </p>
                          {da.coaching.map((c,i)=>(
                            <div key={i} style={{ display:"flex", gap:8,
                              alignItems:"flex-start", marginBottom:5 }}>
                              <span style={{ color:"#0a84ff", fontWeight:700,
                                fontSize:12, flexShrink:0 }}>→</span>
                              <span style={{ fontSize:12, color:"rgba(255,255,255,0.5)",
                                lineHeight:1.5 }}>{c}</span>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );
}

// ── MAIN ─────────────────────────────────────────────────────────
export default function SpeakWell() {
  const videoRef    = useRef(null);
  const canvasRef   = useRef(null);
  const captureRef  = useRef(document.createElement("canvas"));
  const streamRef   = useRef(null);
  const intervalRef = useRef(null);
  const timerRef    = useRef(null);
  const rafRef      = useRef(null);
  const landmarksRef= useRef(null);
  const analysisRef = useRef(null);
  // Full timeline: each entry has timestamp, score, gestures, landmarks
  const timelineRef = useRef([]);

  const [view,        setView]        = useState("practice");
  const [camReady,    setCamReady]    = useState(false);
  const [recording,   setRecording]   = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [analysis,    setAnalysis]    = useState(null);
  const [mlOn,        setMlOn]        = useState(false);
  const [sessName,    setSessName]    = useState("");
  const [deepResult,  setDeepResult]  = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [showName,    setShowName]    = useState(false);
  const [processing,  setProcessing]  = useState(false);

  useEffect(()=>{
    navigator.mediaDevices
      .getUserMedia({video:{width:1280,height:720,facingMode:"user"},audio:false})
      .then(stream=>{
        streamRef.current=stream;
        if(videoRef.current){
          videoRef.current.srcObject=stream;
          videoRef.current.onloadedmetadata=()=>{videoRef.current.play();setCamReady(true);};
        }
      }).catch(console.error);
    return ()=>streamRef.current?.getTracks().forEach(t=>t.stop());
  },[]);

  useEffect(()=>{
    const loop=()=>{
      const cv=canvasRef.current, v=videoRef.current;
      if(cv&&v&&v.readyState>=2){
        if(cv.width!==v.videoWidth){cv.width=v.videoWidth||1280;cv.height=v.videoHeight||720;}
        drawSkeleton(cv,landmarksRef.current,analysisRef.current);
      }
      rafRef.current=requestAnimationFrame(loop);
    };
    rafRef.current=requestAnimationFrame(loop);
    return ()=>cancelAnimationFrame(rafRef.current);
  },[]);

  const sendFrame = useCallback(async()=>{
    const v=videoRef.current;
    if(!v||v.readyState<2) return;
    const cap=captureRef.current;
    cap.width=320; cap.height=180;
    cap.getContext("2d").drawImage(v,0,0,320,180);
    const frame=cap.toDataURL("image/jpeg",0.55);
    try{
      const res=await fetch(`${ML_URL}/analyze`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({frame}),signal:AbortSignal.timeout(4000),
      });
      if(!res.ok) return;
      const data=await res.json();
      landmarksRef.current=data.landmarks;
      analysisRef.current=data.analysis;
      setAnalysis(data.analysis);
      setMlOn(true);
      // Store full frame data in timeline
      timelineRef.current.push({
        timestamp: Date.now(),
        score:     data.analysis?.score || 0,
        gestures:  data.analysis?.gestures || [],
        landmarks: data.landmarks || { hands:[], pose:[] },
      });
    }catch{setMlOn(false);}
  },[]);

  const startSession=()=>{
    timelineRef.current=[];
    landmarksRef.current=null; analysisRef.current=null;
    setElapsed(0); setRecording(true);
    setAnalysis(null); setShowName(false);
    intervalRef.current=setInterval(sendFrame,1000);
    timerRef.current=setInterval(()=>setElapsed(p=>p+1),1000);
  };

  const stopSession=async()=>{
    setRecording(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    landmarksRef.current=null; analysisRef.current=null;

    const timeline = timelineRef.current;
    if(timeline.length < 2) return;

    setProcessing(true);
    setSaving(true);

    try{
      // Step 1: Run deep analysis pipeline on HF Space
      const deepRes = await fetch(`${ML_URL}/analyze_deep`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({ timeline }),
      });
      const deepData = await deepRes.json();

      // Step 2: Save to Supabase (SQL row + projectai bucket)
      await fetch(`${BACKEND_URL}/api/speakwell/sessions`,{
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:             sessName || `Session ${new Date().toLocaleString()}`,
          created_at:       new Date().toISOString(),
          duration_seconds: elapsed,
          avg_score:        deepData.avg_score,
          max_score:        deepData.max_score,
          good_percent:     deepData.good_percent,
          warn_percent:     deepData.warn_percent,
          bad_percent:      deepData.bad_percent,
          total_frames:     deepData.total_frames,
          rating:           deepData.rating,
          tips:             deepData.tips || [],
          score_timeline:   deepData.score_timeline || [],
          deep_analysis:    deepData,        // full deep result stored in DB
        }),
      });

      // Step 3: Show result
      setDeepResult(deepData);
      setSessName("");
    }catch(e){
      console.error("Session save error:", e);
    }
    setProcessing(false);
    setSaving(false);
  };

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const score=analysis?.score||0;
  const scoreCol=score>=75?"#30d158":score>=50?"#ffd60a":score>0?"#ff453a":"rgba(255,255,255,0.2)";
  const statusLabel=analysis?.color==="green"?"Good gesture":analysis?.color==="yellow"?"Needs attention":analysis?.color==="red"?"Incorrect":"Ready";

  if(view==="history") return <HistoryView onBack={()=>setView("practice")}/>;

  return (
    <div style={{ position:"relative", width:"100%", height:"100vh",
      background:"#000", overflow:"hidden",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif" }}>

      {/* Deep result modal */}
      {deepResult && (
        <DeepResultModal
          data={deepResult}
          onClose={()=>setDeepResult(null)}
          onHistory={()=>{setDeepResult(null);setView("history");}}
        />
      )}

      {/* Processing overlay */}
      {processing && (
        <div style={{ position:"absolute", inset:0, zIndex:150,
          background:"rgba(0,0,0,0.75)", backdropFilter:"blur(10px)",
          display:"flex", flexDirection:"column",
          alignItems:"center", justifyContent:"center", gap:16 }}>
          <div style={{ width:48, height:48, borderRadius:"50%",
            border:"3px solid rgba(255,255,255,0.1)",
            borderTop:"3px solid #fff",
            animation:"spin 1s linear infinite" }}/>
          <p style={{ color:"rgba(255,255,255,0.7)", fontSize:15, fontWeight:500 }}>
            Analysing your session…
          </p>
          <p style={{ color:"rgba(255,255,255,0.3)", fontSize:13 }}>
            Running {timelineRef.current.length}-frame pipeline
          </p>
        </div>
      )}

      {/* Fullscreen video */}
      <video ref={videoRef} muted playsInline style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        objectFit:"cover", transform:"scaleX(-1)" }}/>

      {/* Skeleton canvas */}
      <canvas ref={canvasRef} style={{
        position:"absolute", inset:0, width:"100%", height:"100%",
        transform:"scaleX(-1)", pointerEvents:"none" }}/>

      {/* Vignette */}
      <div style={{ position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at center,transparent 45%,rgba(0,0,0,0.6) 100%)" }}/>

      {/* Top bar */}
      <div style={{ position:"absolute", top:0, left:0, right:0, padding:"16px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"linear-gradient(to bottom,rgba(0,0,0,0.65) 0%,transparent 100%)" }}>
        <div style={{ display:"flex", alignItems:"center", gap:8 }}>
          <div style={{ width:30, height:30, borderRadius:9,
            background:"rgba(255,255,255,0.12)", backdropFilter:"blur(10px)",
            border:"1px solid rgba(255,255,255,0.18)",
            display:"flex", alignItems:"center", justifyContent:"center" }}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </div>
          <span style={{ fontSize:16, fontWeight:600, color:"#fff",
            textShadow:"0 1px 4px rgba(0,0,0,0.4)" }}>SpeakWell</span>
        </div>
        <div style={{ display:"flex", alignItems:"center", gap:10 }}>
          <div style={{ display:"flex", alignItems:"center", gap:5,
            padding:"5px 12px", borderRadius:20,
            background:"rgba(0,0,0,0.4)", backdropFilter:"blur(10px)",
            border:`1px solid ${mlOn?"rgba(48,209,88,0.35)":"rgba(255,255,255,0.12)"}` }}>
            <div style={{ width:6, height:6, borderRadius:"50%",
              background:mlOn?"#30d158":"rgba(255,255,255,0.25)",
              boxShadow:mlOn?"0 0 6px #30d158":"none" }}/>
            <span style={{ fontSize:12, fontWeight:500,
              color:mlOn?"#30d158":"rgba(255,255,255,0.4)" }}>
              {mlOn?"ML live":"ML offline"}
            </span>
          </div>
          {!recording && (
            <button onClick={()=>setView("history")} style={{
              padding:"6px 14px", borderRadius:20,
              background:"rgba(0,0,0,0.4)", backdropFilter:"blur(10px)",
              border:"1px solid rgba(255,255,255,0.12)",
              color:"#fff", fontSize:13, fontWeight:500,
              cursor:"pointer", fontFamily:"inherit" }}>History</button>
          )}
        </div>
      </div>

      {/* Live score ring — top right during recording */}
      {recording && (
        <div style={{ position:"absolute", top:70, right:20 }}>
          <ScoreRing score={score} size={76}/>
        </div>
      )}

      {/* Status badge */}
      {recording && analysis && (
        <div style={{ position:"absolute", top:82, left:"50%",
          transform:"translateX(-50%)", padding:"5px 14px", borderRadius:20,
          background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)",
          border:`1px solid ${scoreCol}35`,
          display:"flex", alignItems:"center", gap:6 }}>
          <div style={{ width:6, height:6, borderRadius:"50%", background:scoreCol }}/>
          <span style={{ fontSize:12, fontWeight:600, color:scoreCol }}>{statusLabel}</span>
        </div>
      )}

      {/* Bottom */}
      <div style={{ position:"absolute", bottom:0, left:0, right:0,
        padding:"0 20px 36px",
        background:"linear-gradient(to top,rgba(0,0,0,0.85) 0%,transparent 100%)" }}>

        {/* Live feedback */}
        {recording && analysis && (
          <div style={{ display:"flex", flexWrap:"wrap", gap:7,
            justifyContent:"center", marginBottom:16 }}>
            {(analysis.positives||[]).slice(0,2).map((p,i)=>(
              <div key={i} style={{ padding:"5px 13px", borderRadius:20,
                background:"rgba(48,209,88,0.13)",
                border:"1px solid rgba(48,209,88,0.28)",
                fontSize:12, color:"#30d158" }}>{p}</div>
            ))}
            {(analysis.issues||[]).slice(0,2).map((p,i)=>(
              <div key={i} style={{ padding:"5px 13px", borderRadius:20,
                background:"rgba(255,212,10,0.13)",
                border:"1px solid rgba(255,212,10,0.28)",
                fontSize:12, color:"#ffd60a" }}>{p}</div>
            ))}
          </div>
        )}

        {/* Timer */}
        {recording && (
          <div style={{ textAlign:"center", marginBottom:20,
            fontFamily:"monospace", fontSize:36, fontWeight:700,
            color:"#fff", letterSpacing:".05em",
            textShadow:"0 2px 8px rgba(0,0,0,0.5)" }}>
            <span style={{ width:8, height:8, borderRadius:"50%", background:"#ff453a",
              display:"inline-block", marginRight:10, marginBottom:3,
              animation:"blink 1.1s infinite" }}/>
            {fmt(elapsed)}
          </div>
        )}

        {/* Session name */}
        {!recording && showName && (
          <div style={{ maxWidth:320, margin:"0 auto 14px" }}>
            <input value={sessName} onChange={e=>setSessName(e.target.value)}
              placeholder="Session name (optional)" autoFocus
              style={{ width:"100%", height:46, borderRadius:14,
                background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)",
                border:"1px solid rgba(255,255,255,0.2)",
                color:"#fff", fontSize:15, padding:"0 16px",
                outline:"none", fontFamily:"inherit", textAlign:"center" }}/>
          </div>
        )}

        {/* Buttons */}
        <div style={{ display:"flex", justifyContent:"center", gap:12 }}>
          {!recording ? (
            <>
              {!showName && (
                <button onClick={()=>setShowName(true)} style={{
                  width:56, height:56, borderRadius:"50%",
                  background:"rgba(255,255,255,0.1)", backdropFilter:"blur(10px)",
                  border:"1px solid rgba(255,255,255,0.18)",
                  color:"rgba(255,255,255,0.6)", fontSize:20, cursor:"pointer",
                  display:"flex", alignItems:"center", justifyContent:"center" }}>✎</button>
              )}
              <button onClick={camReady?startSession:undefined} style={{
                width:72, height:72, borderRadius:"50%",
                background:camReady?"#fff":"rgba(255,255,255,0.25)",
                border:"none", cursor:camReady?"pointer":"default",
                display:"flex", alignItems:"center", justifyContent:"center",
                boxShadow:camReady?"0 4px 24px rgba(0,0,0,0.4)":"none",
                transition:"all .2s" }}>
                <div style={{ width:28, height:28, borderRadius:"50%", background:"#000" }}/>
              </button>
            </>
          ) : (
            <button onClick={stopSession} disabled={saving} style={{
              width:72, height:72, borderRadius:"50%",
              background:saving?"rgba(255,255,255,0.25)":"#fff",
              border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 24px rgba(0,0,0,0.4)", transition:"all .2s" }}>
              <div style={{ width:26, height:26, borderRadius:6,
                background:saving?"rgba(0,0,0,0.3)":"#000" }}/>
            </button>
          )}
        </div>

        {!recording && (
          <p style={{ textAlign:"center", marginTop:14,
            fontSize:12, color:"rgba(255,255,255,0.3)", letterSpacing:".01em" }}>
            {camReady?"Tap to start session":"Starting camera…"}
          </p>
        )}
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        @keyframes spin{to{transform:rotate(360deg)}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::placeholder{color:rgba(255,255,255,0.35);}
      `}</style>
    </div>
  );
}