// // import React, { useState, useRef, useEffect } from "react";
// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
// import styled, { keyframes } from 'styled-components';
// import mic from "../pages/mic.png";
// import { createClient } from "@supabase/supabase-js";
// import backgroundSpotlight from "./spotlightsblack1.jpg";

// // Supabase client initialization (API keys are needed even without auth)
// // const supabase = createClient(
// //   process.env.REACT_APP_SUPABASE_URL,
// //   process.env.REACT_APP_SUPABASE_ANON_KEY
// // );

// // Keyframes for professional loader animation
// const rotate = keyframes`
//   from {
//     transform: rotate(0deg);
//   }
//   to {
//     transform: rotate(360deg);
//   }
// `;

// const pulse = keyframes`
//   0% {
//     transform: scale(1);
//     opacity: 0.8;
//   }
 
//   50% {
//     transform: scale(1.05);
//     opacity: 1;
//   }
//   100% {
//     transform: scale(1);
//     opacity: 0.8;
//   }
// `;

// // Styled Components
// const MainWrapper = styled.div`
//   background-image: url(${backgroundSpotlight});
//   background-position: center;
//   background-repeat: no-repeat;
//   background-size: cover;
//   min-height: 100vh;
//   position: relative;
//   font-family: 'Poppins', sans-serif;
//   color: #E0E0E0;
//   margin-top:-3.9rem;

//   &:after {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(0, 0, 0, 0.7);
//     z-index: 1;
//   }
// `;

// const SectionContainer = styled.section`
//   position: relative;
//   z-index: 2;
//   min-height: 100vh;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   padding: 2rem 1rem;
// `;

// const ContentCard = styled.div`
//   width: 100%;
//   max-width: 900px;
//   background: rgba(255, 255, 255, 0.05);
//   border-radius: 20px;
//   backdrop-filter: blur(15px);
//   -webkit-backdrop-filter: blur(15px);
//   border: 1px solid rgba(255, 255, 255, 0.1);
//   box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
//   padding: 2.5rem;
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
//   animation: ${pulse} 2s infinite ease-in-out;
// `;

// const Title = styled.h2`
//   font-size: 2.5rem;
//   font-weight: 600;
//   text-align: center;
//   color: #fff;
//   margin-bottom: 0.5rem;
//   letter-spacing: 1px;
// `;

// const Subtitle = styled.p`
//   font-size: 1rem;
//   text-align: center;
//   color: #B0B0B0;
//   margin-bottom: 2rem;
// `;

// const UploadArea = styled.div`
//   border: 2px dashed ${props => props.$dragOver ? '#00A8FF' : 'rgba(255, 255, 255, 0.3)'};
//   background-color: ${props => props.$dragOver ? 'rgba(0, 168, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
//   border-radius: 12px;
//   padding: 4rem 2rem;
//   text-align: center;
//   cursor: pointer;
//   transition: all 0.3s ease-in-out;

//   &:hover {
//     border-color: #00A8FF;
//     background-color: rgba(0, 168, 255, 0.08);
//   }
// `;

// const UploadIcon = styled(FaCloudUploadAlt)`
//   font-size: 5rem;
//   color: #00A8FF;
//   margin-bottom: 1rem;
// `;

// const UploadText = styled.h4`
//   font-size: 1.5rem;
//   font-weight: 500;
//   color: #fff;
// `;

// const UploadSubtext = styled.p`
//   font-size: 0.9rem;
//   color: #999;
//   margin-top: 0.5rem;
// `;

// const StyledButton = styled.button`
//   background-color: #00A8FF;
//   color: #fff;
//   border: none;
//   padding: 0.75rem 2rem;
//   font-size: 1rem;
//   font-weight: 500;
//   border-radius: 8px;
//   cursor: pointer;
//   transition: all 0.3s ease;
//   box-shadow: 0 4px 15px rgba(0, 168, 255, 0.2);

//   &:hover {
//     background-color: #0087CC;
//     transform: translateY(-2px);
//     box-shadow: 0 6px 20px rgba(0, 168, 255, 0.3);
//   }

//   &:disabled {
//     background-color: #555;
//     cursor: not-allowed;
//     box-shadow: none;
//     transform: none;
//   }
// `;

// const ToggleButton = styled(StyledButton)`
//   background: rgba(255, 255, 255, 0.1);
//   border: 1px solid rgba(255, 255, 255, 0.2);
//   color: #fff;
//   font-weight: 400;
//   margin-top: 1rem;
//   &:hover {
//     background: rgba(255, 255, 255, 0.2);
//     transform: none;
//     box-shadow: none;
//   }
// `;

