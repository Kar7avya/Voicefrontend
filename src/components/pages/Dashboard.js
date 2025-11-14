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

// dashboard.js - SOPHISTICATED DESIGN VERSION

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getAuthHeaders, getCurrentUser } from './supabaseClient'; 
import { useNavigate } from 'react-router-dom';

// ============================================
// KEYFRAMES
// ============================================
const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const shimmer = keyframes`
  0% { transform: translateX(-100%); }
  100% { transform: translateX(100%); }
`;

// ============================================
// STYLED COMPONENTS
// ============================================
const DashboardContainer = styled.div`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
  color: #e2e8f0;
  font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
  animation: ${fadeIn} 0.6s ease-out;
`;

const Header = styled.header`
  background: rgba(15, 23, 42, 0.8);
  backdrop-filter: blur(20px);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
  position: sticky;
  top: 0;
  z-index: 100;
  box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
  padding: 2rem 0;
`;

const HeaderContent = styled.div`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem;
`;

const HeaderTitle = styled.h1`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin: 0 0 0.5rem 0;
  letter-spacing: -0.025em;
  background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
  -webkit-background-clip: text;
  -webkit-text-fill-color: transparent;
  background-clip: text;
`;

const HeaderSubtitle = styled.p`
  font-size: 1rem;
  color: #94a3b8;
  margin: 0;
  font-weight: 400;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 3rem 2rem;

  @media (max-width: 768px) {
    padding: 1.5rem 1rem;
  }
`;

const DataCard = styled.div`
  background: rgba(30, 41, 59, 0.4);
  backdrop-filter: blur(10px);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 20px;
  overflow: hidden;
  margin-bottom: 2rem;
  transition: all 0.3s ease;
  animation: ${fadeIn} 0.6s ease-out;

  &:hover {
    border-color: rgba(59, 130, 246, 0.3);
    box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
    transform: translateY(-2px);
  }
`;

const CardHeader = styled.div`
  padding: 2rem;
  background: rgba(15, 23, 42, 0.5);
  border-bottom: 1px solid rgba(148, 163, 184, 0.1);
`;

const CardTitle = styled.h3`
  font-size: 1.75rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 0.75rem 0;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const CardSubtitle = styled.p`
  font-size: 0.95rem;
  color: #94a3b8;
  margin: 0 0 2rem 0;
  font-weight: 400;
`;

const ScoreSection = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
  gap: 1.5rem;
  margin-top: 2rem;

  @media (max-width: 768px) {
    grid-template-columns: 1fr;
  }
`;

const ScoreCard = styled.div`
  background: ${props => {
    if (props.variant === 'excellent') return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)';
    if (props.variant === 'good') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)';
    return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)';
  }};
  border: 1px solid ${props => {
    if (props.variant === 'excellent') return 'rgba(16, 185, 129, 0.3)';
    if (props.variant === 'good') return 'rgba(245, 158, 11, 0.3)';
    return 'rgba(239, 68, 68, 0.3)';
  }};
  border-radius: 16px;
  padding: 1.75rem;
  text-align: center;
  transition: all 0.3s ease;
  position: relative;
  overflow: hidden;

  &:hover {
    transform: translateY(-4px);
    box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
  }

  &::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
    animation: ${shimmer} 3s infinite;
  }
`;

const ScoreValue = styled.div`
  font-size: 2.5rem;
  font-weight: 700;
  color: #ffffff;
  margin-bottom: 0.5rem;
  line-height: 1;
`;

const ScoreLabel = styled.div`
  font-size: 0.875rem;
  color: #cbd5e1;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: 0.75rem;
`;

const ScoreExplanation = styled.div`
  font-size: 0.8rem;
  color: #94a3b8;
  line-height: 1.4;
`;

const CardBody = styled.div`
  padding: 2rem;
  display: grid;
  grid-template-columns: 1fr 1.5fr;
  gap: 2rem;

  @media (max-width: 1024px) {
    grid-template-columns: 1fr;
  }
`;

