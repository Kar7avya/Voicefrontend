// import React, { useState } from "react";
// import styled, { keyframes, css } from 'styled-components';

// // Keyframes for subtle animations
// const fadeIn = keyframes`
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

// const spin = keyframes`
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// `;

// // Color and Font Variables
// const primaryColor = '#e6b95b'; // Muted gold
// const secondaryColor = '#b0b0b0'; // Soft gray
// const accentColor = '#6a6a6a';
// const darkBg = '#1c1c1c';
// const lightBg = '#333333';
// const cardBg = 'rgba(40, 40, 40, 0.8)';
// const successColor = '#94C992'; // Muted green
// const warningColor = '#E6D29A'; // Muted yellow
// const errorColor = '#E08080'; // Muted red
// const fontFamily = `'Inter', sans-serif`;

// // Main container for the entire page
// const MainContainer = styled.div`
//   min-height: 100vh;
//   background-color: ${darkBg};
//   color: ${secondaryColor};
//   font-family: ${fontFamily};
//   padding: 1rem;
//   animation: ${fadeIn} 0.8s ease-out;
//   margin-top:-3.79rem;
// `;

// // Main content card
// const StudioCard = styled.div`
//   max-width: 1200px;
//   margin: 2rem auto;
//   background-color: ${lightBg};
//   border-radius: 16px;
//   box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
//   padding: 2.5rem;
//   display: flex;
//   flex-direction: column;
//   gap: 2rem;
  

//   @media (min-width: 992px) {
//     flex-direction: row;
//     padding: 3rem;
//   }
// `;

// // Header component
// const Header = styled.header`
//   text-align: center;
//   margin-bottom: 2rem;
// `;

// const HeaderTitle = styled.h1`
//   font-size: 2.5rem;
//   font-weight: 700;
//   color: ${primaryColor};
//   margin-bottom: 0.5rem;
// `;

// const HeaderSubtitle = styled.p`
//   font-size: 1rem;
//   color: ${secondaryColor};
//   opacity: 0.8;
// `;

// // Styled card components for sections
// const SectionCard = styled.div`
//   background-color: ${cardBg};
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(255, 255, 255, 0.05);
//   border-radius: 12px;
//   box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
//   padding: 1.5rem;
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
// `;

// const SectionTitle = styled.h2`
//   font-size: 1.25rem;
//   font-weight: 600;
//   color: #fff;
//   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
//   padding-bottom: 1rem;
//   margin-bottom: 1.5rem;
// `;

// // File input styling
// const StyledInput = styled.input`
//   display: block;
//   width: 100%;
//   padding: 0.75rem 1rem;
//   font-size: 1rem;
//   font-family: ${fontFamily};
//   color: #f0f0f0;
//   background-color: rgba(255, 255, 255, 0.05);
//   border: 1px solid rgba(255, 255, 255, 0.1);
//   border-radius: 8px;
//   transition: all 0.3s ease;
//   &:focus {
//     outline: none;
//     border-color: ${primaryColor};
//     box-shadow: 0 0 0 3px rgba(230, 185, 91, 0.2);
//   }
//   &:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }
// `;

// // Radio button styling
// const RadioContainer = styled.div`
//   display: flex;
//   gap: 1.5rem;
// `;

// const RadioLabel = styled.label`
//   display: flex;
//   align-items: center;
//   cursor: pointer;
//   color: #c0c0c0;
//   font-size: 0.9rem;
  
//   input {
//     appearance: none;
//     width: 16px;
//     height: 16px;
//     border: 1px solid ${secondaryColor};
//     border-radius: 50%;
//     margin-right: 8px;
//     transition: all 0.2s;
//     position: relative;
//     &:checked {
//       background-color: ${primaryColor};
//       border-color: ${primaryColor};
//       box-shadow: 0 0 0 3px rgba(230, 185, 91, 0.2);
//     }
//   }
// `;

// // Textarea styling
// const StyledTextarea = styled.textarea`
//   width: 100%;
//   min-height: 120px;
//   padding: 1rem;
//   font-family: ${fontFamily};
//   font-size: 1rem;
//   color: #f0f0f0;
//   background-color: rgba(255, 255, 255, 0.05);
//   border: 1px solid rgba(255, 255, 255, 0.1);
//   border-radius: 8px;
//   resize: vertical;
//   transition: all 0.3s ease;
//   &:focus {
//     outline: none;
//     border-color: ${primaryColor};
//     box-shadow: 0 0 0 3px rgba(230, 185, 91, 0.2);
//   }
//   &:disabled {
//     opacity: 0.6;
//     cursor: not-allowed;
//   }
// `;

// // Range slider styling
// const SliderContainer = styled.div`
//   margin-bottom: 1.5rem;
// `;

// const SliderLabel = styled.label`
//   display: flex;
//   justify-content: space-between;
//   align-items: center;
//   font-size: 0.9rem;
//   margin-bottom: 0.5rem;
//   color: #c0c0c0;
// `;

// const StyledRange = styled.input`
//   -webkit-appearance: none;
//   width: 100%;
//   height: 8px;
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 4px;
//   outline: none;
//   transition: background 0.2s ease;
  
//   &::-webkit-slider-thumb {
//     -webkit-appearance: none;
//     appearance: none;
//     width: 20px;
//     height: 20px;
//     background: ${primaryColor};
//     border: 2px solid ${darkBg};
//     border-radius: 50%;
//     cursor: pointer;
//     transition: background 0.3s ease;
//     box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
//   }

//   &:hover::-webkit-slider-thumb {
//     background: ${primaryColor};
//   }
// `;

// // Button styling
// const Button = styled.button`
//   padding: 0.85rem 2rem;
//   font-size: 1rem;
//   font-weight: 600;
//   border-radius: 8px;
//   cursor: pointer;
//   border: none;
//   transition: all 0.3s ease;
//   flex-grow: 1;