// const TextArea = styled.textarea`
//   width: 100%;
//   padding: 1rem;
//   border-radius: 8px;
//   background: rgba(255, 255, 255, 0.05);
//   border: 1px solid rgba(255, 255, 255, 0.2);
//   color: #fff;
//   font-size: 1rem;
//   resize: vertical;
//   min-height: 150px;
//   transition: border-color 0.3s ease;

//   &:focus {
//     outline: none;
//     border-color: #00A8FF;
//   }

//   &::placeholder {
//     color: #999;
//   }
// `;

// const ResultsCard = styled.div`
//   background: rgba(255, 255, 255, 0.05);
//   border-radius: 12px;
//   border: 1px solid rgba(255, 255, 255, 0.1);
//   padding: 1.5rem;
//   display: flex;
//   flex-direction: column;
//   gap: 1.5rem;
// `;

// const ResultSection = styled.div`
//   padding-bottom: 1rem;
//   border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
//   &:last-child {
//     border-bottom: none;
//   }
// `;

// const ResultTitle = styled.h6`
//   font-size: 1.1rem;
//   color: #fff;
//   margin-bottom: 0.5rem;
//   font-weight: 500;
// `;

// const ResultText = styled.p`
//   font-size: 0.95rem;
//   color: #B0B0B0;
//   line-height: 1.6;
//   white-space: pre-wrap;
//   margin-bottom: 0;
// `;

// const LoadingContainer = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   min-height: 100vh;
//   text-align: center;
// `;

// const Spinner = styled(FaSpinner)`
//   font-size: 3rem;
//   color: #00A8FF;
//   animation: ${rotate} 1.5s linear infinite;
//   margin-bottom: 1.5rem;
// `;

// const LoadingText = styled.h5`
//   font-size: 1.5rem;
//   font-weight: 500;
//   color: #fff;
//   margin-bottom: 1rem;
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
// `;

// const ProgressBar = styled.div`
//   width: 80%;
//   max-width: 400px;
//   height: 8px;
//   background: rgba(255, 255, 255, 0.1);
//   border-radius: 4px;
//   overflow: hidden;
//   margin-top: 1rem;
// `;

// const Progress = styled.div`
//   height: 100%;
//   width: 75%; /* Simulating progress */
//   background: linear-gradient(90deg, #00A8FF, #00CFFF);
//   border-radius: 4px;
//   animation: pulse 1.5s infinite ease-in-out;
// `;

// export default function Upload() {
//   const [file, setFile] = useState(null);
//   const [filename, setFilename] = useState("");
//   const [publicUrl, setPublicUrl] = useState("");
//   const [responses, setResponses] = useState([]);
//   const [elevenLabsTranscript, setElevenLabsTranscript] = useState("");
//   const [deepgramTranscript, setDeepgramTranscript] = useState("");
//   const [llmAnalysisResult, setLlmAnalysisResult] = useState("");
//   const [loading, setLoading] = useState(false);
//   const [dragOver, setDragOver] = useState(false);
//   const [showTextArea, setShowTextArea] = useState(false);
//   const fileInputRef = useRef(null);

//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
//   console.log("Backend URL from environment:", BACKEND_URL); 
//   // Generate unique user ID with sessionStorage persistence
//   const [userId] = useState(() => {
//     let existingId = null;
    
//     try {
//       if (typeof Storage !== "undefined" && window.sessionStorage) {
//         existingId = sessionStorage.getItem('uniqueUserId');
        
//         if (existingId && (!existingId.startsWith('user_') || existingId.length < 20)) {
//           console.warn('Invalid stored user ID format, generating new one');
//           existingId = null;
//         }
//       }
//     } catch (error) {
//       console.warn('SessionStorage not available or error accessing it:', error.message);
//       existingId = null;
//     }
    
//     if (existingId) {
//       console.log('Using existing user ID:', existingId);
//       return existingId;
//     }
    
//     const timestamp = Date.now();
//     const randomPart = Math.random().toString(36).substring(2, 11);
//     const newId = `user_${timestamp}_${randomPart}`;
    
//     try {
//       if (typeof Storage !== "undefined" && window.sessionStorage) {
//         sessionStorage.setItem('uniqueUserId', newId);
//         console.log('Stored new user ID in sessionStorage:', newId);
//       } else {
//         console.warn('SessionStorage not available - user ID will be session-only');
//       }
//     } catch (error) {
//       console.warn('Could not store user ID in sessionStorage:', error.message);
//     }
    
//     console.log('Generated new user ID:', newId);
//     return newId;
//   });

//   const [manualTranscript, setManualTranscript] = useState("");

//   useEffect(() => {
//     console.log("Current User ID:", userId);
//   }, [userId]);

//   useEffect(() => {
//     if (file) {
//       handleUpload({ preventDefault: () => {} });
//     }
//   }, [file, handleUpload]);

