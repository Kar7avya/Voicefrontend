"use client"

import React, {
  createContext, useCallback,
  useEffect, useRef, useState,
} from "react";

// ─── Groq API Key ──────────────────────────────────────────────────────────────
const GROQ_API_KEY = process.env.REACT_APP_groq_api_karthavya || "";

// ─── Emotion metadata ──────────────────────────────────────────────────────────
const EMOTION_META = {
  confident:    { emoji: "💪", color: "#3b82f6", bg: "#1e3a5f", label: "Confident"     },
  nervous:      { emoji: "😰", color: "#f59e0b", bg: "#422006", label: "Nervous"       },
  monotone:     { emoji: "😐", color: "#6b7280", bg: "#1f2937", label: "Monotone"      },
  enthusiastic: { emoji: "🔥", color: "#ef4444", bg: "#450a0a", label: "Enthusiastic"  },
  exciting:     { emoji: "⚡", color: "#a855f7", bg: "#2e1065", label: "Exciting"      },
  happy:        { emoji: "😊", color: "#22c55e", bg: "#052e16", label: "Happy"         },
  sad:          { emoji: "😢", color: "#60a5fa", bg: "#172554", label: "Sad"           },
  angry:        { emoji: "😠", color: "#f97316", bg: "#431407", label: "Angry"         },
  calm:         { emoji: "🧘", color: "#34d399", bg: "#022c22", label: "Calm"          },
  fearful:      { emoji: "😨", color: "#c084fc", bg: "#2e1065", label: "Fearful"       },
  neutral:      { emoji: "😑", color: "#9ca3af", bg: "#111827", label: "Neutral"       },
  surprised:    { emoji: "😲", color: "#fbbf24", bg: "#422006", label: "Surprised"     },
  hopeful:      { emoji: "🌟", color: "#34d399", bg: "#022c22", label: "Hopeful"       },
  sarcastic:    { emoji: "😏", color: "#a78bfa", bg: "#2e1065", label: "Sarcastic"     },
  worried:      { emoji: "😟", color: "#fb923c", bg: "#431407", label: "Worried"       },
  excited:      { emoji: "🎉", color: "#f472b6", bg: "#4a044e", label: "Excited"       },
  proud:        { emoji: "🦁", color: "#fbbf24", bg: "#422006", label: "Proud"         },
  caring:       { emoji: "🤗", color: "#34d399", bg: "#022c22", label: "Caring & Warm" },
};

// ─── Counter context ───────────────────────────────────────────────────────────
const CounterContext = createContext(undefined);
function CounterProvider({ children }) {
  const ref = useRef(0);
  const getNextIndex = useCallback(() => ref.current++, []);
  return <CounterContext.Provider value={{ getNextIndex }}>{children}</CounterContext.Provider>;
}

// ─── Groq API helper ───────────────────────────────────────────────────────────
async function callGroq(prompt, maxTokens = 1024) {
  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: maxTokens,
      temperature: 0.3,
      messages: [{ role: "user", content: prompt }],
    }),
  });

  if (!res.ok) {
    const err = await res.json().catch(() => ({}));
    throw new Error(err?.error?.message || `HTTP ${res.status}`);
  }

  const data = await res.json();
  return data.choices[0].message.content.replace(/```json|```/g, "").trim();
}

// ─── API 1: Overall emotion ────────────────────────────────────────────────────
async function detectEmotion(transcript) {
  const raw = await callGroq(
    `You are an expert emotion analyst who understands multiple Indian languages including Hindi, Tamil, Telugu, Bengali, Malayalam, Kannada, Gujarati, Punjabi, Marathi and English.

Analyse the emotional tone of this speech transcript. The text may be in ANY Indian language or English — understand the meaning regardless of language and return your analysis in English.

Transcript: "${transcript}"

Return ONLY valid JSON. No markdown, no extra text, no explanation.

{
  "primaryEmotion": "<one of: confident|nervous|monotone|enthusiastic|exciting|happy|sad|angry|calm|fearful|neutral|excited|proud|caring|worried>",
  "secondaryEmotions": ["<emotion>"],
  "overallMood": "<2-3 word phrase in English>",
  "moodScore": <number 1-10>,
  "energyLevel": "<low|medium|high>",
  "confidence": <number 0-100>,
  "keyInsight": "<one plain English sentence about the overall emotional delivery>"
}`,
    1024
  );
  return JSON.parse(raw);
}

