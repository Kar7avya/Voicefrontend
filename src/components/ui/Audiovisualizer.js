import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

function fftMags(signal) {
    const N  = signal.length;
    const re = new Float32Array(N);
    const im = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        re[i] = signal[i] * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    }
    for (let i = 1, j = 0; i < N; i++) {
        let bit = N >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
            [re[i], re[j]] = [re[j], re[i]];
            [im[i], im[j]] = [im[j], im[i]];
        }
    }
    for (let len = 2; len <= N; len <<= 1) {
        const ang = (-2 * Math.PI) / len;
        const wR = Math.cos(ang), wI = Math.sin(ang);
        for (let i = 0; i < N; i += len) {
            let cR = 1, cI = 0;
            for (let j = 0; j < len / 2; j++) {
                const uR = re[i+j], uI = im[i+j];
                const vR = re[i+j+len/2]*cR - im[i+j+len/2]*cI;
                const vI = re[i+j+len/2]*cI + im[i+j+len/2]*cR;
                re[i+j] = uR+vR; im[i+j] = uI+vI;
                re[i+j+len/2] = uR-vR; im[i+j+len/2] = uI-vI;
                [cR, cI] = [cR*wR - cI*wI, cR*wI + cI*wR];
            }
        }
    }
    const mags = new Float32Array(N / 2);
    let mx = 0;
    for (let i = 0; i < N / 2; i++) {
        mags[i] = Math.sqrt(re[i]*re[i] + im[i]*im[i]) / N;
        if (mags[i] > mx) mx = mags[i];
    }
    if (mx > 0) for (let i = 0; i < N / 2; i++) mags[i] /= mx;
    return mags;
}

const WINDOW_SEC = 1.0;
const FFT_SIZE   = 512;
const NUM_BARS   = 48;

