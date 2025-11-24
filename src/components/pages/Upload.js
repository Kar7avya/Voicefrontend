
// // ============================================
// // UPLOAD.fixed.jsx - Fixed & Final
// // ============================================

// import React, { useState, useRef, useEffect, useCallback } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { useNavigate } from "react-router-dom";
// import supabase, { getCurrentUser, getAuthHeaders } from './supabaseClient';
// import styled, { keyframes } from 'styled-components';

// // --- Keyframes ---
// const rotate = keyframes`
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// `;
// const pulse = keyframes`
//   0% { transform: scale(1); opacity: 0.8; }
//   50% { transform: scale(1.05); opacity: 1; }
//  100% { transform: scale(1); opacity: 0.8; }
// `;

// // --- Colors & Constants ---
// const BACKGROUND_COLOR = '#111827';
// const PRIMARY_COLOR = '#00A8FF';

// // --- Styled Components (same as before, minor cleanup) ---
// const MainWrapper = styled.div`
//   background-color: ${BACKGROUND_COLOR};
//   min-height: 100vh;
//   position: relative;
//   font-family: 'Inter', sans-serif;
//   color: #E0E0E0;
//   padding-top: 3.9rem;
// `;
// const SectionContainer = styled.section`
//   position: relative;
//   z-index: 2;
//   min-height: calc(100vh - 3.9rem);
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
//   border: 2px dashed ${props => props.$dragOver ? PRIMARY_COLOR : 'rgba(255, 255, 255, 0.3)'};
//   background-color: ${props => props.$dragOver ? 'rgba(0, 168, 255, 0.05)' : 'rgba(255, 255, 255, 0.02)'};
//   border-radius: 12px;
//   padding: 4rem 2rem;
//   text-align: center;
//   cursor: pointer;
//   transition: all 0.3s ease-in-out;
//   opacity: ${props => props.$disabled ? 0.5 : 1};
//   pointer-events: ${props => props.$disabled ? 'none' : 'auto'};

//   &:hover {
//     border-color: ${PRIMARY_COLOR};
//     background-color: rgba(0, 168, 255, 0.08);
//   }
// `;
// // Replacement for FaCloudUploadAlt
// const UploadIcon = ({ size = '5rem', color = PRIMARY_COLOR }) => (
//     <svg xmlns="http://www.w3.org/2000/svg" width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" style={{ display: 'block', margin: '0 auto 1rem' }}>
//         <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
//         <polyline points="17 8 12 3 7 8"/>
//         <line x1="12" y1="3" x2="12" y2="15"/>
//     </svg>
// );

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
//   background-color: ${PRIMARY_COLOR};
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
//     border-color: ${PRIMARY_COLOR};
//   }

//   &::placeholder {
//     color: #999;
//   }

//   &:disabled {
//     opacity: 0.5;
//     cursor: not-allowed;
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

// // --- Proper animated spinner using styled-components ---
// const Spinner = styled.svg`
//   width: 3rem;
//   height: 3rem;
//   animation: ${rotate} 1.5s linear infinite;
//   margin: 0 auto 1.5rem;
//   fill: ${PRIMARY_COLOR};
// `;

// const LoadingText = styled.h5`
//   font-size: 1.5rem;
//   font-weight: 500;
//   color: #fff;
//   margin-bottom: 1rem;
//   display: flex;
//   align-items: center;
//   justify-content: center;
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
//   width: 75%;
//   background: linear-gradient(90deg, ${PRIMARY_COLOR}, #00CFFF);
//   border-radius: 4px;
//   animation: ${pulse} 1.5s infinite ease-in-out;
// `;
// const AuthWarning = styled.div`
//   background: rgba(255, 193, 7, 0.1);
//   border: 1px solid rgba(255, 193, 7, 0.3);
//   border-radius: 8px;
//   padding: 1rem;
//   margin-bottom: 1rem;
//   text-align: center;
//   color: #ffc107;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 0.5rem;
// `;
// const UserInfo = styled.div`
//   text-align: center;
//   padding: 0.75rem;
//   background: rgba(74, 222, 128, 0.1);
//   border: 1px solid rgba(74, 222, 128, 0.3);
//   border-radius: 8px;
//   color: #4ade80;
//   margin-bottom: 1rem;
//   display: flex;
//   align-items: center;
//   justify-content: center;
//   gap: 0.5rem;
// `;
// const LoginButton = styled.button`
//   background: none;
//   border: none;
//   color: #ffc107;
//   text-decoration: underline;
//   cursor: pointer;
//   font-size: inherit;
//   font-weight: bold;
//   padding: 0;
//   margin: 0 0.25rem;

