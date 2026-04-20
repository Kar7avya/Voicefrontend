// // ============================================
// // EXECUTION FLOW OVERVIEW
// // ============================================
// //
// // STEP 1  → Component mounts
// //            TeleprompterBox renders in "edit" mode by default.
// //            All state variables are initialized (Section 1).
// //
// // STEP 2  → User uploads/pastes script
// //            The textarea captures typed or pasted text.
// //            A file input accepts .txt uploads (Section 2).
// //            Both update the `originalScript` state.
// //
// // STEP 3  → Script stored in state (originalScript)
// //            The raw text lives in `originalScript`.
// //            `lines` is derived from `originalScript` for the
// //            existing teleprompter scrolling engine.
// //
// // STEP 4  → User clicks "Enhance Script"
// //            The button calls handleEnhance() (Section 3).
// //            It sets isEnhancing=true and clears prior errors.
// //
// // STEP 5  → enhanceScriptWithGemini() runs
// //            The service module (enhanceScriptService.js) is called.
// //            It builds a prompt, calls the Gemini API.
// //
// // STEP 6  → Backend API call
// //            The @google/genai SDK sends the request to Gemini.
// //            Loading spinner is visible (Section 4).
// //
// // STEP 7  → AI response received
// //            The raw JSON text comes back from Groq.
// //            The service parses and validates it.
// //
// // STEP 8  → Parsed into enhancedData state
// //            The validated object is stored in `enhancedData` (Section 5).
// //            ViewMode switches to "review".
// //
// // STEP 9  → Panels render enhanced content
// //            Four panels display: enhanced script, key points,
// //            memory anchors, flow structure (Section 6).
// //
// // STEP 10 → User clicks "Start Practice"
// //            ViewMode switches to "practice".
// //            The enhanced script feeds the teleprompter (Section 7).
// //
// // STEP 11 → Teleprompter mode activates
// //            Existing start/stop logic runs the scrolling engine.
// //            Word-by-word highlighting is preserved from original code.
// //            Modulation tags are styled visually.
// //
// // STEP 12 → Camera preview activates
// //            Camera is managed by the parent Teleprompter.js
// //            and CameraPreview.js — no changes needed here (Section 8).
// //
// // This section explains the entire lifecycle from start to finish.
// // ============================================

// import { useState, useEffect, useRef } from "react";
// import { enhanceScriptWithGroq } from "./enhanceScriptService";

// // ============================================
// // EXISTING ANALYSIS ENGINE — DO NOT MODIFY
// // ============================================
// // The following utility functions (normalizeSession through scoreLabel)
// // are the original DAY 11.x analysis engine. They handle session
// // normalization, pause detection, pace analysis, rhythm drift,
// // problem sentence detection, coaching summary generation,
// // session scoring, and score labeling.
// //
// // THESE FUNCTIONS ARE PRESERVED EXACTLY AS-IS.
// // ============================================

// /* =========================================================
//    DAY 11.x — CORE ANALYSIS ENGINE (INTERNAL)
//    These are analysis utilities, NOT UI days
// ========================================================= */

// /* DAY 11.1 — NORMALIZATION
//    Converts raw timeline events into per-sentence durations */
// function normalizeSession(events, lines) {
//   const result = [];
//   const lineEvents = events.filter(e => e.type === "line");
//   const stopEvent = events.find(e => e.type === "stop");
//   if (!stopEvent) return result;

//   for (let i = 0; i < lineEvents.length; i++) {
//     const current = lineEvents[i];
//     const next = lineEvents[i + 1];

//     const startTime = current.time;
//     const endTime = next ? next.time : stopEvent.time;

//     result.push({
//       index: current.index,
//       text: lines[current.index],
//       startTime,
//       endTime,
//       actualDuration: endTime - startTime
//     });
//   }
//   return result;
// }

// /* DAY 11.2 — EXPECTED TIME + PAUSE DETECTION */
// function expectedDuration(line, wpm) {
//   const words = line.trim().split(/\s+/).length;
//   return (60000 / wpm) * words;
// }

// function detectPauses(normalizedLines, wpm) {
//   const tolerance = 500;
//   return normalizedLines.map(item => {
//     const expected = expectedDuration(item.text, wpm);
//     return {
//       ...item,
//       expectedDuration: expected,
//       paused: item.actualDuration > expected + tolerance
//     };
//   });
// }

// /* DAY 11.3 — PACE ANALYSIS */
// function analyzePace(linesWithTiming) {
//   const analyzed = linesWithTiming.map(line => {
//     const ratio = line.actualDuration / line.expectedDuration;
//     let paceLabel = "normal";
//     if (ratio < 0.8) paceLabel = "rushed";
//     else if (ratio > 1.3) paceLabel = "slow";

//     return {
//       ...line,
//       paceRatio: Number(ratio.toFixed(2)),
//       paceLabel
//     };
//   });

//   const ratios = analyzed.map(l => l.paceRatio);
//   const avg = ratios.reduce((s, r) => s + r, 0) / ratios.length;
//   const variance =
//     ratios.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / ratios.length;

//   return {
//     perLine: analyzed,
//     session: {
//       averagePace: Number(avg.toFixed(2)),
//       paceVariance: Number(variance.toFixed(4)),
//       paceStability: Number(Math.max(0, 1 - Math.sqrt(variance)).toFixed(2))
//     }
//   };
// }

// /* DAY 11.4 — RHYTHM DRIFT */
// function analyzeRhythmDrift(perLine) {
//   if (perLine.length < 3) return { drift: "insufficient-data" };

//   const third = Math.floor(perLine.length / 3);
//   const early = perLine.slice(0, third);
//   const late = perLine.slice(third * 2);

//   const avg = arr => arr.reduce((s, l) => s + l.paceRatio, 0) / arr.length;

//   const earlyAvg = avg(early);
//   const lateAvg = avg(late);

//   let drift = "stable";
//   if (lateAvg - earlyAvg > 0.25) drift = "slowing-down";
//   if (earlyAvg - lateAvg > 0.25) drift = "rushing-over-time";

//   return { drift };
// }

// /* DAY 11.5 — PROBLEM SENTENCES */
// function detectProblemSentences(perLine) {
//   const problemLines = perLine.filter(
//     l => l.paused || l.paceRatio < 0.8 || l.paceRatio > 1.3
//   );

//   return {
//     problemLines,
//     difficultyScore: Number(
//       (problemLines.length / perLine.length).toFixed(2)
//     )
//   };
// }

// /* DAY 11.6 — COACHING SUMMARY */
// function generateCoachingSummary({ paceSummary, drift, problems }) {
//   const feedback = [];

//   if (paceSummary.averagePace < 0.9)
//     feedback.push("You spoke too fast overall.");
//   else if (paceSummary.averagePace > 1.2)
//     feedback.push("You spoke too slowly overall.");
//   else feedback.push("Your pace was well controlled.");

//   if (drift.drift !== "stable")
//     feedback.push(`Rhythm issue: ${drift.drift.replace("-", " ")}`);

//   if (problems.problemLines.length > 0)
//     feedback.push(
//       `Focus on ${problems.problemLines.length} difficult sentence(s).`
//     );

//   return feedback.join(" ");
// }

// /* DAY 11.7 — SESSION SCORE */
// function calculateSessionScore({ paceSummary, drift, problems }) {
//   let score = 100;
//   score -= Math.min(20, Math.abs(paceSummary.averagePace - 1) * 40);
//   score -= Math.min(20, (1 - paceSummary.paceStability) * 20);
//   if (drift.drift !== "stable") score -= 15;
//   score -= Math.min(25, problems.difficultyScore * 100);
//   return Math.max(0, Math.round(score));
// }

// /* =========================================================
//    DAY 1 — USER FEEDBACK FOUNDATION
//    Session score + coaching + problem sentences
// ========================================================= */
// function scoreLabel(score) {
//   if (score >= 85) return "Excellent";
//   if (score >= 65) return "Good";
//   return "Needs Work";
// }

// // ============================================
// // END OF EXISTING ANALYSIS ENGINE
// // ============================================

// // ============================================
// // SECTION 7 HELPER: TAG RENDERER
// // ============================================
// //
// // WHAT THIS FUNCTION DOES:
// //   Takes a line of enhanced script text and renders modulation
// //   tags ([PAUSE], [SLOW], [FAST], [EMPHASIZE]) as styled badges,
// //   while rendering normal text as plain spans.
// //
// // WHY IT EXISTS:
// //   The Groq-enhanced script contains inline tags that need
// //   visual treatment during practice mode so the speaker can
// //   see delivery cues at a glance.
// //
// // WHEN IT RUNS:
// //   Called during JSX rendering of each line in practice mode.
// //
// function renderTaggedLine(text, lineIndex, currentLine, currentWord) {
//   const tagPattern = /(\[PAUSE\]|\[SLOW\]|\[FAST\]|\[EMPHASIZE\])/g;
//   const segments = text.split(tagPattern);

