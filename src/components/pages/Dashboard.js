// // dashboard.js - FINAL FIXED VERSION

// import React, { useState, useEffect } from 'react';
// import styled, { keyframes } from 'styled-components';
// import { getAuthHeaders, getCurrentUser } from './supabaseClient'; 
// import { useNavigate } from 'react-router-dom'; // 👈 Import useNavigate for redirect

// // --- Keyframes & Styled Components (omitted for brevity, assume they are correct) ---
// // ... (Your styled components like DashboardContainer, Header, Spinner, ErrorMessage, etc.)
// const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
// const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

// const DashboardContainer = styled.div`
//   min-height: 100vh;
//   background-color: #1a1a1a;
//   color: #c0c0c0;
//   font-family: 'Satoshi', 'Inter', sans-serif;
//   animation: ${fadeIn} 0.8s ease-out;
// `;
// // 
// const Header = styled.header`...`; // Placeholder
// const HeaderTitle = styled.h1`...`; // Placeholder
// const HeaderSubtitle = styled.p`...`; // Placeholder
// const MainContent = styled.main`...`; // Placeholder
// const DataCard = styled.div`...`; // Placeholder
// const CardHeader = styled.div`...`; // Placeholder
// const CardTitle = styled.h3`...`; // Placeholder
// const CardSubtitle = styled.p`...`; // Placeholder
// const ScoreSection = styled.div`...`; // Placeholder
// const ScoreCard = styled.div`...`; // Placeholder
// const ScoreValue = styled.div`...`; // Placeholder
// const ScoreLabel = styled.div`...`; // Placeholder
// const ScoreExplanation = styled.div`...`; // Placeholder
// const CardBody = styled.div`...`; // Placeholder
// const VideoPlayerContainer = styled.div`...`; // Placeholder
// const StyledVideo = styled.video`...`; // Placeholder
// const SectionTitle = styled.h5`...`; // Placeholder
// const InfoBox = styled.div`...`; // Placeholder
// const InfoText = styled.p`...`; // Placeholder
// const ContentBlock = styled.div`...`; // Placeholder
// const BlockTitle = styled.h6`...`; // Placeholder
// const BlockContent = styled.div`...`; // Placeholder
// const KeyframesGrid = styled.div`...`; // Placeholder
// const FrameImage = styled.img`...`; // Placeholder
// const LoadingMessage = styled.div`...`; // Placeholder
// const Spinner = styled.div`border: 4px solid #333; border-top: 4px solid #e6b95b; border-radius: 50%; width: 40px; height: 40px; animation: ${spin} 1s linear infinite; margin-bottom: 1rem;`;
// const ErrorMessage = styled.div`...`; // Placeholder
// const PlaceholderCard = styled(DataCard)`...`; // Placeholder
// const PlaceholderEmoji = styled.div`...`; // Placeholder
// const PlaceholderButton = styled.a`...`; // Placeholder
// const Tip = styled.div`...`; // Placeholder
// // --- End Styled Components ---


// function Dashboard() {
//   const navigate = useNavigate(); // Initialize useNavigate
//   const [metadataList, setMetadataList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null); 
//   const [authChecked, setAuthChecked] = useState(false); 
//   const [dataLoaded, setDataLoaded] = useState(false); // New state to separate loading data from checking auth

//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-20.onrender.com';

//   // 1. Check Authentication on Mount
//   useEffect(() => {
//     const checkAuth = async () => {
//         try {
//             const currentUser = await getCurrentUser();
//             setUser(currentUser);
//         } catch (err) {
//             // Error in get user, treat as unauthenticated
//             setUser(null);
//         } finally {
//             setAuthChecked(true);
//         }
//     };
//     checkAuth();
//   }, []);

//   // 2. Fetch Metadata only when auth is confirmed and user is present
//   useEffect(() => {
//     if (!authChecked || dataLoaded) return; // Don't run until auth is confirmed, don't run repeatedly

//     if (!user) {
//         // Redirect if not logged in after auth check completes
//         // Setting a friendly error first, then redirecting
//         setError("You must be logged in to view your dashboard.");
//         setIsLoading(false);
//         setTimeout(() => navigate('/login'), 1500); 
//         return; 
//     }

