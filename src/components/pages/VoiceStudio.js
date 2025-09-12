import React, { useState } from "react";

// Add these CDN links to your public/index.html file for Bootstrap to work.
// <link href="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/css/bootstrap.min.css" rel="stylesheet">
// <script src="https://cdn.jsdelivr.net/npm/bootstrap@5.3.0/dist/js/bootstrap.bundle.min.js"></script>

export default function VoiceUpload() {
  const [voiceFile, setVoiceFile] = useState(null);
  const [scriptFile, setScriptFile] = useState(null);
  const [scriptText, setScriptText] = useState("");
  const [useTextMode, setUseTextMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [refinedAudioPublicUrl, setRefinedAudioPublicUrl] = useState(null);
  const [originalVoicePath, setOriginalVoicePath] = useState(null);
  const [similarityData, setSimilarityData] = useState(null);

  // Voice control settings
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity: 0.8,
    style: 0.0,
    speakerBoost: true
  });

  const API_BASE_URL = "http://localhost:5000"; // Your backend URL

  const addLog = (message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
    console[type === "error" ? "error" : "log"](message);
  };

  const handleVoiceSettingChange = (setting, value) => {
    setVoiceSettings(prev => ({
      ...prev,
      [setting]: value
    }));
    addLog(`🎛️ ${setting} set to: ${value}`);
  };

  const analyzeSimilarity = async (originalPath, refinedPath) => {
    try {
      addLog("🔍 Analyzing voice similarity...");
      const response = await fetch(`${API_BASE_URL}/analyze-similarity`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          originalVoicePath: originalPath,
          refinedVoicePath: refinedPath,
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || "Similarity analysis failed");
      }

      const similarityResult = await response.json();
      setSimilarityData(similarityResult);
      addLog(`✅ Similarity analysis complete - Overall: ${(similarityResult.overallSimilarity * 100).toFixed(1)}%`);
      return similarityResult;
    } catch (error) {
      addLog(`❌ Similarity analysis error: ${error.message}`, "error");
      return null;
    }
  };

  const handleUpload = async () => {
    if (!voiceFile) {
      addLog("❌ Please select a voice file", "error");
      return;
    }
    if (!scriptFile && !scriptText.trim()) {
      addLog("❌ Please provide a script file or type a script", "error");
      return;
    }

    setIsProcessing(true);
    setRefinedAudioPublicUrl(null);
    setSimilarityData(null);
    addLog("🚀 Starting the enhanced voice synthesis workflow...");

    try {
      // Step 1: Upload voice file
      addLog("🎤 Uploading voice file...");
      const voiceFormData = new FormData();
      voiceFormData.append("voice", voiceFile);

      const voiceUploadResponse = await fetch(`${API_BASE_URL}/voiceupload`, {
        method: "POST",
        body: voiceFormData,
      });

      if (!voiceUploadResponse.ok) {
        const error = await voiceUploadResponse.json();
        throw new Error(error.error || "Voice upload failed");
      }

      const voiceUploadResult = await voiceUploadResponse.json();
      const voicePath = voiceUploadResult.path;
      setOriginalVoicePath(voicePath);
      addLog("✅ Voice file uploaded successfully");

      // Step 2: Upload script file (if using file mode)
      let scriptPath = null;
      if (!useTextMode && scriptFile) {
        addLog("📜 Uploading script file...");
        const scriptFormData = new FormData();
        scriptFormData.append("script", scriptFile);

        const scriptUploadResponse = await fetch(`${API_BASE_URL}/scriptupload`, {
          method: "POST",
          body: scriptFormData,
        });

        if (!scriptUploadResponse.ok) {
          const error = await scriptUploadResponse.json();
          throw new Error(error.error || "Script upload failed");
        }

        const scriptUploadResult = await scriptUploadResponse.json();
        scriptPath = scriptUploadResult.path;
        addLog("✅ Script file uploaded successfully");
      }

      // Step 3: Create ElevenLabs voice clone
      addLog("🗣️ Creating ElevenLabs voice clone...");
      const voiceCloneResponse = await fetch(`${API_BASE_URL}/create-elevenlabs-voice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          voicePath: voicePath,
        }),
      });

      if (!voiceCloneResponse.ok) {
        const error = await voiceCloneResponse.json();
        throw new Error(error.error || "Voice cloning failed");
      }

      const voiceCloneResult = await voiceCloneResponse.json();
      const elevenLabsVoiceId = voiceCloneResult.voiceId;
      addLog(`✅ Voice clone created with ID: ${elevenLabsVoiceId}`);

      // Step 4: Refine voice with script and enhanced settings
      addLog("🪄 Generating refined audio with enhanced settings...");
      const refinePayload = {
        elevenLabsVoiceId: elevenLabsVoiceId,
        voiceSettings: voiceSettings
      };

      if (useTextMode) {
        refinePayload.scriptContent = scriptText;
      } else {
        refinePayload.scriptPath = scriptPath;
      }

      const refineResponse = await fetch(`${API_BASE_URL}/refinevoice`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(refinePayload),
      });

      if (!refineResponse.ok) {
        const error = await refineResponse.json();
        throw new Error(error.error || "Voice refinement failed");
      }

      const refineResult = await refineResponse.json();
      const refinedPath = refineResult.refinedPath;
      addLog("✅ Voice refined successfully with enhanced settings");

      // Step 5: Get public URL for the refined audio
      addLog("🔗 Getting public URL for refined audio...");
      const publicUrlResponse = await fetch(`${API_BASE_URL}/get-public-url`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          path: refinedPath,
        }),
      });

      if (!publicUrlResponse.ok) {
        const error = await publicUrlResponse.json();
        throw new Error(error.error || "Failed to get public URL");
      }

      const publicUrlResult = await publicUrlResponse.json();
      setRefinedAudioPublicUrl(publicUrlResult.publicUrl);
      addLog("✅ Public URL generated successfully");

      // Step 6: Analyze similarity between original and refined voice
      await analyzeSimilarity(voicePath, refinedPath);

      addLog("🎉 Complete workflow finished! Voice cloning with similarity analysis complete.");

    } catch (error) {
      addLog(`❌ Error: ${error.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const playRefinedAudio = () => {
    if (!refinedAudioPublicUrl) {
      addLog("No refined audio to play.", "error");
      return;
    }
    try {
      addLog("🎧 Playing refined audio...");
      const audio = new Audio(refinedAudioPublicUrl);
      audio.play().then(() => {
        addLog("✅ Audio playing successfully.");
      }).catch((err) => {
        addLog("❌ Error playing audio: " + err.message, "error");
      });
    } catch (err) {
      addLog("❌ Error playing audio: " + err.message, "error");
    }
  };

  const downloadRefinedAudio = () => {
    if (!refinedAudioPublicUrl) {
      addLog("No refined audio to download.", "error");
      return;
    }
    try {
      addLog("💾 Downloading refined audio...");
      const link = document.createElement("a");
      link.href = refinedAudioPublicUrl;
      link.download = `refined_voice_${Date.now()}.mp3`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      addLog("✅ Download started.");
    } catch (err) {
      addLog("❌ Error downloading audio: " + err.message, "error");
    }
  };

  const resetAll = () => {
    setVoiceFile(null);
    setScriptFile(null);
    setScriptText("");
    setRefinedAudioPublicUrl(null);
    setOriginalVoicePath(null);
    setSimilarityData(null);
    setLogs([]);
    setVoiceSettings({
      stability: 0.5,
      similarity: 0.8,
      style: 0.0,
      speakerBoost: true
    });
    addLog("🔄 All settings reset to default");
  };

  const getQualityColor = (percentage) => {
    if (percentage >= 0.9) return "text-success";
    if (percentage >= 0.7) return "text-warning";
    return "text-danger";
  };

  return (
    <div className="container-fluid bg-dark p-4">
      <div className="container p-4 rounded shadow-lg bg-light">
        {/* Header */}
        <header className="text-center mb-5">
          <h1 className="display-4 fw-bold text-primary mb-2">
            Advanced Voice Cloning Studio
          </h1>
          <p className="lead text-secondary">
            Perfect your voice cloning with precision controls and real-time similarity analysis.
          </p>
        </header>

        <div className="row g-4">
          {/* Main Controls Panel */}
          <div className="col-lg-8">
            <section className="d-flex flex-column gap-4">
              
              {/* File Uploads & Script */}
              <div className="card rounded-3 shadow bg-light text-dark">
                <div className="card-body">
                  <h2 className="card-title h4 fw-bold mb-4 text-primary">Input Files & Script</h2>
                  
                  {/* Voice File Upload */}
                  <div className="mb-4">
                    <label className="form-label">Original Voice File</label>
                    <input
                      type="file"
                      accept="audio/*"
                      className="form-control"
                      onChange={(e) => {
                        setVoiceFile(e.target.files[0]);
                        addLog("🎤 Voice file selected: " + e.target.files[0]?.name);
                      }}
                      disabled={isProcessing}
                    />
                    <small className="form-text text-muted">
                      Upload high-quality audio (MP3, WAV, M4A, WebM) - min 30 seconds recommended.
                    </small>
                  </div>

                  {/* Script Input Mode */}
                  <div className="mb-3">
                    <label className="form-label">Script Mode</label>
                    <div className="d-flex gap-3">
                      <div className="form-check">
                        <input
                          type="radio"
                          name="script-mode"
                          checked={!useTextMode}
                          onChange={() => setUseTextMode(false)}
                          disabled={isProcessing}
                          className="form-check-input"
                        />
                        <label className="form-check-label">File Upload</label>
                      </div>
                      <div className="form-check">
                        <input
                          type="radio"
                          name="script-mode"
                          checked={useTextMode}
                          onChange={() => setUseTextMode(true)}
                          disabled={isProcessing}
                          className="form-check-input"
                        />
                        <label className="form-check-label">Text Input</label>
                      </div>
                    </div>
                  </div>

                  {/* Script Input Field */}
                  {useTextMode ? (
                    <div className="mb-3">
                      <label className="form-label">Script Content</label>
                      <textarea
                        value={scriptText}
                        onChange={(e) => {
                          setScriptText(e.target.value);
                          setScriptFile(null);
                        }}
                        placeholder="Enter the text you want the cloned voice to speak..."
                        rows="4"
                        className="form-control"
                        disabled={isProcessing}
                      />
                    </div>
                  ) : (
                    <div className="mb-3">
                      <label className="form-label">Script File</label>
                      <input
                        type="file"
                        accept=".txt,.doc,.docx,.pdf"
                        className="form-control"
                        onChange={(e) => {
                          setScriptFile(e.target.files[0]);
                          addLog("📜 Script file selected: " + e.target.files[0]?.name);
                          setScriptText("");
                        }}
                        disabled={isProcessing}
                      />
                    </div>
                  )}
                </div>
              </div>

              {/* Advanced Voice Controls */}
              <div className="card rounded-3 shadow">
                <div className="card-body">
                  <h2 className="card-title h4 fw-bold mb-4 text-primary">Voice Quality Controls</h2>
                  <div className="row g-4">
                    {/* Stability */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label d-flex justify-content-between">
                          <span>Stability</span>
                          <span className="fw-bold">{voiceSettings.stability.toFixed(2)}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={voiceSettings.stability}
                          onChange={(e) => handleVoiceSettingChange('stability', parseFloat(e.target.value))}
                          disabled={isProcessing}
                          className="form-range"
                        />
                        <small className="form-text text-muted">Higher = more stable, Lower = more varied.</small>
                      </div>
                    </div>

                    {/* Similarity Boost */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label d-flex justify-content-between">
                          <span>Similarity</span>
                          <span className="fw-bold">{voiceSettings.similarity.toFixed(2)}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={voiceSettings.similarity}
                          onChange={(e) => handleVoiceSettingChange('similarity', parseFloat(e.target.value))}
                          disabled={isProcessing}
                          className="form-range"
                        />
                        <small className="form-text text-muted">Higher = more similar to original voice.</small>
                      </div>
                    </div>

                    {/* Style Exaggeration */}
                    <div className="col-md-6">
                      <div className="mb-3">
                        <label className="form-label d-flex justify-content-between">
                          <span>Style</span>
                          <span className="fw-bold">{voiceSettings.style.toFixed(2)}</span>
                        </label>
                        <input
                          type="range"
                          min="0"
                          max="1"
                          step="0.01"
                          value={voiceSettings.style}
                          onChange={(e) => handleVoiceSettingChange('style', parseFloat(e.target.value))}
                          disabled={isProcessing}
                          className="form-range"
                        />
                        <small className="form-text text-muted">Higher = more expressive and stylized.</small>
                      </div>
                    </div>

                    {/* Speaker Boost */}
                    <div className="col-md-6 d-flex align-items-center">
                      <div className="form-check form-switch mb-3">
                        <input
                          type="checkbox"
                          checked={voiceSettings.speakerBoost}
                          onChange={(e) => handleVoiceSettingChange('speakerBoost', e.target.checked)}
                          disabled={isProcessing}
                          className="form-check-input"
                          id="speakerBoostSwitch"
                        />
                        <label className="form-check-label" htmlFor="speakerBoostSwitch">
                          Speaker Boost
                          <small className="d-block text-muted">Enhances speaker similarity (recommended).</small>
                        </label>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="card rounded-3 shadow">
                <div className="card-body d-flex flex-wrap gap-3">
                  <button
                    onClick={handleUpload}
                    disabled={isProcessing || !voiceFile || (!scriptFile && !scriptText.trim())}
                    className="btn btn-primary flex-grow-1"
                  >
                    {isProcessing ? (
                      <>
                        <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                        Processing...
                      </>
                    ) : (
                      "Clone & Generate"
                    )}
                  </button>
                  
                  <button
                    onClick={resetAll}
                    disabled={isProcessing}
                    className="btn btn-secondary flex-grow-1"
                  >
                    Reset All
                  </button>
                </div>
              </div>

              {/* Generated Audio Display */}
              {refinedAudioPublicUrl && (
                <div className="card rounded-3 shadow">
                  <div className="card-body">
                    <h2 className="card-title h4 fw-bold mb-4 text-primary">Generated Audio</h2>
                    
                    <audio controls className="w-100 mb-4" src={refinedAudioPublicUrl}>
                      Your browser does not support the audio element.
                    </audio>
                    
                    <div className="d-flex flex-wrap gap-3">
                      <button
                        onClick={playRefinedAudio}
                        className="btn btn-success flex-grow-1"
                      >
                        Play
                      </button>
                      <button
                        onClick={downloadRefinedAudio}
                        className="btn btn-info flex-grow-1"
                      >
                        Download
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </section>
          </div>

          {/* Sidebar - Similarity Analysis & Logs */}
          <div className="col-lg-4 d-flex flex-column gap-4">
            
            {/* Similarity Analysis */}
            {similarityData && (
              <div className="card rounded-3 shadow">
                <div className="card-body">
                  <h2 className="card-title h4 fw-bold mb-4 text-primary">Similarity Analysis</h2>
                  
                  <div className="d-flex flex-column gap-3">
                    {[
                      { label: 'Overall Similarity', value: similarityData.overallSimilarity, color: 'bg-primary' },
                      { label: 'Pitch Accuracy', value: similarityData.pitchSimilarity, color: 'bg-success' },
                      { label: 'Tone Match', value: similarityData.toneSimilarity, color: 'bg-info' },
                      { label: 'Speed Match', value: similarityData.speedSimilarity, color: 'bg-warning' },
                      { label: 'Clarity Score', value: similarityData.clarityScore, color: 'bg-dark' },
                    ].map((item, index) => (
                      <div key={index}>
                        <div className="d-flex justify-content-between align-items-center mb-1">
                          <span className="text-sm">{item.label}</span>
                          <span className={`fw-bold ${getQualityColor(item.value)}`}>
                            {(item.value * 100).toFixed(1)}%
                          </span>
                        </div>
                        <div className="progress rounded-pill" style={{ height: '8px' }}>
                          <div
                            className={`progress-bar ${item.color}`}
                            role="progressbar"
                            style={{ width: `${item.value * 100}%` }}
                            aria-valuenow={item.value * 100}
                            aria-valuemin="0"
                            aria-valuemax="100"
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="mt-4 text-center">
                    <span className={`badge rounded-pill ${
                      similarityData.overallSimilarity >= 0.9 ? 'bg-success' :
                      similarityData.overallSimilarity >= 0.7 ? 'bg-warning' :
                      'bg-danger'
                    }`}>
                      {similarityData.overallSimilarity >= 0.9 ? 'Excellent Match!' :
                       similarityData.overallSimilarity >= 0.7 ? 'Good Match' :
                       'Needs Improvement'}
                    </span>
                  </div>
                </div>
              </div>
            )}

            {/* Console Logs */}
            <div className="card rounded-3 shadow">
              <div className="card-body">
                <h2 className="card-title h4 fw-bold mb-4 text-primary">Process Log</h2>
                
                <div className="card bg-light border-0" style={{ height: '320px', overflowY: 'auto' }}>
                  <div className="card-body p-3 font-monospace small">
                    {logs.length === 0 ? (
                      <div className="text-muted fst-italic">Ready to process...</div>
                    ) : (
                      <div className="d-flex flex-column gap-2">
                        {logs.map((log, index) => (
                          <div key={index} className={log.type === "error" ? "text-danger" : "text-success"}>
                            {log.message}
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