//   let wordCounter = 0;
//   const elements = [];

//   segments.forEach((segment, segIdx) => {
//     const tagMatch = segment.match(/^\[(PAUSE|SLOW|FAST|EMPHASIZE)\]$/);
//     if (tagMatch) {
//       const tagType = tagMatch[1].toLowerCase();
//       elements.push(
//         <span key={`tag-${segIdx}`} className={`teleprompter-tag-${tagType}`}>
//           {tagMatch[1]}
//         </span>
//       );
//     } else {
//       const words = segment.match(/\w+|[.,!?;:'"()-]/g) || [];
//       words.forEach((word, wIdx) => {
//         const globalWordIdx = wordCounter;
//         wordCounter++;
//         elements.push(
//           <span
//             key={`word-${segIdx}-${wIdx}`}
//             className={
//               lineIndex === currentLine && globalWordIdx === currentWord
//                 ? "tp-word-active"
//                 : "tp-word-dim"
//             }
//             style={{ marginRight: /\w+/.test(word) ? 6 : 2 }}
//           >
//             {word}
//           </span>
//         );
//       });
//     }
//   });

//   return elements;
// }

// /* =========================================================
//    TELEPROMPTER COMPONENT
// ========================================================= */
// export default function TeleprompterBox({ onStartVideo, onStopVideo }) {

//   // ============================================
//   // SECTION 1: STATE INITIALIZATION
//   // ============================================
//   //
//   // This section declares ALL state variables used by the component.
//   // They are organized into three groups:
//   //   A) Original teleprompter states (from existing code)
//   //   B) AI enhancement states (new)
//   //   C) View mode states (new)
//   //
//   // Every variable includes a comment explaining its purpose.
//   // ============================================

//   // --- A) ORIGINAL TELEPROMPTER STATES (PRESERVED) ---

//   // The raw script text entered by the user
//   const [originalScript, setOriginalScript] = useState(
//     "Good morning everyone, and thank you for being here today. Confidence is not something you are born with, it is something you build slowly over time."
//   );

//   // Whether the teleprompter scrolling is currently active
//   const [isRunning, setIsRunning] = useState(false);

//   // Index of the currently highlighted sentence (0-based)
//   const [currentLine, setCurrentLine] = useState(0);

//   // Index of the currently highlighted word within the current sentence
//   const [currentWord, setCurrentWord] = useState(0);

//   // Words-per-minute speed for the teleprompter
//   const [wpm] = useState(120);

//   // Timestamp when the current session started (for duration calculations)
//   const [sessionStart, setSessionStart] = useState(null);

//   // Array of timeline events: { type: "start"|"line"|"stop", time, index? }
//   const [, setEvents] = useState([]);

//   // --- DAY 1 UI STATE (PRESERVED) ---
//   // Session score displayed after stopping
//   const [sessionScoreUI, setSessionScoreUI] = useState(null);
//   // Coaching feedback text
//   const [coachingText, setCoachingText] = useState("");
//   // Array of problem sentence objects
//   const [problemLinesUI, setProblemLinesUI] = useState([]);

//   // --- DAY 2 UI STATE (PRESERVED) ---
//   // Pace timeline data for the colored bar visualization
//   const [timelineData, setTimelineData] = useState([]);

//   // --- B) AI ENHANCEMENT STATES (NEW) ---

//   // The structured response from Groq after enhancement
//   // Shape: { enhanced_script, key_points, memory_summary, flow_structure, modulation_notes }
//   const [enhancedData, setEnhancedData] = useState(null);

//   // Whether the AI enhancement API call is in progress
//   const [isEnhancing, setIsEnhancing] = useState(false);

//   // Error message from the enhancement process (null = no error)
//   const [enhanceError, setEnhanceError] = useState(null);

//   // --- C) VIEW MODE STATE (NEW) ---

//   // Controls which UI panel is visible:
//   //   "edit"     → Script editing mode (textarea + upload)
//   //   "review"   → Enhanced script review panels
//   //   "practice" → Immersive teleprompter practice mode
//   const [viewMode, setViewMode] = useState("edit");

//   // --- D) FILE UPLOAD REF (NEW) ---
//   const fileInputRef = useRef(null);

//   // ============================================
//   // DERIVED VALUES
//   // ============================================
//   //
//   // `activeScript` determines which script text to use:
//   //   - In practice mode with enhanced data → use enhanced_script
//   //   - Otherwise → use originalScript
//   //
//   // `lines` splits the active script into sentences for
//   // the existing teleprompter scrolling engine.
//   // ============================================

//   const activeScript =
//     viewMode === "practice" && enhancedData
//       ? enhancedData.enhanced_script
//       : originalScript;

//   // Strip modulation tags for timing calculations (so [PAUSE] doesn't count as a word)
//   const cleanScript = activeScript.replace(/\[(PAUSE|SLOW|FAST|EMPHASIZE)\]/g, "").trim();
//   const lines = cleanScript.split(/(?<=[.!?])\s+/).filter(Boolean);

//   // Keep the raw (tagged) lines for rendering in practice mode
//   const taggedLines = activeScript.split(/(?<=[.!?])\s+/).filter(Boolean);

//   // ============================================
//   // SECTION 2: SCRIPT INPUT HANDLING
//   // ============================================
//   //
//   // WHAT THIS SECTION DOES:
//   //   Provides two ways for the user to input their script:
//   //   1. Direct typing/pasting into the textarea
//   //   2. Uploading a .txt file
//   //
//   // WHY IT EXISTS:
//   //   Users may have their scripts in text files or may prefer
//   //   to copy-paste from another application.
//   //
//   // WHEN IT RUNS:
//   //   - Textarea onChange fires on every keystroke/paste
//   //   - File handler fires when a .txt file is selected
//   // ============================================

//   /**
//    * handleFileUpload — Reads a .txt file and loads its content into state.
//    *
//    * WHAT THIS FUNCTION DOES:
//    *   Uses FileReader to read the selected text file and sets
//    *   the content as the originalScript.
//    *
//    * WHY IT EXISTS:
//    *   Allows users to import scripts from files instead of
//    *   manual copy-paste.
//    *
//    * WHEN IT RUNS:
//    *   When the user selects a .txt file via the file input.
//    */
//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;

//     // Only accept text files
//     if (!file.name.endsWith(".txt")) {
//       setEnhanceError("Only .txt files are supported. Please select a text file.");
//       return;
//     }

//     const reader = new FileReader();
//     reader.onload = (event) => {
//       const text = event.target.result;
//       setOriginalScript(text);
//       setEnhanceError(null);
//       // Reset enhancement data when a new script is loaded
//       setEnhancedData(null);
//       setViewMode("edit");
//     };
//     reader.onerror = () => {
//       setEnhanceError("Failed to read the file. Please try again.");
//     };
//     reader.readAsText(file);
//   };

//   // ============================================
//   // SECTION 3: GROQ SCRIPT ENHANCEMENT FUNCTION
//   // ============================================
//   //
//   // WHAT THIS SECTION DOES:
//   //   Calls the enhanceScriptWithGroq service when the user
//   //   clicks "Enhance Script". Manages loading and error states.
//   //
//   // WHY IT EXISTS:
//   //   This is the bridge between the UI and the AI service.
//   //   It handles the async lifecycle: loading → success/error.
//   //
//   // WHEN IT RUNS:
//   //   When the user clicks the "Enhance Script" button.
//   // ============================================

//   /**
//    * handleEnhance — Triggers the AI enhancement workflow.
//    *
//    * WHAT THIS FUNCTION DOES:
//    *   1. Sets loading state
//    *   2. Calls enhanceScriptWithGroq() from the service module
//    *   3. On success: stores the result and switches to review mode
//    *   4. On failure: displays the error message
//    *
//    * WHY IT EXISTS:
//    *   Encapsulates the entire enhancement flow in one function
//    *   so the button's onClick handler stays clean.
//    *
//    * WHEN IT RUNS:
//    *   User clicks "✨ Enhance Script" button.
//    */
//   const handleEnhance = async () => {
//     // SECTION 4: LOADING STATE — set loading, clear previous errors
//     setIsEnhancing(true);
//     setEnhanceError(null);

//     try {
//       // Call the Groq service (Section 3 → enhanceScriptService.js)
//       const result = await enhanceScriptWithGroq(originalScript);

//       // SECTION 5: PROCESSING AI RESPONSE
//       // Store the validated structured output in state
//       setEnhancedData(result);

//       // Switch to review mode so panels render
//       setViewMode("review");
//     } catch (error) {
//       // SECTION 4: ERROR STATE — display the error message
//       setEnhanceError(error.message);
//     } finally {
//       // SECTION 4: LOADING STATE — clear loading regardless of outcome
//       setIsEnhancing(false);
//     }
//   };

