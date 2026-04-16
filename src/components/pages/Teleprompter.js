// import { useState, useRef } from "react";
// import CameraPreview from "./CameraPreview";
// import TeleprompterBox from "./TeleprompterBox";

// export default function Teleprompter() {
//   const [cameraOn, setCameraOn] = useState(true);
//   const [cameraStream, setCameraStream] = useState(null);

//   const recorderRef = useRef(null);
//   const chunksRef = useRef([]);

//   const [videoURL, setVideoURL] = useState(null);

//   // START VIDEO RECORDING
//   const startVideoRecording = () => {
//     if (!cameraStream) {
//       console.error("No camera stream yet");
//       return;
//     }

//     const tracks = cameraStream.getTracks();
//     const liveTracks = tracks.filter(t => t.readyState === "live");

//     if (liveTracks.length === 0) {
//       console.error("Camera/mic not ready yet");
//       return;
//     }

//     if (recorderRef.current?.state === "recording") {
//       console.warn("Recording already in progress");
//       return;
//     }

//     let options = {};
//     if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
//       options.mimeType = "video/webm;codecs=vp8,opus";
//     } else if (MediaRecorder.isTypeSupported("video/webm")) {
//       options.mimeType = "video/webm";
//     } else {
//       console.error("No supported MediaRecorder mimeType");
//       return;
//     }

//     const recorder = new MediaRecorder(cameraStream, options);
//     recorderRef.current = recorder;
//     chunksRef.current = [];
//     setVideoURL(null);

//     recorder.ondataavailable = e => {
//       if (e.data.size > 0) {
//         chunksRef.current.push(e.data);
//       }
//     };

//     recorder.onstop = () => {
//       const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
//       const url = URL.createObjectURL(blob);
//       setVideoURL(url);
//     };

//     recorder.start();
//     console.log("Recording started");
//   };

//   // STOP VIDEO RECORDING
//   const stopVideoRecording = () => {
//     if (recorderRef.current?.state === "recording") {
//       recorderRef.current.stop();
//       console.log("Recording stopped");
//     }
//   };

//   return (
//     <div className="tp-page">
//       {/* PREMIUM HEADER */}
//       <div className="tp-header">
//         <div className="tp-header-title">
//           <span className="tp-logo-icon">🎤</span>
//           AI Speaking Rehearsal
//           <span className="tp-header-badge">AI Beta</span>
//         </div>

//         <button
//           className={`tp-camera-btn ${cameraOn ? "active" : ""}`}
//           onClick={() => setCameraOn(prev => !prev)}
//         >
//           {cameraOn ? (
//             <><span className="tp-recording-dot"></span> Camera On</>
//           ) : (
//             "📷 Turn On Camera"
//           )}
//         </button>
//       </div>

//       {/* CAMERA + PROMPTER */}
//       <div className="tp-content position-relative w-100">
//         {cameraOn && (
//           <CameraPreview onStreamReady={setCameraStream} />
//         )}

//         <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
//           <TeleprompterBox
//             cameraStream={cameraStream}
//             onStartVideo={startVideoRecording}
//             onStopVideo={stopVideoRecording}
//           />
//         </div>
//       </div>

//       {/* VIDEO PLAYBACK */}
//       {videoURL && (
//         <div className="tp-playback-card">
//           <video
//             src={videoURL}
//             controls
//             style={{ width: "360px" }}
//           />
//         </div>
//       )}
//     </div>
//   );
// }
import { useState, useRef } from "react";
import CameraPreview from "./CameraPreview";
import TeleprompterBox from "./TeleprompterBox";

