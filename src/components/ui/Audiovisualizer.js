import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function getVolLevel(amp) {
    if (amp >= 0.65) return {
        label: "🔊 LOUD",   short: "LOUD",
        color: "#d97706",   bg: "#fef3c7", border: "#fcd34d",
        tip:   "Speak with full voice",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
    if (amp >= 0.30) return {
        label: "🔉 MEDIUM", short: "MEDIUM",
        color: "#1d4ed8",   bg: "#dbeafe", border: "#93c5fd",
        tip:   "Normal speaking voice",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
    return {
        label: "🔈 SOFT",   short: "SOFT",
        color: "#4b5563",   bg: "#f3f4f6", border: "#d1d5db",
        tip:   "Gentle, quiet",
        pct:   Math.min(100, Math.round(amp * 100)),
    };
}

// ── Detect word-like segments from PCM using silence detection ────────────────
function detectWordSegments(pcm, sr) {
    const frameSize  = Math.floor(sr * 0.02);   // 20ms frames
    const silThresh  = 0.008;                    // silence threshold
    const minWordMs  = 80;                       // min word length ms
    const minSilMs   = 60;                       // min silence gap ms
    const minWordFrames = Math.floor(minWordMs / 20);
    const minSilFrames  = Math.floor(minSilMs  / 20);

    // Compute RMS per frame
    const frames = [];
    for (let i = 0; i + frameSize < pcm.length; i += frameSize) {
        let sum = 0;
        for (let j = 0; j < frameSize; j++) sum += pcm[i+j] * pcm[i+j];
        frames.push(Math.sqrt(sum / frameSize));
    }

    // Mark voiced/silent frames
    const voiced = frames.map(r => r > silThresh);

    // Find word boundaries
    const segments = [];
    let inWord  = false;
    let wordStart = 0;
    let silCount  = 0;

    for (let i = 0; i < voiced.length; i++) {
        if (!inWord && voiced[i]) {
            inWord    = true;
            wordStart = i;
            silCount  = 0;
        } else if (inWord) {
            if (!voiced[i]) {
                silCount++;
                if (silCount >= minSilFrames) {
                    const wordEnd = i - silCount;
                    const len     = wordEnd - wordStart;
                    if (len >= minWordFrames) {
                        segments.push({
                            t:   wordStart * 0.02,
                            dur: len * 0.02,
                        });
                    }
                    inWord   = false;
                    silCount = 0;
                }
            } else {
                silCount = 0;
            }
        }
    }
    // Last word
    if (inWord) {
        const len = voiced.length - wordStart;
        if (len >= minWordFrames) {
            segments.push({ t: wordStart * 0.02, dur: len * 0.02 });
        }
    }

    return segments;
}

// ── Compute RMS for a segment ─────────────────────────────────────────────────
function segmentRMS(pcm, sr, t, dur) {
    const s0 = Math.floor(t * sr);
    const sN = Math.floor((t + dur) * sr);
    let   sum = 0, cnt = 0;
    for (let i = s0; i < Math.min(sN, pcm.length); i++) {
        sum += pcm[i] * pcm[i]; cnt++;
    }
    return cnt > 0 ? Math.sqrt(sum / cnt) : 0;
}

const WIN_SEC = 1.4;

export default function AudioVisualizer({
    audioURL, audioFeatures, isPlaying, currentTime, duration, language, translatedText
}) {
    const waveRef  = useRef(null);
    const wAnimRef = useRef(null);
    const pcmRef   = useRef(null);
    const srRef    = useRef(22050);
    const durRef   = useRef(0);

    const [status, setStatus] = useState("idle");
    const [tab,    setTab]    = useState("guide");
    const [words,  setWords]  = useState([]);   // detected word segments with volume

    // ── Decode + detect words ─────────────────────────────────────────────────
    useEffect(() => {
        if (!audioURL) return;
        pcmRef.current = null;
        setStatus("loading");
        setWords([]);

        const run = async () => {
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

                // Detect word-like segments from silence
                const segs = detectWordSegments(pcm, sr);

                // Compute RMS for each segment
                const withRms = segs.map(s => ({
                    ...s,
                    rms: segmentRMS(pcm, sr, s.t, s.dur),
                }));

                // Normalize RMS to 0–1
                const maxRms = Math.max(...withRms.map(s => s.rms), 0.001);
                const normed = withRms.map((s, i) => ({
                    ...s,
                    amp:   s.rms / maxRms,
                    label: `Word ${i + 1}`,
                }));

                // Split translated text into words and assign
                if (translatedText) {
                    const tWords = translatedText.trim().split(/\s+/);
                    normed.forEach((s, i) => {
                        s.label = tWords[i] ? `"${tWords[i]}"` : `Word ${i+1}`;
                    });
                }

                setWords(normed);
                setStatus("ready");
            } catch (e) {
                console.warn("AudioVisualizer:", e.message);
                setStatus("error");
            }
        };
        run();
    }, [audioURL, translatedText]);

    // ── Waveform draw ─────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = waveRef.current;
        if (!canvas || tab !== "wave") return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            const mid = H / 2;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "#faf5ff";
            ctx.fillRect(0, 0, W, H);

            const pcm  = pcmRef.current;
            const sr   = srRef.current;
            const aDur = durRef.current || duration || 1;

            // Color background per word
            words.forEach(w => {
                const lv    = getVolLevel(w.amp);
                const relSt = w.t / aDur;
                const relEn = (w.t + w.dur) / aDur;
                ctx.fillStyle = lv.bg + "99";
                ctx.fillRect(relSt * W, 0, Math.max(2, (relEn - relSt) * W), H);
            });

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

                ctx.strokeStyle = "rgba(124,58,237,0.2)";
                ctx.lineWidth = 1; ctx.setLineDash([4, 4]);
                ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
                ctx.setLineDash([]);

                ctx.fillStyle = "rgba(109,40,217,0.15)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const s = s0 + Math.floor((x/W)*range);
                    const v = pcm[Math.min(s, total-1)] / mx;
                    ctx.lineTo(x, mid - Math.max(0, v) * (mid-12));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                ctx.fillStyle = "rgba(236,72,153,0.1)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const s = s0 + Math.floor((x/W)*range);
                    const v = pcm[Math.min(s, total-1)] / mx;
                    ctx.lineTo(x, mid - Math.min(0, v) * (mid-12));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                ctx.strokeStyle = "#7c3aed"; ctx.lineWidth = 2;
                ctx.beginPath();
                for (let x = 0; x < W; x++) {
                    const s = s0 + Math.floor((x/W)*range);
                    const v = pcm[Math.min(s, total-1)] / mx;
                    const y = mid - v * (mid - 12);
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Word volume labels on waveform
                words.forEach(w => {
                    const lv     = getVolLevel(w.amp);
                    const relMid = (w.t + w.dur/2) / aDur;
                    const wx     = relMid * W;
                    ctx.fillStyle   = lv.color + "cc";
                    ctx.font        = "bold 9px sans-serif";
                    ctx.textAlign   = "center";
                    ctx.fillText(lv.short, wx, H - 4);
                });

                // Playhead
                const px = W / 2;
                ctx.strokeStyle = "#ef4444"; ctx.lineWidth = 2.5;
                ctx.beginPath(); ctx.moveTo(px, 2); ctx.lineTo(px, H-2); ctx.stroke();
                const cs = Math.floor(currentTime * sr);
                const cv = pcm[Math.min(cs, total-1)] / mx;
                const cy = mid - cv * (mid-12);
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(px, cy, 5, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = "#fff"; ctx.lineWidth = 1.5;
                ctx.beginPath(); ctx.arc(px, cy, 5, 0, Math.PI*2); ctx.stroke();
            }

            ctx.font = "bold 9px sans-serif"; ctx.textAlign = "left";
            ctx.fillStyle = "rgba(109,40,217,0.5)";
            ctx.fillText("LOUD ↑", 4, 13);
            ctx.fillText("SOFT ↓", 4, H - 4);

            wAnimRef.current = requestAnimationFrame(draw);
        };

        wAnimRef.current = requestAnimationFrame(draw);
        return () => { if (wAnimRef.current) cancelAnimationFrame(wAnimRef.current); };
    }, [status, currentTime, duration, words, tab]);

    if (!audioFeatures && !audioURL) return null;

    const aDur   = durRef.current || duration || 1;
    const nowWord = words.find(w => currentTime >= w.t && currentTime < w.t + w.dur);
    const nowVol  = nowWord ? getVolLevel(nowWord.amp) : null;

    const tabBtn = (t, label) => ({
        padding: "5px 14px", borderRadius: 999, fontSize: 11, fontWeight: 700,
        cursor: "pointer", border: "none",
        backgroundColor: tab === t ? "#7c3aed" : "#ede9fe",
        color: tab === t ? "#fff" : "#7c3aed",
    });

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
                    <div style={{ width:28, height:28, borderRadius:8, backgroundColor:"#ddd6fe", display:"flex", alignItems:"center", justifyContent:"center", fontSize:14 }}>📊</div>
                    <div>
                        <p style={{ fontSize:11, fontWeight:700, color:"#3730a3", margin:0 }}>Voice Volume Guide</p>
                        <p style={{ fontSize:9, color:"#7c3aed", margin:"2px 0 0" }}>
                            {status === "loading" ? "⏳ Detecting words..."
                             : status === "ready"  ? `🔴 Live · ${words.length} words detected · ${language || ""}`
                             :                       language || ""}
                        </p>
                    </div>
                </div>
                <div style={{ display:"flex", gap:6 }}>
                    <button style={tabBtn("guide")} onClick={() => setTab("guide")}>📋 Word guide</button>
                    <button style={tabBtn("wave")}  onClick={() => setTab("wave")}>〰 Waveform</button>
                </div>
            </div>

            {/* ── WORD GUIDE TAB ── */}
            {tab === "guide" && (
                <div style={{ padding:"14px 18px" }}>

                    {/* Now playing banner */}
                    {nowVol && nowWord && (
                        <motion.div
                            key={nowWord.t}
                            initial={{ opacity: 0, scale: 0.97 }}
                            animate={{ opacity: 1, scale: 1 }}
                            style={{ padding:"10px 14px", borderRadius:12, backgroundColor: nowVol.bg, border:`2px solid ${nowVol.border}`, marginBottom:14, display:"flex", alignItems:"center", gap:12, flexWrap:"wrap" }}
                        >
                            <p style={{ fontSize:10, fontWeight:700, color: nowVol.color, textTransform:"uppercase", margin:0 }}>Now →</p>
                            <p style={{ fontSize:20, fontWeight:800, color:"#111827", margin:0 }}>{nowWord.label}</p>
                            <p style={{ fontSize:18, fontWeight:800, color: nowVol.color, margin:0 }}>{nowVol.label}</p>
                            <p style={{ fontSize:11, color:"#374151", margin:0 }}>{nowVol.tip}</p>
                            <div style={{ flex:1, minWidth:80, height:8, background:"#e5e7eb", borderRadius:999, overflow:"hidden" }}>
                                <motion.div
                                    style={{ height:"100%", borderRadius:999, backgroundColor: nowVol.color }}
                                    animate={{ width: nowVol.pct + "%" }}
                                    transition={{ duration: 0.15 }}
                                />
                            </div>
                            <span style={{ fontSize:13, fontWeight:700, color: nowVol.color }}>{nowVol.pct}%</span>
                        </motion.div>
                    )}

                    {/* Word cards — scrollable row */}
                    {status === "ready" && words.length > 0 && (
                        <div>
                            <p style={{ fontSize:10, fontWeight:700, color:"#6b7280", textTransform:"uppercase", letterSpacing:"0.08em", margin:"0 0 10px" }}>
                                Volume for each word
                            </p>
                            <div style={{ display:"flex", gap:8, overflowX:"auto", paddingBottom:6 }}>
                                {words.map((w, i) => {
                                    const lv       = getVolLevel(w.amp);
                                    const isActive = currentTime >= w.t && currentTime < w.t + w.dur;
                                    return (
                                        <div key={i} style={{
                                            borderRadius:10,
                                            padding:"10px 12px",
                                            backgroundColor: lv.bg,
                                            border: `${isActive ? 2.5 : 1.5}px solid ${lv.border}`,
                                            minWidth:90,
                                            flexShrink: 0,
                                            transform: isActive ? "scale(1.08)" : "scale(1)",
                                            transition: "all 0.2s",
                                            boxShadow: isActive ? `0 4px 16px ${lv.color}44` : "none",
                                        }}>
                                            <p style={{ fontSize:15, fontWeight:700, color:"#1f2937", margin:"0 0 4px", whiteSpace:"nowrap" }}>
                                                {w.label}
                                            </p>
                                            <p style={{ fontSize:12, fontWeight:800, color: lv.color, margin:"0 0 6px" }}>
                                                {lv.label}
                                            </p>
                                            <div style={{ height:5, background:"#e5e7eb", borderRadius:999, overflow:"hidden", marginBottom:4 }}>
                                                <div style={{ height:"100%", width: lv.pct+"%", background: lv.color, borderRadius:999 }} />
                                            </div>
                                            <p style={{ fontSize:9, color:"#6b7280", margin:0 }}>{lv.pct}% volume</p>
                                        </div>
                                    );
                                })}
                            </div>
                        </div>
                    )}

                    {status === "loading" && (
                        <div style={{ padding:"20px 0", textAlign:"center", color:"#7c3aed", fontSize:12 }}>
                            ⏳ Detecting words from audio...
                        </div>
                    )}

                    {/* Legend */}
                    <div style={{ display:"flex", gap:8, flexWrap:"wrap", marginTop:14 }}>
                        {[
                            { bg:"#fef3c7", color:"#92400e", label:"🔊 LOUD — full voice" },
                            { bg:"#dbeafe", color:"#1e40af", label:"🔉 MEDIUM — normal" },
                            { bg:"#f3f4f6", color:"#374151", label:"🔈 SOFT — quiet" },
                        ].map((l, i) => (
                            <span key={i} style={{ display:"inline-flex", alignItems:"center", gap:5, padding:"4px 10px", borderRadius:999, fontSize:10, fontWeight:600, backgroundColor:l.bg, color:l.color }}>
                                {l.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* ── WAVEFORM TAB ── */}
            {tab === "wave" && (
                <div style={{ padding:"12px 18px" }}>
                    <p style={{ fontSize:9, fontWeight:700, color:"#7c3aed", textTransform:"uppercase", letterSpacing:"0.1em", margin:"0 0 8px" }}>
                        Tall wave = loud · Flat = soft · Each color = one word
                    </p>
                    <canvas ref={waveRef} width={560} height={130}
                        style={{ width:"100%", height:130, display:"block", borderRadius:8 }} />
                    <div style={{ display:"flex", justifyContent:"space-between", margin:"5px 0 10px" }}>
                        <span style={{ fontSize:10, color:"#a78bfa" }}>← Earlier</span>
                        <span style={{ fontSize:10, color:"#ef4444", fontWeight:700 }}>▼ Now</span>
                        <span style={{ fontSize:10, color:"#a78bfa" }}>Later →</span>
                    </div>
                </div>
            )}

            {/* Footer */}
            <div style={{ margin:"0 18px 14px", padding:"10px 14px", borderRadius:10, backgroundColor:"#ede9fe", border:"1px solid #c4b5fd" }}>
                <p style={{ fontSize:10, color:"#4c1d95", lineHeight:1.7, margin:0 }}>
                    <strong>Speaking guide:</strong> Each card shows one word and how loud it was spoken. LOUD = speak strongly, MEDIUM = normal voice, SOFT = lower your voice. The active card glows as the audio plays.
                </p>
            </div>
        </motion.div>
    );
}