//   ${({ primary }) => primary && css`
//     background: ${primaryColor};
//     color: ${darkBg};
//     box-shadow: 0 4px 15px rgba(230, 185, 91, 0.3);
//     &:hover {
//       background: #d6a54f;
//       transform: translateY(-2px);
//       box-shadow: 0 6px 20px rgba(230, 185, 91, 0.4);
//     }
//   `}

//   ${({ secondary }) => secondary && css`
//     background: transparent;
//     border: 1px solid ${secondaryColor};
//     color: ${secondaryColor};
//     &:hover {
//       background: rgba(255, 255, 255, 0.1);
//       transform: translateY(-2px);
//     }
//   `}

//   &:disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
//     transform: none;
//     box-shadow: none;
//   }
// `;

// const PlayButton = styled(Button)`
//   background: ${successColor};
//   color: ${darkBg};
//   &:hover { background: #62a061; }
// `;

// const DownloadButton = styled(Button)`
//   background: #5A6D88; // Muted blue-gray
//   color: #f0f0f0;
//   &:hover { background: #475a72; }
// `;

// // Audio player styling
// const StyledAudio = styled.audio`
//   width: 100%;
//   filter: invert(1) hue-rotate(180deg);
//   margin-bottom: 1.5rem;
//   &::-webkit-media-controls-panel {
//     background-color: ${lightBg};
//     border-radius: 8px;
//     color: #e0e0e0;
//   }
//   &::-webkit-media-controls-play-button {
//     color: ${primaryColor};
//   }
// `;

// // Log panel styling
// const LogContainer = styled.div`
//   height: 320px;
//   overflow-y: auto;
//   padding: 1rem;
//   background-color: rgba(255, 255, 255, 0.03);
//   border-radius: 8px;
//   border: 1px solid rgba(255, 255, 255, 0.05);
//   font-family: 'Fira Code', 'Roboto Mono', monospace;
//   font-size: 0.85rem;
//   line-height: 1.6;
// `;

// const LogMessage = styled.div`
//   color: ${({ type }) => {
//     switch (type) {
//       case 'info':
//         return secondaryColor;
//       case 'success':
//         return successColor;
//       case 'error':
//         return errorColor;
//       default:
//         return secondaryColor;
//     }
//   }};
//   margin-bottom: 0.5rem;
//   opacity: ${({ type }) => (type === 'info' ? 0.7 : 1)};
// `;

// const EmptyLog = styled.div`
//   color: ${accentColor};
//   font-style: italic;
//   text-align: center;
// `;

// // Progress bar styling
// const ProgressBar = styled.div`
//   height: 8px;
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 4px;
//   overflow: hidden;
//   margin-top: 0.5rem;
// `;

// const ProgressFill = styled.div`
//   height: 100%;
//   width: ${({ value }) => value * 100}%;
//   background-color: ${({ color }) => {
//     switch (color) {
//       case 'bg-primary': return primaryColor;
//       case 'bg-success': return successColor;
//       case 'bg-info': return secondaryColor;
//       case 'bg-warning': return warningColor;
//       case 'bg-dark': return accentColor;
//       default: return primaryColor;
//     }
//   }};
//   transition: width 0.4s ease-in-out;
// `;

// const Badge = styled.span`
//   font-size: 0.85rem;
//   font-weight: 600;
//   padding: 0.4rem 1.2rem;
//   border-radius: 50px;
//   background-color: ${({ score }) => {
//     if (score >= 0.9) return successColor;
//     if (score >= 0.7) return warningColor;
//     return errorColor;
//   }};
//   color: ${darkBg};
// `;

// export default function VoiceUpload() {
//   const [voiceFile, setVoiceFile] = useState(null);
//   const [scriptFile, setScriptFile] = useState(null);
//   const [scriptText, setScriptText] = useState("");
//   const [useTextMode, setUseTextMode] = useState(false);
//   const [logs, setLogs] = useState([]);
//   const [isProcessing, setIsProcessing] = useState(false);
//   const [refinedAudioPublicUrl, setRefinedAudioPublicUrl] = useState(null);
//   const [originalVoicePath, setOriginalVoicePath] = useState(null);
//   const [similarityData, setSimilarityData] = useState(null);

//   const [voiceSettings, setVoiceSettings] = useState({
//     stability: 0.5,
//     similarity: 0.8,
//     style: 0.0,
//     speakerBoost: true
//   });

//   const API_BASE_URL = "http://localhost:5000";

//   const addLog = (message, type = "info") => {
//     setLogs((prev) => [...prev, { message, type }]);
//     console[type === "error" ? "error" : "log"](message);
//   };

//   const handleVoiceSettingChange = (setting, value) => {
//     setVoiceSettings(prev => ({
//       ...prev,
//       [setting]: value
//     }));
//     addLog(`🎛️ ${setting} set to: ${value}`);
//   };

//   const analyzeSimilarity = async (originalPath, refinedPath) => {
//     try {
//       addLog("🔍 Analyzing voice similarity...");
//       const response = await fetch(`${API_BASE_URL}/analyze-similarity`, {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({
//           originalVoicePath: originalPath,
//           refinedVoicePath: refinedPath,
//         }),
//       });

//       if (!response.ok) {
//         const error = await response.json();
//         throw new Error(error.error || "Similarity analysis failed");
//       }

//       const similarityResult = await response.json();
//       setSimilarityData(similarityResult);
//       addLog(`✅ Similarity analysis complete - Overall: ${(similarityResult.overallSimilarity * 100).toFixed(1)}%`);
//       return similarityResult;
//     } catch (error) {
//       addLog(`❌ Similarity analysis error: ${error.message}`, "error");
//       return null;
//     }
//   };

//   const handleUpload = async () => {
//     if (!voiceFile) {
//       addLog("❌ Please select a voice file", "error");
//       return;
//     }
//     if (!scriptFile && !scriptText.trim()) {
//       addLog("❌ Please provide a script file or type a script", "error");
//       return;
//     }