//   &:hover {
//     color: #ffb300;
//   }
// `;

// // --- END Styled Components ---

// export default function Upload() {
//   const navigate = useNavigate();
  
//   // File and results state
//   const [file, setFile] = useState(null);
//   const [filename, setFilename] = useState("");
//   const [publicUrl, setPublicUrl] = useState("");
//   const [responses, setResponses] = useState([]);
//   const [elevenLabsTranscript, setElevenLabsTranscript] = useState("");
//   const [deepgramTranscript, setDeepgramTranscript] = useState("");
//   const [llmAnalysisResult, setLlmAnalysisResult] = useState("");
  
//   // UI state
//   const [loading, setLoading] = useState(false);
//   const [dragOver, setDragOver] = useState(false);
//   const [showTextArea, setShowTextArea] = useState(false);
//   const [manualTranscript, setManualTranscript] = useState("");
  
//   // Auth state
//   const [user, setUser] = useState(null);
//   const [authChecked, setAuthChecked] = useState(false);
  
//   const fileInputRef = useRef(null);
//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-development.onrender.com';

//   // Check Authentication on Mount
//   useEffect(() => {
//     checkAuth();
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, []);

//   const checkAuth = async () => {
//     try {
//       if (!supabase || !getCurrentUser) {
//         console.error('CRITICAL: Supabase client or utility functions are unavailable.');
//         toast.error('Authentication module failed to load. Check console.');
//         setAuthChecked(true);
//         return;
//       }

//       const currentUser = await getCurrentUser();
//       if (currentUser && typeof currentUser.id === 'string' && currentUser.id.includes('-')) {
//         setUser(currentUser);
//         console.log('✅ User authenticated:', currentUser.email);
//       } else {
//         setUser(null);
//         console.warn('⚠️ User not authenticated or user ID is invalid');
//       }
//     } catch (error) {
//       console.error('❌ Auth check error:', error);
//       toast.error("Failed to verify authentication. Please refresh the page.");
//     } finally {
//       setAuthChecked(true);
//     }
//   };

//   const handleFileSelect = (selectedFile) => {
//     if (!user) {
//       toast.error("Please log in to upload files!");
//       navigate("/login");
//       return;
//     }

//     const maxSize = 500 * 1024 * 1024; // 500MB
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
    
//     if (!user) {
//       toast.error("Please log in to upload files!");
//       navigate("/login");
//       return;
//     }
    
//     const droppedFiles = Array.from(e.dataTransfer.files);
//     if (droppedFiles.length > 0) {
//       handleFileSelect(droppedFiles[0]);
//     }
//   };

//   const handleDragOver = (e) => {
//     e.preventDefault();
//     if (user) {
//       setDragOver(true);
//     }
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

//   // handleUpload accepts optional event
//   const handleUpload = useCallback(async (e) => {
//     if (e && typeof e.preventDefault === 'function') e.preventDefault();

//     if (!user || !user.id || !user.id.includes('-')) {
//       toast.error("❗ Authentication error: Invalid user ID. Please log in again.");
//       navigate("/login");
//       return;
//     }

//     if (!file) {
//       toast.error("❗ Please select a video or audio file!");
//       return;
//     }

//     if (!BACKEND_URL) {
//       toast.error("❌ Backend URL not configured. Set REACT_APP_BACKEND_URL.");
//       console.error('Missing BACKEND_URL');
//       return;
//     }

//     setLoading(true);
//     setResponses([]);
//     setElevenLabsTranscript("");
//     setDeepgramTranscript("");
//     setLlmAnalysisResult("");
//     setPublicUrl("");

//     try {
//       const authHeaders = await getAuthHeaders();
//       if (!authHeaders) throw new Error('No authentication headers');

//       // Upload to backend
//       toast.info("⬆️ Uploading file to Supabase...");
//       const formData = new FormData();
//       formData.append("myvideo", file);
//       formData.append("user_id", user.id);

//       const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
//         method: "POST",
//         headers: authHeaders,
//         body: formData,
//       });