//     const fetchMetadata = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);
        
//         const authHeaders = await getAuthHeaders();
        
//         if (!authHeaders) {
//              // Handle case where user object exists but token is stale/missing
//              throw new Error("Session expired. Please log in again.");
//         }
        
//         const response = await fetch(`${BACKEND_URL}/api/metadata`, {
//           method: 'GET',
//           headers: { 
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             ...authHeaders 
//           }
//         });
        
//         if (response.status === 401 || response.status === 403) {
//              // Server rejected the token/RLS failed, force re-login
//              throw new Error("Access denied by the server. Your session is invalid.");
//         }

//         if (!response.ok) {
//           let errorMessage = `HTTP ${response.status}`;
//           try {
//             const errorData = await response.json();
//             errorMessage = errorData.error || errorData.message || errorMessage;
//           } catch {
//             errorMessage = await response.text() || errorMessage;
//           }
//           throw new Error(errorMessage);
//         }

//         const data = await response.json();

//         if (Array.isArray(data)) {
//           setMetadataList(data);
//         } else if (data.success && Array.isArray(data.data)) {
//           setMetadataList(data.data);
//         } else if (data.data && Array.isArray(data.data)) {
//           setMetadataList(data.data);
//         } else {
//           setMetadataList([]);
//         }

//       } catch (err) {
//         // If session expired, force logout/redirect
//         if (err.message.includes("Session expired") || err.message.includes("Access denied")) {
//              setError(`Authentication failed: ${err.message}. Redirecting to login...`);
//              setTimeout(() => navigate('/login'), 2000);
//          } else {
//              setError(err.message);
//          }
//       } finally {
//         setIsLoading(false);
//         setDataLoaded(true); // Mark data loading as complete
//       }
//     };

//     fetchMetadata();
//   }, [BACKEND_URL, authChecked, user, dataLoaded, navigate]); 
//     // Added navigate to dependency array

//   const analyzePerformance = (item) => {
//     // ... (Your analyzePerformance function remains unchanged) ...
//     let fillerWordsCount = 0;
//     let pausesCount = 0;
//     let wordsArray = [];
//     if (item.deepgram_words) {
//       if (Array.isArray(item.deepgram_words)) {
//         wordsArray = item.deepgram_words;
//       } else if (typeof item.deepgram_words === 'object' && item.deepgram_words.words) {
//         wordsArray = item.deepgram_words.words;
//       }
//     }
//     const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well', 'actually', 'basically'];
//     fillerWordsCount = wordsArray.filter(word =>
//       fillerWords.includes(word.word?.toLowerCase())
//     ).length;
//     if (item.deepgram_transcript) {
//       const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
//       if (pauses) pausesCount = pauses.length;
//     }
//     const totalWords = wordsArray.length;
//     const fluencyScore = totalWords > 0 ? ((totalWords - fillerWordsCount) / totalWords) * 100 : 100;
//     const speakingRate = totalWords > 0 ? Math.round(totalWords / 2) : 0; 

//     const getFluencyRating = (score) => {
//       if (score >= 90) return { variant: 'excellent', text: 'Excellent', explanation: 'Your speech is clear with minimal filler words!' };
//       if (score >= 70) return { variant: 'good', text: 'Good', explanation: 'Your speech is mostly clear. Try reducing filler words.' };
//       return { variant: 'needs-work', text: 'Needs Work', explanation: 'Focus on reducing "um", "uh", and other filler words.' };
//     };

//     const getFillerRating = (count, total) => {
//       if (total === 0) return { variant: 'excellent', text: 'Excellent' };
//       const percentage = (count / total) * 100;
//       if (percentage < 5) return { variant: 'excellent', text: 'Excellent' };
//       if (percentage < 10) return { variant: 'good', text: 'Good' };
//       return { variant: 'needs-work', text: 'High' };
//     };

