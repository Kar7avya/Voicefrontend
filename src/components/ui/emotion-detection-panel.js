"use client"

import React, {
  createContext, useCallback, useContext,
  useEffect, useRef, useState,
} from "react";
import { LiquidCard, CardContent, CardHeader } from "./liquid-glass-card";
import { LiquidButton } from "./liquid-glass-button";
import { Badge } from "./badge";
import { cn } from "../../lib/utils";

// ─── Emotion metadata ──────────────────────────────────────────────────────────
const EMOTION_META = {
  confident:    { emoji: "💪", color: "#3b82f6", bg: "#1e3a5f", label: "Confident"    },
  nervous:      { emoji: "😰", color: "#f59e0b", bg: "#422006", label: "Nervous"      },
  monotone:     { emoji: "😐", color: "#6b7280", bg: "#1f2937", label: "Monotone"     },
  enthusiastic: { emoji: "🔥", color: "#ef4444", bg: "#450a0a", label: "Enthusiastic" },
  exciting:     { emoji: "⚡", color: "#a855f7", bg: "#2e1065", label: "Exciting"     },
  happy:        { emoji: "😊", color: "#22c55e", bg: "#052e16", label: "Happy"        },
  sad:          { emoji: "😢", color: "#60a5fa", bg: "#172554", label: "Sad"          },
  angry:        { emoji: "😠", color: "#f97316", bg: "#431407", label: "Angry"        },
  calm:         { emoji: "🧘", color: "#34d399", bg: "#022c22", label: "Calm"         },
  fearful:      { emoji: "😨", color: "#c084fc", bg: "#2e1065", label: "Fearful"      },
  neutral:      { emoji: "😑", color: "#9ca3af", bg: "#111827", label: "Neutral"      },
  surprised:    { emoji: "😲", color: "#fbbf24", bg: "#422006", label: "Surprised"    },
  hopeful:      { emoji: "🌟", color: "#34d399", bg: "#022c22", label: "Hopeful"      },
  sarcastic:    { emoji: "😏", color: "#a78bfa", bg: "#2e1065", label: "Sarcastic"    },
  worried:      { emoji: "😟", color: "#fb923c", bg: "#431407", label: "Worried"      },
  excited:      { emoji: "🎉", color: "#f472b6", bg: "#4a044e", label: "Excited"      },
  proud:        { emoji: "🦁", color: "#fbbf24", bg: "#422006", label: "Proud"        },
  caring:       { emoji: "🤗", color: "#34d399", bg: "#022c22", label: "Caring"       },
};

// ─── Counter context ───────────────────────────────────────────────────────────
const CounterContext = createContext(undefined);
function CounterProvider({ children }) {
  const ref = useRef(0);
  const getNextIndex = useCallback(() => ref.current++, []);
  return <CounterContext.Provider value={{ getNextIndex }}>{children}</CounterContext.Provider>;
}
function useCounter() {
  const ctx = useContext(CounterContext);
  if (!ctx) throw new Error("useCounter must be inside CounterProvider");
  return ctx.getNextIndex;
}

// ─── API 1: Overall emotion ────────────────────────────────────────────────────
async function detectEmotion(transcript) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [{
        role: "user",
        content: `Analyse the emotional tone of this speech transcript.
Return ONLY valid JSON. No markdown, no extra text.

Transcript: "${transcript}"

{
  "primaryEmotion": "<one of: confident|nervous|monotone|enthusiastic|exciting|happy|sad|angry|calm|fearful|neutral|excited|proud|caring|worried>",
  "secondaryEmotions": ["<emotion>"],
  "overallMood": "<2-3 word phrase>",
  "moodScore": <1-10>,
  "energyLevel": "<low|medium|high>",
  "confidence": <0-100>,
  "keyInsight": "<one plain sentence about the overall emotional delivery>"
}`,
      }],
    }),
  });
  const data = await res.json();
  const raw = data.content.map((b) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}

