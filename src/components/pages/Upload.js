import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import supabase, { getCurrentUser, getAuthHeaders } from "./supabaseClient";

export default function Upload() {
  const navigate = useNavigate();
  const [file, setFile] = useState(null);
  const [filename, setFilename] = useState("");
  const [publicUrl, setPublicUrl] = useState("");
  const [responses, setResponses] = useState([]);
  const [elevenLabsTranscript, setElevenLabsTranscript] = useState("");
  const [deepgramTranscript, setDeepgramTranscript] = useState("");
  const [llmAnalysisResult, setLlmAnalysisResult] = useState("");
  const [loading, setLoading] = useState(false);
  const [dragOver, setDragOver] = useState(false);
  const [showTextArea, setShowTextArea] = useState(false);
  const [manualTranscript, setManualTranscript] = useState("");
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [progress, setProgress] = useState(0);
  const [progressLabel, setProgressLabel] = useState("");
  const [activeTab, setActiveTab] = useState("visual");
  const fileInputRef = useRef(null);

  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "https://voicebackend-development.onrender.com";

  useEffect(() => { checkAuth(); }, []);

  const checkAuth = async () => {
    try {
      if (!supabase || !getCurrentUser) { setAuthChecked(true); return; }
      const currentUser = await getCurrentUser();
      if (currentUser && typeof currentUser.id === "string" && currentUser.id.includes("-")) {
        setUser(currentUser);
      } else { setUser(null); }
    } catch { toast.error("Failed to verify authentication."); }
    finally { setAuthChecked(true); }
  };

  const handleFileSelect = (selectedFile) => {
    if (!user) { toast.error("Please log in to upload files!"); navigate("/login"); return; }
    const maxSize = 500 * 1024 * 1024;
    const allowedTypes = ["video/mp4", "video/quicktime", "video/x-msvideo", "audio/mpeg", "audio/wav"];
    if (selectedFile.size > maxSize) { toast.error("File too large. Max 500MB."); return; }
    if (!allowedTypes.includes(selectedFile.type)) { toast.error("Unsupported format. Use MP4, MOV, AVI, MP3, or WAV."); return; }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault(); setDragOver(false);
    if (!user) { navigate("/login"); return; }
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) handleFileSelect(droppedFiles[0]);
  };

  const handleUpload = useCallback(async (e) => {
    if (e?.preventDefault) e.preventDefault();
    if (!user?.id?.includes("-")) { navigate("/login"); return; }
    if (!file) { toast.error("Select a file first."); return; }

    setLoading(true); setProgress(5); setProgressLabel("Uploading");
    setResponses([]); setElevenLabsTranscript(""); setDeepgramTranscript("");
    setLlmAnalysisResult(""); setPublicUrl("");

    try {
      const authHeaders = await getAuthHeaders();
      if (!authHeaders) throw new Error("No authentication headers");

      const formData = new FormData();
      formData.append("myvideo", file);
      formData.append("user_id", user.id);

      const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, { method: "POST", headers: authHeaders, body: formData });
      if (!uploadRes.ok) throw new Error(`Upload failed (${uploadRes.status})`);
      const uploadData = await uploadRes.json();
      setFilename(uploadData.videoName); setPublicUrl(uploadData.publicUrl);
      setProgress(25); setProgressLabel("Extracting frames");
      toast.success("File uploaded successfully");

      if (file.type.startsWith("video/")) {
        try {
          const ef = new FormData(); ef.append("videoName", uploadData.videoName);
          const er = await fetch(`${BACKEND_URL}/api/extractFrames`, { method: "POST", headers: authHeaders, body: ef });
          if (er.ok) {
            setProgress(40); setProgressLabel("Analyzing visuals");
            const ar = await fetch(`${BACKEND_URL}/api/analyzeAllFrames`, { headers: authHeaders });
            if (ar.ok) {
              const ad = await ar.json();
              const frames = Array.isArray(ad) ? ad : ad.responses || [];
              setResponses(frames.map(i => `${i.file}: ${i.description}`));
            }
          }
        } catch { toast.warn("Frame processing skipped."); }
      }

      setProgress(55); setProgressLabel("ElevenLabs transcription");
      try {
        const ef = new FormData(); ef.append("videoName", uploadData.videoName);
        const er = await fetch(`${BACKEND_URL}/api/transcribeWithElevenLabs`, { method: "POST", headers: authHeaders, body: ef });
        if (er.ok) { const ed = await er.json(); setElevenLabsTranscript(ed.transcript || "No transcript"); }
      } catch { toast.warn("ElevenLabs skipped."); }

      setProgress(72); setProgressLabel("Deepgram transcription");
      try {
        const df = new FormData(); df.append("videoName", uploadData.videoName);
        const dr = await fetch(`${BACKEND_URL}/api/transcribeWithDeepgram`, { method: "POST", headers: authHeaders, body: df });
        if (dr.ok) {
          const dd = await dr.json();
          const transcript = dd.transcript || "No transcript";
          setDeepgramTranscript(transcript);
          if (transcript && transcript !== "No transcript from Deepgram") {
            setProgress(88); setProgressLabel("Gemini AI analysis");
            const ar = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {
              method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
              body: JSON.stringify({ transcript }),
            });
            if (ar.ok) { const ad = await ar.json(); setLlmAnalysisResult(ad.analysis || "No analysis"); }
          }
        }
      } catch { toast.warn("Deepgram skipped."); }

      setProgress(100); setProgressLabel("Complete");
      toast.success("Analysis complete");
    } catch (err) {
      console.error(err);
      toast.error(`${err.message || "Something went wrong."}`);
      if (err.message?.includes("No authentication token")) navigate("/login");
    } finally { setLoading(false); setFile(null); }
  }, [file, user, BACKEND_URL, navigate]);

  useEffect(() => { if (file && user && !loading) handleUpload(); }, [file, user, loading, handleUpload]);

  const handleManualTextAnalysis = async () => {
    if (!user) { navigate("/login"); return; }
    if (!manualTranscript.trim()) { toast.error("Enter some text first."); return; }
    setLoading(true); setProgress(20); setProgressLabel("Analyzing text");
    try {
      const authHeaders = await getAuthHeaders();
      const ar = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {
        method: "POST", headers: { "Content-Type": "application/json", ...authHeaders },
        body: JSON.stringify({ transcript: manualTranscript }),
      });
      if (!ar.ok) throw new Error(ar.statusText);
      const ad = await ar.json();
      setLlmAnalysisResult(ad.analysis || "No analysis");
      setProgress(100); toast.success("Analysis complete");
    } catch (err) { toast.error(`Analysis failed: ${err.message}`); }
    finally { setLoading(false); }
  };

  const hasResults = responses.length > 0 || elevenLabsTranscript || deepgramTranscript || llmAnalysisResult || publicUrl;

  const tabs = [
    { id: "visual", label: "Visual", show: responses.length > 0 },
    { id: "elevenlabs", label: "ElevenLabs", show: !!elevenLabsTranscript },
    { id: "deepgram", label: "Deepgram", show: !!deepgramTranscript },
    { id: "ai", label: "AI Analysis", show: !!llmAnalysisResult },
  ].filter(t => t.show);

  // ── Auth loading ──────────────────────────────────────────────────────────
  if (!authChecked) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-[1.5px] border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6E6E73] text-sm tracking-wide">Loading</p>
        </div>
      </div>
    );
  }

  // ── Processing screen ────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center w-full max-w-xs px-8">
          <div className="w-10 h-10 border-[1.5px] border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto mb-8" />
          <p className="text-[#1D1D1F] text-lg font-semibold mb-1">{progressLabel}</p>
          <p className="text-[#6E6E73] text-sm mb-8 leading-relaxed">
            Running multiple AI models on your file. This takes a moment.
          </p>
          <div className="w-full bg-[#E8E8ED] rounded-full h-[2px] overflow-hidden">
            <div
              className="h-full bg-[#1D1D1F] rounded-full transition-all duration-700 ease-out"
              style={{ width: `${progress}%` }}
            />
          </div>
          <div className="flex justify-between mt-2">
            <span className="text-[#AEAEB2] text-xs">Processing</span>
            <span className="text-[#1D1D1F] text-xs font-medium">{progress}%</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Main page ────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-24 pb-20 px-4">
      <div className="max-w-2xl mx-auto">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[#1D1D1F] text-[2rem] font-bold tracking-tight leading-tight mb-2">
            Presentation Analysis
          </h1>
          <p className="text-[#6E6E73] text-base leading-relaxed">
            Upload a video or audio file. AI will transcribe your speech,
            analyze delivery, and surface actionable feedback.
          </p>
        </div>

        {/* Auth banners */}
        {!user && (
          <div className="mb-5 flex items-start gap-3 bg-[#FFFBEB] border border-[#FDE68A] rounded-2xl p-4">
            <svg className="w-4 h-4 text-[#92400E] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-[#92400E] text-sm leading-relaxed">
              You're not signed in.{" "}
              <button onClick={() => navigate("/login")} className="font-semibold underline underline-offset-2 hover:no-underline">
                Sign in to upload
              </button>
              {" "}and access your analysis history.
            </p>
          </div>
        )}

        {user && (
          <div className="mb-5 flex items-center gap-3 bg-white border border-[#E8E8ED] rounded-2xl p-4">
            <div className="w-9 h-9 rounded-full bg-[#1D1D1F] flex items-center justify-center flex-shrink-0">
              <span className="text-white text-sm font-semibold">{user.email?.[0]?.toUpperCase()}</span>
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-[#1D1D1F] text-sm font-medium truncate">{user.email}</p>
              <p className="text-[#6E6E73] text-xs">Signed in · Ready to upload</p>
            </div>
            <div className="w-2 h-2 rounded-full bg-[#34C759] flex-shrink-0" title="Active" />
          </div>
        )}

        {/* Upload card */}
        <div className="bg-white border border-[#E8E8ED] rounded-3xl overflow-hidden mb-3 shadow-sm">

          {/* Drop zone */}
          <div
            onClick={() => user ? fileInputRef.current?.click() : navigate("/login")}
            onDragOver={(e) => { e.preventDefault(); if (user) setDragOver(true); }}
            onDragLeave={(e) => { e.preventDefault(); setDragOver(false); }}
            onDrop={handleDrop}
            className={`
              px-10 py-14 text-center select-none transition-all duration-200
              ${!user
                ? "opacity-40 cursor-not-allowed"
                : dragOver
                  ? "bg-[#EBF5FF] cursor-copy"
                  : "cursor-pointer hover:bg-[#FAFAFA]"
              }
            `}
          >
            <div className={`
              w-16 h-16 rounded-2xl mx-auto mb-5 flex items-center justify-center transition-all duration-200
              ${dragOver ? "bg-[#007AFF] scale-105 shadow-lg shadow-blue-200" : "bg-[#F5F5F7]"}
            `}>
              <svg
                className={`w-7 h-7 transition-colors duration-200 ${dragOver ? "text-white" : "text-[#AEAEB2]"}`}
                fill="none" stroke="currentColor" viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.6}
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12" />
              </svg>
            </div>

            <p className={`text-base font-semibold mb-1.5 transition-colors duration-200 ${dragOver ? "text-[#007AFF]" : "text-[#1D1D1F]"}`}>
              {dragOver ? "Drop to upload" : user ? "Drag file here, or click to browse" : "Sign in to upload files"}
            </p>
            <p className="text-[#AEAEB2] text-sm">MP4 · MOV · AVI · MP3 · WAV · up to 500 MB</p>

            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.avi,.mp3,.wav"
              className="hidden"
              onChange={(e) => { if (e.target.files?.[0]) handleFileSelect(e.target.files[0]); }}
              disabled={!user}
            />
          </div>

          {/* Divider */}
          <div className="h-px bg-[#F2F2F7] mx-6" />

          {/* Text analysis toggle */}
          <button
            onClick={() => setShowTextArea(p => !p)}
            disabled={!user}
            className="w-full px-6 py-4 flex items-center justify-between text-left
              hover:bg-[#FAFAFA] transition-colors duration-150 disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <div>
              <p className="text-[#1D1D1F] text-sm font-medium">Analyze text instead</p>
              <p className="text-[#AEAEB2] text-xs mt-0.5">Paste a transcript for direct AI feedback</p>
            </div>
            <svg
              className={`w-4 h-4 text-[#AEAEB2] transition-transform duration-200 ${showTextArea ? "rotate-180" : ""}`}
              fill="none" stroke="currentColor" viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {showTextArea && (
            <div className="px-6 pb-6">
              <div className="h-px bg-[#F2F2F7] mb-5" />
              <textarea
                rows={5}
                placeholder="Paste your speech, presentation notes, or any transcript here..."
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                disabled={!user}
                className="w-full bg-[#F5F5F7] rounded-xl border border-transparent text-[#1D1D1F]
                  placeholder-[#C7C7CC] text-sm p-4 resize-none outline-none leading-relaxed
                  focus:border-[#007AFF] focus:bg-white transition-all duration-200"
              />
              <div className="flex items-center justify-between mt-3">
                <p className="text-[#AEAEB2] text-xs">
                  {manualTranscript.length} characters
                </p>
                <button
                  onClick={handleManualTextAnalysis}
                  disabled={loading || !manualTranscript.trim() || !user}
                  className="px-5 py-2 bg-[#1D1D1F] text-white text-sm font-medium rounded-xl
                    hover:bg-[#3A3A3C] active:scale-95 transition-all duration-150
                    disabled:opacity-30 disabled:cursor-not-allowed disabled:active:scale-100"
                >
                  Analyze
                </button>
              </div>
            </div>
          )}
        </div>

        {/* Format info strip */}
        <div className="flex items-center gap-1.5 flex-wrap px-1 mb-12">
          {["MP4", "MOV", "AVI", "MP3", "WAV"].map(f => (
            <span key={f} className="px-2.5 py-1 bg-white border border-[#E8E8ED] rounded-full text-[#6E6E73] text-xs font-medium">
              {f}
            </span>
          ))}
          <span className="text-[#C7C7CC] text-xs px-1">·</span>
          <span className="text-[#AEAEB2] text-xs">Max 500 MB</span>
        </div>

        {/* Results ─────────────────────────────────────────────────────────── */}
        {hasResults && (
          <div>
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-[#1D1D1F] text-xl font-bold tracking-tight">Results</h2>
              {publicUrl && (
                <a
                  href={publicUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[#007AFF] text-sm font-medium hover:underline underline-offset-2"
                >
                  {filename || "View file"} ↗
                </a>
              )}
            </div>

            {/* Tab bar */}
            {tabs.length > 1 && (
              <div className="flex gap-1 bg-[#F2F2F7] p-1 rounded-xl mb-4 overflow-x-auto">
                {tabs.map(tab => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`flex-1 whitespace-nowrap py-1.5 px-3 text-sm font-medium rounded-lg transition-all duration-150
                      ${activeTab === tab.id
                        ? "bg-white text-[#1D1D1F] shadow-sm"
                        : "text-[#6E6E73] hover:text-[#1D1D1F]"
                      }`}
                  >
                    {tab.label}
                  </button>
                ))}
              </div>
            )}

            {/* Result panels */}
            <div className="bg-white border border-[#E8E8ED] rounded-3xl overflow-hidden shadow-sm">

              {activeTab === "visual" && responses.length > 0 && (
                <div className="p-6">
                  <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-5">Visual Analysis</p>
                  <ul className="space-y-4">
                    {responses.map((r, i) => (
                      <li key={i} className="flex items-start gap-4">
                        <span className="w-6 h-6 rounded-full bg-[#F5F5F7] flex items-center justify-center flex-shrink-0 mt-0.5 text-[#6E6E73] text-xs font-semibold">
                          {i + 1}
                        </span>
                        <p className="text-[#3A3A3C] text-sm leading-relaxed">{r}</p>
                      </li>
                    ))}
                  </ul>
                </div>
              )}

              {activeTab === "elevenlabs" && elevenLabsTranscript && (
                <div className="p-6">
                  <div className="flex items-center gap-2 mb-5">
                    <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">ElevenLabs Transcript</p>
                  </div>
                  <p className="text-[#3A3A3C] text-sm leading-relaxed">{elevenLabsTranscript}</p>
                </div>
              )}

              {activeTab === "deepgram" && deepgramTranscript && (
                <div className="p-6">
                  <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-5">Deepgram Transcript</p>
                  <p className="text-[#3A3A3C] text-sm leading-relaxed">{deepgramTranscript}</p>
                </div>
              )}

              {activeTab === "ai" && llmAnalysisResult && (
                <div className="p-6">
                  <div className="flex items-center justify-between mb-5">
                    <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">Gemini AI Analysis</p>
                    <span className="text-[10px] font-semibold text-[#007AFF] bg-[#EAF4FF] px-2.5 py-1 rounded-full">
                      AI · Gemini
                    </span>
                  </div>
                  <p className="text-[#3A3A3C] text-sm leading-relaxed whitespace-pre-wrap">{llmAnalysisResult}</p>
                </div>
              )}

              {/* Single tab fallback */}
              {tabs.length === 1 && tabs[0].id === "elevenlabs" && (
                <div className="p-6">
                  <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-5">Transcript</p>
                  <p className="text-[#3A3A3C] text-sm leading-relaxed">{elevenLabsTranscript}</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>

      <ToastContainer
        position="bottom-right"
        autoClose={4000}
        hideProgressBar
        draggable
        theme="light"
        toastClassName="!rounded-2xl !text-sm !font-medium !shadow-lg !border !border-[#E8E8ED]"
      />
    </div>
  );
}