//   const handleFileSelect = (selectedFile) => {
//     const maxSize = 500 * 1024 * 1024;
//     const allowedTypes = [
//       "video/mp4",
//       "video/quicktime",
//       "video/x-msvideo",
//       "audio/mpeg",
//       "audio/wav",
//     ];

//     if (selectedFile.size > maxSize) {
//       toast.error("File Too Large: Please select a file smaller than 500MB.");
//       return;
//     }

//     if (!allowedTypes.includes(selectedFile.type)) {
//       toast.error(
//         "Invalid File Type: Please select a video (.mp4, .mov, .avi) or audio (.mp3, .wav) file."
//       );
//       return;
//     }

//     setFile(selectedFile);
//   };

//   const handleDrop = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     if (droppedFiles.length > 0) {
//       handleFileSelect(droppedFiles[0]);
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     setDragOver(true);
//   };

//   const handleDragLeave = (e) => {
//     e.preventDefault();
//     setDragOver(false);
//   };

//   const handleFileInputChange = (e) => {
//     const selectedFiles = e.target.files;
//     if (selectedFiles && selectedFiles.length > 0) {
//       handleFileSelect(selectedFiles[0]);
//     }
//   };

//   const handleUpload = async (e) => {
//     e.preventDefault();

//     if (!file) {
//       toast.error("❗ Please select a video or audio file!");
//       return;
//     }

//     setLoading(true);
//     setResponses([]);
//     setElevenLabsTranscript("");
//     setDeepgramTranscript("");
//     setLlmAnalysisResult("");
//     setPublicUrl("");

//     try {
//       toast.info("⬆️ Uploading file to Supabase...");
      
//       const formData = new FormData();
//       formData.append("myvideo", file);
//       formData.append("user_id", userId);

//       const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
//         method: "POST",
//         body: formData,
//       });

//       if (!uploadRes.ok) {
//         let errorText = "Unknown error";
//         try {
//           const errorJson = await uploadRes.json();
//           errorText = errorJson.error || JSON.stringify(errorJson);
//         } catch {
//           errorText = await uploadRes.text();
//         }
//         throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
//       }

//       const uploadData = await uploadRes.json();
//       const uploadedFilename = uploadData.videoName;
//       const uploadPublicUrl = uploadData.publicUrl;

//       if (!uploadedFilename) {
//         throw new Error("No filename received from server");
//       }

//       setFilename(uploadedFilename);
//       setPublicUrl(uploadPublicUrl);
//       toast.success("✅ File uploaded to Supabase and metadata saved successfully!");

//       // Frame Extraction
//       toast.info("🖼️ Extracting frames (if video)...");
//       const extractForm = new FormData();
//       extractForm.append("videoName", uploadedFilename);
//       const extractRes = await fetch(`${BACKEND_URL}/api/extractFrames`, {
//         method: "POST",
//         body: extractForm,
//       });
//       if (!extractRes.ok) {
//         toast.warn("🖼️ Frame extraction skipped or failed (might be an audio file).");
//       } else {
//         toast.success("✅ Frames extracted (if video)!");
//       }

//       // Frame Analysis
//       toast.info("🤖 Analyzing frames with Gemini (if video)...");
//       const analyzeRes = await fetch(`${BACKEND_URL}/api/analyzeAllFrames`);
//       if (!analyzeRes.ok) {
//         toast.warn("🤖 Frame analysis skipped or failed (might be an audio file).");
//       } else {
//         const analyzeData = await analyzeRes.json();
//         const frames = Array.isArray(analyzeData) ? analyzeData : analyzeData.responses || [];
//         setResponses(frames.map((item) => `${item.file}: ${item.description}`));
//         toast.success("✅ Frame analysis complete (if video)!");
//       }

//       // ElevenLabs Transcription
//       toast.info("🗣️ Transcribing with ElevenLabs...");
//       const elevenForm = new FormData();
//       elevenForm.append("videoName", uploadedFilename);
//       const elevenRes = await fetch(`${BACKEND_URL}/api/transcribeWithElevenLabs`, {  
//         method: "POST",
//         body: elevenForm,
//       });
//       if (!elevenRes.ok) {
//         throw new Error(`ElevenLabs transcription failed: ${await elevenRes.text()}`);
//       }
//       const elevenData = await elevenRes.json();
//       setElevenLabsTranscript(elevenData.transcript || "No transcript from ElevenLabs");
//       toast.success("✅ ElevenLabs transcription done!");

//       // Deepgram Transcription
//       toast.info("🧠 Transcribing with Deepgram...");
//       const deepgramForm = new FormData();
//       deepgramForm.append("videoName", uploadedFilename);
//       const deepgramRes = await fetch(`${BACKEND_URL}/api/transcribeWithDeepgram`, { 
//         method: "POST",
//         body: deepgramForm,
//       });
//       if (!deepgramRes.ok) {
//         throw new Error(`Deepgram transcription failed: ${await deepgramRes.text()}`);
//       }
//       const deepgramData = await deepgramRes.json();
//       const deepgramTranscript = deepgramData.transcript || "No transcript from Deepgram";
//       setDeepgramTranscript(deepgramTranscript);
//       toast.success("✅ Deepgram transcription done!");