// ─── API 2: Phrase-level inline emotion breakdown ──────────────────────────────
// Breaks each sentence into emotional PHRASES — not just sentences.
// Example: "I am happy to say I invested [😊 Happy] but cannot invest more [😢 Sad]"
async function detectPhraseEmotions(transcript) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 6000,
      messages: [{
        role: "user",
        content: `You are an emotion analysis expert. Your job is to help a layman understand what emotion is being expressed in each part of a speech.

Split the transcript into PHRASES — a phrase is a part of a sentence that carries one clear emotion. A single sentence can have multiple phrases with different emotions.

EXAMPLE:
Input: "I am happy to say that I have invested in your company but cannot invest more than this."
Output:
[
  { "phrase": "I am happy to say that I have invested in your company", "emotion": "happy", "emoji": "😊", "label": "Happy" },
  { "phrase": "but cannot invest more than this", "emotion": "sad", "emoji": "😢", "label": "Sad" }
]

EXAMPLE 2:
Input: "Hello bachhon, today we are going to learn something amazing!"
Output:
[
  { "phrase": "Hello bachhon", "emotion": "caring", "emoji": "🤗", "label": "Caring & Warm" },
  { "phrase": "today we are going to learn something amazing!", "emotion": "excited", "emoji": "🎉", "label": "Excited & Energetic" }
]

Now do this for the following transcript. Return ONLY a valid JSON array. No markdown, no explanation.

Transcript: "${transcript}"

Format:
[
  {
    "phrase": "<exact phrase from transcript>",
    "emotion": "<one of: confident|nervous|monotone|enthusiastic|exciting|happy|sad|angry|calm|fearful|neutral|surprised|hopeful|sarcastic|worried|excited|proud|caring>",
    "emoji": "<single emoji that perfectly represents this emotion to a layman>",
    "label": "<2-4 word plain English label, e.g. 'Happy & Relieved', 'Sad & Worried', 'Excited & Energetic'>"
  }
]

Rules:
- Split at natural emotional boundaries — conjunctions like "but", "however", "yet", "although" often mark a shift in emotion
- Keep phrases natural — do not break mid-word or mid-thought
- Every phrase must cover text that actually exists in the transcript
- The phrases together must reconstruct the full transcript exactly
- Use everyday plain English for the label
- Pick emojis a layman would instantly recognise and relate to`,
      }],
    }),
  });
  const data = await res.json();
  const raw = data.content.map((b) => (b.type === "text" ? b.text : "")).join("").replace(/```json|```/g, "").trim();
  return JSON.parse(raw);
}

// ─── Small UI pieces ───────────────────────────────────────────────────────────