//     setIsProcessing(true);
//     setRefinedAudioPublicUrl(null);
//     setSimilarityData(null);
//     addLog("🚀 Starting the enhanced voice synthesis workflow...");

//     try {
//       addLog("🎤 Uploading voice file...");
//       const voiceFormData = new FormData();
//       voiceFormData.append("voice", voiceFile);
//       const voiceUploadResponse = await fetch(`${API_BASE_URL}/voiceupload`, {
//         method: "POST", body: voiceFormData,
//       });

//       if (!voiceUploadResponse.ok) {
//         const error = await voiceUploadResponse.json();
//         throw new Error(error.error || "Voice upload failed");
//       }
//       const voiceUploadResult = await voiceUploadResponse.json();
//       const voicePath = voiceUploadResult.path;
//       setOriginalVoicePath(voicePath);
//       addLog("✅ Voice file uploaded successfully");

//       let scriptPath = null;
//       if (!useTextMode && scriptFile) {
//         addLog("📜 Uploading script file...");
//         const scriptFormData = new FormData();
//         scriptFormData.append("script", scriptFile);
//         const scriptUploadResponse = await fetch(`${API_BASE_URL}/scriptupload`, {
//           method: "POST", body: scriptFormData,
//         });
//         if (!scriptUploadResponse.ok) {
//           const error = await scriptUploadResponse.json();
//           throw new Error(error.error || "Script upload failed");
//         }
//         const scriptUploadResult = await scriptUploadResponse.json();
//         scriptPath = scriptUploadResult.path;
//         addLog("✅ Script file uploaded successfully");
//       }

//       addLog("🗣️ Creating ElevenLabs voice clone...");
//       const voiceCloneResponse = await fetch(`${API_BASE_URL}/create-elevenlabs-voice`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ voicePath: voicePath }),
//       });
//       if (!voiceCloneResponse.ok) {
//         const error = await voiceCloneResponse.json();
//         throw new Error(error.error || "Voice cloning failed");
//       }
//       const voiceCloneResult = await voiceCloneResponse.json();
//       const elevenLabsVoiceId = voiceCloneResult.voiceId;
//       addLog(`✅ Voice clone created with ID: ${elevenLabsVoiceId}`);

//       addLog("🪄 Generating refined audio with enhanced settings...");
//       const refinePayload = { elevenLabsVoiceId: elevenLabsVoiceId, voiceSettings: voiceSettings };
//       if (useTextMode) {
//         refinePayload.scriptContent = scriptText;
//       } else {
//         refinePayload.scriptPath = scriptPath;
//       }
//       const refineResponse = await fetch(`${API_BASE_URL}/refinevoice`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify(refinePayload),
//       });
//       if (!refineResponse.ok) {
//         const error = await refineResponse.json();
//         throw new Error(error.error || "Voice refinement failed");
//       }
//       const refineResult = await refineResponse.json();
//       const refinedPath = refineResult.refinedPath;
//       addLog("✅ Voice refined successfully with enhanced settings");

//       addLog("🔗 Getting public URL for refined audio...");
//       const publicUrlResponse = await fetch(`${API_BASE_URL}/get-public-url`, {
//         method: "POST", headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ path: refinedPath }),
//       });
//       if (!publicUrlResponse.ok) {
//         const error = await publicUrlResponse.json();
//         throw new Error(error.error || "Failed to get public URL");
//       }
//       const publicUrlResult = await publicUrlResponse.json();
//       setRefinedAudioPublicUrl(publicUrlResult.publicUrl);
//       addLog("✅ Public URL generated successfully");

//       await analyzeSimilarity(voicePath, refinedPath);
//       addLog("🎉 Complete workflow finished! Voice cloning with similarity analysis complete.");
//     } catch (error) {
//       addLog(`❌ Error: ${error.message}`, "error");
//     } finally {
//       setIsProcessing(false);
//     }
//   };

//   const playRefinedAudio = () => {
//     if (!refinedAudioPublicUrl) {
//       addLog("No refined audio to play.", "error");
//       return;
//     }
//     try {
//       addLog("🎧 Playing refined audio...");
//       const audio = new Audio(refinedAudioPublicUrl);
//       audio.play().then(() => {
//         addLog("✅ Audio playing successfully.");
//       }).catch((err) => {
//         addLog("❌ Error playing audio: " + err.message, "error");
//       });
//     } catch (err) {
//       addLog("❌ Error playing audio: " + err.message, "error");
//     }
//   };

//   const downloadRefinedAudio = () => {
//     if (!refinedAudioPublicUrl) {
//       addLog("No refined audio to download.", "error");
//       return;
//     }
//     try {
//       addLog("💾 Downloading refined audio...");
//       const link = document.createElement("a");
//       link.href = refinedAudioPublicUrl;
//       link.download = `refined_voice_${Date.now()}.mp3`;
//       document.body.appendChild(link);
//       link.click();
//       document.body.removeChild(link);
//       addLog("✅ Download started.");
//     } catch (err) {
//       addLog("❌ Error downloading audio: " + err.message, "error");
//     }
//   };

//   const resetAll = () => {
//     setVoiceFile(null);
//     setScriptFile(null);
//     setScriptText("");
//     setRefinedAudioPublicUrl(null);
//     setOriginalVoicePath(null);
//     setSimilarityData(null);
//     setLogs([]);
//     setVoiceSettings({
//       stability: 0.5,
//       similarity: 0.8,
//       style: 0.0,
//       speakerBoost: true
//     });
//     addLog("🔄 All settings reset to default");
//   };

//   return (
//     <MainContainer>
//       <Header>
//         <HeaderTitle>Advanced Voice Cloning Studio</HeaderTitle>
//         <HeaderSubtitle>
//           Perfect your voice with precision controls & real-time similarity analysis.
//         </HeaderSubtitle>
//       </Header>