// ─── API 2: Phrase-level breakdown ────────────────────────────────────────────
async function detectPhraseEmotions(transcript) {
  const raw = await callGroq(
    `You are an expert emotion analyst who understands multiple Indian languages including Hindi, Tamil, Telugu, Bengali, Malayalam, Kannada, Gujarati, Punjabi, Marathi and English.

The transcript below may be in ANY Indian language or English. Understand the meaning fully regardless of language.

Your job: Split the transcript into PHRASES. Each phrase carries one clear emotion. Return phrase labels in simple English that anyone can understand.

EXAMPLE 1 (Hindi):
Input: "बधाई हो, आप मैन ऑफ द मैच हैं, लेकिन आपकी टीम हार गई।"
Output:
[
  { "phrase": "बधाई हो, आप मैन ऑफ द मैच हैं", "emotion": "proud", "emoji": "🦁", "label": "Proud Moment", "translation": "Congratulations, you are the Man of the Match" },
  { "phrase": "लेकिन आपकी टीम हार गई।", "emotion": "sad", "emoji": "😢", "label": "Sorry & Sad", "translation": "But your team lost." }
]

EXAMPLE 2 (English):
Input: "I am happy to say that I have invested in your company but cannot invest more than this."
Output:
[
  { "phrase": "I am happy to say that I have invested in your company", "emotion": "happy", "emoji": "😊", "label": "Happy & Relieved", "translation": "I am happy to say that I have invested in your company" },
  { "phrase": "but cannot invest more than this.", "emotion": "sad", "emoji": "😢", "label": "Sad & Regretful", "translation": "but cannot invest more than this." }
]

Now analyse this transcript. Return ONLY a valid JSON array. No markdown, no explanation, nothing else.

Transcript: "${transcript}"

[
  {
    "phrase": "<exact phrase from transcript>",
    "translation": "<English translation of the phrase, or same text if already English>",
    "emotion": "<one of: confident|nervous|monotone|enthusiastic|exciting|happy|sad|angry|calm|fearful|neutral|surprised|hopeful|sarcastic|worried|excited|proud|caring>",
    "emoji": "<single emoji>",
    "label": "<2-4 plain English words anyone can understand>"
  }
]

Rules:
- Split at emotional turning points — words like but, however, yet, although, unfortunately, लेकिन, परंतु, ஆனால், కానీ signal a shift
- Every phrase must be EXACT text from the transcript — do not translate the phrase field
- Labels must be simple English words anyone can understand
- Always include a "translation" field with the English meaning
- Minimum 2 phrases, maximum 15 phrases`,
    4096
  );
  return JSON.parse(raw);
}

// ─── Small UI pieces ───────────────────────────────────────────────────────────
function EmotionTag({ emotion, size = "sm" }) {
  const m = EMOTION_META[emotion] ?? EMOTION_META.neutral;
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full font-medium ${
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      }`}
      style={{ backgroundColor: m.bg, color: m.color, border: `1px solid ${m.color}44` }}
    >
      {m.emoji} {m.label}
    </span>
  );
}

function MoodBar({ score }) {
  const pct = ((score - 1) / 9) * 100;
  const color = pct < 33 ? "#ef4444" : pct < 66 ? "#f59e0b" : "#22c55e";
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-1" style={{ color: "#6b7280" }}>
        <span>Negative</span>
        <span>Neutral</span>
        <span>Positive</span>
      </div>
      <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "#1f2937" }}>
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  );
}

function ConfidenceArc({ value }) {
  const r = 26;
  const circ = 2 * Math.PI * r;
  const half = circ / 2;
  const offset = half - (value / 100) * half;
  const color = value < 40 ? "#ef4444" : value < 70 ? "#f59e0b" : "#22c55e";
  return (
    <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="#1f2937" strokeWidth="5" />
        <circle
          cx="32" cy="32" r={r}
          fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${half} ${half}`}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 0.8s ease" }}
        />
      </svg>
      <div className="z-10 text-center">
        <div className="text-sm font-bold leading-none" style={{ color }}>{value}%</div>
        <div className="text-[9px]" style={{ color: "#6b7280" }}>conf.</div>
      </div>
    </div>
  );
}

