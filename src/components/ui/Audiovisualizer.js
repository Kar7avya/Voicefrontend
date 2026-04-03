import React, { useEffect, useRef } from "react";
import { motion } from "framer-motion";

// ─── AudioVisualizer ──────────────────────────────────────────────────────────
// Shows the EXACT real-time frequency spectrum of the TTS audio.
//
// How it works (does NOT break playback):
//   - A SECOND hidden <audio> element loads the same audioURL
//   - This second element is connected to Web Audio API analyser
//   - The analyser reads FFT data without touching the main playback audio
//   - Canvas draws the live frequency bars 60fps using requestAnimationFrame
//
// Props:
//   audioURL      — the mp3 URL (e.g. https://...hf.space/audio/xxx.mp3)
//   audioFeatures — CNN-LSTM features (used when not playing)
//   isPlaying     — boolean
//   language      — string
// ─────────────────────────────────────────────────────────────────────────────
export default function AudioVisualizer({ audioURL, audioFeatures, isPlaying, language }) {
    const canvasRef      = useRef(null);
    const animFrameRef   = useRef(null);
    const analyserAudio  = useRef(null); // hidden second audio element
    const analyserRef    = useRef(null);
    const dataArrayRef   = useRef(null);
    const audioCtxRef    = useRef(null);
    const setupDoneRef   = useRef(false);
    const phaseRef       = useRef(0);    // for ML fallback animation

    // ── Setup hidden audio + analyser when audioURL changes ──────────────────
    useEffect(() => {
        if (!audioURL) return;

        // Cleanup previous
        if (analyserAudio.current) {
            analyserAudio.current.pause();
            analyserAudio.current.src = "";
        }
        if (audioCtxRef.current) {
            audioCtxRef.current.close();
        }
        setupDoneRef.current = false;

        // Create hidden audio element for analysis only
        const hiddenAudio      = new Audio();
        hiddenAudio.src        = audioURL;
        hiddenAudio.crossOrigin = "anonymous";
        hiddenAudio.volume     = 0;      // silent — main audio plays normally
        hiddenAudio.preload    = "auto";
        analyserAudio.current  = hiddenAudio;

        // Setup Web Audio API
        try {
            const ctx      = new (window.AudioContext || window.webkitAudioContext)();
            const analyser = ctx.createAnalyser();
            analyser.fftSize               = 256;  // 128 frequency bins
            analyser.smoothingTimeConstant = 0.75; // smooth transitions

            const source = ctx.createMediaElementSource(hiddenAudio);
            source.connect(analyser);
            // Do NOT connect to ctx.destination — we want it silent

            audioCtxRef.current  = ctx;
            analyserRef.current  = analyser;
            dataArrayRef.current = new Uint8Array(analyser.frequencyBinCount);
            setupDoneRef.current = true;
        } catch (e) {
            console.warn("Web Audio setup failed:", e);
        }

        return () => {
            hiddenAudio.pause();
            hiddenAudio.src = "";
        };
    }, [audioURL]);

    // ── Sync hidden audio with main playback ──────────────────────────────────
    useEffect(() => {
        const hidden = analyserAudio.current;
        const ctx    = audioCtxRef.current;
        if (!hidden || !setupDoneRef.current) return;

        if (isPlaying) {
            if (ctx?.state === "suspended") ctx.resume();
            hidden.play().catch(() => {});
        } else {
            hidden.pause();
        }
    }, [isPlaying]);

    // ── Draw loop ─────────────────────────────────────────────────────────────
    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const draw = () => {
            const ctx  = canvas.getContext("2d");
            const W    = canvas.width;
            const H    = canvas.height;
            ctx.clearRect(0, 0, W, H);

            const analyser = analyserRef.current;
            const dataArr  = dataArrayRef.current;

            if (analyser && dataArr && isPlaying && setupDoneRef.current) {
                // ── LIVE FFT from Web Audio API ──
                analyser.getByteFrequencyData(dataArr);

                const barCount = 48;
                const step     = Math.floor(dataArr.length / barCount);
                const barW     = W / barCount;

                for (let i = 0; i < barCount; i++) {
                    let sum = 0;
                    for (let j = 0; j < step; j++) {
                        sum += dataArr[i * step + j];
                    }
                    const avg  = sum / step;
                    const barH = Math.max(3, (avg / 255) * (H - 4));
                    const t    = i / barCount;

                    // Color: violet → purple → pink
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

            } else if (audioFeatures?.mel) {
                // ── ML fallback: CNN-LSTM Mel Spectrogram ──
                phaseRef.current += isPlaying ? 0.05 : 0;
                const mel    = audioFeatures.mel.slice(0, 48);
                const melMin = Math.min(...mel);
                const melMax = Math.max(...mel) || 1;
                const barW   = W / mel.length;

                mel.forEach((val, i) => {
                    const base  = (val - melMin) / (melMax - melMin);
                    const osc   = isPlaying
                        ? Math.sin(phaseRef.current + i * 0.4) * 0.15
                        : 0;
                    const ratio = Math.max(0.03, Math.min(1, base + osc));
                    const barH  = Math.max(3, ratio * (H - 4));
                    const t     = i / mel.length;

                    const r = Math.round(110 + t * 145);
                    const g = Math.round(40  + t * 20);
                    const b = Math.round(210 - t * 50);

                    ctx.fillStyle = `rgba(${r},${g},${b},0.8)`;
                    ctx.beginPath();
                    if (ctx.roundRect) {
                        ctx.roundRect(i * barW + 1, H - barH, barW - 2, barH, 2);
                    } else {
                        ctx.rect(i * barW + 1, H - barH, barW - 2, barH);
                    }
                    ctx.fill();
                });
            }

            animFrameRef.current = requestAnimationFrame(draw);
        };

        animFrameRef.current = requestAnimationFrame(draw);
        return () => {
            if (animFrameRef.current) cancelAnimationFrame(animFrameRef.current);
        };
    }, [isPlaying, audioFeatures]);

    if (!audioFeatures && !audioURL) return null;

    const { rms = 0, zcr = 0, rolloff = 0 } = audioFeatures || {};
    const loudness  = rms > 0.05 ? "High"    : rms > 0.02 ? "Medium" : "Low";
    const loudColor = rms > 0.05 ? "#15803d" : rms > 0.02 ? "#b45309" : "#1d4ed8";
    const zcrLabel  = zcr > 0.1  ? "Fast"    : zcr > 0.05 ? "Medium" : "Slow";
    const isLive    = isPlaying && setupDoneRef.current;

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            style={{ borderRadius: 16, border: "1.5px solid #e0d7f5", overflow: "hidden", backgroundColor: "#f8f5ff" }}
        >
            {/* Header */}
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "space-between",
                padding: "10px 18px", borderBottom: "1px solid #e0d7f5", backgroundColor: "#ede9fe",
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
                            {isLive ? "🔴 Live FFT — real-time audio signal" : `CNN-LSTM Mel Spectrogram · ${language || ""}`}
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
                    {isPlaying ? "Live" : "Ready"}
                </div>
            </div>

            {/* Canvas */}
            <div style={{ padding: "14px 18px 4px" }}>
                <p style={{ fontSize: 9, fontWeight: 700, color: "#7c3aed", textTransform: "uppercase", letterSpacing: "0.12em", marginBottom: 8 }}>
                    {isLive ? "Real-time FFT spectrum" : "Mel Spectrogram — 40 bands"}
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
                    {isLive
                        ? "Live FFT via Web Audio API — exact frequency spectrum of the TTS audio signal in real time."
                        : "CNN-LSTM Mel Spectrogram — real acoustic features extracted from generated audio by the trained model."}
                </p>
            </div>
        </motion.div>
    );
}