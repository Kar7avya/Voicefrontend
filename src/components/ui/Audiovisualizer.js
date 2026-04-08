// import React, { useEffect, useRef, useState } from "react";
// import { motion, AnimatePresence } from "framer-motion";

// function getVolLevel(amp) {
//     if (amp >= 0.65) return {
//         label: "🔊 LOUD",   short: "LOUD",
//         color: "#d97706",   bg: "#fef3c7", border: "#fcd34d",
//         tip:   "Speak with full voice",
//         pct:   Math.min(100, Math.round(amp * 100)),
//     };
//     if (amp >= 0.30) return {
//         label: "🔉 MEDIUM", short: "MEDIUM",
//         color: "#1d4ed8",   bg: "#dbeafe", border: "#93c5fd",
//         tip:   "Normal speaking voice",
//         pct:   Math.min(100, Math.round(amp * 100)),
//     };
//     return {
//         label: "🔈 SOFT",   short: "SOFT",
//         color: "#4b5563",   bg: "#f3f4f6", border: "#d1d5db",
//         tip:   "Lower your voice",
//         pct:   Math.min(100, Math.round(amp * 100)),
//     };
// }

// function detectSegments(pcm, sr) {
//     const frameMs   = 20;
//     const frameSize = Math.floor(sr * frameMs / 1000);
//     const silThresh = 0.006;
//     const minWordF  = Math.floor(80  / frameMs);
//     const minSilF   = Math.floor(60  / frameMs);
//     const rms = [];
//     for (let i = 0; i + frameSize < pcm.length; i += frameSize) {
//         let s = 0;
//         for (let j = 0; j < frameSize; j++) s += pcm[i+j]*pcm[i+j];
//         rms.push(Math.sqrt(s / frameSize));
//     }
//     const voiced = rms.map(r => r > silThresh);
//     const segs   = [];
//     let inWord = false, wordStart = 0, silCount = 0;
//     for (let i = 0; i < voiced.length; i++) {
//         if (!inWord && voiced[i]) { inWord = true; wordStart = i; silCount = 0; }
//         else if (inWord) {
//             if (!voiced[i]) {
//                 silCount++;
//                 if (silCount >= minSilF) {
//                     const wordEnd = i - silCount;
//                     if (wordEnd - wordStart >= minWordF)
//                         segs.push({ t: wordStart * frameMs/1000, dur: (wordEnd - wordStart) * frameMs/1000 });
//                     inWord = false; silCount = 0;
//                 }
//             } else silCount = 0;
//         }
//     }
//     if (inWord && voiced.length - wordStart >= minWordF)
//         segs.push({ t: wordStart * frameMs/1000, dur: (voiced.length - wordStart) * frameMs/1000 });
//     return segs;
// }

// function segRMS(pcm, sr, t, dur) {
//     const s0 = Math.floor(t * sr);
//     const sN = Math.floor((t + dur) * sr);
//     let   sum = 0, cnt = 0;
//     for (let i = s0; i < Math.min(sN, pcm.length); i++) { sum += pcm[i]*pcm[i]; cnt++; }
//     return cnt > 0 ? Math.sqrt(sum/cnt) : 0;
// }

// export default function AudioVisualizer({
//     audioURL, audioFeatures, isPlaying, currentTime, duration, language, translatedText
// }) {
//     const canvasRef = useRef(null);
//     const animRef   = useRef(null);
//     const pcmRef    = useRef(null);
//     const srRef     = useRef(22050);
//     const durRef    = useRef(0);

//     const [status, setStatus] = useState("idle");
//     const [segs,   setSegs]   = useState([]);

//     useEffect(() => {
//         if (!audioURL) return;
//         pcmRef.current = null;
//         setStatus("loading");
//         setSegs([]);

//         (async () => {
//             try {
//                 const res     = await fetch(audioURL);
//                 if (!res.ok) throw new Error("fetch failed");
//                 const buf     = await res.arrayBuffer();
//                 const tmpCtx  = new (window.AudioContext || window.webkitAudioContext)();
//                 const decoded = await tmpCtx.decodeAudioData(buf);
//                 await tmpCtx.close();

