// import { useState, useEffect } from "react";

// /* =========================
//    DAY 11.1 — NORMALIZATION
// ========================= */
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

// /* =========================
//    DAY 11.2 — EXPECTED TIME + PAUSE
// ========================= */
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

// /* =========================
//    DAY 11.3 — PACE ANALYSIS
// ========================= */
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

// /* =========================
//    DAY 11.4 — RHYTHM DRIFT
// ========================= */
// function analyzeRhythmDrift(perLine) {
//   if (perLine.length < 3) return { drift: "insufficient-data" };

//   const third = Math.floor(perLine.length / 3);
//   const early = perLine.slice(0, third);
//   const middle = perLine.slice(third, third * 2);
//   const late = perLine.slice(third * 2);

//   const avg = arr => arr.reduce((s, l) => s + l.paceRatio, 0) / arr.length;

//   const earlyAvg = avg(early);
//   const middleAvg = avg(middle);
//   const lateAvg = avg(late);

//   let drift = "stable";
//   if (lateAvg - earlyAvg > 0.25) drift = "slowing-down";
//   if (earlyAvg - lateAvg > 0.25) drift = "rushing-over-time";

//   return {
//     earlyPace: Number(earlyAvg.toFixed(2)),
//     middlePace: Number(middleAvg.toFixed(2)),
//     latePace: Number(lateAvg.toFixed(2)),
//     drift
//   };
// }

// /* =========================
//    DAY 11.5 — PROBLEM SENTENCES
// ========================= */
// function detectProblemSentences(perLine) {
//   const problemLines = perLine
//     .map(line => {
//       const reasons = [];
//       if (line.paceRatio > 1.3) reasons.push("too-slow");
//       if (line.paceRatio < 0.8) reasons.push("too-fast");
//       if (line.paused) reasons.push("paused");

//       return {
//         ...line,
//         isProblem: reasons.length > 0,
//         reasons
//       };
//     })
//     .filter(l => l.isProblem);

//   return {
//     problemLines,
//     difficultyScore: Number(
//       (problemLines.length / perLine.length).toFixed(2)
//     )
//   };
// }

// /* =========================
//    DAY 11.6 — COACHING SUMMARY
// ========================= */
// function generateCoachingSummary({ paceSummary, drift, problems }) {
//   const feedback = [];

//   if (paceSummary.averagePace < 0.9)
//     feedback.push("You spoke too fast overall. Slow down for clarity.");
//   else if (paceSummary.averagePace > 1.2)
//     feedback.push("You spoke too slowly overall. Increase energy.");
//   else feedback.push("Your overall pace was well controlled.");

//   if (drift.drift !== "stable")
//     feedback.push(`Your rhythm showed ${drift.drift.replace("-", " ")}.`);

//   if (problems.problemLines.length > 0)
//     feedback.push(
//       `Focus on ${problems.problemLines.length} difficult sentence(s).`
//     );

//   return feedback.join(" ");
// }

// /* =========================
//    DAY 11.7 — SESSION SCORE
// ========================= */
// function calculateSessionScore({ paceSummary, drift, problems }) {
//   let score = 100;

//   score -= Math.min(20, Math.abs(paceSummary.averagePace - 1) * 40);
//   score -= Math.min(20, (1 - paceSummary.paceStability) * 20);
//   if (drift.drift !== "stable") score -= 15;
//   score -= Math.min(25, problems.difficultyScore * 100);

//   return Math.max(0, Math.round(score));
// }

// /* =========================
//    DAY 1 — SCORE LABEL
// ========================= */
// function scoreLabel(score) {
//   if (score >= 85) return "Excellent";
//   if (score >= 65) return "Good";
//   return "Needs Work";
// }

// /* =========================
//    TELEPROMPTER COMPONENT
// ========================= */
// export default function TeleprompterBox({ onStartVideo, onStopVideo }) {
//   const [script, setScript] = useState(
//     "Good morning everyone, and thank you for being here today. Confidence is not something you are born with, it is something you build slowly over time."
//   );

//   const lines = script
//     .split(/(?<=[.!?])\s+/)
//     .map(l => l.trim())
//     .filter(Boolean);

//   const [isRunning, setIsRunning] = useState(false);
//   const [currentLine, setCurrentLine] = useState(0);
//   const [currentWord, setCurrentWord] = useState(0);
//   const [wpm, setWpm] = useState(120);

//   const [sessionStart, setSessionStart] = useState(null);
//   const [events, setEvents] = useState([]);

//   const [sessionScoreUI, setSessionScoreUI] = useState(null);
//   const [coachingText, setCoachingText] = useState("");
//   const [problemLinesUI, setProblemLinesUI] = useState([]);

//   /* =========================
//      START SESSION
//   ========================= */
//   const startSession = () => {
    