function EmotionTag({ emotion, size = "sm" }) {
  const m = EMOTION_META[emotion] ?? EMOTION_META.neutral;
  return (
    <span
      className={cn("inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm")}
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
        <span>Negative</span><span>Neutral</span><span>Positive</span>
      </div>
      <div className="h-1.5 w-full rounded-full" style={{ backgroundColor: "#1f2937" }}>
        <div className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }} />
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
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${half} ${half}`} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
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

// ─── Inline phrase display ─────────────────────────────────────────────────────
// This is the KEY component — shows each phrase with its emoji tag inline
// exactly like: "Hello bachhon 🤗 Caring & Warm  today we are going to learn something amazing! 🎉 Excited"

function InlinePhraseView({ phrases }) {
  const [visible, setVisible] = useState(false);
  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 100);
    return () => clearTimeout(t);
  }, []);

  if (!visible) return null;

  return (
    <div className="space-y-3">
      <style>{`
        @keyframes phraseIn {
          from { opacity: 0; transform: translateY(4px); }
          to   { opacity: 1; transform: translateY(0); }
        }
      `}</style>

      {/* ── Inline reading view — the layman view ── */}
      <div
        className="rounded-xl p-4 leading-relaxed"
        style={{ backgroundColor: "#0a0f1e", border: "1px solid #1e293b" }}
      >
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
          📖 Read along — emotion shown after each phrase
        </p>

        {/* All phrases flow inline like normal reading */}
        <p className="text-sm leading-loose" style={{ color: "#e2e8f0" }}>
          {phrases.map((p, i) => {
            const m = EMOTION_META[p.emotion] ?? EMOTION_META.neutral;
            return (
              <span key={i} style={{
                animation: `phraseIn 0.3s ease forwards`,
                animationDelay: `${i * 120}ms`,
                opacity: 0,
                display: "inline",
              }}>
                {/* The phrase text — highlighted with a subtle background */}
                <span
                  className="rounded px-1 py-0.5 mx-0.5"
                  style={{
                    backgroundColor: `${m.bg}cc`,
                    color: "#f1f5f9",
                    borderBottom: `2px solid ${m.color}`,
                  }}
                >
                  {p.phrase}
                </span>

                {/* Inline emotion badge right after the phrase */}
                <span
                  className="inline-flex items-center gap-0.5 mx-1 px-2 py-0.5 rounded-full text-[10px] font-semibold align-middle"
                  style={{
                    backgroundColor: m.bg,
                    color: m.color,
                    border: `1px solid ${m.color}55`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.emoji} {p.label}
                </span>
              </span>
            );
          })}
        </p>
      </div>

      {/* ── Phrase-by-phrase stacked view (cleaner for long transcripts) ── */}
      <div
        className="rounded-xl p-4"
        style={{ backgroundColor: "#060a14", border: "1px solid #1e293b" }}
      >
        <p className="text-[10px] uppercase tracking-wider mb-3" style={{ color: "#475569" }}>
          🔍 Phrase-by-phrase detail
        </p>

        <div className="space-y-2 max-h-[420px] overflow-y-auto pr-1"
          style={{ scrollbarWidth: "thin", scrollbarColor: "#334155 transparent" }}>
          {phrases.map((p, i) => {
            const m = EMOTION_META[p.emotion] ?? EMOTION_META.neutral;
            return (
              <div
                key={i}
                className="flex items-center gap-3 rounded-xl px-3 py-2.5"
                style={{
                  backgroundColor: `${m.bg}99`,
                  border: `1px solid ${m.color}33`,
                  animation: `phraseIn 0.3s ease forwards`,
                  animationDelay: `${i * 100}ms`,
                  opacity: 0,
                }}
              >
                {/* Big emoji */}
                <span className="text-2xl shrink-0">{p.emoji}</span>

                {/* Phrase text */}
                <p className="flex-1 text-sm font-medium" style={{ color: "#f1f5f9" }}>
                  {p.phrase}
                </p>

                {/* Emotion label pill */}
                <span
                  className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold shrink-0"
                  style={{
                    backgroundColor: m.bg,
                    color: m.color,
                    border: `1px solid ${m.color}55`,
                    whiteSpace: "nowrap",
                  }}
                >
                  {p.label}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* ── Emotion flow bar ── */}
      <div>
        <p className="text-[10px] uppercase tracking-wider mb-1.5" style={{ color: "#475569" }}>
          Emotional flow across script
        </p>
        <div className="flex h-4 rounded-full overflow-hidden gap-px">
          {phrases.map((p, i) => {
            const m = EMOTION_META[p.emotion] ?? EMOTION_META.neutral;
            return (
              <div key={i} className="flex-1" style={{ backgroundColor: m.color }}
                title={`${p.emoji} ${p.label}: "${p.phrase.slice(0, 40)}…"`}
              />
            );
          })}
        </div>
        <div className="flex justify-between text-[9px] mt-1" style={{ color: "#475569" }}>
          <span>▶ Start</span><span>End ■</span>
        </div>
      </div>

      {/* ── Emoji legend ── */}
      <div className="rounded-lg p-3"
        style={{ backgroundColor: "#0a0f1e", border: "1px solid #1e293b" }}>
        <p className="text-[9px] uppercase tracking-wider mb-2" style={{ color: "#475569" }}>
          Emoji guide
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Object.entries(EMOTION_META).map(([key, m]) => (
            <span key={key}
              className="inline-flex items-center gap-1 px-1.5 py-0.5 rounded text-[9px] font-medium"
              style={{ backgroundColor: m.bg, color: m.color }}>
              {m.emoji} {m.label}
            </span>
          ))}
        </div>
      </div>

    </div>
  );
}

// ─── Session card ──────────────────────────────────────────────────────────────
function SessionEmotionCard({
  session, result, phrases,
  loading, breakdownLoading,
  onAnalyse, onBreakdown,
}) {
  const getNextIndex = useCounter();
  const indexRef = useRef(null);
  const timerRef = useRef();
  const [visible,       setVisible]       = useState(false);
  const [showBreakdown, setShowBreakdown] = useState(false);

  if (indexRef.current === null) indexRef.current = getNextIndex();

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(true), 300 + indexRef.current * 150);
    return () => clearTimeout(timerRef.current);
  }, []);

  useEffect(() => {
    if (phrases && phrases.length > 0) setShowBreakdown(true);
  }, [phrases]);

  if (!visible) return null;

  const primary     = result?.primaryEmotion;
  const accentColor = primary ? (EMOTION_META[primary]?.color ?? undefined) : undefined;

  return (
    <LiquidCard
      className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
      style={accentColor ? { boxShadow: `0 0 28px ${accentColor}22` } : undefined}
    >
      <CardContent className="p-6 space-y-4">

        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h3 className="text-base font-semibold truncate" style={{ color: "#f1f5f9" }}>
                {session.title}
              </h3>
              {primary && <EmotionTag emotion={primary} />}
            </div>
            <div className="flex items-center gap-3 text-xs flex-wrap" style={{ color: "#64748b" }}>
              <span>📅 {session.date}</span>
              <span>⏱ {session.duration}</span>
              {result && <EnergyBadge level={result.energyLevel} />}
            </div>
          </div>

          <LiquidButton
            variant="default" size="sm"
            onClick={onAnalyse} disabled={loading}
            className="shrink-0 text-xs font-semibold h-8 px-4 rounded-full"
          >
            {loading
              ? <span className="flex items-center gap-1.5"><span className="animate-spin">⟳</span> Analysing…</span>
              : result ? "↺ Re-analyse" : "✦ Detect Mood"}
          </LiquidButton>
        </CardHeader>

        {/* Transcript preview */}
        <p className="text-xs leading-relaxed line-clamp-2" style={{ color: "#64748b" }}>
          "{session.transcript.slice(0, 200)}{session.transcript.length > 200 ? "…" : ""}"
        </p>

        {/* Overall result */}
        {result && (
          <div className="rounded-xl p-4 space-y-3"
            style={{ backgroundColor: "#0a0f1e", border: "1px solid #1e293b" }}>

            <div className="flex items-start gap-4">
              <ConfidenceArc value={result.confidence} />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold" style={{ color: "#f1f5f9" }}>
                    {result.overallMood}
                  </span>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                    Score {result.moodScore}/10
                  </Badge>
                </div>
                <p className="text-xs" style={{ color: "#94a3b8" }}>{result.keyInsight}</p>
                <MoodBar score={result.moodScore} />
              </div>
            </div>

            {result.secondaryEmotions?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] mr-1" style={{ color: "#475569" }}>Also detected:</span>
                {result.secondaryEmotions.map((e) => <EmotionTag key={e} emotion={e} />)}
              </div>
            )}

            {/* Breakdown button */}
            <button
              onClick={() => {
                if (phrases && phrases.length > 0) {
                  setShowBreakdown((v) => !v);
                } else {
                  onBreakdown();
                }
              }}
              disabled={breakdownLoading}
              className="w-full h-10 rounded-xl text-xs font-semibold flex items-center justify-center gap-2 transition-all duration-200"
              style={{
                background: breakdownLoading ? "#1e293b" : "linear-gradient(135deg,#6366f1,#8b5cf6)",
                color: breakdownLoading ? "#475569" : "#fff",
                border: "none",
                cursor: breakdownLoading ? "not-allowed" : "pointer",
                opacity: breakdownLoading ? 0.7 : 1,
              }}
            >
              {breakdownLoading
                ? <><span className="animate-spin">⟳</span> Analysing phrases…</>
                : showBreakdown && phrases?.length > 0
                  ? "🙈 Hide emotion breakdown"
                  : "📖 Show inline emotion breakdown"}
            </button>
          </div>
        )}

        {/* Inline phrase breakdown */}
        {showBreakdown && phrases && phrases.length > 0 && (
          <InlinePhraseView phrases={phrases} />
        )}

      </CardContent>
    </LiquidCard>
  );
}

// ─── Main export ───────────────────────────────────────────────────────────────
export function EmotionDetectionPanel({ sessions, className }) {
  const [results,          setResults]          = useState({});
  const [phrases,          setPhrases]          = useState({});
  const [loading,          setLoading]          = useState(null);
  const [breakdownLoading, setBreakdownLoading] = useState(null);
  const [error,            setError]            = useState(null);

  const analysedCount = Object.keys(results).length;
  const avgMood = analysedCount > 0
    ? (Object.values(results).reduce((s, r) => s + r.moodScore, 0) / analysedCount).toFixed(1)
    : null;
  const avgConf = analysedCount > 0
    ? Math.round(Object.values(results).reduce((s, r) => s + r.confidence, 0) / analysedCount)
    : null;

  async function handleAnalyse(session) {
    setLoading(session.id);
    setError(null);
    try {
      const result = await detectEmotion(session.transcript);
      setResults((prev) => ({ ...prev, [session.id]: result }));
    } catch {
      setError("Analysis failed — check your API connection and try again.");
    } finally {
      setLoading(null);
    }
  }

  async function handleBreakdown(session) {
    setBreakdownLoading(session.id);
    setError(null);
    try {
      const result = await detectPhraseEmotions(session.transcript);
      setPhrases((prev) => ({ ...prev, [session.id]: result }));
    } catch {
      setError("Phrase breakdown failed — try again.");
    } finally {
      setBreakdownLoading(null);
    }
  }

  return (
    <section className={cn("space-y-6", className)}>

      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl flex items-center justify-center text-lg"
          style={{ background: "linear-gradient(135deg,#7c3aed,#4f46e5)", boxShadow: "0 0 20px #7c3aed33" }}>
          🧠
        </div>
        <div>
          <h2 className="text-lg font-semibold" style={{ color: "#f1f5f9" }}>Emotion Detection</h2>
          <p className="text-xs" style={{ color: "#64748b" }}>
            AI-powered · inline emotion shown on every phrase
          </p>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 rounded-xl overflow-hidden text-center"
        style={{ border: "1px solid #1e293b", backgroundColor: "#0a0f1e" }}>
        {[
          { label: "Sessions", value: sessions.length, color: "#818cf8" },
          { label: "Analysed", value: analysedCount,   color: "#22c55e" },
          { label: "Avg Mood", value: avgMood ?? "–",  color: "#f59e0b" },
        ].map(({ label, value, color }, i) => (
          <div key={label} className="py-3 px-2"
            style={{ borderRight: i < 2 ? "1px solid #1e293b" : "none" }}>
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-[10px] uppercase tracking-wide" style={{ color: "#475569" }}>{label}</div>
          </div>
        ))}
      </div>

      {/* Emotion legend */}
      <div className="rounded-xl p-4" style={{ border: "1px solid #1e293b", backgroundColor: "#0a0f1e" }}>
        <p className="text-[10px] font-semibold uppercase tracking-wider mb-2.5" style={{ color: "#475569" }}>
          Detectable emotions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(EMOTION_META).map((e) => <EmotionTag key={e} emotion={e} />)}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl px-4 py-3 text-sm flex items-center gap-2"
          style={{ backgroundColor: "#450a0a", border: "1px solid #ef444433", color: "#fca5a5" }}>
          ⚠️ {error}
        </div>
      )}

      {/* Session cards */}
      <CounterProvider>
        <div className="space-y-3">
          {sessions.map((session) => (
            <SessionEmotionCard
              key={session.id}
              session={session}
              result={results[session.id]}
              phrases={phrases[session.id]}
              loading={loading === session.id}
              breakdownLoading={breakdownLoading === session.id}
              onAnalyse={() => handleAnalyse(session)}
              onBreakdown={() => handleBreakdown(session)}
            />
          ))}
        </div>
      </CounterProvider>

      {/* Overall mood summary */}
      {analysedCount > 0 && (
        <LiquidCard className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <h3 className="text-sm font-semibold" style={{ color: "#f1f5f9" }}>Overall script mood</h3>
              {avgConf !== null && (
                <Badge variant="secondary" className="text-[10px]">Avg confidence: {avgConf}%</Badge>
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
                    <span className="text-xs truncate shrink-0"
                      style={{ color: "#64748b", width: "9rem" }}>
                      {sess?.title ?? id}
                    </span>
                    <div className="flex-1"><MoodBar score={r.moodScore} /></div>
                    <span className="text-[10px] text-right shrink-0"
                      style={{ color: "#64748b", width: "4rem" }}>
                      {r.overallMood}
                    </span>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </LiquidCard>
      )}

    </section>
  );
}