//       if (!uploadRes.ok) {
//         let errorText = 'Unknown error';
//         try {
//           const errorJson = await uploadRes.json();
//           errorText = errorJson.error || errorJson.details || JSON.stringify(errorJson);
//         } catch {
//           errorText = await uploadRes.text();
//         }
//         throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
//       }

//       const uploadData = await uploadRes.json();
//       const uploadedFilename = uploadData.videoName;
//       const uploadPublicUrl = uploadData.publicUrl;

//       if (!uploadedFilename) throw new Error('No filename received from server');

//       setFilename(uploadedFilename);
//       setPublicUrl(uploadPublicUrl);
//       toast.success("✅ File uploaded to Supabase and metadata saved successfully!");

//       // Frame extraction for video
//       if (file.type.startsWith('video/')) {
//         try {
//           const extractForm = new FormData();
//           extractForm.append('videoName', uploadedFilename);
//           const extractRes = await fetch(`${BACKEND_URL}/api/extractFrames`, {
//             method: 'POST',
//             headers: authHeaders,
//             body: extractForm,
//           });

//           if (!extractRes.ok) {
//             console.warn('⚠️ Frame extraction failed:', await extractRes.text());
//             toast.warn('🖼️ Frame extraction skipped or failed.');
//           } else {
//             toast.success('✅ Frames extracted!');
//             const analyzeRes = await fetch(`${BACKEND_URL}/api/analyzeAllFrames`, { headers: authHeaders });
//             if (!analyzeRes.ok) {
//               console.warn('⚠️ Frame analysis failed:', await analyzeRes.text());
//               toast.warn('🤖 Frame analysis skipped or failed.');
//             } else {
//               const analyzeData = await analyzeRes.json();
//               const frames = Array.isArray(analyzeData) ? analyzeData : analyzeData.responses || [];
//               setResponses(frames.map((item) => `${item.file}: ${item.description}`));
//               toast.success('✅ Frame analysis complete!');
//             }
//           }
//         } catch (frameErr) {
//           console.error('❌ Frame processing error:', frameErr);
//           toast.warn('⚠️ Frame processing encountered an error.');
//         }
//       }

//       // ElevenLabs
//       try {
//         const elevenForm = new FormData();
//         elevenForm.append('videoName', uploadedFilename);
//         const elevenRes = await fetch(`${BACKEND_URL}/api/transcribeWithElevenLabs`, {
//           method: 'POST',
//           headers: authHeaders,
//           body: elevenForm,
//         });

//         if (elevenRes.ok) {
//           const elevenData = await elevenRes.json();
//           setElevenLabsTranscript(elevenData.transcript || 'No transcript from ElevenLabs');
//           toast.success('✅ ElevenLabs transcription done!');
//         } else {
//           console.warn('⚠️ ElevenLabs failed:', await elevenRes.text());
//           toast.warn(`⚠️ ElevenLabs failed. Status: ${elevenRes.status}`);
//         }
//       } catch (elevenErr) {
//         console.error('❌ ElevenLabs error:', elevenErr);
//         toast.warn('⚠️ ElevenLabs transcription encountered an error.');
//       }

//       // Deepgram
//       try {
//         const deepgramForm = new FormData();
//         deepgramForm.append('videoName', uploadedFilename);
//         const deepgramRes = await fetch(`${BACKEND_URL}/api/transcribeWithDeepgram`, {
//           method: 'POST',
//           headers: authHeaders,
//           body: deepgramForm,
//         });

//         if (deepgramRes.ok) {
//           const deepgramData = await deepgramRes.json();
//           const deepgramTranscript = deepgramData.transcript || 'No transcript from Deepgram';
//           setDeepgramTranscript(deepgramTranscript);
//           toast.success('✅ Deepgram transcription done!');

//           // LLM analysis
//           if (deepgramTranscript && deepgramTranscript !== 'No transcript from Deepgram') {
//             try {
//               const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {
//                 method: 'POST',
//                 headers: { 'Content-Type': 'application/json', ...authHeaders },
//                 body: JSON.stringify({ transcript: deepgramTranscript }),
//               });

//               if (!analysisRes.ok) {
//                 let errorMessage = analysisRes.statusText;
//                 try { const errorData = await analysisRes.json(); errorMessage = errorData.error || errorMessage; } catch {}
//                 throw new Error(`Gemini text analysis failed: ${errorMessage}`);
//               }