//     setSessionStart(Date.now());
//     setEvents([
//       { type: "start", time: 0 },
//       { type: "line", index: 0, time: 0 }
//     ]);

//     setSessionScoreUI(null);
//     setCoachingText("");
//     setProblemLinesUI([]);

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

//       const coachingSummary = generateCoachingSummary({
//         paceSummary: pace.session,
//         drift,
//         problems
//       });

//       const score = calculateSessionScore({
//         paceSummary: pace.session,
//         drift,
//         problems
//       });

//       setSessionScoreUI(score);
//       setCoachingText(coachingSummary);
//       setProblemLinesUI(problems.problemLines);

//       return updated;
//     });

//     onStopVideo?.();
//   };

//   /* =========================
//      SENTENCE TIMING
//   ========================= */
//   useEffect(() => {
//     if (!isRunning || currentLine >= lines.length) return;

//     const words = lines[currentLine].split(/\s+/).length;
//     const delay = (60000 / wpm) * words;

//     const timer = setTimeout(() => {
//       setCurrentLine(l => l + 1);
//       setCurrentWord(0);
//     }, delay);

//     return () => clearTimeout(timer);
//   }, [isRunning, currentLine, wpm, lines]);

//   /* =========================
//      WORD TIMING
//   ========================= */
//   useEffect(() => {
//     if (!isRunning || currentLine >= lines.length) return;

//     const tokens = lines[currentLine].match(/\w+|[.,!?]/g) || [];
//     if (currentWord >= tokens.length) return;

//     const timer = setTimeout(() => {
//       setCurrentWord(w => w + 1);
//     }, 60000 / wpm);

//     return () => clearTimeout(timer);
//   }, [isRunning, currentWord, currentLine, wpm, lines]);

//   /* =========================
//      UI
//   ========================= */
//   return (
//     <div className="card bg-dark text-white p-4">
//       <textarea
//         className="form-control mb-3"
//         rows={5}
//         value={script}
//         onChange={e => setScript(e.target.value)}
//         disabled={isRunning}
//       />

//       <div className="fs-3 mb-3">
//         {lines.map((line, i) => {
//           const isProblem = problemLinesUI.some(p => p.text === line);
//           const tokens = line.match(/\w+|[.,!?]/g) || [];

//           return (
//             <div key={i} className={isProblem ? "text-danger" : ""}>
//               {tokens.map((t, idx) => (
//                 <span
//                   key={idx}
//                   className={
//                     i === currentLine && idx === currentWord
//                       ? "fw-bold text-warning"
//                       : "opacity-50"
//                   }
//                   style={{ marginRight: /\w+/.test(t) ? 6 : 2 }}
//                 >
//                   {t}
//                 </span>
//               ))}
//             </div>
//           );
//         })}
//       </div>

//       <button className="btn btn-success me-2" onClick={startSession}>
//         Start
//       </button>
//       <button className="btn btn-danger" onClick={stopSession}>
//         Stop
//       </button>

//       <div className="mt-3">
//         <strong>{wpm} WPM</strong>
//         <input
//           type="range"
//           min="80"
//           max="200"
//           step="10"
//           value={wpm}
//           onChange={e => setWpm(Number(e.target.value))}
//         />
//       </div>

//       {sessionScoreUI !== null && (
//         <div className="card bg-secondary mt-4 p-3">
//           <h4>
//             Session Score: {sessionScoreUI}{" "}
//             <span className="badge bg-dark ms-2">
//               {scoreLabel(sessionScoreUI)}
//             </span>
//           </h4>

//           <p className="mt-2">{coachingText}</p>

//           {problemLinesUI.length > 0 && (
//             <>
//               <h6>Problem Sentences</h6>
//               <ul>
//                 {problemLinesUI.map((l, i) => (
//                   <li key={i} className="text-warning">
//                     {l.text}
//                   </li>
//                 ))}
//               </ul>
//             </>
//           )}
//         </div>
//       )}
//     </div>
//   );
// }

import { useState, useEffect } from "react";

/* =========================================================
   DAY 11.x — CORE ANALYSIS ENGINE (INTERNAL)
   These are analysis utilities, NOT UI days
========================================================= */

/* DAY 11.1 — NORMALIZATION
   Converts raw timeline events into per-sentence durations */
function normalizeSession(events, lines) {
  const result = [];
  const lineEvents = events.filter(e => e.type === "line");
  const stopEvent = events.find(e => e.type === "stop");
  if (!stopEvent) return result;

  for (let i = 0; i < lineEvents.length; i++) {
    const current = lineEvents[i];
    const next = lineEvents[i + 1];

    const startTime = current.time;
    const endTime = next ? next.time : stopEvent.time;

    result.push({
      index: current.index,
      text: lines[current.index],
      startTime,
      endTime,
      actualDuration: endTime - startTime
    });
  }
  return result;
}

