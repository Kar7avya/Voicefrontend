import React, { useState, useRef, useEffect, useCallback } from "react";

const ML_URL      = process.env.REACT_APP_ML_URL      || "";
const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || "";

// ── Skeleton drawing ──────────────────────────────────────────────
const HAND_CONN = [
  [0,1],[1,2],[2,3],[3,4],
  [0,5],[5,6],[6,7],[7,8],
  [0,9],[9,10],[10,11],[11,12],
  [0,13],[13,14],[14,15],[15,16],
  [0,17],[17,18],[18,19],[19,20],
  [5,9],[9,13],[13,17],
];
const POSE_CONN = [
  [11,12],[11,13],[13,15],[12,14],[14,16],
  [11,23],[12,24],[23,24],
  [23,25],[25,27],[24,26],[26,28],
];
const Q_COLOR = { good:"#30d158", bad:"#ff453a", warning:"#ffd60a", ok:"rgba(255,255,255,0.5)" };

function drawSkeleton(canvas, landmarks, analysis) {
  if (!canvas || !landmarks) return;
  const ctx = canvas.getContext("2d");
  const W = canvas.width, H = canvas.height;
  ctx.clearRect(0, 0, W, H);
  const { hands = [], pose = [] } = landmarks;

  // Pose
  if (pose.length) {
    ctx.strokeStyle = "rgba(255,255,255,0.35)";
    ctx.lineWidth = 2; ctx.lineCap = "round";
    POSE_CONN.forEach(([a,b]) => {
      if (pose[a]?.v > 0.4 && pose[b]?.v > 0.4) {
        ctx.beginPath();
        ctx.moveTo(pose[a].x*W, pose[a].y*H);
        ctx.lineTo(pose[b].x*W, pose[b].y*H);
        ctx.stroke();
      }
    });
    [11,12,13,14,15,16,23,24,25,26,27,28].forEach(i => {
      if (pose[i]?.v > 0.4) {
        ctx.beginPath();
        ctx.arc(pose[i].x*W, pose[i].y*H, 4, 0, Math.PI*2);
        ctx.fillStyle = "rgba(255,255,255,0.7)"; ctx.fill();
      }
    });
  }

  // Hands
  hands.forEach((lms, hi) => {
    const q = analysis?.gestures?.find(g=>g.hand===hi)?.quality || "ok";
    const col = Q_COLOR[q];
    ctx.strokeStyle = col; ctx.lineWidth = 2.5; ctx.lineCap = "round";
    HAND_CONN.forEach(([a,b]) => {
      ctx.beginPath();
      ctx.moveTo(lms[a].x*W, lms[a].y*H);
      ctx.lineTo(lms[b].x*W, lms[b].y*H);
      ctx.stroke();
    });
    lms.forEach((lm, i) => {
      const r = i===0 ? 6 : 4;
      ctx.beginPath(); ctx.arc(lm.x*W, lm.y*H, r, 0, Math.PI*2);
      ctx.fillStyle = col; ctx.fill();
      ctx.strokeStyle = "rgba(255,255,255,0.8)"; ctx.lineWidth = 1.5; ctx.stroke();
    });
  });
}

// ── Score ring ────────────────────────────────────────────────────
function ScoreRing({ score, size=120 }) {
  const r = size*0.38, circ = 2*Math.PI*r;
  const col = score>=75?"#30d158":score>=50?"#ffd60a":score>0?"#ff453a":"rgba(255,255,255,0.2)";
  const lbl = score>=75?"Excellent":score>=50?"Good":score>0?"Improve":"—";
  return (
    <svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke="rgba(255,255,255,0.1)" strokeWidth="6"/>
      <circle cx={size/2} cy={size/2} r={r} fill="none"
        stroke={col} strokeWidth="6" strokeLinecap="round"
        strokeDasharray={`${(score/100)*circ} ${circ}`}
        strokeDashoffset={circ/4}
        style={{transition:"stroke-dasharray .5s ease,stroke .3s"}}/>
      <text x={size/2} y={size/2-6} textAnchor="middle"
        fontSize={size*0.22} fontWeight="700" fill={col}
        fontFamily="-apple-system,sans-serif">{score>0?score:"—"}</text>
      <text x={size/2} y={size/2+14} textAnchor="middle"
        fontSize={size*0.1} fill="rgba(255,255,255,0.5)"
        fontFamily="-apple-system,sans-serif">{lbl}</text>
    </svg>
  );
}