//   // ============================================
//   // EXISTING SESSION LOGIC — PRESERVED
//   // ============================================
//   //
//   // The startSession and stopSession functions below are the
//   // ORIGINAL teleprompter session logic. They have NOT been
//   // modified except to use the `lines` derived value which
//   // now respects the active script (original or enhanced).
//   // ============================================

//   /* =========================
//      START SESSION
//   ========================= */
//   const startSession = () => {
//     setTimelineData([]);
//     setSessionScoreUI(null);
//     setCoachingText("");
//     setProblemLinesUI([]);

//     setSessionStart(Date.now());
//     setEvents([
//       { type: "start", time: 0 },
//       { type: "line", index: 0, time: 0 }
//     ]);

//     setCurrentLine(0);
//     setCurrentWord(0);
//     setIsRunning(true);
//     onStartVideo?.();
//   };

//   /* =========================
//      STOP SESSION
//   ========================= */
//   const stopSession = () => {
//     setIsRunning(false);
//     const endTime = Date.now() - sessionStart;

//     setEvents(prev => {
//       const updated = [...prev, { type: "stop", time: endTime }];

//       const normalized = normalizeSession(updated, lines);
//       const pauses = detectPauses(normalized, wpm);
//       const pace = analyzePace(pauses);
//       const drift = analyzeRhythmDrift(pace.perLine);
//       const problems = detectProblemSentences(pace.perLine);

//       /* ===== DAY 1 OUTPUT ===== */
//       setSessionScoreUI(
//         calculateSessionScore({ paceSummary: pace.session, drift, problems })
//       );
//       setCoachingText(
//         generateCoachingSummary({ paceSummary: pace.session, drift, problems })
//       );
//       setProblemLinesUI(problems.problemLines);

//       /* ===== DAY 2 OUTPUT (PACE TIMELINE) ===== */
//       setTimelineData(
//         pace.perLine.map(l =>
//           l.paused || l.paceRatio > 1.3
//             ? "slow"
//             : l.paceRatio < 0.8
//               ? "rushed"
//               : "normal"
//         )
//       );

//       return updated;
//     });

//     onStopVideo?.();
//   };

//   // ============================================
//   // EXISTING TIMING EFFECTS — PRESERVED
//   // ============================================

//   /* =========================
//      SENTENCE TIMING
//   ========================= */
//   useEffect(() => {
//     if (!isRunning || currentLine >= lines.length) return;
//     const delay = (60000 / wpm) * lines[currentLine].split(/\s+/).length;
//     const t = setTimeout(() => {
//       setCurrentLine(l => l + 1);
//       setCurrentWord(0);
//     }, delay);
//     return () => clearTimeout(t);
//   }, [isRunning, currentLine, wpm, lines]);

//   /* =========================
//      WORD TIMING
//   ========================= */
//   useEffect(() => {
//     if (!isRunning || currentLine >= lines.length) return;
//     const tokens = lines[currentLine].match(/\w+|[.,!?]/g) || [];
//     if (currentWord >= tokens.length) return;
//     const t = setTimeout(() => setCurrentWord(w => w + 1), 60000 / wpm);
//     return () => clearTimeout(t);
//   }, [isRunning, currentWord, currentLine, wpm, lines]);

//   // ============================================
//   // SECTION 8: CAMERA PREVIEW INTEGRATION
//   // ============================================
//   //
//   // WHAT THIS SECTION DOES:
//   //   Camera preview is managed entirely by the parent component
//   //   (Teleprompter.js) and the CameraPreview.js component.
//   //   No changes are needed here.
//   //
//   // WHY IT EXISTS (as a comment section):
//   //   Documents that camera integration is intentionally handled
//   //   upstream, not in this component. This avoids confusion
//   //   about where camera logic lives.
//   //
//   // WHEN IT RUNS:
//   //   Camera activates when the parent's cameraOn state is true.
//   //   The camera preview renders behind the TeleprompterBox overlay.
//   //   During practice mode, both camera and teleprompter run
//   //   simultaneously — the camera as a background video feed,
//   //   the teleprompter as a semi-transparent overlay on top.
//   // ============================================

//   // ============================================
//   // SECTION 9: CONDITIONAL RENDER LOGIC
//   // ============================================
//   //
//   // WHAT THIS SECTION DOES:
//   //   Renders one of three UI modes based on the `viewMode` state:
//   //     "edit"     → Script input textarea + file upload + Enhance button
//   //     "review"   → Enhanced script panels + Start Practice button
//   //     "practice" → Immersive teleprompter with tag styling + Start/Stop
//   //
//   // WHY IT EXISTS:
//   //   A single component manages the full user journey.
//   //   The mode-based rendering keeps the UI clean and focused
//   //   on one task at a time.
//   //
//   // WHEN IT RUNS:
//   //   On every render. React evaluates the viewMode and renders
//   //   the appropriate panel.
//   // ============================================

//   return (
//     <div className="tp-card">

//       {/* --- MODE SWITCHER TABS --- */}
//       <div className="teleprompter-mode-bar">
//         <button
//           className={`btn btn-sm ${viewMode === "edit" ? "active-mode" : ""}`}
//           onClick={() => setViewMode("edit")}
//           disabled={isRunning}
//         >
//           ✏️ Edit
//         </button>
//         <button
//           className={`btn btn-sm ${viewMode === "review" ? "active-mode" : ""}`}
//           onClick={() => setViewMode("review")}
//           disabled={!enhancedData || isRunning}
//         >
//           📊 Review
//         </button>
//         <button
//           className={`btn btn-sm ${viewMode === "practice" ? "active-mode" : ""}`}
//           onClick={() => setViewMode("practice")}
//           disabled={isRunning}
//         >
//           🎯 Practice
//         </button>
//       </div>

//       {/* ============================================
//           SECTION 4: LOADING + ERROR STATE
//           ============================================ */}

//       {/* Cinematic Loading Spinner */}
//       {isEnhancing && (
//         <div className="teleprompter-spinner-overlay">
//           <div className="tp-spinner"></div>
//           <p className="tp-spinner-text">Enhancing your script…</p>
//           <p className="tp-spinner-sub">AI is analyzing structure, flow & delivery — 10-20s</p>
//         </div>
//       )}

//       {/* Error Alert */}
//       {enhanceError && (
//         <div className="teleprompter-error">
//           <span>⚠️</span>
//           <span><strong>Enhancement Error:</strong> {enhanceError}</span>
//           <button
//             className="tp-error-dismiss"
//             onClick={() => setEnhanceError(null)}
//           >
//             Dismiss
//           </button>
//         </div>
//       )}

//       {/* ============================================
//           EDIT MODE
//           ============================================ */}
//       {viewMode === "edit" && !isEnhancing && (
//         <div className="tp-fade-in">
//           <textarea
//             className="tp-textarea"
//             rows={6}
//             value={originalScript}
//             onChange={e => {
//               setOriginalScript(e.target.value);
//               setEnhancedData(null);
//             }}
//             disabled={isRunning}
//             placeholder="Paste or type your speech script here…"
//           />

//           {/* File Upload */}
//           <div
//             className="teleprompter-upload-zone"
//             onClick={() => fileInputRef.current?.click()}
//           >
//             <input
//               type="file"
//               accept=".txt"
//               ref={fileInputRef}
//               onChange={handleFileUpload}
//             />
//             <span className="tp-upload-icon">📄</span>
//             <p className="tp-upload-label">
//               Click to upload a .txt script file
//             </p>
//           </div>

//           {/* CTA Buttons */}
//           <div className="d-flex gap-2 mb-3">
//             <button
//               className="btn btn-enhance flex-grow-1"
//               onClick={handleEnhance}
//               disabled={isEnhancing || !originalScript.trim()}
//             >
//               ✨ Enhance with AI
//             </button>
//             <button
//               className="btn btn-practice"
//               onClick={() => setViewMode("practice")}
//               disabled={!originalScript.trim()}
//             >
//               🎯 Quick Practice
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ============================================
//           REVIEW MODE — Enhanced Panels
//           ============================================ */}
//       {viewMode === "review" && enhancedData && !isEnhancing && (
//         <div className="tp-fade-in">
//           {/* Enhanced Script */}
//           <div className="teleprompter-enhance-panel tp-panel-script">
//             <h6>📝 Enhanced Script</h6>
//             <div className="teleprompter-enhanced-text">
//               {enhancedData.enhanced_script}
//             </div>
//           </div>

//           {/* Key Points */}
//           <div className="teleprompter-enhance-panel tp-panel-points">
//             <h6>🎯 Key Points</h6>
//             <ul>
//               {enhancedData.key_points.map((point, i) => (
//                 <li key={i}>{point}</li>
//               ))}
//             </ul>
//           </div>

