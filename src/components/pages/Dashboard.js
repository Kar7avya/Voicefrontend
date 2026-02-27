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

// import React, { useState, useEffect, useMemo } from 'react';
// import styled, { keyframes } from 'styled-components';
// import { getAuthHeaders, getCurrentUser } from './supabaseClient';
// import { useNavigate } from 'react-router-dom';
// import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid } from 'recharts';

// // ============================================
// // KEYFRAMES
// // ============================================
// const fadeIn = keyframes`
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

// const spin = keyframes`
//   from { transform: rotate(0deg); }
//   to { transform: rotate(360deg); }
// `;

// const shimmer = keyframes`
//   0% { transform: translateX(-100%); }
//   100% { transform: translateX(100%); }
// `;

// // ============================================
// // STYLED COMPONENTS
// // ============================================
// const DashboardContainer = styled.div`
//   min-height: 100vh;
//   background: linear-gradient(135deg, #0f172a 0%, #1e293b 50%, #0f172a 100%);
//   color: #e2e8f0;
//   font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
//   animation: ${fadeIn} 0.6s ease-out;
// `;

// const Header = styled.header`
//   background: rgba(15, 23, 42, 0.8);
//   backdrop-filter: blur(20px);
//   border-bottom: 1px solid rgba(148, 163, 184, 0.1);
//   position: sticky;
//   top: 0;
//   z-index: 100;
//   box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);
//   padding: 2rem 0;
// `;

// const HeaderContent = styled.div`
//   max-width: 1400px;
//   margin: 0 auto;
//   padding: 0 2rem;
// `;

// const HeaderTitle = styled.h1`
//   font-size: 2.5rem;
//   font-weight: 700;
//   color: #ffffff;
//   margin: 0 0 0.5rem 0;
//   letter-spacing: -0.025em;
//   background: linear-gradient(135deg, #ffffff 0%, #94a3b8 100%);
//   -webkit-background-clip: text;
//   -webkit-text-fill-color: transparent;
//   background-clip: text;
// `;

// const HeaderSubtitle = styled.p`
//   font-size: 1rem;
//   color: #94a3b8;
//   margin: 0;
//   font-weight: 400;
// `;

// const MainContent = styled.main`
//   max-width: 1400px;
//   margin: 0 auto;
//   padding: 3rem 2rem;

//   @media (max-width: 768px) {
//     padding: 1.5rem 1rem;
//   }
// `;

// const DataCard = styled.div`
//   background: rgba(30, 41, 59, 0.4);
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(148, 163, 184, 0.1);
//   border-radius: 20px;
//   overflow: hidden;
//   margin-bottom: 2rem;
//   transition: all 0.3s ease;
//   animation: ${fadeIn} 0.6s ease-out;

//   &:hover {
//     border-color: rgba(59, 130, 246, 0.3);
//     box-shadow: 0 20px 40px rgba(0, 0, 0, 0.3);
//     transform: translateY(-2px);
//   }
// `;

// const CardHeader = styled.div`
//   padding: 2rem;
//   background: rgba(15, 23, 42, 0.5);
//   border-bottom: 1px solid rgba(148, 163, 184, 0.1);
// `;

// const CardTitle = styled.h3`
//   font-size: 1.75rem;
//   font-weight: 600;
//   color: #ffffff;
//   margin: 0 0 0.75rem 0;
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
// `;

// const CardSubtitle = styled.p`
//   font-size: 0.95rem;
//   color: #94a3b8;
//   margin: 0 0 2rem 0;
//   font-weight: 400;
// `;

// const ScoreSection = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
//   gap: 1.5rem;
//   margin-top: 2rem;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }
// `;

// const ScoreCard = styled.div`
//   background: ${props => {
//     if (props.variant === 'excellent') return 'linear-gradient(135deg, rgba(16, 185, 129, 0.15) 0%, rgba(5, 150, 105, 0.1) 100%)';
//     if (props.variant === 'good') return 'linear-gradient(135deg, rgba(245, 158, 11, 0.15) 0%, rgba(217, 119, 6, 0.1) 100%)';
//     return 'linear-gradient(135deg, rgba(239, 68, 68, 0.15) 0%, rgba(220, 38, 38, 0.1) 100%)';
//   }};
//   border: 1px solid ${props => {
//     if (props.variant === 'excellent') return 'rgba(16, 185, 129, 0.3)';
//     if (props.variant === 'good') return 'rgba(245, 158, 11, 0.3)';
//     return 'rgba(239, 68, 68, 0.3)';
//   }};
//   border-radius: 16px;
//   padding: 1.75rem;
//   text-align: center;
//   transition: all 0.3s ease;
//   position: relative;
//   overflow: hidden;

//   &:hover {
//     transform: translateY(-4px);
//     box-shadow: 0 12px 24px rgba(0, 0, 0, 0.2);
//   }

//   &::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: -100%;
//     width: 100%;
//     height: 100%;
//     background: linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.1), transparent);
//     animation: ${shimmer} 3s infinite;
//   }
// `;

// const ScoreValue = styled.div`
//   font-size: 2.5rem;
//   font-weight: 700;
//   color: #ffffff;
//   margin-bottom: 0.5rem;
//   line-height: 1;
// `;

// const ScoreLabel = styled.div`
//   font-size: 0.875rem;
//   color: #cbd5e1;
//   font-weight: 500;
//   text-transform: uppercase;
//   letter-spacing: 0.05em;
//   margin-bottom: 0.75rem;
// `;

// const ScoreExplanation = styled.div`
//   font-size: 0.8rem;
//   color: #94a3b8;
//   line-height: 1.4;
// `;

// const CardBody = styled.div`
//   padding: 2rem;
//   display: grid;
//   grid-template-columns: 1fr 1.5fr;
//   gap: 2rem;

//   @media (max-width: 1024px) {
//     grid-template-columns: 1fr;
//   }
// `;

// const VideoPlayerContainer = styled.div`
//   position: relative;
//   width: 100%;
//   padding-top: 56.25%;
//   background: #0f172a;
//   border-radius: 16px;
//   overflow: hidden;
//   box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
//   border: 1px solid rgba(148, 163, 184, 0.1);
// `;

// const StyledVideo = styled.video`
//   position: absolute;
//   top: 0;
//   left: 0;
//   width: 100%;
//   height: 100%;
//   object-fit: cover;
//   border-radius: 16px;
// `;

// const SectionTitle = styled.h5`
//   font-size: 1.25rem;
//   font-weight: 600;
//   color: #ffffff;
//   margin: 0 0 1.5rem 0;
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
// `;

// const InfoBox = styled.div`
//   background: rgba(59, 130, 246, 0.1);
//   border: 1px solid rgba(59, 130, 246, 0.2);
//   border-radius: 12px;
//   padding: 1.5rem;
//   margin-bottom: 1.5rem;
// `;

// const InfoText = styled.p`
//   font-size: 0.95rem;
//   color: #cbd5e1;
//   line-height: 1.6;
//   margin: 0;

//   strong {
//     color: #ffffff;
//     font-weight: 600;
//   }
// `;

// const ContentBlock = styled.div`
//   background: rgba(15, 23, 42, 0.5);
//   border: 1px solid rgba(148, 163, 184, 0.1);
//   border-radius: 16px;
//   padding: 1.75rem;
//   margin-bottom: 1.5rem;
//   transition: all 0.3s ease;

//   &:hover {
//     border-color: rgba(148, 163, 184, 0.2);
//     box-shadow: 0 4px 8px rgba(0, 0, 0, 0.2);
//   }
// `;

// const BlockTitle = styled.h6`
//   font-size: 1.1rem;
//   font-weight: 600;
//   color: #ffffff;
//   margin: 0 0 1rem 0;
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
// `;

