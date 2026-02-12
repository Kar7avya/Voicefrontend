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
    // 1️⃣ Stream must exist
    if (!cameraStream) {
      console.error("No camera stream yet");
      return;
    }

    // 2️⃣ Stream must have live tracks
    const tracks = cameraStream.getTracks();
    const liveTracks = tracks.filter(t => t.readyState === "live");

    if (liveTracks.length === 0) {
      console.error("Camera/mic not ready yet");
      return;
    }

    // 3️⃣ Prevent double start
    if (recorderRef.current?.state === "recording") {
      console.warn("Recording already in progress");
      return;
    }

    // 4️⃣ Pick supported mime type
    let options = {};
    if (MediaRecorder.isTypeSupported("video/webm;codecs=vp8,opus")) {
      options.mimeType = "video/webm;codecs=vp8,opus";
    } else if (MediaRecorder.isTypeSupported("video/webm")) {
      options.mimeType = "video/webm";
    } else {
      console.error("No supported MediaRecorder mimeType");
      return;
    }

    // 5️⃣ Create recorder
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
    <div className="vh-100 bg-dark text-white">
      {/* HEADER */}
      <div className="d-flex justify-content-between align-items-center px-4 py-2 bg-secondary">
        <h5 className="mb-0">🎤 Teleprompter Practice</h5>

        <button
          className={`btn btn-sm ${
            cameraOn ? "btn-warning" : "btn-outline-light"
          }`}
          onClick={() => setCameraOn(prev => !prev)}
        >
          {cameraOn ? "Turn Camera Off" : "Turn Camera On"}
        </button>
      </div>

      {/* CAMERA + PROMPTER */}
      <div
        className="position-relative w-100"
        style={{ height: "calc(100vh - 48px)" }}
      >
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
        <div className="bg-dark text-center py-3">
          <video
            src={videoURL}
            controls
            style={{ width: "320px", borderRadius: "8px" }}
          />
        </div>
      )}
    </div>
  );
}