//           {/* Memory Anchors */}
//           <div className="teleprompter-enhance-panel tp-panel-memory">
//             <h6>🧠 Memory Anchors</h6>
//             <ul>
//               {enhancedData.memory_summary.map((anchor, i) => (
//                 <li key={i}>{anchor}</li>
//               ))}
//             </ul>
//           </div>

//           {/* Flow Structure */}
//           <div className="teleprompter-enhance-panel tp-panel-flow">
//             <h6>📋 Flow Structure</h6>
//             <ul>
//               {enhancedData.flow_structure.map((section, i) => (
//                 <li key={i}>
//                   <span style={{ color: "#a5b4fc", fontWeight: 600 }}>Step {i + 1}:</span>{" "}
//                   {section}
//                 </li>
//               ))}
//             </ul>
//           </div>

//           {/* Delivery Tips */}
//           <div className="teleprompter-enhance-panel tp-panel-tips">
//             <h6>🎙️ Delivery Tips</h6>
//             <ul>
//               {enhancedData.modulation_notes.map((note, i) => (
//                 <li key={i}>{note}</li>
//               ))}
//             </ul>
//           </div>

//           <div className="tp-divider"></div>

//           {/* CTAs */}
//           <div className="d-flex gap-2">
//             <button
//               className="btn btn-edit"
//               onClick={() => setViewMode("edit")}
//             >
//               ✏️ Edit Script
//             </button>
//             <button
//               className="btn btn-practice flex-grow-1"
//               onClick={() => setViewMode("practice")}
//             >
//               🎯 Start Practice
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ============================================
//           PRACTICE MODE
//           ============================================ */}
//       {viewMode === "practice" && !isEnhancing && (
//         <div className={isRunning ? "teleprompter-practice-active" : "tp-fade-in"}>

//           {/* Teleprompter Display */}
//           <div className="tp-practice-display">
//             {taggedLines.map((line, i) => {
//               const isProblem = problemLinesUI.some(p => p.text === line);

//               if (enhancedData && viewMode === "practice") {
//                 return (
//                   <div key={i} style={isProblem ? { color: "#f87171" } : {}}>
//                     {renderTaggedLine(line, i, currentLine, currentWord)}
//                   </div>
//                 );
//               }

//               const tokens = line.match(/\w+|[.,!?]/g) || [];
//               return (
//                 <div key={i} style={isProblem ? { color: "#f87171" } : {}}>
//                   {tokens.map((t, idx) => (
//                     <span
//                       key={idx}
//                       className={
//                         i === currentLine && idx === currentWord
//                           ? "tp-word-active"
//                           : "tp-word-dim"
//                       }
//                       style={{ marginRight: /\w+/.test(t) ? 6 : 2 }}
//                     >
//                       {t}
//                     </span>
//                   ))}
//                 </div>
//               );
//             })}
//           </div>

//           {/* Practice Controls */}
//           <div className="d-flex gap-2 mb-3">
//             <button
//               className="tp-btn-start"
//               onClick={startSession}
//               disabled={isRunning}
//             >
//               ▶ Start
//             </button>
//             <button
//               className="tp-btn-stop"
//               onClick={stopSession}
//               disabled={!isRunning}
//             >
//               ⏹ Stop
//             </button>
//             <button
//               className="btn btn-edit ms-auto"
//               onClick={() => {
//                 if (isRunning) stopSession();
//                 setViewMode("edit");
//               }}
//             >
//               ✏️ Edit
//             </button>
//             {enhancedData && (
//               <button
//                 className="btn btn-edit"
//                 onClick={() => {
//                   if (isRunning) stopSession();
//                   setViewMode("review");
//                 }}
//               >
//                 📊 Review
//               </button>
//             )}
//           </div>

//           {/* ===== SESSION SCORE CARD (PREMIUM) ===== */}
//           {sessionScoreUI !== null && (
//             <div className="tp-score-card">
//               <div style={{ display: "flex", alignItems: "center", gap: "0.5rem" }}>
//                 <span className="tp-score-value">{sessionScoreUI}</span>
//                 <span className={`tp-score-label ${sessionScoreUI >= 85 ? "excellent" :
//                   sessionScoreUI >= 65 ? "good" : "needs-work"
//                   }`}>
//                   {scoreLabel(sessionScoreUI)}
//                 </span>
//               </div>
//               <p className="tp-coaching-text">{coachingText}</p>

//               {/* Pace Timeline */}
//               <div style={{ marginTop: "1rem" }}>
//                 <h6 style={{ fontSize: "0.7rem", textTransform: "uppercase", letterSpacing: "0.1em", color: "#94a3b8", fontWeight: 700, marginBottom: "0.5rem" }}>
//                   Pace Timeline
//                 </h6>
//                 <div className="tp-timeline-bar">
//                   {timelineData.map((s, i) => (
//                     <div
//                       key={i}
//                       className={`tp-timeline-segment ${s}`}
//                     />
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

// import { useState, useEffect, useRef } from "react";
// import { enhanceScriptWithGroq } from "./enhanceScriptService";

// // ============================================
// // EXISTING ANALYSIS ENGINE — DO NOT MODIFY
// // ============================================

// function normalizeSession(events, lines) {
//   const result = [];
//   const lineEvents = events.filter(e => e.type === "line");
//   const stopEvent = events.find(e => e.type === "stop");
//   if (!stopEvent) return result;
//   for (let i = 0; i < lineEvents.length; i++) {
//     const current = lineEvents[i];
//     const next = lineEvents[i + 1];
//     const startTime = current.time;
//     const endTime = next ? next.time : stopEvent.time;
//     result.push({ index: current.index, text: lines[current.index], startTime, endTime, actualDuration: endTime - startTime });
//   }
//   return result;
// }

// function expectedDuration(line, wpm) {
//   const words = line.trim().split(/\s+/).length;
//   return (60000 / wpm) * words;
// }

// function detectPauses(normalizedLines, wpm) {
//   const tolerance = 500;
//   return normalizedLines.map(item => {
//     const expected = expectedDuration(item.text, wpm);
//     return { ...item, expectedDuration: expected, paused: item.actualDuration > expected + tolerance };
//   });
// }

// function analyzePace(linesWithTiming) {
//   const analyzed = linesWithTiming.map(line => {
//     const ratio = line.actualDuration / line.expectedDuration;
//     let paceLabel = "normal";
//     if (ratio < 0.8) paceLabel = "rushed";
//     else if (ratio > 1.3) paceLabel = "slow";
//     return { ...line, paceRatio: Number(ratio.toFixed(2)), paceLabel };
//   });
//   const ratios = analyzed.map(l => l.paceRatio);
//   const avg = ratios.reduce((s, r) => s + r, 0) / ratios.length;
//   const variance = ratios.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / ratios.length;
//   return { perLine: analyzed, session: { averagePace: Number(avg.toFixed(2)), paceVariance: Number(variance.toFixed(4)), paceStability: Number(Math.max(0, 1 - Math.sqrt(variance)).toFixed(2)) } };
// }

// function analyzeRhythmDrift(perLine) {
//   if (perLine.length < 3) return { drift: "insufficient-data" };
//   const third = Math.floor(perLine.length / 3);
//   const early = perLine.slice(0, third);
//   const late = perLine.slice(third * 2);
//   const avg = arr => arr.reduce((s, l) => s + l.paceRatio, 0) / arr.length;
//   const earlyAvg = avg(early);
//   const lateAvg = avg(late);
//   let drift = "stable";
//   if (lateAvg - earlyAvg > 0.25) drift = "slowing-down";
//   if (earlyAvg - lateAvg > 0.25) drift = "rushing-over-time";
//   return { drift };
// }

// function detectProblemSentences(perLine) {
//   const problemLines = perLine.filter(l => l.paused || l.paceRatio < 0.8 || l.paceRatio > 1.3);
//   return { problemLines, difficultyScore: Number((problemLines.length / perLine.length).toFixed(2)) };
// }

// function generateCoachingSummary({ paceSummary, drift, problems }) {
//   const feedback = [];
//   if (paceSummary.averagePace < 0.9) feedback.push("You spoke too fast overall.");
//   else if (paceSummary.averagePace > 1.2) feedback.push("You spoke too slowly overall.");
//   else feedback.push("Your pace was well controlled.");
//   if (drift.drift !== "stable") feedback.push(`Rhythm issue: ${drift.drift.replace("-", " ")}`);
//   if (problems.problemLines.length > 0) feedback.push(`Focus on ${problems.problemLines.length} difficult sentence(s).`);
//   return feedback.join(" ");
// }

// function calculateSessionScore({ paceSummary, drift, problems }) {
//   let score = 100;
//   score -= Math.min(20, Math.abs(paceSummary.averagePace - 1) * 40);
//   score -= Math.min(20, (1 - paceSummary.paceStability) * 20);
//   if (drift.drift !== "stable") score -= 15;
//   score -= Math.min(25, problems.difficultyScore * 100);
//   return Math.max(0, Math.round(score));
// }