//     const getPaceRating = (rate) => {
//       if (rate >= 120 && rate <= 150) return { variant: 'excellent', text: 'Perfect', explanation: 'Your speaking pace is ideal for engagement.' };
//       if (rate >= 100 && rate < 120) return { variant: 'good', text: 'Good', explanation: 'Slightly slow. Try speaking a bit faster.' };
//       if (rate > 150) return { variant: 'good', text: 'Fast', explanation: 'Speaking quickly. Consider slowing down slightly.' };
//       return { variant: 'needs-work', text: 'Slow', explanation: 'Your pace is quite slow. Try speaking more energetically.' };
//     };
    
//     return {
//       totalWords,
//       fillerWordsCount,
//       pausesCount,
//       fluencyScore,
//       speakingRate,
//       fluencyRating: getFluencyRating(fluencyScore),
//       fillerRating: getFillerRating(fillerWordsCount, totalWords),
//       paceRating: getPaceRating(speakingRate)
//     };
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Unknown';
//     try {
//       return new Date(dateString).toLocaleString('en-US', {
//         year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
//       });
//     } catch {
//       return 'Invalid date';
//     }
//   };

//   // 3. Render Logic based on Auth and Loading States
//   if (!authChecked) {
//       return (
//           <DashboardContainer>
//                <Header><HeaderTitle>Dashboard</HeaderTitle></Header>
//                <LoadingMessage>
//                    <Spinner />
//                    <span>Checking authentication status...</span>
//                </LoadingMessage>
//           </DashboardContainer>
//       );
//   }
  
//   // Show spinner while fetching data after auth check is successful
//   if (isLoading && !dataLoaded) { 
//       return (
//           <DashboardContainer>
//                <Header><HeaderTitle>Dashboard</HeaderTitle></Header>
//                <LoadingMessage>
//                    <Spinner />
//                    <span>Loading your presentations...</span>
//                </LoadingMessage>
//           </DashboardContainer>
//       );
//   }
  
//   return (
//     <DashboardContainer>
//       <Header>
//         <HeaderTitle>Your Presentation Dashboard</HeaderTitle>
//         <HeaderSubtitle>
//           See how well you presented and get tips to improve your speaking skills
//         </HeaderSubtitle>
//       </Header>

//       <MainContent>
//         {error && ( // Display error if present
//           <ErrorMessage>
//             <h4>⚠️ Oops! Something Went Wrong</h4>
//             <p>We couldn't load your presentations: <strong>{error}</strong></p>
//             <p style={{ opacity: 0.8, marginTop: '1rem' }}>
//               Please ensure you are logged in, or try refreshing the page.
//             </p>
//           </ErrorMessage>
//         )}

//         {!error && ( // Only render data cards if no error
//           <>
//             {metadataList.length > 0 ? (
//               <div className="d-flex flex-column gap-5">
//                 {metadataList.map(item => {
//                   const analysis = analyzePerformance(item);

//                   return (
//                     <DataCard key={item.id}>
//                       <CardHeader>
//                         <CardTitle>🎥 {item.original_name || item.video_name || 'Untitled Presentation'}</CardTitle>
//                         <CardSubtitle>Uploaded on {formatDate(item.created_at)}</CardSubtitle>
//                         
//                         <ScoreSection>
//                           <ScoreCard variant={analysis.fluencyRating.variant}>
//                             <ScoreValue>{analysis.fluencyScore.toFixed(0)}%</ScoreValue>
//                             <ScoreLabel>Speech Clarity</ScoreLabel>
//                             <ScoreExplanation>{analysis.fluencyRating.explanation}</ScoreExplanation>
//                           </ScoreCard>
//                           
//                           <ScoreCard variant={analysis.paceRating.variant}>
//                             <ScoreValue>{analysis.speakingRate}</ScoreValue>
//                             <ScoreLabel>Words Per Minute</ScoreLabel>
//                             <ScoreExplanation>{analysis.paceRating.explanation}</ScoreExplanation>
//                           </ScoreCard>
//                           
//                           <ScoreCard variant={analysis.fillerRating.variant}>
//                             <ScoreValue>{analysis.fillerWordsCount}</ScoreValue>
//                             <ScoreLabel>Filler Words Used</ScoreLabel>
//                             <ScoreExplanation>
//                               {analysis.fillerRating.text === 'Excellent' && 'Great job avoiding filler words!'}
//                               {analysis.fillerRating.text === 'Good' && 'Keep working on reducing fillers.'}
//                               {analysis.fillerRating.text === 'High' && 'Try to pause instead of saying "um" or "uh".'}
//                             </ScoreExplanation>
//                           </ScoreCard>
//                         </ScoreSection>
//                       </CardHeader>