function EnergyBadge({ level }) {
  const map = {
    low:    { icon: "🔋", label: "Low energy",  color: "#60a5fa" },
    medium: { icon: "⚡", label: "Mid energy",  color: "#f59e0b" },
    high:   { icon: "🚀", label: "High energy", color: "#22c55e" },
  };
  const { icon, label, color } = map[level] ?? map.medium;
  return <span className="text-[10px] font-medium" style={{ color }}>{icon} {label}</span>;
}

// ─── Phrase item ───────────────────────────────────────────────────────────────
function PhraseItem({ p, index, mode }) {
  const m = EMOTION_META[p.emotion] ?? EMOTION_META.neutral;
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), index * 120);
    return () => clearTimeout(t);
  }, [index]);

  if (!visible) return null;

  if (mode === "inline") {
    return (
      <span className="inline">
        <span
          className="rounded px-1 py-0.5 mx-0.5 text-sm font-medium"
          style={{
            backgroundColor: `${m.bg}cc`,
            color: "#f1f5f9",
            borderBottom: `2px solid ${m.color}`,
          }}
        >
          {p.phrase}
        </span>
        <span
          className="inline-flex items-center gap-1 mx-1.5 px-2 py-0.5 rounded-full text-[11px] font-bold align-middle"
          style={{
            backgroundColor: m.bg,
            color: m.color,
            border: `1px solid ${m.color}66`,
            whiteSpace: "nowrap",
          }}
        >
          {p.emoji} {p.label}
        </span>
      </span>
    );
  }

  return (
    <div
      className="flex items-center gap-3 rounded-xl px-4 py-3"
      style={{ backgroundColor: `${m.bg}cc`, border: `1px solid ${m.color}44` }}
    >
      <span className="text-3xl shrink-0">{p.emoji}</span>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-relaxed" style={{ color: "#f1f5f9" }}>
          {p.phrase}
        </p>
        {p.translation && p.translation !== p.phrase && (
          <p className="text-xs mt-0.5 italic" style={{ color: "#64748b" }}>
            {p.translation}
          </p>
        )}
      </div>
      <span
        className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold shrink-0"
        style={{
          backgroundColor: m.bg,
          color: m.color,
          border: `1px solid ${m.color}66`,
          whiteSpace: "nowrap",
        }}
      >
        {p.emoji} {p.label}
      </span>
    </div>
  );
}