// function scoreLabel(score) {
//   if (score >= 85) return "Excellent";
//   if (score >= 65) return "Good";
//   return "Needs Work";
// }

// // ============================================
// // TAG RENDERER
// // ============================================
// function renderTaggedLine(text, lineIndex, currentLine, currentWord) {
//   const tagPattern = /(\[PAUSE\]|\[SLOW\]|\[FAST\]|\[EMPHASIZE\])/g;
//   const segments = text.split(tagPattern);
//   let wordCounter = 0;
//   const elements = [];
//   segments.forEach((segment, segIdx) => {
//     const tagMatch = segment.match(/^\[(PAUSE|SLOW|FAST|EMPHASIZE)\]$/);
//     if (tagMatch) {
//       const tagType = tagMatch[1].toLowerCase();
//       elements.push(
//         <span key={`tag-${segIdx}`} className={`teleprompter-tag-${tagType}`}>
//           {tagMatch[1]}
//         </span>
//       );
//     } else {
//       const words = segment.match(/\w+|[.,!?;:'"()-]/g) || [];
//       words.forEach((word, wIdx) => {
//         const globalWordIdx = wordCounter;
//         wordCounter++;
//         elements.push(
//           <span
//             key={`word-${segIdx}-${wIdx}`}
//             className={lineIndex === currentLine && globalWordIdx === currentWord ? "tp-word-active" : "tp-word-dim"}
//             style={{ marginRight: /\w+/.test(word) ? 6 : 2 }}
//           >
//             {word}
//           </span>
//         );
//       });
//     }
//   });
//   return elements;
// }

// // ============================================
// // TELEPROMPTER BOX COMPONENT
// // ============================================
// export default function TeleprompterBox({ onStartVideo, onStopVideo }) {

//   const [originalScript, setOriginalScript] = useState(
//     "Good morning everyone, and thank you for being here today. Confidence is not something you are born with, it is something you build slowly over time."
//   );
//   const [isRunning, setIsRunning] = useState(false);
//   const [currentLine, setCurrentLine] = useState(0);
//   const [currentWord, setCurrentWord] = useState(0);
//   const [wpm] = useState(120);
//   const [sessionStart, setSessionStart] = useState(null);
//   const [, setEvents] = useState([]);
//   const [sessionScoreUI, setSessionScoreUI] = useState(null);
//   const [coachingText, setCoachingText] = useState("");
//   const [problemLinesUI, setProblemLinesUI] = useState([]);
//   const [timelineData, setTimelineData] = useState([]);
//   const [enhancedData, setEnhancedData] = useState(null);
//   const [isEnhancing, setIsEnhancing] = useState(false);
//   const [enhanceError, setEnhanceError] = useState(null);
//   const [viewMode, setViewMode] = useState("edit");
//   const fileInputRef = useRef(null);

//   const activeScript = viewMode === "practice" && enhancedData ? enhancedData.enhanced_script : originalScript;
//   const cleanScript = activeScript.replace(/\[(PAUSE|SLOW|FAST|EMPHASIZE)\]/g, "").trim();
//   const lines = cleanScript.split(/(?<=[.!?])\s+/).filter(Boolean);
//   const taggedLines = activeScript.split(/(?<=[.!?])\s+/).filter(Boolean);

//   const handleFileUpload = (e) => {
//     const file = e.target.files[0];
//     if (!file) return;
//     if (!file.name.endsWith(".txt")) { setEnhanceError("Only .txt files are supported."); return; }
//     const reader = new FileReader();
//     reader.onload = (event) => { setOriginalScript(event.target.result); setEnhanceError(null); setEnhancedData(null); setViewMode("edit"); };
//     reader.onerror = () => setEnhanceError("Failed to read the file.");
//     reader.readAsText(file);
//   };

//   const handleEnhance = async () => {
//     setIsEnhancing(true);
//     setEnhanceError(null);
//     try {
//       const result = await enhanceScriptWithGroq(originalScript);
//       setEnhancedData(result);
//       setViewMode("review");
//     } catch (error) {
//       setEnhanceError(error.message);
//     } finally {
//       setIsEnhancing(false);
//     }
//   };

//   const startSession = () => {
//     setTimelineData([]);
//     setSessionScoreUI(null);
//     setCoachingText("");
//     setProblemLinesUI([]);
//     setSessionStart(Date.now());
//     setEvents([{ type: "start", time: 0 }, { type: "line", index: 0, time: 0 }]);
//     setCurrentLine(0);
//     setCurrentWord(0);
//     setIsRunning(true);
//     onStartVideo?.();
//   };

//   const stopSession = () => {
//     setIsRunning(false);
//     const endTime = Date.now() - sessionStart;
//     setEvents(prev => {
//       const updated = [...prev, { type: "stop", time: endTime }];
//       const normalized = normalizeSession(updated, lines);
//       const pauses = detectPauses(normalized, wpm);
//       const pace = analyzePace(pauses);
//       const drift = analyzeRhythmDrift(pace.perLine);
//       const problems = detectProblemSentences(pace.perLine);
//       setSessionScoreUI(calculateSessionScore({ paceSummary: pace.session, drift, problems }));
//       setCoachingText(generateCoachingSummary({ paceSummary: pace.session, drift, problems }));
//       setProblemLinesUI(problems.problemLines);
//       setTimelineData(pace.perLine.map(l => l.paused || l.paceRatio > 1.3 ? "slow" : l.paceRatio < 0.8 ? "rushed" : "normal"));
//       return updated;
//     });
//     onStopVideo?.();
//   };

//   useEffect(() => {
//     if (!isRunning || currentLine >= lines.length) return;
//     const delay = (60000 / wpm) * lines[currentLine].split(/\s+/).length;
//     const t = setTimeout(() => { setCurrentLine(l => l + 1); setCurrentWord(0); }, delay);
//     return () => clearTimeout(t);
//   }, [isRunning, currentLine, wpm, lines]);

//   useEffect(() => {
//     if (!isRunning || currentLine >= lines.length) return;
//     const tokens = lines[currentLine].match(/\w+|[.,!?]/g) || [];
//     if (currentWord >= tokens.length) return;
//     const t = setTimeout(() => setCurrentWord(w => w + 1), 60000 / wpm);
//     return () => clearTimeout(t);
//   }, [isRunning, currentWord, currentLine, wpm, lines]);

//   return (
//     <div className="tp-card">

//       {/* Mode tabs */}
//       <div className="teleprompter-mode-bar">
//         <button className={`btn btn-sm ${viewMode === "edit" ? "active-mode" : ""}`} onClick={() => setViewMode("edit")} disabled={isRunning}>
//           ✏️ Edit
//         </button>
//         <button className={`btn btn-sm ${viewMode === "review" ? "active-mode" : ""}`} onClick={() => setViewMode("review")} disabled={!enhancedData || isRunning}>
//           📊 Review
//         </button>
//         <button className={`btn btn-sm ${viewMode === "practice" ? "active-mode" : ""}`} onClick={() => setViewMode("practice")} disabled={isRunning}>
//           🎯 Practice
//         </button>
//       </div>

//       {/* Spinner */}
//       {isEnhancing && (
//         <div className="teleprompter-spinner-overlay">
//           <div className="tp-spinner" />
//           <p className="tp-spinner-text">Enhancing your script…</p>
//           <p className="tp-spinner-sub">AI is analyzing structure, flow & delivery — 10–20s</p>
//         </div>
//       )}

//       {/* Error */}
//       {enhanceError && (
//         <div className="teleprompter-error">
//           <span>⚠️</span>
//           <span><strong>Error:</strong> {enhanceError}</span>
//           <button className="tp-error-dismiss" onClick={() => setEnhanceError(null)}>Dismiss</button>
//         </div>
//       )}

//       {/* ── EDIT MODE ── */}
//       {viewMode === "edit" && !isEnhancing && (
//         <div className="tp-fade-in">
//           <textarea
//             className="tp-textarea"
//             rows={6}
//             value={originalScript}
//             onChange={e => { setOriginalScript(e.target.value); setEnhancedData(null); }}
//             disabled={isRunning}
//             placeholder="Paste or type your speech script here…"
//           />

//           <div className="teleprompter-upload-zone" onClick={() => fileInputRef.current?.click()}>
//             <input type="file" accept=".txt" ref={fileInputRef} onChange={handleFileUpload} />
//             <span className="tp-upload-icon">📄</span>
//             <p className="tp-upload-label">Click to upload a .txt script file</p>
//           </div>

