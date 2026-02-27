import { useState, useRef, useEffect } from "react";

const API = import.meta.env.VITE_API_URL + "/api/tts";

const LANGUAGE_META = {
    hindi: { label: "Hindi", flag: "🇮🇳", code: "hi" },
    english: { label: "English", flag: "🇬🇧", code: "en" },
    tamil: { label: "Tamil", flag: "🏛️", code: "ta" },
    telugu: { label: "Telugu", flag: "🌸", code: "te" },
    malayalam: { label: "Malayalam", flag: "🌴", code: "ml" },
    bengali: { label: "Bengali", flag: "🎨", code: "bn" },
};

const MOODS = [
    { key: "neutral", icon: "😐", label: "Neutral" },
    { key: "happy", icon: "😄", label: "Happy" },
    { key: "sad", icon: "😢", label: "Sad" },
    { key: "angry", icon: "😠", label: "Angry" },
];

export default function TTSPage() {
    const [text, setText] = useState("");
    const [language, setLanguage] = useState("hindi");
    const [gender, setGender] = useState("male");
    const [mood, setMood] = useState("neutral");
    const [loading, setLoading] = useState(false);
    const [audioURL, setAudioURL] = useState(null);
    const [error, setError] = useState(null);
    const [serverOnline, setServerOnline] = useState(null);
    const [history, setHistory] = useState([]);
    const [showHistory, setShowHistory] = useState(false);

    const audioRef = useRef(null);

    // Check server status on load
    useEffect(() => {
        fetch(`${API}/status`)
            .then(r => r.json())
            .then(d => setServerOnline(d.online))
            .catch(() => setServerOnline(false));
    }, []);

    const voiceKey = `${language}_${gender}`;

    const handleGenerate = async () => {
        if (!text.trim()) return;
        setLoading(true);
        setError(null);
        setAudioURL(null);

        try {
            const res = await fetch(`${API}/generate`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    text,
                    voice_key: voiceKey,
                    mood,
                    language: LANGUAGE_META[language].code,
                    save_history: true,
                }),
            });
            const data = await res.json();
            if (!res.ok) throw new Error(data.error || "Generation failed");
            setAudioURL(data.audio_url);
            setTimeout(() => audioRef.current?.play(), 200);
        } catch (e) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = () => {
        if (!audioURL) return;
        const a = document.createElement("a");
        a.href = audioURL;
        a.download = `tts_${Date.now()}.mp3`;
        a.click();
    };

    const fetchHistory = async () => {
        try {
            const res = await fetch(`${API}/history?limit=10`);
            const data = await res.json();
            setHistory(data.history ?? []);
        } catch { }
    };

    return (
        <div style={S.page}>

            {/* Header */}
            <header style={S.header}>
                <div style={S.headerInner}>
                    <div style={S.logo}>
                        <span style={S.logoIcon}>🔊</span>
                        <span style={S.logoText}>SmartTTS</span>
                    </div>
                    <div style={S.statusPill}>
                        <span style={{
                            ...S.statusDot,
                            background: serverOnline === null ? "#888" : serverOnline ? "#22c55e" : "#ef4444"
                        }} />
                        {serverOnline === null ? "Checking…" : serverOnline ? "Server Online" : "Server Offline"}
                    </div>
                </div>
            </header>

            <main style={S.main}>
                <div style={S.card}>

                    {/* Text Input */}
                    <section style={S.section}>
                        <label style={S.label}>Your Text</label>
                        <div style={{ position: "relative" }}>
                            <textarea
                                style={S.textarea}
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder="Type your text here… (max 5000 characters)"
                                maxLength={5000}
                                rows={5}
                            />
                            <span style={{
                                ...S.charCount,
                                color: text.length > 4800 ? "#ef4444" : "#888"
                            }}>
                                {text.length} / 5000
                            </span>
                        </div>
                    </section>

                    {/* Language */}
                    <section style={S.section}>
                        <label style={S.label}>Language</label>
                        <div style={S.chipRow}>
                            {Object.entries(LANGUAGE_META).map(([key, { label, flag }]) => (
                                <button
                                    key={key}
                                    style={{ ...S.chip, ...(language === key ? S.chipActive : {}) }}
                                    onClick={() => setLanguage(key)}
                                >
                                    {flag} {label}
                                </button>
                            ))}
                        </div>
                    </section>

                    {/* Gender + Mood */}
                    <div style={S.twoCol}>
                        <section style={S.section}>
                            <label style={S.label}>Gender</label>
                            <div style={S.chipRow}>
                                {["male", "female"].map(g => (
                                    <button
                                        key={g}
                                        style={{ ...S.chip, ...(gender === g ? S.chipActive : {}) }}
                                        onClick={() => setGender(g)}
                                    >
                                        {g === "male" ? "♂ Male" : "♀ Female"}
                                    </button>
                                ))}
                            </div>
                        </section>

                        <section style={S.section}>
                            <label style={S.label}>Mood</label>
                            <div style={S.chipRow}>
                                {MOODS.map(m => (
                                    <button
                                        key={m.key}
                                        style={{ ...S.chip, ...(mood === m.key ? S.chipActive : {}) }}
                                        onClick={() => setMood(m.key)}
                                    >
                                        {m.icon} {m.label}
                                    </button>
                                ))}
                            </div>
                        </section>
                    </div>

                    {/* Error */}
                    {error && <div style={S.errorBox}>⚠️ {error}</div>}

                    {/* Generate Button */}
                    <button
                        style={{
                            ...S.generateBtn,
                            opacity: (loading || !text.trim()) ? 0.6 : 1,
                            cursor: (loading || !text.trim()) ? "not-allowed" : "pointer",
                        }}
                        onClick={handleGenerate}
                        disabled={loading || !text.trim()}
                    >
                        {loading ? "⏳ Generating…" : "🎙️ Generate Speech"}
                    </button>

                    {/* Audio Player */}
                    {audioURL && (
                        <div style={S.playerWrap}>
                            <div style={S.playerHeader}>
                                <span style={{ color: "#22c55e", fontSize: 13 }}>✅ Ready!</span>
                                <button style={S.dlBtn} onClick={handleDownload}>⬇ Download</button>
                            </div>
                            <audio ref={audioRef} controls src={audioURL} style={{ width: "100%" }} />
                        </div>
                    )}

                </div>

                {/* History */}
                <div style={{ marginTop: 24 }}>
                    <button
                        style={S.historyBtn}
                        onClick={() => { fetchHistory(); setShowHistory(v => !v); }}
                    >
                        {showHistory ? "▲ Hide History" : "▼ Show Recent History"}
                    </button>

                    {showHistory && (
                        <div style={S.historyList}>
                            {history.length === 0
                                ? <p style={{ color: "#888", textAlign: "center" }}>No history yet.</p>
                                : history.map(h => (
                                    <div key={h.id} style={S.historyItem}>
                                        <div style={S.historyMeta}>
                                            <span style={S.badge}>{h.voice_key}</span>
                                            <span style={S.badge}>{h.mood}</span>
                                            <span style={{ fontSize: 11, color: "#555", marginLeft: "auto" }}>
                                                {new Date(h.created_at).toLocaleString()}
                                            </span>
                                        </div>
                                        <p style={{ fontSize: 13, color: "#666", margin: "6px 0 0" }}>
                                            {h.text?.substring(0, 100)}…
                                        </p>
                                        {h.audio_url && (
                                            <audio controls src={h.audio_url} style={{ width: "100%", marginTop: 8 }} />
                                        )}
                                    </div>
                                ))
                            }
                        </div>
                    )}
                </div>

            </main>
        </div>
    );
}

