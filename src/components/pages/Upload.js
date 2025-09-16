// import React, { useState, useRef, useEffect } from "react";
// import { ToastContainer, toast } from "react-toastify";
// import "react-toastify/dist/ReactToastify.css";
// import { FaCloudUploadAlt } from "react-icons/fa";
// import styled from 'styled-components';
// import mic from "../pages/mic.png";
// import { createClient } from "@supabase/supabase-js";
// import backgroundSpotlight from "./spotlightsblack1.jpg";

// // Supabase client initialization (API keys are needed even without auth)
// const supabase = createClient(
//   process.env.REACT_APP_SUPABASE_URL,
//   process.env.REACT_APP_SUPABASEANONKEY
// );

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
//   // HARDCODED USER ID - AUTHENTICATION IS REMOVED
//   const [userId] = useState("1");
//   const [manualTranscript, setManualTranscript] = useState("");


//   // This useEffect now serves only to log the hardcoded user ID.
//   useEffect(() => {
//     console.log("Using hardcoded User ID:", userId);
//   }, [userId]);

//   // This useEffect ensures the file upload process starts immediately after a file is selected.
//   useEffect(() => {
//     if (file) {
//       handleUpload({ preventDefault: () => {} });
//     }
//   }, [file]);

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

//       // NO AUTHORIZATION HEADER NEEDED
//       const uploadRes = await fetch("REACT_APP_BACKEND_URL/upload", {
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
//       const extractRes = await fetch("REACT_APP_BACKEND_URL/extractFrames", {
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
//       const analyzeRes = await fetch("REACT_APP_BACKEND_URL/analyzeAllFrames");
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
//       const elevenRes = await fetch("REACT_APP_BACKEND_URL/transcribeWithElevenLabs", {
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
//       const deepgramRes = await fetch("REACT_APP_BACKEND_URL/transcribeWithDeepgram", {
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
//           const analysisRes = await fetch("REACT_APP_BACKEND_URL/analyzeSpeechWithGemini", {
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

//     }catch (err) {
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
//       const analysisRes = await fetch("REACT_APP_BACKEND_URL/analyzeSpeechWithGemini", {
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
//       <StyledWrapper>
//         <section className="py-5 bg-white min-h-screen flex items-center justify-center" id="upload">
//           <div className="container mx-auto">
//             <div className="flex justify-center">
//               <div className="w-full lg:w-3/4">
//                 <div className="card shadow-lg rounded-xl overflow-hidden">
//                   <div className="card-body text-center p-8">
//                     <div className="loader mb-6">
//                       <span className="letter a">A</span>
//                       <span className="letter n">N</span>
//                       <span className="letter a">A</span>
//                       <span className="letter l">L</span>
//                       <span className="letter y">Y</span>
//                       <span className="letter s">S</span>
                      
//                      <img src={mic} alt="Mic" style={{ width: "55px", height: "50px" }} />
//                      <span className="letter n">N</span>
//                       <span className="letter n">G</span>
                      
//                     </div>
//                     <h5 className="text-2xl font-semibold mb-4 text-gray-800">
//                       Processing Your Presentation...
//                     </h5>
//                     <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
//                       <div
//                         className="bg-indigo-600 h-2.5 rounded-full animate-pulse"
//                         style={{ width: '75%' }}
//                       ></div>
//                     </div>
//                     <p className="text-muted text-gray-600 mb-0">
//                       Analyzing your video/audio, extracting frames, transcribing, and generating insights...
//                     </p>
//                   </div>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </section>
//       </StyledWrapper>
//     );
//   }

//   return (
//     <StyledWrapper>
//   <section className="d-flex align-items-center justify-content-center min-vh-100" id="upload">
//     <div className="container">
//       <div className="row justify-content-center">
//         <div className="col-lg-8">
//           <div className="text-center mb-5">
//             <h2 className="display-4 font-weight-bold mb-3 text-white">Upload Your Presentation</h2>
//             <p className="lead text-white">Drag & drop your video or audio file, or click to browse</p>
//           </div>
//           <div
//             className={`upload-area d-flex flex-column align-items-center justify-content-center p-5 mb-4 border-2 border-dashed rounded-lg cursor-pointer glass-effect
//               ${dragOver ? 'border-primary bg-indigo-50' : 'border-light hover:border-primary'}
//             `}

//             style={{
//     background: 'rgba(255, 255, 255, 0.1)',
//     backdropFilter: 'blur(10px)',
//     border: '1px solid rgba(255, 255, 255, 0.2)',
//     borderRadius: '1rem',
//   }}


