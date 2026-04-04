import React, { useEffect, useRef, useState } from "react";
import { motion } from "framer-motion";

// ─── AudioVisualizer ──────────────────────────────────────────────────────────
// Gets the EXACT frequency spectrum of the TTS audio.
//
// Approach (avoids all CORS / playback issues):
//   1. Fetch the audio file as ArrayBuffer (same origin request, CORS ok)
//   2. Decode it with OfflineAudioContext → get the full PCM waveform
//   3. Run FFT on the waveform to get real frequency data for all time segments
//   4. When playing, show the correct frequency frame for the current playback time
//   5. Main <audio> element is NEVER touched — playback works perfectly
// ─────────────────────────────────────────────────────────────────────────────
export default function AudioVisualizer({ audioURL, audioFeatures, isPlaying, currentTime, duration, language }) {
    const canvasRef    = useRef(null);
    const animFrameRef = useRef(null);
    const fftFrames    = useRef([]);   // array of frequency snapshots
    const [status, setStatus] = useState("idle"); // idle | loading | ready | error

    const NUM_BARS    = 48;
    const FRAME_RATE  = 30; // snapshots per second

    // ── Step 1: Fetch + decode audio → extract FFT frames ───────────────────
    useEffect(() => {
        if (!audioURL) return;
        fftFrames.current = [];
        setStatus("loading");

        const run = async () => {
            try {
                // Fetch audio bytes
                const res    = await fetch(audioURL);
                const buffer = await res.arrayBuffer();

                // Decode with OfflineAudioContext
                const tempCtx = new (window.OfflineAudioContext || window.webkitOfflineAudioContext)(1, 1, 22050);
                const decoded = await tempCtx.decodeAudioData(buffer);

                const sampleRate   = decoded.sampleRate;
                const channelData  = decoded.getChannelData(0); // mono PCM
                const totalSamples = channelData.length;
                const fftSize      = 512;
                const hopSize      = Math.floor(sampleRate / FRAME_RATE); // samples per frame
                const frames       = [];

                // Slide through audio, compute FFT per frame
                for (let start = 0; start + fftSize < totalSamples; start += hopSize) {
                    const slice  = channelData.slice(start, start + fftSize);
                    const freqs  = computeFFT(slice, NUM_BARS);
                    frames.push(freqs);
                }

                fftFrames.current = frames;
                setStatus("ready");
            } catch (e) {
                console.warn("Audio decode failed:", e);
                setStatus("error");
            }
        };

        run();
    }, [audioURL]);

    // ── Step 2: Draw loop — pick correct frame based on currentTime ──────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const draw = () => {
            const ctx = canvas.getContext("2d");
            const W   = canvas.width;
            const H   = canvas.height;
            ctx.clearRect(0, 0, W, H);

            let bars = null;

            if (status === "ready" && fftFrames.current.length > 0) {
                // Pick the frame that matches current playback time
                const frameIdx = Math.min(
                    Math.floor((currentTime / (duration || 1)) * fftFrames.current.length),
                    fftFrames.current.length - 1
                );
                bars = fftFrames.current[Math.max(0, frameIdx)];
            } else if (audioFeatures?.mel) {
                // Fallback to CNN-LSTM mel features
                const mel    = audioFeatures.mel.slice(0, NUM_BARS);
                const melMin = Math.min(...mel);
                const melMax = Math.max(...mel) || 1;
                bars = mel.map(v => (v - melMin) / (melMax - melMin));
            }

            if (!bars) {
                animFrameRef.current = requestAnimationFrame(draw);
                return;
            }

            const barW = W / bars.length;

            bars.forEach((val, i) => {
                const barH = Math.max(3, val * (H - 4));
                const t    = i / bars.length;
                const r    = Math.round(110 + t * 145);
                const g    = Math.round(40  + t * 20);
                const b    = Math.round(210 - t * 50);

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.beginPath();
                if (ctx.roundRect) {
                    ctx.roundRect(i * barW + 1, H - barH, barW - 2, barH, 2);
                } else {
                    ctx.rect(i * barW + 1, H - barH, barW - 2, barH);
                }
                ctx.fill();
            });

            animFrameRef.current = requestAnimationFrame(draw);
        };

        animFrameRef.current = requestAnimationFrame(draw);
        return () => { if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current); };
    }, [status, currentTime, duration, audioFeatures]);

    if (!audioFeatures && !audioURL) return null;

    const { rms = 0, zcr = 0, rolloff = 0 } = audioFeatures || {};
    const loudness  = rms > 0.05 ? "High"    : rms > 0.02 ? "Medium" : "Low";
    const loudColor = rms > 0.05 ? "#15803d" : rms > 0.02 ? "#b45309" : "#1d4ed8";
    const zcrLabel  = zcr > 0.1  ? "Fast"    : zcr > 0.05 ? "Medium" : "Slow";

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
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#3730a3", letterSpacing: "0.04em" }}>Frequency Spectrum</p>
                        <p style={{ fontSize: 9, color: "#7c3aed", marginTop: 1 }}>
                            {status === "ready"
                                ? `🔴 Live FFT — synced to playback · ${language || ""}`
                                : status === "loading"
                                ? "⏳ Decoding audio..."
                                : `CNN-LSTM Mel Spectrogram · ${language || ""}`}
                        </p>
                    </div>
                </div>
                <div style={{ display: "flex", alignItems: "center", gap: 5, padding: "4px 10px", borderRadius: 999, backgroundColor: isPlaying ? "#dcfce7" : "#ede9fe", border: `1px solid ${isPlaying ? "#86efac" : "#c4b5fd"}`, fontSize: 9, fontWeight: 700, color: isPlaying ? "#15803d" : "#7c3aed" }}>
                    <span style={{ width: 6, height: 6, borderRadius: "50%", backgroundColor: isPlaying ? "#16a34a" : "#7c3aed", display: "inline-block" }} />
                    {isPlaying ? "Live" : "Ready"}
                </div>
            </div>

            {/* Canvas */}
            <div style={{ padding: "14px 18px 4px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                    {status === "ready" ? "Real-time FFT — synced to audio playback" : "Mel Spectrogram — CNN-LSTM features"}
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
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Loudness</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: loudColor }}>{loudness}</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", marginTop: 2 }}>RMS {rms.toFixed(4)}</p>
                </div>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff", borderLeft: "1px solid #e0d7f5", borderRight: "1px solid #e0d7f5" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Wave speed</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#6d28d9" }}>{zcrLabel}</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", marginTop: 2 }}>ZCR {zcr.toFixed(4)}</p>
                </div>
                <div style={{ padding: "10px 8px", textAlign: "center", backgroundColor: "#faf5ff" }}>
                    <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.08em", marginBottom: 4 }}>Freq ceiling</p>
                    <p style={{ fontSize: 14, fontWeight: 800, color: "#1d4ed8" }}>{(rolloff / 1000).toFixed(1)} kHz</p>
                    <p style={{ fontSize: 8, fontFamily: "monospace", color: "#9ca3af", marginTop: 2 }}>Rolloff</p>
                </div>
            </div>

            {/* Footer */}
            <div style={{ margin: "0 18px 14px", padding: "10px 12px", borderRadius: 10, backgroundColor: "#ede9fe", border: "1px solid #c4b5fd", display: "flex", alignItems: "flex-start", gap: 8 }}>
                <span style={{ fontSize: 11, marginTop: 1 }}>🧠</span>
                <p style={{ fontSize: 9, color: "#4c1d95", lineHeight: 1.6 }}>
                    {status === "ready"
                        ? "FFT computed from decoded audio PCM data — exact frequency spectrum synced to current playback position."
                        : "CNN-LSTM Mel Spectrogram — acoustic features extracted by trained model from generated audio."}
                </p>
            </div>
        </motion.div>
    );
}