//                 const sr  = decoded.sampleRate;
//                 const pcm = decoded.getChannelData(0);
//                 srRef.current  = sr;
//                 pcmRef.current = pcm;
//                 durRef.current = decoded.duration;

//                 const raw     = detectSegments(pcm, sr);
//                 const withRms = raw.map(s => ({ ...s, rms: segRMS(pcm, sr, s.t, s.dur) }));
//                 const maxRms  = Math.max(...withRms.map(s => s.rms), 0.001);
//                 const tWords  = translatedText ? translatedText.trim().split(/\s+/) : [];
//                 setSegs(withRms.map((s, i) => ({
//                     ...s,
//                     amp:  s.rms / maxRms,
//                     word: tWords[i] || `Part ${i+1}`,
//                 })));
//                 setStatus("ready");
//             } catch (e) {
//                 console.warn("AudioVisualizer:", e.message);
//                 setStatus("error");
//             }
//         })();
//     }, [audioURL, translatedText]);

//     // ── Draw clean single-line waveform ───────────────────────────────────────
//     useEffect(() => {
//         const canvas = canvasRef.current;
//         if (!canvas) return;

//         const draw = () => {
//             const ctx  = canvas.getContext("2d");
//             const W    = canvas.width;
//             const H    = canvas.height;
//             const mid  = H / 2;
//             const aDur = durRef.current || duration || 1;
//             ctx.clearRect(0, 0, W, H);

//             // White background
//             ctx.fillStyle = "#ffffff";
//             ctx.fillRect(0, 0, W, H);

//             const pcm = pcmRef.current;
//             const sr  = srRef.current;

//             if (pcm && status === "ready" && aDur > 0) {
//                 // Show full waveform (not sliding window — full sentence overview)
//                 const total = pcm.length;

//                 // Downsample PCM to W points
//                 const step = total / W;
//                 let mx = 0.001;
//                 for (let i = 0; i < total; i += Math.floor(step))
//                     if (Math.abs(pcm[i]) > mx) mx = Math.abs(pcm[i]);

//                 // Color each segment differently based on volume
//                 // First draw colored fills
//                 segs.forEach(w => {
//                     const lv    = getVolLevel(w.amp);
//                     const x0    = Math.floor((w.t / aDur) * W);
//                     const x1    = Math.floor(((w.t + w.dur) / aDur) * W);
                    

//                     // Draw segment wave fill with color
//                     ctx.fillStyle = lv.bg + "bb";
//                     ctx.beginPath();
//                     ctx.moveTo(x0, mid);
//                     for (let x = x0; x < x1; x++) {
//                         const si = Math.floor((x / W) * total);
//                         const v  = pcm[Math.min(si, total-1)] / mx;
//                         ctx.lineTo(x, mid - v * (mid - 8));
//                     }
//                     ctx.lineTo(x1, mid);
//                     ctx.closePath();
//                     ctx.fill();
//                 });

//                 // Draw the clean single waveform line on top
//                 // Color changes per segment
//                 let prevX = 0;
//                 segs.forEach((w, wi) => {
//                     const lv = getVolLevel(w.amp);
//                     const x0 = Math.floor((w.t / aDur) * W);
//                     const x1 = Math.floor(((w.t + w.dur) / aDur) * W);

//                     // Draw silence gap before word (flat line)
//                     const prevEnd = wi === 0 ? 0 : Math.floor(((segs[wi-1].t + segs[wi-1].dur) / aDur) * W);
//                     if (x0 > prevEnd) {
//                         ctx.strokeStyle = "#d1d5db";
//                         ctx.lineWidth   = 1.5;
//                         ctx.beginPath();
//                         ctx.moveTo(prevEnd, mid);
//                         ctx.lineTo(x0, mid);
//                         ctx.stroke();
//                     }