//               const analysisData = await analysisRes.json();
//               setLlmAnalysisResult(analysisData.analysis || 'No analysis result');
//               toast.success('✅ Text analysis by Gemini complete!');
//             } catch (analysisErr) {
//               console.error('❌ Speech analysis error:', analysisErr);
//               toast.error('❌ Speech analysis failed. Check console for details.');
//             }
//           }
//         } else {
//           console.warn('⚠️ Deepgram failed:', await deepgramRes.text());
//           toast.warn('⚠️ Deepgram transcription skipped.');
//         }
//       } catch (deepgramErr) {
//         console.error('❌ Deepgram error:', deepgramErr);
//         toast.warn('⚠️ Deepgram transcription encountered an error.');
//       }

//     } catch (err) {
//       console.error('💥 Upload process error:', err);
//       if (err.message?.includes('No authentication token')) {
//         toast.error('❌ Authentication expired. Please log in again.');
//         setTimeout(() => navigate('/login'), 2000);
//       } else {
//         toast.error(`❌ Operation failed: ${err.message || 'An unknown error occurred.'}`);
//       }
//     } finally {
//       setLoading(false);
//       // Clear file to avoid loops
//       setFile(null);
//     }
//   }, [file, user, BACKEND_URL, navigate]);

//   // Auto-upload when file is selected
//   useEffect(() => {
//     if (file && user && !loading) {
//       handleUpload();
//     }
//     // NOTE: intentionally only depends on file/user/loading to avoid infinite loops
//     // eslint-disable-next-line react-hooks/exhaustive-deps
//   }, [file, user, loading]);

//   const handleManualTextAnalysis = async () => {
//     if (!user) {
//       toast.error("❗ Please log in to analyze text!");
//       navigate("/login");
//       return;
//     }

//     if (!manualTranscript.trim()) {
//       toast.error("Please enter some text to analyze.");
//       return;
//     }

//     setLoading(true);
//     setLlmAnalysisResult("");

//     try {
//       const authHeaders = await getAuthHeaders();
//       toast.info("✨ Analyzing text with Gemini...");
//       const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {
//         method: "POST",
//         headers: { 
//           "Content-Type": "application/json",
//           ...authHeaders
//         },
//         body: JSON.stringify({ transcript: manualTranscript }),
//       });

//       if (!analysisRes.ok) {
//         let errorMessage = analysisRes.statusText;
//         try { const errorData = await analysisRes.json(); errorMessage = errorData.error || errorMessage; } catch {}
//         throw new Error(`Gemini text analysis failed: ${errorMessage}`);
//       }

//       const analysisData = await analysisRes.json();
//       setLlmAnalysisResult(analysisData.analysis || 'No analysis result');
//       toast.success("✅ Text analysis by Gemini complete!");
//     } catch (error) {
//       console.error("❌ Text analysis error:", error);
//       if (error.message?.includes("No authentication token")) {
//         toast.error("❌ Authentication expired. Please log in again.");
//         setTimeout(() => navigate("/login"), 2000);
//       } else {
//         toast.error(`❌ Text analysis failed: ${error.message || "An unknown error occurred."}`);
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   // Show loading while checking auth
//   if (!authChecked) {
//     return (
//       <MainWrapper>
//         <LoadingContainer>
//           <Spinner viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10c0 1.25-.26 2.45-.73 3.55L19 14.8c-.37-.84-.5-1.78-.4-2.73a8 8 0 0 0-8-8 8 8 0 0 0-8 8 8 8 0 0 0 8 8c.95.1 1.89-.03 2.73-.4L15.55 21.27C14.45 21.74 13.25 22 12 22A10 10 0 0 1 12 2z"/></Spinner>
//           <LoadingText>Checking authentication...</LoadingText>
//         </LoadingContainer>
//       </MainWrapper>
//     );
//   }

//   if (loading) {
//     return (
//       <MainWrapper>
//         <LoadingContainer>
//           <Spinner viewBox="0 0 24 24"><path d="M12 2a10 10 0 0 1 10 10c0 1.25-.26 2.45-.73 3.55L19 14.8c-.37-.84-.5-1.78-.4-2.73a8 8 0 0 0-8-8 8 8 0 0 0-8 8 8 8 0 0 0 8 8c.95.1 1.89-.03 2.73-.4L15.55 21.27C14.45 21.74 13.25 22 12 22A10 10 0 0 1 12 2z"/></Spinner>
//           <LoadingText>
//             <div style={{ width: "40px", height: "40px", backgroundColor: "white", borderRadius: "50%", display: "inline-block" }}></div>
//             Processing your presentation...
//           </LoadingText>
//           <p style={{ color: "#9CA3AF", marginBottom: "1rem", textAlign: "center" }}>
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