// ── Styles ────────────────────────────────────────────
const S = {
    page: {
        minHeight: "100vh",
        background: "#0d0d0f",
        color: "#e8e4dc",
        fontFamily: "'DM Sans', sans-serif",
    },
    header: {
        position: "sticky", top: 0, zIndex: 10,
        background: "rgba(13,13,15,0.9)",
        backdropFilter: "blur(16px)",
        borderBottom: "1px solid #222",
    },
    headerInner: {
        maxWidth: 720, margin: "0 auto",
        padding: "14px 24px",
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    logo: { display: "flex", alignItems: "center", gap: 10 },
    logoIcon: { fontSize: 24 },
    logoText: {
        fontSize: 20, fontWeight: 700,
        background: "linear-gradient(135deg, #a5b4fc, #6366f1)",
        WebkitBackgroundClip: "text", WebkitTextFillColor: "transparent",
    },
    statusPill: {
        display: "flex", alignItems: "center", gap: 6,
        fontSize: 12, padding: "5px 12px", borderRadius: 20,
        background: "#1a1a1e", border: "1px solid #2a2a2e", color: "#aaa",
    },
    statusDot: { width: 8, height: 8, borderRadius: "50%", flexShrink: 0 },
    main: { maxWidth: 720, margin: "0 auto", padding: "36px 24px 80px" },
    card: {
        background: "#141416", border: "1px solid #222",
        borderRadius: 20, padding: 28,
        display: "flex", flexDirection: "column", gap: 24,
        boxShadow: "0 24px 80px rgba(0,0,0,0.5)",
    },
    section: { display: "flex", flexDirection: "column", gap: 10 },
    label: {
        fontSize: 11, fontWeight: 600,
        letterSpacing: "0.12em", textTransform: "uppercase", color: "#888",
    },
    textarea: {
        width: "100%", minHeight: 120,
        background: "#0d0d0f", border: "1px solid #2a2a2e",
        borderRadius: 12, color: "#e8e4dc",
        fontSize: 15, lineHeight: 1.6,
        padding: "12px 14px", resize: "vertical",
        fontFamily: "inherit", outline: "none", boxSizing: "border-box",
    },
    charCount: {
        position: "absolute", bottom: 8, right: 12,
        fontSize: 11, pointerEvents: "none",
    },
    chipRow: { display: "flex", flexWrap: "wrap", gap: 8 },
    chip: {
        padding: "7px 14px", borderRadius: 100,
        border: "1px solid #2a2a2e", background: "#1a1a1e",
        color: "#aaa", fontSize: 13, cursor: "pointer",
        fontFamily: "inherit", transition: "all 0.15s",
    },
    chipActive: {
        background: "#6366f1", border: "1px solid #6366f1",
        color: "#fff", boxShadow: "0 0 20px #6366f140",
    },
    twoCol: { display: "grid", gridTemplateColumns: "1fr 1fr", gap: 20 },
    errorBox: {
        background: "#2a1215", border: "1px solid #4a2020",
        borderRadius: 10, padding: "12px 16px",
        fontSize: 13, color: "#f87171",
    },
    generateBtn: {
        width: "100%", padding: "15px 24px", borderRadius: 12,
        border: "none",
        background: "linear-gradient(135deg, #6366f1, #818cf8)",
        color: "#fff", fontSize: 16, fontWeight: 600,
        fontFamily: "inherit", transition: "opacity 0.15s",
        boxShadow: "0 8px 32px #6366f130",
    },
    playerWrap: {
        background: "#0d0d0f", border: "1px solid #2a2a2e",
        borderRadius: 14, padding: 16,
        display: "flex", flexDirection: "column", gap: 10,
    },
    playerHeader: {
        display: "flex", alignItems: "center", justifyContent: "space-between",
    },
    dlBtn: {
        padding: "6px 14px", borderRadius: 8,
        border: "1px solid #2a2a2e", background: "#1a1a1e",
        color: "#aaa", fontSize: 12, cursor: "pointer", fontFamily: "inherit",
    },
    historyBtn: {
        width: "100%", padding: 12, borderRadius: 10,
        border: "1px solid #222", background: "#141416",
        color: "#666", fontSize: 13, cursor: "pointer",
        fontFamily: "inherit", marginBottom: 12,
    },
    historyList: { display: "flex", flexDirection: "column", gap: 10 },
    historyItem: {
        background: "#141416", border: "1px solid #222",
        borderRadius: 12, padding: "14px 16px",
    },
    historyMeta: {
        display: "flex", gap: 8, alignItems: "center",
        marginBottom: 4, flexWrap: "wrap",
    },
    badge: {
        fontSize: 11, padding: "2px 8px", borderRadius: 100,
        background: "#1a1a2e", color: "#818cf8", fontWeight: 600,
    },
};