// const BlockContent = styled.div`
//   font-size: 0.95rem;
//   color: #cbd5e1;
//   line-height: 1.8;
//   white-space: pre-wrap;
//   word-wrap: break-word;

//   strong {
//     color: #ffffff;
//     font-weight: 600;
//   }
// `;

// const KeyframesGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
//   gap: 1rem;
//   margin-top: 1rem;
// `;

// const FrameImage = styled.img`
//   width: 100%;
//   height: 120px;
//   object-fit: cover;
//   border-radius: 12px;
//   border: 1px solid rgba(148, 163, 184, 0.1);
//   transition: all 0.3s ease;
//   cursor: pointer;

//   &:hover {
//     transform: scale(1.05);
//     box-shadow: 0 8px 16px rgba(0, 0, 0, 0.3);
//     border-color: rgba(59, 130, 246, 0.5);
//   }
// `;

// const LoadingMessage = styled.div`
//   display: flex;
//   flex-direction: column;
//   align-items: center;
//   justify-content: center;
//   min-height: calc(100vh - 200px);
//   text-align: center;
//   padding: 3rem 2rem;

//   span {
//     font-size: 1.125rem;
//     color: #cbd5e1;
//     margin-top: 1rem;
//   }
// `;

// const Spinner = styled.div`
//   width: 64px;
//   height: 64px;
//   border: 4px solid rgba(59, 130, 246, 0.2);
//   border-top-color: #3b82f6;
//   border-radius: 50%;
//   animation: ${spin} 1s linear infinite;
// `;

// const ErrorMessage = styled.div`
//   background: rgba(239, 68, 68, 0.1);
//   border: 1px solid rgba(239, 68, 68, 0.3);
//   border-radius: 16px;
//   padding: 2rem;
//   margin-bottom: 2rem;
//   animation: ${fadeIn} 0.6s ease-out;

//   h4 {
//     color: #fca5a5;
//     font-size: 1.5rem;
//     font-weight: 600;
//     margin: 0 0 1rem 0;
//   }

//   p {
//     color: #fecaca;
//     margin: 0.5rem 0;
//     font-size: 1rem;
//     line-height: 1.6;

//     strong {
//       color: #ffffff;
//       font-weight: 600;
//     }
//   }
// `;

// const PlaceholderCard = styled(DataCard)`
//   text-align: center;
//   padding: 4rem 2rem;
// `;

// const PlaceholderEmoji = styled.div`
//   font-size: 5rem;
//   margin-bottom: 1.5rem;
//   opacity: 0.5;
// `;

// const PlaceholderButton = styled.a`
//   display: inline-flex;
//   align-items: center;
//   gap: 0.75rem;
//   background: linear-gradient(135deg, #3b82f6 0%, #2563eb 100%);
//   color: white;
//   font-weight: 600;
//   font-size: 1.1rem;
//   padding: 1rem 2.5rem;
//   border-radius: 12px;
//   text-decoration: none;
//   transition: all 0.3s ease;
//   box-shadow: 0 4px 12px rgba(59, 130, 246, 0.3);

//   &:hover {
//     transform: translateY(-2px);
//     box-shadow: 0 8px 20px rgba(59, 130, 246, 0.4);
//     background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%);
//   }
// `;

// const Tip = styled.div`
//   margin-top: 1rem;
//   padding: 1rem;
//   background: rgba(139, 92, 246, 0.1);
//   border-left: 3px solid #8b5cf6;
//   border-radius: 8px;
//   font-size: 0.9rem;
//   color: #cbd5e1;
//   line-height: 1.6;

//   strong {
//     color: #a78bfa;
//     font-weight: 600;
//   }
// `;

// // ============================================
// // PROGRESS OVERVIEW STYLED COMPONENTS
// // ============================================

// const ProgressOverviewCard = styled(DataCard)`
//   margin-bottom: 3rem;
//   background: rgba(30, 41, 59, 0.6);
//   border: 1px solid rgba(59, 130, 246, 0.15);
//   position: relative;
//   overflow: hidden;

//   &::before {
//     content: '';
//     position: absolute;
//     top: 0;
//     left: 0;
//     right: 0;
//     height: 3px;
//     background: linear-gradient(90deg, #3b82f6 0%, #8b5cf6 50%, #06b6d4 100%);
//   }
// `;

// const ProgressHeader = styled.div`
//   padding: 2rem 2rem 1rem;
//   border-bottom: 1px solid rgba(148, 163, 184, 0.08);
// `;

// const ProgressTitle = styled.h2`
//   font-size: 1.6rem;
//   font-weight: 700;
//   color: #ffffff;
//   margin: 0 0 0.25rem 0;
//   display: flex;
//   align-items: center;
//   gap: 0.75rem;
//   letter-spacing: -0.01em;
// `;

// const ProgressSubtitle = styled.p`
//   font-size: 0.9rem;
//   color: #94a3b8;
//   margin: 0;
// `;

// const KPIGrid = styled.div`
//   display: grid;
//   grid-template-columns: repeat(3, 1fr);
//   gap: 1.25rem;
//   padding: 1.5rem 2rem;

//   @media (max-width: 768px) {
//     grid-template-columns: 1fr;
//   }
// `;

// const KPICard = styled.div`
//   background: ${props => {
//     if (props.$positive) return 'linear-gradient(135deg, rgba(16, 185, 129, 0.12) 0%, rgba(5, 150, 105, 0.06) 100%)';
//     if (props.$negative) return 'linear-gradient(135deg, rgba(239, 68, 68, 0.12) 0%, rgba(220, 38, 38, 0.06) 100%)';
//     return 'linear-gradient(135deg, rgba(148, 163, 184, 0.1) 0%, rgba(100, 116, 139, 0.06) 100%)';
//   }};
//   border: 1px solid ${props => {
//     if (props.$positive) return 'rgba(16, 185, 129, 0.25)';
//     if (props.$negative) return 'rgba(239, 68, 68, 0.25)';
//     return 'rgba(148, 163, 184, 0.15)';
//   }};
//   border-radius: 14px;
//   padding: 1.5rem;
//   text-align: center;
//   transition: all 0.3s ease;

//   &:hover {
//     transform: translateY(-3px);
//     box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
//   }
// `;

// const KPIValue = styled.div`
//   font-size: 2rem;
//   font-weight: 700;
//   color: ${props => {
//     if (props.$positive) return '#34d399';
//     if (props.$negative) return '#f87171';
//     return '#e2e8f0';
//   }};
//   margin-bottom: 0.35rem;
//   line-height: 1.1;
// `;

// const KPILabel = styled.div`
//   font-size: 0.8rem;
//   color: #94a3b8;
//   font-weight: 500;
//   text-transform: uppercase;
//   letter-spacing: 0.06em;
// `;

// const ChartContainer = styled.div`
//   padding: 1rem 2rem 1.5rem;
//   border-top: 1px solid rgba(148, 163, 184, 0.08);
// `;

// const ChartTitle = styled.h4`
//   font-size: 1rem;
//   font-weight: 600;
//   color: #cbd5e1;
//   margin: 0 0 1rem 0;
//   display: flex;
//   align-items: center;
//   gap: 0.5rem;
// `;

// const InsightContainer = styled.div`
//   padding: 0 2rem 2rem;
// `;

// const InsightBox = styled.div`
//   background: rgba(139, 92, 246, 0.08);
//   border: 1px solid rgba(139, 92, 246, 0.2);
//   border-left: 4px solid #8b5cf6;
//   border-radius: 12px;
//   padding: 1.25rem 1.5rem;
//   font-size: 0.92rem;
//   color: #cbd5e1;
//   line-height: 1.7;

//   strong {
//     color: #a78bfa;
//   }
// `;

// const ProgressPlaceholder = styled.div`
//   text-align: center;
//   padding: 3rem 2rem;
//   color: #94a3b8;