//           {!user && (
//             <AuthWarning>
//               ⚠️ You are not logged in. Please
//               <LoginButton onClick={() => navigate("/login")}>
//                 log in
//               </LoginButton>
//               to upload files and save your analysis history.
//             </AuthWarning>
//           )}

//           {user && (
//             <UserInfo>
//               ✅ Logged in as: <strong>{user.email}</strong>
//               {user.user_metadata?.full_name && ` (${user.user_metadata.full_name})`}
//             </UserInfo>
//           )}

//           <UploadArea
//             $dragOver={dragOver}
//             $disabled={!user}
//             onClick={() => {
//               if (!user) {
//                 toast.error('Please log in first');
//                 navigate("/login");
//               } else {
//                 fileInputRef.current?.click();
//               }
//             }}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <UploadIcon />
//             <UploadText>
//               {user ? "Drag & Drop Your File Here" : "Login Required to Upload"}
//             </UploadText>
//             <UploadSubtext>Supported formats: .mp4, .mov, .avi, .mp3, .wav</UploadSubtext>
//             <UploadSubtext>Maximum file size: 500MB</UploadSubtext>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".mp4,.mov,.avi,.mp3,.wav"
//               style={{ display: 'none' }}
//               onChange={handleFileInputChange}
//               disabled={!user}
//             />
//           </UploadArea>

//           <div style={{ display: 'flex', justifyContent: 'center', marginTop: '1rem' }}>
//             <ToggleButton
//               onClick={() => setShowTextArea(!showTextArea)}
//               disabled={!user}
//             >
//               {showTextArea ? "Hide" : "Show"} text-only analysis
//             </ToggleButton>
//           </div>

//           {showTextArea && (
//             <div style={{ marginTop: '1rem' }}>
//               <TextArea
//                 placeholder={user ? "Paste your transcript or text here for analysis..." : "Login required to use this feature"}
//                 value={manualTranscript}
//                 onChange={(e) => setManualTranscript(e.target.value)}
//                 disabled={!user}
//               />
//               <div style={{ textAlign: 'right', marginTop: '1rem' }}>
//                 <StyledButton
//                   onClick={handleManualTextAnalysis}
//                   disabled={loading || !manualTranscript.trim() || !user}
//                 >
//                   Analyze Text
//                 </StyledButton>
//               </div>
//             </div>
//           )}

//           {(responses.length > 0 || elevenLabsTranscript || deepgramTranscript || llmAnalysisResult) && (
//             <ResultsCard>
//               <h5 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1rem' }}>
//                 Analysis Results
//               </h5>

//               {publicUrl && (
//                 <ResultSection>
//                   <ResultTitle>File URL:</ResultTitle>
//                   <a 
//                     href={publicUrl} 
//                     target="_blank" 
//                     rel="noopener noreferrer" 
//                     style={{ color: '#60a5fa', textDecoration: 'none', transition: 'color 0.3s' }}
//                     onMouseEnter={(e) => e.target.style.color = '#93c5fd'}
//                     onMouseLeave={(e) => e.target.style.color = '#60a5fa'}
//                   >
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
//       <ToastContainer 
//         position="top-right" 
//         autoClose={5000}
//         hideProgressBar={false}
//         newestOnTop={false}
//         closeOnClick
//         rtl={false}
//         pauseOnFocusLoss
//         draggable
//         theme="dark"
//       />
//     </MainWrapper>
//   );
// }
import React, { useState, useRef, useEffect, useCallback } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { useNavigate } from "react-router-dom";
import supabase, { getCurrentUser, getAuthHeaders } from "./supabaseClient";