//       // LLM Analysis
//       if (deepgramTranscript && deepgramTranscript !== "No transcript from Deepgram") {
//         toast.info("✨ Analyzing speech with Gemini...");
//         try {
//           const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {  
//             method: "POST",
//             headers: { "Content-Type": "application/json" },
//             body: JSON.stringify({ transcript: deepgramTranscript, videoName: uploadedFilename }),
//           });
//           if (!analysisRes.ok) {
//             let errorMessage = analysisRes.statusText;
//             try {
//               const errorData = await analysisRes.json();
//               errorMessage = errorData.error || errorMessage;
//             } catch (parseError) {}
//             throw new Error(`Gemini speech analysis failed: ${errorMessage}`);
//           }
//           const analysisData = await analysisRes.json();
//           setLlmAnalysisResult(analysisData.analysis);
//           toast.success("✅ Speech analysis by Gemini complete!");
//         } catch (analysisErr) {
//           toast.error("❌ Speech analysis failed. Check console for details.");
//         }
//       } else {
//         toast.info("ℹ️ No Deepgram transcript found for speech analysis.");
//       }

//     } catch (err) {
//       toast.error(`❌ Operation failed: ${err.message || "An unknown error occurred."}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleManualTextAnalysis = async () => {
//     if (!manualTranscript.trim()) {
//       toast.error("Please enter some text to analyze.");
//       return;
//     }

//     setLoading(true);
//     setLlmAnalysisResult("");

//     try {
//       toast.info("✨ Analyzing text with Gemini...");
//       const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {  
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ transcript: manualTranscript }),
//       });

//       if (!analysisRes.ok) {
//         let errorMessage = analysisRes.statusText;
//         try {
//           const errorData = await analysisRes.json();
//           errorMessage = errorData.error || errorMessage;
//         } catch (parseError) {}
//         throw new Error(`Gemini text analysis failed: ${errorMessage}`);
//       }

//       const analysisData = await analysisRes.json();
//       setLlmAnalysisResult(analysisData.analysis);
//       toast.success("✅ Text analysis by Gemini complete!");
//     } catch (error) {
//       toast.error(`❌ Text analysis failed: ${error.message || "An unknown error occurred."}`);
//     } finally {
//       setLoading(false);
//     }
//   };

//   if (loading) {
//     return (
//       <MainWrapper>
//         <LoadingContainer>
//           <Spinner />
//           <LoadingText>
//             <img src={mic} alt="Mic" style={{ width: "40px", height: "40px" }} />
//             Processing your presentation...
//           </LoadingText>
//           <p className="text-gray-400 mb-4 text-center">
//             Analyzing your video/audio, transcribing, and generating insights...
//           </p>
//           <ProgressBar>
//             <Progress />
//           </ProgressBar>
//         </LoadingContainer>
//       </MainWrapper>
//     );
//   }

//   return (
//     <MainWrapper>
//       <SectionContainer>
//         <ContentCard>
//           <Title>Upload Your Presentation</Title>
//           <Subtitle>
//             Instantly get detailed feedback on your speaking and visuals.
//           </Subtitle>
          
//           {/* File Upload Area */}
//           <UploadArea
//             $dragOver={dragOver}
//             onClick={() => fileInputRef.current?.click()}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <UploadIcon />
//             <UploadText>Drag & Drop Your File Here</UploadText>
//             <UploadSubtext>Supported formats: .mp4, .mov, .avi, .mp3, .wav</UploadSubtext>
//             <UploadSubtext>Maximum file size: 500MB</UploadSubtext>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".mp4,.mov,.avi,.mp3,.wav"
//               style={{ display: 'none' }}
//               onChange={handleFileInputChange}
//             />
//           </UploadArea>
          
//           {/* Text Analysis Toggle */}
//           <div className="flex justify-center mt-4">
//             <ToggleButton
//               onClick={() => setShowTextArea(!showTextArea)}
//             >
//               Or, paste your transcript for text-only analysis
//             </ToggleButton>
//           </div>
          
//           {/* Text Area Section */}
//           {showTextArea && (
//             <div className="mt-4">
//               <TextArea
//                 placeholder="Paste your transcript or text here for analysis..."
//                 value={manualTranscript}
//                 onChange={(e) => setManualTranscript(e.target.value)}
//               />
//               <div className="text-right mt-3">
//                 <StyledButton
//                   onClick={handleManualTextAnalysis}
//                   disabled={loading || !manualTranscript.trim()}
//                 >
//                   Analyze Text
//                 </StyledButton>
//               </div>
//             </div>
//           )}
          
