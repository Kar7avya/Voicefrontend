"use client"

import React, { createContext, useCallback, useContext, useEffect, useRef, useState } from "react"
import { LiquidCard, CardContent, CardHeader } from "@/components/ui/liquid-glass-card"
import { LiquidButton } from "@/components/ui/liquid-glass-button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

// ─── Emotion metadata ─────────────────────────────────────────────────────────

const EMOTION_META = {
  confident:    { emoji: "💪", color: "#3b82f6", bg: "#1e3a5f",  label: "Confident"    },
  nervous:      { emoji: "😰", color: "#f59e0b", bg: "#422006",  label: "Nervous"      },
  monotone:     { emoji: "😐", color: "#6b7280", bg: "#1f2937",  label: "Monotone"     },
  enthusiastic: { emoji: "🔥", color: "#ef4444", bg: "#450a0a",  label: "Enthusiastic" },
  exciting:     { emoji: "⚡", color: "#a855f7", bg: "#2e1065",  label: "Exciting"     },
  happy:        { emoji: "😊", color: "#22c55e", bg: "#052e16",  label: "Happy"        },
  sad:          { emoji: "😢", color: "#60a5fa", bg: "#172554",  label: "Sad"          },
  angry:        { emoji: "😠", color: "#f97316", bg: "#431407",  label: "Angry"        },
  calm:         { emoji: "🧘", color: "#34d399", bg: "#022c22",  label: "Calm"         },
  fearful:      { emoji: "😨", color: "#c084fc", bg: "#2e1065",  label: "Fearful"      },
  neutral:      { emoji: "😑", color: "#9ca3af", bg: "#111827",  label: "Neutral"      },
}

// ─── Counter context (staggered card animations) ──────────────────────────────

const CounterContext = createContext(undefined)

function CounterProvider({ children }) {
  const ref = useRef(0)
  const getNextIndex = useCallback(() => ref.current++, [])
  return <CounterContext.Provider value={{ getNextIndex }}>{children}</CounterContext.Provider>
}

function useCounter() {
  const ctx = useContext(CounterContext)
  if (!ctx) throw new Error("useCounter must be inside CounterProvider")
  return ctx.getNextIndex
}

// ─── Claude API call ──────────────────────────────────────────────────────────

async function detectEmotion(transcript) {
  const res = await fetch("https://api.anthropic.com/v1/messages", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      model: "claude-sonnet-4-20250514",
      max_tokens: 1000,
      messages: [
        {
          role: "user",
          content: `Analyse the emotional tone of this speech transcript.
Return ONLY a JSON object — no markdown, no extra text.

Transcript: "${transcript}"

JSON format:
{
  "primaryEmotion": "<confident|nervous|monotone|enthusiastic|exciting|happy|sad|angry|calm|fearful|neutral>",
  "secondaryEmotions": ["<emotion>", "<emotion>"],
  "overallMood": "<2-3 word phrase>",
  "moodScore": <1-10>,
  "energyLevel": "<low|medium|high>",
  "confidence": <0-100>,
  "keyInsight": "<one sentence about the emotional delivery>"
}`,
        },
      ],
    }),
  })

  const data = await res.json()
  const raw = data.content
    .map((b) => (b.type === "text" ? b.text : ""))
    .join("")
    .replace(/```json|```/g, "")
    .trim()

  return JSON.parse(raw)
}

// ─── Small UI pieces ──────────────────────────────────────────────────────────

function EmotionTag({ emotion, size = "sm" }) {
  const m = EMOTION_META[emotion] ?? EMOTION_META.neutral
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1 rounded-full font-medium",
        size === "sm" ? "px-2 py-0.5 text-xs" : "px-3 py-1 text-sm"
      )}
      style={{ backgroundColor: m.bg, color: m.color, border: `1px solid ${m.color}44` }}
    >
      {m.emoji} {m.label}
    </span>
  )
}

function MoodBar({ score }) {
  const pct = ((score - 1) / 9) * 100
  const color = pct < 33 ? "#ef4444" : pct < 66 ? "#f59e0b" : "#22c55e"
  return (
    <div className="w-full">
      <div className="flex justify-between text-[10px] mb-1 text-muted-foreground">
        <span>Negative</span><span>Neutral</span><span>Positive</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-muted/30">
        <div
          className="h-1.5 rounded-full transition-all duration-700"
          style={{ width: `${pct}%`, backgroundColor: color }}
        />
      </div>
    </div>
  )
}