const css = `
  @import url('https://fonts.googleapis.com/css2?family=Syne:wght@400;600;700;800&family=DM+Sans:wght@300;400;500&display=swap');

  @keyframes pulse-ring {
    0% { transform: scale(1); opacity: 1; }
    100% { transform: scale(1.6); opacity: 0; }
  }
  @keyframes fadeSlideUp {
    from { opacity: 0; transform: translateY(20px); }
    to   { opacity: 1; transform: translateY(0); }
  }
  @keyframes shimmer {
    0%   { background-position: -400px 0; }
    100% { background-position: 400px 0; }
  }

  .tp-root {
    min-height: 100vh;
    background: #080808;
    color: white;
    font-family: 'DM Sans', sans-serif;
    display: flex;
    flex-direction: column;
    padding: 0;
    overflow: hidden;
  }

  /* ── Header ── */
  .tp-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    padding: 20px 32px;
    border-bottom: 1px solid rgba(255,255,255,0.06);
    background: rgba(8,8,8,0.9);
    backdrop-filter: blur(20px);
    position: sticky;
    top: 0;
    z-index: 100;
    animation: fadeSlideUp 0.5s ease both;
  }

  .tp-header-left {
    display: flex;
    align-items: center;
    gap: 12px;
  }

  .tp-logo-mark {
    width: 36px;
    height: 36px;
    border-radius: 10px;
    background: linear-gradient(135deg, #fff 0%, rgba(255,255,255,0.6) 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 18px;
  }

  .tp-header-title {
    font-family: 'Syne', sans-serif;
    font-weight: 700;
    font-size: 17px;
    letter-spacing: -0.3px;
    color: white;
  }

  .tp-header-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    letter-spacing: 0.5px;
    margin-top: 1px;
  }

  .tp-header-badge {
    font-size: 10px;
    font-weight: 600;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 3px 8px;
    border-radius: 20px;
    background: rgba(255,255,255,0.08);
    border: 1px solid rgba(255,255,255,0.12);
    color: rgba(255,255,255,0.5);
  }

  .tp-camera-btn {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 9px 18px;
    border-radius: 24px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.05);
    color: rgba(255,255,255,0.6);
    font-size: 13px;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .tp-camera-btn:hover {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  .tp-camera-btn.active {
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.08);
    color: white;
  }

  .tp-recording-dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ff3b30;
    position: relative;
  }

  .tp-recording-dot::after {
    content: '';
    position: absolute;
    inset: -3px;
    border-radius: 50%;
    border: 1.5px solid #ff3b30;
    animation: pulse-ring 1.2s ease-out infinite;
  }

  /* ── Main Content ── */
  .tp-content {
    flex: 1;
    display: grid;
    grid-template-columns: 1fr 400px;
    gap: 0;
    height: calc(100vh - 77px);
    overflow: hidden;
  }

  @media (max-width: 900px) {
    .tp-content {
      grid-template-columns: 1fr;
      grid-template-rows: 1fr auto;
    }
  }

  /* Camera panel */
  .tp-camera-panel {
    position: relative;
    overflow: hidden;
    background: #0a0a0a;
  }

  .tp-camera-off {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    height: 100%;
    gap: 16px;
    color: rgba(255,255,255,0.2);
  }

  .tp-camera-off-icon {
    width: 64px;
    height: 64px;
    border-radius: 20px;
    background: rgba(255,255,255,0.05);
    border: 1px solid rgba(255,255,255,0.08);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 28px;
  }

  .tp-camera-off p {
    font-size: 13px;
    letter-spacing: 0.5px;
  }

  /* Prompter panel */
  .tp-prompter-panel {
    border-left: 1px solid rgba(255,255,255,0.06);
    background: #0c0c0e;
    display: flex;
    flex-direction: column;
    overflow-y: auto;
    overflow-x: hidden;
  }

  /* Playback card */
  .tp-playback-card {
    position: absolute;
    bottom: 24px;
    left: 24px;
    z-index: 50;
    background: rgba(12,12,14,0.95);
    backdrop-filter: blur(20px);
    border: 1px solid rgba(255,255,255,0.1);
    border-radius: 20px;
    padding: 16px;
    animation: fadeSlideUp 0.4s ease both;
  }

  .tp-playback-card video {
    border-radius: 12px;
    display: block;
  }

  .tp-playback-label {
    font-size: 11px;
    color: rgba(255,255,255,0.4);
    letter-spacing: 0.8px;
    text-transform: uppercase;
    margin-bottom: 10px;
    font-weight: 600;
  }

  /* ── TeleprompterBox Card ── */
  .tp-card {
    padding: 24px;
    display: flex;
    flex-direction: column;
    gap: 0;
    height: 100%;
    box-sizing: border-box;
  }

  /* Mode bar */
  .teleprompter-mode-bar {
    display: flex;
    gap: 4px;
    margin-bottom: 20px;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.07);
    border-radius: 14px;
    padding: 4px;
  }

  .teleprompter-mode-bar .btn {
    flex: 1;
    padding: 8px 12px;
    border-radius: 10px;
    border: none;
    background: transparent;
    color: rgba(255,255,255,0.4);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: 0.2px;
  }

  .teleprompter-mode-bar .btn:hover:not(:disabled) {
    color: rgba(255,255,255,0.8);
    background: rgba(255,255,255,0.06);
  }

  .teleprompter-mode-bar .btn.active-mode {
    background: rgba(255,255,255,0.1);
    color: white;
  }

  .teleprompter-mode-bar .btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Textarea */
  .tp-textarea {
    width: 100%;
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    color: white;
    font-size: 14px;
    line-height: 1.7;
    padding: 16px;
    resize: none;
    outline: none;
    font-family: 'DM Sans', sans-serif;
    transition: border-color 0.2s ease;
    margin-bottom: 12px;
    box-sizing: border-box;
  }

  .tp-textarea:focus {
    border-color: rgba(255,255,255,0.2);
  }

  .tp-textarea::placeholder {
    color: rgba(255,255,255,0.2);
  }

  /* Upload zone */
  .teleprompter-upload-zone {
    border: 1px dashed rgba(255,255,255,0.1);
    border-radius: 14px;
    padding: 20px;
    text-align: center;
    cursor: pointer;
    margin-bottom: 16px;
    transition: all 0.2s ease;
    background: rgba(255,255,255,0.02);
  }

  .teleprompter-upload-zone:hover {
    border-color: rgba(255,255,255,0.25);
    background: rgba(255,255,255,0.04);
  }

  .teleprompter-upload-zone input {
    display: none;
  }

  .tp-upload-icon {
    font-size: 24px;
    display: block;
    margin-bottom: 6px;
  }

  .tp-upload-label {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    margin: 0;
    letter-spacing: 0.3px;
  }

  /* Buttons */
  .btn-enhance {
    padding: 12px 20px;
    border-radius: 14px;
    border: none;
    background: white;
    color: #000;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
    letter-spacing: -0.2px;
  }

  .btn-enhance:hover:not(:disabled) {
    background: #e8e8e8;
    transform: translateY(-1px);
  }

  .btn-enhance:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .btn-practice {
    padding: 12px 20px;
    border-radius: 14px;
    border: 1px solid rgba(255,255,255,0.15);
    background: rgba(255,255,255,0.06);
    color: white;
    font-size: 13px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .btn-practice:hover:not(:disabled) {
    background: rgba(255,255,255,0.1);
    border-color: rgba(255,255,255,0.25);
  }

  .btn-practice:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .btn-edit {
    padding: 10px 16px;
    border-radius: 12px;
    border: 1px solid rgba(255,255,255,0.1);
    background: rgba(255,255,255,0.04);
    color: rgba(255,255,255,0.6);
    font-size: 12px;
    font-weight: 600;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .btn-edit:hover {
    background: rgba(255,255,255,0.08);
    color: white;
  }

  /* Spinner */
  .teleprompter-spinner-overlay {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 40px 20px;
    gap: 12px;
  }

  .tp-spinner {
    width: 32px;
    height: 32px;
    border: 2px solid rgba(255,255,255,0.08);
    border-top-color: white;
    border-radius: 50%;
    animation: spin 0.75s linear infinite;
  }

  @keyframes spin { to { transform: rotate(360deg); } }

  .tp-spinner-text {
    font-size: 14px;
    color: white;
    font-weight: 500;
    margin: 0;
  }

  .tp-spinner-sub {
    font-size: 12px;
    color: rgba(255,255,255,0.3);
    margin: 0;
    text-align: center;
  }

  /* Error */
  .teleprompter-error {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 12px 16px;
    border-radius: 14px;
    background: rgba(255,59,48,0.1);
    border: 1px solid rgba(255,59,48,0.2);
    color: #ff6b6b;
    font-size: 13px;
    margin-bottom: 16px;
  }

  .tp-error-dismiss {
    margin-left: auto;
    background: none;
    border: none;
    color: rgba(255,107,107,0.7);
    cursor: pointer;
    font-size: 12px;
    font-family: 'DM Sans', sans-serif;
    padding: 2px 8px;
  }

  /* Enhancement panels */
  .teleprompter-enhance-panel {
    border-radius: 14px;
    padding: 16px;
    margin-bottom: 12px;
    border: 1px solid rgba(255,255,255,0.06);
    background: rgba(255,255,255,0.03);
  }

  .teleprompter-enhance-panel h6 {
    font-size: 11px;
    font-weight: 700;
    letter-spacing: 0.8px;
    text-transform: uppercase;
    color: rgba(255,255,255,0.4);
    margin-bottom: 10px;
    font-family: 'Syne', sans-serif;
  }

  .teleprompter-enhance-panel ul {
    margin: 0;
    padding-left: 16px;
  }

  .teleprompter-enhance-panel li {
    font-size: 13px;
    color: rgba(255,255,255,0.7);
    line-height: 1.6;
    margin-bottom: 4px;
  }

  .teleprompter-enhanced-text {
    font-size: 13px;
    color: rgba(255,255,255,0.8);
    line-height: 1.7;
    white-space: pre-wrap;
  }

  .tp-divider {
    height: 1px;
    background: rgba(255,255,255,0.06);
    margin: 16px 0;
  }

  /* Practice display */
  .tp-practice-display {
    background: rgba(255,255,255,0.03);
    border: 1px solid rgba(255,255,255,0.06);
    border-radius: 16px;
    padding: 20px;
    min-height: 160px;
    margin-bottom: 16px;
    font-size: 15px;
    line-height: 1.9;
    letter-spacing: 0.1px;
    word-wrap: break-word;
    overflow-wrap: break-word;
    white-space: normal;
    overflow: hidden;
  }

  .tp-word-active {
    color: white;
    font-weight: 600;
    background: rgba(255,255,255,0.1);
    border-radius: 4px;
    padding: 1px 3px;
  }

  .tp-word-dim {
    color: rgba(255,255,255,0.25);
  }

  /* Practice controls */
  .tp-btn-start {
    padding: 10px 20px;
    border-radius: 12px;
    border: none;
    background: white;
    color: #000;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .tp-btn-start:hover:not(:disabled) {
    background: #e8e8e8;
  }

  .tp-btn-start:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .tp-btn-stop {
    padding: 10px 20px;
    border-radius: 12px;
    border: 1px solid rgba(255,59,48,0.3);
    background: rgba(255,59,48,0.1);
    color: #ff6b6b;
    font-size: 13px;
    font-weight: 700;
    cursor: pointer;
    transition: all 0.2s ease;
    font-family: 'DM Sans', sans-serif;
  }

  .tp-btn-stop:hover:not(:disabled) {
    background: rgba(255,59,48,0.2);
  }

  .tp-btn-stop:disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  /* Score card */
  .tp-score-card {
    background: rgba(255,255,255,0.04);
    border: 1px solid rgba(255,255,255,0.08);
    border-radius: 16px;
    padding: 20px;
    margin-top: 16px;
    animation: fadeSlideUp 0.4s ease both;
  }

  .tp-score-value {
    font-family: 'Syne', sans-serif;
    font-size: 40px;
    font-weight: 800;
    color: white;
    letter-spacing: -2px;
    line-height: 1;
  }

  .tp-score-label {
    font-size: 12px;
    font-weight: 700;
    letter-spacing: 1px;
    text-transform: uppercase;
    padding: 4px 10px;
    border-radius: 20px;
  }

  .tp-score-label.excellent {
    background: rgba(52,199,89,0.15);
    color: #34c759;
    border: 1px solid rgba(52,199,89,0.2);
  }

  .tp-score-label.good {
    background: rgba(255,214,10,0.15);
    color: #ffd60a;
    border: 1px solid rgba(255,214,10,0.2);
  }

  .tp-score-label.needs-work {
    background: rgba(255,59,48,0.15);
    color: #ff3b30;
    border: 1px solid rgba(255,59,48,0.2);
  }

  .tp-coaching-text {
    font-size: 13px;
    color: rgba(255,255,255,0.5);
    margin-top: 10px;
    line-height: 1.6;
  }

  /* Timeline */
  .tp-timeline-bar {
    display: flex;
    gap: 3px;
    height: 6px;
    border-radius: 6px;
    overflow: hidden;
  }

  .tp-timeline-segment {
    flex: 1;
    border-radius: 2px;
  }

  .tp-timeline-segment.normal  { background: rgba(52,199,89,0.6); }
  .tp-timeline-segment.slow    { background: rgba(255,214,10,0.6); }
  .tp-timeline-segment.rushed  { background: rgba(255,59,48,0.6); }

  /* Tags */
  .teleprompter-tag-pause    { background: rgba(255,214,10,0.15); color: #ffd60a; border: 1px solid rgba(255,214,10,0.2); border-radius: 6px; padding: 1px 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin: 0 4px; }
  .teleprompter-tag-slow     { background: rgba(10,132,255,0.15); color: #0a84ff; border: 1px solid rgba(10,132,255,0.2); border-radius: 6px; padding: 1px 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin: 0 4px; }
  .teleprompter-tag-fast     { background: rgba(255,159,10,0.15); color: #ff9f0a; border: 1px solid rgba(255,159,10,0.2); border-radius: 6px; padding: 1px 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin: 0 4px; }
  .teleprompter-tag-emphasize{ background: rgba(191,90,242,0.15); color: #bf5af2; border: 1px solid rgba(191,90,242,0.2); border-radius: 6px; padding: 1px 6px; font-size: 10px; font-weight: 700; letter-spacing: 0.5px; margin: 0 4px; }

  .tp-fade-in {
    animation: fadeSlideUp 0.35s ease both;
  }

  .teleprompter-practice-active .tp-practice-display {
    border-color: rgba(255,255,255,0.12);
    background: rgba(255,255,255,0.05);
  }
`;

