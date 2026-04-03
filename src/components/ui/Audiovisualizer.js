import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// ─── AudioVisualizer ──────────────────────────────────────────────────────────
// Shows the frequency spectrum of the generated audio in real time.
//
// How it works:
//   1. When audio plays → Web Audio API reads live FFT frequencies (256 bands)
//   2. These are REAL frequency values from the actual audio signal
//   3. When paused → falls back to ML features (Mel Spectrogram from CNN-LSTM)
//   4. Both views show the acoustic fingerprint of the generated voice
//
// Props:
//   audioRef      — ref to the <audio> element in SmartTTS.js
//   audioFeatures — { mfcc[], mel[], rms, zcr, rolloff } from /generate API
//   isPlaying     — boolean
//   language      — string
// ─────────────────────────────────────────────────────────────────────────────
export default function AudioVisualizer({ audioRef, audioFeatures, isPlaying, language }) {
    const canvasRef      = useRef(null);
    const animFrameRef   = useRef(null);
    const analyserRef    = useRef(null);
    const sourceRef      = useRef(null);
    const audioCtxRef    = useRef(null);
    const dataArrayRef   = useRef(null);
    const [ready, setReady] = useState(false);
    const [mode,  setMode]  = useState("ml"); // "live" | "ml"

    // ── Build Web Audio API analyser once ────────────────────────────────────
    const setupAudioContext = useCallback(() => {
        if (analyserRef.current) return;
        const audio = audioRef?.current;
        if (!audio) return;

        try {
            const ctx      = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = ctx.createAnalyser();
            analyser.fftSize          = 512;   // 256 frequency bins
            analyser.smoothingTimeConstant = 0.8;

            const source = ctx.createMediaElementSource(audio);
            source.connect(analyser);
            analyser.connect(ctx.destination);

            audioCtxRef.current  = ctx;
            analyserRef.current  = analyser;
            sourceRef.current    = source;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
            setReady(true);
        } catch (e) {
            console.warn("Web Audio API setup failed:", e);
        }
    }, [audioRef]);

    // ── Draw loop ─────────────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas   = canvasRef.current;
        const analyser = analyserRef.current;
        const dataArr  = dataArrayRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext("2d");
        const W   = canvas.width;
        const H   = canvas.height;

        ctx.clearRect(0, 0, W, H);

        if (analyser && dataArr && isPlaying) {
            // ── LIVE mode — real FFT from Web Audio API ──
            analyser.getByteFrequencyData(dataArr);
            setMode("live");

            const barCount = 40;
            const step     = Math.floor(dataArr.length / barCount);
            const barW     = W / barCount;

            for (let i = 0; i < barCount; i++) {
                // Average a small band of FFT bins for each bar
                let sum = 0;
                for (let j = 0; j < step; j++) {
                    sum += dataArr[i * step + j];
                }
                const avg     = sum / step;
                const barH    = (avg / 255) * H;
                const colorRatio = i / barCount;

                // Color: deep blue → violet → pink
                const r = Math.round(80  + colorRatio * 180);
                const g = Math.round(30  + colorRatio * 20);
                const b = Math.round(220 - colorRatio * 80);

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.beginPath();
                ctx.roundRect(i * barW + 1, H - barH, barW - 2, barH, 2);
                ctx.fill();
            }
        } else if (audioFeatures?.mel) {
            // ── ML mode — Mel Spectrogram from CNN-LSTM ──
            setMode("ml");
            const mel    = audioFeatures.mel.slice(0, 40);
            const melMin = Math.min(...mel);
            const melMax = Math.max(...mel) || 1;
            const barW   = W / mel.length;

            mel.forEach((val, i) => {
                const ratio    = (val - melMin) / (melMax - melMin);
                const barH     = 8 + ratio * (H - 8);
                const colorRatio = i / mel.length;

                const r = Math.round(80  + colorRatio * 180);
                const g = Math.round(30  + colorRatio * 20);
                const b = Math.round(220 - colorRatio * 80);

                ctx.fillStyle = `rgb(${r},${g},${b})`;
                ctx.beginPath();
                ctx.roundRect(i * barW + 1, H - barH, barW - 2, barH, 2);
                ctx.fill();
            });
        }

        animFrameRef.current = requestAnimationFrame(draw);
    }, [isPlaying, audioFeatures]);

    // ── Start / stop animation ────────────────────────────────────────────────
    useEffect(() => {
        if (isPlaying) {
            setupAudioContext();
            // Resume AudioContext if suspended (browser autoplay policy)
            if (audioCtxRef.current?.state === "suspended") {
                audioCtxRef.current.resume();
            }
        }
        animFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isPlaying, draw, setupAudioContext, audioFeatures]);

    // ── Cleanup on unmount ────────────────────────────────────────────────────
    useEffect(() => {
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, []);

    if (!audioFeatures) return null;

    const { rms = 0, zcr = 0, rolloff = 0 } = audioFeatures;
    const loudness  = rms > 0.05 ? "High"    : rms > 0.02 ? "Medium" : "Low";
    const loudColor = rms > 0.05 ? "#15803d" : rms > 0.02 ? "#b45309" : "#1d4ed8";
    const zcrLabel  = zcr > 0.1  ? "Fast"    : zcr > 0.05 ? "Medium" : "Slow";

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{
                borderRadius: 16,
                border: "1.5px solid #e0d7f5",
                overflow: "hidden",
                backgroundColor: "#f8f5ff",
            }}
        >
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 18px",
                borderBottom: "1px solid #e0d7f5",
                backgroundColor: "#ede9fe",
            }}>
                <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                    <div style={{ width: 28, height: 28, borderRadius: 8, backgroundColor: "#ddd6fe", display: "flex", alignItems: "center", justifyContent: "center" }}>
                        <span style={{ fontSize: 14 }}>📊</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#3730a3", letterSpacing: "0.04em" }}>
                            Frequency Spectrum
                        </p>
                        <p style={{ fontSize: 9, color: "#7c3aed", marginTop: 1 }}>
                            {isPlaying && mode === "live"
                                ? "🔴 Live — Web Audio API real-time FFT"
                                : "CNN-LSTM Mel Spectrogram · " + language}
                        </p>
                    </div>
                </div>
                <div style={{
                    display: "flex", alignItems: "center", gap: 5,
                    padding: "4px 10px", borderRadius: 999,
                    backgroundColor: isPlaying ? "#dcfce7" : "#ede9fe",
                    border: `1px solid ${isPlaying ? "#86efac" : "#c4b5fd"}`,
                    fontSize: 9, fontWeight: 700,
                    color: isPlaying ? "#15803d" : "#7c3aed",
                }}>
                    <span style={{
                        width: 6, height: 6, borderRadius: "50%",
                        backgroundColor: isPlaying ? "#16a34a" : "#7c3aed",
                        display: "inline-block",
                        animation: isPlaying ? "pulse 1s infinite" : "none",
                    }} />
                    {isPlaying ? "Live" : "Static"}
                </div>
            </div>

            {/* Canvas — frequency bars drawn here */}
            <div style={{ padding: "16px 18px 4px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                    {isPlaying && mode === "live" ? "Real-time FFT — 40 bands" : "Mel Spectrogram — 40 bands"}
                </p>
                <canvas
                    ref={canvasRef}
                    width={560}
                    height={100}
                    style={{ width: "100%", height: 100, display: "block" }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Low freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Mid freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>High freq</span>
                </div>
            </div>

            {/* Stats */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                margin: "0 18px 16px",
                borderRadius: 12, overflow: "hidden",
                border: "1px solid #e0d7f5",
            }}>
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
            <div style={{
                margin: "0 18px 16px",
                padding: "10px 12px",
                borderRadius: 10,
                backgroundColor: "#ede9fe",
                border: "1px solid #c4b5fd",
                display: "flex", alignItems: "flex-start", gap: 8,
            }}>
                <span style={{ fontSize: 11, marginTop: 1 }}>🧠</span>
                <p style={{ fontSize: 9, color: "#4c1d95", lineHeight: 1.6 }}>
                    {isPlaying && mode === "live"
                        ? "Live FFT from Web Audio API — real frequency data from the audio signal as it plays."
                        : "Mel Spectrogram extracted by CNN-LSTM model from generated audio — real acoustic fingerprint, not animation."}
                </p>
            </div>

        </motion.div>
    );
}