//                     // Draw voiced segment with volume color
//                     ctx.strokeStyle = lv.color;
//                     ctx.lineWidth   = 2;
//                     ctx.lineJoin    = "round";
//                     ctx.lineCap     = "round";
//                     ctx.beginPath();
//                     for (let x = x0; x <= x1; x++) {
//                         const si = Math.floor((x / W) * total);
//                         const v  = pcm[Math.min(si, total-1)] / mx;
//                         const y  = mid - v * (mid - 8);
//                         x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
//                     }
//                     ctx.stroke();
//                     prevX = x1;
//                 });

//                 // Trailing silence
//                 if (prevX < W) {
//                     ctx.strokeStyle = "#d1d5db";
//                     ctx.lineWidth   = 1.5;
//                     ctx.beginPath();
//                     ctx.moveTo(prevX, mid);
//                     ctx.lineTo(W, mid);
//                     ctx.stroke();
//                 }

//                 // Playhead — thin vertical red line
//                 const px = Math.floor((currentTime / aDur) * W);
//                 ctx.strokeStyle = "#ef4444";
//                 ctx.lineWidth   = 1.5;
//                 ctx.beginPath(); ctx.moveTo(px, 4); ctx.lineTo(px, H-4); ctx.stroke();

//                 // Dot on wave at playhead
//                 const cv = pcm[Math.min(Math.floor(currentTime * sr), total-1)] / mx;
//                 const cy = mid - cv * (mid - 8);
//                 ctx.fillStyle = "#ef4444";
//                 ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI*2); ctx.fill();
//                 ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
//                 ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI*2); ctx.stroke();

//             } else {
//                 // No audio yet — draw flat center line
//                 ctx.strokeStyle = "#e5e7eb";
//                 ctx.lineWidth   = 1.5;
//                 ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
//             }

//             animRef.current = requestAnimationFrame(draw);
//         };

//         animRef.current = requestAnimationFrame(draw);
//         return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
//     }, [status, currentTime, duration, segs]);

//     if (!audioURL && !audioFeatures) return null;

//     const nowSeg = segs.find(w => currentTime >= w.t && currentTime < w.t + w.dur);
//     const nowVol = nowSeg ? getVolLevel(nowSeg.amp) : null;

//     return (
//         <motion.div
//             initial={{ opacity: 0, y: 14 }}
//             animate={{ opacity: 1, y: 0 }}
//             exit={{ opacity: 0 }}
//             transition={{ duration: 0.5, ease: "easeOut" }}
//             style={{ borderRadius: 16, border: "1.5px solid #e5e7eb", overflow: "hidden", backgroundColor: "#ffffff" }}
//         >
//             {/* Header */}
//             <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom:"1px solid #f3f4f6", backgroundColor:"#fafafa" }}>
//                 <div style={{ display:"flex", alignItems:"center", gap:10 }}>
//                     <div style={{ width:28, height:28, borderRadius:8, backgroundColor:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎙️</div>
//                     <div>
//                         <p style={{ fontSize:11, fontWeight:700, color:"#111827", margin:0 }}>Speaking Volume Guide</p>
//                         <p style={{ fontSize:9, color:"#6b7280", margin:"2px 0 0" }}>
//                             {status === "loading" ? "⏳ Analysing..."
//                              : status === "ready"  ? `${segs.length} parts · how loud to speak each word · ${language || ""}`
//                              :                       language || ""}
//                         </p>
//                     </div>
//                 </div>
//                 <div style={{ display:"flex", gap:6 }}>
//                     {[
//                         { bg:"#fef3c7", color:"#d97706", label:"🔊 LOUD" },
//                         { bg:"#dbeafe", color:"#1d4ed8", label:"🔉 MED"  },
//                         { bg:"#f3f4f6", color:"#4b5563", label:"🔈 SOFT" },
//                     ].map((l, i) => (
//                         <span key={i} style={{ padding:"3px 8px", borderRadius:999, fontSize:9, fontWeight:700, backgroundColor:l.bg, color:l.color }}>
//                             {l.label}
//                         </span>
//                     ))}
//                 </div>
//             </div>

