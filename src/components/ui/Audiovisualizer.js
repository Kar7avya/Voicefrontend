import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ── Cooley-Tukey FFT (radix-2, in-place) ─────────────────────────────────────
// N must be power of 2. Returns magnitude array of length N/2.
function fft(re, im) {
    const N = re.length;
    // Bit-reversal permutation
    for (let i = 1, j = 0; i < N; i++) {
        let bit = N >> 1;
        for (; j & bit; bit >>= 1) j ^= bit;
        j ^= bit;
        if (i < j) {
            [re[i], re[j]] = [re[j], re[i]];
            [im[i], im[j]] = [im[j], im[i]];
        }
    }
    // Butterfly
    for (let len = 2; len <= N; len <<= 1) {
        const ang = (-2 * Math.PI) / len;
        const wRe = Math.cos(ang);
        const wIm = Math.sin(ang);
        for (let i = 0; i < N; i += len) {
            let curRe = 1, curIm = 0;
            for (let j = 0; j < len / 2; j++) {
                const uRe = re[i + j];
                const uIm = im[i + j];
                const vRe = re[i + j + len / 2] * curRe - im[i + j + len / 2] * curIm;
                const vIm = re[i + j + len / 2] * curIm + im[i + j + len / 2] * curRe;
                re[i + j]           = uRe + vRe;
                im[i + j]           = uIm + vIm;
                re[i + j + len / 2] = uRe - vRe;
                im[i + j + len / 2] = uIm - vIm;
                const nr = curRe * wRe - curIm * wIm;
                curIm    = curRe * wIm + curIm * wRe;
                curRe    = nr;
            }
        }
    }
    // Magnitudes
    const mags = new Float32Array(N / 2);
    for (let i = 0; i < N / 2; i++) {
        mags[i] = Math.sqrt(re[i] * re[i] + im[i] * im[i]) / N;
    }
    return mags;
}

// ── Hann window ───────────────────────────────────────────────────────────────
function hannWindow(signal) {
    const N      = signal.length;
    const result = new Float32Array(N);
    for (let i = 0; i < N; i++) {
        result[i] = signal[i] * 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
    }
    return result;
}

// ── Group FFT bins into N bars (log scale) ────────────────────────────────────
function binsToLogBars(mags, numBars) {
    const N       = mags.length;
    const minFreq = 1;
    const maxFreq = N;
    const bars    = new Float32Array(numBars);

    for (let b = 0; b < numBars; b++) {
        const lo = Math.floor(minFreq * Math.pow(maxFreq / minFreq, b / numBars));
        const hi = Math.floor(minFreq * Math.pow(maxFreq / minFreq, (b + 1) / numBars));
        let   sum = 0, count = 0;
        for (let k = Math.max(lo, 0); k <= Math.min(hi, N - 1); k++) {
            sum += mags[k];
            count++;
        }
        bars[b] = count > 0 ? sum / count : 0;
    }

    // Normalize
    const mx = Math.max(...bars, 1e-10);
    for (let b = 0; b < numBars; b++) bars[b] /= mx;
    return bars;
}

const FFT_SIZE  = 1024; // power of 2
const NUM_BARS  = 48;
const FPS       = 60;   // frames per second

