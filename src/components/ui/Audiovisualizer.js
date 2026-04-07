import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function fftMags(signal) {
    const N = signal.length;
    const re = new Float32Array(N);
    const im = new Float32Array(N);
    for (let i = 0; i < N; i++)
        re[i] = signal[i] * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    for (let i = 1, j = 0; i < N; i++) {
        let bit = N >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { [re[i],re[j]]=[re[j],re[i]]; [im[i],im[j]]=[im[j],im[i]]; }
    }
    for (let len = 2; len <= N; len <<= 1) {
        const ang = (-2*Math.PI)/len;
        const wR = Math.cos(ang), wI = Math.sin(ang);
        for (let i = 0; i < N; i += len) {
            let cR = 1, cI = 0;
            for (let j = 0; j < len/2; j++) {
                const uR=re[i+j],uI=im[i+j];
                const vR=re[i+j+len/2]*cR-im[i+j+len/2]*cI;
                const vI=re[i+j+len/2]*cI+im[i+j+len/2]*cR;
                re[i+j]=uR+vR; im[i+j]=uI+vI;
                re[i+j+len/2]=uR-vR; im[i+j+len/2]=uI-vI;
                [cR,cI]=[cR*wR-cI*wI,cR*wI+cI*wR];
            }
        }
    }
    const mags = new Float32Array(N/2);
    let mx = 0;
    for (let i = 0; i < N/2; i++) { mags[i]=Math.sqrt(re[i]*re[i]+im[i]*im[i])/N; if(mags[i]>mx) mx=mags[i]; }
    if (mx > 0) for (let i = 0; i < N/2; i++) mags[i] /= mx;
    return mags;
}

const WIN_SEC = 1.2;
const FFT_N   = 512;
const N_BARS  = 48;

