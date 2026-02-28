import React, { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence, useScroll, useTransform } from "framer-motion";
import { Mic, Play, Pause, Download, X, Check, Volume2, History, RefreshCw } from "lucide-react";

// ─── Config ───────────────────────────────────────────────────────────────────
const API = "https://kartavya11-smart-tts-api.hf.space";

const HEADERS = {
    "Content-Type": "application/json",
};

const LANGUAGES = [
    { id: "hindi",     flag: "🇮🇳", name: "Hindi",     script: "हिंदी",    code: "hi" },
    { id: "english",   flag: "🌍",  name: "English",   script: "English",  code: "en" },
    { id: "tamil",     flag: "🏛️",  name: "Tamil",     script: "தமிழ்",   code: "ta" },
    { id: "telugu",    flag: "🌅",  name: "Telugu",    script: "తెలుగు",  code: "te" },
    { id: "malayalam", flag: "🌴",  name: "Malayalam", script: "മലയാളം", code: "ml" },
    { id: "bengali",   flag: "🎨",  name: "Bengali",   script: "বাংলা",   code: "bn" },
];

const MOODS = [
    { id: "neutral", emoji: "😐", name: "Neutral", desc: "Balanced & Clear",   hex: "#FFFFFF" },
    { id: "happy",   emoji: "😊", name: "Happy",   desc: "Bright & Energetic", hex: "#F59E0B" },
    { id: "sad",     emoji: "😔", name: "Sad",     desc: "Soft & Gentle",      hex: "#3B82F6" },
    { id: "angry",   emoji: "😠", name: "Angry",   desc: "Bold & Intense",     hex: "#EF4444" },
];

const PLACEHOLDERS = [
    "नमस्ते दुनिया...",
    "Hello, world...",
    "வணக்கம் உலகம்...",
    "হ্যালো বিশ্ব...",
    "నమస్కారం ప్రపంచం...",
    "നമസ്കാരം ലോകം...",
];