//             onClick={() => fileInputRef.current?.click()}
//             onDragOver={handleDragOver}
//             onDragLeave={handleDragLeave}
//             onDrop={handleDrop}
//           >
//             <FaCloudUploadAlt className="text-primary mb-4" style={{ fontSize: '6rem' }} />
//             <h4 className="h3 font-weight-bold mb-3 text-white">Drag & Drop Your File Here</h4>
//             <p className="text-light mb-2">Supported formats: .mp4, .mov, .avi, .mp3, .wav</p>
//             <p className="text-muted text-sm mb-4">Max file size: 500MB</p>
//             <button className="btn btn-primary btn-lg shadow-sm">
//               <i className="bi bi-folder-plus mr-2"></i>Choose File
//             </button>
//             <input
//               ref={fileInputRef}
//               type="file"
//               accept=".mp4,.mov,.avi,.mp3,.wav"
//               style={{ display: 'none' }}
//               onChange={handleFileInputChange}
//             />
//           </div>
//           <div className="text-center mb-4">
//             <button
//               className="btn btn-outline-light px-4 py-2 rounded-md shadow-sm"
//               onClick={() => setShowTextArea(!showTextArea)}
//             >
//               Or, paste your transcript for text-only analysis
//             </button>
//           </div>
//           {/* ... (rest of the content remains the same) ... */}
//         </div>
//       </div>
//     </div>
//   </section>
// </StyledWrapper>
//   );
// }

// const StyledWrapper = styled.div`
//   background-image: url(${backgroundSpotlight});
//   background-position: center;
//   background-repeat: no-repeat;
//   background-size: cover;
//   min-height: 100vh;
//   position: relative;
//   &:after {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     width: 100%;
//     height: 100%;
//     background: rgba(0, 0, 0, 0.6);
//     z-index: -1;
//   }
//   .loader {
//     --ANIMATION-DELAY-MULTIPLIER: 70ms;
//     display: flex;
//     flex-direction: row;
//     justify-content: center;
//     align-items: center;
//     gap: 0.5rem;
//     overflow: hidden;
//   }
//   .loader span {
//     display: inline-block;
//     transform: translateY(4rem);
//     animation: hideAndSeek 1s alternate infinite cubic-bezier(0.86, 0, 0.07, 1);
//   }
//   .loader .a { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 0); }
//   .loader .n { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 1); }
//   .loader .l { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 2); }
//   .loader .y { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 3); }
//   .loader .s { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 4); }
//   .loader .i { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 5); }
//   .loader .n { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 6); }
//   .loader .g { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 7); }
//   .letter {
//     width: fit-content;
//     height: 4rem;
//     font-size: 3rem;
//     font-weight: 900;
//     color: #16b499ff;
//   }
//   .loader .i {
//     margin-inline: 5px;
//   }
//   @keyframes hideAndSeek {
//     0% { transform: translateY(4rem); opacity: 0.3; }
//     100% { transform: translateY(0); opacity: 1; }
//   }
// `;
import React, { useState, useRef, useEffect } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import { FaCloudUploadAlt } from "react-icons/fa";
import styled from 'styled-components';
import mic from "../pages/mic.png";
import { createClient } from "@supabase/supabase-js";
import backgroundSpotlight from "./spotlightsblack1.jpg";

