import React, { useEffect, useRef, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

function getVolLevel(amp) {
    if (amp >= 0.65) return {
        label: "🔊 LOUD",   short: "LOUD",
        color: "#d97706",   bg: "#fef3c7", border: "#fcd34d",
        tip:   "Speak with FULL voice",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
    if (amp >= 0.30) return {
        label: "🔉 MEDIUM", short: "MED",
        color: "#1d4ed8",   bg: "#dbeafe", border: "#93c5fd",
        tip:   "Normal speaking voice",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
    return {
        label: "🔈 SOFT",   short: "SOFT",
        color: "#6b7280",   bg: "#f3f4f6", border: "#d1d5db",
        tip:   "Lower your voice",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
}

// ── RMS for a PCM slice ───────────────────────────────────────────────────────
function sliceRMS(pcm, sr, t, dur) {
    const s0 = Math.floor(t * sr);
    const sN = Math.floor((t + dur) * sr);
    let   sum = 0, cnt = 0;
    for (let i = s0; i < Math.min(sN, pcm.length); i++) { sum += pcm[i]*pcm[i]; cnt++; }
    return cnt > 0 ? Math.sqrt(sum / cnt) : 0;
}

// ── Split text into words and assign time proportional to character count ─────
// This ALWAYS gives exactly one segment per word regardless of TTS pausing
function buildWordSegments(pcm, sr, totalDur, words) {
    if (!words.length) return [];

    // Count total characters (longer words get more time)
    const charCounts = words.map(w => Math.max(1, w.length));
    const totalChars = charCounts.reduce((a, b) => a + b, 0);

    // Assign time slices
    let cursor = 0;
    const segs = words.map((word, i) => {
        const dur = (charCounts[i] / totalChars) * totalDur;
        const seg = { word, t: cursor, dur };
        cursor += dur;
        return seg;
    });

    // Compute RMS for each slice
    const withRms = segs.map(s => ({ ...s, rms: sliceRMS(pcm, sr, s.t, s.dur) }));
    const maxRms  = Math.max(...withRms.map(s => s.rms), 0.001);
    return withRms.map(s => ({ ...s, amp: s.rms / maxRms }));
}

export default function AudioVisualizer({
    audioURL, audioFeatures, isPlaying, currentTime, duration, language, translatedText
}) {
    const canvasRef = useRef(null);
    const animRef   = useRef(null);
    const pcmRef    = useRef(null);
    const srRef     = useRef(22050);
    const durRef    = useRef(0);

    const [status, setStatus] = useState("idle");
    const [segs,   setSegs]   = useState([]);

    // ── Decode audio + build word segments ────────────────────────────────────
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

                // Split translated text into words
                const words = (translatedText || "").trim().split(/\s+/).filter(Boolean);

                // Build one segment per word using time-proportional assignment
                const built = buildWordSegments(pcm, sr, decoded.duration, words);
                setSegs(built);
                setStatus("ready");
            } catch (e) {
                console.warn("AudioVisualizer:", e.message);
                setStatus("error");
            }
        })();
    }, [audioURL, translatedText]);

    // ── Draw waveform ─────────────────────────────────────────────────────────
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
            ctx.fillStyle = "#ffffff";
            ctx.fillRect(0, 0, W, H);

            const pcm   = pcmRef.current;
            const sr    = srRef.current;
            const total = pcm ? pcm.length : 0;

            // Zone backgrounds
            ctx.fillStyle = "rgba(217,119,6,0.04)";
            ctx.fillRect(0, 0, W, mid - 10);
            ctx.fillStyle = "rgba(107,114,128,0.04)";
            ctx.fillRect(0, mid + 10, W, mid - 10);

            // Zone labels
            ctx.font = "9px sans-serif"; ctx.textAlign = "left";
            ctx.fillStyle = "rgba(217,119,6,0.45)";
            ctx.fillText("LOUD zone ↑", 5, 13);
            ctx.fillStyle = "rgba(107,114,128,0.35)";
            ctx.fillText("SOFT zone ↓", 5, H - 4);

            // Center dashed line
            ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1;
            ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
            ctx.setLineDash([]);

            if (pcm && status === "ready" && aDur > 0 && total > 0) {
                // Normalize full PCM
                let mx = 0.001;
                for (let i = 0; i < total; i += 4)
                    if (Math.abs(pcm[i]) > mx) mx = Math.abs(pcm[i]);

                // Draw each word segment with its color
                segs.forEach(w => {
                    const lv = getVolLevel(w.amp);
                    const x0 = Math.floor((w.t / aDur) * W);
                    const x1 = Math.floor(((w.t + w.dur) / aDur) * W);

                    // Waveform line for this segment
                    ctx.strokeStyle = lv.color;
                    ctx.lineWidth   = 2;
                    ctx.lineJoin    = "round";
                    ctx.beginPath();
                    for (let x = x0; x <= x1; x++) {
                        const si = Math.min(Math.floor((x / W) * total), total - 1);
                        const v  = pcm[si] / mx;
                        const y  = mid - v * (mid - 18);
                        x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // ── Word label bubble ─────────────────────────────────────
                    const bw = x1 - x0;
                    if (bw > 10) {
                        // Find peak sample in this segment
                        let peakV = 0;
                        for (let x = x0; x <= x1; x++) {
                            const si = Math.min(Math.floor((x / W) * total), total - 1);
                            if (Math.abs(pcm[si]) > Math.abs(peakV)) peakV = pcm[si];
                        }
                        const peakY = mid - (peakV / mx) * (mid - 18);
                        const bx    = Math.max(28, Math.min(W - 28, x0 + bw / 2));

                        // Truncate long words
                        const text = w.word.length > 9 ? w.word.slice(0, 8) + "…" : w.word;
                        ctx.font = "bold 9px sans-serif";
                        const tw  = Math.max(ctx.measureText(text).width, 28) + 10;

                        // Position label: above for positive peak, below for negative
                        const above  = peakV >= 0;
                        const labelY = above
                            ? Math.max(26, peakY - 6)
                            : Math.min(H - 8, peakY + 26);

                        // Bubble
                        ctx.fillStyle   = lv.bg;
                        ctx.strokeStyle = lv.color;
                        ctx.lineWidth   = 1;
                        ctx.beginPath();
                        if (ctx.roundRect) ctx.roundRect(bx - tw/2, labelY - 22, tw, 22, 4);
                        else ctx.rect(bx - tw/2, labelY - 22, tw, 22);
                        ctx.fill(); ctx.stroke();

                        // Word
                        ctx.fillStyle = "#111827";
                        ctx.font      = "bold 9px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText(text, bx, labelY - 12);

                        // Volume tag
                        ctx.fillStyle = lv.color;
                        ctx.font      = "bold 8px sans-serif";
                        ctx.fillText(lv.short, bx, labelY - 3);

                        // Connector dot
                        ctx.fillStyle = lv.color;
                        ctx.beginPath(); ctx.arc(bx, peakY, 3, 0, Math.PI * 2); ctx.fill();
                    }
                });

                // Playhead
                const px = Math.max(1, Math.min(W-1, Math.floor((currentTime / aDur) * W)));
                ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(px, 3); ctx.lineTo(px, H - 3); ctx.stroke();

                const cv = pcm[Math.min(Math.floor(currentTime * sr), total - 1)] / mx;
                const cy = mid - cv * (mid - 18);
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.stroke();

            } else {
                // Placeholder flat line
                ctx.strokeStyle = "#e5e7eb"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.moveTo(20, mid); ctx.lineTo(W - 20, mid); ctx.stroke();
            }

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
            style={{ borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden", backgroundColor: "#ffffff" }}
        >
            {/* Header */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom:"1px solid #f3f4f6", backgroundColor:"#fafafa", flexWrap:"wrap", gap:8 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, backgroundColor:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎙️</div>
                    <div>
                        <p style={{ fontSize:11, fontWeight:700, color:"#111827", margin:0 }}>Speaking Volume Guide</p>
                        <p style={{ fontSize:9, color:"#6b7280", margin:"2px 0 0" }}>
                            {status === "loading" ? "⏳ Reading audio..."
                             : status === "ready"  ? `${segs.length} words · ${language || ""} · how loud to speak each word`
                             :                       language || ""}
                        </p>
                    </div>
                </div>
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {[
                        { bg:"#fef3c7", color:"#d97706", label:"🔊 LOUD = full voice"  },
                        { bg:"#dbeafe", color:"#1d4ed8", label:"🔉 MED = normal voice" },
                        { bg:"#f3f4f6", color:"#6b7280", label:"🔈 SOFT = lower voice" },
                    ].map((l, i) => (
                        <span key={i} style={{ padding:"3px 8px", borderRadius:999, fontSize:9, fontWeight:600, backgroundColor:l.bg, color:l.color }}>
                            {l.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* How to read */}
            <div style={{ padding:"8px 18px 0", display:"flex", gap:14, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, color:"#d97706", fontWeight:600 }}>↑ High wave = LOUD</span>
                <span style={{ fontSize:10, color:"#6b7280", fontWeight:600 }}>↓ Low wave = SOFT</span>
                <span style={{ fontSize:10, color:"#ef4444", fontWeight:600 }}>| Red = now playing</span>
            </div>

            {/* Canvas */}
            <div style={{ padding:"8px 18px 4px" }}>
                <canvas ref={canvasRef} width={560} height={150}
                    style={{ width:"100%", height:150, display:"block", borderRadius:8, border:"1px solid #f3f4f6" }} />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                    <span style={{ fontSize:9, color:"#9ca3af" }}>← Start</span>
                    <span style={{ fontSize:9, color:"#9ca3af" }}>End →</span>
                </div>
            </div>

            {/* Now playing banner */}
            <AnimatePresence mode="wait">
                {nowVol && nowSeg && (
                    <motion.div
                        key={nowSeg.t}
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ margin:"4px 18px 8px", padding:"10px 14px", borderRadius:10, backgroundColor: nowVol.bg, border:`1.5px solid ${nowVol.border}`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}
                    >
                        <p style={{ fontSize:9, fontWeight:700, color: nowVol.color, textTransform:"uppercase", margin:0 }}>Now →</p>
                        <p style={{ fontSize:16, fontWeight:900, color:"#111827", margin:0 }}>"{nowSeg.word}"</p>
                        <p style={{ fontSize:18, fontWeight:900, color: nowVol.color, margin:0 }}>{nowVol.label}</p>
                        <p style={{ fontSize:11, fontWeight:600, color:"#374151", margin:0 }}>{nowVol.tip}</p>
                        <div style={{ flex:1, minWidth:60, height:6, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
                            <div style={{ height:"100%", width: nowVol.pct+"%", background: nowVol.color, borderRadius:999 }} />
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color: nowVol.color }}>{nowVol.pct}%</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Word cards */}
            {status === "ready" && segs.length > 0 && (
                <div style={{ padding:"0 18px 12px" }}>
                    <p style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>
                        Every word — how loud to speak it
                    </p>
                    <div style={{ display:"flex", gap:6, overflowX:"auto", paddingBottom:4 }}>
                        {segs.map((w, i) => {
                            const lv       = getVolLevel(w.amp);
                            const isActive = currentTime >= w.t && currentTime < w.t + w.dur;
                            return (
                                <div key={i} style={{
                                    borderRadius:10, padding:"8px 10px",
                                    backgroundColor: lv.bg,
                                    border:`${isActive ? 2.5 : 1.5}px solid ${isActive ? lv.color : lv.border}`,
                                    minWidth:64, flexShrink:0,
                                    transform: isActive ? "scale(1.1)" : "scale(1)",
                                    transition:"all 0.2s",
                                    boxShadow: isActive ? `0 4px 14px ${lv.color}55` : "none",
                                    textAlign:"center",
                                }}>
                                    <p style={{ fontSize:11, fontWeight:700, color:"#111827", margin:"0 0 2px", whiteSpace:"nowrap" }}>
                                        {w.word}
                                    </p>
                                    <p style={{ fontSize:12, fontWeight:900, color:lv.color, margin:"0 0 3px" }}>
                                        {lv.short}
                                    </p>
                                    <div style={{ height:3, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
                                        <div style={{ height:"100%", width:lv.pct+"%", background:lv.color, borderRadius:999 }} />
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {status === "loading" && (
                <div style={{ padding:"16px 18px", textAlign:"center", color:"#9ca3af", fontSize:11 }}>
                    ⏳ Analysing audio...
                </div>
            )}

            {/* Layman explanation */}
            <div style={{ margin:"0 18px 14px", padding:"10px 14px", borderRadius:10, backgroundColor:"#f9fafb", border:"1px solid #e5e7eb" }}>
                <p style={{ fontSize:10, color:"#374151", lineHeight:1.8, margin:0 }}>
                    <strong>How to read this:</strong> The wave goes up and down as the voice speaks.
                    A <span style={{ color:"#d97706", fontWeight:700 }}>tall wave (↑)</span> means that word was spoken LOUDLY — speak strongly there.
                    A <span style={{ color:"#6b7280", fontWeight:700 }}>short wave (↓)</span> means soft — lower your voice there.
                    Each colored bubble on the wave shows the word and its volume. Use the cards below as your speaking guide.
                </p>
            </div>
        </motion.div>
    );
}