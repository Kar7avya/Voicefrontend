import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ── Cooley-Tukey radix-2 FFT ──────────────────────────────────────────────────
function fftMags(signal) {
    const N  = signal.length;
    const re = new Float32Array(N);
    const im = new Float32Array(N);
    // Hann window + copy
    for (let i = 0; i < N; i++) {
        re[i] = signal[i] * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    }
    // Bit-reversal
    for (let i = 1, j = 0; i < N; i++) {
        let bit = N >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) { [re[i], re[j]] = [re[j], re[i]]; [im[i], im[j]] = [im[j], im[i]]; }
    }
    // Butterfly
    for (let len = 2; len <= N; len <<= 1) {
        const ang = (-2 * Math.PI) / len;
        const wRe = Math.cos(ang), wIm = Math.sin(ang);
        for (let i = 0; i < N; i += len) {
            let cRe = 1, cIm = 0;
            for (let j = 0; j < len / 2; j++) {
                const uR = re[i+j], uI = im[i+j];
                const vR = re[i+j+len/2]*cRe - im[i+j+len/2]*cIm;
                const vI = re[i+j+len/2]*cIm + im[i+j+len/2]*cRe;
                re[i+j] = uR+vR; im[i+j] = uI+vI;
                re[i+j+len/2] = uR-vR; im[i+j+len/2] = uI-vI;
                [cRe, cIm] = [cRe*wRe - cIm*wIm, cRe*wIm + cIm*wRe];
            }
        }
    }
    const mags = new Float32Array(N/2);
    for (let i = 0; i < N/2; i++) mags[i] = Math.sqrt(re[i]*re[i] + im[i]*im[i]) / N;
    return mags;
}

const WAVEFORM_POINTS = 600; // resolution of waveform line
const FFT_SIZE        = 1024;
const NUM_BARS        = 48;