//           <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
//             <button className="btn-enhance" style={{ flex: 1 }} onClick={handleEnhance} disabled={isEnhancing || !originalScript.trim()}>
//               ✨ Enhance with AI
//             </button>
//             <button className="btn-practice" onClick={() => setViewMode("practice")} disabled={!originalScript.trim()}>
//               🎯 Quick Practice
//             </button>
//           </div>
//         </div>
//       )}

//       {/* ── REVIEW MODE ── */}
//       {viewMode === "review" && enhancedData && !isEnhancing && (
//         <div className="tp-fade-in" style={{ overflowY: "auto", flex: 1 }}>
//           <div className="teleprompter-enhance-panel tp-panel-script">
//             <h6>📝 Enhanced Script</h6>
//             <div className="teleprompter-enhanced-text">{enhancedData.enhanced_script}</div>
//           </div>

//           <div className="teleprompter-enhance-panel tp-panel-points">
//             <h6>🎯 Key Points</h6>
//             <ul>{enhancedData.key_points.map((p, i) => <li key={i}>{p}</li>)}</ul>
//           </div>

//           <div className="teleprompter-enhance-panel tp-panel-memory">
//             <h6>🧠 Memory Anchors</h6>
//             <ul>{enhancedData.memory_summary.map((a, i) => <li key={i}>{a}</li>)}</ul>
//           </div>

//           <div className="teleprompter-enhance-panel tp-panel-flow">
//             <h6>📋 Flow Structure</h6>
//             <ul>{enhancedData.flow_structure.map((s, i) => <li key={i}><span style={{ color: "#a5b4fc", fontWeight: 600 }}>Step {i + 1}:</span> {s}</li>)}</ul>
//           </div>

//           <div className="teleprompter-enhance-panel tp-panel-tips">
//             <h6>🎙️ Delivery Tips</h6>
//             <ul>{enhancedData.modulation_notes.map((n, i) => <li key={i}>{n}</li>)}</ul>
//           </div>

//           <div className="tp-divider" />

//           <div style={{ display: "flex", gap: 8 }}>
//             <button className="btn-edit" onClick={() => setViewMode("edit")}>✏️ Edit Script</button>
//             <button className="btn-practice" style={{ flex: 1 }} onClick={() => setViewMode("practice")}>🎯 Start Practice</button>
//           </div>
//         </div>
//       )}

//       {/* ── PRACTICE MODE ── */}
//       {viewMode === "practice" && !isEnhancing && (
//         <div className={isRunning ? "teleprompter-practice-active" : "tp-fade-in"} style={{ flex: 1, display: "flex", flexDirection: "column" }}>

//           <div className="tp-practice-display">
//             {taggedLines.map((line, i) => {
//               const isProblem = problemLinesUI.some(p => p.text === line);
//               if (enhancedData && viewMode === "practice") {
//                 return (
//                   <div key={i} style={{ display: "flex", flexWrap: "wrap", ...(isProblem ? { color: "#ff6b6b" } : {}) }}>
//                     {renderTaggedLine(line, i, currentLine, currentWord)}
//                   </div>
//                 );
//               }
//               const tokens = line.match(/\w+|[.,!?]/g) || [];
//               return (
//                 <div key={i} style={{ display: "flex", flexWrap: "wrap", ...(isProblem ? { color: "#ff6b6b" } : {}) }}>
//                   {tokens.map((t, idx) => (
//                     <span
//                       key={idx}
//                       className={i === currentLine && idx === currentWord ? "tp-word-active" : "tp-word-dim"}
//                       style={{ marginRight: /\w+/.test(t) ? 6 : 2 }}
//                     >
//                       {t}
//                     </span>
//                   ))}
//                 </div>
//               );
//             })}
//           </div>

//           <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
//             <button className="tp-btn-start" onClick={startSession} disabled={isRunning}>▶ Start</button>
//             <button className="tp-btn-stop" onClick={stopSession} disabled={!isRunning}>⏹ Stop</button>
//             <button className="btn-edit" style={{ marginLeft: "auto" }} onClick={() => { if (isRunning) stopSession(); setViewMode("edit"); }}>✏️ Edit</button>
//             {enhancedData && (
//               <button className="btn-edit" onClick={() => { if (isRunning) stopSession(); setViewMode("review"); }}>📊 Review</button>
//             )}
//           </div>

//           {/* Score card */}
//           {sessionScoreUI !== null && (
//             <div className="tp-score-card">
//               <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
//                 <span className="tp-score-value">{sessionScoreUI}</span>
//                 <span className={`tp-score-label ${sessionScoreUI >= 85 ? "excellent" : sessionScoreUI >= 65 ? "good" : "needs-work"}`}>
//                   {scoreLabel(sessionScoreUI)}
//                 </span>
//               </div>
//               <p className="tp-coaching-text">{coachingText}</p>

//               <div style={{ marginTop: 16 }}>
//                 <div style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: "0.1em", color: "rgba(255,255,255,0.3)", fontWeight: 700, marginBottom: 8 }}>
//                   Pace Timeline
//                 </div>
//                 <div className="tp-timeline-bar">
//                   {timelineData.map((s, i) => <div key={i} className={`tp-timeline-segment ${s}`} />)}
//                 </div>
//                 <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
//                   {[["normal", "#34c759", "Normal"], ["slow", "#ffd60a", "Slow"], ["rushed", "#ff3b30", "Rushed"]].map(([k, c, l]) => (
//                     <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
//                       <span style={{ width: 8, height: 8, borderRadius: 2, background: c, display: "inline-block" }} />
//                       <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{l}</span>
//                     </div>
//                   ))}
//                 </div>
//               </div>
//             </div>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect, useRef } from "react";
import { enhanceScriptWithGroq } from "./enhanceScriptService";

// ============================================
// ANALYSIS ENGINE
// ============================================

function normalizeSession(events, lines) {
  const result = [];
  const lineEvents = events.filter(e => e.type === "line");
  const stopEvent = events.find(e => e.type === "stop");
  if (!stopEvent || lineEvents.length === 0) return result;
  for (let i = 0; i < lineEvents.length; i++) {
    const current = lineEvents[i];
    const next = lineEvents[i + 1];
    const startTime = current.time;
    const endTime = next ? next.time : stopEvent.time;
    const duration = endTime - startTime;
    // Only include lines that were actually reached and have positive duration
    if (duration > 0) {
      result.push({
        index: current.index,
        text: lines[current.index],
        startTime,
        endTime,
        actualDuration: duration,
      });
    }
  }
  return result;
}

function expectedDuration(line, wpm) {
  const words = line.trim().split(/\s+/).filter(Boolean).length;
  return (60000 / wpm) * words;
}

function detectPauses(normalizedLines, wpm) {
  const tolerance = 600;
  return normalizedLines.map(item => {
    const expected = expectedDuration(item.text, wpm);
    return {
      ...item,
      expectedDuration: expected,
      paused: item.actualDuration > expected + tolerance,
    };
  });
}

function analyzePace(linesWithTiming) {
  const analyzed = linesWithTiming.map(line => {
    const ratio = line.actualDuration / line.expectedDuration;
    let paceLabel = "normal";
    if (ratio < 0.75) paceLabel = "rushed";
    else if (ratio > 1.4) paceLabel = "slow";
    return { ...line, paceRatio: Number(ratio.toFixed(2)), paceLabel };
  });

  if (analyzed.length === 0) {
    return { perLine: [], session: { averagePace: 1, paceVariance: 0, paceStability: 1 } };
  }

  const ratios = analyzed.map(l => l.paceRatio);
  const avg = ratios.reduce((s, r) => s + r, 0) / ratios.length;
  const variance = ratios.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / ratios.length;
  return {
    perLine: analyzed,
    session: {
      averagePace: Number(avg.toFixed(2)),
      paceVariance: Number(variance.toFixed(4)),
      paceStability: Number(Math.max(0, 1 - Math.sqrt(variance)).toFixed(2)),
    },
  };
}

function analyzeRhythmDrift(perLine) {
  if (perLine.length < 3) return { drift: "stable" }; // not enough data — don't penalise
  const third = Math.floor(perLine.length / 3);
  const early = perLine.slice(0, third);
  const late = perLine.slice(third * 2);
  const avg = arr => arr.reduce((s, l) => s + l.paceRatio, 0) / arr.length;
  const earlyAvg = avg(early);
  const lateAvg = avg(late);
  let drift = "stable";
  if (lateAvg - earlyAvg > 0.3) drift = "slowing-down";
  if (earlyAvg - lateAvg > 0.3) drift = "rushing-over-time";
  return { drift };
}

function detectProblemSentences(perLine) {
  const problemLines = perLine.filter(
    l => l.paused || l.paceRatio < 0.75 || l.paceRatio > 1.4
  );
  return {
    problemLines,
    difficultyScore: Number((problemLines.length / Math.max(perLine.length, 1)).toFixed(2)),
  };
}