//   p {
//     font-size: 1rem;
//     margin: 0;
//   }
// `;

// const ProgressPlaceholderEmoji = styled.div`
//   font-size: 3rem;
//   margin-bottom: 1rem;
//   opacity: 0.6;
// `;

// const CustomTooltipWrapper = styled.div`
//   background: rgba(15, 23, 42, 0.95);
//   backdrop-filter: blur(10px);
//   border: 1px solid rgba(148, 163, 184, 0.2);
//   border-radius: 10px;
//   padding: 0.75rem 1rem;
//   box-shadow: 0 8px 20px rgba(0, 0, 0, 0.3);

//   .tooltip-label {
//     font-size: 0.75rem;
//     color: #94a3b8;
//     margin-bottom: 0.25rem;
//   }

//   .tooltip-value {
//     font-size: 1rem;
//     font-weight: 600;
//     color: #3b82f6;
//   }
// `;

// // ============================================
// // COMPONENT
// // ============================================
// function Dashboard() {
//   const navigate = useNavigate();
//   const [metadataList, setMetadataList] = useState([]);
//   const [isLoading, setIsLoading] = useState(true);
//   const [error, setError] = useState(null);
//   const [user, setUser] = useState(null);
//   const [authChecked, setAuthChecked] = useState(false);
//   const [dataLoaded, setDataLoaded] = useState(false);

//   const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-20.onrender.com';

//   // 1. Check Authentication on Mount
//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const currentUser = await getCurrentUser();
//         setUser(currentUser);
//       } catch (err) {
//         setUser(null);
//       } finally {
//         setAuthChecked(true);
//       }
//     };
//     checkAuth();
//   }, []);

//   // 2. Fetch Metadata only when auth is confirmed and user is present
//   useEffect(() => {
//     if (!authChecked || dataLoaded) return;

//     if (!user) {
//       setError("You must be logged in to view your dashboard.");
//       setIsLoading(false);
//       setTimeout(() => navigate('/login'), 1500);
//       return;
//     }

//     const fetchMetadata = async () => {
//       try {
//         setIsLoading(true);
//         setError(null);

//         const authHeaders = await getAuthHeaders();

//         if (!authHeaders) {
//           throw new Error("Session expired. Please log in again.");
//         }

//         const response = await fetch(`${BACKEND_URL}/api/metadata`, {
//           method: 'GET',
//           headers: {
//             'Content-Type': 'application/json',
//             'Accept': 'application/json',
//             ...authHeaders
//           }
//         });

//         if (response.status === 401 || response.status === 403) {
//           throw new Error("Access denied by the server. Your session is invalid.");
//         }

//         if (!response.ok) {
//           let errorMessage = `HTTP ${response.status}`;
//           try {
//             const errorData = await response.json();
//             errorMessage = errorData.error || errorData.message || errorMessage;
//           } catch {
//             errorMessage = await response.text() || errorMessage;
//           }
//           throw new Error(errorMessage);
//         }

//         const data = await response.json();

//         if (Array.isArray(data)) {
//           setMetadataList(data);
//         } else if (data.success && Array.isArray(data.data)) {
//           setMetadataList(data.data);
//         } else if (data.data && Array.isArray(data.data)) {
//           setMetadataList(data.data);
//         } else {
//           setMetadataList([]);
//         }

//       } catch (err) {
//         if (err.message.includes("Session expired") || err.message.includes("Access denied")) {
//           setError(`Authentication failed: ${err.message}. Redirecting to login...`);
//           setTimeout(() => navigate('/login'), 2000);
//         } else {
//           setError(err.message);
//         }
//       } finally {
//         setIsLoading(false);
//         setDataLoaded(true);
//       }
//     };

//     fetchMetadata();
//   }, [BACKEND_URL, authChecked, user, dataLoaded, navigate]);

//   const analyzePerformance = (item) => {
//     let fillerWordsCount = 0;
//     let pausesCount = 0;
//     let wordsArray = [];
//     let videoDuration = 0; // in seconds

//     // Extract words array from deepgram_words
//     if (item.deepgram_words) {
//       if (Array.isArray(item.deepgram_words)) {
//         wordsArray = item.deepgram_words;
//       } else if (typeof item.deepgram_words === 'object' && item.deepgram_words.words) {
//         wordsArray = item.deepgram_words.words;
//       } else if (typeof item.deepgram_words === 'object' && Array.isArray(item.deepgram_words)) {
//         wordsArray = item.deepgram_words;
//       }
//     }

//     // Calculate video duration from words (if available)
//     if (wordsArray.length > 0) {
//       const lastWord = wordsArray[wordsArray.length - 1];
//       videoDuration = lastWord.end || lastWord.start || 0;
//     }

//     // Expanded filler words list
//     const fillerWords = [
//       'uh', 'um', 'uhm', 'er', 'ah',
//       'like', 'you know', 'y\'know', 'you know what',
//       'so', 'and', 'but', 'well', 'actually', 'basically',
//       'kind of', 'sort of', 'kinda', 'sorta',
//       'right', 'okay', 'ok', 'alright',
//       'i mean', 'i guess', 'i think',
//       'you see', 'see', 'look'
//     ];

//     // Count filler words - check multiple word properties
//     // Deepgram words structure: { word: "hello", start: 0.5, end: 0.8, ... }
//     fillerWordsCount = wordsArray.filter(word => {
//       // Try different possible property names for the word text
//       const wordText = (
//         word.word ||
//         word.punctuated_word ||
//         word.text ||
//         (typeof word === 'string' ? word : '')
//       ).toLowerCase().trim();

//       if (!wordText) return false;

//       // Remove punctuation for better matching
//       const cleanWord = wordText.replace(/[.,!?;:]/g, '');

//       // Check exact matches first
//       if (fillerWords.includes(cleanWord)) return true;

//       // Check if word contains filler (for compound fillers like "you know")
//       // But only for multi-word fillers to avoid false positives
//       const multiWordFillers = ['you know', 'you know what', 'i mean', 'i guess', 'i think', 'kind of', 'sort of'];
//       return multiWordFillers.some(filler => cleanWord.includes(filler));
//     }).length;

//     // Count pauses from transcript
//     if (item.deepgram_transcript) {
//       const pauses = item.deepgram_transcript.match(/\[PAUSE:[^\]]+\]/g);
//       if (pauses) {
//         pausesCount = pauses.length;
//       }
//     }

//     // Calculate total words (exclude pause markers from transcript if counting from transcript)
//     const totalWords = wordsArray.length;

//     // Calculate fluency score (percentage of non-filler words)
//     const fluencyScore = totalWords > 0
//       ? Math.round(((totalWords - fillerWordsCount) / totalWords) * 100)
//       : 0;

//     // Calculate speaking rate (Words Per Minute)
//     // WPM = (total words / duration in minutes)
//     let speakingRate = 0;
//     if (totalWords > 0 && videoDuration > 0) {
//       const durationInMinutes = videoDuration / 60;
//       speakingRate = Math.round(totalWords / durationInMinutes);
//     } else if (totalWords > 0) {
//       // Fallback: If we have words but no duration, try to get duration from metadata
//       // or use a conservative estimate (assume average speaking rate of 150 WPM)
//       // This is just a placeholder - ideally we should have video duration
//       if (item.video_duration) {
//         const durationInMinutes = item.video_duration / 60;
//         speakingRate = Math.round(totalWords / durationInMinutes);
//       } else {
//         // Can't calculate without duration - leave as 0
//         speakingRate = 0;
//       }
//     }

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
//       if (rate === 0) {
//         return { variant: 'needs-work', text: 'N/A', explanation: 'Unable to calculate speaking rate. Video may be too short or no speech detected.' };
//       }
//       if (rate >= 120 && rate <= 180) return { variant: 'excellent', text: 'Perfect', explanation: 'Your speaking pace is ideal for engagement.' };
//       if (rate >= 100 && rate < 120) return { variant: 'good', text: 'Good', explanation: 'Slightly slow. Try speaking a bit faster.' };
//       if (rate > 180) return { variant: 'good', text: 'Fast', explanation: 'Speaking quickly. Consider slowing down slightly.' };
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
//   };