//             {/* ── NOW PLAYING ── */}
//             <AnimatePresence mode="wait">
//                 {nowVol && nowSeg && (
//                     <motion.div
//                         key={nowSeg.t}
//                         initial={{ opacity: 0 }}
//                         animate={{ opacity: 1 }}
//                         exit={{ opacity: 0 }}
//                         transition={{ duration: 0.15 }}
//                         style={{ margin:"10px 18px 0", padding:"10px 14px", borderRadius:10, backgroundColor: nowVol.bg, border:`1.5px solid ${nowVol.border}`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}
//                     >
//                         <p style={{ fontSize:9, fontWeight:700, color: nowVol.color, textTransform:"uppercase", margin:0, minWidth:60 }}>Now →</p>
//                         <p style={{ fontSize:20, fontWeight:900, color: nowVol.color, margin:0 }}>{nowVol.label}</p>
//                         <p style={{ fontSize:11, fontWeight:600, color:"#374151", margin:0 }}>{nowVol.tip}</p>
//                         <div style={{ flex:1, minWidth:60, height:6, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
//                             <div style={{ height:"100%", width: nowVol.pct+"%", background: nowVol.color, borderRadius:999 }} />
//                         </div>
//                     </motion.div>
//                 )}
//             </AnimatePresence>

//             {/* ── WAVEFORM ── */}
//             <div style={{ padding:"12px 18px 6px" }}>
//                 <canvas
//                     ref={canvasRef}
//                     width={560}
//                     height={100}
//                     style={{ width:"100%", height:100, display:"block", borderRadius:6, border:"1px solid #f3f4f6" }}
//                 />
//                 <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
//                     <span style={{ fontSize:9, color:"#9ca3af" }}>Start of sentence</span>
//                     <span style={{ fontSize:9, color:"#ef4444", fontWeight:600 }}>▲ red dot = now</span>
//                     <span style={{ fontSize:9, color:"#9ca3af" }}>End of sentence</span>
//                 </div>
//             </div>

//             {/* ── WORD CARDS ── */}
//             {status === "ready" && segs.length > 0 && (
//                 <div style={{ padding:"6px 18px 14px" }}>
//                     <p style={{ fontSize:9, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>
//                         Word by word guide
//                     </p>
//                     <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
//                         {segs.map((w, i) => {
//                             const lv       = getVolLevel(w.amp);
//                             const isActive = currentTime >= w.t && currentTime < w.t + w.dur;
//                             return (
//                                 <div key={i} style={{
//                                     borderRadius:10, padding:"8px 12px",
//                                     backgroundColor: lv.bg,
//                                     border:`${isActive ? 2.5 : 1.5}px solid ${isActive ? lv.color : lv.border}`,
//                                     minWidth:75, flexShrink:0,
//                                     transform: isActive ? "scale(1.08)" : "scale(1)",
//                                     transition:"all 0.2s",
//                                     boxShadow: isActive ? `0 4px 12px ${lv.color}44` : "none",
//                                 }}>
//                                     <p style={{ fontSize:12, fontWeight:700, color:"#111827", margin:"0 0 3px", whiteSpace:"nowrap" }}>
//                                         {w.word}
//                                     </p>
//                                     <p style={{ fontSize:11, fontWeight:800, color:lv.color, margin:"0 0 4px" }}>
//                                         {lv.short}
//                                     </p>
//                                     <div style={{ height:3, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
//                                         <div style={{ height:"100%", width:lv.pct+"%", background:lv.color, borderRadius:999 }} />
//                                     </div>
//                                 </div>
//                             );
//                         })}
//                     </div>
//                 </div>
//             )}

//             {status === "loading" && (
//                 <div style={{ padding:"16px", textAlign:"center", color:"#9ca3af", fontSize:11 }}>
//                     ⏳ Analysing audio volume levels...
//                 </div>
//             )}
//         </motion.div>
//     );
// }
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