function ConfidenceArc({ value }) {
  const r = 26
  const circ = 2 * Math.PI * r
  const half = circ / 2
  const offset = half - (value / 100) * half
  const color = value < 40 ? "#ef4444" : value < 70 ? "#f59e0b" : "#22c55e"
  return (
    <div className="relative flex items-center justify-center" style={{ width: 64, height: 64 }}>
      <svg width="64" height="64" style={{ transform: "rotate(-90deg)", position: "absolute" }}>
        <circle cx="32" cy="32" r={r} fill="none" stroke="currentColor" strokeWidth="5" className="text-muted/20" />
        <circle cx="32" cy="32" r={r} fill="none" stroke={color} strokeWidth="5"
          strokeDasharray={`${half} ${half}`} strokeDashoffset={offset}
          strokeLinecap="round" style={{ transition: "stroke-dashoffset 0.8s ease" }} />
      </svg>
      <div className="z-10 text-center">
        <div className="text-sm font-bold leading-none" style={{ color }}>{value}%</div>
        <div className="text-[9px] text-muted-foreground">conf.</div>
      </div>
    </div>
  )
}

function EnergyBadge({ level }) {
  const map = {
    low:    { icon: "🔋", label: "Low energy",  color: "#60a5fa" },
    medium: { icon: "⚡", label: "Mid energy",  color: "#f59e0b" },
    high:   { icon: "🚀", label: "High energy", color: "#22c55e" },
  }
  const { icon, label, color } = map[level] ?? map.medium
  return <span className="text-[10px] font-medium" style={{ color }}>{icon} {label}</span>
}

// ─── Session card ─────────────────────────────────────────────────────────────

function SessionEmotionCard({ session, result, loading, onAnalyse, onLearnMore }) {
  const getNextIndex = useCounter()
  const indexRef = useRef(null)
  const timerRef = useRef()
  const [visible, setVisible] = useState(false)

  if (indexRef.current === null) indexRef.current = getNextIndex()

  useEffect(() => {
    timerRef.current = setTimeout(() => setVisible(true), 300 + indexRef.current * 150)
    return () => clearTimeout(timerRef.current)
  }, [])

  if (!visible) return null

  const primary = result?.primaryEmotion
  const accentColor = primary ? EMOTION_META[primary]?.color : undefined

  return (
    <LiquidCard
      className="w-full animate-in fade-in slide-in-from-bottom-6 duration-700 fill-mode-both"
      style={accentColor ? { boxShadow: `0 0 24px ${accentColor}22` } : undefined}
    >
      <CardContent className="p-6 space-y-4">
        {/* Header */}
        <CardHeader className="flex flex-row items-start justify-between gap-4 p-0">
          <div className="flex-1 min-w-0">
            <div className="flex items-center flex-wrap gap-2 mb-1">
              <h3 className="text-base font-semibold truncate">{session.title}</h3>
              {primary && <EmotionTag emotion={primary} />}
            </div>
            <div className="flex items-center gap-3 text-xs text-muted-foreground flex-wrap">
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
              ? <span className="flex items-center gap-1"><span className="animate-spin">⟳</span> Analysing…</span>
              : result ? "Re-analyse" : "✦ Detect Mood"}
          </LiquidButton>
        </CardHeader>

        {/* Transcript preview */}
        <p className="text-xs text-muted-foreground leading-relaxed line-clamp-2">
          "{session.transcript.slice(0, 180)}…"
        </p>

        {/* Results */}
        {result && (
          <div className="rounded-xl p-4 space-y-3 bg-muted/10 border border-border/40">
            <div className="flex items-start gap-4">
              <ConfidenceArc value={result.confidence} />
              <div className="flex-1 min-w-0 space-y-2">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-sm font-bold">{result.overallMood}</span>
                  <Badge variant="secondary" className="text-[10px] px-2 py-0.5">
                    Score {result.moodScore}/10
                  </Badge>
                </div>
                <p className="text-xs text-muted-foreground">{result.keyInsight}</p>
                <MoodBar score={result.moodScore} />
              </div>
            </div>

            {result.secondaryEmotions?.length > 0 && (
              <div className="flex flex-wrap items-center gap-1.5 pt-1">
                <span className="text-[10px] text-muted-foreground mr-0.5">Also detected:</span>
                {result.secondaryEmotions.map((e) => (
                  <EmotionTag key={e} emotion={e} />
                ))}
              </div>
            )}

            {onLearnMore && (
              <LiquidButton variant="default" size="sm" onClick={onLearnMore}
                className="w-full h-9 text-xs font-semibold rounded-full mt-1">
                View full analysis
              </LiquidButton>
            )}
          </div>
        )}
      </CardContent>
    </LiquidCard>
  )
}