export default function AudioVisualizer({
    audioURL, audioFeatures, isPlaying, currentTime, duration, language
}) {
    const waveRef  = useRef(null);
    const fftRef   = useRef(null);
    const wAnimRef = useRef(null);
    const fAnimRef = useRef(null);
    const pcmRef   = useRef(null);
    const srRef    = useRef(22050);
    const [status, setStatus] = useState("idle");
    const [tab,    setTab]    = useState("waveform");

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

            ctx.fillStyle = "#f3f0ff";
            ctx.fillRect(0, 0, W, H);

            // Grid lines
            ctx.strokeStyle = "rgba(124,58,237,0.12)";
            ctx.lineWidth   = 0.5;
            for (let g = -4; g <= 4; g++) {
                if (g === 0) continue;
                const y = mid - (g / 5) * (mid - 8);
                ctx.beginPath(); ctx.moveTo(0, y); ctx.lineTo(W, y); ctx.stroke();
            }

            // Zero line
            ctx.strokeStyle = "rgba(124,58,237,0.35)";
            ctx.lineWidth   = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath(); ctx.moveTo(0, mid); ctx.lineTo(W, mid); ctx.stroke();
            ctx.setLineDash([]);

            const pcm = pcmRef.current;
            const sr  = srRef.current;

            if (pcm && status === "ready" && duration > 0) {
                const half  = WINDOW_SEC / 2;
                const startT = Math.max(0, currentTime - half);
                const endT   = Math.min(duration, currentTime + half);
                const s0     = Math.floor(startT * sr);
                const sN     = Math.floor(endT * sr);
                const range  = Math.max(1, sN - s0);
                const total  = pcm.length;

                // Find local max for normalization
                let maxAmp = 0.001;
                const step = Math.max(1, Math.floor(range / W));
                for (let i = s0; i < sN; i += step) {
                    if (Math.abs(pcm[Math.min(i, total-1)]) > maxAmp)
                        maxAmp = Math.abs(pcm[Math.min(i, total-1)]);
                }
                maxAmp = Math.max(maxAmp, 0.01);

                // Positive fill
                ctx.fillStyle = "rgba(109,40,217,0.18)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const s   = s0 + Math.floor((x / W) * range);
                    const val = pcm[Math.min(s, total-1)] / maxAmp;
                    ctx.lineTo(x, mid - Math.max(0, val) * (mid - 6));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                // Negative fill
                ctx.fillStyle = "rgba(217,70,239,0.12)";
                ctx.beginPath(); ctx.moveTo(0, mid);
                for (let x = 0; x < W; x++) {
                    const s   = s0 + Math.floor((x / W) * range);
                    const val = pcm[Math.min(s, total-1)] / maxAmp;
                    ctx.lineTo(x, mid - Math.min(0, val) * (mid - 6));
                }
                ctx.lineTo(W, mid); ctx.closePath(); ctx.fill();

                // Waveform line
                ctx.strokeStyle = "#7c3aed";
                ctx.lineWidth   = 1.8;
                ctx.beginPath();
                for (let x = 0; x < W; x++) {
                    const s   = s0 + Math.floor((x / W) * range);
                    const val = pcm[Math.min(s, total-1)] / maxAmp;
                    const y   = mid - val * (mid - 6);
                    x === 0 ? ctx.moveTo(x, y) : ctx.lineTo(x, y);
                }
                ctx.stroke();

                // Playhead
                const px = W / 2;
                ctx.strokeStyle = "#ef4444";
                ctx.lineWidth   = 2;
                ctx.beginPath(); ctx.moveTo(px, 2); ctx.lineTo(px, H - 2); ctx.stroke();

                // Dot on waveform at playhead
                const curSamp = Math.floor(currentTime * sr);
                const curVal  = (pcm[Math.min(curSamp, total-1)] / maxAmp);
                const curY    = mid - curVal * (mid - 6);
                ctx.fillStyle = "#ef4444";
                ctx.beginPath(); ctx.arc(px, curY, 4, 0, Math.PI * 2); ctx.fill();

                // Stats
                const win    = pcm.slice(Math.max(0, curSamp - 200), curSamp + 200);
                const rms    = Math.sqrt(win.reduce((a, v) => a + v*v, 0) / (win.length || 1));
                document.getElementById("av-amp")  && (document.getElementById("av-amp").textContent  = curVal.toFixed(3));
                document.getElementById("av-rms")  && (document.getElementById("av-rms").textContent  = rms.toFixed(3));
            }

            // Y-axis labels
            ctx.fillStyle = "rgba(124,58,237,0.6)";
            ctx.font      = "9px monospace";
            ctx.textAlign = "left";
            ctx.fillText("+1", 3, 12);
            ctx.fillText(" 0", 3, mid + 4);
            ctx.fillText("-1", 3, H - 4);

            wAnimRef.current = requestAnimationFrame(draw);
        };

        wAnimRef.current = requestAnimationFrame(draw);
        return () => { if (wAnimRef.current) cancelAnimationFrame(wAnimRef.current); };
    }, [status, currentTime, duration, tab]);

    // ── FFT spectrum draw ─────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = fftRef.current;
        if (!canvas || tab !== "spectrum") return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "#f3f0ff";
            ctx.fillRect(0, 0, W, H);

            const pcm = pcmRef.current;
            const sr  = srRef.current;
            let   mags = null;

            if (pcm && status === "ready") {
                const s0    = Math.max(0, Math.floor(currentTime * sr) - FFT_SIZE / 2);
                const slice = new Float32Array(FFT_SIZE);
                for (let i = 0; i < FFT_SIZE; i++) slice[i] = pcm[Math.min(s0 + i, pcm.length - 1)];
                mags = fftMags(slice);
            } else if (audioFeatures?.mel) {
                const mel    = audioFeatures.mel.slice(0, NUM_BARS);
                const melMin = Math.min(...mel);
                const melMax = Math.max(...mel) || 1;
                mags = { length: NUM_BARS };
                mags = mel.map(v => Math.max(0.03, (v - melMin) / (melMax - melMin)));
            }

            if (mags) {
                const isArray = Array.isArray(mags);
                const len     = isArray ? mags.length : Math.min(mags.length, NUM_BARS * 4);
                const step    = isArray ? 1 : Math.floor(len / NUM_BARS);
                const barW    = W / NUM_BARS;

                for (let b = 0; b < NUM_BARS; b++) {
                    let val;
                    if (isArray) {
                        val = mags[Math.floor((b / NUM_BARS) * mags.length)];
                    } else {
                        let sum = 0;
                        for (let j = 0; j < step; j++) sum += mags[b * step + j] || 0;
                        val = sum / step;
                    }
                    const barH = Math.max(3, val * (H - 4));
                    const t    = b / NUM_BARS;
                    const r    = Math.round(110 + t * 145);
                    const g    = Math.round(40  + t * 20);
                    const bv   = Math.round(210 - t * 50);
                    ctx.fillStyle = `rgb(${r},${g},${bv})`;
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(b * barW + 1, H - barH, barW - 2, barH, 2);
                    else               ctx.rect(b * barW + 1, H - barH, barW - 2, barH);
                    ctx.fill();
                }
            }

            fAnimRef.current = requestAnimationFrame(draw);
        };

        fAnimRef.current = requestAnimationFrame(draw);
        return () => { if (fAnimRef.current) cancelAnimationFrame(fAnimRef.current); };
    }, [status, currentTime, duration, audioFeatures, tab]);

    if (!audioFeatures && !audioURL) return null;

    const { rms = 0, zcr = 0, rolloff = 0 } = audioFeatures || {};
    const loudness  = rms > 0.05 ? "High"    : rms > 0.02 ? "Medium" : "Low";
    const loudColor = rms > 0.05 ? "#15803d" : rms > 0.02 ? "#b45309" : "#1d4ed8";
    const zcrLabel  = zcr > 0.1  ? "Fast"    : zcr > 0.05 ? "Medium" : "Slow";

    const tabBtn = (t, label) => ({
        padding: "4px 12px", borderRadius: 999, fontSize: 10, fontWeight: 700,
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
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#3730a3", margin: 0 }}>Audio Analysis</p>
                        <p style={{ fontSize: 9, color: "#7c3aed", margin: "2px 0 0" }}>
                            {status === "loading" ? "⏳ Decoding audio..."
                             : status === "ready"  ? `🔴 Live · synced · ${language || ""}`
                             :                       `CNN-LSTM features · ${language || ""}`}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    <button style={tabBtn("waveform")} onClick={() => setTab("waveform")}>〰 Waveform</button>
                    <button style={tabBtn("spectrum")} onClick={() => setTab("spectrum")}>▦ Spectrum</button>
                </div>
            </div>

            {/* Waveform */}
            {tab === "waveform" && (
                <div style={{ padding: "12px 18px 4px" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                        Raw PCM waveform — above zero = positive pressure · below = negative
                    </p>
                    <canvas ref={waveRef} width={560} height={110} style={{ width: "100%", height: 110, display: "block", borderRadius: 6 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 10 }}>
                        <span style={{ fontSize: 8, color: "#a78bfa" }}>← 0.5s before</span>
                        <span style={{ fontSize: 8, color: "#ef4444", fontWeight: 700 }}>▼ now</span>
                        <span style={{ fontSize: 8, color: "#a78bfa" }}>0.5s after →</span>
                    </div>
                </div>
            )}

            {/* Spectrum */}
            {tab === "spectrum" && (
                <div style={{ padding: "12px 18px 4px" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", margin: "0 0 6px" }}>
                        Frequency spectrum — synced to playback position
                    </p>
                    <canvas ref={fftRef} width={560} height={110} style={{ width: "100%", height: 110, display: "block", borderRadius: 6 }} />
                    <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 10 }}>
                        <span style={{ fontSize: 8, color: "#a78bfa" }}>Low freq</span>
                        <span style={{ fontSize: 8, color: "#a78bfa" }}>Mid freq</span>
                        <span style={{ fontSize: 8, color: "#a78bfa" }}>High freq</span>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr 1fr", margin: "0 18px 14px", borderRadius: 12, overflow: "hidden", border: "1px solid #e0d7f5" }}>
                {[
                    { label: "Loudness",  id: null,     val: loudness,                    color: loudColor },
                    { label: "Amplitude", id: "av-amp", val: "—",                         color: "#7c3aed" },
                    { label: "Wave RMS",  id: "av-rms", val: rms.toFixed(3),              color: "#6d28d9" },
                    { label: "Freq ceil", id: null,     val: (rolloff/1000).toFixed(1)+"k",color: "#1d4ed8" },
                ].map((s, i) => (
                    <div key={i} style={{ padding: "8px", textAlign: "center", backgroundColor: "#faf5ff", borderRight: i < 3 ? "1px solid #e0d7f5" : "none" }}>
                        <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", margin: "0 0 3px" }}>{s.label}</p>
                        <p id={s.id || undefined} style={{ fontSize: 13, fontWeight: 800, color: s.color, margin: 0 }}>{s.val}</p>
                    </div>
                ))}
            </div>

            {/* Footer */}
            <div style={{ margin: "0 18px 14px", padding: "10px 12px", borderRadius: 10, backgroundColor: "#ede9fe", border: "1px solid #c4b5fd", display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11 }}>🧠</span>
                <p style={{ fontSize: 9, color: "#4c1d95", lineHeight: 1.6, margin: 0 }}>
                    {tab === "waveform"
                        ? "Raw PCM audio signal decoded from TTS output. Purple = positive pressure, pink = negative. Red dot tracks exact playback position. Each speech burst = one syllable/word."
                        : "FFT computed from PCM window centered on current playback time. Cooley-Tukey algorithm with Hann window."}
                </p>
            </div>
        </motion.div>
    );
}