function detectSegments(pcm, sr, targetWords) {
    const frameMs   = 20;
    const frameSize = Math.floor(sr * frameMs / 1000);
    const minWordF  = Math.floor(30 / frameMs);

    const rms = [];
    for (let i = 0; i + frameSize < pcm.length; i += frameSize) {
        let s = 0;
        for (let j = 0; j < frameSize; j++) s += pcm[i+j]*pcm[i+j];
        rms.push(Math.sqrt(s / frameSize));
    }

    // Try multiple thresholds — pick the one that gives closest to targetWords segments
    const thresholds = [0.001, 0.002, 0.003, 0.005, 0.008, 0.012, 0.02];
    const silGaps    = [2, 3, 4, 5];
    let bestSegs = [];
    let bestDiff = Infinity;

    for (const silThresh of thresholds) {
        for (const minSilF of silGaps) {
            const voiced = rms.map(r => r > silThresh);
            const segs   = [];
            let inWord = false, wordStart = 0, silCount = 0;
            for (let i = 0; i < voiced.length; i++) {
                if (!inWord && voiced[i]) { inWord = true; wordStart = i; silCount = 0; }
                else if (inWord) {
                    if (!voiced[i]) {
                        silCount++;
                        if (silCount >= minSilF) {
                            const wordEnd = i - silCount;
                            if (wordEnd - wordStart >= minWordF)
                                segs.push({ t: wordStart * frameMs/1000, dur: (wordEnd - wordStart) * frameMs/1000 });
                            inWord = false; silCount = 0;
                        }
                    } else silCount = 0;
                }
            }
            if (inWord && voiced.length - wordStart >= minWordF)
                segs.push({ t: wordStart * frameMs/1000, dur: (voiced.length - wordStart) * frameMs/1000 });

            const diff = Math.abs(segs.length - targetWords);
            if (diff < bestDiff || (diff === bestDiff && segs.length > bestSegs.length)) {
                bestDiff = diff;
                bestSegs = segs;
            }
            if (diff === 0) break;
        }
        if (bestDiff === 0) break;
    }

    return bestSegs;
}