function generateCoachingSummary({ paceSummary, drift, problems, linesRead, totalLines }) {
  const feedback = [];

  if (linesRead < totalLines) {
    feedback.push(`You completed ${linesRead} of ${totalLines} lines.`);
  }

  if (paceSummary.averagePace < 0.75) feedback.push("You spoke too fast overall — try to slow down.");
  else if (paceSummary.averagePace > 1.4) feedback.push("You spoke too slowly overall — aim for a steadier tempo.");
  else feedback.push("Your overall pace was well controlled.");

  if (paceSummary.paceStability < 0.6) feedback.push("Your speed varied quite a bit — try to keep a consistent rhythm.");

  if (drift.drift === "slowing-down") feedback.push("You slowed down toward the end — keep energy up.");
  else if (drift.drift === "rushing-over-time") feedback.push("You rushed as you went on — breathe and stay steady.");

  if (problems.problemLines.length > 0)
    feedback.push(`Review ${problems.problemLines.length} difficult line(s) highlighted in red.`);

  return feedback.join(" ");
}

function calculateSessionScore({ paceSummary, drift, problems, linesRead, totalLines }) {
  let score = 100;

  // Completion penalty (up to 20 pts)
  const completionRatio = linesRead / Math.max(totalLines, 1);
  score -= Math.round((1 - completionRatio) * 20);

  // Pace accuracy penalty (up to 20 pts) — distance from ideal ratio of 1.0
  score -= Math.min(20, Math.abs(paceSummary.averagePace - 1) * 30);

  // Stability penalty (up to 15 pts)
  score -= Math.min(15, (1 - paceSummary.paceStability) * 15);

  // Drift penalty (10 pts)
  if (drift.drift !== "stable") score -= 10;

  // Problem lines penalty (up to 20 pts)
  score -= Math.min(20, problems.difficultyScore * 40);

  return Math.max(0, Math.round(score));
}

function scoreLabel(score) {
  if (score >= 98) return "🏆 Flawless";
  if (score >= 90) return "⭐ Perfect";
  if (score >= 80) return "🎯 Excellent";
  if (score >= 70) return "👍 Good";
  if (score >= 58) return "📈 Fair";
  if (score >= 45) return "🔧 Needs Work";
  if (score >= 25) return "💪 Keep Practicing";
  return "🌱 Just Starting";
}

function scoreTierClass(score) {
  if (score >= 90) return "text-success fw-bold";
  if (score >= 70) return "text-primary fw-bold";
  if (score >= 45) return "text-warning fw-bold";
  return "text-danger fw-bold";
}

