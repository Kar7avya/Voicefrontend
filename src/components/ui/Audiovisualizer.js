import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";

export default function AudioVisualizer({ audioFeatures, isPlaying, language }) {
    const [bars, setBars] = useState([]);

    useEffect(() => {
        if (!audioFeatures) { setBars([]); return; }

        const { mfcc = [], mel = [] } = audioFeatures;

        // Use MEL spectrogram for bar heights — all positive values, better visual spread
        // MFCC goes negative which collapses the range when using abs()
        // Mel values are always positive (energy) — gives natural waveform shape
        const melFull = mel.slice(0, 40);

        // Normalize mel to 0–1
        const melMin = Math.min(...melFull);
        const melMax = Math.max(...melFull) || 1;

        // Use MFCC for color only
        const mfccFull   = mfcc.slice(0, 40);
        const mfccAbsMax = Math.max(...mfccFull.map(Math.abs)) || 1;

        const built = melFull.map((melVal, i) => {
            const mfccVal    = mfccFull[i] ?? 0;
            const heightRatio = (melVal - melMin) / (melMax - melMin);
            const colorRatio  = Math.abs(mfccVal) / mfccAbsMax;

            // Height: 8% to 100% — mel gives natural tall bars
            const height = 8 + heightRatio * 92;

            // Color gradient: deep blue → violet → pink → coral
            // based on MFCC energy at that band
            const r = Math.round(80  + colorRatio * 180);
            const g = Math.round(30  + colorRatio * 20);
            const b = Math.round(220 - colorRatio * 80);

            return {
                height,
                color: `rgb(${r},${g},${b})`,
                melRaw:  melVal.toFixed(1),
                mfccRaw: mfccVal.toFixed(2),
                index: i,
            };
        });

        setBars(built);
    }, [audioFeatures]);

    if (!audioFeatures) return null;

    const { rms = 0, zcr = 0, rolloff = 0 } = audioFeatures;
    const loudness  = rms > 0.05 ? "High"    : rms > 0.02 ? "Medium" : "Low";
    const loudColor = rms > 0.05 ? "#34C759" : rms > 0.02 ? "#F59E0B": "#60a5fa";
    const zcrLabel  = zcr > 0.1  ? "Fast"    : zcr > 0.05 ? "Medium" : "Slow";

    return (
        <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="rounded-2xl border overflow-hidden"
            style={{ backgroundColor: "#0a0f1e", borderColor: "#7C3AED33" }}
        >
            {/* Header */}
            <div className="flex items-center justify-between px-5 py-3 border-b"
                style={{ borderColor: "#7C3AED22", backgroundColor: "#7C3AED08" }}>
                <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-lg flex items-center justify-center"
                        style={{ backgroundColor: "#7C3AED30" }}>
                        <span style={{ fontSize: 14 }}>📊</span>
                    </div>
                    <div>
                        <p className="text-[11px] font-bold tracking-wide" style={{ color: "#e2e8f0" }}>
                            CNN-LSTM Audio Fingerprint
                        </p>
                        <p className="text-[9px] leading-none mt-0.5" style={{ color: "#475569" }}>
                            Mel Spectrogram energy · MFCC color · {language}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[9px] font-bold"
                    style={{
                        backgroundColor: isPlaying ? "#34C75920" : "#1e293b",
                        color:           isPlaying ? "#34C759"   : "#475569",
                        border:         `1px solid ${isPlaying ? "#34C75940" : "#1e293b"}`,
                    }}>
                    <span className="w-1.5 h-1.5 rounded-full"
                        style={{ backgroundColor: isPlaying ? "#34C759" : "#475569" }} />
                    {isPlaying ? "Live" : "Ready"}
                </div>
            </div>

            {/* Bars */}
            <div className="px-5 pt-5 pb-1">
                <p className="text-[9px] uppercase tracking-widest mb-3 font-bold"
                    style={{ color: "#334155" }}>
                    Mel Spectrogram — 40 frequency bands
                </p>

                {/* Bar chart */}
                <div className="flex items-end gap-[2px]" style={{ height: 100 }}>
                    {bars.map((bar, i) => (
                        <motion.div
                            key={i}
                            className="flex-1 rounded-t-[2px]"
                            style={{ backgroundColor: bar.color, minWidth: 2 }}
                            animate={isPlaying ? {
                                height: [
                                    `${bar.height}%`,
                                    `${Math.max(8, bar.height * (0.75 + (i % 4) * 0.12))}%`,
                                    `${bar.height}%`,
                                ],
                            } : {
                                height: `${bar.height}%`,
                            }}
                            transition={isPlaying ? {
                                duration: 0.3 + (i % 7) * 0.06,
                                repeat: Infinity,
                                repeatType: "reverse",
                                ease: "easeInOut",
                            } : {
                                duration: 0.7,
                                ease: "easeOut",
                            }}
                            title={`Band ${i} · Mel=${bar.melRaw} · MFCC=${bar.mfccRaw}`}
                        />
                    ))}
                </div>

                {/* X-axis */}
                <div className="flex justify-between mt-1.5 mb-4">
                    <span className="text-[8px]" style={{ color: "#334155" }}>Low freq</span>
                    <span className="text-[8px]" style={{ color: "#334155" }}>Mid freq</span>
                    <span className="text-[8px]" style={{ color: "#334155" }}>High freq</span>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 mx-5 mb-4 rounded-xl overflow-hidden"
                style={{ border: "1px solid #1e293b" }}>

                <div className="px-3 py-2.5 text-center" style={{ backgroundColor: "#0d1424" }}>
                    <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "#334155" }}>
                        Loudness
                    </p>
                    <p className="text-sm font-bold" style={{ color: loudColor }}>{loudness}</p>
                    <p className="text-[8px] font-mono mt-0.5" style={{ color: "#1e3a5f" }}>
                        RMS {rms.toFixed(4)}
                    </p>
                </div>

                <div className="px-3 py-2.5 text-center"
                    style={{
                        backgroundColor: "#0d1424",
                        borderLeft:  "1px solid #1e293b",
                        borderRight: "1px solid #1e293b",
                    }}>
                    <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "#334155" }}>
                        Wave speed
                    </p>
                    <p className="text-sm font-bold" style={{ color: "#a78bfa" }}>{zcrLabel}</p>
                    <p className="text-[8px] font-mono mt-0.5" style={{ color: "#334155" }}>
                        ZCR {zcr.toFixed(4)}
                    </p>
                </div>

                <div className="px-3 py-2.5 text-center" style={{ backgroundColor: "#0d1424" }}>
                    <p className="text-[9px] uppercase tracking-wider mb-1" style={{ color: "#334155" }}>
                        Freq ceiling
                    </p>
                    <p className="text-sm font-bold" style={{ color: "#38bdf8" }}>
                        {(rolloff / 1000).toFixed(1)} kHz
                    </p>
                    <p className="text-[8px] font-mono mt-0.5" style={{ color: "#334155" }}>Rolloff</p>
                </div>

            </div>

            {/* Footer */}
            <div className="mx-5 mb-4 px-3 py-2.5 rounded-xl flex items-start gap-2"
                style={{ backgroundColor: "#0d1424", border: "1px solid #1e293b" }}>
                <span style={{ fontSize: 11, marginTop: 1 }}>🧠</span>
                <p className="text-[9px] leading-relaxed" style={{ color: "#475569" }}>
                    Bar height = Mel Spectrogram energy per band (always positive, natural waveform shape).
                    Bar color = MFCC coefficient intensity. Both extracted by CNN-LSTM from generated audio.
                </p>
            </div>

        </motion.div>
    );
}