const BACKGROUND_COLOR = "#111827";
const PRIMARY_COLOR = "#00A8FF";

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
  const fileInputRef = useRef(null);
  const BACKEND_URL =
    process.env.REACT_APP_BACKEND_URL || "https://voicebackend-development.onrender.com";

  useEffect(() => {
    checkAuth();
  }, []);

  const checkAuth = async () => {
    try {
      if (!supabase || !getCurrentUser) {
        toast.error("Authentication module failed to load. Check console.");
        setAuthChecked(true);
        return;
      }
      const currentUser = await getCurrentUser();
      if (currentUser && typeof currentUser.id === "string" && currentUser.id.includes("-")) {
        setUser(currentUser);
      } else {
        setUser(null);
      }
    } catch (error) {
      toast.error("Failed to verify authentication. Please refresh the page.");
    } finally {
      setAuthChecked(true);
    }
  };

  const handleFileSelect = (selectedFile) => {
    if (!user) {
      toast.error("Please log in to upload files!");
      navigate("/login");
      return;
    }
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
      toast.error("Invalid File Type: Use .mp4, .mov, .avi, .mp3, or .wav.");
      return;
    }
    setFile(selectedFile);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setDragOver(false);
    if (!user) {
      toast.error("Please log in to upload files!");
      navigate("/login");
      return;
    }
    const droppedFiles = Array.from(e.dataTransfer.files);
    if (droppedFiles.length > 0) {
      handleFileSelect(droppedFiles[0]);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    if (user) setDragOver(true);
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

  const handleUpload = useCallback(
    async (e) => {
      if (e?.preventDefault) e.preventDefault();
      if (!user || !user.id || !user.id.includes("-")) {
        toast.error("Authentication error: Please log in again.");
        navigate("/login");
        return;
      }
      if (!file) {
        toast.error("Please select a video or audio file!");
        return;
      }
      if (!BACKEND_URL) {
        toast.error("Backend URL not configured. Set REACT_APP_BACKEND_URL.");
        return;
      }

      setLoading(true);
      setResponses([]);
      setElevenLabsTranscript("");
      setDeepgramTranscript("");
      setLlmAnalysisResult("");
      setPublicUrl("");

      try {
        const authHeaders = await getAuthHeaders();
        if (!authHeaders) throw new Error("No authentication headers");

        toast.info("Uploading file to Supabase...");
        const formData = new FormData();
        formData.append("myvideo", file);
        formData.append("user_id", user.id);
        const uploadRes = await fetch(`${BACKEND_URL}/api/upload`, {
          method: "POST",
          headers: authHeaders,
          body: formData,
        });
        if (!uploadRes.ok) {
          let errorText = "Unknown error";
          try {
            const errorJson = await uploadRes.json();
            errorText = errorJson.error || errorJson.details || JSON.stringify(errorJson);
          } catch {
            errorText = await uploadRes.text();
          }
          throw new Error(`Upload failed (${uploadRes.status}): ${errorText}`);
        }

        const uploadData = await uploadRes.json();
        const uploadedFilename = uploadData.videoName;
        const uploadPublicUrl = uploadData.publicUrl;
        if (!uploadedFilename) throw new Error("No filename received from server");

        setFilename(uploadedFilename);
        setPublicUrl(uploadPublicUrl);
        toast.success("File uploaded and metadata saved!");

        if (file.type.startsWith("video/")) {
          try {
            const extractForm = new FormData();
            extractForm.append("videoName", uploadedFilename);
            const extractRes = await fetch(`${BACKEND_URL}/api/extractFrames`, {
              method: "POST",
              headers: authHeaders,
              body: extractForm,
            });
            if (!extractRes.ok) {
              toast.warn("Frame extraction skipped or failed.");
            } else {
              toast.success("Frames extracted!");
              const analyzeRes = await fetch(`${BACKEND_URL}/api/analyzeAllFrames`, {
                headers: authHeaders,
              });
              if (!analyzeRes.ok) {
                toast.warn("Frame analysis skipped or failed.");
              } else {
                const analyzeData = await analyzeRes.json();
                const frames = Array.isArray(analyzeData)
                  ? analyzeData
                  : analyzeData.responses || [];
                setResponses(frames.map((item) => `${item.file}: ${item.description}`));
                toast.success("Frame analysis complete!");
              }
            }
          } catch {
            toast.warn("Frame processing encountered an error.");
          }
        }

        try {
          const elevenForm = new FormData();
          elevenForm.append("videoName", uploadedFilename);
          const elevenRes = await fetch(`${BACKEND_URL}/api/transcribeWithElevenLabs`, {
            method: "POST",
            headers: authHeaders,
            body: elevenForm,
          });
          if (elevenRes.ok) {
            const elevenData = await elevenRes.json();
            setElevenLabsTranscript(elevenData.transcript || "No transcript from ElevenLabs");
            toast.success("ElevenLabs transcription done!");
          } else {
            toast.warn(`ElevenLabs failed (status ${elevenRes.status}).`);
          }
        } catch {
          toast.warn("ElevenLabs transcription encountered an error.");
        }

        try {
          const deepgramForm = new FormData();
          deepgramForm.append("videoName", uploadedFilename);
          const deepgramRes = await fetch(`${BACKEND_URL}/api/transcribeWithDeepgram`, {
            method: "POST",
            headers: authHeaders,
            body: deepgramForm,
          });
          if (deepgramRes.ok) {
            const deepgramData = await deepgramRes.json();
            const transcript = deepgramData.transcript || "No transcript from Deepgram";
            setDeepgramTranscript(transcript);
            toast.success("Deepgram transcription done!");

            if (transcript && transcript !== "No transcript from Deepgram") {
              try {
                const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {
                  method: "POST",
                  headers: { "Content-Type": "application/json", ...authHeaders },
                  body: JSON.stringify({ transcript }),
                });
                if (!analysisRes.ok) {
                  let errorMessage = analysisRes.statusText;
                  try {
                    const errorData = await analysisRes.json();
                    errorMessage = errorData.error || errorMessage;
                  } catch {}
                  throw new Error(`Gemini text analysis failed: ${errorMessage}`);
                }
                const analysisData = await analysisRes.json();
                setLlmAnalysisResult(analysisData.analysis || "No analysis result");
                toast.success("Text analysis by Gemini complete!");
              } catch (analysisErr) {
                toast.error("Speech analysis failed. Check console for details.");
                console.error(analysisErr);
              }
            }
          } else {
            toast.warn("Deepgram transcription skipped.");
          }
        } catch {
          toast.warn("Deepgram transcription encountered an error.");
        }
      } catch (err) {
        console.error(err);
        if (err.message?.includes("No authentication token")) {
          toast.error("Authentication expired. Please log in again.");
          setTimeout(() => navigate("/login"), 2000);
        } else {
          toast.error(`Operation failed: ${err.message || "Unknown error."}`);
        }
      } finally {
        setLoading(false);
        setFile(null);
      }
    },
    [file, user, BACKEND_URL, navigate]
  );

  useEffect(() => {
    if (file && user && !loading) {
      handleUpload();
    }
  }, [file, user, loading, handleUpload]);

  const handleManualTextAnalysis = async () => {
    if (!user) {
      toast.error("Please log in to analyze text!");
      navigate("/login");
      return;
    }
    if (!manualTranscript.trim()) {
      toast.error("Please enter some text to analyze.");
      return;
    }
    setLoading(true);
    setLlmAnalysisResult("");
    try {
      const authHeaders = await getAuthHeaders();
      toast.info("Analyzing text with Gemini...");
      const analysisRes = await fetch(`${BACKEND_URL}/api/analyzeSpeechWithGemini`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...authHeaders,
        },
        body: JSON.stringify({ transcript: manualTranscript }),
      });

      if (!analysisRes.ok) {
        let errorMessage = analysisRes.statusText;
        try {
          const errorData = await analysisRes.json();
          errorMessage = errorData.error || errorMessage;
        } catch {}
        throw new Error(`Gemini text analysis failed: ${errorMessage}`);
      }
      const analysisData = await analysisRes.json();
      setLlmAnalysisResult(analysisData.analysis || "No analysis result");
      toast.success("Text analysis by Gemini complete!");
    } catch (error) {
      if (error.message?.includes("No authentication token")) {
        toast.error("Authentication expired. Please log in again.");
        setTimeout(() => navigate("/login"), 2000);
      } else {
        toast.error(`Text analysis failed: ${error.message || "Unknown error."}`);
      }
    } finally {
      setLoading(false);
    }
  };

  if (!authChecked) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="spinner-border text-light mb-3" role="status" />
        <p>Checking authentication...</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white text-center">
        <div className="spinner-border text-info mb-3" role="status" />
        <h5 className="mb-3">Processing your presentation...</h5>
        <p className="text-white-50 mb-3">
          Analyzing your video/audio, transcribing, and generating insights...
        </p>
        <div className="progress w-50">
          <div className="progress-bar progress-bar-striped progress-bar-animated" style={{ width: "75%" }} />
        </div>
      </div>
    );
  }

  return (
    <div className="min-vh-100 py-5" style={{ backgroundColor: BACKGROUND_COLOR }}>
      <div className="container">
        <div className="card bg-dark text-light border-secondary shadow-lg p-4 p-lg-5">
          <h2 className="text-center mb-2">Upload Your Presentation</h2>
          <p className="text-center text-white-50 mb-4">
            Instantly get detailed feedback on your speaking and visuals.
          </p>

          {!user && (
            <div className="alert alert-warning text-center" role="alert">
              ⚠️ You are not logged in. Please{" "}
              <button className="btn btn-link p-0" onClick={() => navigate("/login")}>
                log in
              </button>{" "}
              to upload files and save your analysis history.
            </div>
          )}

          {user && (
            <div className="alert alert-success text-center" role="alert">
              ✅ Logged in as <strong>{user.email}</strong>
              {user.user_metadata?.full_name && ` (${user.user_metadata.full_name})`}
            </div>
          )}

          <div
            className={`border rounded-4 text-center p-5 mb-4 ${
              dragOver ? "border-info bg-opacity-25 bg-info" : "border-secondary"
            } ${user ? "upload-area" : "opacity-50"}`}
            onClick={() => (user ? fileInputRef.current?.click() : navigate("/login"))}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            style={{ cursor: user ? "pointer" : "not-allowed" }}
          >
            <div className="display-3 text-info mb-3">☁️</div>
            <h4>{user ? "Drag & Drop Your File Here" : "Login Required to Upload"}</h4>
            <p className="text-white-50 mb-0">
              Supported formats: .mp4, .mov, .avi, .mp3, .wav (max 500MB)
            </p>
            <input
              ref={fileInputRef}
              type="file"
              accept=".mp4,.mov,.avi,.mp3,.wav"
              className="d-none"
              onChange={handleFileInputChange}
              disabled={!user}
            />
          </div>

          <div className="text-center mb-4">
            <button
              className="btn btn-outline-light rounded-pill"
              onClick={() => setShowTextArea((prev) => !prev)}
              disabled={!user}
            >
              {showTextArea ? "Hide" : "Show"} text-only analysis
            </button>
          </div>

          {showTextArea && (
            <div className="mb-4">
              <textarea
                className="form-control bg-dark text-light border-secondary"
                rows={6}
                placeholder={
                  user ? "Paste your transcript or text here for analysis..." : "Login required to use this feature"
                }
                value={manualTranscript}
                onChange={(e) => setManualTranscript(e.target.value)}
                disabled={!user}
              />
              <div className="text-end mt-3">
                <button
                  className="btn btn-info px-4"
                  onClick={handleManualTextAnalysis}
                  disabled={loading || !manualTranscript.trim() || !user}
                >
                  Analyze Text
                </button>
              </div>
            </div>
          )}

          {(responses.length > 0 ||
            elevenLabsTranscript ||
            deepgramTranscript ||
            llmAnalysisResult ||
            publicUrl) && (
            <div className="card bg-dark border-secondary mt-4">
              <div className="card-body">
                <h5 className="card-title text-white mb-4">Analysis Results</h5>

                {publicUrl && (
                  <div className="mb-4">
                    <h6 className="text-white">File URL:</h6>
                    <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-info">
                      {filename}
                    </a>
                  </div>
                )}

                {responses.length > 0 && (
                  <div className="mb-4">
                    <h6 className="text-white">Visual Analysis:</h6>
                    <ul className="list-group list-group-flush bg-transparent">
                      {responses.map((response, index) => (
                        <li key={index} className="list-group-item bg-transparent text-white-50 border-secondary">
                          {response}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}

                {elevenLabsTranscript && (
                  <div className="mb-4">
                    <h6 className="text-white">ElevenLabs Transcript:</h6>
                    <p className="text-white-50">{elevenLabsTranscript}</p>
                  </div>
                )}

                {deepgramTranscript && (
                  <div className="mb-4">
                    <h6 className="text-white">Deepgram Transcript:</h6>
                    <p className="text-white-50">{deepgramTranscript}</p>
                  </div>
                )}

                {llmAnalysisResult && (
                  <div className="mb-4">
                    <h6 className="text-white">AI Analysis:</h6>
                    <p className="text-white-50">{llmAnalysisResult}</p>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>

      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        draggable
        theme="dark"
      />

      <style>{`
        .upload-area {
          transition: all 0.3s ease;
        }
        .upload-area:hover {
          border-color: ${PRIMARY_COLOR};
          background-color: rgba(0, 168, 255, 0.05);
        }
      `}</style>
    </div>
  );
}