// ============================================
// TAG RENDERER
// ============================================
function renderTaggedLine(text, lineIndex, currentLine, currentWord) {
  const tagPattern = /(\[PAUSE\]|\[SLOW\]|\[FAST\]|\[EMPHASIZE\])/g;
  const segments = text.split(tagPattern);
  let wordCounter = 0;
  const elements = [];
  segments.forEach((segment, segIdx) => {
    const tagMatch = segment.match(/^\[(PAUSE|SLOW|FAST|EMPHASIZE)\]$/);
    if (tagMatch) {
      const tagType = tagMatch[1].toLowerCase();
      elements.push(
        <span key={`tag-${segIdx}`} className={`teleprompter-tag-${tagType}`}>
          {tagMatch[1]}
        </span>
      );
    } else {
      const words = segment.match(/\w+|[.,!?;:'"()-]/g) || [];
      words.forEach((word, wIdx) => {
        const globalWordIdx = wordCounter++;
        elements.push(
          <span
            key={`word-${segIdx}-${wIdx}`}
            className={
              lineIndex === currentLine && globalWordIdx === currentWord
                ? "tp-word-active"
                : "tp-word-dim"
            }
            style={{ marginRight: /\w+/.test(word) ? 6 : 2 }}
          >
            {word}
          </span>
        );
      });
    }
  });
  return elements;
}

// ============================================
// TELEPROMPTER BOX COMPONENT
// ============================================
export default function TeleprompterBox({ onStartVideo, onStopVideo }) {
  const [originalScript, setOriginalScript] = useState(
    "Good morning everyone, and thank you for being here today. Confidence is not something you are born with, it is something you build slowly over time."
  );
  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [wpm] = useState(120);
  const [sessionScoreUI, setSessionScoreUI] = useState(null);
  const [coachingText, setCoachingText] = useState("");
  const [problemLinesUI, setProblemLinesUI] = useState([]);
  const [timelineData, setTimelineData] = useState([]);
  const [enhancedData, setEnhancedData] = useState(null);
  const [isEnhancing, setIsEnhancing] = useState(false);
  const [enhanceError, setEnhanceError] = useState(null);
  const [viewMode, setViewMode] = useState("edit");
  const fileInputRef = useRef(null);

  // ── Refs for accurate timing (avoid stale closure bugs) ──
  const sessionStartRef = useRef(null);
  const eventsRef = useRef([]);
  const currentLineRef = useRef(0);

  const activeScript =
    viewMode === "practice" && enhancedData
      ? enhancedData.enhanced_script
      : originalScript;
  const cleanScript = activeScript.replace(/\[(PAUSE|SLOW|FAST|EMPHASIZE)\]/g, "").trim();
  const lines = cleanScript.split(/(?<=[.!?])\s+/).filter(Boolean);
  const taggedLines = activeScript.split(/(?<=[.!?])\s+/).filter(Boolean);

  // Keep currentLineRef in sync
  useEffect(() => {
    currentLineRef.current = currentLine;
  }, [currentLine]);

  const handleFileUpload = async e => {
    const file = e.target.files[0];
    if (!file) return;

    const name = file.name.toLowerCase();
    const isTxt = name.endsWith(".txt") || file.type === "text/plain" || file.type === "";
    const isPdf = name.endsWith(".pdf") || file.type === "application/pdf";
    const isDoc = name.endsWith(".doc") || name.endsWith(".docx");

    if (!isTxt && !isPdf && !isDoc) {
      setEnhanceError("Only .txt, .pdf, and .doc/.docx files are supported.");
      return;
    }

    setEnhanceError(null);

    try {
      let text = "";

      if (isTxt) {
        // Plain text — read directly
        text = await new Promise((resolve, reject) => {
          const reader = new FileReader();
          reader.onload = ev => resolve(ev.target.result);
          reader.onerror = () => reject(new Error("Failed to read file."));
          reader.readAsText(file);
        });

      } else if (isPdf) {
        // PDF — load pdf.js via script tag (no dynamic import)
        const arrayBuffer = await file.arrayBuffer();
        await new Promise((resolve, reject) => {
          if (document.querySelector("#pdfjs-script")) { resolve(); return; }
          const s = document.createElement("script");
          s.id = "pdfjs-script";
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.min.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("Failed to load PDF parser."));
          document.head.appendChild(s);
        });

        const pdfjs = window.pdfjsLib;
        pdfjs.GlobalWorkerOptions.workerSrc =
          "https://cdnjs.cloudflare.com/ajax/libs/pdf.js/3.11.174/pdf.worker.min.js";

        const pdf = await pdfjs.getDocument({ data: arrayBuffer }).promise;
        const pages = [];
        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const content = await page.getTextContent();
          pages.push(content.items.map(item => item.str).join(" "));
        }
        text = pages.join("\n");

      } else if (isDoc) {
        // DOC/DOCX — use mammoth.js from CDN
        const arrayBuffer = await file.arrayBuffer();
        await new Promise((resolve, reject) => {
          if (document.querySelector("#mammoth-script")) { resolve(); return; }
          const s = document.createElement("script");
          s.id = "mammoth-script";
          s.src = "https://cdnjs.cloudflare.com/ajax/libs/mammoth/1.6.0/mammoth.browser.min.js";
          s.onload = resolve;
          s.onerror = () => reject(new Error("Failed to load DOC parser."));
          document.head.appendChild(s);
        });

        const result = await window.mammoth.extractRawText({ arrayBuffer });
        text = result.value;
      }

      if (!text.trim()) {
        setEnhanceError("The file appears to be empty or could not be read.");
        return;
      }

      setOriginalScript(text.trim());
      setEnhancedData(null);
      setViewMode("edit");

    } catch (err) {
      setEnhanceError(err.message || "Failed to read the file.");
    }
  };

  const handleEnhance = async () => {
    setIsEnhancing(true);
    setEnhanceError(null);
    try {
      const result = await enhanceScriptWithGroq(originalScript);
      setEnhancedData(result);
      setViewMode("practice");
    } catch (error) {
      setEnhanceError(error.message);
    } finally {
      setIsEnhancing(false);
    }
  };

  const startSession = () => {
    // Reset everything
    setTimelineData([]);
    setSessionScoreUI(null);
    setCoachingText("");
    setProblemLinesUI([]);
    setCurrentLine(0);
    setCurrentWord(0);
    currentLineRef.current = 0;

    // Use ref for start time — never goes stale
    sessionStartRef.current = Date.now();
    eventsRef.current = [
      { type: "start", time: 0 },
      { type: "line", index: 0, time: 0 },
    ];

    setIsRunning(true);
    onStartVideo?.();
  };

  const stopSession = () => {
    setIsRunning(false);

    // Read timing directly from refs — always current
    const endTime = Date.now() - sessionStartRef.current;
    const finalEvents = [...eventsRef.current, { type: "stop", time: endTime }];
    const linesRead = currentLineRef.current; // how far the user got

    const normalized = normalizeSession(finalEvents, lines);
    if (normalized.length === 0) {
      setCoachingText("Session too short to analyze. Try completing at least one sentence.");
      setSessionScoreUI(0);
      return;
    }

    const pauses = detectPauses(normalized, wpm);
    const pace = analyzePace(pauses);
    const drift = analyzeRhythmDrift(pace.perLine);
    const problems = detectProblemSentences(pace.perLine);

    const score = calculateSessionScore({
      paceSummary: pace.session,
      drift,
      problems,
      linesRead,
      totalLines: lines.length,
    });

    setSessionScoreUI(score);
    setCoachingText(
      generateCoachingSummary({
        paceSummary: pace.session,
        drift,
        problems,
        linesRead,
        totalLines: lines.length,
      })
    );
    setProblemLinesUI(problems.problemLines);
    setTimelineData(
      pace.perLine.map(l =>
        l.paceRatio > 1.4 || l.paused ? "slow" : l.paceRatio < 0.75 ? "rushed" : "normal"
      )
    );

    onStopVideo?.();
  };

  // ── Auto-advance lines with ref-based event recording ──
  useEffect(() => {
    if (!isRunning || currentLine >= lines.length) return;

    const wordCount = lines[currentLine].trim().split(/\s+/).filter(Boolean).length;
    const delay = (60000 / wpm) * wordCount;

    const t = setTimeout(() => {
      const nextLine = currentLine + 1;
      // Record the line transition with accurate wall-clock time
      const elapsed = Date.now() - sessionStartRef.current;
      if (nextLine < lines.length) {
        eventsRef.current = [
          ...eventsRef.current,
          { type: "line", index: nextLine, time: elapsed },
        ];
      }
      setCurrentLine(nextLine);
      setCurrentWord(0);
    }, delay);

    return () => clearTimeout(t);
  }, [isRunning, currentLine, wpm, lines]);

  // ── Word highlight ticker ──
  useEffect(() => {
    if (!isRunning || currentLine >= lines.length) return;
    const tokens = lines[currentLine].match(/\w+|[.,!?]/g) || [];
    if (currentWord >= tokens.length) return;
    const t = setTimeout(() => setCurrentWord(w => w + 1), 60000 / wpm);
    return () => clearTimeout(t);
  }, [isRunning, currentWord, currentLine, wpm, lines]);

  return (
    <div className="tp-card">
      {/* Mode tabs */}
      <div className="teleprompter-mode-bar">
        <button
          className={`btn btn-sm ${viewMode === "edit" ? "active-mode" : ""}`}
          onClick={() => setViewMode("edit")}
          disabled={isRunning}
        >
          ✏️ Edit
        </button>
        <button
          className={`btn btn-sm ${viewMode === "practice" ? "active-mode" : ""}`}
          onClick={() => setViewMode("practice")}
          disabled={isRunning}
        >
          🎯 Practice
        </button>
      </div>

      {/* Spinner */}
      {isEnhancing && (
        <div className="teleprompter-spinner-overlay">
          <div className="tp-spinner" />
          <p className="tp-spinner-text">Enhancing your script…</p>
          <p className="tp-spinner-sub">AI is analyzing structure, flow & delivery — 10–20s</p>
        </div>
      )}

      {/* Error */}
      {enhanceError && (
        <div className="teleprompter-error">
          <span>⚠️</span>
          <span>
            <strong>Error:</strong> {enhanceError}
          </span>
          <button className="tp-error-dismiss" onClick={() => setEnhanceError(null)}>
            Dismiss
          </button>
        </div>
      )}

      {/* ── EDIT MODE ── */}
      {viewMode === "edit" && !isEnhancing && (
        <div className="tp-fade-in">
          <textarea
            className="tp-textarea"
            rows={6}
            value={originalScript}
            onChange={e => {
              setOriginalScript(e.target.value);
              setEnhancedData(null);
            }}
            disabled={isRunning}
            placeholder="Paste or type your speech script here…"
          />

          <div
            className="teleprompter-upload-zone"
            onClick={() => fileInputRef.current?.click()}
          >
            <input type="file" accept=".txt,.pdf,.doc,.docx" ref={fileInputRef} onChange={handleFileUpload} />
            <span className="tp-upload-icon">📄</span>
            <p className="tp-upload-label">Click to upload a .txt, .pdf, or .doc file</p>
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12 }}>
            <button
              className="btn-enhance"
              style={{ flex: 1 }}
              onClick={handleEnhance}
              disabled={isEnhancing || !originalScript.trim()}
            >
              ✨ Enhance with AI
            </button>
            <button
              className="btn-practice"
              onClick={() => setViewMode("practice")}
              disabled={!originalScript.trim()}
            >
              🎯 Quick Practice
            </button>
          </div>
        </div>
      )}

      {/* ── PRACTICE MODE ── */}
      {viewMode === "practice" && !isEnhancing && (
        <div
          className={isRunning ? "teleprompter-practice-active" : "tp-fade-in"}
          style={{ flex: 1, display: "flex", flexDirection: "column" }}
        >
          <div className="tp-practice-display">
            {taggedLines.map((line, i) => {
              const isProblem = problemLinesUI.some(p => p.text === lines[i]);
              if (enhancedData && viewMode === "practice") {
                return (
                  <div
                    key={i}
                    style={{ display: "flex", flexWrap: "wrap", ...(isProblem ? { color: "#ff6b6b" } : {}) }}
                  >
                    {renderTaggedLine(line, i, currentLine, currentWord)}
                  </div>
                );
              }
              const tokens = line.match(/\w+|[.,!?]/g) || [];
              return (
                <div
                  key={i}
                  style={{ display: "flex", flexWrap: "wrap", ...(isProblem ? { color: "#ff6b6b" } : {}) }}
                >
                  {tokens.map((t, idx) => (
                    <span
                      key={idx}
                      className={
                        i === currentLine && idx === currentWord ? "tp-word-active" : "tp-word-dim"
                      }
                      style={{ marginRight: /\w+/.test(t) ? 6 : 2 }}
                    >
                      {t}
                    </span>
                  ))}
                </div>
              );
            })}
          </div>

          <div style={{ display: "flex", gap: 8, marginBottom: 12, alignItems: "center" }}>
            <button className="tp-btn-start" onClick={startSession} disabled={isRunning}>
              ▶ Start
            </button>
            <button className="tp-btn-stop" onClick={stopSession} disabled={!isRunning}>
              ⏹ Stop
            </button>
            <button
              className="btn-edit"
              style={{ marginLeft: "auto" }}
              onClick={() => { if (isRunning) stopSession(); setViewMode("edit"); }}
            >
              ✏️ Edit
            </button>

          </div>

          {/* Score card */}
          {sessionScoreUI !== null && (
            <div className="tp-score-card">
              <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
                <span className="tp-score-value">{sessionScoreUI}</span>
                <span className={`fs-5 ${scoreTierClass(sessionScoreUI)}`}>
                  {scoreLabel(sessionScoreUI)}
                </span>
              </div>
              <p className="tp-coaching-text">{coachingText}</p>

              {timelineData.length > 0 && (
                <div style={{ marginTop: 16 }}>
                  <div
                    style={{
                      fontSize: 10,
                      textTransform: "uppercase",
                      letterSpacing: "0.1em",
                      color: "rgba(255,255,255,0.3)",
                      fontWeight: 700,
                      marginBottom: 8,
                    }}
                  >
                    Pace Timeline
                  </div>
                  <div className="tp-timeline-bar">
                    {timelineData.map((s, i) => (
                      <div key={i} className={`tp-timeline-segment ${s}`} />
                    ))}
                  </div>
                  <div style={{ display: "flex", gap: 16, marginTop: 8 }}>
                    {[
                      ["normal", "#34c759", "Normal"],
                      ["slow", "#ffd60a", "Slow"],
                      ["rushed", "#ff3b30", "Rushed"],
                    ].map(([k, c, l]) => (
                      <div key={k} style={{ display: "flex", alignItems: "center", gap: 5 }}>
                        <span
                          style={{
                            width: 8,
                            height: 8,
                            borderRadius: 2,
                            background: c,
                            display: "inline-block",
                          }}
                        />
                        <span style={{ fontSize: 11, color: "rgba(255,255,255,0.3)" }}>{l}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}