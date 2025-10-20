// dashboard.js - FINAL FIXED VERSION

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import { getAuthHeaders, getCurrentUser } from './supabaseClient'; 
import { useNavigate } from 'react-router-dom'; // 👈 Import useNavigate for redirect

// --- Keyframes & Styled Components (omitted for brevity, assume they are correct) ---
// ... (Your styled components like DashboardContainer, Header, Spinner, ErrorMessage, etc.)
const fadeIn = keyframes`from { opacity: 0; transform: translateY(20px); } to { opacity: 1; transform: translateY(0); }`;
const spin = keyframes`from { transform: rotate(0deg); } to { transform: rotate(360deg); }`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #c0c0c0;
  font-family: 'Satoshi', 'Inter', sans-serif;
  animation: ${fadeIn} 0.8s ease-out;
`;
// 
const Header = styled.header`...`; // Placeholder
const HeaderTitle = styled.h1`...`; // Placeholder
const HeaderSubtitle = styled.p`...`; // Placeholder
const MainContent = styled.main`...`; // Placeholder
const DataCard = styled.div`...`; // Placeholder
const CardHeader = styled.div`...`; // Placeholder
const CardTitle = styled.h3`...`; // Placeholder
const CardSubtitle = styled.p`...`; // Placeholder
const ScoreSection = styled.div`...`; // Placeholder
const ScoreCard = styled.div`...`; // Placeholder
const ScoreValue = styled.div`...`; // Placeholder
const ScoreLabel = styled.div`...`; // Placeholder
const ScoreExplanation = styled.div`...`; // Placeholder
const CardBody = styled.div`...`; // Placeholder
const VideoPlayerContainer = styled.div`...`; // Placeholder
const StyledVideo = styled.video`...`; // Placeholder
const SectionTitle = styled.h5`...`; // Placeholder
const InfoBox = styled.div`...`; // Placeholder
const InfoText = styled.p`...`; // Placeholder
const ContentBlock = styled.div`...`; // Placeholder
const BlockTitle = styled.h6`...`; // Placeholder
const BlockContent = styled.div`...`; // Placeholder
const KeyframesGrid = styled.div`...`; // Placeholder
const FrameImage = styled.img`...`; // Placeholder
const LoadingMessage = styled.div`...`; // Placeholder
const Spinner = styled.div`border: 4px solid #333; border-top: 4px solid #e6b95b; border-radius: 50%; width: 40px; height: 40px; animation: ${spin} 1s linear infinite; margin-bottom: 1rem;`;
const ErrorMessage = styled.div`...`; // Placeholder
const PlaceholderCard = styled(DataCard)`...`; // Placeholder
const PlaceholderEmoji = styled.div`...`; // Placeholder
const PlaceholderButton = styled.a`...`; // Placeholder
const Tip = styled.div`...`; // Placeholder
// --- End Styled Components ---