const VideoPlayerContainer = styled.div`
  position: relative;
  width: 100%;
  padding-top: 56.25%;
  background: #0f172a;
  border-radius: 16px;
  overflow: hidden;
  box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
  border: 1px solid rgba(148, 163, 184, 0.1);
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  object-fit: cover;
  border-radius: 16px;
`;

const SectionTitle = styled.h5`
  font-size: 1.25rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1.5rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const InfoBox = styled.div`
  background: rgba(59, 130, 246, 0.1);
  border: 1px solid rgba(59, 130, 246, 0.2);
  border-radius: 12px;
  padding: 1.5rem;
  margin-bottom: 1.5rem;
`;

const InfoText = styled.p`
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.6;
  margin: 0;

  strong {
    color: #ffffff;
    font-weight: 600;
  }
`;

const ContentBlock = styled.div`
  background: rgba(15, 23, 42, 0.5);
  border: 1px solid rgba(148, 163, 184, 0.1);
  border-radius: 16px;
  padding: 1.75rem;
  margin-bottom: 1.5rem;
  transition: all 0.3s ease;

  &:hover {
    border-color: rgba(148, 163, 184, 0.2);
    box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
  }
`;

const BlockTitle = styled.h6`
  font-size: 1.1rem;
  font-weight: 600;
  color: #ffffff;
  margin: 0 0 1rem 0;
  display: flex;
  align-items: center;
  gap: 0.5rem;
`;

const BlockContent = styled.div`
  font-size: 0.95rem;
  color: #cbd5e1;
  line-height: 1.8;
  white-space: pre-wrap;
  word-wrap: break-word;

  strong {
    color: #ffffff;
    font-weight: 600;
  }
`;

const KeyframesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
  gap: 1rem;
  margin-top: 1rem;
`;

const FrameImage = styled.img`
  width: 100%;
  height: 120px;
  object-fit: cover;
  border-radius: 12px;
  border: 1px solid rgba(148, 163, 184, 0.1);
  transition: all 0.3s ease;
  cursor: pointer;

  &:hover {
    transform: scale(1.05);
    box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
    border-color: rgba(59, 130, 246, 0.5);
  }
`;

const LoadingMessage = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  min-height: calc(100vh - 200px);
  text-align: center;
  padding: 3rem 2rem;

  span {
    font-size: 1.125rem;
    color: #cbd5e1;
    margin-top: 1rem;
  }
`;

const Spinner = styled.div`
  width: 64px;
  height: 64px;
  border: 4px solid rgba(59, 130, 246, 0.2);
  border-top-color: #3b82f6;
  border-radius: 50%;
  animation: ${spin} 1s linear infinite;
`;

const ErrorMessage = styled.div`
  background: rgba(239, 68, 68, 0.1);
  border: 1px solid rgba(239, 68, 68, 0.3);
  border-radius: 16px;
  padding: 2rem;
  margin-bottom: 2rem;
  animation: ${fadeIn} 0.6s ease-out;

  h4 {
    color: #fca5a5;
    font-size: 1.5rem;
    font-weight: 600;
    margin: 0 0 1rem 0;
  }

  p {
    color: #fecaca;
    margin: 0.5rem 0;
    font-size: 1rem;
    line-height: 1.6;

    strong {
      color: #ffffff;
      font-weight: 600;
    }
  }
`;

const PlaceholderCard = styled(DataCard)`
  text-align: center;
  padding: 4rem 2rem;
`;

const PlaceholderEmoji = styled.div`
  font-size: 5rem;
  margin-bottom: 1.5rem;
  opacity: 0.5;
`;

const PlaceholderButton = styled.a`
  display: inline-flex;
  align-items: center;
  gap: 0.75rem;
  background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
  color: white;
  font-weight: 600;
  font-size: 1.1rem;
  padding: 1rem 2.5rem;
  border-radius: 12px;
  text-decoration: none;
  transition: all 0.3s ease;
  box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
    background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
  }