//   const formatDate = (dateString) => {
//     if (!dateString) return 'Unknown';
//     try {
//       return new Date(dateString).toLocaleString('en-US', {
//         year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit'
//       });
//     } catch {
//       return 'Invalid date';
//     }
//   };

//   // ============================================
//   // SECTION: SORT DATA FOR TREND
//   // ============================================
//   const sortedMetadata = useMemo(() => {
//     if (!metadataList || metadataList.length === 0) return [];
//     return [...metadataList].sort((a, b) => {
//       const dateA = new Date(a.created_at || 0);
//       const dateB = new Date(b.created_at || 0);
//       return dateA - dateB; // oldest first
//     });
//   }, [metadataList]);

//   // ============================================
//   // SECTION: BUILD PROGRESS DATASET
//   // ============================================
//   const progressData = useMemo(() => {
//     return sortedMetadata.map((item, index) => {
//       const analysis = analyzePerformance(item);
//       const sessionDate = item.created_at
//         ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
//         : `Session ${index + 1}`;
//       return {
//         session: index + 1,
//         label: sessionDate,
//         fluencyScore: analysis.fluencyScore,
//         fillerWordsCount: analysis.fillerWordsCount,
//         speakingRate: analysis.speakingRate,
//       };
//     });
//   }, [sortedMetadata]);

//   // ============================================
//   // SECTION: CALCULATE IMPROVEMENT DELTA
//   // ============================================
//   const progressDelta = useMemo(() => {
//     if (progressData.length < 2) {
//       return { fluencyChange: 0, fillerChange: 0, rateChange: 0, insightText: '' };
//     }
//     const first = progressData[0];
//     const latest = progressData[progressData.length - 1];

//     const fluencyChange = Math.round(latest.fluencyScore - first.fluencyScore);
//     const fillerChange = latest.fillerWordsCount - first.fillerWordsCount;
//     const rateChange = latest.speakingRate - first.speakingRate;

//     // Build dynamic coaching insight
//     const parts = [];
//     if (fluencyChange > 0) {
//       parts.push(`Your fluency improved by ${fluencyChange}% across ${progressData.length} sessions.`);
//     } else if (fluencyChange < 0) {
//       parts.push(`Your fluency decreased by ${Math.abs(fluencyChange)}% across ${progressData.length} sessions. Don't worry — focus on reducing filler words.`);
//     } else {
//       parts.push(`Your fluency has remained steady across ${progressData.length} sessions.`);
//     }

//     if (fillerChange < 0) {
//       parts.push(`You are reducing filler words steadily (${Math.abs(fillerChange)} fewer).`);
//     } else if (fillerChange > 0) {
//       parts.push(`Filler word usage increased by ${fillerChange}. Try pausing instead of saying "um" or "uh".`);
//     } else {
//       parts.push('Filler word count is consistent.');
//     }

//     if (rateChange !== 0 && latest.speakingRate > 0 && first.speakingRate > 0) {
//       parts.push('Keep practicing pacing consistency.');
//     }

//     return {
//       fluencyChange,
//       fillerChange,
//       rateChange,
//       insightText: parts.join(' '),
//     };
//   }, [progressData]);

//   // Custom tooltip for the chart
//   const CustomChartTooltip = ({ active, payload, label }) => {
//     if (active && payload && payload.length) {
//       return (
//         <CustomTooltipWrapper>
//           <div className="tooltip-label">{payload[0]?.payload?.label || `Session ${label}`}</div>
//           <div className="tooltip-value">{payload[0].value.toFixed(0)}% Fluency</div>
//         </CustomTooltipWrapper>
//       );
//     }
//     return null;
//   };

//   // 3. Render Logic based on Auth and Loading States
//   if (!authChecked) {
//     return (
//       <DashboardContainer>
//         <Header>
//           <HeaderContent>
//             <HeaderTitle>Dashboard</HeaderTitle>
//           </HeaderContent>
//         </Header>
//         <LoadingMessage>
//           <Spinner />
//           <span>Checking authentication status...</span>
//         </LoadingMessage>
//       </DashboardContainer>
//     );
//   }

//   if (isLoading && !dataLoaded) {
//     return (
//       <DashboardContainer>
//         <Header>
//           <HeaderContent>
//             <HeaderTitle>Dashboard</HeaderTitle>
//           </HeaderContent>
//         </Header>
//         <LoadingMessage>
//           <Spinner />
//           <span>Loading your presentations...</span>
//         </LoadingMessage>
//       </DashboardContainer>
//     );
//   }

//   return (
//     <DashboardContainer>
//       <Header>
//         <HeaderContent>
//           <HeaderTitle>Your Presentation Dashboard</HeaderTitle>
//           <HeaderSubtitle>
//             See how well you presented and get tips to improve your speaking skills
//           </HeaderSubtitle>
//         </HeaderContent>
//       </Header>

//       <MainContent>
//         {error && (
//           <ErrorMessage>
//             <h4>⚠️ Oops! Something Went Wrong</h4>
//             <p>We couldn't load your presentations: <strong>{error}</strong></p>
//             <p style={{ opacity: 0.8, marginTop: '1rem' }}>
//               Please ensure you are logged in, or try refreshing the page.
//             </p>
//           </ErrorMessage>
//         )}

//         {!error && (
//           <>
//             {/* ============================================ */}
//             {/* SECTION: PROGRESS OVERVIEW UI                */}
//             {/* ============================================ */}
//             {metadataList.length > 0 && (
//               <ProgressOverviewCard>
//                 <ProgressHeader>
//                   <ProgressTitle>📈 Your Progress Overview</ProgressTitle>
//                   <ProgressSubtitle>Track your speaking improvement across all sessions</ProgressSubtitle>
//                 </ProgressHeader>

//                 {metadataList.length < 2 ? (
//                   <ProgressPlaceholder>
//                     <ProgressPlaceholderEmoji>📊</ProgressPlaceholderEmoji>
//                     <p>Upload at least 2 presentations to see progress trends.</p>
//                   </ProgressPlaceholder>
//                 ) : (
//                   <>
//                     {/* A) KPI Summary Cards */}
//                     <KPIGrid>
//                       <KPICard $positive={progressDelta.fluencyChange > 0} $negative={progressDelta.fluencyChange < 0}>
//                         <KPIValue $positive={progressDelta.fluencyChange > 0} $negative={progressDelta.fluencyChange < 0}>
//                           {progressDelta.fluencyChange > 0 ? '+' : ''}{progressDelta.fluencyChange}%
//                         </KPIValue>
//                         <KPILabel>Fluency Change</KPILabel>
//                       </KPICard>

//                       <KPICard $positive={progressDelta.fillerChange < 0} $negative={progressDelta.fillerChange > 0}>
//                         <KPIValue $positive={progressDelta.fillerChange < 0} $negative={progressDelta.fillerChange > 0}>
//                           {progressDelta.fillerChange <= 0 ? '' : '+'}{progressDelta.fillerChange}
//                         </KPIValue>
//                         <KPILabel>Filler Words Change</KPILabel>
//                       </KPICard>