//       <StudioCard>
//         {/* Main Controls Panel */}
//         <div style={{ flex: 2 }}>
//           <SectionCard>
//             <SectionTitle>Input Files & Script</SectionTitle>
            
//             <div className="d-flex flex-column gap-3">
//               <label>Original Voice File</label>
//               <StyledInput
//                 type="file"
//                 accept="audio/*"
//                 onChange={(e) => {
//                   setVoiceFile(e.target.files[0]);
//                   addLog("🎤 Voice file selected: " + e.target.files[0]?.name);
//                 }}
//                 disabled={isProcessing}
//               />
//               <small style={{ color: secondaryColor }}>
//                 Upload high-quality audio (MP3, WAV, M4A, WebM) - min 30 seconds recommended.
//               </small>
//             </div>

//             <div className="d-flex flex-column gap-3">
//               <label>Script Mode</label>
//               <RadioContainer>
//                 <RadioLabel>
//                   <input
//                     type="radio"
//                     name="script-mode"
//                     checked={!useTextMode}
//                     onChange={() => setUseTextMode(false)}
//                     disabled={isProcessing}
//                   />
//                   File Upload
//                 </RadioLabel>
//                 <RadioLabel>
//                   <input
//                     type="radio"
//                     name="script-mode"
//                     checked={useTextMode}
//                     onChange={() => setUseTextMode(true)}
//                     disabled={isProcessing}
//                   />
//                   Text Input
//                 </RadioLabel>
//               </RadioContainer>
//             </div>

//             {useTextMode ? (
//               <div className="d-flex flex-column gap-3">
//                 <label>Script Content</label>
//                 <StyledTextarea
//                   value={scriptText}
//                   onChange={(e) => {
//                     setScriptText(e.target.value);
//                     setScriptFile(null);
//                   }}
//                   placeholder="Enter the text you want the cloned voice to speak..."
//                   disabled={isProcessing}
//                 />
//               </div>
//             ) : (
//               <div className="d-flex flex-column gap-3">
//                 <label>Script File</label>
//                 <StyledInput
//                   type="file"
//                   accept=".txt,.doc,.docx,.pdf"
//                   onChange={(e) => {
//                     setScriptFile(e.target.files[0]);
//                     addLog("📜 Script file selected: " + e.target.files[0]?.name);
//                     setScriptText("");
//                   }}
//                   disabled={isProcessing}
//                 />
//               </div>
//             )}
//           </SectionCard>

//           <SectionCard>
//             <SectionTitle>Voice Quality Controls</SectionTitle>
//             <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '2rem' }}>
//               <SliderContainer>
//                 <SliderLabel>
//                   <span>Stability</span>
//                   <span style={{ fontWeight: 'bold' }}>{voiceSettings.stability.toFixed(2)}</span>
//                 </SliderLabel>
//                 <StyledRange
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.01"
//                   value={voiceSettings.stability}
//                   onChange={(e) => handleVoiceSettingChange('stability', parseFloat(e.target.value))}
//                   disabled={isProcessing}
//                 />
//                 <small style={{ color: secondaryColor, opacity: 0.7 }}>
//                   Higher = more stable, Lower = more varied.
//                 </small>
//               </SliderContainer>

//               <SliderContainer>
//                 <SliderLabel>
//                   <span>Similarity</span>
//                   <span style={{ fontWeight: 'bold' }}>{voiceSettings.similarity.toFixed(2)}</span>
//                 </SliderLabel>
//                 <StyledRange
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.01"
//                   value={voiceSettings.similarity}
//                   onChange={(e) => handleVoiceSettingChange('similarity', parseFloat(e.target.value))}
//                   disabled={isProcessing}
//                 />
//                 <small style={{ color: secondaryColor, opacity: 0.7 }}>
//                   Higher = more similar to original voice.
//                 </small>
//               </SliderContainer>
              
//               <SliderContainer>
//                 <SliderLabel>
//                   <span>Style</span>
//                   <span style={{ fontWeight: 'bold' }}>{voiceSettings.style.toFixed(2)}</span>
//                 </SliderLabel>
//                 <StyledRange
//                   type="range"
//                   min="0"
//                   max="1"
//                   step="0.01"
//                   value={voiceSettings.style}
//                   onChange={(e) => handleVoiceSettingChange('style', parseFloat(e.target.value))}
//                   disabled={isProcessing}
//                 />
//                 <small style={{ color: secondaryColor, opacity: 0.7 }}>
//                   Higher = more expressive and stylized.
//                 </small>
//               </SliderContainer>

//               <div style={{ display: 'flex', alignItems: 'center' }}>
//                 <label>
//                   <input
//                     type="checkbox"
//                     checked={voiceSettings.speakerBoost}
//                     onChange={(e) => handleVoiceSettingChange('speakerBoost', e.target.checked)}
//                     disabled={isProcessing}
//                   />
//                   Speaker Boost
//                   <small style={{ display: 'block', color: secondaryColor, opacity: 0.7 }}>
//                     Enhances speaker similarity (recommended).
//                   </small>
//                 </label>
//               </div>
//             </div>
//           </SectionCard>

//           <SectionCard>
//             <SectionTitle>Actions</SectionTitle>
//             <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
//               <Button
//                 primary
//                 onClick={handleUpload}
//                 disabled={isProcessing || !voiceFile || (!scriptFile && !scriptText.trim())}
//               >
//                 {isProcessing ? (
//                   <>
//                     <span style={{ animation: `${spin} 1s linear infinite` }}>⚙️</span> Processing...
//                   </>
//                 ) : (
//                   "Clone & Generate"
//                 )}
//               </Button>
//               <Button secondary onClick={resetAll} disabled={isProcessing}>
//                 Reset All
//               </Button>
//             </div>
//           </SectionCard>