/* DAY 11.2 — EXPECTED TIME + PAUSE DETECTION */
function expectedDuration(line, wpm) {
  const words = line.trim().split(/\s+/).length;
  return (60000 / wpm) * words;
}

function detectPauses(normalizedLines, wpm) {
  const tolerance = 500;
  return normalizedLines.map(item => {
    const expected = expectedDuration(item.text, wpm);
    return {
      ...item,
      expectedDuration: expected,
      paused: item.actualDuration > expected + tolerance
    };
  });
}

/* DAY 11.3 — PACE ANALYSIS */
function analyzePace(linesWithTiming) {
  const analyzed = linesWithTiming.map(line => {
    const ratio = line.actualDuration / line.expectedDuration;
    let paceLabel = "normal";
    if (ratio < 0.8) paceLabel = "rushed";
    else if (ratio > 1.3) paceLabel = "slow";

    return {
      ...line,
      paceRatio: Number(ratio.toFixed(2)),
      paceLabel
    };
  });

  const ratios = analyzed.map(l => l.paceRatio);
  const avg = ratios.reduce((s, r) => s + r, 0) / ratios.length;
  const variance =
    ratios.reduce((s, r) => s + Math.pow(r - avg, 2), 0) / ratios.length;

  return {
    perLine: analyzed,
    session: {
      averagePace: Number(avg.toFixed(2)),
      paceVariance: Number(variance.toFixed(4)),
      paceStability: Number(Math.max(0, 1 - Math.sqrt(variance)).toFixed(2))
    }
  };
}

/* DAY 11.4 — RHYTHM DRIFT */
function analyzeRhythmDrift(perLine) {
  if (perLine.length < 3) return { drift: "insufficient-data" };

  const third = Math.floor(perLine.length / 3);
  const early = perLine.slice(0, third);
  const middle = perLine.slice(third, third * 2);
  const late = perLine.slice(third * 2);

  const avg = arr => arr.reduce((s, l) => s + l.paceRatio, 0) / arr.length;

  const earlyAvg = avg(early);
  const lateAvg = avg(late);

  let drift = "stable";
  if (lateAvg - earlyAvg > 0.25) drift = "slowing-down";
  if (earlyAvg - lateAvg > 0.25) drift = "rushing-over-time";

  return { drift };
}

/* DAY 11.5 — PROBLEM SENTENCES */
function detectProblemSentences(perLine) {
  const problemLines = perLine.filter(
    l => l.paused || l.paceRatio < 0.8 || l.paceRatio > 1.3
  );

  return {
    problemLines,
    difficultyScore: Number(
      (problemLines.length / perLine.length).toFixed(2)
    )
  };
}

/* DAY 11.6 — COACHING SUMMARY */
function generateCoachingSummary({ paceSummary, drift, problems }) {
  const feedback = [];

  if (paceSummary.averagePace < 0.9)
    feedback.push("You spoke too fast overall.");
  else if (paceSummary.averagePace > 1.2)
    feedback.push("You spoke too slowly overall.");
  else feedback.push("Your pace was well controlled.");

  if (drift.drift !== "stable")
    feedback.push(`Rhythm issue: ${drift.drift.replace("-", " ")}`);

  if (problems.problemLines.length > 0)
    feedback.push(
      `Focus on ${problems.problemLines.length} difficult sentence(s).`
    );

  return feedback.join(" ");
}

/* DAY 11.7 — SESSION SCORE */
function calculateSessionScore({ paceSummary, drift, problems }) {
  let score = 100;
  score -= Math.min(20, Math.abs(paceSummary.averagePace - 1) * 40);
  score -= Math.min(20, (1 - paceSummary.paceStability) * 20);
  if (drift.drift !== "stable") score -= 15;
  score -= Math.min(25, problems.difficultyScore * 100);
  return Math.max(0, Math.round(score));
}

/* =========================================================
   DAY 1 — USER FEEDBACK FOUNDATION
   Session score + coaching + problem sentences
========================================================= */
function scoreLabel(score) {
  if (score >= 85) return "Excellent";
  if (score >= 65) return "Good";
  return "Needs Work";
}