export default function AudioVisualizer({ audioURL, audioFeatures, isPlaying, currentTime, duration, language }) {
    const canvasRef   = useRef(null);
    const animRef     = useRef(null);
    const framesRef   = useRef([]);   // pre-computed FFT frames
    const [status, setStatus] = useState("idle");

    // ── Pre-compute all FFT frames when audioURL changes ─────────────────────
    useEffect(() => {
        if (!audioURL) return;
        framesRef.current = [];
        setStatus("loading");

        const run = async () => {
            try {
                const res    = await fetch(audioURL);
                if (!res.ok) throw new Error("fetch failed");
                const buf    = await res.arrayBuffer();

                // Decode audio to raw PCM
                const tmpCtx = new (window.AudioContext || window.webkitAudioContext)();
                const decoded = await tmpCtx.decodeAudioData(buf);
                await tmpCtx.close();

                const sr       = decoded.sampleRate;
                const pcm      = decoded.getChannelData(0); // mono
                const hopSize  = Math.floor(sr / FPS);      // samples between frames
                const frames   = [];

                for (let start = 0; start + FFT_SIZE <= pcm.length; start += hopSize) {
                    const slice    = pcm.slice(start, start + FFT_SIZE);
                    const windowed = hannWindow(slice);

                    // Pad to FFT_SIZE if needed
                    const re = new Float32Array(FFT_SIZE);
                    const im = new Float32Array(FFT_SIZE);
                    for (let i = 0; i < windowed.length; i++) re[i] = windowed[i];

                    const mags = fft(re, im);
                    const bars = binsToLogBars(mags, NUM_BARS);
                    frames.push(bars);
                }

                framesRef.current = frames;
                setStatus("ready");
            } catch (e) {
                console.warn("AudioVisualizer decode error:", e.message);
                setStatus("error");
            }
        };

        run();
    }, [audioURL]);

    // ── Draw loop — picks correct frame from currentTime ─────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            ctx.clearRect(0, 0, W, H);

            let bars = null;

            if (status === "ready" && framesRef.current.length > 0 && duration > 0) {
                // Exact frame for current playback position
                const progress = Math.max(0, Math.min(1, currentTime / duration));
                const idx      = Math.floor(progress * (framesRef.current.length - 1));
                bars           = framesRef.current[idx];
            } else if (audioFeatures?.mel) {
                // Fallback: CNN-LSTM mel spectrogram
                const mel    = audioFeatures.mel.slice(0, NUM_BARS);
                const melMin = Math.min(...mel);
                const melMax = Math.max(...mel) || 1;
                bars = mel.map(v => Math.max(0.03, (v - melMin) / (melMax - melMin)));
            }

            if (!bars) {
                animRef.current = requestAnimationFrame(draw);
                return;
            }

            const barW = W / bars.length;

            for (let i = 0; i < bars.length; i++) {
                const val  = bars[i];
                const barH = Math.max(3, val * (H - 4));
                const t    = i / bars.length;

                // Color: violet → pink
                const r = Math.round(110 + t * 145);
                const g = Math.round(40  + t * 20);
                const b = Math.round(210 - t * 50);

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(i * barW + 1, H - barH, barW - 2, barH, 2);
                } else {
                    ctx.rect(i * barW + 1, H - barH, barW - 2, barH);
                }
                ctx.fill();
            }

            animRef.current = requestAnimationFrame(draw);
        };

        animRef.current = requestAnimationFrame(draw);
        return () => { if (animRef.current) cancelAnimationFrame(animRef.current); };
    }, [status, currentTime, duration, audioFeatures]);

    if (!audioFeatures && !audioURL) return null;

    const { rms = 0, zcr = 0, rolloff = 0 } = audioFeatures || {};
    const loudness  = rms > 0.05 ? "High"    : rms > 0.02 ? "Medium" : "Low";
    const loudColor = rms > 0.05 ? "#15803d" : rms > 0.02 ? "#b45309" : "#1d4ed8";
    const zcrLabel  = zcr > 0.1  ? "Fast"    : zcr > 0.05 ? "Medium" : "Slow";

    const isLive    = status === "ready";
    const isLoading = status === "loading";

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
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#3730a3" }}>
                            Frequency Spectrum
                        </p>
                        <p style={{ fontSize: 9, color: "#7c3aed", marginTop: 1 }}>
                            {isLoading
                                ? "⏳ Computing FFT frames..."
                                : isLive
                                ? `🔴 Live FFT · synced to playback · ${language || ""}`
                                : `CNN-LSTM Mel Spectrogram · ${language || ""}`}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, backgroundColor: isPlaying ? "#dcfce7" : "#ede9fe", border: `1px solid ${isPlaying ? "#86efac" : "#c4b5fd"}`, fontSize: 9, fontWeight: 700, color: isPlaying ? "#15803d" : "#7c3aed" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: isPlaying ? "#16a34a" : "#7c3aed", display: "inline-block" }} />
                    {isPlaying ? "Playing" : "Ready"}
                </div>
            </div>

            {/* Canvas */}
            <div style={{ padding: "14px 18px 4px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.1em", marginBottom: 8 }}>
                    {isLive ? "Real-time FFT — exact audio spectrum" : "Mel Spectrogram — CNN-LSTM features"}
                </p>
                <canvas
                    ref={canvasRef}
                    width={560}
                    height={100}
                    style={{ width: "100%", height: 100, display: "block", borderRadius: 6, backgroundColor: "#f3f0ff" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Low freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Mid freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>High freq</span>
                </div>
            </div>

            {/* Stats */}
            <div style={{ display: "grid", gridTemplateColumns: "1fr 1fr 1fr", margin: "0 18px 14px", borderRadius: 12, overflow: "hidden", border: "1px solid #e0d7f5" }}>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", marginBottom: 4 }}>Loudness</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: loudColor }}>{loudness}</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", marginTop: 2 }}>RMS {rms.toFixed(4)}</p>
                </div>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff", borderLeft: "1px solid #e0d7f5", borderRight: "1px solid #e0d7f5" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", marginBottom: 4 }}>Wave speed</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#6d28d9" }}>{zcrLabel}</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", marginTop: 2 }}>ZCR {zcr.toFixed(4)}</p>
                </div>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", marginBottom: 4 }}>Freq ceiling</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8" }}>{(rolloff / 1000).toFixed(1)} kHz</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", marginTop: 2 }}>Rolloff</p>
                </div>
            </div>

            {/* Footer */}
            <div style={{ margin: "0 18px 14px", padding: "10px 12px", borderRadius: 10, backgroundColor: "#ede9fe", border: "1px solid #c4b5fd", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 11, marginTop: 1 }}>🧠</span>
                <p style={{ fontSize: 9, color: "#4c1d95", lineHeight: 1.6 }}>
                    {isLive
                        ? "Cooley-Tukey FFT with Hann window — pre-computed at 60fps, synced to exact playback position."
                        : "CNN-LSTM Mel Spectrogram — acoustic features extracted by trained model from generated audio."}
                </p>
            </div>
        </motion.div>
    );
}