//                       <KPICard
//                         $positive={progressDelta.rateChange !== 0 && progressData[progressData.length - 1]?.speakingRate >= 120 && progressData[progressData.length - 1]?.speakingRate <= 180}
//                         $negative={progressData[progressData.length - 1]?.speakingRate > 0 && (progressData[progressData.length - 1]?.speakingRate < 100 || progressData[progressData.length - 1]?.speakingRate > 200)}
//                       >
//                         <KPIValue
//                           $positive={progressDelta.rateChange !== 0 && progressData[progressData.length - 1]?.speakingRate >= 120 && progressData[progressData.length - 1]?.speakingRate <= 180}
//                           $negative={progressData[progressData.length - 1]?.speakingRate > 0 && (progressData[progressData.length - 1]?.speakingRate < 100 || progressData[progressData.length - 1]?.speakingRate > 200)}
//                         >
//                           {progressDelta.rateChange > 0 ? '+' : ''}{progressDelta.rateChange !== 0 ? progressDelta.rateChange : '—'}
//                         </KPIValue>
//                         <KPILabel>Speaking Rate Change</KPILabel>
//                       </KPICard>
//                     </KPIGrid>

//                     {/* B) Fluency Trend LineChart */}
//                     <ChartContainer>
//                       <ChartTitle>📉 Fluency Trend</ChartTitle>
//                       <ResponsiveContainer width="100%" height={220}>
//                         <LineChart data={progressData} margin={{ top: 5, right: 20, left: 0, bottom: 5 }}>
//                           <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
//                           <XAxis
//                             dataKey="label"
//                             tick={{ fill: '#94a3b8', fontSize: 12 }}
//                             axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
//                             tickLine={false}
//                           />
//                           <YAxis
//                             domain={[0, 100]}
//                             tick={{ fill: '#94a3b8', fontSize: 12 }}
//                             axisLine={{ stroke: 'rgba(148,163,184,0.15)' }}
//                             tickLine={false}
//                             width={40}
//                           />
//                           <Tooltip content={<CustomChartTooltip />} />
//                           <Line
//                             type="monotone"
//                             dataKey="fluencyScore"
//                             stroke="#3b82f6"
//                             strokeWidth={2.5}
//                             dot={{ r: 5, fill: '#3b82f6', stroke: '#1e293b', strokeWidth: 2 }}
//                             activeDot={{ r: 7, fill: '#60a5fa', stroke: '#1e293b', strokeWidth: 2 }}
//                           />
//                         </LineChart>
//                       </ResponsiveContainer>
//                     </ChartContainer>

//                     {/* C) Insight Box */}
//                     <InsightContainer>
//                       <InsightBox>
//                         <strong>💡 Coach Insight:</strong> {progressDelta.insightText}
//                       </InsightBox>
//                     </InsightContainer>
//                   </>
//                 )}
//               </ProgressOverviewCard>
//             )}

//             {metadataList.length > 0 ? (
//               metadataList.map(item => {
//                 const analysis = analyzePerformance(item);

//                 return (
//                   <DataCard key={item.id}>
//                     <CardHeader>
//                       <CardTitle>🎥 {item.original_name || item.video_name || 'Untitled Presentation'}</CardTitle>
//                       <CardSubtitle>Uploaded on {formatDate(item.created_at)}</CardSubtitle>

//                       <ScoreSection>
//                         <ScoreCard variant={analysis.fluencyRating.variant}>
//                           <ScoreValue>{analysis.fluencyScore.toFixed(0)}%</ScoreValue>
//                           <ScoreLabel>Speech Clarity</ScoreLabel>
//                           <ScoreExplanation>{analysis.fluencyRating.explanation}</ScoreExplanation>
//                         </ScoreCard>

//                         <ScoreCard variant={analysis.paceRating.variant}>
//                           <ScoreValue>{analysis.speakingRate > 0 ? analysis.speakingRate : 'N/A'}</ScoreValue>
//                           <ScoreLabel>Words Per Minute</ScoreLabel>
//                           <ScoreExplanation>{analysis.paceRating.explanation}</ScoreExplanation>
//                         </ScoreCard>

//                         <ScoreCard variant={analysis.fillerRating.variant}>
//                           <ScoreValue>{analysis.fillerWordsCount}</ScoreValue>
//                           <ScoreLabel>Filler Words Used</ScoreLabel>
//                           <ScoreExplanation>
//                             {analysis.fillerRating.text === 'Excellent' && 'Great job avoiding filler words!'}
//                             {analysis.fillerRating.text === 'Good' && 'Keep working on reducing fillers.'}
//                             {analysis.fillerRating.text === 'High' && 'Try to pause instead of saying "um" or "uh".'}
//                           </ScoreExplanation>
//                         </ScoreCard>
//                       </ScoreSection>
//                     </CardHeader>

//                     <CardBody>
//                       <div>
//                         <SectionTitle>▶️ Watch Your Presentation</SectionTitle>
//                         <VideoPlayerContainer>
//                           {(item.video_url || item.public_url) ? (
//                             <StyledVideo controls src={item.video_url || item.public_url} />
//                           ) : (
//                             <div style={{
//                               position: 'absolute', top: 0, left: 0, width: '100%', height: '100%',
//                               display: 'flex', alignItems: 'center', justifyContent: 'center',
//                               color: '#64748b', fontSize: '1rem'
//                             }}>
//                               Video not available
//                             </div>
//                           )}
//                         </VideoPlayerContainer>
//                       </div>

//                       <div>
//                         <SectionTitle>📊 Your Performance Breakdown</SectionTitle>

//                         <InfoBox>
//                           <InfoText>
//                             <strong>What do these numbers mean?</strong><br />
//                             We analyzed your presentation to help you understand your speaking patterns and give you actionable tips for improvement.
//                           </InfoText>
//                         </InfoBox>

//                         <ContentBlock>
//                           <BlockTitle>📝 What You Said</BlockTitle>
//                           <BlockContent>
//                             {item.deepgram_transcript || item.elevenlabs_transcript || 'Your speech transcript will appear here after processing.'}
//                           </BlockContent>
//                           <Tip>
//                             <strong>Tip:</strong> Read through your transcript to spot repeated phrases or words you might want to avoid in future presentations.
//                           </Tip>
//                         </ContentBlock>

//                         {item.gemini_analysis && (
//                           <ContentBlock>
//                             <BlockTitle>🤖 AI Coach Feedback</BlockTitle>
//                             <BlockContent>{item.gemini_analysis}</BlockContent>
//                             <Tip>
//                               <strong>Tip:</strong> This personalized feedback is based on analyzing your entire presentation. Focus on one improvement area at a time!
//                             </Tip>
//                           </ContentBlock>
//                         )}

//                         <ContentBlock>
//                           <BlockTitle>📈 Quick Stats</BlockTitle>
//                           <BlockContent style={{ display: 'grid', gap: '0.75rem' }}>
//                             <div>✅ <strong>Total Words Spoken:</strong> {analysis.totalWords || 0}</div>
//                             <div>⚠️ <strong>Filler Words Used:</strong> {analysis.fillerWordsCount || 0}
//                               {analysis.fillerWordsCount > 0 && (
//                                 <span style={{ fontSize: '0.85em', opacity: 0.7 }}>
//                                   ({((analysis.fillerWordsCount / analysis.totalWords) * 100).toFixed(1)}% of total words)
//                                 </span>
//                               )}
//                               {analysis.fillerWordsCount === 0 && analysis.totalWords > 0 && (
//                                 <span style={{ fontSize: '0.85em', opacity: 0.7, color: '#4ade80' }}>
//                                   (Excellent! No filler words detected)
//                                 </span>
//                               )}
//                             </div>
//                             <div>⏸️ <strong>Speech Pauses:</strong> {analysis.pausesCount || 0}
//                               {analysis.pausesCount > 0 && (
//                                 <span style={{ fontSize: '0.85em', opacity: 0.7 }}>
//                                   (Natural breaks in your speech)
//                                 </span>
//                               )}
//                               {analysis.pausesCount === 0 && analysis.totalWords > 0 && (
//                                 <span style={{ fontSize: '0.85em', opacity: 0.7 }}>
//                                   (Smooth, continuous speech)
//                                 </span>
//                               )}
//                             </div>
//                             {analysis.speakingRate > 0 && (
//                               <div>📊 <strong>Speaking Rate:</strong> {analysis.speakingRate} words per minute</div>
//                             )}
//                             {analysis.totalWords === 0 && (
//                               <div style={{ color: '#fbbf24', fontSize: '0.9rem', fontStyle: 'italic' }}>
//                                 ⚠️ No words detected. The video may not contain speech or transcription is still processing.
//                               </div>
//                             )}
//                           </BlockContent>
//                         </ContentBlock>