//           {/* Results Display Section */}
//           {(responses.length > 0 || elevenLabsTranscript || deepgramTranscript || llmAnalysisResult) && (
//             <ResultsCard>
//               <h5 className="text-white text-xl font-semibold mb-3">Analysis Results</h5>
              
//               {publicUrl && (
//                 <ResultSection>
//                   <ResultTitle>File URL:</ResultTitle>
//                   <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
//                     {filename}
//                   </a>
//                 </ResultSection>
//               )}
              
//               {responses.length > 0 && (
//                 <ResultSection>
//                   <ResultTitle>Visual Analysis:</ResultTitle>
//                   {responses.map((response, index) => (
//                     <ResultText key={index}>{response}</ResultText>
//                   ))}
//                 </ResultSection>
//               )}
              
//               {elevenLabsTranscript && (
//                 <ResultSection>
//                   <ResultTitle>ElevenLabs Transcript:</ResultTitle>
//                   <ResultText>{elevenLabsTranscript}</ResultText>
//                 </ResultSection>
//               )}
              
//               {deepgramTranscript && (
//                 <ResultSection>
//                   <ResultTitle>Deepgram Transcript:</ResultTitle>
//                   <ResultText>{deepgramTranscript}</ResultText>
//                 </ResultSection>
//               )}
              
//               {llmAnalysisResult && (
//                 <ResultSection>
//                   <ResultTitle>AI Analysis:</ResultTitle>
//                   <ResultText>{llmAnalysisResult}</ResultText>
//                 </ResultSection>
//               )}
//             </ResultsCard>
//           )}
//         </ContentCard>
//       </SectionContainer>
//       <ToastContainer position="top-right" autoClose={5000} />
//     </MainWrapper>
//   );
// }


import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCloudUploadAlt, FaSpinner } from "react-icons/fa";
import styled, { keyframes } from 'styled-components';
import mic from "../pages/mic.png";
import backgroundSpotlight from "./spotlightsblack1.jpg";

// Keyframes for professional loader animation
const rotate = keyframes`
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
`;

const pulse = keyframes`
  0% {
    transform: scale(1);
    opacity: 0.8;
  }
 
  50% {
    transform: scale(1.05);
    opacity: 1;
  }
  100% {
    transform: scale(1);
    opacity: 0.8;
  }
`;

// Styled Components
const MainWrapper = styled.div`
  background-image: url(${backgroundSpotlight});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
  position: relative;
  font-family: 'Poppins', sans-serif;
  color: #E0E0E0;
  margin-top:-3.9rem;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1;
  }
`;

const SectionContainer = styled.section`
  position: relative;
  z-index: 2;
  min-height: 100vh;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 2rem 1rem;
`;

const ContentCard = styled.div`
  width: 100%;
  max-width: 900px;
  background: rgba(255, 255, 255, 0.05);
  border-radius: 20px;
  backdrop-filter: blur(15px);
  -webkit-backdrop-filter: blur(15px);
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 32px 0 rgba(0, 0, 0, 0.37);
  padding: 2.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
  animation: ${pulse} 2s infinite ease-in-out;
`;

const Title = styled.h2`
  font-size: 2.5rem;
  font-weight: 600;
  text-align: center;
  color: #fff;
  margin-bottom: 0.5rem;
  letter-spacing: 1px;
`;

const Subtitle = styled.p`
  font-size: 1rem;
  text-align: center;
  color: #B0B0B0;
  margin-bottom: 2rem;
`;

const UploadArea = styled.div`
  border: 2px dashed ${props => props.$dragOver ? '#00A8FF' : 'rgba(255, 255, 255, 0.3)'};
  background-color: ${props => props.$dragOver ? 'rgba(0, 168, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
  border-radius: 12px;
  padding: 4rem 2rem;
  text-align: center;
  cursor: pointer;
  transition: all 0.3s ease-in-out;

  &:hover {
    border-color: #00A8FF;
    background-color: rgba(0, 168, 255, 0.08);
  }
`;

const UploadIcon = styled(FaCloudUploadAlt)`
  font-size: 5rem;
  color: #00A8FF;
  margin-bottom: 1rem;
`;

const UploadText = styled.h4`
  font-size: 1.5rem;
  font-weight: 500;
  color: #fff;
`;

const UploadSubtext = styled.p`
  font-size: 0.9rem;
  color: #999;
  margin-top: 0.5rem;
`;

const StyledButton = styled.button`
  background-color: #00A8FF;
  color: #fff;
  border: none;
  padding: 0.75rem 2rem;
  font-size: 1rem;
  font-weight: 500;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.3s ease;
  box-shadow: 0 4px 15px rgba(0, 168, 255, 0.2);

  &:hover {
    background-color: #0087CC;
    transform: translateY(-2px);
    box-shadow: 0 6px 20px rgba(0, 168, 255, 0.3);
  }

  &:disabled {
    background-color: #555;
    cursor: not-allowed;
    box-shadow: none;
    transform: none;
  }
`;