// ─── Main export ──────────────────────────────────────────────────────────────

export function EmotionDetectionPanel({ sessions, onLearnMore, className }) {
  const [results, setResults] = useState({})
  const [loading, setLoading] = useState(null)
  const [error, setError] = useState(null)

  const analysedCount = Object.keys(results).length
  const avgMood = analysedCount > 0
    ? (Object.values(results).reduce((s, r) => s + r.moodScore, 0) / analysedCount).toFixed(1)
    : null
  const avgConf = analysedCount > 0
    ? Math.round(Object.values(results).reduce((s, r) => s + r.confidence, 0) / analysedCount)
    : null

  async function handleAnalyse(session) {
    setLoading(session.id)
    setError(null)
    try {
      const result = await detectEmotion(session.transcript)
      setResults((prev) => ({ ...prev, [session.id]: result }))
    } catch {
      setError("Analysis failed — check your API connection and try again.")
    } finally {
      setLoading(null)
    }
  }

  return (
    <section className={cn("space-y-6", className)}>
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-violet-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg shadow-violet-500/20">
          🧠
        </div>
        <div>
          <h2 className="text-lg font-semibold">Emotion Detection</h2>
          <p className="text-xs text-muted-foreground">AI-powered emotional tone analysis per session</p>
        </div>
      </div>

      {/* Stats strip */}
      <div className="grid grid-cols-3 divide-x divide-border rounded-xl border border-border/60 bg-muted/10 overflow-hidden text-center">
        {[
          { label: "Sessions",  value: sessions.length, color: "#818cf8" },
          { label: "Analysed",  value: analysedCount,   color: "#22c55e" },
          { label: "Avg Mood",  value: avgMood ?? "–",  color: "#f59e0b" },
        ].map(({ label, value, color }) => (
          <div key={label} className="py-3 px-2">
            <div className="text-xl font-bold" style={{ color }}>{value}</div>
            <div className="text-[10px] text-muted-foreground uppercase tracking-wide">{label}</div>
          </div>
        ))}
      </div>

      {/* Emotion legend */}
      <div className="rounded-xl border border-border/60 bg-muted/10 p-4">
        <p className="text-[10px] font-semibold text-muted-foreground uppercase tracking-wider mb-2.5">
          Detectable emotions
        </p>
        <div className="flex flex-wrap gap-1.5">
          {Object.keys(EMOTION_META).map((e) => (
            <EmotionTag key={e} emotion={e} />
          ))}
        </div>
      </div>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400 flex items-center gap-2">
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
              loading={loading === session.id}
              onAnalyse={() => handleAnalyse(session)}
              onLearnMore={
                onLearnMore && results[session.id]
                  ? () => onLearnMore(session, results[session.id])
                  : undefined
              }
            />
          ))}
        </div>
      </CounterProvider>

      {/* Overall mood summary */}
      {analysedCount > 0 && (
        <LiquidCard className="animate-in fade-in slide-in-from-bottom-4 duration-700">
          <CardContent className="p-5 space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-semibold">Overall script mood</h3>
              {avgConf !== null && (
                <Badge variant="secondary" className="text-[10px]">
                  Avg confidence: {avgConf}%
                </Badge>
              )}
            </div>
            <div className="flex flex-wrap gap-1.5">
              {[...new Set(Object.values(results).map((r) => r.primaryEmotion))].map((e) => (
                <EmotionTag key={e} emotion={e} size="md" />
              ))}
            </div>
            <div className="space-y-2 pt-1">
              {Object.entries(results).map(([id, r]) => {
                const sess = sessions.find((s) => String(s.id) === String(id))
                return (
                  <div key={id} className="flex items-center gap-3">
                    <span className="text-xs text-muted-foreground truncate w-36 shrink-0">
                      {sess?.title ?? id}
                    </span>
                    <div className="flex-1"><MoodBar score={r.moodScore} /></div>
                    <span className="text-[10px] text-muted-foreground w-12 text-right shrink-0">
                      {r.overallMood}
                    </span>
                  </div>
                )
              })}
            </div>
          </CardContent>
        </LiquidCard>
      )}
    </section>
  )
}