//           {refinedAudioPublicUrl && (
//             <SectionCard>
//               <SectionTitle>Generated Audio</SectionTitle>
//               <StyledAudio controls src={refinedAudioPublicUrl}>
//                 Your browser does not support the audio element.
//               </StyledAudio>
//               <div style={{ display: 'flex', flexWrap: 'wrap', gap: '1rem' }}>
//                 <PlayButton onClick={playRefinedAudio}>Play</PlayButton>
//                 <DownloadButton onClick={downloadRefinedAudio}>Download</DownloadButton>
//               </div>
//             </SectionCard>
//           )}
//         </div>

//         {/* Sidebar */}
//         <div style={{ flex: 1, display: 'flex', flexDirection: 'column', gap: '2rem' }}>
//           {similarityData && (
//             <SectionCard>
//               <SectionTitle>Similarity Analysis</SectionTitle>
//               <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
//                 {[
//                   { label: 'Overall Similarity', value: similarityData.overallSimilarity },
//                   { label: 'Pitch Accuracy', value: similarityData.pitchSimilarity },
//                   { label: 'Tone Match', value: similarityData.toneSimilarity },
//                   { label: 'Speed Match', value: similarityData.speedSimilarity },
//                   { label: 'Clarity Score', value: similarityData.clarityScore },
//                 ].map((item, index) => (
//                   <div key={index}>
//                     <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.25rem' }}>
//                       <span style={{ fontSize: '0.9rem' }}>{item.label}</span>
//                       <span style={{ fontWeight: 'bold', color: item.value >= 0.9 ? successColor : item.value >= 0.7 ? warningColor : errorColor }}>
//                         {(item.value * 100).toFixed(1)}%
//                       </span>
//                     </div>
//                     <ProgressBar>
//                       <ProgressFill value={item.value} color={item.value >= 0.9 ? 'bg-success' : item.value >= 0.7 ? 'bg-warning' : 'bg-danger'} />
//                     </ProgressBar>
//                   </div>
//                 ))}
//               </div>
//               <div style={{ textAlign: 'center', marginTop: '1rem' }}>
//                 <Badge score={similarityData.overallSimilarity}>
//                   {similarityData.overallSimilarity >= 0.9 ? 'Excellent Match!' : similarityData.overallSimilarity >= 0.7 ? 'Good Match' : 'Needs Improvement'}
//                 </Badge>
//               </div>
//             </SectionCard>
//           )}

//           <SectionCard>
//             <SectionTitle>Process Log</SectionTitle>
//             <LogContainer>
//               {logs.length === 0 ? (
//                 <EmptyLog>Ready to process...</EmptyLog>
//               ) : (
//                 logs.map((log, index) => (
//                   <LogMessage key={index} type={log.type}>
//                     {log.message}
//                   </LogMessage>
//                 ))
//               )}
//             </LogContainer>
//           </SectionCard>
//         </div>
//       </StudioCard>
//     </MainContainer>
//   );
// }

import React, { useState } from "react";
import styled, { keyframes, css } from "styled-components";

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;
const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const primaryColor = "#e6b95b";
const secondaryColor = "#b0b0b0";
const accentColor = "#6a6a6a";
const darkBg = "#1c1c1c";
const lightBg = "#333333";
const cardBg = "rgba(40, 40, 40, 0.8)";
const successColor = "#94C992";
const warningColor = "#E6D29A";
const errorColor = "#E08080";
const fontFamily = `'Inter', sans-serif`;

const MainContainer = styled.div`
  min-height: 100vh;
  background-color: ${darkBg};
  color: ${secondaryColor};
  font-family: ${fontFamily};
  padding: 1rem;
  animation: ${fadeIn} 0.8s ease-out;
  margin-top: -3.79rem;
`;
const StudioCard = styled.div`
  max-width: 1200px;
  margin: 2rem auto;
  background-color: ${lightBg};
  border-radius: 16px;
  box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 2rem;
  @media (min-width: 992px) {
    flex-direction: row;
    padding: 3rem;
  }
`;
const Header = styled.header`
  text-align: center;
  margin-bottom: 2rem;
`;
const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: ${primaryColor};
  margin-bottom: 0.5rem;
`;
const HeaderSubtitle = styled.p`
  font-size: 1rem;
  color: ${secondaryColor};
  opacity: 0.8;
`;
const SectionCard = styled.div`
  background-color: ${cardBg};
  backdrop-filter: blur(10px);
  border: 1px solid rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;
const SectionTitle = styled.h2`
  font-size: 1.25rem;
  font-weight: 600;
  color: #fff;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  padding-bottom: 1rem;
  margin-bottom: 1.5rem;
`;
const StyledInput = styled.input`
  display: block;
  width: 100%;
  padding: 0.75rem 1rem;
  font-size: 1rem;
  font-family: ${fontFamily};
  color: #f0f0f0;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: ${primaryColor};
    box-shadow: 0 0 0 3px rgba(230, 185, 91, 0.2);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed.
  }
`;
const RadioContainer = styled.div`
  display: flex;
  gap: 1.5rem;
`;
const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  cursor: pointer;
  color: #c0c0c0;
  font-size: 0.9rem;
  input {
    appearance: none;
    width: 16px;
    height: 16px;
    border: 1px solid ${secondaryColor};
    border-radius: 50%;
    margin-right: 8px;
    transition: all 0.2s;
    position: relative;
    &:checked {
      background-color: ${primaryColor};
      border-color: ${primaryColor};
      box-shadow: 0 0 0 3px rgba(230, 185, 91, 0.2);
    }
  }
`;
const StyledTextarea = styled.textarea`
  width: 100%;
  min-height: 120px;
  padding: 1rem;
  font-family: ${fontFamily};
  font-size: 1rem;
  color: #f0f0f0;
  background-color: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.1);
  border-radius: 8px;
  resize: vertical;
  transition: all 0.3s ease;
  &:focus {
    outline: none;
    border-color: ${primaryColor};
    box-shadow: 0 0 0 3px rgba(230, 185, 91, 0.2);
  }
  &:disabled {
    opacity: 0.6;
    cursor: not-allowed;
  }