// ─── Inline phrase view ────────────────────────────────────────────────────────
function InlinePhraseView({ phrases }) {
  const [tab, setTab] = useState("stacked");
  const freq = phrases.reduce((acc, p) => {
    acc[p.emotion] = (acc[p.emotion] || 0) + 1;
    return acc;
  }, {});
  const topEmotions = Object.entries(freq).sort((a, b) => b[1] - a[1]);

  return (
    <div className="space-y-4">

      {/* Top emotion chips */}
      <div className="flex flex-wrap gap-1.5">
        {topEmotions.slice(0, 5).map(([emotion, count]) => {
          const m = EMOTION_META[emotion] ?? EMOTION_META.neutral;
          return (
            <span
              key={emotion}
              className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-semibold"
              style={{ backgroundColor: m.bg, color: m.color, border: `1px solid ${m.color}44` }}
            >
              {m.emoji} {m.label} ×{count}
            </span>
          );
        })}
      </div>

      {/* Tab switcher — Phrase detail is default */}
      <div className="flex gap-2">
        {[
          { id: "stacked", label: "🔍 Phrase detail" },
          { id: "inline",  label: "📖 Inline view"   },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className="px-3 py-1.5 rounded-lg text-xs font-semibold transition-all"
            style={{
              backgroundColor: tab === t.id ? "#6366f1" : "#1e293b",
              color: tab === t.id ? "#fff" : "#94a3b8",
              border: "none",
              cursor: "pointer",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>

      {/* Stacked view */}
      {tab === "stacked" && (
        <div
          className="space-y-2 max-h-[480px] overflow-y-auto pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}
        >
          {phrases.map((p, i) => (
            <PhraseItem key={i} p={p} index={i} mode="stacked" />
          ))}
        </div>
      )}

      {/* Inline view */}
      {tab === "inline" && (
        <div
          className="rounded-xl p-4"
          style={{ backgroundColor: "#0a0f1e", border: "1px solid #1e293b" }}
        >
          <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
            📖 Read along — emotion shown after each phrase
          </p>
          <div className="flex flex-wrap items-baseline gap-y-2 leading-loose">
            {phrases.map((p, i) => (
              <PhraseItem key={i} p={p} index={i} mode="inline" />
            ))}
          </div>
        </div>
      )}

      {/* Emotional flow bar */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "#475569" }}>
          Emotional flow — left to right
        </p>
        <div className="flex h-5 rounded-full overflow-hidden gap-px">
          {phrases.map((p, i) => {
            const m = EMOTION_META[p.emotion] ?? EMOTION_META.neutral;
            return (
              <div
                key={i}
                className="flex-1"
                style={{ backgroundColor: m.color }}
                title={`${p.emoji} ${p.label}: "${p.phrase.slice(0, 50)}"`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] mt-1" style={{ color: "#475569" }}>
          <span>▶ Start</span>
          <span>End ■</span>
        </div>
      </div>

    </div>
  );
}

// ─── Spinner ───────────────────────────────────────────────────────────────────
function AnalysingSpinner({ message }) {
  return (
    <div className="flex items-center gap-3 py-2">
      <div className="w-4 h-4 rounded-full border-2 border-violet-500 border-t-transparent animate-spin shrink-0" />
      <span className="text-xs" style={{ color: "#94a3b8" }}>{message}</span>
    </div>
  );
}

// ─── EmotionPanel — used in SmartTTS after each generation ────────────────────
export function EmotionPanel({ transcript, language, className = "" }) {
  const [result,           setResult]           = useState(null);
  const [phrases,          setPhrases]          = useState(null);
  const [analysing,        setAnalysing]        = useState(false);
  const [breakdownRunning, setBreakdownRunning] = useState(false);
  const [error,            setError]            = useState(null);
  const [expanded,         setExpanded]         = useState(true);
  const ranRef = useRef(false);

  useEffect(() => {
    if (!transcript?.trim()) return;
    if (ranRef.current) return;
    ranRef.current = true;
    runAnalysis();
  }, [transcript]); // eslint-disable-line react-hooks/exhaustive-deps

  async function runAnalysis() {
    setAnalysing(true);
    setError(null);
    setResult(null);
    setPhrases(null);

    try {
      const r = await detectEmotion(transcript);
      setResult(r);
    } catch (e) {
      setError(`Emotion analysis failed: ${e.message}`);
      setAnalysing(false);
      return;
    }
    setAnalysing(false);

    setBreakdownRunning(true);
    try {
      const p = await detectPhraseEmotions(transcript);
      setPhrases(p);
    } catch {
      // phrase breakdown fails silently — don't block the UI
    }
    setBreakdownRunning(false);
  }

  const primary     = result?.primaryEmotion;
  const accentColor = primary ? (EMOTION_META[primary]?.color ?? "#7C3AED") : "#7C3AED";

  return (
    <div
      className={`rounded-2xl border overflow-hidden transition-all duration-300 ${className}`}
      style={{ backgroundColor: "#0a0f1e", borderColor: `${accentColor}33` }}
    >
      {/* ── Collapsible header ── */}
      <button
        onClick={() => setExpanded((v) => !v)}
        className="w-full flex items-center justify-between px-5 py-4 text-left"
        style={{
          background: "none",
          cursor: "pointer",
          borderBottom: expanded ? `1px solid ${accentColor}22` : "none",
        }}
      >
        <div className="flex items-center gap-3">
          <div
            className="w-8 h-8 rounded-xl flex items-center justify-center text-lg"
            style={{
              background: `linear-gradient(135deg, ${accentColor}40, ${accentColor}20)`,
              border: `1px solid ${accentColor}44`,
            }}
          >
            🧠
          </div>
          <div>
            <p className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
              Emotion Analysis
              {language && (
                <span className="ml-2 text-[10px] font-normal" style={{ color: "#475569" }}>
                  · {language}
                </span>
              )}
            </p>
            <p className="text-[10px]" style={{ color: "#475569" }}>
              {analysing
                ? "Analysing tone…"
                : breakdownRunning
                ? "Breaking down phrases…"
                : result
                ? `${result.overallMood} · Score ${result.moodScore}/10`
                : "Groq LLaMA 3.3 · multilingual"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          {result && <EmotionTag emotion={primary} />}
          <span style={{ color: "#475569", fontSize: 12 }}>{expanded ? "▲" : "▼"}</span>
        </div>
      </button>

      {/* ── Body ── */}
      {expanded && (
        <div className="px-5 py-4 space-y-5">

          {/* Error */}
          {error && (
            <div
              className="rounded-lg px-3 py-2 text-xs flex items-center gap-2"
              style={{ backgroundColor: "#450a0a", border: "1px solid #ef444433", color: "#fca5a5" }}
            >
              ⚠️ {error}
            </div>
          )}

          {/* Analysing spinner */}
          {analysing && <AnalysingSpinner message="Detecting emotional tone of your text…" />}

          {/* Overall result card */}
          {result && (
            <div
              className="rounded-xl p-4 space-y-3"
              style={{ backgroundColor: "#0d1424", border: "1px solid #1e293b" }}
            >
              <div className="flex items-start gap-4">
                <ConfidenceArc value={result.confidence} />
                <div className="flex-1 min-w-0 space-y-2">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
                      {result.overallMood}
                    </span>
                    <span
                      className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                      style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
                    >
                      Score {result.moodScore}/10
                    </span>
                    <EnergyBadge level={result.energyLevel} />
                  </div>
                  <p className="text-xs" style={{ color: "#94a3b8" }}>{result.keyInsight}</p>
                  <MoodBar score={result.moodScore} />
                </div>
              </div>
              {result.secondaryEmotions?.length > 0 && (
                <div className="flex flex-wrap items-center gap-1.5 pt-1">
                  <span className="text-[10px] mr-1" style={{ color: "#475569" }}>
                    Also detected:
                  </span>
                  {result.secondaryEmotions.map((e) => (
                    <EmotionTag key={e} emotion={e} />
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Phrase breakdown spinner */}
          {breakdownRunning && (
            <AnalysingSpinner message="Breaking down phrase by phrase…" />
          )}

          {/* Phrase breakdown */}
          {phrases && phrases.length > 0 && (
            <div>
              <p
                className="text-[10px] uppercase tracking-wider mb-3 font-bold"
                style={{ color: "#475569" }}
              >
                📝 Phrase-by-phrase breakdown
              </p>
              <InlinePhraseView phrases={phrases} />
            </div>
          )}

        </div>
      )}
    </div>
  );
}

// ─── EmotionDetectionPanel — multi-session version (kept for compatibility) ───
export function EmotionDetectionPanel({ sessions = [], className = "" }) {
  const [results, setResults] = useState({});
  const analysedRef = useRef(new Set());

  const analysedCount = Object.keys(results).length;
  const avgMood =
    analysedCount > 0
      ? (Object.values(results).reduce((s, r) => s + r.moodScore, 0) / analysedCount).toFixed(1)
      : null;
  const avgConf =
    analysedCount > 0
      ? Math.round(Object.values(results).reduce((s, r) => s + r.confidence, 0) / analysedCount)
      : null;

  useEffect(() => {
    sessions.forEach((session) => {
      if (analysedRef.current.has(session.id)) return;
      if (!session.transcript?.trim()) return;
      analysedRef.current.add(session.id);
      runAnalysis(session);
    });
  }, [sessions]); // eslint-disable-line react-hooks/exhaustive-deps

  async function runAnalysis(session) {
    try {
      const result = await detectEmotion(session.transcript);
      setResults((prev) => ({ ...prev, [session.id]: result }));
    } catch {
      // fails silently — EmotionPanel handles its own errors
    }
  }

  return (
    <section className={`space-y-4 ${className}`}>
      <div className="flex items-center gap-3">
        <div
          className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{
            background: "linear-gradient(135deg,#7c3aed,#4f46e5)",
            boxShadow: "0 0 20px #7c3aed33",
          }}
        >
          🧠
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>
            Emotion Detection
          </h2>
          <p className="text-xs" style={{ color: "#64748b" }}>
            AI-powered · multilingual · phrase-by-phrase
          </p>
        </div>
      </div>

      {/* Stats bar */}
      <div
        className="grid grid-cols-3 rounded-xl overflow-hidden text-center"
        style={{ border: "1px solid #1e293b", backgroundColor: "#0a0f1e" }}
      >
        {[
          { label: "Sessions", value: sessions.length, color: "#818cf8" },
          { label: "Analysed", value: analysedCount,   color: "#22c55e" },
          { label: "Avg Mood", value: avgMood ?? "–",  color: "#f59e0b" },
        ].map(({ label, value, color }, i) => (
          <div
            key={label}
            className="py-3 px-2"
            style={{ borderRight: i < 2 ? "1px solid #1e293b" : "none" }}
          >
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "#475569" }}>
              {label}
            </div>
          </div>
        ))}
      </div>

      <CounterProvider>
        <div className="space-y-3">
          {sessions.map((session) => (
            <EmotionPanel
              key={session.id}
              transcript={session.transcript}
              language={session.language}
            />
          ))}
        </div>
      </CounterProvider>

      {/* Overall script mood summary */}
      {analysedCount > 0 && (
        <div
          className="rounded-2xl border p-5 space-y-3"
          style={{ backgroundColor: "#0a0f1e", borderColor: "#1e293b" }}
        >
          <div className="flex items-center justify-between flex-wrap gap-2">
            <h3 className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>
              Overall script mood
            </h3>
            {avgConf !== null && (
              <span
                className="text-[10px] px-2 py-0.5 rounded-full font-bold"
                style={{ backgroundColor: "#1e293b", color: "#94a3b8" }}
              >
                Avg confidence: {avgConf}%
              </span>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {[...new Set(Object.values(results).map((r) => r.primaryEmotion))].map((e) => (
              <EmotionTag key={e} emotion={e} size="md" />
            ))}
          </div>
          <div className="space-y-2 pt-1">
            {Object.entries(results).map(([id, r]) => {
              const sess = sessions.find((s) => String(s.id) === String(id));
              return (
                <div key={id} className="flex items-center gap-3">
                  <span
                    className="text-xs truncate shrink-0"
                    style={{ color: "#64748b", width: "9rem" }}
                  >
                    {sess?.title ?? id}
                  </span>
                  <div className="flex-1">
                    <MoodBar score={r.moodScore} />
                  </div>
                  <span
                    className="text-[10px] text-right shrink-0"
                    style={{ color: "#64748b", width: "4rem" }}
                  >
                    {r.overallMood}
                  </span>
                </div>
              );
            })}
          </div>
        </div>
      )}

    </section>
  );
}

export default EmotionPanel;