/* =========================================================
   TELEPROMPTER COMPONENT
========================================================= */
export default function TeleprompterBox({ onStartVideo, onStopVideo }) {
  const [script, setScript] = useState(
    "Good morning everyone, and thank you for being here today. Confidence is not something you are born with, it is something you build slowly over time."
  );

  const lines = script.split(/(?<=[.!?])\s+/).filter(Boolean);

  const [isRunning, setIsRunning] = useState(false);
  const [currentLine, setCurrentLine] = useState(0);
  const [currentWord, setCurrentWord] = useState(0);
  const [wpm, setWpm] = useState(120);

  const [sessionStart, setSessionStart] = useState(null);
  const [events, setEvents] = useState([]);

  /* ===== DAY 1 UI STATE ===== */
  const [sessionScoreUI, setSessionScoreUI] = useState(null);
  const [coachingText, setCoachingText] = useState("");
  const [problemLinesUI, setProblemLinesUI] = useState([]);

  /* ===== DAY 2 UI STATE ===== */
  const [timelineData, setTimelineData] = useState([]);

  /* =========================
     START SESSION
  ========================= */
  const startSession = () => {
    setTimelineData([]);
    setSessionScoreUI(null);
    setCoachingText("");
    setProblemLinesUI([]);

    setSessionStart(Date.now());
    setEvents([
      { type: "start", time: 0 },
      { type: "line", index: 0, time: 0 }
    ]);

    setCurrentLine(0);
    setCurrentWord(0);
    setIsRunning(true);
    onStartVideo?.();
  };

  /* =========================
     STOP SESSION
  ========================= */
  const stopSession = () => {
    setIsRunning(false);
    const endTime = Date.now() - sessionStart;

    setEvents(prev => {
      const updated = [...prev, { type: "stop", time: endTime }];

      const normalized = normalizeSession(updated, lines);
      const pauses = detectPauses(normalized, wpm);
      const pace = analyzePace(pauses);
      const drift = analyzeRhythmDrift(pace.perLine);
      const problems = detectProblemSentences(pace.perLine);

      /* ===== DAY 1 OUTPUT ===== */
      setSessionScoreUI(
        calculateSessionScore({ paceSummary: pace.session, drift, problems })
      );
      setCoachingText(
        generateCoachingSummary({ paceSummary: pace.session, drift, problems })
      );
      setProblemLinesUI(problems.problemLines);

      /* ===== DAY 2 OUTPUT (PACE TIMELINE) ===== */
      setTimelineData(
        pace.perLine.map(l =>
          l.paused || l.paceRatio > 1.3
            ? "slow"
            : l.paceRatio < 0.8
            ? "rushed"
            : "normal"
        )
      );

      return updated;
    });

    onStopVideo?.();
  };

  /* =========================
     SENTENCE TIMING
  ========================= */
  useEffect(() => {
    if (!isRunning || currentLine >= lines.length) return;
    const delay = (60000 / wpm) * lines[currentLine].split(/\s+/).length;
    const t = setTimeout(() => {
      setCurrentLine(l => l + 1);
      setCurrentWord(0);
    }, delay);
    return () => clearTimeout(t);
  }, [isRunning, currentLine, wpm, lines]);

  /* =========================
     WORD TIMING
  ========================= */
  useEffect(() => {
    if (!isRunning || currentLine >= lines.length) return;
    const tokens = lines[currentLine].match(/\w+|[.,!?]/g) || [];
    if (currentWord >= tokens.length) return;
    const t = setTimeout(() => setCurrentWord(w => w + 1), 60000 / wpm);
    return () => clearTimeout(t);
  }, [isRunning, currentWord, currentLine, wpm, lines]);

  /* =========================
     UI
  ========================= */
  return (
    <div className="card bg-dark text-white p-4">
      <textarea
        className="form-control mb-3"
        rows={5}
        value={script}
        onChange={e => setScript(e.target.value)}
        disabled={isRunning}
      />

      <div className="fs-3 mb-3">
        {lines.map((line, i) => {
          const isProblem = problemLinesUI.some(p => p.text === line);
          const tokens = line.match(/\w+|[.,!?]/g) || [];
          return (
            <div key={i} className={isProblem ? "text-danger" : ""}>
              {tokens.map((t, idx) => (
                <span
                  key={idx}
                  className={
                    i === currentLine && idx === currentWord
                      ? "fw-bold text-warning"
                      : "opacity-50"
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

      <button className="btn btn-success me-2" onClick={startSession}>Start</button>
      <button className="btn btn-danger" onClick={stopSession}>Stop</button>

      {/* ===== DAY 1 FEEDBACK PANEL ===== */}
      {sessionScoreUI !== null && (
        <div className="card bg-secondary mt-4 p-3">
          <h4>
            Session Score: {sessionScoreUI}{" "}
            <span className="badge bg-dark ms-2">
              {scoreLabel(sessionScoreUI)}
            </span>
          </h4>
          <p>{coachingText}</p>

          {/* ===== DAY 2 PACE TIMELINE ===== */}
          <h6>Pace Timeline</h6>
          <div className="d-flex gap-2">
            {timelineData.map((s, i) => (
              <div
                key={i}
                style={{
                  width: 32,
                  height: 16,
                  borderRadius: 4,
                  backgroundColor:
                    s === "normal"
                      ? "#28a745"
                      : s === "rushed"
                      ? "#ffc107"
                      : "#dc3545"
                }}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}