export default function Teleprompter() {
  const [cameraOn, setCameraOn] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);
  const recorderRef = useRef(null);
  const chunksRef = useRef([]);
  const [videoURL, setVideoURL] = useState(null);

  const startVideoRecording = () => {
    if (!cameraStream) return;
    const tracks = cameraStream.getTracks();
    const liveTracks = tracks.filter(t => t.readyState === "live");
    if (liveTracks.length === 0) return;
    if (recorderRef.current?.state === "recording") return;

    let options = {};
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
      options.mimeType = "video/webm;codecs=vp8,opus";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options.mimeType = "video/webm";
    } else return;

    const recorder = new MediaRecorder(cameraStream, options);
    recorderRef.current = recorder;
    chunksRef.current = [];
    setVideoURL(null);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) chunksRef.current.push(e.data);
    };
    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      setVideoURL(URL.createObjectURL(blob));
    };

    recorder.start();
  };

  const stopVideoRecording = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
    }
  };

  return (
    <div className="tp-root">
      <style>{css}</style>

      {/* ── Header ── */}
      <div className="tp-header">
        <div className="tp-header-left">
          <div className="tp-logo-mark">🎤</div>
          <div>
            <div className="tp-header-title">AI Speaking Rehearsal</div>
            <div className="tp-header-sub">Practice · Analyze · Improve</div>
          </div>
          <span className="tp-header-badge">Beta</span>
        </div>

        <button
          className={`tp-camera-btn ${cameraOn ? "active" : ""}`}
          onClick={() => setCameraOn(p => !p)}
        >
          {cameraOn ? (
            <><span className="tp-recording-dot" /> Camera Live</>
          ) : (
            "📷 Enable Camera"
          )}
        </button>
      </div>

      {/* ── Main Grid ── */}
      <div className="tp-content">

        {/* Camera panel */}
        <div className="tp-camera-panel" style={{ position: "relative" }}>
          {cameraOn ? (
            <CameraPreview onStreamReady={setCameraStream} />
          ) : (
            <div className="tp-camera-off">
              <div className="tp-camera-off-icon">📷</div>
              <p>Camera is off</p>
            </div>
          )}

          {/* Video playback overlay */}
          {videoURL && (
            <div className="tp-playback-card">
              <div className="tp-playback-label">Last Recording</div>
              <video src={videoURL} controls style={{ width: 280, borderRadius: 12 }} />
            </div>
          )}
        </div>

        {/* Teleprompter panel */}
        <div className="tp-prompter-panel">
          <TeleprompterBox
            cameraStream={cameraStream}
            onStartVideo={startVideoRecording}
            onStopVideo={stopVideoRecording}
          />
        </div>

      </div>
    </div>
  );
}