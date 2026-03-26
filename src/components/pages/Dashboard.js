import React, { useState, useEffect, useMemo } from 'react';
import { getAuthHeaders, getCurrentUser } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-20.onrender.com';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked || dataLoaded) return;
    if (!user) {
      setError("You must be logged in to view your dashboard.");
      setIsLoading(false);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const authHeaders = await getAuthHeaders();
        if (!authHeaders) throw new Error("Session expired. Please log in again.");

        const response = await fetch(`${BACKEND_URL}/api/metadata`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...authHeaders }
        });

        if (response.status === 401 || response.status === 403) throw new Error("Access denied. Please log in again.");
        if (!response.ok) {
          let msg = `HTTP ${response.status}`;
          try { const d = await response.json(); msg = d.error || d.message || msg; } catch { msg = await response.text() || msg; }
          throw new Error(msg);
        }

        const data = await response.json();
        if (Array.isArray(data)) setMetadataList(data);
        else if (data.success && Array.isArray(data.data)) setMetadataList(data.data);
        else if (data.data && Array.isArray(data.data)) setMetadataList(data.data);
        else setMetadataList([]);
      } catch (err) {
        if (err.message.includes("Session expired") || err.message.includes("Access denied")) {
          setError(`${err.message} Redirecting to login...`);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
        setDataLoaded(true);
      }
    };

    fetchMetadata();
  }, [BACKEND_URL, authChecked, user, dataLoaded, navigate]);

  const analyzePerformance = (item) => {
    let fillerWordsCount = 0;
    let pausesCount = 0;
    let wordsArray = [];
    let videoDuration = 0;

    if (item.deepgram_words) {
      if (Array.isArray(item.deepgram_words)) wordsArray = item.deepgram_words;
      else if (typeof item.deepgram_words === 'object' && item.deepgram_words.words) wordsArray = item.deepgram_words.words;
    }

    if (wordsArray.length > 0) {
      const lastWord = wordsArray[wordsArray.length - 1];
      videoDuration = lastWord.end || lastWord.start || 0;
    }

    const fillerWords = ['uh', 'um', 'uhm', 'er', 'ah', 'like', 'so', 'and', 'but', 'well',
      'actually', 'basically', 'right', 'okay', 'ok', 'alright', 'you know', 'i mean', 'i guess', 'i think'];

    fillerWordsCount = wordsArray.filter(word => {
      const wordText = (word.word || word.punctuated_word || word.text || (typeof word === 'string' ? word : '')).toLowerCase().trim();
      if (!wordText) return false;
      const clean = wordText.replace(/[.,!?;:]/g, '');
      return fillerWords.includes(clean);
    }).length;

    if (item.deepgram_transcript) {
      const pauses = item.deepgram_transcript.match(/\[PAUSE:[^\]]+\]/g);
      if (pauses) pausesCount = pauses.length;
    }

    const totalWords = wordsArray.length;
    const fluencyScore = totalWords > 0 ? Math.round(((totalWords - fillerWordsCount) / totalWords) * 100) : 0;

    let speakingRate = 0;
    if (totalWords > 0 && videoDuration > 0) speakingRate = Math.round(totalWords / (videoDuration / 60));
    else if (item.video_duration) speakingRate = Math.round(totalWords / (item.video_duration / 60));

    const getFluencyRating = (s) => {
      if (s >= 90) return { color: 'text-[#34C759]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Excellent', tip: 'Clear speech with minimal filler words.' };
      if (s >= 70) return { color: 'text-[#FF9F0A]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Good', tip: 'Try reducing filler words further.' };
      return { color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]', border: 'border-[#FECACA]', label: 'Needs Work', tip: 'Focus on cutting "um", "uh" and pausing instead.' };
    };

    const getPaceRating = (r) => {
      if (r === 0) return { color: 'text-[#AEAEB2]', bg: 'bg-[#F5F5F7]', border: 'border-[#E8E8ED]', label: 'N/A', tip: 'Not enough data to calculate.' };
      if (r >= 120 && r <= 180) return { color: 'text-[#34C759]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Perfect', tip: 'Ideal speaking pace for engagement.' };
      if (r >= 100) return { color: 'text-[#FF9F0A]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Good', tip: 'Slightly off — aim for 120–180 WPM.' };
      return { color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]', border: 'border-[#FECACA]', label: 'Slow', tip: 'Try speaking more energetically.' };
    };

    const getFillerRating = (count, total) => {
      if (total === 0) return { color: 'text-[#AEAEB2]', bg: 'bg-[#F5F5F7]', border: 'border-[#E8E8ED]', label: 'N/A', tip: '' };
      const pct = (count / total) * 100;
      if (pct < 5) return { color: 'text-[#34C759]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Excellent', tip: 'Great job avoiding filler words!' };
      if (pct < 10) return { color: 'text-[#FF9F0A]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Good', tip: 'Keep working on reducing fillers.' };
      return { color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]', border: 'border-[#FECACA]', label: 'High', tip: 'Pause instead of saying "um" or "uh".' };
    };

    return {
      totalWords, fillerWordsCount, pausesCount, fluencyScore, speakingRate,
      fluencyRating: getFluencyRating(fluencyScore),
      fillerRating: getFillerRating(fillerWordsCount, totalWords),
      paceRating: getPaceRating(speakingRate),
    };
  };

  const formatDate = (d) => {
    if (!d) return 'Unknown';
    try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return 'Invalid date'; }
  };

  const sortedMetadata = useMemo(() => {
    if (!metadataList.length) return [];
    return [...metadataList].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  }, [metadataList]);

  const progressData = useMemo(() => sortedMetadata.map((item, i) => {
    const a = analyzePerformance(item);
    return {
      session: i + 1,
      label: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `S${i + 1}`,
      fluencyScore: a.fluencyScore,
      fillerWordsCount: a.fillerWordsCount,
      speakingRate: a.speakingRate,
    };
  }), [sortedMetadata]);

  const progressDelta = useMemo(() => {
    if (progressData.length < 2) return { fluencyChange: 0, fillerChange: 0, rateChange: 0, insightText: '' };
    const first = progressData[0];
    const latest = progressData[progressData.length - 1];
    const fluencyChange = Math.round(latest.fluencyScore - first.fluencyScore);
    const fillerChange = latest.fillerWordsCount - first.fillerWordsCount;
    const rateChange = latest.speakingRate - first.speakingRate;
    const parts = [];
    if (fluencyChange > 0) parts.push(`Fluency improved by ${fluencyChange}% across ${progressData.length} sessions.`);
    else if (fluencyChange < 0) parts.push(`Fluency decreased by ${Math.abs(fluencyChange)}%. Focus on reducing filler words.`);
    else parts.push(`Fluency is steady across ${progressData.length} sessions.`);
    if (fillerChange < 0) parts.push(`${Math.abs(fillerChange)} fewer filler words — great progress.`);
    else if (fillerChange > 0) parts.push(`${fillerChange} more filler words. Try pausing instead of "um" or "uh".`);
    return { fluencyChange, fillerChange, rateChange, insightText: parts.join(' ') };
  }, [progressData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-[#E8E8ED] rounded-xl shadow-lg px-3 py-2">
        <p className="text-[#AEAEB2] text-xs mb-0.5">{payload[0]?.payload?.label || `Session ${label}`}</p>
        <p className="text-[#1D1D1F] text-sm font-semibold">{payload[0].value.toFixed(0)}% Fluency</p>
      </div>
    );
  };

  // ── Loading states ─────────────────────────────────────────────────────
  if (!authChecked || (isLoading && !dataLoaded)) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-[1.5px] border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6E6E73] text-sm">{!authChecked ? 'Verifying session' : 'Loading your data'}</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[#1D1D1F] text-[2rem] font-bold tracking-tight leading-tight mb-1">
            Dashboard
          </h1>
          <p className="text-[#6E6E73] text-base">
            {user ? `${user.email} · ` : ''}{metadataList.length} presentation{metadataList.length !== 1 ? 's' : ''} analyzed
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-[#FFF5F5] border border-[#FECACA] rounded-2xl p-4">
            <svg className="w-4 h-4 text-[#FF3B30] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-[#7F1D1D] text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {!error && (
          <>
            {/* ── Progress Overview ──────────────────────────────────── */}
            {metadataList.length > 0 && (
              <div className="bg-white border border-[#E8E8ED] rounded-3xl overflow-hidden mb-6 shadow-sm">
                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-[#F2F2F7]">
                  <h2 className="text-[#1D1D1F] text-lg font-bold tracking-tight mb-0.5">Progress Overview</h2>
                  <p className="text-[#AEAEB2] text-sm">Your speaking improvement across all sessions</p>
                </div>

                {metadataList.length < 2 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-[#1D1D1F] text-sm font-medium mb-1">Upload 2+ presentations to see trends</p>
                    <p className="text-[#AEAEB2] text-xs">We'll chart your fluency improvement over time</p>
                  </div>
                ) : (
                  <>
                    {/* KPI row */}
                    <div className="grid grid-cols-3 divide-x divide-[#F2F2F7]">
                      {[
                        {
                          value: `${progressDelta.fluencyChange > 0 ? '+' : ''}${progressDelta.fluencyChange}%`,
                          label: 'Fluency Change',
                          positive: progressDelta.fluencyChange > 0,
                          negative: progressDelta.fluencyChange < 0,
                        },
                        {
                          value: `${progressDelta.fillerChange <= 0 ? '' : '+'}${progressDelta.fillerChange}`,
                          label: 'Filler Words',
                          positive: progressDelta.fillerChange < 0,
                          negative: progressDelta.fillerChange > 0,
                        },
                        {
                          value: progressDelta.rateChange !== 0 ? `${progressDelta.rateChange > 0 ? '+' : ''}${progressDelta.rateChange}` : '—',
                          label: 'WPM Change',
                          positive: false,
                          negative: false,
                        },
                      ].map((kpi, i) => (
                        <div key={i} className="px-6 py-5 text-center">
                          <p className={`text-2xl font-bold mb-1 tabular-nums
                            ${kpi.positive ? 'text-[#34C759]' : kpi.negative ? 'text-[#FF3B30]' : 'text-[#1D1D1F]'}`}>
                            {kpi.value}
                          </p>
                          <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">{kpi.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="px-6 py-5 border-t border-[#F2F2F7]">
                      <p className="text-[#6E6E73] text-xs uppercase tracking-widest font-medium mb-4">Fluency Trend</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={progressData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" />
                          <XAxis dataKey="label" tick={{ fill: '#AEAEB2', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#AEAEB2', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone" dataKey="fluencyScore"
                            stroke="#007AFF" strokeWidth={2}
                            dot={{ r: 4, fill: '#007AFF', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#007AFF', stroke: '#fff', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Insight */}
                    {progressDelta.insightText && (
                      <div className="px-6 pb-6 border-t border-[#F2F2F7] pt-5">
                        <div className="bg-[#F5F5F7] rounded-2xl px-4 py-3">
                          <p className="text-[#1D1D1F] text-sm leading-relaxed">
                            <span className="font-semibold">Coach insight — </span>
                            <span className="text-[#3A3A3C]">{progressDelta.insightText}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Presentation Cards ─────────────────────────────────── */}
            {metadataList.length > 0 ? (
              <div className="space-y-5">
                {metadataList.map(item => {
                  const a = analyzePerformance(item);
                  return (
                    <div key={item.id} className="bg-white border border-[#E8E8ED] rounded-3xl overflow-hidden shadow-sm">

                      {/* Card header */}
                      <div className="px-6 pt-6 pb-5 border-b border-[#F2F2F7]">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div className="min-w-0">
                            <h3 className="text-[#1D1D1F] text-base font-semibold truncate">
                              {item.original_name || item.video_name || 'Untitled Presentation'}
                            </h3>
                            <p className="text-[#AEAEB2] text-xs mt-0.5">{formatDate(item.created_at)}</p>
                          </div>
                        </div>

                        {/* Score chips */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: `${a.fluencyScore}%`, label: 'Speech Clarity', rating: a.fluencyRating, tip: a.fluencyRating.tip },
                            { value: a.speakingRate > 0 ? `${a.speakingRate}` : 'N/A', label: 'Words / Min', rating: a.paceRating, tip: a.paceRating.tip },
                            { value: `${a.fillerWordsCount}`, label: 'Filler Words', rating: a.fillerRating, tip: a.fillerRating.tip },
                          ].map((metric, i) => (
                            <div key={i} className={`${metric.rating.bg} ${metric.rating.border} border rounded-2xl p-4 text-center`}>
                              <p className={`text-2xl font-bold tabular-nums mb-1 ${metric.rating.color}`}>{metric.value}</p>
                              <p className="text-[#6E6E73] text-xs font-medium uppercase tracking-widest mb-1">{metric.label}</p>
                              <p className="text-[#AEAEB2] text-[11px] leading-snug">{metric.tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Video + analysis */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#F2F2F7]">

                        {/* Video */}
                        <div className="p-6">
                          <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-3">Recording</p>
                          <div className="relative w-full rounded-2xl overflow-hidden bg-[#1D1D1F]" style={{ paddingTop: '56.25%' }}>
                            {(item.video_url || item.public_url) ? (
                              <video
                                controls
                                src={item.video_url || item.public_url}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-[#6E6E73] text-sm">Video not available</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stats + transcript */}
                        <div className="p-6 space-y-5">

                          {/* Quick stats */}
                          <div>
                            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-3">Quick Stats</p>
                            <div className="space-y-2">
                              {[
                                { label: 'Total words', value: a.totalWords || 0 },
                                { label: 'Filler words', value: `${a.fillerWordsCount}${a.totalWords > 0 ? ` (${((a.fillerWordsCount / a.totalWords) * 100).toFixed(1)}%)` : ''}` },
                                { label: 'Speech pauses', value: a.pausesCount || 0 },
                                ...(a.speakingRate > 0 ? [{ label: 'Speaking rate', value: `${a.speakingRate} WPM` }] : []),
                              ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] last:border-0">
                                  <span className="text-[#6E6E73] text-sm">{stat.label}</span>
                                  <span className="text-[#1D1D1F] text-sm font-medium tabular-nums">{stat.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Transcript */}
                          {(item.deepgram_transcript || item.elevenlabs_transcript) && (
                            <div>
                              <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">Transcript</p>
                              <p className="text-[#3A3A3C] text-sm leading-relaxed line-clamp-5">
                                {item.deepgram_transcript || item.elevenlabs_transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {item.gemini_analysis && (
                        <div className="px-6 py-5 border-t border-[#F2F2F7]">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">AI Coach Feedback</p>
                            <span className="text-[10px] font-semibold text-[#007AFF] bg-[#EAF4FF] px-2.5 py-1 rounded-full">Gemini</span>
                          </div>
                          <p className="text-[#3A3A3C] text-sm leading-relaxed whitespace-pre-wrap">{item.gemini_analysis}</p>
                        </div>
                      )}

                      {/* Frames */}
                      {item.frames && Array.isArray(item.frames) && item.frames.length > 0 && (
                        <div className="px-6 py-5 border-t border-[#F2F2F7]">
                          <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-3">
                            Key Frames · {item.frames.length}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {item.frames.map((frame, i) => (
                              <a key={i} href={frame.frame_url || frame.url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={frame.frame_url || frame.url}
                                  alt={`Frame ${i + 1}`}
                                  className="w-full h-20 object-cover rounded-xl border border-[#E8E8ED] hover:opacity-80 transition-opacity duration-150"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              !error && (
                <div className="bg-white border border-[#E8E8ED] rounded-3xl p-16 text-center shadow-sm">
                  <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-[#AEAEB2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-[#1D1D1F] text-lg font-semibold mb-2">No presentations yet</h3>
                  <p className="text-[#6E6E73] text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                    Upload your first video and we'll analyze your speech, pace, and delivery with AI.
                  </p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="px-6 py-2.5 bg-[#1D1D1F] text-white text-sm font-medium rounded-xl
                      hover:bg-[#3A3A3C] transition-colors duration-150 active:scale-95"
                  >
                    Upload a presentation
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}