const ToggleButton = styled(StyledButton)`
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-weight: 400;
  margin-top: 1rem;
  &:hover {
    background: rgba(255, 255, 255, 0.2);
    transform: none;
    box-shadow: none;
  }
`;

const TextArea = styled.textarea`
  width: 100%;
  padding: 1rem;
  border-radius: 8px;
  background: rgba(255, 255, 255, 0.05);
  border: 1px solid rgba(255, 255, 255, 0.2);
  color: #fff;
  font-size: 1rem;
  resize: vertical;
  min-height: 150px;
  transition: border-color 0.3s ease;

  &:focus {
    outline: none;
    border-color: #00A8FF;
  }

  &::placeholder {
    color: #999;
  }
`;

const ResultsCard = styled.div`
  background: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  padding: 1.5rem;
  display: flex;
  flex-direction: column;
  gap: 1.5rem;
`;

const ResultSection = styled.div`
  padding-bottom: 1rem;
  border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  
  &:last-child {
    border-bottom: none;
  }
`;

const ResultTitle = styled.h6`
  font-size: 1.1rem;
  color: #fff;
  margin-bottom: 0.5rem;
  font-weight: 500;
`;

const ResultText = styled.p`
  font-size: 0.95rem;
  color: #B0B0B0;
  line-height: 1.6;
  white-space: pre-wrap;
  margin-bottom: 0;
`;

const LoadingContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: 100vh;
  text-align: center;
`;

const Spinner = styled(FaSpinner)`
  font-size: 3rem;
  color: #00A8FF;
  animation: ${rotate} 1.5s linear infinite;
  margin-bottom: 1.5rem;
`;

const LoadingText = styled.h5`
  font-size: 1.5rem;
  font-weight: 500;
  color: #fff;
  margin-bottom: 1rem;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const ProgressBar = styled.div`
  width: 80%;
  max-width: 400px;
  height: 8px;
  background: rgba(255, 255, 255, 0.1);
  border-radius: 4px;
  overflow: hidden;
  margin-top: 1rem;
`;

const Progress = styled.div`
  height: 100%;
  width: 75%; /* Simulating progress */
  background: linear-gradient(90deg, #00A8FF, #00CFFF);
  border-radius: 4px;
  animation: pulse 1.5s infinite ease-in-out;
`;