//                       <CardBody>
//                         <div>
//                           <SectionTitle>▶️ Watch Your Presentation</SectionTitle>
//                           <VideoPlayerContainer>
//                             {(item.video_url || item.public_url) ? (
//                               <StyledVideo controls src={item.video_url || item.public_url} />
//                             ) : (
//                               <div style={{
//                                 position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
//                                 display: 'flex', alignItems: 'center', justifyContent: 'center',
//                                 backgroundColor: 'rgba(255, 255, 255, 0.05)',
//                                 borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)'
//                               }}>
//                                 <span style={{ opacity: 0.7 }}>Video not available</span>
//                               </div>
//                             )}
//                           </VideoPlayerContainer>
//                         </div>

//                         <div>
//                           <SectionTitle>📊 Your Performance Breakdown</SectionTitle>
//                           
//                           <InfoBox>
//                             <InfoText>
//                               <strong>What do these numbers mean?</strong><br/>
//                               We analyzed your presentation to help you understand your speaking patterns and give you actionable tips for improvement.
//                             </InfoText>
//                           </InfoBox>

//                           <ContentBlock>
//                             <BlockTitle>📝 What You Said</BlockTitle>
//                             <BlockContent>
//                               {item.deepgram_transcript || item.elevenlabs_transcript || 'Your speech transcript will appear here after processing.'}
//                             </BlockContent>
//                             <Tip>
//                               <strong>Tip:</strong> Read through your transcript to spot repeated phrases or words you might want to avoid in future presentations.
//                             </Tip>
//                           </ContentBlock>

//                           {item.gemini_analysis && (
//                             <ContentBlock>
//                               <BlockTitle>🤖 AI Coach Feedback</BlockTitle>
//                               <BlockContent>{item.gemini_analysis}</BlockContent>
//                               <Tip>
//                                 <strong>Tip:</strong> This personalized feedback is based on analyzing your entire presentation. Focus on one improvement area at a time!
//                               </Tip>
//                             </ContentBlock>
//                           )}

//                           <ContentBlock>
//                             <BlockTitle>📈 Quick Stats</BlockTitle>
//                             <BlockContent style={{ display: 'grid', gap: '0.5rem' }}>
//                               <div>✅ <strong>Total Words Spoken:</strong> {analysis.totalWords}</div>
//                               <div>⚠️ <strong>Times You Used Fillers:</strong> {analysis.fillerWordsCount} 
//                                 {analysis.fillerWordsCount > 0 && <span style={{ fontSize: '0.9em', opacity: 0.8 }}> (Words like "um", "uh", "like")</span>}
//                               </div>
//                               <div>⏸️ <strong>Speech Pauses:</strong> {analysis.pausesCount} 
//                                 {analysis.pausesCount > 0 && <span style={{ fontSize: '0.9em', opacity: 0.8 }}> (Natural breaks in your speech)</span>}
//                               </div>
//                             </BlockContent>
//                           </ContentBlock>