function segRMS(pcm, sr, t, dur) {
    const s0 = Math.floor(t * sr);
    const sN = Math.floor((t + dur) * sr);
    let   sum = 0, cnt = 0;
    for (let i = s0; i < Math.min(sN, pcm.length); i++) { sum += pcm[i]*pcm[i]; cnt++; }
    return cnt > 0 ? Math.sqrt(sum/cnt) : 0;
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

                const tWords  = translatedText ? translatedText.trim().split(/\s+/) : [];
                const raw     = detectSegments(pcm, sr, tWords.length || 5);
                const withRms = raw.map(s => ({ ...s, rms: segRMS(pcm, sr, s.t, s.dur) }));
                const maxRms  = Math.max(...withRms.map(s => s.rms), 0.001);
                setSegs(withRms.map((s, i) => ({
                    ...s,
                    amp:  s.rms / maxRms,
                    word: tWords[i] || `Part ${i+1}`,
                })));
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

            // ── Guide zone labels ─────────────────────────────────────────────
            // Top zone label
            ctx.fillStyle = "rgba(217,119,6,0.07)";
            ctx.fillRect(0, 0, W, mid - 10);
            ctx.fillStyle = "rgba(107,114,128,0.05)";
            ctx.fillRect(0, mid + 10, W, mid - 10);

            // Zone text
            ctx.font      = "10px sans-serif";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(217,119,6,0.5)";
            ctx.fillText("LOUD zone ↑", 6, 14);
            ctx.fillStyle = "rgba(107,114,128,0.4)";
            ctx.fillText("SOFT zone ↓", 6, H - 5);

            // ── Center line ───────────────────────────────────────────────────
            ctx.strokeStyle = "#e5e7eb";
            ctx.lineWidth   = 1;
            ctx.setLineDash([6, 4]);
            ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
            ctx.setLineDash([]);

            // ── Draw waveform ─────────────────────────────────────────────────
            if (pcm && status === "ready" && aDur > 0) {
                let mx = 0.001;
                for (let i = 0; i < total; i += 4)
                    if (Math.abs(pcm[i]) > mx) mx = Math.abs(pcm[i]);

                // Silence gaps — flat grey line
                let prevEnd = 0;
                segs.forEach(w => {
                    const x0 = Math.floor((w.t / aDur) * W);
                    if (x0 > prevEnd) {
                        ctx.strokeStyle = "#d1d5db";
                        ctx.lineWidth   = 1.5;
                        ctx.beginPath();
                        ctx.moveTo(prevEnd, mid);
                        ctx.lineTo(x0, mid);
                        ctx.stroke();
                    }
                    prevEnd = Math.floor(((w.t + w.dur) / aDur) * W);
                });
                if (prevEnd < W) {
                    ctx.strokeStyle = "#d1d5db";
                    ctx.lineWidth   = 1.5;
                    ctx.beginPath(); ctx.moveTo(prevEnd, mid); ctx.lineTo(W, mid); ctx.stroke();
                }

                // Voiced segments — colored waveform line
                segs.forEach(w => {
                    const lv = getVolLevel(w.amp);
                    const x0 = Math.floor((w.t / aDur) * W);
                    const x1 = Math.floor(((w.t + w.dur) / aDur) * W);

                    // Draw waveform line for this segment
                    ctx.strokeStyle = lv.color;
                    ctx.lineWidth   = 2;
                    ctx.lineJoin    = "round";
                    ctx.beginPath();
                    for (let x = x0; x <= x1; x++) {
                        const si = Math.min(Math.floor((x / W) * total), total - 1);
                        const v  = pcm[si] / mx;
                        const y  = mid - v * (mid - 14);
                        x === x0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                    }
                    ctx.stroke();

                    // ── Word label bubble above the peak ─────────────────────
                    const bw = x1 - x0;
                    if (bw > 20) {
                        // Find peak in this segment
                        let peakV = 0;
                        for (let x = x0; x <= x1; x++) {
                            const si = Math.min(Math.floor((x / W) * total), total - 1);
                            if (Math.abs(pcm[si]) > Math.abs(peakV)) peakV = pcm[si];
                        }
                        const peakY = mid - (peakV / mx) * (mid - 14);
                        const bboxEst = 50;
                        const bx    = Math.max(bboxEst/2 + 4, Math.min(W - bboxEst/2 - 4, x0 + bw / 2));

                        // Label position: above wave if positive, below if mostly negative
                        const labelY = peakV >= 0
                            ? Math.max(24, peakY - 8)
                            : Math.min(H - 8, peakY + 20);

                        // Bubble background
                        const text    = w.word.length > 10 ? w.word.slice(0, 9) + "…" : w.word;
                        const volText = lv.short;
                        const bboxW   = Math.max(ctx.measureText(text).width, ctx.measureText(volText).width) + 12;

                        ctx.fillStyle   = lv.bg;
                        ctx.strokeStyle = lv.color;
                        ctx.lineWidth   = 1;
                        ctx.beginPath();
                        if (ctx.roundRect) ctx.roundRect(bx - bboxW/2, labelY - 22, bboxW, 22, 4);
                        else              ctx.rect(bx - bboxW/2, labelY - 22, bboxW, 22);
                        ctx.fill();
                        ctx.stroke();

                        // Word text
                        ctx.fillStyle = "#111827";
                        ctx.font      = "bold 9px sans-serif";
                        ctx.textAlign = "center";
                        ctx.fillText(text, bx, labelY - 12);

                        // Volume text
                        ctx.fillStyle = lv.color;
                        ctx.font      = "bold 8px sans-serif";
                        ctx.fillText(volText, bx, labelY - 3);

                        // Connector dot
                        ctx.fillStyle = lv.color;
                        ctx.beginPath();
                        ctx.arc(bx, peakY, 3, 0, Math.PI * 2);
                        ctx.fill();
                    }
                });

                // ── Playhead ──────────────────────────────────────────────────
                const px = Math.floor((currentTime / aDur) * W);
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth   = 1.5;
                ctx.beginPath(); ctx.moveTo(px, 4); ctx.lineTo(px, H - 4); ctx.stroke();

                const cv = pcm[Math.min(Math.floor(currentTime * sr), total - 1)] / mx;
                const cy = mid - cv * (mid - 14);
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.fill();
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(px, cy, 4, 0, Math.PI * 2); ctx.stroke();

            } else {
                // No audio — flat placeholder line
                ctx.strokeStyle = "#e5e7eb";
                ctx.lineWidth   = 1.5;
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
            {/* ── Header ── */}
            <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", padding:"10px 18px", borderBottom:"1px solid #f3f4f6", backgroundColor:"#fafafa" }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                    <div style={{ width:28, height:28, borderRadius:8, backgroundColor:"#f3f4f6", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>🎙️</div>
                    <div>
                        <p style={{ fontSize:11, fontWeight:700, color:"#111827", margin:0 }}>Speaking Volume Guide</p>
                        <p style={{ fontSize:9, color:"#6b7280", margin:"2px 0 0" }}>
                            {status === "loading" ? "⏳ Reading audio..."
                             : status === "ready"  ? `${segs.length} words · ${language || ""} · each word shows how loud to speak`
                             :                       language || ""}
                        </p>
                    </div>
                </div>
                {/* Legend pills */}
                <div style={{ display:"flex", gap:5, flexWrap:"wrap" }}>
                    {[
                        { bg:"#fef3c7", color:"#d97706", label:"🔊 LOUD = full voice"   },
                        { bg:"#dbeafe", color:"#1d4ed8", label:"🔉 MED = normal voice"  },
                        { bg:"#f3f4f6", color:"#6b7280", label:"🔈 SOFT = lower voice"  },
                    ].map((l, i) => (
                        <span key={i} style={{ padding:"3px 8px", borderRadius:999, fontSize:9, fontWeight:600, backgroundColor:l.bg, color:l.color }}>
                            {l.label}
                        </span>
                    ))}
                </div>
            </div>

            {/* ── How to read explanation ── */}
            <div style={{ padding:"8px 18px 0", display:"flex", gap:14, flexWrap:"wrap" }}>
                <span style={{ fontSize:10, color:"#d97706", fontWeight:600 }}>↑ High wave = LOUD word</span>
                <span style={{ fontSize:10, color:"#6b7280", fontWeight:600 }}>↓ Low wave = SOFT word</span>
                <span style={{ fontSize:10, color:"#9ca3af", fontWeight:600 }}>— Flat line = silence / pause</span>
                <span style={{ fontSize:10, color:"#ef4444", fontWeight:600 }}>| Red line = playing now</span>
            </div>

            {/* ── Waveform canvas ── */}
            <div style={{ padding:"8px 18px 4px" }}>
                <canvas
                    ref={canvasRef}
                    width={560}
                    height={150}
                    style={{ width:"100%", height:150, display:"block", borderRadius:8, border:"1px solid #f3f4f6" }}
                />
                <div style={{ display:"flex", justifyContent:"space-between", marginTop:4 }}>
                    <span style={{ fontSize:9, color:"#9ca3af" }}>← Start of sentence</span>
                    <span style={{ fontSize:9, color:"#9ca3af" }}>End of sentence →</span>
                </div>
            </div>

            {/* ── NOW PLAYING banner ── */}
            <AnimatePresence mode="wait">
                {nowVol && nowSeg && (
                    <motion.div
                        key={nowSeg.t}
                        initial={{ opacity: 0, y: -6 }}
                        animate={{ opacity: 1, y: 0 }}
                        exit={{ opacity: 0 }}
                        transition={{ duration: 0.15 }}
                        style={{ margin:"4px 18px 8px", padding:"10px 14px", borderRadius:10, backgroundColor: nowVol.bg, border:`1.5px solid ${nowVol.border}`, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}
                    >
                        <p style={{ fontSize:9, fontWeight:700, color: nowVol.color, textTransform:"uppercase", margin:0 }}>Speaking now →</p>
                        <p style={{ fontSize:18, fontWeight:900, color: nowVol.color, margin:0 }}>{nowVol.label}</p>
                        <p style={{ fontSize:11, fontWeight:600, color:"#374151", margin:0 }}>{nowVol.tip}</p>
                        <div style={{ flex:1, minWidth:60, height:6, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
                            <div style={{ height:"100%", width: nowVol.pct+"%", background: nowVol.color, borderRadius:999 }} />
                        </div>
                        <span style={{ fontSize:12, fontWeight:700, color: nowVol.color }}>{nowVol.pct}%</span>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* ── Word cards ── */}
            {status === "ready" && segs.length > 0 && (
                <div style={{ padding:"0 18px 14px" }}>
                    <p style={{ fontSize:9, fontWeight:700, color:"#9ca3af", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 8px" }}>
                        Word-by-word guide — how loud to speak each word
                    </p>
                    <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:4 }}>
                        {segs.map((w, i) => {
                            const lv       = getVolLevel(w.amp);
                            const isActive = currentTime >= w.t && currentTime < w.t + w.dur;
                            return (
                                <div key={i} style={{
                                    borderRadius:10, padding:"8px 12px",
                                    backgroundColor: lv.bg,
                                    border:`${isActive ? 2.5 : 1.5}px solid ${isActive ? lv.color : lv.border}`,
                                    minWidth:72, flexShrink:0,
                                    transform: isActive ? "scale(1.1)" : "scale(1)",
                                    transition:"all 0.2s",
                                    boxShadow: isActive ? `0 4px 14px ${lv.color}55` : "none",
                                    textAlign:"center",
                                }}>
                                    <p style={{ fontSize:12, fontWeight:700, color:"#111827", margin:"0 0 2px", whiteSpace:"nowrap" }}>
                                        {w.word}
                                    </p>
                                    <p style={{ fontSize:13, fontWeight:900, color:lv.color, margin:"0 0 4px" }}>
                                        {lv.short}
                                    </p>
                                    <div style={{ height:3, background:"#e5e7eb", borderRadius:999, overflow:"hidden", marginBottom:2 }}>
                                        <div style={{ height:"100%", width:lv.pct+"%", background:lv.color, borderRadius:999 }} />
                                    </div>
                                    <p style={{ fontSize:8, color:"#6b7280", margin:0 }}>{lv.pct}%</p>
                                </div>
                            );
                        })}
                    </div>
                </div>
            )}

            {status === "loading" && (
                <div style={{ padding:"16px 18px", textAlign:"center", color:"#9ca3af", fontSize:11 }}>
                    ⏳ Analysing audio to find loud and soft parts...
                </div>
            )}

            {/* ── Layman explanation ── */}
            <div style={{ margin:"0 18px 14px", padding:"10px 14px", borderRadius:10, backgroundColor:"#f9fafb", border:"1px solid #e5e7eb" }}>
                <p style={{ fontSize:10, color:"#374151", lineHeight:1.8, margin:0 }}>
                    <strong>How to read this:</strong> The wave shows the voice going up and down.
                    When the wave goes <span style={{ color:"#d97706", fontWeight:700 }}>high up</span> — that word was spoken LOUDLY.
                    When it stays <span style={{ color:"#6b7280", fontWeight:700 }}>close to the center line</span> — that word was soft or quiet.
                    The colored labels on the wave tell you exactly which word was LOUD, MEDIUM or SOFT.
                    Use this as your guide when you practice speaking.
                </p>
            </div>
        </motion.div>
    );
}