function Dashboard() {
  const navigate = useNavigate(); // Initialize useNavigate
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [user, setUser] = useState(null); 
  const [authChecked, setAuthChecked] = useState(false); 
  const [dataLoaded, setDataLoaded] = useState(false); // New state to separate loading data from checking auth

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-20.onrender.com';

  // 1. Check Authentication on Mount
  useEffect(() => {
    const checkAuth = async () => {
        try {
            const currentUser = await getCurrentUser();
            setUser(currentUser);
        } catch (err) {
            // Error in get user, treat as unauthenticated
            setUser(null);
        } finally {
            setAuthChecked(true);
        }
    };
    checkAuth();
  }, []);

  // 2. Fetch Metadata only when auth is confirmed and user is present
  useEffect(() => {
    if (!authChecked || dataLoaded) return; // Don't run until auth is confirmed, don't run repeatedly

    if (!user) {
        // Redirect if not logged in after auth check completes
        // Setting a friendly error first, then redirecting
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
             // Handle case where user object exists but token is stale/missing
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
             // Server rejected the token/RLS failed, force re-login
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
        // If session expired, force logout/redirect
        if (err.message.includes("Session expired") || err.message.includes("Access denied")) {
             setError(`Authentication failed: ${err.message}. Redirecting to login...`);
             setTimeout(() => navigate('/login'), 2000);
         } else {
             setError(err.message);
         }
      } finally {
        setIsLoading(false);
        setDataLoaded(true); // Mark data loading as complete
      }
    };

    fetchMetadata();
  }, [BACKEND_URL, authChecked, user, dataLoaded, navigate]); 
    // Added navigate to dependency array

  const analyzePerformance = (item) => {
    // ... (Your analyzePerformance function remains unchanged) ...
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
      if (rate >= 120 && rate <= 150) return { variant: 'excellent', text: 'Perfect', explanation: 'Your speaking pace is ideal for engagement.' };
      if (rate >= 100 && rate < 120) return { variant: 'good', text: 'Good', explanation: 'Slightly slow. Try speaking a bit faster.' };
      if (rate > 150) return { variant: 'good', text: 'Fast', explanation: 'Speaking quickly. Consider slowing down slightly.' };
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
               <Header><HeaderTitle>Dashboard</HeaderTitle></Header>
               <LoadingMessage>
                   <Spinner />
                   <span>Checking authentication status...</span>
               </LoadingMessage>
          </DashboardContainer>
      );
  }
  
  // Show spinner while fetching data after auth check is successful
  if (isLoading && !dataLoaded) { 
      return (
          <DashboardContainer>
               <Header><HeaderTitle>Dashboard</HeaderTitle></Header>
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
        <HeaderTitle>Your Presentation Dashboard</HeaderTitle>
        <HeaderSubtitle>
          See how well you presented and get tips to improve your speaking skills
        </HeaderSubtitle>
      </Header>

      <MainContent>
        {error && ( // Display error if present
          <ErrorMessage>
            <h4>⚠️ Oops! Something Went Wrong</h4>
            <p>We couldn't load your presentations: <strong>{error}</strong></p>
            <p style={{ opacity: 0.8, marginTop: '1rem' }}>
              Please ensure you are logged in, or try refreshing the page.
            </p>
          </ErrorMessage>
        )}

        {!error && ( // Only render data cards if no error
          <>
            {metadataList.length > 0 ? (
              <div className="d-flex flex-column gap-5">
                {metadataList.map(item => {
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
                            <ScoreValue>{analysis.speakingRate}</ScoreValue>
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
                                backgroundColor: 'rgba(255, 255, 255, 0.05)',
                                borderRadius: '12px', border: '1px solid rgba(255, 255, 255, 0.1)'
                              }}>
                                <span style={{ opacity: 0.7 }}>Video not available</span>
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
                            <BlockContent style={{ display: 'grid', gap: '0.5rem' }}>
                              <div>✅ <strong>Total Words Spoken:</strong> {analysis.totalWords}</div>
                              <div>⚠️ <strong>Times You Used Fillers:</strong> {analysis.fillerWordsCount} 
                                {analysis.fillerWordsCount > 0 && <span style={{ fontSize: '0.9em', opacity: 0.8 }}> (Words like "um", "uh", "like")</span>}
                              </div>
                              <div>⏸️ <strong>Speech Pauses:</strong> {analysis.pausesCount} 
                                {analysis.pausesCount > 0 && <span style={{ fontSize: '0.9em', opacity: 0.8 }}> (Natural breaks in your speech)</span>}
                              </div>
                            </BlockContent>
                          </ContentBlock>

                          {item.frames && Array.isArray(item.frames) && item.frames.length > 0 && (
                            <ContentBlock>
                              <BlockTitle>🖼️ Snapshots from Your Presentation ({item.frames.length})</BlockTitle>
                              <BlockContent>
                                <p style={{ marginBottom: '1rem', fontSize: '0.95rem' }}>
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
                })}
              </div>
            ) : (
             // Show empty state if authenticated and no data found
              <PlaceholderCard>
                <PlaceholderEmoji>🎥</PlaceholderEmoji>
                <h4 style={{ color: '#fff', marginBottom: '1rem' }}>No Presentations Yet</h4>
                <p style={{ color: '#888', marginBottom: '2rem', maxWidth: '500px', margin: '0 auto 2rem' }}>
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

// dashboard.js - SOPHISTICATED DESIGN VERSION

// dashboard.js - SOPHISTICATED DESIGN VERSION