// ─── Main Component ───────────────────────────────────────────────────────────
const SmartTTS = () => {
    const [isScrolled,         setIsScrolled]         = useState(false);
    const [placeholderIdx,     setPlaceholderIdx]     = useState(0);
    const [serverOnline,       setServerOnline]       = useState(null);
    const [showHistory,        setShowHistory]        = useState(false);

    const [text,               setText]               = useState("");
    const [activeLang,         setActiveLang]         = useState("hindi");
    const [activeGender,       setActiveGender]       = useState("female");
    const [activeMood,         setActiveMood]         = useState("neutral");

    const [isGenerating,       setIsGenerating]       = useState(false);
    const [generationSuccess,  setGenerationSuccess]  = useState(false);
    const [error,              setError]              = useState(null);

    const [showPlayer,         setShowPlayer]         = useState(false);
    const [isPlaying,          setIsPlaying]          = useState(false);
    const [audioURL,           setAudioURL]           = useState(null);
    const [progress,           setProgress]           = useState(0);
    const [duration,           setDuration]           = useState(0);
    const [currentTime,        setCurrentTime]        = useState(0);

    const [history,            setHistory]            = useState([]);

    const audioRef    = useRef(null);
    const { scrollY } = useScroll();
    const heroOpacity = useTransform(scrollY, [0, 400], [1, 0]);
    const heroY       = useTransform(scrollY, [0, 400], [0, 100]);

    // ── Effects ──────────────────────────────────────────────────────────────
    useEffect(() => {
        const handleScroll = () => setIsScrolled(window.scrollY > 20);
        window.addEventListener("scroll", handleScroll);
        return () => window.removeEventListener("scroll", handleScroll);
    }, []);

    useEffect(() => {
        const interval = setInterval(
            () => setPlaceholderIdx(p => (p + 1) % PLACEHOLDERS.length),
            3000
        );
        return () => clearInterval(interval);
    }, []);

    // Check server status
    useEffect(() => {
        fetch(`${API}/`, { headers: HEADERS })
            .then(r => r.json())
            .then(d => setServerOnline(d.status === "running" || !!d.status))
            .catch(() => setServerOnline(false));
    }, []);

    // Audio event listeners
    useEffect(() => {
        const audio = audioRef.current;
        if (!audio) return;
        const onTime = () => {
            setCurrentTime(audio.currentTime);
            setProgress(audio.duration ? (audio.currentTime / audio.duration) * 100 : 0);
        };
        const onLoad  = () => setDuration(audio.duration);
        const onEnd   = () => { setIsPlaying(false); setProgress(0); setCurrentTime(0); };
        audio.addEventListener("timeupdate",     onTime);
        audio.addEventListener("loadedmetadata", onLoad);
        audio.addEventListener("ended",          onEnd);
        return () => {
            audio.removeEventListener("timeupdate",     onTime);
            audio.removeEventListener("loadedmetadata", onLoad);
            audio.removeEventListener("ended",          onEnd);
        };
    }, [audioURL]);

    // ── Helpers ───────────────────────────────────────────────────────────────
    const formatTime = (s) => {
        if (!s || isNaN(s)) return "0:00";
        const m   = Math.floor(s / 60);
        const sec = Math.floor(s % 60).toString().padStart(2, "0");
        return `${m}:${sec}`;
    };

    const togglePlay = () => {
        const audio = audioRef.current;
        if (!audio) return;
        if (isPlaying) { audio.pause(); setIsPlaying(false); }
        else           { audio.play();  setIsPlaying(true);  }
    };

    const handleDownload = () => {
        if (!audioURL) return;
        const a    = document.createElement("a");
        a.href     = audioURL;
        a.download = `SmartTTS_${activeLang}_${activeMood}_${Date.now()}.mp3`;
        a.click();
    };

    const fetchHistory = async () => {
        try {
            const res  = await fetch(`${API}/history?limit=10`, { headers: HEADERS });
            const data = await res.json();
            setHistory(data.history ?? []);
        } catch { }
    };

    // ── Generate ──────────────────────────────────────────────────────────────
    const handleGenerate = async () => {
        if (!text.trim() || isGenerating) return;
        setIsGenerating(true);
        setError(null);
        setShowPlayer(false);

        try {
            const res = await fetch(`${API}/generate`, {
                method:  "POST",
                headers: HEADERS,
                body:    JSON.stringify({
                    text,
                    voice_key: `${activeLang}_${activeGender}`,
                    mood:       activeMood,
                }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.detail || data.error || "Generation failed");

            // Fix audio URL - prepend API base URL
            const fullAudioURL = API + data.audio_url;
            setAudioURL(fullAudioURL);

            setIsGenerating(false);
            setGenerationSuccess(true);

            setTimeout(() => {
                setGenerationSuccess(false);
                setShowPlayer(true);
                setTimeout(() => {
                    audioRef.current?.play();
                    setIsPlaying(true);
                }, 300);
            }, 800);

        } catch (e) {
            setIsGenerating(false);
            setError(e.message);
        }
    };

    // ── Render ────────────────────────────────────────────────────────────────
    return (
        <div className="min-h-screen w-full overflow-hidden bg-[#080808] text-white font-sans selection:bg-[#7C3AED]/30">

            {/* Hidden audio element */}
            <audio ref={audioRef} src={audioURL || ""} />

            {/* ── Background ─────────────────────────────────────────────────── */}
            <div className="fixed inset-0 z-0 pointer-events-none overflow-hidden">
                <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] rounded-full bg-[#7C3AED]/10 blur-[120px] animate-pulse" />
                <div className="absolute top-[20%] right-[-10%] w-[35%] h-[35%] rounded-full bg-[#06B6D4]/10 blur-[120px] animate-pulse" style={{ animationDelay: "1s" }} />
                <div className="absolute bottom-[-10%] left-[30%] w-[30%] h-[30%] rounded-full bg-[#7C3AED]/5 blur-[120px] animate-pulse" style={{ animationDelay: "2s" }} />
                <div className="absolute inset-0 opacity-[0.03]" style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='n'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.8'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23n)'/%3E%3C/svg%3E")` }} />
                <div className="absolute inset-0 bg-[linear-gradient(rgba(255,255,255,0.02)_1px,transparent_1px),linear-gradient(90deg,rgba(255,255,255,0.02)_1px,transparent_1px)] bg-[size:100px_100px] [mask-image:radial-gradient(ellipse_at_center,black_40%,transparent_80%)]" />
            </div>

            {/* ── Navigation ─────────────────────────────────────────────────── */}
            <nav className={`fixed top-6 left-1/2 -translate-x-1/2 z-40 transition-all duration-500 flex items-center justify-between px-6 py-4 rounded-full border border-white/10 bg-white/5 backdrop-blur-xl ${isScrolled ? "w-[90%] max-w-2xl" : "w-[95%] max-w-4xl"}`}>
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
                        <Volume2 className="w-4 h-4 text-white" />
                    </div>
                    <span className="font-bold text-lg tracking-tight">SmartTTS</span>
                </div>

                <div className="hidden md:flex items-center gap-8 text-sm text-white/60">
                    <a href="#interface" className="hover:text-white transition-colors">Studio</a>
                    <button
                        onClick={() => { fetchHistory(); setShowHistory(v => !v); }}
                        className="hover:text-white transition-colors flex items-center gap-1"
                    >
                        <History size={14} /> History
                    </button>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-2 text-xs px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
                        <span className={`w-2 h-2 rounded-full ${serverOnline === null ? "bg-gray-400 animate-pulse" : serverOnline ? "bg-green-400 animate-pulse" : "bg-red-400"}`} />
                        <span className="text-white/60 hidden sm:block">
                            {serverOnline === null ? "Checking…" : serverOnline ? "AI Online" : "Offline"}
                        </span>
                    </div>
                    <button className="px-5 py-2 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] text-white text-sm font-bold shadow-lg shadow-[#7C3AED]/20 hover:scale-105 active:scale-95 transition-all">
                        Try Now
                    </button>
                </div>
            </nav>

            {/* ── Hero ───────────────────────────────────────────────────────── */}
            <motion.section
                className="relative h-screen flex flex-col items-center justify-center pt-20 px-4 text-center z-10"
                style={{ opacity: heroOpacity, y: heroY }}
            >
                <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.8 }}>
                    <h1 className="text-6xl md:text-[8rem] font-black leading-[0.9] tracking-tighter">
                        <span className="block text-white">SPEAK IN</span>
                        <span className="block bg-clip-text text-transparent bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]">
                            EVERY VOICE
                        </span>
                    </h1>
                    <p className="mt-8 text-xl md:text-2xl text-white/40 font-light max-w-2xl mx-auto">
                        The Voice of Intelligent India. Premium, emotional, human-like text-to-speech in 6 Indian languages.
                    </p>
                    <motion.a
                        href="#interface"
                        className="inline-flex items-center gap-2 mt-10 px-8 py-4 rounded-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] text-white font-bold text-lg shadow-2xl shadow-[#7C3AED]/30 hover:scale-105 active:scale-95 transition-all"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        <Mic size={20} /> Start Speaking
                    </motion.a>
                </motion.div>

                <div className="absolute inset-0 flex items-center justify-center gap-1 opacity-10 pointer-events-none -z-10">
                    {[...Array(50)].map((_, i) => (
                        <motion.div
                            key={i}
                            className="w-1.5 bg-gradient-to-b from-[#7C3AED] to-[#06B6D4] rounded-full"
                            animate={{ height: [20, Math.random() * 200 + 40, 20] }}
                            transition={{ duration: Math.random() * 1.5 + 0.8, repeat: Infinity, ease: "easeInOut", delay: Math.random() * 2 }}
                        />
                    ))}
                </div>

                <motion.div
                    className="absolute bottom-10 left-1/2 -translate-x-1/2 flex flex-col items-center gap-2 text-white/30 text-xs"
                    animate={{ y: [0, 8, 0] }}
                    transition={{ duration: 2, repeat: Infinity }}
                >
                    <span>Scroll to Studio</span>
                    <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
                </motion.div>
            </motion.section>

            {/* ── Interface Card ─────────────────────────────────────────────── */}
            <section id="interface" className="relative z-10 px-4 pb-40">
                <motion.div
                    initial={{ opacity: 0, y: 60 }}
                    whileInView={{ opacity: 1, y: 0 }}
                    viewport={{ once: true }}
                    transition={{ duration: 0.8 }}
                    className="max-w-3xl mx-auto"
                >
                    <div className="h-px w-full bg-gradient-to-r from-transparent via-[#7C3AED] to-transparent mb-0 rounded-t-[32px]" />

                    <div className="bg-white/[0.03] backdrop-blur-3xl border border-white/10 rounded-[32px] p-6 md:p-12 shadow-2xl">

                        <div className="flex items-center justify-between mb-8">
                            <div>
                                <h2 className="text-2xl font-black tracking-tight">Voice Studio</h2>
                                <p className="text-white/40 text-sm mt-1">Craft your perfect voice</p>
                            </div>
                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center">
                                <Mic size={18} className="text-white" />
                            </div>
                        </div>

                        {/* ── Text Input ─────────────────────────────────────────── */}
                        <div className="relative group mb-10">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-[22px] blur opacity-0 group-focus-within:opacity-30 transition duration-500" />
                            <textarea
                                value={text}
                                onChange={e => setText(e.target.value)}
                                placeholder={PLACEHOLDERS[placeholderIdx]}
                                maxLength={5000}
                                className="relative w-full h-44 bg-black/40 border border-white/5 rounded-[20px] p-6 text-white text-lg placeholder:text-white/20 focus:outline-none resize-none transition-all leading-relaxed focus:border-[#7C3AED]/40"
                            />
                            <div className={`absolute bottom-4 right-5 text-xs font-mono ${text.length > 4800 ? "text-red-400" : "text-white/30"}`}>
                                {text.length} / 5000
                            </div>
                        </div>

                        <div className="space-y-10">

                            {/* ── Language ───────────────────────────────────────────── */}
                            <div>
                                <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-4">
                                    Select Language
                                </span>
                                <div className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide">
                                    {LANGUAGES.map(lang => (
                                        <motion.button
                                            key={lang.id}
                                            onClick={() => setActiveLang(lang.id)}
                                            whileHover={{ scale: 1.05 }}
                                            whileTap={{ scale: 0.95 }}
                                            className={`flex flex-col items-center justify-center shrink-0 w-24 h-24 rounded-2xl border transition-all duration-300 ${activeLang === lang.id
                                                ? "bg-[#7C3AED]/20 border-[#7C3AED] shadow-lg shadow-[#7C3AED]/20"
                                                : "bg-white/5 border-white/5 hover:bg-white/10 hover:border-white/10"
                                            }`}
                                        >
                                            <span className="text-3xl mb-1">{lang.flag}</span>
                                            <span className="text-xs font-bold">{lang.name}</span>
                                            <span className="text-[10px] opacity-40">{lang.script}</span>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>

                            {/* ── Gender + Mood ──────────────────────────────────────── */}
                            <div className="flex flex-col md:flex-row gap-8">

                                {/* Gender */}
                                <div className="flex-1">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-4">
                                        Voice Type
                                    </span>
                                    <div className="bg-black/40 border border-white/5 p-1 rounded-2xl flex relative">
                                        <motion.div
                                            className="absolute top-1 bottom-1 w-[calc(50%-4px)] bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] rounded-xl shadow-lg"
                                            animate={{ left: activeGender === "male" ? "4px" : "50%" }}
                                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                                        />
                                        {["male", "female"].map(g => (
                                            <button
                                                key={g}
                                                onClick={() => setActiveGender(g)}
                                                className={`relative z-10 flex-1 py-3 text-sm font-bold transition-colors ${activeGender === g ? "text-white" : "text-white/40"}`}
                                            >
                                                {g === "male" ? "♂ Male" : "♀ Female"}
                                            </button>
                                        ))}
                                    </div>
                                </div>

                                {/* Mood */}
                                <div className="flex-[2]">
                                    <span className="text-[10px] uppercase tracking-[0.2em] text-white/40 font-bold block mb-4">
                                        Emotion & Tone
                                    </span>
                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                                        {MOODS.map(mood => (
                                            <motion.button
                                                key={mood.id}
                                                onClick={() => setActiveMood(mood.id)}
                                                whileHover={{ scale: 1.05 }}
                                                whileTap={{ scale: 0.95 }}
                                                className="flex flex-col p-3 rounded-2xl border transition-all duration-200"
                                                style={{
                                                    background:   activeMood === mood.id ? `${mood.hex}15` : "rgba(255,255,255,0.03)",
                                                    borderColor:  activeMood === mood.id ? mood.hex : "transparent",
                                                    boxShadow:    activeMood === mood.id ? `0 0 20px ${mood.hex}25` : "none",
                                                }}
                                            >
                                                <span className="text-2xl mb-1">{mood.emoji}</span>
                                                <span className="text-xs font-bold">{mood.name}</span>
                                                <span className="text-[10px] text-white/40">{mood.desc}</span>
                                            </motion.button>
                                        ))}
                                    </div>
                                </div>
                            </div>

                            {/* ── Error ──────────────────────────────────────────────── */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        initial={{ opacity: 0, y: -10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        exit={{ opacity: 0 }}
                                        className="flex items-center gap-3 p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-400 text-sm"
                                    >
                                        <X size={16} className="shrink-0" />
                                        {error}
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* ── Generate Button ────────────────────────────────────── */}
                            <motion.button
                                onClick={handleGenerate}
                                disabled={isGenerating || !text.trim()}
                                whileHover={!isGenerating && text.trim() ? { scale: 1.02 } : {}}
                                whileTap={!isGenerating && text.trim() ? { scale: 0.98 } : {}}
                                className={`w-full h-16 rounded-2xl relative overflow-hidden transition-all duration-300 font-bold text-lg ${!text.trim() || isGenerating ? "opacity-50 cursor-not-allowed" : ""}`}
                            >
                                <div className="absolute inset-0 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4]" />
                                <div className="relative z-10 flex items-center justify-center gap-3">
                                    {isGenerating ? (
                                        <span className="flex items-center gap-3">
                                            <RefreshCw size={20} className="animate-spin" />
                                            Generating your voice…
                                        </span>
                                    ) : generationSuccess ? (
                                        <span className="flex items-center gap-3">
                                            <Check size={20} /> Voice Ready!
                                        </span>
                                    ) : (
                                        <span className="flex items-center gap-3">
                                            <Mic size={20} /> Generate Speech
                                        </span>
                                    )}
                                </div>
                                {isGenerating && (
                                    <motion.div
                                        className="absolute bottom-0 left-0 h-1 bg-white/40"
                                        initial={{ width: "0%" }}
                                        animate={{ width: "100%" }}
                                        transition={{ duration: 8, ease: "linear" }}
                                    />
                                )}
                            </motion.button>

                        </div>
                    </div>
                </motion.div>

                {/* ── History Panel ──────────────────────────────────────────── */}
                <AnimatePresence>
                    {showHistory && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: 20 }}
                            className="max-w-3xl mx-auto mt-6 bg-white/[0.03] backdrop-blur-xl border border-white/10 rounded-[24px] p-6"
                        >
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="font-bold text-white/80 uppercase tracking-widest text-xs">Recent Generations</h3>
                                <button onClick={() => setShowHistory(false)} className="text-white/40 hover:text-white"><X size={16} /></button>
                            </div>
                            {history.length === 0 ? (
                                <p className="text-center text-white/30 py-8 text-sm">No history yet. Generate your first voice!</p>
                            ) : (
                                <div className="space-y-3">
                                    {history.map(h => (
                                        <div key={h.id} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 hover:bg-white/8 transition-colors">
                                            <div className="flex gap-2 shrink-0">
                                                <span className="px-2 py-1 rounded-full bg-[#7C3AED]/20 border border-[#7C3AED]/30 text-[10px] text-[#a78bfa] font-bold uppercase">{h.voice_key}</span>
                                                <span className="px-2 py-1 rounded-full bg-white/5 border border-white/10 text-[10px] text-white/60 font-bold uppercase">{h.mood}</span>
                                            </div>
                                            <p className="flex-1 text-sm text-white/50 truncate">{h.text}</p>
                                            <span className="text-[10px] font-mono text-white/30 shrink-0">{new Date(h.created_at).toLocaleTimeString()}</span>
                                            {h.audio_url && (
                                                <a href={h.audio_url} download className="p-2 rounded-full bg-white/5 hover:bg-white/10 transition-colors">
                                                    <Download size={14} className="text-white/60" />
                                                </a>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </motion.div>
                    )}
                </AnimatePresence>
            </section>

            {/* ── Floating Audio Player ──────────────────────────────────────── */}
            <AnimatePresence>
                {showPlayer && audioURL && (
                    <motion.div
                        initial={{ y: 120, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        exit={{ y: 120, opacity: 0 }}
                        transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        className="fixed bottom-8 left-1/2 -translate-x-1/2 w-[92%] max-w-2xl z-50"
                    >
                        <div className="absolute -inset-1 bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-[28px] blur-xl opacity-20" />
                        <div className="relative bg-[#0d0d0f]/90 backdrop-blur-2xl border border-white/15 rounded-3xl p-5 shadow-2xl">
                            <div className="flex items-center gap-4">

                                {/* Play button */}
                                <motion.button
                                    onClick={togglePlay}
                                    whileHover={{ scale: 1.1 }}
                                    whileTap={{ scale: 0.9 }}
                                    className="w-14 h-14 shrink-0 rounded-full bg-gradient-to-br from-[#7C3AED] to-[#06B6D4] flex items-center justify-center shadow-xl shadow-[#7C3AED]/30"
                                >
                                    {isPlaying
                                        ? <Pause size={20} className="text-white" />
                                        : <Play  size={20} className="text-white ml-1" />
                                    }
                                </motion.button>

                                {/* Progress */}
                                <div className="flex-1 flex flex-col gap-2">
                                    <div className="flex justify-between items-center">
                                        <div className="flex gap-2">
                                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">
                                                {LANGUAGES.find(l => l.id === activeLang)?.name}
                                            </span>
                                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">·</span>
                                            <span className="text-[10px] uppercase tracking-widest text-white/40 font-mono">{activeMood}</span>
                                        </div>
                                        <span className="text-[10px] font-mono text-white/40">
                                            {formatTime(currentTime)} / {formatTime(duration)}
                                        </span>
                                    </div>
                                    <div className="h-1.5 bg-white/10 rounded-full overflow-hidden cursor-pointer">
                                        <motion.div
                                            className="h-full bg-gradient-to-r from-[#7C3AED] to-[#06B6D4] rounded-full"
                                            style={{ width: `${progress}%` }}
                                            transition={{ duration: 0.1 }}
                                        />
                                    </div>
                                    <div className="flex items-center gap-0.5 h-4">
                                        {[...Array(32)].map((_, i) => (
                                            <motion.div
                                                key={i}
                                                className="flex-1 bg-gradient-to-b from-[#7C3AED] to-[#06B6D4] rounded-full opacity-60"
                                                animate={isPlaying
                                                    ? { height: [`${Math.random() * 60 + 20}%`, `${Math.random() * 60 + 20}%`] }
                                                    : { height: "30%" }
                                                }
                                                transition={{ duration: 0.4, repeat: Infinity, repeatType: "reverse", delay: i * 0.02 }}
                                            />
                                        ))}
                                    </div>
                                </div>

                                {/* Actions */}
                                <div className="flex items-center gap-2 shrink-0">
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={handleDownload}
                                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                    >
                                        <Download size={16} className="text-white/70" />
                                    </motion.button>
                                    <motion.button
                                        whileHover={{ scale: 1.1 }} whileTap={{ scale: 0.9 }}
                                        onClick={() => { setShowPlayer(false); setIsPlaying(false); audioRef.current?.pause(); }}
                                        className="p-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 transition-colors"
                                    >
                                        <X size={16} className="text-white/70" />
                                    </motion.button>
                                </div>

                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

        </div>
    );
};

export default SmartTTS;