//                           {item.frames && Array.isArray(item.frames) && item.frames.length > 0 && (
//                             <ContentBlock>
//                               <BlockTitle>🖼️ Snapshots from Your Presentation ({item.frames.length})</BlockTitle>
//                               <BlockContent>
//                                 <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
//                                   These are key moments we captured from your video. Click any image to view it larger.
//                                 </p>
//                                 <KeyframesGrid>
//                                   {item.frames.map((frame, index) => (
//                                     <a key={index} href={frame.frame_url || frame.url} target="_blank" rel="noopener noreferrer">
//                                       <FrameImage 
//                                         src={frame.frame_url || frame.url} 
//                                         alt={`Moment ${index + 1} from your presentation`} 
//                                         title={`Click to view full size - Moment ${index + 1}`}
//                                       />
//                                     </a>
//                                   ))}
//                                 </KeyframesGrid>
//                               </BlockContent>
//                             </ContentBlock>
//                           )}
//                         </div>
//                       </CardBody>
//                     </DataCard>
//                   );
//                 })}
//               </div>
//             ) : (
//              // Show empty state if authenticated and no data found
//               <PlaceholderCard>
//                 <PlaceholderEmoji>🎥</PlaceholderEmoji>
//                 <h4 style={{ color: '#fff', marginBottom: '1rem' }}>No Presentations Yet</h4>
//                 <p style={{ color: '#888', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
//                   Upload your first video presentation and we'll analyze your speaking skills, giving you personalized feedback to help you improve!
//                 </p>
//                 <PlaceholderButton href="/upload">
//                   📤 Upload Your First Presentation
//                 </PlaceholderButton>
//               </PlaceholderCard>
//             )}
//           </>
//         )}
//       </MainContent>
//     </DashboardContainer>
//   );
// }

// export default Dashboard;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

// Mock functions - replace with your actual implementations
const getCurrentUser = async () => ({ id: '123', email: 'user@example.com' });
const getAuthHeaders = async () => ({ Authorization: 'Bearer token' });