//                         {item.frames && Array.isArray(item.frames) && item.frames.length > 0 && (
//                           <ContentBlock>
//                             <BlockTitle>🖼️ Snapshots from Your Presentation ({item.frames.length})</BlockTitle>
//                             <BlockContent>
//                               <p style={{ marginBottom: '1rem', fontSize: '0.9rem', color: '#94a3b8' }}>
//                                 These are key moments we captured from your video. Click any image to view it larger.
//                               </p>
//                               <KeyframesGrid>
//                                 {item.frames.map((frame, index) => (
//                                   <a key={index} href={frame.frame_url || frame.url} target="_blank" rel="noopener noreferrer">
//                                     <FrameImage
//                                       src={frame.frame_url || frame.url}
//                                       alt={`Moment ${index + 1} from your presentation`}
//                                       title={`Click to view full size - Moment ${index + 1}`}
//                                     />
//                                   </a>
//                                 ))}
//                               </KeyframesGrid>
//                             </BlockContent>
//                           </ContentBlock>
//                         )}
//                       </div>
//                     </CardBody>
//                   </DataCard>
//                 );
//               })
//             ) : (
//               <PlaceholderCard>
//                 <PlaceholderEmoji>🎥</PlaceholderEmoji>
//                 <h4 style={{ color: '#fff', marginBottom: '1.5rem', fontSize: '2rem', fontWeight: '600' }}>
//                   No Presentations Yet
//                 </h4>
//                 <p style={{ color: '#94a3b8', marginBottom: '2.5rem', maxWidth: '600px', margin: '0 auto 2.5rem', fontSize: '1.1rem', lineHeight: '1.6' }}>
//                   Upload your first video presentation and we'll analyze your speaking skills, giving you personalized feedback to help you improve!
//                 </p>
//                 <PlaceholderButton href="/upload">
//                   📤 Upload Your First Presentation
//                 </PlaceholderButton>
//               </PlaceholderCard>
//             )}
//           </>
//         )}
//       </MainContent>
//     </DashboardContainer>
//   );
// }
// //fixed
// export default Dashboard;

import React, { useState, useEffect, useMemo } from 'react';
import { getAuthHeaders, getCurrentUser } from './supabaseClient';
import { useNavigate } from 'react-router-dom';
import {
  LineChart, Line, XAxis, YAxis, Tooltip,
  ResponsiveContainer, CartesianGrid
} from 'recharts';