`;
const SliderContainer = styled.div`
  margin-bottom: 1.5rem;
`;
const SliderLabel = styled.label`
  display: flex;
  justify-content: space-between;
  align-items: center;
  font-size: 0.9rem;
  margin-bottom: 0.5rem;
  color: #c0c0c0;
`;
const StyledRange = styled.input`
  -webkit-appearance: none;
  width: 100%;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  outline: none;
  &::-webkit-slider-thumb {
    -webkit-appearance: none;
    appearance: none;
    width: 20px;
    height: 20px;
    background: ${primaryColor};
    border: 2px solid ${darkBg};
    border-radius: 50%;
    cursor: pointer;
    box-shadow: 0 2px 5px rgba(0, 0, 0, 0.3);
  }
`;
const Button = styled.button`
  padding: 0.85rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 8px;
  cursor: pointer;
  border: none;
  transition: all 0.3s ease;
  flex-grow: 1;
  ${({ primary }) =>
    primary &&
    css`
      background: ${primaryColor};
      color: ${darkBg};
      box-shadow: 0 4px 15px rgba(230, 185, 91, 0.3);
      &:hover {
        background: #d6a54f;
        transform: translateY(-2px);
        box-shadow: 0 6px 20px rgba(230, 185, 91, 0.4);
      }
    `}
  ${({ secondary }) =>
    secondary &&
    css`
      background: transparent;
      border: 1px solid ${secondaryColor};
      color: ${secondaryColor};
      &:hover {
        background: rgba(255, 255, 255, 0.1);
        transform: translateY(-2px);
      }
    `}
  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
    transform: none;
    box-shadow: none;
  }
`;
const PlayButton = styled(Button)`
  background: ${successColor};
  color: ${darkBg};
  &:hover {
    background: #62a061;
  }
`;
const DownloadButton = styled(Button)`
  background: #5a6d88;
  color: #f0f0f0;
  &:hover {
    background: #475a72;
  }
`;
const StyledAudio = styled.audio`
  width: 100%;
  filter: invert(1) hue-rotate(180deg);
  margin-bottom: 1.5rem;
`;
const LogContainer = styled.div`
  height: 320px;
  overflow-y: auto;
  padding: 1rem;
  background-color: rgba(255, 255, 255, 0.03);
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  font-family: "Fira Code", "Roboto Mono", monospace;
  font-size: 0.85rem;
  line-height: 1.6;
`;
const LogMessage = styled.div`
  color: ${({ type }) => {
    switch (type) {
      case "info":
        return secondaryColor;
      case "success":
        return successColor;
      case "error":
        return errorColor;
      default:
        return secondaryColor;
    }
  }};
  margin-bottom: 0.5rem;
  opacity: ${({ type }) => (type === "info" ? 0.7 : 1)};
`;
const EmptyLog = styled.div`
  color: ${accentColor};
  font-style: italic;
  text-align: center;
`;
const ProgressBar = styled.div`
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 0.5rem;
`;
const ProgressFill = styled.div`
  height: 100%;
  width: ${({ value }) => value * 100}%;
  background-color: ${({ color }) => {
    switch (color) {
      case "bg-success":
        return successColor;
      case "bg-warning":
        return warningColor;
      case "bg-danger":
        return errorColor;
      default:
        return primaryColor;
    }
  }};
  transition: width 0.4s ease-in-out;
`;
const Badge = styled.span`
  font-size: 0.85rem;
  font-weight: 600;
  padding: 0.4rem 1.2rem;
  border-radius: 50px;
  background-color: ${({ score }) => {
    if (score >= 0.9) return successColor;
    if (score >= 0.7) return warningColor;
    return errorColor;
  }};
  color: ${darkBg};