function Dashboard() {
  const navigate = useNavigate();
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [selectedFilter, setSelectedFilter] = useState('all');
  const [searchQuery, setSearchQuery] = useState('');

  const BACKEND_URL = 'https://voicebackend-20.onrender.com';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch (err) {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

  useEffect(() => {
    if (!authChecked) return;
    if (!user) {
      setError("You must be logged in to view your dashboard.");
      setIsLoading(false);
      setTimeout(() => navigate('/login'), 1500);
      return;
    }

    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        setError(null);
        const authHeaders = await getAuthHeaders();
        if (!authHeaders) {
          throw new Error("Session expired. Please log in again.");
        }

        const response = await fetch(`${BACKEND_URL}/api/metadata`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json',
            ...authHeaders 
          }
        });

        if (response.status === 401 || response.status === 403) {
          throw new Error("Access denied by the server. Your session is invalid.");
        }

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            errorMessage = await response.text() || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        if (Array.isArray(data)) {
          setMetadataList(data);
        } else if (data.success && Array.isArray(data.data)) {
          setMetadataList(data.data);
        } else {
          setMetadataList([]);
        }
      } catch (err) {
        if (err.message.includes("Session expired") || err.message.includes("Access denied")) {
          setError(`Authentication failed: ${err.message}. Redirecting to login...`);
          setTimeout(() => navigate('/login'), 2000);
        } else {
          setError(err.message);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [BACKEND_URL, authChecked, user, navigate]);

  const analyzePerformance = (item) => {
    let fillerWordsCount = 0;
    let pausesCount = 0;
    let wordsArray = [];

    if (item.deepgram_words) {
      if (Array.isArray(item.deepgram_words)) {
        wordsArray = item.deepgram_words;
      } else if (typeof item.deepgram_words === 'object' && item.deepgram_words.words) {
        wordsArray = item.deepgram_words.words;
      }
    }

    const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well', 'actually', 'basically'];
    fillerWordsCount = wordsArray.filter(word =>
      fillerWords.includes(word.word?.toLowerCase())
    ).length;

    if (item.deepgram_transcript) {
      const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
      if (pauses) pausesCount = pauses.length;
    }

    const totalWords = wordsArray.length;
    const fluencyScore = totalWords > 0 ? ((totalWords - fillerWordsCount) / totalWords) * 100 : 100;
    const speakingRate = totalWords > 0 ? Math.round(totalWords / 2) : 0;

    return {
      totalWords,
      fillerWordsCount,
      pausesCount,
      fluencyScore: Math.round(fluencyScore),
      speakingRate
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleDateString('en-US', {
        year: 'numeric',
        month: 'long',
        day: 'numeric'
      });
    } catch {
      return 'Invalid date';
    }
  };

  const getScoreColor = (score) => {
    if (score >= 90) return '#10b981';
    if (score >= 70) return '#f59e0b';
    return '#ef4444';
  };

  const filteredData = metadataList.filter(item => {
    const matchesSearch = searchQuery === '' || 
      (item.original_name || item.video_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    
    if (selectedFilter === 'all') return matchesSearch;
    if (selectedFilter === 'recent') {
      const daysSince = (Date.now() - new Date(item.created_at)) / (1000 * 60 * 60 * 24);
      return matchesSearch && daysSince <= 7;
    }
    return matchesSearch;
  });

  if (!authChecked || isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex items-center justify-center">
        <div className="text-center">
          <div className="inline-block w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
          <p className="text-slate-300 text-lg">Loading your presentations...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header Section */}
      <div className="bg-slate-900/50 backdrop-blur-sm border-b border-slate-700/50 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Presentation Analytics</h1>
              <p className="text-slate-400">Track your performance and improve your speaking skills</p>
            </div>
            
            {user && (
              <div className="flex items-center gap-3 bg-slate-800/50 px-4 py-2 rounded-lg border border-slate-700/50">
                <div className="w-10 h-10 bg-blue-500 rounded-full flex items-center justify-center text-white font-semibold">
                  {user.email?.[0]?.toUpperCase() || 'U'}
                </div>
                <div>
                  <p className="text-sm font-medium text-white">{user.email}</p>
                  <p className="text-xs text-slate-400">Professional Account</p>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {error && (
          <div className="mb-6 bg-red-500/10 border border-red-500/50 rounded-lg p-4">
            <div className="flex items-start gap-3">
              <svg className="w-6 h-6 text-red-500 flex-shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <div>
                <h3 className="text-red-400 font-semibold mb-1">Error Loading Data</h3>
                <p className="text-red-300 text-sm">{error}</p>
              </div>
            </div>
          </div>
        )}

        {!error && (
          <>
            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Total Presentations</span>
                  <svg className="w-5 h-5 text-blue-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">{metadataList.length}</p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Avg. Fluency Score</span>
                  <svg className="w-5 h-5 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">
                  {metadataList.length > 0
                    ? Math.round(metadataList.reduce((acc, item) => acc + analyzePerformance(item).fluencyScore, 0) / metadataList.length)
                    : 0}%
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">Total Words</span>
                  <svg className="w-5 h-5 text-purple-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h4m1 8l-4-4H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-3l-4 4z" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">
                  {metadataList.reduce((acc, item) => acc + analyzePerformance(item).totalWords, 0).toLocaleString()}
                </p>
              </div>

              <div className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-slate-400 text-sm font-medium">This Week</span>
                  <svg className="w-5 h-5 text-orange-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7h8m0 0v8m0-8l-8 8-4-4-6 6" />
                  </svg>
                </div>
                <p className="text-3xl font-bold text-white">
                  {metadataList.filter(item => {
                    const daysSince = (Date.now() - new Date(item.created_at)) / (1000 * 60 * 60 * 24);
                    return daysSince <= 7;
                  }).length}
                </p>
              </div>
            </div>

            {/* Filters and Search */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
              <div className="flex-1">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search presentations..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full bg-slate-800/50 border border-slate-700/50 rounded-lg px-4 py-3 pl-11 text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  />
                  <svg className="w-5 h-5 text-slate-400 absolute left-3 top-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => setSelectedFilter('all')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedFilter === 'all'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50'
                  }`}
                >
                  All
                </button>
                <button
                  onClick={() => setSelectedFilter('recent')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all ${
                    selectedFilter === 'recent'
                      ? 'bg-blue-500 text-white'
                      : 'bg-slate-800/50 text-slate-300 border border-slate-700/50 hover:bg-slate-700/50'
                  }`}
                >
                  Recent
                </button>
              </div>
            </div>

            {/* Presentations Grid */}
            {filteredData.length > 0 ? (
              <div className="grid grid-cols-1 gap-6">
                {filteredData.map(item => {
                  const analysis = analyzePerformance(item);
                  return (
                    <div key={item.id} className="bg-slate-800/50 backdrop-blur-sm border border-slate-700/50 rounded-xl overflow-hidden hover:border-slate-600/50 transition-all">
                      <div className="p-6">
                        <div className="flex flex-col lg:flex-row gap-6">
                          {/* Video Section */}
                          <div className="lg:w-1/3">
                            <div className="aspect-video bg-slate-900 rounded-lg overflow-hidden mb-4">
                              {(item.video_url || item.public_url) ? (
                                <video
                                  controls
                                  src={item.video_url || item.public_url}
                                  className="w-full h-full object-cover"
                                />
                              ) : (
                                <div className="w-full h-full flex items-center justify-center text-slate-500">
                                  <svg className="w-12 h-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                                  </svg>
                                </div>
                              )}
                            </div>
                            <h3 className="text-xl font-semibold text-white mb-1">
                              {item.original_name || item.video_name || 'Untitled Presentation'}
                            </h3>
                            <p className="text-slate-400 text-sm">{formatDate(item.created_at)}</p>
                          </div>

                          {/* Metrics Section */}
                          <div className="lg:w-2/3">
                            <div className="grid grid-cols-3 gap-4 mb-6">
                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-400 text-sm">Fluency</span>
                                  <div className="w-2 h-2 rounded-full" style={{ backgroundColor: getScoreColor(analysis.fluencyScore) }}></div>
                                </div>
                                <p className="text-2xl font-bold text-white">{analysis.fluencyScore}%</p>
                              </div>

                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-400 text-sm">WPM</span>
                                  <svg className="w-4 h-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                                  </svg>
                                </div>
                                <p className="text-2xl font-bold text-white">{analysis.speakingRate}</p>
                              </div>

                              <div className="bg-slate-900/50 rounded-lg p-4 border border-slate-700/30">
                                <div className="flex items-center justify-between mb-2">
                                  <span className="text-slate-400 text-sm">Fillers</span>
                                  <svg className="w-4 h-4 text-orange-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                                  </svg>
                                </div>
                                <p className="text-2xl font-bold text-white">{analysis.fillerWordsCount}</p>
                              </div>
                            </div>

                            {/* Transcript Section */}
                            {(item.deepgram_transcript || item.elevenlabs_transcript) && (
                              <div className="bg-slate-900/30 rounded-lg p-4 border border-slate-700/30">
                                <h4 className="text-sm font-semibold text-slate-300 mb-2 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                                  </svg>
                                  Transcript
                                </h4>
                                <p className="text-slate-400 text-sm line-clamp-3">
                                  {item.deepgram_transcript || item.elevenlabs_transcript}
                                </p>
                              </div>
                            )}

                            {/* AI Analysis */}
                            {item.gemini_analysis && (
                              <div className="bg-gradient-to-r from-blue-500/10 to-purple-500/10 rounded-lg p-4 border border-blue-500/20 mt-4">
                                <h4 className="text-sm font-semibold text-blue-300 mb-2 flex items-center gap-2">
                                  <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                                  </svg>
                                  AI Insights
                                </h4>
                                <p className="text-slate-300 text-sm">{item.gemini_analysis}</p>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            ) : (
              <div className="text-center py-16">
                <div className="inline-flex items-center justify-center w-20 h-20 bg-slate-800 rounded-full mb-6">
                  <svg className="w-10 h-10 text-slate-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 10l4.553-2.276A1 1 0 0121 8.618v6.764a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                  </svg>
                </div>
                <h3 className="text-2xl font-bold text-white mb-2">No Presentations Yet</h3>
                <p className="text-slate-400 mb-6 max-w-md mx-auto">
                  Upload your first presentation to get detailed analytics and AI-powered feedback on your speaking performance.
                </p>
                <button
                  onClick={() => navigate('/upload')}
                  className="inline-flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white font-medium px-6 py-3 rounded-lg transition-colors"
                >
                  <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                  </svg>
                  Upload First Presentation
                </button>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}

export default Dashboard;