export default function AudioVisualizer({
    audioURL, audioFeatures, isPlaying, currentTime, duration, language
}) {
    const waveCanvasRef = useRef(null); // waveform line graph
    const fftCanvasRef  = useRef(null); // frequency bars
    const waveAnimRef   = useRef(null);
    const fftAnimRef    = useRef(null);

    // Pre-computed data
    const pcmRef      = useRef(null);   // full raw PCM array
    const fftFrames   = useRef([]);     // FFT frames
    const srRef       = useRef(22050);

    const [status,   setStatus]   = useState("idle");
    const [tab,      setTab]      = useState("waveform"); // "waveform" | "spectrum"

    // ── Decode audio once ─────────────────────────────────────────────────────
    useEffect(() => {
        if (!audioURL) return;
        pcmRef.current    = null;
        fftFrames.current = [];
        setStatus("loading");

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

                // Pre-compute FFT frames at 60fps
                const hopSize = Math.floor(sr / 60);
                const frames  = [];
                for (let s = 0; s + FFT_SIZE <= pcm.length; s += hopSize) {
                    const slice = pcm.slice(s, s + FFT_SIZE);
                    const mags  = fftMags(slice);
                    // Group into NUM_BARS log-scale
                    const bars  = new Float32Array(NUM_BARS);
                    const step  = Math.floor(mags.length / NUM_BARS);
                    let   mx    = 0;
                    for (let b = 0; b < NUM_BARS; b++) {
                        let sum = 0;
                        for (let j = 0; j < step; j++) sum += mags[b*step+j];
                        bars[b] = sum / step;
                        if (bars[b] > mx) mx = bars[b];
                    }
                    if (mx > 0) for (let b = 0; b < NUM_BARS; b++) bars[b] /= mx;
                    frames.push(bars);
                }
                fftFrames.current = frames;
                setStatus("ready");
            } catch (e) {
                console.warn("AudioVisualizer error:", e.message);
                setStatus("error");
            }
        };
        run();
    }, [audioURL]);

    // ── WAVEFORM draw loop ────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = waveCanvasRef.current;
        if (!canvas) return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            const mid = H / 2;
            ctx.clearRect(0, 0, W, H);

            // Background
            ctx.fillStyle = "#f3f0ff";
            ctx.fillRect(0, 0, W, H);

            // Zero line
            ctx.strokeStyle = "#c4b5fd";
            ctx.lineWidth   = 1;
            ctx.setLineDash([4, 4]);
            ctx.beginPath();
            ctx.moveTo(0, mid);
            ctx.lineTo(W, mid);
            ctx.stroke();
            ctx.setLineDash([]);

            const pcm = pcmRef.current;

            if (pcm && status === "ready" && duration > 0) {
                const sr         = srRef.current;
                const totalSamp  = pcm.length;
                const windowSec  = Math.min(duration, 2.0); // show 2 seconds window
                const halfWin    = windowSec / 2;

                // Center the window on current playback time
                const centerTime = currentTime;
                const startTime  = Math.max(0, centerTime - halfWin);
                const endTime    = Math.min(duration, centerTime + halfWin);
                const startSamp  = Math.floor(startTime * sr);
                const endSamp    = Math.min(Math.floor(endTime * sr), totalSamp - 1);
                const sampWindow = endSamp - startSamp;

                if (sampWindow > 0) {
                    // Find max amplitude for normalization
                    let maxAmp = 0.001;
                    for (let i = startSamp; i < endSamp; i++) {
                        if (Math.abs(pcm[i]) > maxAmp) maxAmp = Math.abs(pcm[i]);
                    }

                    // Draw filled waveform (above = purple, below = pink)
                    const step = sampWindow / W;

                    // Fill above origin (positive)
                    ctx.beginPath();
                    ctx.moveTo(0, mid);
                    for (let x = 0; x < W; x++) {
                        const s   = startSamp + Math.floor(x * step);
                        const val = (pcm[Math.min(s, totalSamp-1)] / maxAmp) * (mid - 6);
                        ctx.lineTo(x, mid - Math.max(0, val));
                    }
                    ctx.lineTo(W, mid);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(109,40,217,0.2)";
                    ctx.fill();

                    // Fill below origin (negative)
                    ctx.beginPath();
                    ctx.moveTo(0, mid);
                    for (let x = 0; x < W; x++) {
                        const s   = startSamp + Math.floor(x * step);
                        const val = (pcm[Math.min(s, totalSamp-1)] / maxAmp) * (mid - 6);
                        ctx.lineTo(x, mid - Math.min(0, val));
                    }
                    ctx.lineTo(W, mid);
                    ctx.closePath();
                    ctx.fillStyle = "rgba(217,70,239,0.15)";
                    ctx.fill();

                    // Draw waveform line
                    ctx.beginPath();
                    ctx.lineWidth   = 1.5;
                    ctx.strokeStyle = "#7c3aed";

                    for (let x = 0; x < W; x++) {
                        const s   = startSamp + Math.floor(x * step);
                        const val = (pcm[Math.min(s, totalSamp-1)] / maxAmp) * (mid - 6);
                        if (x === 0) ctx.moveTo(x, mid - val);
                        else         ctx.lineTo(x, mid - val);
                    }
                    ctx.stroke();

                    // Playhead — vertical line at center
                    const px = W / 2;
                    ctx.strokeStyle = "#ef4444";
                    ctx.lineWidth   = 2;
                    ctx.setLineDash([]);
                    ctx.beginPath();
                    ctx.moveTo(px, 4);
                    ctx.lineTo(px, H - 4);
                    ctx.stroke();

                    // Current time label
                    ctx.fillStyle = "#ef4444";
                    ctx.font      = "bold 9px monospace";
                    ctx.fillText(`${currentTime.toFixed(2)}s`, px + 4, 14);
                }
            } else if (audioFeatures?.mel) {
                // Fallback: draw mel as waveform-like shape
                const mel    = audioFeatures.mel.slice(0, W);
                const melMax = Math.max(...mel) || 1;
                ctx.beginPath();
                ctx.lineWidth   = 1.5;
                ctx.strokeStyle = "#a78bfa";
                for (let x = 0; x < W; x++) {
                    const idx = Math.floor((x / W) * mel.length);
                    const val = (mel[idx] / melMax) * (mid - 6);
                    const y   = x % 2 === 0 ? mid - val * 0.6 : mid + val * 0.4;
                    if (x === 0) ctx.moveTo(x, y);
                    else         ctx.lineTo(x, y);
                }
                ctx.stroke();
            }

            // Origin labels
            ctx.fillStyle = "#a78bfa";
            ctx.font      = "8px sans-serif";
            ctx.fillText("+", 4, 14);
            ctx.fillText("–", 4, H - 6);
            ctx.fillText("0", 4, mid + 4);

            waveAnimRef.current = requestAnimationFrame(draw);
        };

        waveAnimRef.current = requestAnimationFrame(draw);
        return () => { if (waveAnimRef.current) cancelAnimationFrame(waveAnimRef.current); };
    }, [status, currentTime, duration, audioFeatures]);

    // ── FFT SPECTRUM draw loop ────────────────────────────────────────────────
    useEffect(() => {
        const canvas = fftCanvasRef.current;
        if (!canvas) return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            ctx.clearRect(0, 0, W, H);
            ctx.fillStyle = "#f3f0ff";
            ctx.fillRect(0, 0, W, H);

            let bars = null;
            if (status === "ready" && fftFrames.current.length > 0 && duration > 0) {
                const progress = Math.max(0, Math.min(1, currentTime / duration));
                const idx      = Math.floor(progress * (fftFrames.current.length - 1));
                bars           = fftFrames.current[idx];
            } else if (audioFeatures?.mel) {
                const mel    = audioFeatures.mel.slice(0, NUM_BARS);
                const melMin = Math.min(...mel);
                const melMax = Math.max(...mel) || 1;
                bars = mel.map(v => Math.max(0.03, (v - melMin) / (melMax - melMin)));
            }

            if (bars) {
                const barW = W / bars.length;
                for (let i = 0; i < bars.length; i++) {
                    const barH = Math.max(3, bars[i] * (H - 4));
                    const t    = i / bars.length;
                    const r    = Math.round(110 + t * 145);
                    const g    = Math.round(40  + t * 20);
                    const b    = Math.round(210 - t * 50);
                    ctx.fillStyle = `rgb(${r},${g},${b})`;
                    ctx.beginPath();
                    if (ctx.roundRect) ctx.roundRect(i*barW+1, H-barH, barW-2, barH, 2);
                    else               ctx.rect(i*barW+1, H-barH, barW-2, barH);
                    ctx.fill();
                }
            }

            fftAnimRef.current = requestAnimationFrame(draw);
        };

        fftAnimRef.current = requestAnimationFrame(draw);
        return () => { if (fftAnimRef.current) cancelAnimationFrame(fftAnimRef.current); };
    }, [status, currentTime, duration, audioFeatures]);

    if (!audioFeatures && !audioURL) return null;

    const { rms = 0, zcr = 0, rolloff = 0 } = audioFeatures || {};
    const loudness  = rms > 0.05 ? "High"    : rms > 0.02 ? "Medium" : "Low";
    const loudColor = rms > 0.05 ? "#15803d" : rms > 0.02 ? "#b45309" : "#1d4ed8";
    const zcrLabel  = zcr > 0.1  ? "Fast"    : zcr > 0.05 ? "Medium" : "Slow";

    const tabStyle = (t) => ({
        padding: "5px 14px",
        borderRadius: 999,
        fontSize: 10,
        fontWeight: 700,
        cursor: "pointer",
        border: "none",
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
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#ddd6fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14 }}>📊</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#3730a3" }}>Audio Analysis</p>
                        <p style={{ fontSize: 9, color: "#7c3aed", marginTop: 1 }}>
                            {status === "loading" ? "⏳ Decoding audio..."
                             : status === "ready"  ? `🔴 Live · synced · ${language || ""}`
                             :                       `CNN-LSTM features · ${language || ""}`}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", gap: 6 }}>
                    <button style={tabStyle("waveform")}  onClick={() => setTab("waveform")}>〰 Waveform</button>
                    <button style={tabStyle("spectrum")}  onClick={() => setTab("spectrum")}>▦ Spectrum</button>
                </div>
            </div>

            {/* Waveform canvas */}
            <div style={{ display: tab === "waveform" ? "block" : "none", padding: "12px 18px 4px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Audio waveform — above origin = positive, below = negative
                </p>
                <canvas ref={waveCanvasRef} width={560} height={110}
                    style={{ width: "100%", height: 110, display: "block", borderRadius: 6 }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, marginBottom: 8 }}>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>← 1s before</span>
                    <span style={{ fontSize: 8, color: "#ef4444", fontWeight: 700 }}>▼ now</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>1s after →</span>
                </div>
            </div>

            {/* Spectrum canvas */}
            <div style={{ display: tab === "spectrum" ? "block" : "none", padding: "12px 18px 4px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 6 }}>
                    Frequency spectrum — synced to playback
                </p>
                <canvas ref={fftCanvasRef} width={560} height={110}
                    style={{ width: "100%", height: 110, display: "block", borderRadius: 6 }} />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 3, marginBottom: 8 }}>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Low freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Mid freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>High freq</span>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", margin: "0 18px 14px", borderRadius: 12, overflow: "hidden", border: "1px solid #e0d7f5" }}>
                <div style={{ padding: "8px", textAlign: "center", backgroundColor: "#faf5ff" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", marginBottom: 3 }}>Loudness</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: loudColor }}>{loudness}</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af" }}>RMS {rms.toFixed(4)}</p>
                </div>
                <div style={{ padding: "8px", textAlign: "center", backgroundColor: "#faf5ff", borderLeft: "1px solid #e0d7f5", borderRight: "1px solid #e0d7f5" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", marginBottom: 3 }}>Wave speed</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#6d28d9" }}>{zcrLabel}</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af" }}>ZCR {zcr.toFixed(4)}</p>
                </div>
                <div style={{ padding: "8px", textAlign: "center", backgroundColor: "#faf5ff" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", marginBottom: 3 }}>Freq ceiling</p>
                    <p style={{ fontSize: 13, fontWeight: 800, color: "#1d4ed8" }}>{(rolloff/1000).toFixed(1)} kHz</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af" }}>Rolloff</p>
                </div>
            </div>

            {/* Footer */}
            <div style={{ margin: "0 18px 14px", padding: "10px 12px", borderRadius: 10, backgroundColor: "#ede9fe", border: "1px solid #c4b5fd", display: "flex", gap: 8 }}>
                <span style={{ fontSize: 11 }}>🧠</span>
                <p style={{ fontSize: 9, color: "#4c1d95", lineHeight: 1.6 }}>
                    Waveform: raw PCM signal — above zero line = positive pressure, below = negative.
                    Red line = current playback position. Spectrum: FFT frequency bars synced to same moment.
                </p>
            </div>
        </motion.div>
    );
}