`;

const Tip = styled.div`
  margin-top: 1rem;
  padding: 1rem;
  background: rgba(139, 92, 246, 0.1);
  border-left: 3px solid #8b5cf6;
  border-radius: 8px;
  font-size: 0.9rem;
  color: #cbd5e1;
  line-height: 1.6;

  strong {
    color: #a78bfa;
    font-weight: 600;
  }
`;

// ============================================
// COMPONENT
// ============================================
function Dashboard() {
  const navigate = useNavigate();
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); 
  const [authChecked, setAuthChecked] = useState(false); 
  const [dataLoaded, setDataLoaded] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-20.onrender.com';

  // 1. Check Authentication on Mount
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

  // 2. Fetch Metadata only when auth is confirmed and user is present
  useEffect(() => {
    if (!authChecked || dataLoaded) return;

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
        } else if (data.data && Array.isArray(data.data)) {
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
        setDataLoaded(true);
      }
    };

    fetchMetadata();
  }, [BACKEND_URL, authChecked, user, dataLoaded, navigate]); 

  const analyzePerformance = (item) => {
    let fillerWordsCount = 0;
    let pausesCount = 0;
    let wordsArray = [];
    let videoDuration = 0; // in seconds
    
    // Extract words array from deepgram_words
    if (item.deepgram_words) {
      if (Array.isArray(item.deepgram_words)) {
        wordsArray = item.deepgram_words;
      } else if (typeof item.deepgram_words === 'object' && item.deepgram_words.words) {
        wordsArray = item.deepgram_words.words;
      } else if (typeof item.deepgram_words === 'object' && Array.isArray(item.deepgram_words)) {
        wordsArray = item.deepgram_words;
      }
    }
    
    // Calculate video duration from words (if available)
    if (wordsArray.length > 0) {
      const lastWord = wordsArray[wordsArray.length - 1];
      videoDuration = lastWord.end || lastWord.start || 0;
    }
    
    // Expanded filler words list
    const fillerWords = [
      'uh', 'um', 'uhm', 'er', 'ah',
      'like', 'you know', 'y\'know', 'you know what',
      'so', 'and', 'but', 'well', 'actually', 'basically',
      'kind of', 'sort of', 'kinda', 'sorta',
      'right', 'okay', 'ok', 'alright',
      'i mean', 'i guess', 'i think',
      'you see', 'see', 'look'
    ];
    
    // Count filler words - check multiple word properties
    // Deepgram words structure: { word: "hello", start: 0.5, end: 0.8, ... }
    fillerWordsCount = wordsArray.filter(word => {
      // Try different possible property names for the word text
      const wordText = (
        word.word || 
        word.punctuated_word || 
        word.text || 
        (typeof word === 'string' ? word : '')
      ).toLowerCase().trim();
      
      if (!wordText) return false;
      
      // Remove punctuation for better matching
      const cleanWord = wordText.replace(/[.,!?;:]/g, '');
      
      // Check exact matches first
      if (fillerWords.includes(cleanWord)) return true;
      
      // Check if word contains filler (for compound fillers like "you know")
      // But only for multi-word fillers to avoid false positives
      const multiWordFillers = ['you know', 'you know what', 'i mean', 'i guess', 'i think', 'kind of', 'sort of'];
      return multiWordFillers.some(filler => cleanWord.includes(filler));
    }).length;
    
    // Count pauses from transcript
    if (item.deepgram_transcript) {
      const pauses = item.deepgram_transcript.match(/\[PAUSE:[^\]]+\]/g);
      if (pauses) {
        pausesCount = pauses.length;
      }
    }
    
    // Calculate total words (exclude pause markers from transcript if counting from transcript)
    const totalWords = wordsArray.length;
    
    // Calculate fluency score (percentage of non-filler words)
    const fluencyScore = totalWords > 0 
      ? Math.round(((totalWords - fillerWordsCount) / totalWords) * 100) 
      : 0;
    
    // Calculate speaking rate (Words Per Minute)
    // WPM = (total words / duration in minutes)
    let speakingRate = 0;
    if (totalWords > 0 && videoDuration > 0) {
      const durationInMinutes = videoDuration / 60;
      speakingRate = Math.round(totalWords / durationInMinutes);
    } else if (totalWords > 0) {
      // Fallback: If we have words but no duration, try to get duration from metadata
      // or use a conservative estimate (assume average speaking rate of 150 WPM)
      // This is just a placeholder - ideally we should have video duration
      if (item.video_duration) {
        const durationInMinutes = item.video_duration / 60;
        speakingRate = Math.round(totalWords / durationInMinutes);
      } else {
        // Can't calculate without duration - leave as 0
        speakingRate = 0;
      }
    } 

    const getFluencyRating = (score) => {
      if (score >= 90) return { variant: 'excellent', text: 'Excellent', explanation: 'Your speech is clear with minimal filler words!' };
      if (score >= 70) return { variant: 'good', text: 'Good', explanation: 'Your speech is mostly clear. Try reducing filler words.' };
      return { variant: 'needs-work', text: 'Needs Work', explanation: 'Focus on reducing "um", "uh", and other filler words.' };
    };

    const getFillerRating = (count, total) => {
      if (total === 0) return { variant: 'excellent', text: 'Excellent' };
      const percentage = (count / total) * 100;
      if (percentage < 5) return { variant: 'excellent', text: 'Excellent' };
      if (percentage < 10) return { variant: 'good', text: 'Good' };
      return { variant: 'needs-work', text: 'High' };
    };

    const getPaceRating = (rate) => {
      if (rate === 0) {
        return { variant: 'needs-work', text: 'N/A', explanation: 'Unable to calculate speaking rate. Video may be too short or no speech detected.' };
      }
      if (rate >= 120 && rate <= 180) return { variant: 'excellent', text: 'Perfect', explanation: 'Your speaking pace is ideal for engagement.' };
      if (rate >= 100 && rate < 120) return { variant: 'good', text: 'Good', explanation: 'Slightly slow. Try speaking a bit faster.' };
      if (rate > 180) return { variant: 'good', text: 'Fast', explanation: 'Speaking quickly. Consider slowing down slightly.' };
      return { variant: 'needs-work', text: 'Slow', explanation: 'Your pace is quite slow. Try speaking more energetically.' };
    };
    
    return {
      totalWords,
      fillerWordsCount,
      pausesCount,
      fluencyScore,
      speakingRate,
      fluencyRating: getFluencyRating(fluencyScore),
      fillerRating: getFillerRating(fillerWordsCount, totalWords),
      paceRating: getPaceRating(speakingRate)
    };
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Unknown';
    try {
      return new Date(dateString).toLocaleString('en-US', {
        year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
      });
    } catch {
      return 'Invalid date';
    }
  };

  // 3. Render Logic based on Auth and Loading States
  if (!authChecked) {
    return (
      <DashboardContainer>
        <Header>
          <HeaderContent>
            <HeaderTitle>Dashboard</HeaderTitle>
          </HeaderContent>
        </Header>
        <LoadingMessage>
          <Spinner />
          <span>Checking authentication status...</span>
        </LoadingMessage>
      </DashboardContainer>
    );
  }
  
  if (isLoading && !dataLoaded) { 
    return (
      <DashboardContainer>
        <Header>
          <HeaderContent>
            <HeaderTitle>Dashboard</HeaderTitle>
          </HeaderContent>
        </Header>
        <LoadingMessage>
          <Spinner />
          <span>Loading your presentations...</span>
        </LoadingMessage>
      </DashboardContainer>
    );
  }
  
  return (
    <DashboardContainer>
      <Header>
        <HeaderContent>
          <HeaderTitle>Your Presentation Dashboard</HeaderTitle>
          <HeaderSubtitle>
            See how well you presented and get tips to improve your speaking skills
          </HeaderSubtitle>
        </HeaderContent>
      </Header>

      <MainContent>
        {error && (
          <ErrorMessage>
            <h4>⚠️ Oops! Something Went Wrong</h4>
            <p>We couldn't load your presentations: <strong>{error}</strong></p>
            <p style={{ opacity: 0.8, marginTop: '1rem' }}>
              Please ensure you are logged in, or try refreshing the page.
            </p>
          </ErrorMessage>
        )}

        {!error && (
          <>
            {metadataList.length > 0 ? (
              metadataList.map(item => {
                const analysis = analyzePerformance(item);

                return (
                  <DataCard key={item.id}>
                    <CardHeader>
                      <CardTitle>🎥 {item.original_name || item.video_name || 'Untitled Presentation'}</CardTitle>
                      <CardSubtitle>Uploaded on {formatDate(item.created_at)}</CardSubtitle>
                      
                      <ScoreSection>
                        <ScoreCard variant={analysis.fluencyRating.variant}>
                          <ScoreValue>{analysis.fluencyScore.toFixed(0)}%</ScoreValue>
                          <ScoreLabel>Speech Clarity</ScoreLabel>
                          <ScoreExplanation>{analysis.fluencyRating.explanation}</ScoreExplanation>
                        </ScoreCard>
                        
                        <ScoreCard variant={analysis.paceRating.variant}>
                          <ScoreValue>{analysis.speakingRate > 0 ? analysis.speakingRate : 'N/A'}</ScoreValue>
                          <ScoreLabel>Words Per Minute</ScoreLabel>
                          <ScoreExplanation>{analysis.paceRating.explanation}</ScoreExplanation>
                        </ScoreCard>
                        
                        <ScoreCard variant={analysis.fillerRating.variant}>
                          <ScoreValue>{analysis.fillerWordsCount}</ScoreValue>
                          <ScoreLabel>Filler Words Used</ScoreLabel>
                          <ScoreExplanation>
                            {analysis.fillerRating.text === 'Excellent' && 'Great job avoiding filler words!'}
                            {analysis.fillerRating.text === 'Good' && 'Keep working on reducing fillers.'}
                            {analysis.fillerRating.text === 'High' && 'Try to pause instead of saying "um" or "uh".'}
                          </ScoreExplanation>
                        </ScoreCard>
                      </ScoreSection>
                    </CardHeader>

                    <CardBody>
                      <div>
                        <SectionTitle>▶️ Watch Your Presentation</SectionTitle>
                        <VideoPlayerContainer>
                          {(item.video_url || item.public_url) ? (
                            <StyledVideo controls src={item.video_url || item.public_url} />
                          ) : (
                            <div style={{
                              position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
                              display: 'flex', alignItems: 'center', justifyContent: 'center',
                              color: '#64748b', fontSize: '1rem'
                            }}>
                              Video not available
                            </div>
                          )}
                        </VideoPlayerContainer>
                      </div>

                      <div>
                        <SectionTitle>📊 Your Performance Breakdown</SectionTitle>
                        
                        <InfoBox>
                          <InfoText>
                            <strong>What do these numbers mean?</strong><br/>
                            We analyzed your presentation to help you understand your speaking patterns and give you actionable tips for improvement.
                          </InfoText>
                        </InfoBox>

                        <ContentBlock>
                          <BlockTitle>📝 What You Said</BlockTitle>
                          <BlockContent>
                            {item.deepgram_transcript || item.elevenlabs_transcript || 'Your speech transcript will appear here after processing.'}
                          </BlockContent>
                          <Tip>
                            <strong>Tip:</strong> Read through your transcript to spot repeated phrases or words you might want to avoid in future presentations.
                          </Tip>
                        </ContentBlock>

                        {item.gemini_analysis && (
                          <ContentBlock>
                            <BlockTitle>🤖 AI Coach Feedback</BlockTitle>
                            <BlockContent>{item.gemini_analysis}</BlockContent>
                            <Tip>
                              <strong>Tip:</strong> This personalized feedback is based on analyzing your entire presentation. Focus on one improvement area at a time!
                            </Tip>
                          </ContentBlock>
                        )}

                        <ContentBlock>
                          <BlockTitle>📈 Quick Stats</BlockTitle>
                          <BlockContent style={{ display: 'grid', gap: '0.75rem' }}>
                            <div>✅ <strong>Total Words Spoken:</strong> {analysis.totalWords || 0}</div>
                            <div>⚠️ <strong>Filler Words Used:</strong> {analysis.fillerWordsCount || 0} 
                              {analysis.fillerWordsCount > 0 && (
                                <span style={{ fontSize: '0.85em', opacity: 0.7 }}> 
                                  ({((analysis.fillerWordsCount / analysis.totalWords) * 100).toFixed(1)}% of total words)
                                </span>
                              )}
                              {analysis.fillerWordsCount === 0 && analysis.totalWords > 0 && (
                                <span style={{ fontSize: '0.85em', opacity: 0.7, color: '#4ade80' }}> 
                                  (Excellent! No filler words detected)
                                </span>
                              )}
                            </div>
                            <div>⏸️ <strong>Speech Pauses:</strong> {analysis.pausesCount || 0} 
                              {analysis.pausesCount > 0 && (
                                <span style={{ fontSize: '0.85em', opacity: 0.7 }}> 
                                  (Natural breaks in your speech)
                                </span>
                              )}
                              {analysis.pausesCount === 0 && analysis.totalWords > 0 && (
                                <span style={{ fontSize: '0.85em', opacity: 0.7 }}> 
                                  (Smooth, continuous speech)
                                </span>
                              )}
                            </div>
                            {analysis.speakingRate > 0 && (
                              <div>📊 <strong>Speaking Rate:</strong> {analysis.speakingRate} words per minute</div>
                            )}
                            {analysis.totalWords === 0 && (
                              <div style={{ color: '#fbbf24', fontSize: '0.9rem', fontStyle: 'italic' }}>
                                ⚠️ No words detected. The video may not contain speech or transcription is still processing.
                              </div>
                            )}
                          </BlockContent>
                        </ContentBlock>

                        {item.frames && Array.isArray(item.frames) && item.frames.length > 0 && (
                          <ContentBlock>
                            <BlockTitle>🖼️ Snapshots from Your Presentation ({item.frames.length})</BlockTitle>
                            <BlockContent>
                              <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
                                These are key moments we captured from your video. Click any image to view it larger.
                              </p>
                              <KeyframesGrid>
                                {item.frames.map((frame, index) => (
                                  <a key={index} href={frame.frame_url || frame.url} target="_blank" rel="noopener noreferrer">
                                    <FrameImage 
                                      src={frame.frame_url || frame.url} 
                                      alt={`Moment ${index + 1} from your presentation`} 
                                      title={`Click to view full size - Moment ${index + 1}`}
                                    />
                                  </a>
                                ))}
                              </KeyframesGrid>
                            </BlockContent>
                          </ContentBlock>
                        )}
                      </div>
                    </CardBody>
                  </DataCard>
                );
              })
            ) : (
              <PlaceholderCard>
                <PlaceholderEmoji>🎥</PlaceholderEmoji>
                <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: '600' }}>
                  No Presentations Yet
                </h4>
                <p style={{ color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
                  Upload your first video presentation and we'll analyze your speaking skills, giving you personalized feedback to help you improve!
                </p>
                <PlaceholderButton href="/upload">
                  📤 Upload Your First Presentation
                </PlaceholderButton>
              </PlaceholderCard>
            )}
          </>
        )}
      </MainContent>
    </DashboardContainer>
  );
}

export default Dashboard;