export default function Upload() {
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
  const fileInputRef = useRef(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL;
  console.log("Backend URL from environment:", BACKEND_URL); 
  // Generate unique user ID with sessionStorage persistence
  const [userId] = useState(() => {
    let existingId = null;
    
    try {
      if (typeof Storage !== "undefined" && window.sessionStorage) {
        existingId = sessionStorage.getItem('uniqueUserId');
        
        if (existingId && (!existingId.startsWith('user_') || existingId.length < 20)) {
          console.warn('Invalid stored user ID format, generating new one');
          existingId = null;
        }
      }
    } catch (error) {
      console.warn('SessionStorage not available or error accessing it:', error.message);
      existingId = null;
    }
    
    if (existingId) {
      console.log('Using existing user ID:', existingId);
      return existingId;
    }
    
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 11);
    const newId = `user_${timestamp}_${randomPart}`;
    
    try {
      if (typeof Storage !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem('uniqueUserId', newId);
        console.log('Stored new user ID in sessionStorage:', newId);
      } else {
        console.warn('SessionStorage not available - user ID will be session-only');
      }
    } catch (error) {
      console.warn('Could not store user ID in sessionStorage:', error.message);
    }
    
    console.log('Generated new user ID:', newId);
    return newId;
  });

  const [manualTranscript, setManualTranscript] = useState("");

  useEffect(() => {
    console.log("Current User ID:", userId);
  }, [userId]);

  const handleFileSelect = (selectedFile) => {
    const maxSize = 500 * 1024 * 1024;
    const allowedTypes = [
      "video/mp4",
      "video/quicktime",
      "video/x-msvideo",
      "audio/mpeg",
      "audio/wav",
    ];

    if (selectedFile.size > maxSize) {
      toast.error("File Too Large: Please select a file smaller than 500MB.");
      return;
    }

    if (!allowedTypes.includes(selectedFile.type)) {
      toast.error(
        "Invalid File Type: Please select a video (.mp4, .mov, .avi) or audio (.mp3, .wav) file."
      );
      return;
    }

    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setDragOver(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setDragOver(false);
  };

  const handleFileInputChange = (e) => {
    const selectedFiles = e.target.files;
    if (selectedFiles && selectedFiles.length > 0) {
      handleFileSelect(selectedFiles[0]);
    }
  };

  const handleUpload = useCallback(async (e) => {
    e.preventDefault();

    if (!file) {
      toast.error("❗ Please select a video or audio file!");
      return;
    }

    setLoading(true);
    setResponses([]);
    setElevenLabsTranscript("");
    setDeepgramTranscript("");
    setLlmAnalysisResult("");
    setPublicUrl("");

    try {
      toast.info("⬆️ Uploading file to Supabase...");
      
      const formData = new FormData();
      formData.append("myvideo", file);
      formData.append("user_id", userId);

      const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
        method: "POST",
        body: formData,
      });

      if (!uploadRes.ok) {
        let errorText = "Unknown error";
        try {
          const errorJson = await uploadRes.json();
          errorText = errorJson.error || JSON.stringify(errorJson);
        } catch {
          errorText = await uploadRes.text();
        }
        throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
      }

      const uploadData = await uploadRes.json();
      const uploadedFilename = uploadData.videoName;
      const uploadPublicUrl = uploadData.publicUrl;

      if (!uploadedFilename) {
        throw new Error("No filename received from server");
      }

      setFilename(uploadedFilename);
      setPublicUrl(uploadPublicUrl);
      toast.success("✅ File uploaded to Supabase and metadata saved successfully!");

      // Frame Extraction
      toast.info("🖼️ Extracting frames (if video)...");
      const extractForm = new FormData();
      extractForm.append("videoName", uploadedFilename);
      const extractRes = await fetch(`${BACKEND_URL}/api/extractFrames`, {
        method: "POST",
        body: extractForm,
      });
      if (!extractRes.ok) {
        toast.warn("🖼️ Frame extraction skipped or failed (might be an audio file).");
      } else {
        toast.success("✅ Frames extracted (if video)!");
      }

      // Frame Analysis
      toast.info("🤖 Analyzing frames with Gemini (if video)...");
      const analyzeRes = await fetch(`${BACKEND_URL}/api/analyzeAllFrames`);
      if (!analyzeRes.ok) {
        toast.warn("🤖 Frame analysis skipped or failed (might be an audio file).");
      } else {
        const analyzeData = await analyzeRes.json();
        const frames = Array.isArray(analyzeData) ? analyzeData : analyzeData.responses || [];
        setResponses(frames.map((item) => `${item.file}: ${item.description}`));
        toast.success("✅ Frame analysis complete (if video)!");
      }

      // ElevenLabs Transcription
      toast.info("🗣️ Transcribing with ElevenLabs...");
      const elevenForm = new FormData();
      elevenForm.append("videoName", uploadedFilename);
      const elevenRes = await fetch(`${BACKEND_URL}/api/transcribeWithElevenLabs`, {  
        method: "POST",
        body: elevenForm,
      });
      if (!elevenRes.ok) {
        throw new Error(`ElevenLabs transcription failed: ${await elevenRes.text()}`);
      }
      const elevenData = await elevenRes.json();
      setElevenLabsTranscript(elevenData.transcript || "No transcript from ElevenLabs");
      toast.success("✅ ElevenLabs transcription done!");

      // Deepgram Transcription
      toast.info("🧠 Transcribing with Deepgram...");
      const deepgramForm = new FormData();
      deepgramForm.append("videoName", uploadedFilename);
      const deepgramRes = await fetch(`${BACKEND_URL}/api/transcribeWithDeepgram`, { 
        method: "POST",
        body: deepgramForm,
      });
      if (!deepgramRes.ok) {
        throw new Error(`Deepgram transcription failed: ${await deepgramRes.text()}`);
      }
      const deepgramData = await deepgramRes.json();
      const deepgramTranscript = deepgramData.transcript || "No transcript from Deepgram";
      setDeepgramTranscript(deepgramTranscript);
      toast.success("✅ Deepgram transcription done!");

      // LLM Analysis
      if (deepgramTranscript && deepgramTranscript !== "No transcript from Deepgram") {
        toast.info("✨ Analyzing speech with Gemini...");
        try {
          const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {  
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ transcript: deepgramTranscript, videoName: uploadedFilename }),
          });
          if (!analysisRes.ok) {
            let errorMessage = analysisRes.statusText;
            try {
              const errorData = await analysisRes.json();
              errorMessage = errorData.error || errorMessage;
            } catch (parseError) {}
            throw new Error(`Gemini speech analysis failed: ${errorMessage}`);
          }
          const analysisData = await analysisRes.json();
          setLlmAnalysisResult(analysisData.analysis);
          toast.success("✅ Speech analysis by Gemini complete!");
        } catch (analysisErr) {
          toast.error("❌ Speech analysis failed. Check console for details.");
        }
      } else {
        toast.info("ℹ️ No Deepgram transcript found for speech analysis.");
      }

    } catch (err) {
      toast.error(`❌ Operation failed: ${err.message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  }, [file, userId, BACKEND_URL]);

  useEffect(() => {
    if (file) {
      handleUpload({ preventDefault: () => {} });
    }
  }, [file, handleUpload]);

  const handleManualTextAnalysis = async () => {
    if (!manualTranscript.trim()) {
      toast.error("Please enter some text to analyze.");
      return;
    }

    setLoading(true);
    setLlmAnalysisResult("");

    try {
      toast.info("✨ Analyzing text with Gemini...");
      const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {  
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ transcript: manualTranscript }),
      });

      if (!analysisRes.ok) {
        let errorMessage = analysisRes.statusText;
        try {
          const errorData = await analysisRes.json();
          errorMessage = errorData.error || errorMessage;
        } catch (parseError) {}
        throw new Error(`Gemini text analysis failed: ${errorMessage}`);
      }

      const analysisData = await analysisRes.json();
      setLlmAnalysisResult(analysisData.analysis);
      toast.success("✅ Text analysis by Gemini complete!");
    } catch (error) {
      toast.error(`❌ Text analysis failed: ${error.message || "An unknown error occurred."}`);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <MainWrapper>
        <LoadingContainer>
          <Spinner />
          <LoadingText>
            <img src={mic} alt="Mic" style={{ width: "40px", height: "40px" }} />
            Processing your presentation...
          </LoadingText>
          <p className="text-gray-400 mb-4 text-center">
            Analyzing your video/audio, transcribing, and generating insights...
          </p>
          <ProgressBar>
            <Progress />
          </ProgressBar>
        </LoadingContainer>
      </MainWrapper>
    );
  }

  return (
    <MainWrapper>
      <SectionContainer>
        <ContentCard>
          <Title>Upload Your Presentation</Title>
          <Subtitle>
            Instantly get detailed feedback on your speaking and visuals.
          </Subtitle>
          
          {/* File Upload Area */}
          <UploadArea
            $dragOver={dragOver}
            onClick={() => fileInputRef.current?.click()}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
          >
            <UploadIcon />
            <UploadText>Drag & Drop Your File Here</UploadText>
            <UploadSubtext>Supported formats: .mp4, .mov, .avi, .mp3, .wav</UploadSubtext>
            <UploadSubtext>Maximum file size: 500MB</UploadSubtext>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.avi,.mp3,.wav"
              style={{ display: 'none' }}
              onChange={handleFileInputChange}
            />
          </UploadArea>
          
          {/* Text Analysis Toggle */}
          <div className="flex justify-center mt-4">
            <ToggleButton
              onClick={() => setShowTextArea(!showTextArea)}
            >
              Or, paste your transcript for text-only analysis
            </ToggleButton>
          </div>
          
          {/* Text Area Section */}
          {showTextArea && (
            <div className="mt-4">
              <TextArea
                placeholder="Paste your transcript or text here for analysis..."
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
              />
              <div className="text-right mt-3">
                <StyledButton
                  onClick={handleManualTextAnalysis}
                  disabled={loading || !manualTranscript.trim()}
                >
                  Analyze Text
                </StyledButton>
              </div>
            </div>
          )}
          
          {/* Results Display Section */}
          {(responses.length > 0 || elevenLabsTranscript || deepgramTranscript || llmAnalysisResult) && (
            <ResultsCard>
              <h5 className="text-white text-xl font-semibold mb-3">Analysis Results</h5>
              
              {publicUrl && (
                <ResultSection>
                  <ResultTitle>File URL:</ResultTitle>
                  <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:text-blue-300 transition-colors">
                    {filename}
                  </a>
                </ResultSection>
              )}
              
              {responses.length > 0 && (
                <ResultSection>
                  <ResultTitle>Visual Analysis:</ResultTitle>
                  {responses.map((response, index) => (
                    <ResultText key={index}>{response}</ResultText>
                  ))}
                </ResultSection>
              )}
              
              {elevenLabsTranscript && (
                <ResultSection>
                  <ResultTitle>ElevenLabs Transcript:</ResultTitle>
                  <ResultText>{elevenLabsTranscript}</ResultText>
                </ResultSection>
              )}
              
              {deepgramTranscript && (
                <ResultSection>
                  <ResultTitle>Deepgram Transcript:</ResultTitle>
                  <ResultText>{deepgramTranscript}</ResultText>
                </ResultSection>
              )}
              
              {llmAnalysisResult && (
                <ResultSection>
                  <ResultTitle>AI Analysis:</ResultTitle>
                  <ResultText>{llmAnalysisResult}</ResultText>
                </ResultSection>
              )}
            </ResultsCard>
          )}
        </ContentCard>
      </SectionContainer>
      <ToastContainer position="top-right" autoClose={5000} />
    </MainWrapper>
  );
}