export default function AudioVisualizer({
    audioURL, audioFeatures, isPlaying, currentTime, duration, language
}) {
    const waveRef  = useRef(null);
    const fftRef   = useRef(null);
    const wAnimRef = useRef(null);
    const fAnimRef = useRef(null);
    const pcmRef   = useRef(null);
    const srRef    = useRef(22050);

    const [status,  setStatus]  = useState("idle");
    const [tab,     setTab]     = useState("waveform");
    const [volLabel, setVol]    = useState("—");
    const [waveH,   setWaveH]   = useState("—");

    // ── Decode audio ──────────────────────────────────────────────────────────
    useEffect(() => {
        if (!audioURL) return;
        pcmRef.current = null;
        setStatus("loading");
        const run = async () => {
            try {
                const res     = await fetch(audioURL);
                if (!res.ok) throw new Error("fetch failed");
                const buf     = await res.arrayBuffer();
                const tmpCtx  = new (window.AudioContext || window.webkitAudioContext)();
                const decoded = await tmpCtx.decodeAudioData(buf);
                await tmpCtx.close();
                srRef.current  = decoded.sampleRate;
                pcmRef.current = decoded.getChannelData(0);
                setStatus("ready");
            } catch (e) {
                console.warn("AudioVisualizer:", e.message);
                setStatus("error");
            }
        };
        run();
    }, [audioURL]);

    // ── Waveform draw ─────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = waveRef.current;
        if (!canvas || tab !== "waveform") return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            const mid = H / 2;
            ctx.clearRect(0, 0, W, H);

            // Background
            ctx.fillStyle = "#faf5ff";
            ctx.fillRect(0, 0, W, H);

            // Horizontal zone labels — background bands
            ctx.fillStyle = "rgba(109,40,217,0.04)";
            ctx.fillRect(0, 0, W, mid - 10);
            ctx.fillStyle = "rgba(236,72,153,0.04)";
            ctx.fillRect(0, mid + 10, W, mid - 10);

            // Center line
            ctx.strokeStyle = "rgba(124,58,237,0.25)";
            ctx.lineWidth   = 1.5;
            ctx.setLineDash([5, 5]);
            ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
            ctx.setLineDash([]);

            const pcm = pcmRef.current;
            const sr  = srRef.current;

            if (pcm && status === "ready" && duration > 0) {
                const half   = WIN_SEC / 2;
                const startT = Math.max(0, currentTime - half);
                const endT   = Math.min(duration, currentTime + half);
                const s0     = Math.floor(startT * sr);
                const sN     = Math.floor(endT * sr);
                const range  = Math.max(1, sN - s0);
                const total  = pcm.length;

                let mx = 0.01;
                for (let i = s0; i < sN; i += 4)
                    if (Math.abs(pcm[Math.min(i, total-1)]) > mx)
                        mx = Math.abs(pcm[Math.min(i, total-1)]);
                mx = Math.max(mx, 0.01);

                // Purple fill — above center
                ctx.fillStyle = "rgba(109,40,217,0.18)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const s = s0 + Math.floor((x/W)*range);
                    const v = pcm[Math.min(s, total-1)] / mx;
                    ctx.lineTo(x, mid - Math.max(0, v) * (mid - 14));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                // Pink fill — below center
                ctx.fillStyle = "rgba(236,72,153,0.12)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const s = s0 + Math.floor((x/W)*range);
                    const v = pcm[Math.min(s, total-1)] / mx;
                    ctx.lineTo(x, mid - Math.min(0, v) * (mid - 14));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                // Wave line
                ctx.strokeStyle = "#7c3aed";
                ctx.lineWidth   = 2;
                ctx.beginPath();
                for (let x = 0; x < W; x++) {
                    const s = s0 + Math.floor((x/W)*range);
                    const v = pcm[Math.min(s, total-1)] / mx;
                    const y = mid - v * (mid - 14);
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Playhead
                const px = W / 2;
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth   = 2.5;
                ctx.beginPath(); ctx.moveTo(px, 2); ctx.lineTo(px, H - 2); ctx.stroke();

                // Red dot on wave
                const cs  = Math.floor(currentTime * sr);
                const cv  = pcm[Math.min(cs, total-1)] / mx;
                const cy  = mid - cv * (mid - 14);
                ctx.fillStyle   = "#ef4444";
                ctx.beginPath(); ctx.arc(px, cy, 5, 0, Math.PI*2); ctx.fill();
                ctx.strokeStyle = "#fff";
                ctx.lineWidth   = 1.5;
                ctx.beginPath(); ctx.arc(px, cy, 5, 0, Math.PI*2); ctx.stroke();

                // Update stats
                const vol = Math.abs(cv);
                setVol(vol > 0.65 ? "🔊 Loud" : vol > 0.3 ? "🔉 Medium" : "🔈 Soft");
                setWaveH(vol > 0.65 ? "Very tall" : vol > 0.3 ? "Medium" : "Flat / pause");
            }

            // Plain English axis labels
            ctx.font      = "bold 10px sans-serif";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(109,40,217,0.7)";
            ctx.fillText("LOUD ↑", 5, 16);
            ctx.fillStyle = "rgba(109,40,217,0.4)";
            ctx.fillText("center —", 5, mid + 4);
            ctx.fillStyle = "rgba(236,72,153,0.6)";
            ctx.fillText("loud ↓", 5, H - 5);

            wAnimRef.current = requestAnimationFrame(draw);
        };

        wAnimRef.current = requestAnimationFrame(draw);
        return () => { if (wAnimRef.current) cancelAnimationFrame(wAnimRef.current); };
    }, [status, currentTime, duration, tab]);

    // ── Spectrum draw ─────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = fftRef.current;
        if (!canvas || tab !== "spectrum") return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "#faf5ff";
            ctx.fillRect(0, 0, W, H);

            const pcm = pcmRef.current;
            const sr  = srRef.current;
            let   bars = null;

            if (pcm && status === "ready") {
                const s0    = Math.max(0, Math.floor(currentTime * sr) - FFT_N/2);
                const slice = new Float32Array(FFT_N);
                for (let i = 0; i < FFT_N; i++) slice[i] = pcm[Math.min(s0+i, pcm.length-1)];
                const mags = fftMags(slice);
                const step = Math.floor(mags.length / N_BARS);
                bars = new Array(N_BARS).fill(0).map((_, b) => {
                    let s = 0;
                    for (let j = 0; j < step; j++) s += mags[b*step+j] || 0;
                    return s / step;
                });
            } else if (audioFeatures?.mel) {
                const mel    = audioFeatures.mel.slice(0, N_BARS);
                const melMin = Math.min(...mel);
                const melMax = Math.max(...mel) || 1;
                bars = mel.map(v => Math.max(0.03, (v-melMin)/(melMax-melMin)));
            }

            if (bars) {
                const barW = W / bars.length;
                for (let i = 0; i < bars.length; i++) {
                    const barH = Math.max(3, bars[i] * (H - 8));
                    const t    = i / bars.length;
                    const r    = Math.round(110 + t*145);
                    const g    = Math.round(40  + t*20);
                    const b    = Math.round(210 - t*50);
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(i*barW+1, H-barH, barW-2, barH, 2);
                    else ctx.rect(i*barW+1, H-barH, barW-2, barH);
                    ctx.fill();
                }
            }

            // Labels
            ctx.font      = "bold 10px sans-serif";
            ctx.textAlign = "left";
            ctx.fillStyle = "rgba(109,40,217,0.6)";
            ctx.fillText("Deep sounds", 4, H-4);
            ctx.textAlign = "right";
            ctx.fillText("High-pitched sounds", W-4, H-4);

            fAnimRef.current = requestAnimationFrame(draw);
        };

        fAnimRef.current = requestAnimationFrame(draw);
        return () => { if (fAnimRef.current) cancelAnimationFrame(fAnimRef.current); };
    }, [status, currentTime, duration, audioFeatures, tab]);

    if (!audioFeatures && !audioURL) return null;

    const { rms = 0 } = audioFeatures || {};
    const loudness  = rms > 0.05 ? "Loud"   : rms > 0.02 ? "Medium" : "Soft";
    const loudColor = rms > 0.05 ? "#15803d": rms > 0.02 ? "#b45309": "#1d4ed8";

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
            <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", padding: "10px 18px", borderBottom: "1px solid #e0d7f5", backgroundColor: "#ede9fe" }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#ddd6fe", display: "flex", alignItems: "center", justifyContent: "center", fontSize: 14 }}>📊</div>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#3730a3", margin: 0 }}>Voice Analysis</p>
                        <p style={{ fontSize: 9, color: "#7c3aed", margin: "2px 0 0" }}>
                            {status === "loading" ? "⏳ Reading the audio..."
                             : status === "ready"  ? `🔴 Live · moves with voice · ${language || ""}`
                             :                       `Based on AI model · ${language || ""}`}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    <button style={tabBtn("waveform")} onClick={() => setTab("waveform")}>〰 Voice wave</button>
                    <button style={tabBtn("spectrum")} onClick={() => setTab("spectrum")}>▦ Frequencies</button>
                </div>
            </div>

            {/* Waveform */}
            {tab === "waveform" && (
                <div style={{ padding: "12px 18px 0" }}>
                    <canvas ref={waveRef} width={560} height={130} style={{ width: "100%", height: 130, display: "block", borderRadius: 8 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", margin: "5px 0 10px", padding: "0 2px" }}>
                        <span style={{ fontSize: 10, color: "#a78bfa" }}>← Earlier in the speech</span>
                        <span style={{ fontSize: 10, color: "#ef4444", fontWeight: 700 }}>▼ Playing now</span>
                        <span style={{ fontSize: 10, color: "#a78bfa" }}>Later in the speech →</span>
                    </div>

                    {/* Legend — plain English */}
                    <div style={{ display: "flex", gap: 8, flexWrap: "wrap", marginBottom: 12 }}>
                        {[
                            { color: "#ede9fe", text: "#5b21b6", label: "🔵 Big wave = loud word" },
                            { color: "#fce7f3", text: "#9d174d", label: "🔴 Tiny wave = soft / quiet" },
                            { color: "#f0fdf4", text: "#166534", label: "🟢 Flat line = silence / pause" },
                        ].map((l, i) => (
                            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 500, backgroundColor: l.color, color: l.text }}>
                                {l.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Spectrum */}
            {tab === "spectrum" && (
                <div style={{ padding: "12px 18px 0" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                        Which sound frequencies are active right now
                    </p>
                    <canvas ref={fftRef} width={560} height={130} style={{ width: "100%", height: 130, display: "block", borderRadius: 8 }} />
                    <div style={{ display: "flex", flexWrap: "wrap", gap: 8, margin: "8px 0 12px" }}>
                        {[
                            { color: "#ede9fe", text: "#5b21b6", label: "Tall bar = strong frequency present" },
                            { color: "#f0fdf4", text: "#166534", label: "Short bar = weak or absent" },
                        ].map((l, i) => (
                            <span key={i} style={{ display: "inline-flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, fontSize: 10, fontWeight: 500, backgroundColor: l.color, color: l.text }}>
                                {l.label}
                            </span>
                        ))}
                    </div>
                </div>
            )}

            {/* Stats — plain English */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", gap: 0, margin: "0 18px 14px", borderRadius: 12, overflow: "hidden", border: "1px solid #e0d7f5" }}>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", margin: "0 0 4px" }}>Overall volume</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: loudColor, margin: 0 }}>{loudness}</p>
                </div>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff", borderLeft: "1px solid #e0d7f5", borderRight: "1px solid #e0d7f5" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", margin: "0 0 4px" }}>Right now</p>
                    <p id="av-vol" style={{ fontSize: 14, fontWeight: 800, color: "#6d28d9", margin: 0 }}>{volLabel}</p>
                </div>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", margin: "0 0 4px" }}>Wave size</p>
                    <p id="av-wh" style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8", margin: 0 }}>{waveH}</p>
                </div>
            </div>

            {/* Plain English explanation */}
            <div style={{ margin: "0 18px 14px", padding: "10px 14px", borderRadius: 10, backgroundColor: "#ede9fe", border: "1px solid #c4b5fd" }}>
                <p style={{ fontSize: 10, color: "#4c1d95", lineHeight: 1.7, margin: 0 }}>
                    <strong>How to read this:</strong> Each wave shows the voice. When a word is spoken loudly, the wave goes very high and low. Soft words stay close to the center line. Silence shows a flat line. The red line shows exactly where in the sentence we are right now.
                </p>
            </div>
        </motion.div>
    );
}