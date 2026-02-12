import { useEffect, useRef } from "react";

export default function CameraPreview({ onStreamReady }) {
  const videoRef = useRef(null);

  useEffect(() => {
    let stream;

    async function startCamera() {
      try {
        stream = await navigator.mediaDevices.getUserMedia({
          video: true,
          audio: true
        });

        if (videoRef.current) {
          videoRef.current.srcObject = stream;
        }

        // 🔑 Send stream to parent
        if (onStreamReady) {
          onStreamReady(stream);
        }
      } catch (err) {
        console.error("Camera access failed:", err);
      }
    }

    startCamera();

    return () => {
      if (stream) {
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [onStreamReady]);

  return (
    <video
      ref={videoRef}
      autoPlay
      playsInline
      muted
      className="position-absolute top-0 start-0 w-100 h-100"
      style={{ objectFit: "cover" }}
    />
  );
}