export default function Dashboard() {
  const navigate = useNavigate();
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null);
  const [authChecked, setAuthChecked] = useState(false);
  const [dataLoaded, setDataLoaded] = useState(false);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-20.onrender.com';

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const currentUser = await getCurrentUser();
        setUser(currentUser);
      } catch {
        setUser(null);
      } finally {
        setAuthChecked(true);
      }
    };
    checkAuth();
  }, []);

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
        if (!authHeaders) throw new Error("Session expired. Please log in again.");

        const response = await fetch(`${BACKEND_URL}/api/metadata`, {
          method: 'GET',
          headers: { 'Content-Type': 'application/json', 'Accept': 'application/json', ...authHeaders }
        });

        if (response.status === 401 || response.status === 403) throw new Error("Access denied. Please log in again.");
        if (!response.ok) {
          let msg = `HTTP ${response.status}`;
          try { const d = await response.json(); msg = d.error || d.message || msg; } catch { msg = await response.text() || msg; }
          throw new Error(msg);
        }

        const data = await response.json();
        if (Array.isArray(data)) setMetadataList(data);
        else if (data.success && Array.isArray(data.data)) setMetadataList(data.data);
        else if (data.data && Array.isArray(data.data)) setMetadataList(data.data);
        else setMetadataList([]);
      } catch (err) {
        if (err.message.includes("Session expired") || err.message.includes("Access denied")) {
          setError(`${err.message} Redirecting to login...`);
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
    let videoDuration = 0;

    if (item.deepgram_words) {
      if (Array.isArray(item.deepgram_words)) wordsArray = item.deepgram_words;
      else if (typeof item.deepgram_words === 'object' && item.deepgram_words.words) wordsArray = item.deepgram_words.words;
    }

    if (wordsArray.length > 0) {
      const lastWord = wordsArray[wordsArray.length - 1];
      videoDuration = lastWord.end || lastWord.start || 0;
    }

    const fillerWords = ['uh', 'um', 'uhm', 'er', 'ah', 'like', 'so', 'and', 'but', 'well',
      'actually', 'basically', 'right', 'okay', 'ok', 'alright', 'you know', 'i mean', 'i guess', 'i think'];

    fillerWordsCount = wordsArray.filter(word => {
      const wordText = (word.word || word.punctuated_word || word.text || (typeof word === 'string' ? word : '')).toLowerCase().trim();
      if (!wordText) return false;
      const clean = wordText.replace(/[.,!?;:]/g, '');
      return fillerWords.includes(clean);
    }).length;

    if (item.deepgram_transcript) {
      const pauses = item.deepgram_transcript.match(/\[PAUSE:[^\]]+\]/g);
      if (pauses) pausesCount = pauses.length;
    }

    const totalWords = wordsArray.length;
    const fluencyScore = totalWords > 0 ? Math.round(((totalWords - fillerWordsCount) / totalWords) * 100) : 0;

    let speakingRate = 0;
    if (totalWords > 0 && videoDuration > 0) speakingRate = Math.round(totalWords / (videoDuration / 60));
    else if (item.video_duration) speakingRate = Math.round(totalWords / (item.video_duration / 60));

    const getFluencyRating = (s) => {
      if (s >= 90) return { color: 'text-[#34C759]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Excellent', tip: 'Clear speech with minimal filler words.' };
      if (s >= 70) return { color: 'text-[#FF9F0A]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Good', tip: 'Try reducing filler words further.' };
      return { color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]', border: 'border-[#FECACA]', label: 'Needs Work', tip: 'Focus on cutting "um", "uh" and pausing instead.' };
    };

    const getPaceRating = (r) => {
      if (r === 0) return { color: 'text-[#AEAEB2]', bg: 'bg-[#F5F5F7]', border: 'border-[#E8E8ED]', label: 'N/A', tip: 'Not enough data to calculate.' };
      if (r >= 120 && r <= 180) return { color: 'text-[#34C759]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Perfect', tip: 'Ideal speaking pace for engagement.' };
      if (r >= 100) return { color: 'text-[#FF9F0A]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Good', tip: 'Slightly off — aim for 120–180 WPM.' };
      return { color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]', border: 'border-[#FECACA]', label: 'Slow', tip: 'Try speaking more energetically.' };
    };

    const getFillerRating = (count, total) => {
      if (total === 0) return { color: 'text-[#AEAEB2]', bg: 'bg-[#F5F5F7]', border: 'border-[#E8E8ED]', label: 'N/A', tip: '' };
      const pct = (count / total) * 100;
      if (pct < 5) return { color: 'text-[#34C759]', bg: 'bg-[#F0FDF4]', border: 'border-[#BBF7D0]', label: 'Excellent', tip: 'Great job avoiding filler words!' };
      if (pct < 10) return { color: 'text-[#FF9F0A]', bg: 'bg-[#FFFBEB]', border: 'border-[#FDE68A]', label: 'Good', tip: 'Keep working on reducing fillers.' };
      return { color: 'text-[#FF3B30]', bg: 'bg-[#FFF5F5]', border: 'border-[#FECACA]', label: 'High', tip: 'Pause instead of saying "um" or "uh".' };
    };

    return {
      totalWords, fillerWordsCount, pausesCount, fluencyScore, speakingRate,
      fluencyRating: getFluencyRating(fluencyScore),
      fillerRating: getFillerRating(fillerWordsCount, totalWords),
      paceRating: getPaceRating(speakingRate),
    };
  };

  const formatDate = (d) => {
    if (!d) return 'Unknown';
    try { return new Date(d).toLocaleString('en-US', { year: 'numeric', month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' }); }
    catch { return 'Invalid date'; }
  };

  const sortedMetadata = useMemo(() => {
    if (!metadataList.length) return [];
    return [...metadataList].sort((a, b) => new Date(a.created_at || 0) - new Date(b.created_at || 0));
  }, [metadataList]);

  const progressData = useMemo(() => sortedMetadata.map((item, i) => {
    const a = analyzePerformance(item);
    return {
      session: i + 1,
      label: item.created_at ? new Date(item.created_at).toLocaleDateString('en-US', { month: 'short', day: 'numeric' }) : `S${i + 1}`,
      fluencyScore: a.fluencyScore,
      fillerWordsCount: a.fillerWordsCount,
      speakingRate: a.speakingRate,
    };
  }), [sortedMetadata]);

  const progressDelta = useMemo(() => {
    if (progressData.length < 2) return { fluencyChange: 0, fillerChange: 0, rateChange: 0, insightText: '' };
    const first = progressData[0];
    const latest = progressData[progressData.length - 1];
    const fluencyChange = Math.round(latest.fluencyScore - first.fluencyScore);
    const fillerChange = latest.fillerWordsCount - first.fillerWordsCount;
    const rateChange = latest.speakingRate - first.speakingRate;
    const parts = [];
    if (fluencyChange > 0) parts.push(`Fluency improved by ${fluencyChange}% across ${progressData.length} sessions.`);
    else if (fluencyChange < 0) parts.push(`Fluency decreased by ${Math.abs(fluencyChange)}%. Focus on reducing filler words.`);
    else parts.push(`Fluency is steady across ${progressData.length} sessions.`);
    if (fillerChange < 0) parts.push(`${Math.abs(fillerChange)} fewer filler words — great progress.`);
    else if (fillerChange > 0) parts.push(`${fillerChange} more filler words. Try pausing instead of "um" or "uh".`);
    return { fluencyChange, fillerChange, rateChange, insightText: parts.join(' ') };
  }, [progressData]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (!active || !payload?.length) return null;
    return (
      <div className="bg-white border border-[#E8E8ED] rounded-xl shadow-lg px-3 py-2">
        <p className="text-[#AEAEB2] text-xs mb-0.5">{payload[0]?.payload?.label || `Session ${label}`}</p>
        <p className="text-[#1D1D1F] text-sm font-semibold">{payload[0].value.toFixed(0)}% Fluency</p>
      </div>
    );
  };

  // ── Loading states ─────────────────────────────────────────────────────
  if (!authChecked || (isLoading && !dataLoaded)) {
    return (
      <div className="min-h-screen bg-[#F5F5F7] flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-[1.5px] border-[#1D1D1F] border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-[#6E6E73] text-sm">{!authChecked ? 'Verifying session' : 'Loading your data'}</p>
        </div>
      </div>
    );
  }

  // ── Main render ────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen bg-[#F5F5F7] pt-24 pb-20 px-4">
      <div className="max-w-4xl mx-auto">

        {/* Page header */}
        <div className="mb-10">
          <h1 className="text-[#1D1D1F] text-[2rem] font-bold tracking-tight leading-tight mb-1">
            Dashboard
          </h1>
          <p className="text-[#6E6E73] text-base">
            {user ? `${user.email} · ` : ''}{metadataList.length} presentation{metadataList.length !== 1 ? 's' : ''} analyzed
          </p>
        </div>

        {/* Error */}
        {error && (
          <div className="mb-6 flex items-start gap-3 bg-[#FFF5F5] border border-[#FECACA] rounded-2xl p-4">
            <svg className="w-4 h-4 text-[#FF3B30] mt-0.5 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
              <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
            </svg>
            <p className="text-[#7F1D1D] text-sm leading-relaxed">{error}</p>
          </div>
        )}

        {!error && (
          <>
            {/* ── Progress Overview ──────────────────────────────────── */}
            {metadataList.length > 0 && (
              <div className="bg-white border border-[#E8E8ED] rounded-3xl overflow-hidden mb-6 shadow-sm">
                {/* Header */}
                <div className="px-6 pt-6 pb-5 border-b border-[#F2F2F7]">
                  <h2 className="text-[#1D1D1F] text-lg font-bold tracking-tight mb-0.5">Progress Overview</h2>
                  <p className="text-[#AEAEB2] text-sm">Your speaking improvement across all sessions</p>
                </div>

                {metadataList.length < 2 ? (
                  <div className="px-6 py-10 text-center">
                    <p className="text-[#1D1D1F] text-sm font-medium mb-1">Upload 2+ presentations to see trends</p>
                    <p className="text-[#AEAEB2] text-xs">We'll chart your fluency improvement over time</p>
                  </div>
                ) : (
                  <>
                    {/* KPI row */}
                    <div className="grid grid-cols-3 divide-x divide-[#F2F2F7]">
                      {[
                        {
                          value: `${progressDelta.fluencyChange > 0 ? '+' : ''}${progressDelta.fluencyChange}%`,
                          label: 'Fluency Change',
                          positive: progressDelta.fluencyChange > 0,
                          negative: progressDelta.fluencyChange < 0,
                        },
                        {
                          value: `${progressDelta.fillerChange <= 0 ? '' : '+'}${progressDelta.fillerChange}`,
                          label: 'Filler Words',
                          positive: progressDelta.fillerChange < 0,
                          negative: progressDelta.fillerChange > 0,
                        },
                        {
                          value: progressDelta.rateChange !== 0 ? `${progressDelta.rateChange > 0 ? '+' : ''}${progressDelta.rateChange}` : '—',
                          label: 'WPM Change',
                          positive: false,
                          negative: false,
                        },
                      ].map((kpi, i) => (
                        <div key={i} className="px-6 py-5 text-center">
                          <p className={`text-2xl font-bold mb-1 tabular-nums
                            ${kpi.positive ? 'text-[#34C759]' : kpi.negative ? 'text-[#FF3B30]' : 'text-[#1D1D1F]'}`}>
                            {kpi.value}
                          </p>
                          <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">{kpi.label}</p>
                        </div>
                      ))}
                    </div>

                    {/* Chart */}
                    <div className="px-6 py-5 border-t border-[#F2F2F7]">
                      <p className="text-[#6E6E73] text-xs uppercase tracking-widest font-medium mb-4">Fluency Trend</p>
                      <ResponsiveContainer width="100%" height={180}>
                        <LineChart data={progressData} margin={{ top: 4, right: 8, left: -20, bottom: 0 }}>
                          <CartesianGrid strokeDasharray="3 3" stroke="#F2F2F7" />
                          <XAxis dataKey="label" tick={{ fill: '#AEAEB2', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <YAxis domain={[0, 100]} tick={{ fill: '#AEAEB2', fontSize: 11 }} axisLine={false} tickLine={false} />
                          <Tooltip content={<CustomTooltip />} />
                          <Line
                            type="monotone" dataKey="fluencyScore"
                            stroke="#007AFF" strokeWidth={2}
                            dot={{ r: 4, fill: '#007AFF', stroke: '#fff', strokeWidth: 2 }}
                            activeDot={{ r: 6, fill: '#007AFF', stroke: '#fff', strokeWidth: 2 }}
                          />
                        </LineChart>
                      </ResponsiveContainer>
                    </div>

                    {/* Insight */}
                    {progressDelta.insightText && (
                      <div className="px-6 pb-6 border-t border-[#F2F2F7] pt-5">
                        <div className="bg-[#F5F5F7] rounded-2xl px-4 py-3">
                          <p className="text-[#1D1D1F] text-sm leading-relaxed">
                            <span className="font-semibold">Coach insight — </span>
                            <span className="text-[#3A3A3C]">{progressDelta.insightText}</span>
                          </p>
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}

            {/* ── Presentation Cards ─────────────────────────────────── */}
            {metadataList.length > 0 ? (
              <div className="space-y-5">
                {metadataList.map(item => {
                  const a = analyzePerformance(item);
                  return (
                    <div key={item.id} className="bg-white border border-[#E8E8ED] rounded-3xl overflow-hidden shadow-sm">

                      {/* Card header */}
                      <div className="px-6 pt-6 pb-5 border-b border-[#F2F2F7]">
                        <div className="flex items-start justify-between gap-4 mb-5">
                          <div className="min-w-0">
                            <h3 className="text-[#1D1D1F] text-base font-semibold truncate">
                              {item.original_name || item.video_name || 'Untitled Presentation'}
                            </h3>
                            <p className="text-[#AEAEB2] text-xs mt-0.5">{formatDate(item.created_at)}</p>
                          </div>
                        </div>

                        {/* Score chips */}
                        <div className="grid grid-cols-3 gap-3">
                          {[
                            { value: `${a.fluencyScore}%`, label: 'Speech Clarity', rating: a.fluencyRating, tip: a.fluencyRating.tip },
                            { value: a.speakingRate > 0 ? `${a.speakingRate}` : 'N/A', label: 'Words / Min', rating: a.paceRating, tip: a.paceRating.tip },
                            { value: `${a.fillerWordsCount}`, label: 'Filler Words', rating: a.fillerRating, tip: a.fillerRating.tip },
                          ].map((metric, i) => (
                            <div key={i} className={`${metric.rating.bg} ${metric.rating.border} border rounded-2xl p-4 text-center`}>
                              <p className={`text-2xl font-bold tabular-nums mb-1 ${metric.rating.color}`}>{metric.value}</p>
                              <p className="text-[#6E6E73] text-xs font-medium uppercase tracking-widest mb-1">{metric.label}</p>
                              <p className="text-[#AEAEB2] text-[11px] leading-snug">{metric.tip}</p>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Video + analysis */}
                      <div className="grid grid-cols-1 lg:grid-cols-2 divide-y lg:divide-y-0 lg:divide-x divide-[#F2F2F7]">

                        {/* Video */}
                        <div className="p-6">
                          <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-3">Recording</p>
                          <div className="relative w-full rounded-2xl overflow-hidden bg-[#1D1D1F]" style={{ paddingTop: '56.25%' }}>
                            {(item.video_url || item.public_url) ? (
                              <video
                                controls
                                src={item.video_url || item.public_url}
                                className="absolute top-0 left-0 w-full h-full object-cover"
                              />
                            ) : (
                              <div className="absolute inset-0 flex items-center justify-center">
                                <p className="text-[#6E6E73] text-sm">Video not available</p>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Stats + transcript */}
                        <div className="p-6 space-y-5">

                          {/* Quick stats */}
                          <div>
                            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-3">Quick Stats</p>
                            <div className="space-y-2">
                              {[
                                { label: 'Total words', value: a.totalWords || 0 },
                                { label: 'Filler words', value: `${a.fillerWordsCount}${a.totalWords > 0 ? ` (${((a.fillerWordsCount / a.totalWords) * 100).toFixed(1)}%)` : ''}` },
                                { label: 'Speech pauses', value: a.pausesCount || 0 },
                                ...(a.speakingRate > 0 ? [{ label: 'Speaking rate', value: `${a.speakingRate} WPM` }] : []),
                              ].map((stat, i) => (
                                <div key={i} className="flex items-center justify-between py-2 border-b border-[#F2F2F7] last:border-0">
                                  <span className="text-[#6E6E73] text-sm">{stat.label}</span>
                                  <span className="text-[#1D1D1F] text-sm font-medium tabular-nums">{stat.value}</span>
                                </div>
                              ))}
                            </div>
                          </div>

                          {/* Transcript */}
                          {(item.deepgram_transcript || item.elevenlabs_transcript) && (
                            <div>
                              <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">Transcript</p>
                              <p className="text-[#3A3A3C] text-sm leading-relaxed line-clamp-5">
                                {item.deepgram_transcript || item.elevenlabs_transcript}
                              </p>
                            </div>
                          )}
                        </div>
                      </div>

                      {/* AI Feedback */}
                      {item.gemini_analysis && (
                        <div className="px-6 py-5 border-t border-[#F2F2F7]">
                          <div className="flex items-center justify-between mb-3">
                            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">AI Coach Feedback</p>
                            <span className="text-[10px] font-semibold text-[#007AFF] bg-[#EAF4FF] px-2.5 py-1 rounded-full">Gemini</span>
                          </div>
                          <p className="text-[#3A3A3C] text-sm leading-relaxed whitespace-pre-wrap">{item.gemini_analysis}</p>
                        </div>
                      )}

                      {/* Frames */}
                      {item.frames && Array.isArray(item.frames) && item.frames.length > 0 && (
                        <div className="px-6 py-5 border-t border-[#F2F2F7]">
                          <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-3">
                            Key Frames · {item.frames.length}
                          </p>
                          <div className="grid grid-cols-3 sm:grid-cols-4 gap-2">
                            {item.frames.map((frame, i) => (
                              <a key={i} href={frame.frame_url || frame.url} target="_blank" rel="noopener noreferrer">
                                <img
                                  src={frame.frame_url || frame.url}
                                  alt={`Frame ${i + 1}`}
                                  className="w-full h-20 object-cover rounded-xl border border-[#E8E8ED] hover:opacity-80 transition-opacity duration-150"
                                />
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            ) : (
              /* Empty state */
              !error && (
                <div className="bg-white border border-[#E8E8ED] rounded-3xl p-16 text-center shadow-sm">
                  <div className="w-16 h-16 bg-[#F5F5F7] rounded-2xl flex items-center justify-center mx-auto mb-5">
                    <svg className="w-7 h-7 text-[#AEAEB2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M15 10l4.553-2.069A1 1 0 0121 8.868v6.264a1 1 0 01-1.447.894L15 14M5 18h8a2 2 0 002-2V8a2 2 0 00-2-2H5a2 2 0 00-2 2v8a2 2 0 002 2z" />
                    </svg>
                  </div>
                  <h3 className="text-[#1D1D1F] text-lg font-semibold mb-2">No presentations yet</h3>
                  <p className="text-[#6E6E73] text-sm leading-relaxed mb-6 max-w-sm mx-auto">
                    Upload your first video and we'll analyze your speech, pace, and delivery with AI.
                  </p>
                  <button
                    onClick={() => navigate('/upload')}
                    className="px-6 py-2.5 bg-[#1D1D1F] text-white text-sm font-medium rounded-xl
                      hover:bg-[#3A3A3C] transition-colors duration-150 active:scale-95"
                  >
                    Upload a presentation
                  </button>
                </div>
              )
            )}
          </>
        )}
      </div>
    </div>
  );
}