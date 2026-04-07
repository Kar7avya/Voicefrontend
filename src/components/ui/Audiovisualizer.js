import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

// ── Volume level classifier ───────────────────────────────────────────────────
function getVolLevel(amp) {
    if (amp >= 0.65) return {
        label: "🔊 LOUD",   short: "LOUD",
        color: "#d97706",   bg: "#fef3c7", border: "#fcd34d",
        tip:   "Speak with FULL voice here",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
    if (amp >= 0.30) return {
        label: "🔉 MEDIUM", short: "MEDIUM",
        color: "#1d4ed8",   bg: "#dbeafe", border: "#93c5fd",
        tip:   "Use NORMAL speaking voice here",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
    return {
        label: "🔈 SOFT",   short: "SOFT",
        color: "#4b5563",   bg: "#f3f4f6", border: "#d1d5db",
        tip:   "LOWER your voice here",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
}

// ── Detect speech segments from silence ───────────────────────────────────────
function detectSegments(pcm, sr) {
    const frameMs   = 20;
    const frameSize = Math.floor(sr * frameMs / 1000);
    const silThresh = 0.006;
    const minWordF  = Math.floor(80  / frameMs);
    const minSilF   = Math.floor(60  / frameMs);

    const rms = [];
    for (let i = 0; i + frameSize < pcm.length; i += frameSize) {
        let s = 0;
        for (let j = 0; j < frameSize; j++) s += pcm[i+j]*pcm[i+j];
        rms.push(Math.sqrt(s/frameSize));
    }

    const voiced = rms.map(r => r > silThresh);
    const segs   = [];
    let inWord = false, wordStart = 0, silCount = 0;

    for (let i = 0; i < voiced.length; i++) {
        if (!inWord && voiced[i]) {
            inWord = true; wordStart = i; silCount = 0;
        } else if (inWord) {
            if (!voiced[i]) {
                silCount++;
                if (silCount >= minSilF) {
                    const wordEnd = i - silCount;
                    if (wordEnd - wordStart >= minWordF) {
                        segs.push({ t: wordStart * frameMs/1000, dur: (wordEnd - wordStart) * frameMs/1000 });
                    }
                    inWord = false; silCount = 0;
                }
            } else { silCount = 0; }
        }
    }
    if (inWord && voiced.length - wordStart >= minWordF) {
        segs.push({ t: wordStart * frameMs/1000, dur: (voiced.length - wordStart) * frameMs/1000 });
    }
    return segs;
}

function segRMS(pcm, sr, t, dur) {
    const s0 = Math.floor(t * sr);
    const sN = Math.floor((t + dur) * sr);
    let   sum = 0, cnt = 0;
    for (let i = s0; i < Math.min(sN, pcm.length); i++) { sum += pcm[i]*pcm[i]; cnt++; }
    return cnt > 0 ? Math.sqrt(sum/cnt) : 0;
}

const WIN_SEC = 1.4;

export default function AudioVisualizer({
    audioURL, audioFeatures, isPlaying, currentTime, duration, language, translatedText
}) {
    const canvasRef = useRef(null);
    const animRef   = useRef(null);
    const pcmRef    = useRef(null);
    const srRef     = useRef(22050);
    const durRef    = useRef(0);

    const [status, setStatus] = useState("idle");
    const [segs,   setSegs]   = useState([]);   // detected speech segments

    // ── Decode audio + detect segments ───────────────────────────────────────
    useEffect(() => {
        if (!audioURL) return;
        pcmRef.current = null;
        setStatus("loading");
        setSegs([]);

        (async () => {
            try {
                const res     = await fetch(audioURL);
                if (!res.ok) throw new Error("fetch failed");
                const buf     = await res.arrayBuffer();
                const tmpCtx  = new (window.AudioContext || window.webkitAudioContext)();
                const decoded = await tmpCtx.decodeAudioData(buf);
                await tmpCtx.close();

                const sr  = decoded.sampleRate;
                const pcm = decoded.getChannelData(0);
                srRef.current  = sr;
                pcmRef.current = pcm;
                durRef.current = decoded.duration;

                // Detect speech segments
                const raw    = detectSegments(pcm, sr);
                const withRms = raw.map(s => ({ ...s, rms: segRMS(pcm, sr, s.t, s.dur) }));
                const maxRms  = Math.max(...withRms.map(s => s.rms), 0.001);

                // Assign word labels from translatedText
                const tWords  = translatedText ? translatedText.trim().split(/\s+/) : [];
                const normed  = withRms.map((s, i) => ({
                    ...s,
                    amp:   s.rms / maxRms,
                    word:  tWords[i] ? tWords[i] : `Part ${i+1}`,
                }));

                setSegs(normed);
                setStatus("ready");
            } catch (e) {
                console.warn("AudioVisualizer:", e.message);
                setStatus("error");
            }
        })();
    }, [audioURL, translatedText]);

    // ── Canvas draw — waveform with colored bands ─────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const draw = () => {
            const ctx  = canvas.getContext("2d");
            const W    = canvas.width;
            const H    = canvas.height;
            const mid  = H / 2;
            const aDur = durRef.current || duration || 1;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "#faf5ff";
            ctx.fillRect(0, 0, W, H);

            const pcm = pcmRef.current;
            const sr  = srRef.current;

            // ── Colored band per segment ──────────────────────────────────────
            if (aDur > 0) {
                segs.forEach(w => {
                    const lv    = getVolLevel(w.amp);
                    const relSt = Math.max(0, w.t / aDur);
                    const relEn = Math.min(1, (w.t + w.dur) / aDur);
                    ctx.fillStyle = lv.bg + "ee";
                    ctx.fillRect(relSt * W, 0, Math.max(2, (relEn - relSt) * W), H);

                    // Volume label at bottom of each band — spaced to avoid overlap
                    const bw = (relEn - relSt) * W;
                    if (bw > 30) {
                        const bx = relSt * W + bw / 2;
                        ctx.fillStyle   = lv.color;
                        ctx.font        = `bold ${bw > 60 ? 9 : 8}px sans-serif`;
                        ctx.textAlign   = "center";
                        ctx.fillText(lv.short, bx, H - 5);
                    }
                });
            }

            // ── Center dashed line ────────────────────────────────────────────
            ctx.strokeStyle = "rgba(124,58,237,0.2)";
            ctx.lineWidth   = 1; ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
            ctx.setLineDash([]);

            if (pcm && status === "ready" && aDur > 0) {
                const half   = WIN_SEC / 2;
                const startT = Math.max(0, currentTime - half);
                const endT   = Math.min(aDur, currentTime + half);
                const s0     = Math.floor(startT * sr);
                const sN     = Math.floor(endT * sr);
                const range  = Math.max(1, sN - s0);
                const total  = pcm.length;

                let mx = 0.01;
                for (let i = s0; i < sN; i += 4)
                    if (Math.abs(pcm[Math.min(i, total-1)]) > mx)
                        mx = Math.abs(pcm[Math.min(i, total-1)]);

                // Purple fill above
                ctx.fillStyle = "rgba(109,40,217,0.2)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const v = pcm[Math.min(s0 + Math.floor((x/W)*range), total-1)] / mx;
                    ctx.lineTo(x, mid - Math.max(0, v) * (mid - 18));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                // Pink fill below
                ctx.fillStyle = "rgba(236,72,153,0.12)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const v = pcm[Math.min(s0 + Math.floor((x/W)*range), total-1)] / mx;
                    ctx.lineTo(x, mid - Math.min(0, v) * (mid - 18));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                // Wave line
                ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x < W; x++) {
                    const v = pcm[Math.min(s0 + Math.floor((x/W)*range), total-1)] / mx;
                    const y = mid - v * (mid - 18);
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Playhead
                const px = W / 2;
                ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(px, 2); ctx.lineTo(px, H-2); ctx.stroke();
                const cv = pcm[Math.min(Math.floor(currentTime * sr), total-1)] / mx;
                const cy = mid - cv * (mid - 18);
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(px, cy, 5, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(px, cy, 5, 0, Math.PI*2); ctx.stroke();
            }

            // Axis labels
            ctx.font = "bold 9px sans-serif"; ctx.textAlign = "left";
            ctx.fillStyle = "rgba(109,40,217,0.6)";
            ctx.fillText("LOUD ↑", 4, 14);
            ctx.fillText("SOFT ↓", 4, H - 18);

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [status, currentTime, duration, segs]);

    if (!audioURL && !audioFeatures) return null;

    const nowSeg = segs.find(w => currentTime >= w.t && currentTime < w.t + w.dur);
    const nowVol = nowSeg ? getVolLevel(nowSeg.amp) : null;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ borderRadius: 16, border: "1.5px solid #e0d7f5", overflow: "hidden", backgroundColor: "#f8f5ff" }}
        >
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom:"1px solid #e0d7f5", backgroundColor:"#ede9fe" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, backgroundColor:"#ddd6fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎙️</div>
                    <div>
                        <p style={{ fontSize:11, fontWeight:700, color:"#3730a3", margin:0 }}>Speaking Volume Guide</p>
                        <p style={{ fontSize:9, color:"#7c3aed", margin:"2px 0 0" }}>
                            {status === "loading" ? "⏳ Analysing audio..."
                             : status === "ready"  ? `How loud to speak · ${segs.length} parts detected · ${language || ""}`
                             :                       language || ""}
                        </p>
                    </div>
                </div>
                {/* Live indicator */}
                <div style={{ display:"flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999, backgroundColor: isPlaying ? "#dcfce7" : "#ede9fe", border:`1px solid ${isPlaying ? "#86efac" : "#c4b5fd"}`, fontSize:9, fontWeight:700, color: isPlaying ? "#15803d" : "#7c3aed" }}>
                    <span style={{ width:6, height:6, borderRadius:"50%", backgroundColor: isPlaying ? "#16a34a" : "#7c3aed", display:"inline-block" }} />
                    {isPlaying ? "Playing" : "Ready"}
                </div>
            </div>

            {/* ── NOW PLAYING BANNER ── */}
            <AnimatePresence mode="wait">
                {nowVol && nowSeg && (
                    <motion.div
                        key={nowSeg.t}
                        initial={{ opacity: 0, y: -8 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.2 }}
                        style={{ margin:"12px 18px 0", padding:"12px 16px", borderRadius:12, backgroundColor: nowVol.bg, border:`2px solid ${nowVol.border}` }}
                    >
                        <p style={{ fontSize:9, fontWeight:700, color: nowVol.color, textTransform:"uppercase", margin:"0 0 4px" }}>Right now — speak like this:</p>
                        <div style={{ display:"flex", alignItems:"center", gap:14, flexWrap:"wrap" }}>
                            <p style={{ fontSize:26, fontWeight:900, color: nowVol.color, margin:0 }}>{nowVol.label}</p>
                            <p style={{ fontSize:12, color:"#374151", margin:0, fontWeight:600 }}>{nowVol.tip}</p>
                            <div style={{ flex:1, minWidth:80, height:10, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
                                <motion.div
                                    style={{ height:"100%", borderRadius:999, backgroundColor: nowVol.color }}
                                    animate={{ width: nowVol.pct + "%" }}
                                    transition={{ duration: 0.15 }}
                                />
                            </div>
                            <span style={{ fontSize:14, fontWeight:800, color: nowVol.color }}>{nowVol.pct}%</span>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── WAVEFORM with colored bands ── */}
            <div style={{ padding:"12px 18px 4px" }}>
                <div style={{ display:"flex", gap:14, marginBottom:8, flexWrap:"wrap" }}>
                    <span style={{ fontSize:10, fontWeight:600, color:"#7c3aed" }}>📈 Tall wave = loud part</span>
                    <span style={{ fontSize:10, fontWeight:600, color:"#7c3aed" }}>➖ Flat = soft / pause</span>
                    <span style={{ fontSize:10, fontWeight:600, color:"#ef4444" }}>▼ Red = now</span>
                </div>
                <canvas
                    ref={canvasRef}
                    width={560}
                    height={120}
                    style={{ width:"100%", height:120, display:"block", borderRadius:8 }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", margin:"4px 0 6px" }}>
                    <span style={{ fontSize:10, color:"#a78bfa" }}>← Earlier in sentence</span>
                    <span style={{ fontSize:10, color:"#a78bfa" }}>Later in sentence →</span>
                </div>
            </div>

            {/* ── WORD CARDS — full sentence breakdown ── */}
            {status === "ready" && segs.length > 0 && (
                <div style={{ padding:"0 18px 14px" }}>
                    <p style={{ fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.08em", margin:"4px 0 8px" }}>
                        Full sentence — word by word volume guide
                    </p>
                    <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
                        {segs.map((w, i) => {
                            const lv       = getVolLevel(w.amp);
                            const isActive = currentTime >= w.t && currentTime < w.t + w.dur;
                            return (
                                <div key={i} style={{
                                    borderRadius:10, padding:"10px 12px",
                                    backgroundColor: lv.bg,
                                    border:`${isActive ? 2.5 : 1.5}px solid ${isActive ? lv.color : lv.border}`,
                                    minWidth:80, flexShrink:0,
                                    transform: isActive ? "scale(1.08)" : "scale(1)",
                                    transition:"all 0.2s",
                                    boxShadow: isActive ? `0 4px 16px ${lv.color}44` : "none",
                                }}>
                                    <p style={{ fontSize:13, fontWeight:700, color:"#1f2937", margin:"0 0 3px", whiteSpace:"nowrap" }}>
                                        {w.word}
                                    </p>
                                    <p style={{ fontSize:11, fontWeight:800, color:lv.color, margin:"0 0 5px" }}>
                                        {lv.label}
                                    </p>
                                    <div style={{ height:4, background:"#e5e7eb", borderRadius:999, overflow:"hidden", marginBottom:3 }}>
                                        <div style={{ height:"100%", width:lv.pct+"%", background:lv.color, borderRadius:999 }} />
                                    </div>
                                    <p style={{ fontSize:9, color:"#6b7280", margin:0 }}>{lv.tip}</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {status === "loading" && (
                <div style={{ padding:"20px", textAlign:"center", color:"#7c3aed", fontSize:12 }}>
                    ⏳ Analysing audio to detect volume levels...
                </div>
            )}

            {/* Legend */}
            <div style={{ display:"flex", gap:8, flexWrap:"wrap", padding:"0 18px 10px" }}>
                {[
                    { bg:"#fef3c7", color:"#92400e", label:"🔊 LOUD — speak with full voice" },
                    { bg:"#dbeafe", color:"#1e40af", label:"🔉 MEDIUM — normal voice" },
                    { bg:"#f3f4f6", color:"#374151", label:"🔈 SOFT — lower your voice" },
                ].map((l, i) => (
                    <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999, fontSize:10, fontWeight:600, backgroundColor:l.bg, color:l.color }}>
                        {l.label}
                    </span>
                ))}
            </div>
        </motion.div>
    );
}