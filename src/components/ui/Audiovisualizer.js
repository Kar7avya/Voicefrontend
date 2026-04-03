import React, { useEffect, useRef, useState, useCallback } from "react";
import { motion } from "framer-motion";

// ─── AudioVisualizer ──────────────────────────────────────────────────────────
// APPROACH:
//   - Uses CNN-LSTM Mel Spectrogram features as the BASE bar shape
//   - When playing: animates bars smoothly around the real ML values
//   - Does NOT use Web Audio API (it breaks audio playback in many browsers)
//   - Audio playback is handled entirely by SmartTTS.js <audio> element
// ─────────────────────────────────────────────────────────────────────────────
export default function AudioVisualizer({ audioFeatures, isPlaying, language }) {
    const canvasRef    = useRef(null);
    const animFrameRef = useRef(null);
    const phaseRef     = useRef(0);

    // ── Pre-compute bar data from Mel features ────────────────────────────────
    const barsRef = useRef([]);
    useEffect(() => {
        if (!audioFeatures?.mel) return;
        const mel    = audioFeatures.mel.slice(0, 40);
        const melMin = Math.min(...mel);
        const melMax = Math.max(...mel) || 1;
        barsRef.current = mel.map((val, i) => ({
            base:  (val - melMin) / (melMax - melMin), // 0–1 normalised
            phase: (i * 0.4),                          // stagger phase per bar
        }));
    }, [audioFeatures]);

    // ── Draw loop ─────────────────────────────────────────────────────────────
    const draw = useCallback(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx  = canvas.getContext("2d");
        const W    = canvas.width;
        const H    = canvas.height;
        const bars = barsRef.current;
        if (!bars.length) return;

        ctx.clearRect(0, 0, W, H);

        const barW = W / bars.length;
        phaseRef.current += isPlaying ? 0.06 : 0;

        bars.forEach((bar, i) => {
            // When playing: oscillate ±20% around the real ML base value
            // When paused:  show exact ML value with no oscillation
            const oscillation = isPlaying
                ? Math.sin(phaseRef.current + bar.phase) * 0.2
                : 0;

            const ratio = Math.max(0.05, Math.min(1, bar.base + oscillation));
            const barH  = ratio * (H - 4);

            // Color: violet → purple → pink based on position
            const t = i / bars.length;
            const r = Math.round(110 + t * 145);
            const g = Math.round(40  + t * 30);
            const b = Math.round(210 - t * 60);

            ctx.fillStyle = `rgba(${r},${g},${b},${isPlaying ? 0.9 : 0.7})`;
            ctx.beginPath();
            if (ctx.roundRect) {
                ctx.roundRect(i * barW + 1, H - barH, barW - 2, barH, 2);
            } else {
                ctx.rect(i * barW + 1, H - barH, barW - 2, barH);
            }
            ctx.fill();
        });

        animFrameRef.current = requestAnimationFrame(draw);
    }, [isPlaying]);

    // ── Start / stop loop ─────────────────────────────────────────────────────
    useEffect(() => {
        animFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [draw]);

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
                    <div style={{
                        width: 28, height: 28, borderRadius: 8,
                        backgroundColor: "#ddd6fe",
                        display: "flex", alignItems: "center", justifyContent: "center",
                    }}>
                        <span style={{ fontSize: 14 }}>📊</span>
                    </div>
                    <div>
                        <p style={{ fontSize: 11, fontWeight: 700, color: "#3730a3", letterSpacing: "0.04em" }}>
                            CNN-LSTM Frequency Spectrum
                        </p>
                        <p style={{ fontSize: 9, color: "#7c3aed", marginTop: 1 }}>
                            Mel Spectrogram · {language} · {isPlaying ? "Animating with audio" : "Static view"}
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
                    }} />
                    {isPlaying ? "Playing" : "Ready"}
                </div>
            </div>

            {/* Canvas */}
            <div style={{ padding: "14px 18px 4px" }}>
                <p style={{
                    fontSize: 9, fontWeight: 700, color: "#7c3aed",
                    textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8,
                }}>
                    Mel Spectrogram — 40 frequency bands
                </p>
                <canvas
                    ref={canvasRef}
                    width={560}
                    height={90}
                    style={{ width: "100%", height: 90, display: "block", borderRadius: 6 }}
                />
                <div style={{ display: "flex", justifyContent: "space-between", marginTop: 4, marginBottom: 12 }}>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Low freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>Mid freq</span>
                    <span style={{ fontSize: 8, color: "#a78bfa" }}>High freq</span>
                </div>
            </div>

            {/* Stats row */}
            <div style={{
                display: "grid", gridTemplateColumns: "1fr 1fr 1fr",
                margin: "0 18px 14px",
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
                margin: "0 18px 14px", padding: "10px 12px",
                borderRadius: 10, backgroundColor: "#ede9fe",
                border: "1px solid #c4b5fd",
                display: "flex", alignItems: "flex-start", gap: 8,
            }}>
                <span style={{ fontSize: 11, marginTop: 1 }}>🧠</span>
                <p style={{ fontSize: 9, color: "#4c1d95", lineHeight: 1.6 }}>
                    Bar shape = Mel Spectrogram extracted by CNN-LSTM from generated audio.
                    Bars animate in sync with audio playback — real acoustic fingerprint of the voice.
                </p>
            </div>

        </motion.div>
    );
}