// ── Result card shown after session ──────────────────────────────
function ResultCard({ data, onClose, onHistory }) {
  if (!data) return null;
  return (
    <div style={{
      position:"fixed", inset:0, zIndex:200,
      background:"rgba(0,0,0,0.75)", backdropFilter:"blur(20px)",
      display:"flex", alignItems:"center", justifyContent:"center",
      padding:20, fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
    }}>
      <div style={{
        background:"rgba(28,28,30,0.95)", border:"1px solid rgba(255,255,255,0.1)",
        borderRadius:24, padding:32, width:"100%", maxWidth:420,
        animation:"popIn .3s cubic-bezier(.34,1.56,.64,1)",
      }}>
        {/* Header */}
        <div style={{textAlign:"center", marginBottom:28}}>
          <ScoreRing score={data.avg_score} size={130}/>
          <p style={{fontSize:22, fontWeight:700, color:"#fff",
            letterSpacing:"-.02em", marginTop:12}}>{data.rating}</p>
          <p style={{fontSize:13, color:"rgba(255,255,255,0.4)", marginTop:4}}>
            Session complete
          </p>
        </div>

        {/* Stats row */}
        <div style={{display:"grid", gridTemplateColumns:"repeat(3,1fr)",
          gap:8, marginBottom:20}}>
          {[
            ["Best",    data.max_score],
            ["Duration", `${Math.floor((data.duration_seconds||0)/60)}m ${(data.duration_seconds||0)%60}s`],
            ["Frames",  data.total_frames],
          ].map(([l,v]) => (
            <div key={l} style={{background:"rgba(255,255,255,0.06)",
              borderRadius:14, padding:"14px 10px", textAlign:"center"}}>
              <p style={{fontSize:18, fontWeight:700, color:"#fff",
                letterSpacing:"-.01em"}}>{v}</p>
              <p style={{fontSize:10, color:"rgba(255,255,255,0.4)",
                marginTop:3, textTransform:"uppercase", letterSpacing:".05em"}}>{l}</p>
            </div>
          ))}
        </div>

        {/* Distribution */}
        <div style={{marginBottom:20}}>
          <div style={{height:6, borderRadius:6, overflow:"hidden",
            display:"flex", background:"rgba(255,255,255,0.08)", marginBottom:8}}>
            <div style={{width:`${data.good_percent}%`, background:"#30d158", transition:"width .6s"}}/>
            <div style={{width:`${data.warn_percent}%`, background:"#ffd60a", transition:"width .6s"}}/>
            <div style={{width:`${data.bad_percent}%`,  background:"#ff453a", transition:"width .6s"}}/>
          </div>
          <div style={{display:"flex", gap:14}}>
            {[["#30d158",`${data.good_percent}% good`],
              ["#ffd60a",`${data.warn_percent}% warn`],
              ["#ff453a",`${data.bad_percent}% poor`]].map(([c,l])=>(
              <div key={l} style={{display:"flex",alignItems:"center",gap:5}}>
                <div style={{width:6,height:6,borderRadius:"50%",background:c}}/>
                <span style={{fontSize:11,color:"rgba(255,255,255,0.4)"}}>{l}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Tips */}
        {data.tips?.length > 0 && (
          <div style={{marginBottom:24}}>
            {data.tips.map((tip,i)=>(
              <div key={i} style={{display:"flex", gap:10, alignItems:"flex-start",
                marginBottom:8}}>
                <span style={{color:"#0a84ff", fontWeight:700, fontSize:13,
                  flexShrink:0, marginTop:1}}>→</span>
                <span style={{fontSize:12, color:"rgba(255,255,255,0.55)",
                  lineHeight:1.6}}>{tip}</span>
              </div>
            ))}
          </div>
        )}

        {/* Buttons */}
        <div style={{display:"flex", gap:10}}>
          <button onClick={onHistory} style={{
            flex:1, height:46, borderRadius:14,
            background:"rgba(255,255,255,0.08)",
            border:"1px solid rgba(255,255,255,0.1)",
            color:"#fff", fontSize:14, fontWeight:600,
            cursor:"pointer", letterSpacing:"-.01em",
            fontFamily:"inherit",
          }}>View history</button>
          <button onClick={onClose} style={{
            flex:1, height:46, borderRadius:14,
            background:"#fff", border:"none",
            color:"#000", fontSize:14, fontWeight:600,
            cursor:"pointer", letterSpacing:"-.01em",
            fontFamily:"inherit",
          }}>Practice again</button>
        </div>
      </div>
      <style>{`@keyframes popIn{from{opacity:0;transform:scale(.9)}to{opacity:1;transform:scale(1)}}`}</style>
    </div>
  );
}

// ── History page ──────────────────────────────────────────────────
function HistoryView({ onBack }) {
  const [sessions,  setSessions]  = useState([]);
  const [stats,     setStats]     = useState(null);
  const [loading,   setLoading]   = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [sr, st] = await Promise.all([
          fetch(`${BACKEND_URL}/api/speakwell/sessions`).then(r=>r.json()),
          fetch(`${BACKEND_URL}/api/speakwell/stats`).then(r=>r.json()),
        ]);
        setSessions(sr.sessions||[]);
        setStats(st.stats||null);
      } catch {}
      setLoading(false);
    })();
  }, []);

  const del = async id => {
    await fetch(`${BACKEND_URL}/api/speakwell/sessions/${id}`,{method:"DELETE"});
    setSessions(p=>p.filter(s=>s.id!==id));
  };

  const rc = {Excellent:"#30d158",Good:"#0a84ff","Needs Improvement":"#ffd60a",Poor:"#ff453a"};

  return (
    <div style={{
      minHeight:"100vh", background:"#000",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
      color:"#fff",
    }}>
      {/* Header */}
      <div style={{
        position:"sticky", top:0, zIndex:10,
        background:"rgba(0,0,0,0.8)", backdropFilter:"blur(20px)",
        borderBottom:"1px solid rgba(255,255,255,0.08)",
        padding:"0 20px", height:56,
        display:"flex", alignItems:"center", justifyContent:"space-between",
      }}>
        <button onClick={onBack} style={{
          display:"flex", alignItems:"center", gap:6,
          background:"none", border:"none", color:"#0a84ff",
          fontSize:15, cursor:"pointer", fontFamily:"inherit", fontWeight:500,
        }}>
          <svg width="9" height="15" viewBox="0 0 9 15" fill="none">
            <path d="M8 1L1 7.5L8 14" stroke="#0a84ff" strokeWidth="2"
              strokeLinecap="round" strokeLinejoin="round"/>
          </svg>
          Back
        </button>
        <span style={{fontSize:16, fontWeight:600, letterSpacing:"-.01em"}}>History</span>
        <div style={{width:50}}/>
      </div>

      <div style={{maxWidth:680, margin:"0 auto", padding:"24px 16px"}}>
        {/* Stats */}
        {stats && (
          <div style={{display:"grid", gridTemplateColumns:"repeat(4,1fr)",
            gap:8, marginBottom:24}}>
            {[
              ["Sessions",  stats.total_sessions??0],
              ["Avg",       stats.overall_avg??"—"],
              ["Best",      stats.best_score??"—"],
              ["Minutes",   stats.total_minutes?`${stats.total_minutes}m`:"0m"],
            ].map(([l,v])=>(
              <div key={l} style={{
                background:"rgba(255,255,255,0.06)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:16, padding:"16px 12px", textAlign:"center",
              }}>
                <p style={{fontSize:22, fontWeight:700, letterSpacing:"-.02em"}}>{v}</p>
                <p style={{fontSize:10, color:"rgba(255,255,255,0.4)",
                  marginTop:4, textTransform:"uppercase", letterSpacing:".05em"}}>{l}</p>
              </div>
            ))}
          </div>
        )}

        {loading ? (
          <div style={{textAlign:"center", padding:60}}>
            <div style={{width:32, height:32, borderRadius:"50%",
              border:"2px solid rgba(255,255,255,0.1)",
              borderTop:"2px solid #fff",
              animation:"spin 1s linear infinite", margin:"0 auto"}}/>
          </div>
        ) : sessions.length===0 ? (
          <div style={{textAlign:"center", padding:"60px 20px"}}>
            <p style={{fontSize:40, marginBottom:16}}>🎤</p>
            <p style={{fontSize:17, fontWeight:600, marginBottom:8}}>No sessions yet</p>
            <p style={{fontSize:14, color:"rgba(255,255,255,0.4)"}}>
              Complete a practice session to see results here
            </p>
          </div>
        ) : (
          <div style={{display:"flex", flexDirection:"column", gap:10}}>
            {sessions.map(s=>(
              <div key={s.id} style={{
                background:"rgba(255,255,255,0.05)",
                border:"1px solid rgba(255,255,255,0.08)",
                borderRadius:18, padding:"18px 20px",
              }}>
                <div style={{display:"flex", justifyContent:"space-between",
                  alignItems:"flex-start", marginBottom:10}}>
                  <div style={{flex:1, minWidth:0}}>
                    <p style={{fontSize:15, fontWeight:600,
                      overflow:"hidden", textOverflow:"ellipsis",
                      whiteSpace:"nowrap", marginBottom:4}}>{s.name}</p>
                    <div style={{display:"flex", gap:12, fontSize:12,
                      color:"rgba(255,255,255,0.4)", flexWrap:"wrap"}}>
                      <span>{new Date(s.created_at).toLocaleDateString("en-US",
                        {month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"})}</span>
                      <span>{Math.floor(s.duration_seconds/60)}m {s.duration_seconds%60}s</span>
                      <span>Score <strong style={{color:"#fff"}}>{s.avg_score}</strong></span>
                    </div>
                  </div>
                  <div style={{display:"flex", alignItems:"center", gap:10, flexShrink:0}}>
                    <span style={{fontSize:12, fontWeight:700,
                      color:rc[s.rating]||"#fff"}}>{s.rating}</span>
                    <button onClick={()=>del(s.id)} style={{
                      width:28, height:28, borderRadius:"50%",
                      background:"rgba(255,59,48,0.15)",
                      border:"1px solid rgba(255,59,48,0.3)",
                      color:"#ff453a", cursor:"pointer", fontSize:13,
                      display:"flex", alignItems:"center", justifyContent:"center",
                    }}>✕</button>
                  </div>
                </div>
                {/* Bar */}
                <div style={{height:4, borderRadius:4, overflow:"hidden",
                  display:"flex", background:"rgba(255,255,255,0.08)"}}>
                  <div style={{width:`${s.good_percent}%`,background:"#30d158",height:"100%"}}/>
                  <div style={{width:`${s.warn_percent}%`,background:"#ffd60a",height:"100%"}}/>
                  <div style={{width:`${s.bad_percent}%`, background:"#ff453a",height:"100%"}}/>
                </div>
                <div style={{display:"flex", gap:12, marginTop:6,
                  fontSize:11, color:"rgba(255,255,255,0.3)"}}>
                  <span>{s.good_percent}% good</span>
                  <span>{s.warn_percent}% warn</span>
                  <span>{s.bad_percent}% poor</span>
                  <span style={{marginLeft:"auto"}}>{s.total_frames} frames</span>
                </div>
              </div>
            ))}
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
  const scoresRef   = useRef([]);
  const timelineRef = useRef([]);
  const landmarksRef= useRef(null);
  const analysisRef = useRef(null);

  const [view,        setView]        = useState("practice"); // practice | history
  const [camReady,    setCamReady]    = useState(false);
  const [recording,   setRecording]   = useState(false);
  const [elapsed,     setElapsed]     = useState(0);
  const [analysis,    setAnalysis]    = useState(null);
  const [, setScores]      = useState([]);
  const [mlOn,        setMlOn]        = useState(false);
  const [sessName,    setSessName]    = useState("");
  const [summaryData, setSummaryData] = useState(null);
  const [saving,      setSaving]      = useState(false);
  const [showName,    setShowName]    = useState(false);

  // Camera
  useEffect(()=>{
    navigator.mediaDevices
      .getUserMedia({video:{width:1280,height:720,facingMode:"user"},audio:false})
      .then(stream=>{
        streamRef.current=stream;
        if(videoRef.current){
          videoRef.current.srcObject=stream;
          videoRef.current.onloadedmetadata=()=>{
            videoRef.current.play(); setCamReady(true);
          };
        }
      }).catch(console.error);
    return ()=>streamRef.current?.getTracks().forEach(t=>t.stop());
  },[]);

  // RAF canvas loop
  useEffect(()=>{
    const loop=()=>{
      const cv=canvasRef.current, v=videoRef.current;
      if(cv&&v&&v.readyState>=2){
        if(cv.width!==v.videoWidth){
          cv.width=v.videoWidth||1280; cv.height=v.videoHeight||720;
        }
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
        method:"POST", headers:{"Content-Type":"application/json"},
        body:JSON.stringify({frame}), signal:AbortSignal.timeout(4000),
      });
      if(!res.ok) return;
      const data=await res.json();
      landmarksRef.current=data.landmarks;
      analysisRef.current=data.analysis;
      setAnalysis(data.analysis);
      setMlOn(true);
      const sc=data.analysis?.score||0;
      scoresRef.current.push(sc);
      timelineRef.current.push({timestamp:Date.now(),score:sc});
      setScores([...scoresRef.current]);
    }catch{ setMlOn(false); }
  },[]);

  const startSession=()=>{
    scoresRef.current=[]; timelineRef.current=[];
    landmarksRef.current=null; analysisRef.current=null;
    setScores([]); setElapsed(0); setRecording(true);
    setAnalysis(null); setShowName(false);
    intervalRef.current=setInterval(sendFrame,1000);
    timerRef.current=setInterval(()=>setElapsed(p=>p+1),1000);
  };

  const stopSession=async()=>{
    setRecording(false);
    clearInterval(intervalRef.current);
    clearInterval(timerRef.current);
    landmarksRef.current=null; analysisRef.current=null;
    const sc=scoresRef.current;
    if(!sc.length) return;
    setSaving(true);
    try{
      const [sumRes]=await Promise.all([
        fetch(`${ML_URL}/analyze_session`,{
          method:"POST",headers:{"Content-Type":"application/json"},
          body:JSON.stringify({scores:sc}),
        }).then(r=>r.json()),
      ]);
      // Save to Supabase via backend
      await fetch(`${BACKEND_URL}/api/speakwell/sessions`,{
        method:"POST",headers:{"Content-Type":"application/json"},
        body:JSON.stringify({
          name:             sessName||`Session ${new Date().toLocaleString()}`,
          created_at:       new Date().toISOString(),
          duration_seconds: elapsed,
          avg_score:        sumRes.avg_score,
          max_score:        sumRes.max_score,
          good_percent:     sumRes.good_percent,
          warn_percent:     sumRes.warn_percent,
          bad_percent:      sumRes.bad_percent,
          total_frames:     sc.length,
          rating:           sumRes.rating,
          tips:             sumRes.tips,
          score_timeline:   timelineRef.current,
        }),
      });
      setSummaryData({...sumRes, duration_seconds:elapsed});
      setSessName("");
    }catch(e){console.error(e);}
    setSaving(false);
  };

  const fmt=s=>`${String(Math.floor(s/60)).padStart(2,"0")}:${String(s%60).padStart(2,"0")}`;
  const score = analysis?.score||0;
  const scoreCol = score>=75?"#30d158":score>=50?"#ffd60a":score>0?"#ff453a":"rgba(255,255,255,0.3)";
  const statusLabel = analysis?.color==="green"?"Good gesture"
    :analysis?.color==="yellow"?"Needs attention"
    :analysis?.color==="red"?"Incorrect gesture":"Ready";

  if(view==="history") return <HistoryView onBack={()=>setView("practice")}/>;

  return (
    <div style={{
      position:"relative", width:"100%", height:"100vh",
      background:"#000", overflow:"hidden",
      fontFamily:"-apple-system,BlinkMacSystemFont,'SF Pro Display',sans-serif",
    }}>

      {/* Result modal */}
      {summaryData && (
        <ResultCard
          data={summaryData}
          onClose={()=>setSummaryData(null)}
          onHistory={()=>{setSummaryData(null);setView("history");}}
        />
      )}

      {/* Fullscreen video */}
      <video ref={videoRef} muted playsInline
        style={{
          position:"absolute", inset:0,
          width:"100%", height:"100%",
          objectFit:"cover",
          transform:"scaleX(-1)", // mirror
        }}/>

      {/* Skeleton canvas overlay */}
      <canvas ref={canvasRef} style={{
        position:"absolute", inset:0,
        width:"100%", height:"100%",
        transform:"scaleX(-1)",
        pointerEvents:"none",
      }}/>

      {/* Dark vignette edges */}
      <div style={{
        position:"absolute", inset:0, pointerEvents:"none",
        background:"radial-gradient(ellipse at center, transparent 50%, rgba(0,0,0,0.55) 100%)",
      }}/>

      {/* Top bar */}
      <div style={{
        position:"absolute", top:0, left:0, right:0,
        padding:"16px 20px",
        display:"flex", alignItems:"center", justifyContent:"space-between",
        background:"linear-gradient(to bottom,rgba(0,0,0,0.6) 0%,transparent 100%)",
      }}>
        {/* Brand */}
        <div style={{display:"flex",alignItems:"center",gap:8}}>
          <div style={{width:30,height:30,borderRadius:9,
            background:"rgba(255,255,255,0.15)",backdropFilter:"blur(10px)",
            border:"1px solid rgba(255,255,255,0.2)",
            display:"flex",alignItems:"center",justifyContent:"center"}}>
            <svg width="15" height="15" viewBox="0 0 24 24" fill="none"
              stroke="#fff" strokeWidth="2.2" strokeLinecap="round">
              <path d="M12 2a3 3 0 0 0-3 3v7a3 3 0 0 0 6 0V5a3 3 0 0 0-3-3z"/>
              <path d="M19 10v2a7 7 0 0 1-14 0v-2"/>
              <line x1="12" y1="19" x2="12" y2="22"/>
            </svg>
          </div>
          <span style={{fontSize:16,fontWeight:600,color:"#fff",
            letterSpacing:"-.01em",textShadow:"0 1px 4px rgba(0,0,0,0.4)"}}>SpeakWell</span>
        </div>

        {/* ML status + history */}
        <div style={{display:"flex",alignItems:"center",gap:10}}>
          {/* ML pill */}
          <div style={{
            display:"flex",alignItems:"center",gap:5,
            padding:"5px 12px",borderRadius:20,
            background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",
            border:`1px solid ${mlOn?"rgba(48,209,88,0.4)":"rgba(255,255,255,0.15)"}`,
          }}>
            <div style={{width:6,height:6,borderRadius:"50%",
              background:mlOn?"#30d158":"rgba(255,255,255,0.3)",
              boxShadow:mlOn?"0 0 6px #30d158":"none"}}/>
            <span style={{fontSize:12,fontWeight:500,
              color:mlOn?"#30d158":"rgba(255,255,255,0.5)"}}>
              {mlOn?"ML live":"ML offline"}
            </span>
          </div>

          {/* History button */}
          {!recording && (
            <button onClick={()=>setView("history")} style={{
              padding:"6px 14px",borderRadius:20,
              background:"rgba(0,0,0,0.4)",backdropFilter:"blur(10px)",
              border:"1px solid rgba(255,255,255,0.15)",
              color:"#fff",fontSize:13,fontWeight:500,cursor:"pointer",
              fontFamily:"inherit",
            }}>History</button>
          )}
        </div>
      </div>

      {/* Live score — top right during recording */}
      {recording && (
        <div style={{
          position:"absolute", top:16, right:20,
          display:"flex", flexDirection:"column", alignItems:"flex-end",
        }}>
          <ScoreRing score={score} size={80}/>
        </div>
      )}

      {/* Status badge — center top during recording */}
      {recording && analysis && (
        <div style={{
          position:"absolute", top:110, left:"50%",
          transform:"translateX(-50%)",
          padding:"6px 16px", borderRadius:20,
          background:"rgba(0,0,0,0.5)", backdropFilter:"blur(10px)",
          border:`1px solid ${scoreCol}40`,
          display:"flex", alignItems:"center", gap:7,
        }}>
          <div style={{width:7,height:7,borderRadius:"50%",background:scoreCol}}/>
          <span style={{fontSize:13,fontWeight:600,color:scoreCol}}>{statusLabel}</span>
        </div>
      )}

      {/* Bottom panel */}
      <div style={{
        position:"absolute", bottom:0, left:0, right:0,
        padding:"0 20px 32px",
        background:"linear-gradient(to top,rgba(0,0,0,0.8) 0%,transparent 100%)",
      }}>

        {/* Live feedback pills during recording */}
        {recording && analysis && (
          <div style={{
            display:"flex", flexWrap:"wrap", gap:7,
            justifyContent:"center", marginBottom:16,
          }}>
            {(analysis.positives||[]).slice(0,2).map((p,i)=>(
              <div key={i} style={{
                padding:"5px 13px", borderRadius:20,
                background:"rgba(48,209,88,0.15)",
                border:"1px solid rgba(48,209,88,0.3)",
                fontSize:12, color:"#30d158",
              }}>{p}</div>
            ))}
            {(analysis.issues||[]).slice(0,2).map((p,i)=>(
              <div key={i} style={{
                padding:"5px 13px", borderRadius:20,
                background:"rgba(255,212,10,0.15)",
                border:"1px solid rgba(255,212,10,0.3)",
                fontSize:12, color:"#ffd60a",
              }}>{p}</div>
            ))}
          </div>
        )}

        {/* Timer */}
        {recording && (
          <div style={{
            textAlign:"center", marginBottom:20,
            fontFamily:"monospace", fontSize:36,
            fontWeight:700, color:"#fff", letterSpacing:".05em",
            textShadow:"0 2px 8px rgba(0,0,0,0.5)",
          }}>
            <span style={{width:8,height:8,borderRadius:"50%",
              background:"#ff453a",display:"inline-block",
              marginRight:10,marginBottom:3,
              animation:"blink 1.1s infinite"}}/>
            {fmt(elapsed)}
          </div>
        )}

        {/* Session name input (shown before start) */}
        {!recording && showName && (
          <div style={{maxWidth:320, margin:"0 auto 14px"}}>
            <input
              value={sessName}
              onChange={e=>setSessName(e.target.value)}
              placeholder="Session name (optional)"
              autoFocus
              style={{
                width:"100%", height:46, borderRadius:14,
                background:"rgba(255,255,255,0.1)",
                backdropFilter:"blur(10px)",
                border:"1px solid rgba(255,255,255,0.2)",
                color:"#fff", fontSize:15, padding:"0 16px",
                outline:"none", fontFamily:"inherit",
                textAlign:"center",
              }}/>
          </div>
        )}

        {/* Main button */}
        <div style={{display:"flex", justifyContent:"center", gap:12}}>
          {!recording ? (
            <>
              {!showName && (
                <button onClick={()=>setShowName(true)} style={{
                  width:56, height:56, borderRadius:"50%",
                  background:"rgba(255,255,255,0.1)",
                  backdropFilter:"blur(10px)",
                  border:"1px solid rgba(255,255,255,0.2)",
                  color:"rgba(255,255,255,0.7)", fontSize:20,
                  cursor:"pointer", display:"flex",
                  alignItems:"center", justifyContent:"center",
                }}>✎</button>
              )}
              <button
                onClick={camReady ? startSession : undefined}
                style={{
                  width:72, height:72, borderRadius:"50%",
                  background: camReady?"#fff":"rgba(255,255,255,0.3)",
                  border:"none", cursor:camReady?"pointer":"default",
                  display:"flex", alignItems:"center", justifyContent:"center",
                  boxShadow:camReady?"0 4px 24px rgba(0,0,0,0.4)":"none",
                  transition:"all .2s",
                }}>
                <div style={{
                  width:28, height:28, borderRadius:"50%",
                  background:"#000",
                }}/>
              </button>
            </>
          ) : (
            <button onClick={stopSession} disabled={saving} style={{
              width:72, height:72, borderRadius:"50%",
              background: saving?"rgba(255,255,255,0.3)":"#fff",
              border:"none", cursor:"pointer",
              display:"flex", alignItems:"center", justifyContent:"center",
              boxShadow:"0 4px 24px rgba(0,0,0,0.4)",
              transition:"all .2s",
            }}>
              <div style={{
                width:26, height:26, borderRadius:6,
                background:saving?"rgba(0,0,0,0.3)":"#000",
              }}/>
            </button>
          )}
        </div>

        {/* Hint text */}
        {!recording && (
          <p style={{
            textAlign:"center", marginTop:14,
            fontSize:12, color:"rgba(255,255,255,0.35)",
            letterSpacing:".01em",
          }}>
            {camReady ? "Tap to start session" : "Starting camera…"}
          </p>
        )}
      </div>

      <style>{`
        @keyframes blink{0%,100%{opacity:1}50%{opacity:.2}}
        *{box-sizing:border-box;margin:0;padding:0;}
        ::placeholder{color:rgba(255,255,255,0.4);}
      `}</style>
    </div>
  );
}