`;

const API_BASE = process.env.REACT_APP_API_BASE || "/api";

const getAuthToken = () =>
  localStorage.getItem("access_token") ||
  localStorage.getItem("sb:token") ||
  localStorage.getItem("supabase.jwt");

const authHeaders = () => {
  const token = getAuthToken();
  if (!token) throw new Error("Missing auth token");
  return { Authorization: `Bearer ${token}` };
};

export default function VoiceUpload() {
  const [voiceFile, setVoiceFile] = useState(null);
  const [voiceStoragePath, setVoiceStoragePath] = useState(null);

  const [scriptFile, setScriptFile] = useState(null);
  const [scriptStoragePath, setScriptStoragePath] = useState(null);
  const [scriptText, setScriptText] = useState("");

  const [useTextMode, setUseTextMode] = useState(false);
  const [logs, setLogs] = useState([]);
  const [isProcessing, setIsProcessing] = useState(false);

  const [refinedAudioPublicUrl, setRefinedAudioPublicUrl] = useState(null);
  const [similarityData, setSimilarityData] = useState(null);
  const [voiceSettings, setVoiceSettings] = useState({
    stability: 0.5,
    similarity: 0.8,
    style: 0.0,
    speakerBoost: true,
  });
  const [clonedVoiceId, setClonedVoiceId] = useState(null);

  const addLog = (message, type = "info") => {
    setLogs((prev) => [...prev, { message, type }]);
    console[type === "error" ? "error" : "log"](message);
  };

  const uploadVoice = async () => {
    if (!voiceFile) throw new Error("Select a voice file first");
    addLog("🎤 Uploading voice to Supabase...");
    const formData = new FormData();
    formData.append("voice", voiceFile);
    const response = await fetch(`${API_BASE}/voice-studio/voice`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error("Voice upload failed");
    const { data } = await response.json();
    setVoiceStoragePath(data.storagePath);
    addLog("✅ Voice stored", "success");
    return data.storagePath;
  };

  const uploadScript = async () => {
    if (!scriptFile) throw new Error("Script file missing");
    addLog("📜 Uploading script to Supabase...");
    const formData = new FormData();
    formData.append("script", scriptFile);
    const response = await fetch(`${API_BASE}/voice-studio/script`, {
      method: "POST",
      headers: authHeaders(),
      body: formData,
    });
    if (!response.ok) throw new Error("Script upload failed");
    const { data } = await response.json();
    setScriptStoragePath(data.storagePath);
    addLog("✅ Script stored", "success");
    return data.storagePath;
  };

  const createVoiceClone = async (voicePath) => {
    addLog("🗣️ Creating ElevenLabs voice clone...");
    const response = await fetch(`${API_BASE}/voice-studio/create-elevenlabs-voice`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ voicePath }),
    });
    if (!response.ok) throw new Error("Voice cloning failed");
    const { data } = await response.json();
    setClonedVoiceId(data.voiceId);
    addLog(`✅ Voice clone ready (ID: ${data.voiceId})`, "success");
    return data.voiceId;
  };

  const generateRefinedAudio = async ({ voiceId, scriptPath, scriptContent }) => {
    addLog("🪄 Generating refined voice...");
    const response = await fetch(`${API_BASE}/voice-studio/refine`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({
        elevenLabsVoiceId: voiceId,
        scriptPath,
        scriptContent,
        voiceSettings,
      }),
    });
    if (!response.ok) {
      const error = await response.json().catch(() => ({}));
      throw new Error(error.error || "Voice refinement failed");
    }
    const { data } = await response.json();
    setRefinedAudioPublicUrl(data.publicUrl);
    addLog("✅ Refined voice uploaded", "success");
    return data.storagePath;
  };

  const runSimilarity = async (originalPath, refinedPath) => {
    addLog("🔍 Comparing original vs refined...");
    const response = await fetch(`${API_BASE}/voice-studio/analyze-similarity`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...authHeaders(),
      },
      body: JSON.stringify({ originalVoicePath: originalPath, refinedVoicePath: refinedPath }),
    });
    if (!response.ok) throw new Error("Similarity analysis failed");
    const data = await response.json();
    setSimilarityData(data);
    addLog("✅ Similarity report ready", "success");
  };

  const handleCloneAndGenerate = async () => {
    try {
      if (!voiceFile && !voiceStoragePath) throw new Error("Upload a voice sample first");
      if (!useTextMode && !scriptFile && !scriptStoragePath)
        throw new Error("Provide a script file");
      if (useTextMode && !scriptText.trim()) throw new Error("Type a script to continue");

      setIsProcessing(true);
      setRefinedAudioPublicUrl(null);
      setSimilarityData(null);

      const storedVoicePath = voiceStoragePath || (await uploadVoice());
      const storedScriptPath =
        !useTextMode && (scriptStoragePath || (await uploadScript()));

      const voiceId = clonedVoiceId || (await createVoiceClone(storedVoicePath));

      const refinedPath = await generateRefinedAudio({
        voiceId,
        scriptPath: useTextMode ? null : storedScriptPath,
        scriptContent: useTextMode ? scriptText.trim() : null,
      });

      await runSimilarity(storedVoicePath, refinedPath);
      addLog("🎉 Workflow complete!", "success");
    } catch (err) {
      addLog(`❌ ${err.message}`, "error");
    } finally {
      setIsProcessing(false);
    }
  };

  const playRefinedAudio = () => {
    if (!refinedAudioPublicUrl) return;
    const audio = new Audio(refinedAudioPublicUrl);
    audio
      .play()
      .then(() => addLog("🎧 Playing refined audio", "success"))
      .catch((err) => addLog(`❌ Playback error: ${err.message}`, "error"));
  };

  const downloadRefinedAudio = () => {
    if (!refinedAudioPublicUrl) return;
    const link = document.createElement("a");
    link.href = refinedAudioPublicUrl;
    link.download = `refined_voice_${Date.now()}.mp3`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    addLog("💾 Download started", "success");
  };

  const resetAll = () => {
    setVoiceFile(null);
    setVoiceStoragePath(null);
    setScriptFile(null);
    setScriptStoragePath(null);
    setScriptText("");
    setClonedVoiceId(null);
    setRefinedAudioPublicUrl(null);
    setSimilarityData(null);
    setLogs([]);
    setVoiceSettings({ stability: 0.5, similarity: 0.8, style: 0.0, speakerBoost: true });
    addLog("🔄 Reset complete");
  };

  return (
    <MainContainer>
      <Header>
        <HeaderTitle>Advanced Voice Cloning Studio</HeaderTitle>
        <HeaderSubtitle>Clone your voice, tweak delivery, and compare results instantly.</HeaderSubtitle>
      </Header>
      <StudioCard>
        <div style={{ flex: 2 }}>
          <SectionCard>
            <SectionTitle>Input Files & Script</SectionTitle>
            <div>
              <label>Original Voice File</label>
              <StyledInput
                type="file"
                accept="audio/*"
                disabled={isProcessing}
                onChange={(e) => {
                  setVoiceFile(e.target.files?.[0] || null);
                  setVoiceStoragePath(null);
                  setClonedVoiceId(null);
                  addLog(`🎤 Voice selected: ${e.target.files?.[0]?.name || "none"}`);
                }}
              />
              <small style={{ color: secondaryColor }}>
                Upload MP3/WAV/WEBM (≥30 seconds recommended).
              </small>
            </div>
            <div>
              <label>Script Mode</label>
              <RadioContainer>
                <RadioLabel>
                  <input
                    type="radio"
                    name="script-mode"
                    checked={!useTextMode}
                    onChange={() => {
                      setUseTextMode(false);
                      setScriptText("");
                    }}
                    disabled={isProcessing}
                  />
                  File Upload
                </RadioLabel>
                <RadioLabel>
                  <input
                    type="radio"
                    name="script-mode"
                    checked={useTextMode}
                    onChange={() => {
                      setUseTextMode(true);
                      setScriptFile(null);
                      setScriptStoragePath(null);
                    }}
                    disabled={isProcessing}
                  />
                  Text Input
                </RadioLabel>
              </RadioContainer>
            </div>
            {useTextMode ? (
              <div>
                <label>Script Content</label>
                <StyledTextarea
                  placeholder="Paste the script the cloned voice should speak..."
                  value={scriptText}
                  disabled={isProcessing}
                  onChange={(e) => setScriptText(e.target.value)}
                />
              </div>
            ) : (
              <div>
                <label>Script File</label>
                <StyledInput
                  type="file"
                  accept=".txt,.doc,.docx,.pdf"
                  disabled={isProcessing}
                  onChange={(e) => {
                    setScriptFile(e.target.files?.[0] || null);
                    setScriptStoragePath(null);
                    addLog(`📜 Script selected: ${e.target.files?.[0]?.name || "none"}`);
                  }}
                />
              </div>
            )}
          </SectionCard>

          <SectionCard>
            <SectionTitle>Voice Quality Controls</SectionTitle>
            <div
              style={{
                display: "grid",
                gridTemplateColumns: "repeat(auto-fit,minmax(250px,1fr))",
                gap: "2rem",
              }}
            >
              {[
                { key: "stability", label: "Stability", help: "Higher = steadier delivery" },
                { key: "similarity", label: "Similarity", help: "Higher = closer to original" },
                { key: "style", label: "Style", help: "Higher = more expressive" },
              ].map(({ key, label, help }) => (
                <SliderContainer key={key}>
                  <SliderLabel>
                    <span>{label}</span>
                    <span style={{ fontWeight: "bold" }}>{voiceSettings[key].toFixed(2)}</span>
                  </SliderLabel>
                  <StyledRange
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={voiceSettings[key]}
                    disabled={isProcessing}
                    onChange={(e) =>
                      setVoiceSettings((prev) => ({
                        ...prev,
                        [key]: parseFloat(e.target.value),
                      }))
                    }
                  />
                  <small style={{ color: secondaryColor, opacity: 0.7 }}>{help}</small>
                </SliderContainer>
              ))}
              <div>
                <label>
                  <input
                    type="checkbox"
                    checked={voiceSettings.speakerBoost}
                    disabled={isProcessing}
                    onChange={(e) =>
                      setVoiceSettings((prev) => ({
                        ...prev,
                        speakerBoost: e.target.checked,
                      }))
                    }
                  />{" "}
                  Speaker Boost
                </label>
                <small style={{ display: "block", color: secondaryColor, opacity: 0.7 }}>
                  Enhances resemblance to the original speaker.
                </small>
              </div>
            </div>
          </SectionCard>

          <SectionCard>
            <SectionTitle>Actions</SectionTitle>
            <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
              <Button
                primary
                disabled={
                  isProcessing ||
                  (!voiceFile && !voiceStoragePath) ||
                  (!useTextMode && !scriptFile && !scriptStoragePath) ||
                  (useTextMode && !scriptText.trim())
                }
                onClick={handleCloneAndGenerate}
              >
                {isProcessing ? (
                  <>
                    <span style={{ animation: `${spin} 1s linear infinite` }}>⚙️</span> Processing...
                  </>
                ) : (
                  "Clone & Generate"
                )}
              </Button>
              <Button secondary disabled={isProcessing} onClick={resetAll}>
                Reset All
              </Button>
            </div>
          </SectionCard>

          {refinedAudioPublicUrl && (
            <SectionCard>
              <SectionTitle>Generated Audio</SectionTitle>
              <StyledAudio controls src={refinedAudioPublicUrl}>
                Your browser does not support audio playback.
              </StyledAudio>
              <div style={{ display: "flex", flexWrap: "wrap", gap: "1rem" }}>
                <PlayButton onClick={playRefinedAudio}>Play</PlayButton>
                <DownloadButton onClick={downloadRefinedAudio}>Download</DownloadButton>
              </div>
            </SectionCard>
          )}
        </div>

        <div style={{ flex: 1, display: "flex", flexDirection: "column", gap: "2rem" }}>
          {similarityData && (
            <SectionCard>
              <SectionTitle>Similarity Analysis</SectionTitle>
              {[
                { label: "Overall Similarity", value: similarityData.overallSimilarity },
                { label: "Pitch Accuracy", value: similarityData.pitchSimilarity },
                { label: "Tone Match", value: similarityData.toneSimilarity },
                { label: "Speed Match", value: similarityData.speedSimilarity },
                { label: "Clarity Score", value: similarityData.clarityScore },
              ].map(({ label, value }) => (
                <div key={label} style={{ marginBottom: "1rem" }}>
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      marginBottom: "0.3rem",
                    }}
                  >
                    <span>{label}</span>
                    <span
                      style={{
                        fontWeight: 700,
                        color: value >= 0.9 ? successColor : value >= 0.7 ? warningColor : errorColor,
                      }}
                    >
                      {(value * 100).toFixed(1)}%
                    </span>
                  </div>
                  <ProgressBar>
                    <ProgressFill
                      value={value}
                      color={value >= 0.9 ? "bg-success" : value >= 0.7 ? "bg-warning" : "bg-danger"}
                    />
                  </ProgressBar>
                </div>
              ))}
              <div style={{ textAlign: "center", marginTop: "1rem" }}>
                <Badge score={similarityData.overallSimilarity}>
                  {similarityData.overallSimilarity >= 0.9
                    ? "Excellent Match!"
                    : similarityData.overallSimilarity >= 0.7
                    ? "Good Match"
                    : "Needs Improvement"}
                </Badge>
              </div>
            </SectionCard>
          )}

          <SectionCard>
            <SectionTitle>Process Log</SectionTitle>
            <LogContainer>
              {logs.length === 0 ? (
                <EmptyLog>Ready to process...</EmptyLog>
              ) : (
                logs.map((log, idx) => (
                  <LogMessage key={idx} type={log.type}>
                    {log.message}
                  </LogMessage>
                ))
              )}
            </LogContainer>
          </SectionCard>
        </div>
      </StudioCard>
    </MainContainer>
  );
}