// Supabase client initialization (API keys are needed even without auth)
const supabase = createClient(
  process.env.REACT_APP_SUPABASE_URL,
  process.env.REACT_APP_SUPABASEANONKEY
);

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
    // Try to get existing ID from sessionStorage first
    let existingId = null;
    
    try {
      // Check if sessionStorage is available
      if (typeof Storage !== "undefined" && window.sessionStorage) {
        existingId = sessionStorage.getItem('uniqueUserId');
        
        // Validate the existing ID format
        if (existingId && (!existingId.startsWith('user_') || existingId.length < 20)) {
          console.warn('Invalid stored user ID format, generating new one');
          existingId = null;
        }
      }
    } catch (error) {
      console.warn('SessionStorage not available or error accessing it:', error.message);
      existingId = null;
    }
    
    // Return existing valid ID if found
    if (existingId) {
      console.log('Using existing user ID:', existingId);
      return existingId;
    }
    
    // Generate new unique ID with timestamp and random string
    const timestamp = Date.now();
    const randomPart = Math.random().toString(36).substring(2, 11); // 9 characters
    const newId = `user_${timestamp}_${randomPart}`;
    
    // Try to store the new ID for future use
    try {
      if (typeof Storage !== "undefined" && window.sessionStorage) {
        sessionStorage.setItem('uniqueUserId', newId);
        console.log('Stored new user ID in sessionStorage:', newId);
      } else {
        console.warn('SessionStorage not available - user ID will be session-only');
      }
    } catch (error) {
      console.warn('Could not store user ID in sessionStorage:', error.message);
      // Continue anyway - the ID will still work for this session
    }
    
    console.log('Generated new user ID:', newId);
    return newId;
  });

  const [manualTranscript, setManualTranscript] = useState("");

  // Log the generated unique user ID for debugging
  useEffect(() => {
    console.log("Current User ID:", userId);
  }, [userId]);

  // This useEffect ensures the file upload process starts immediately after a file is selected.
  useEffect(() => {
    if (file) {
      handleUpload({ preventDefault: () => {} });
    }
  }, [file]);

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

  const handleUpload = async (e) => {
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

      // NO AUTHORIZATION HEADER NEEDED
      // The correct way to access and use the environment variable
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
  };

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
      <StyledWrapper>
        <section className="py-5 bg-white min-h-screen flex items-center justify-center" id="upload">
          <div className="container mx-auto">
            <div className="flex justify-center">
              <div className="w-full lg:w-3/4">
                <div className="card shadow-lg rounded-xl overflow-hidden">
                  <div className="card-body text-center p-8">
                    <div className="loader mb-6">
                      <span className="letter a">A</span>
                      <span className="letter n">N</span>
                      <span className="letter a">A</span>
                      <span className="letter l">L</span>
                      <span className="letter y">Y</span>
                      <span className="letter s">S</span>
                      
                     <img src={mic} alt="Mic" style={{ width: "55px", height: "50px" }} />
                     <span className="letter n">N</span>
                      <span className="letter n">G</span>
                      
                    </div>
                    <h5 className="text-2xl font-semibold mb-4 text-gray-800">
                      Processing Your Presentation...
                    </h5>
                    <div className="w-full bg-gray-200 rounded-full h-2.5 mb-4">
                      <div
                        className="bg-indigo-600 h-2.5 rounded-full animate-pulse"
                        style={{ width: '75%' }}
                      ></div>
                    </div>
                    <p className="text-muted text-gray-600 mb-0">
                      Analyzing your video/audio, extracting frames, transcribing, and generating insights...
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>
      </StyledWrapper>
    );
  }

  return (
    <StyledWrapper>
      <section className="d-flex align-items-center justify-content-center min-vh-100" id="upload">
        <div className="container">
          <div className="row justify-content-center">
            <div className="col-lg-8">
              <div className="text-center mb-5">
                <h2 className="display-4 font-weight-bold mb-3 text-white">Upload Your Presentation</h2>
                <p className="lead text-white">Drag & drop your video or audio file, or click to browse</p>
              </div>
              
              {/* File Upload Area */}
              <div
                className={`upload-area d-flex flex-column align-items-center justify-content-center p-5 mb-4 border-2 border-dashed rounded-lg cursor-pointer glass-effect
                  ${dragOver ? 'border-primary bg-indigo-50' : 'border-light hover:border-primary'}
                `}
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                  backdropFilter: 'blur(10px)',
                  border: '1px solid rgba(255, 255, 255, 0.2)',
                  borderRadius: '1rem',
                }}
                onClick={() => fileInputRef.current?.click()}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
              >
                <FaCloudUploadAlt className="text-primary mb-4" style={{ fontSize: '6rem' }} />
                <h4 className="h3 font-weight-bold mb-3 text-white">Drag & Drop Your File Here</h4>
                <p className="text-light mb-2">Supported formats: .mp4, .mov, .avi, .mp3, .wav</p>
                <p className="text-muted text-sm mb-4">Max file size: 500MB</p>
                <button className="btn btn-primary btn-lg shadow-sm">
                  <i className="bi bi-folder-plus mr-2"></i>Choose File
                </button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".mp4,.mov,.avi,.mp3,.wav"
                  style={{ display: 'none' }}
                  onChange={handleFileInputChange}
                />
              </div>
              
              {/* Text Analysis Toggle */}
              <div className="text-center mb-4">
                <button
                  className="btn btn-outline-light px-4 py-2 rounded-md shadow-sm"
                  onClick={() => setShowTextArea(!showTextArea)}
                >
                  Or, paste your transcript for text-only analysis
                </button>
              </div>
              
              {/* Text Area Section */}
              {showTextArea && (
                <div className="text-area-section mb-4">
                  <div className="card" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                  }}>
                    <div className="card-body p-4">
                      <h5 className="text-white mb-3">Paste Your Transcript</h5>
                      <textarea
                        className="form-control mb-3"
                        rows="8"
                        placeholder="Paste your transcript or text here for analysis..."
                        value={manualTranscript}
                        onChange={(e) => setManualTranscript(e.target.value)}
                        style={{
                          background: 'rgba(255, 255, 255, 0.9)',
                          border: '1px solid rgba(255, 255, 255, 0.3)',
                          borderRadius: '0.5rem',
                        }}
                      />
                      <button
                        className="btn btn-success"
                        onClick={handleManualTextAnalysis}
                        disabled={loading || !manualTranscript.trim()}
                      >
                        {loading ? 'Analyzing...' : 'Analyze Text'}
                      </button>
                    </div>
                  </div>
                </div>
              )}
              
              {/* Results Display Section */}
              {(responses.length > 0 || elevenLabsTranscript || deepgramTranscript || llmAnalysisResult) && (
                <div className="results-section mt-4">
                  <div className="card" style={{
                    background: 'rgba(255, 255, 255, 0.1)',
                    backdropFilter: 'blur(10px)',
                    border: '1px solid rgba(255, 255, 255, 0.2)',
                    borderRadius: '1rem',
                  }}>
                    <div className="card-body p-4">
                      <h5 className="text-white mb-3">Analysis Results</h5>
                      
                      {publicUrl && (
                        <div className="mb-3">
                          <h6 className="text-white">File URL:</h6>
                          <a href={publicUrl} target="_blank" rel="noopener noreferrer" className="text-info">
                            {filename}
                          </a>
                        </div>
                      )}
                      
                      {responses.length > 0 && (
                        <div className="mb-3">
                          <h6 className="text-white">Frame Analysis:</h6>
                          <div className="text-light">
                            {responses.map((response, index) => (
                              <p key={index} className="mb-2">{response}</p>
                            ))}
                          </div>
                        </div>
                      )}
                      
                      {elevenLabsTranscript && (
                        <div className="mb-3">
                          <h6 className="text-white">ElevenLabs Transcript:</h6>
                          <p className="text-light">{elevenLabsTranscript}</p>
                        </div>
                      )}
                      
                      {deepgramTranscript && (
                        <div className="mb-3">
                          <h6 className="text-white">Deepgram Transcript:</h6>
                          <p className="text-light">{deepgramTranscript}</p>
                        </div>
                      )}
                      
                      {llmAnalysisResult && (
                        <div className="mb-3">
                          <h6 className="text-white">AI Analysis:</h6>
                          <div className="text-light" style={{ whiteSpace: 'pre-wrap' }}>
                            {llmAnalysisResult}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              
            </div>
          </div>
        </div>
        <ToastContainer position="top-right" autoClose={5000} />
      </section>
    </StyledWrapper>
  );
}

const StyledWrapper = styled.div`
  background-image: url(${backgroundSpotlight});
  background-position: center;
  background-repeat: no-repeat;
  background-size: cover;
  min-height: 100vh;
  position: relative;
  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background: rgba(0, 0, 0, 0.6);
    z-index: -1;
  }
  .loader {
    --ANIMATION-DELAY-MULTIPLIER: 70ms;
    display: flex;
    flex-direction: row;
    justify-content: center;
    align-items: center;
    gap: 0.5rem;
    overflow: hidden;
  }
  .loader span {
    display: inline-block;
    transform: translateY(4rem);
    animation: hideAndSeek 1s alternate infinite cubic-bezier(0.86, 0, 0.07, 1);
  }
  .loader .a { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 0); }
  .loader .n { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 1); }
  .loader .l { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 2); }
  .loader .y { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 3); }
  .loader .s { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 4); }
  .loader .i { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 5); }
  .loader .n { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 6); }
  .loader .g { animation-delay: calc(var(--ANIMATION-DELAY-MULTIPLIER) * 7); }
  .letter {
    width: fit-content;
    height: 4rem;
    font-size: 3rem;
    font-weight: 900;
    color: #16b499ff;
  }
  .loader .i {
    margin-inline: 5px;
  }
  @keyframes hideAndSeek {
    0% { transform: translateY(4rem); opacity: 0.3; }
    100% { transform: translateY(0); opacity: 1; }
  }
`;