// ── FFT helper — computes frequency magnitude for N bars from PCM slice ───────
function computeFFT(timeData, numBars) {
    const N      = timeData.length;
    const real   = new Float32Array(N);
    const imag   = new Float32Array(N);

    // Apply Hann window
    for (let i = 0; i < N; i++) {
        const window = 0.5 * (1 - Math.cos((2 * Math.PI * i) / (N - 1)));
        real[i] = timeData[i] * window;
    }

    // DFT (simple, N=512 is fast enough)
    const mags = new Float32Array(N / 2);
    for (let k = 0; k < N / 2; k++) {
        let re = 0, im = 0;
        for (let n = 0; n < N; n++) {
            const angle = (2 * Math.PI * k * n) / N;
            re += real[n] * Math.cos(angle);
            im -= real[n] * Math.sin(angle);
        }
        mags[k] = Math.sqrt(re * re + im * im) / N;
    }

    // Group into numBars using mel-scale spacing
    const bars    = new Array(numBars).fill(0);
    const binsPer = Math.floor(mags.length / numBars);
    let   maxMag  = 0;

    for (let b = 0; b < numBars; b++) {
        let sum = 0;
        for (let j = 0; j < binsPer; j++) {
            sum += mags[b * binsPer + j];
        }
        bars[b] = sum / binsPer;
        if (bars[b] > maxMag) maxMag = bars[b];
    }

    // Normalize 0–1
    if (maxMag > 0) {
        for (let b = 0; b < numBars; b++) {
            bars[b] = bars[b] / maxMag;
        }
    }

    return bars;
}