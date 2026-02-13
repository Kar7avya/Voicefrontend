import { useState, useRef } from "react";
import CameraPreview from "./CameraPreview";
import TeleprompterBox from "./TeleprompterBox";

export default function Teleprompter() {
  const [cameraOn, setCameraOn] = useState(true);
  const [cameraStream, setCameraStream] = useState(null);

  const recorderRef = useRef(null);
  const chunksRef = useRef([]);

  const [videoURL, setVideoURL] = useState(null);

  // START VIDEO RECORDING
  const startVideoRecording = () => {
    if (!cameraStream) {
      console.error("No camera stream yet");
      return;
    }

    const tracks = cameraStream.getTracks();
    const liveTracks = tracks.filter(t => t.readyState === "live");

    if (liveTracks.length === 0) {
      console.error("Camera/mic not ready yet");
      return;
    }

    if (recorderRef.current?.state === "recording") {
      console.warn("Recording already in progress");
      return;
    }

    let options = {};
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
      options.mimeType = "video/webm;codecs=vp8,opus";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options.mimeType = "video/webm";
    } else {
      console.error("No supported MediaRecorder mimeType");
      return;
    }

    const recorder = new MediaRecorder(cameraStream, options);
    recorderRef.current = recorder;
    chunksRef.current = [];
    setVideoURL(null);

    recorder.ondataavailable = e => {
      if (e.data.size > 0) {
        chunksRef.current.push(e.data);
      }
    };

    recorder.onstop = () => {
      const blob = new Blob(chunksRef.current, { type: recorder.mimeType });
      const url = URL.createObjectURL(blob);
      setVideoURL(url);
    };

    recorder.start();
    console.log("Recording started");
  };

  // STOP VIDEO RECORDING
  const stopVideoRecording = () => {
    if (recorderRef.current?.state === "recording") {
      recorderRef.current.stop();
      console.log("Recording stopped");
    }
  };

  return (
    <div className="tp-page">
      {/* PREMIUM HEADER */}
      <div className="tp-header">
        <div className="tp-header-title">
          <span className="tp-logo-icon">🎤</span>
          AI Speaking Rehearsal
          <span className="tp-header-badge">AI Beta</span>
        </div>

        <button
          className={`tp-camera-btn ${cameraOn ? "active" : ""}`}
          onClick={() => setCameraOn(prev => !prev)}
        >
          {cameraOn ? (
            <><span className="tp-recording-dot"></span> Camera On</>
          ) : (
            "📷 Turn On Camera"
          )}
        </button>
      </div>

      {/* CAMERA + PROMPTER */}
      <div className="tp-content position-relative w-100">
        {cameraOn && (
          <CameraPreview onStreamReady={setCameraStream} />
        )}

        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex justify-content-center align-items-center">
          <TeleprompterBox
            cameraStream={cameraStream}
            onStartVideo={startVideoRecording}
            onStopVideo={stopVideoRecording}
          />
        </div>
      </div>

      {/* VIDEO PLAYBACK */}
      {videoURL && (
        <div className="tp-playback-card">
          <video
            src={videoURL}
            controls
            style={{ width: "360px" }}
          />
        </div>
      )}
    </div>
  );
}
