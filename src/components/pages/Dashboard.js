// ============================================
// FILE 3: Dashboard.js - COMPLETE FIX
// ============================================

import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';

const fadeIn = keyframes`
  from { opacity: 0; transform: translateY(20px); }
  to { opacity: 1; transform: translateY(0); }
`;

const spin = keyframes`
  from { transform: rotate(0deg); }
  to { transform: rotate(360deg); }
`;

const DashboardContainer = styled.div`
  min-height: 100vh;
  background-color: #1a1a1a;
  color: #c0c0c0;
  font-family: 'Satoshi', 'Inter', sans-serif;
  animation: ${fadeIn} 0.8s ease-out;
`;

const Header = styled.header`
  background: linear-gradient(135deg, #2b2b2b 0%, #1a1a1a 100%);
  padding: 6rem 0;
  margin-bottom: 3rem;
  box-shadow: 0 4px 25px rgba(0, 0, 0, 0.6);
  text-align: center;
  margin-top:-3.9rem;
`;

const HeaderTitle = styled.h1`
  font-family: 'Satoshi', sans-serif;
  font-size: 4rem;
  font-weight: 700;
  color: #f0f0f0;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.4);
  letter-spacing: 2px;
`;

const HeaderSubtitle = styled.p`
  font-size: 1.25rem;
  opacity: 0.8;
  max-width: 800px;
  margin: 0 auto;
  font-family: 'Inter', sans-serif;
  letter-spacing: 0.5px;
`;

const MainContent = styled.main`
  max-width: 1400px;
  margin: 0 auto;
  padding: 0 2rem 5rem;
`;

const DataCard = styled.div`
  background-color: rgba(30, 30, 30, 0.8);
  backdrop-filter: blur(10px);
  border-radius: 16px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 8px 30px rgba(0, 0, 0, 0.5);
  overflow: hidden;
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-8px);
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.7);
  }
`;

const CardHeader = styled.div`
  background: linear-gradient(135deg, #2a2a2a 0%, #1a1a1a 100%);
  padding: 2rem;
  color: #fff;
  display: flex;
  justify-content: space-between;
  align-items: center;
  border-bottom: 1px solid rgba(255, 255, 255, 0.05);
`;

const CardTitle = styled.h3`
  font-family: 'Satoshi', sans-serif;
  font-size: 1.8rem;
  font-weight: 600;
  margin: 0;
  letter-spacing: 1px;
`;

const FluencyBadge = styled.span`
  font-size: 1.1rem;
  font-weight: 600;
  padding: 0.75rem 2rem;
  border-radius: 50px;
  color: #1a1a1a;
  background: ${({ score }) => {
    if (score >= 90) return '#b8d6be';
    if (score >= 70) return '#e0d8b4';
    return '#e0b4b4';
  }};
  box-shadow: 0 2px 10px rgba(0,0,0,0.3);
`;

const CardBody = styled.div`
  padding: 3rem;
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;

  @media (min-width: 992px) {
    grid-template-columns: 1fr 2fr;
  }
`;

const AnalyticsGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 3rem;
`;

const VideoPlayerContainer = styled.div`
  width: 100%;
  position: relative;
  padding-top: 56.25%;
`;

const StyledVideo = styled.video`
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  border-radius: 12px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  object-fit: cover;
`;

const SectionTitle = styled.h5`
  font-size: 1.4rem;
  font-weight: 600;
  color: #FFFFFF;
  margin-bottom: 1.5rem;
  display: flex;
  align-items: center;
  gap: 0.75rem;
`;

const StatGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr;
  gap: 1.5rem;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(2, 1fr);
  }
`;

const StatCard = styled.div`
  background-color: rgba(255, 255, 255, 0.05);
  border-radius: 12px;
  padding: 2rem;
  text-align: center;
  border: 1px solid rgba(255, 255, 255, 0.05);
  transition: background-color 0.3s;

  &:hover {
    background-color: rgba(255, 255, 255, 0.1);
  }
`;

const StatValue = styled.div`
  font-size: 3.5rem;
  font-weight: 700;
  color: #e6b95b;
  line-height: 1;
`;

const StatLabel = styled.small`
  font-size: 1rem;
  color: #999;
  font-weight: 500;
  text-transform: uppercase;
  letter-spacing: 1px;
`;

const TranscriptBlockquote = styled.blockquote`
  background-color: rgba(255, 255, 255, 0.05);
  border-left: 5px solid #e6b95b;
  padding: 1.5rem 2rem;
  border-radius: 12px;
  margin: 0;
`;

const TranscriptText = styled.p`
  font-size: 1rem;
  line-height: 1.8;
  color: #E0E0E0;
  font-style: italic;
`;

const KeyframesGrid = styled.div`
  display: grid;
  grid-template-columns: repeat(auto-fill, minmax(150px, 1fr));
  gap: 1rem;
`;

const FrameImage = styled.img`
  width: 100%;
  aspect-ratio: 16/9;
  object-fit: cover;
  border-radius: 8px;
  border: 1px solid rgba(255, 255, 255, 0.1);
  box-shadow: 0 4px 15px rgba(0,0,0,0.3);
  transition: transform 0.2s;

  &:hover {
    transform: scale(1.05);
    z-index: 10;
  }
`;

const LoadingMessage = styled.div`
  text-align: center;
  padding: 5rem 0;
  color: #999;
  font-size: 1.25rem;
  display: flex;
  flex-direction: column;
  align-items: center;
`;

const Spinner = styled.div`
  border: 4px solid #333;
  border-top: 4px solid #e6b95b;
  border-radius: 50%;
  width: 40px;
  height: 40px;
  animation: ${spin} 1s linear infinite;
  margin-bottom: 1rem;
`;

const ErrorMessage = styled.div`
  background-color: #331f22;
  border-left: 5px solid #dc3545;
  padding: 2rem;
  border-radius: 12px;
  color: #E0E0E0;
  box-shadow: 0 4px 15px rgba(0,0,0,0.4);
`;

const PlaceholderCard = styled(DataCard)`
  text-align: center;
  padding: 5rem;
  background-color: rgba(30, 30, 30, 0.8);
`;

const PlaceholderEmoji = styled.div`
  font-size: 5rem;
  margin-bottom: 1rem;
  filter: grayscale(100%) opacity(50%);
`;

const PlaceholderButton = styled.a`
  display: inline-block;
  background: linear-gradient(45deg, #e6b95b, #c69c5a);
  color: #1a1a1a;
  border: none;
  padding: 1rem 3rem;
  font-size: 1.1rem;
  font-weight: 600;
  border-radius: 50px;
  cursor: pointer;
  transition: transform 0.2s, box-shadow 0.2s;
  text-decoration: none;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

function Dashboard() {
  const [metadataList, setMetadataList] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);

  const BACKEND_URL = process.env.REACT_APP_BACKEND_URL || 'https://voicebackend-20.onrender.com';

  useEffect(() => {
    const fetchMetadata = async () => {
      try {
        setIsLoading(true);
        setError(null);

        console.log('🔍 Fetching from:', `${BACKEND_URL}/api/metadata`);

        const response = await fetch(`${BACKEND_URL}/api/metadata`, {
          method: 'GET',
          headers: { 
            'Content-Type': 'application/json',
            'Accept': 'application/json'
          }
        });

        console.log('📥 Response status:', response.status);

        if (!response.ok) {
          let errorMessage = `HTTP ${response.status}`;
          try {
            const errorData = await response.json();
            errorMessage = errorData.error || errorData.message || errorMessage;
          } catch {
            const errorText = await response.text();
            errorMessage = errorText || errorMessage;
          }
          throw new Error(errorMessage);
        }

        const data = await response.json();
        console.log('✅ Received data:', data);

        // Handle different response formats
        if (Array.isArray(data)) {
          setMetadataList(data);
        } else if (data.success && Array.isArray(data.data)) {
          setMetadataList(data.data);
        } else if (data.data && Array.isArray(data.data)) {
          setMetadataList(data.data);
        } else {
          console.warn('⚠️ Unexpected format:', data);
          setMetadataList([]);
        }

      } catch (err) {
        console.error('💥 Error:', err);
        setError(err.message);
      } finally {
        setIsLoading(false);
      }
    };

    fetchMetadata();
  }, [BACKEND_URL]);

  const countMetrics = (item) => {
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

    if (wordsArray.length > 0) {
      const fillerWords = ['uh', 'um', 'like', 'you know', 'so', 'and', 'but', 'well', 'actually', 'basically'];
      fillerWordsCount = wordsArray.filter(word =>
        fillerWords.includes(word.word?.toLowerCase())
      ).length;
    }

    if (item.deepgram_transcript) {
      const pauses = item.deepgram_transcript.match(/\[PAUSE:.*?\]/g);
      if (pauses) pausesCount = pauses.length;
    }

    return { fillerWordsCount, pausesCount, totalWords: wordsArray.length };
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

  return (
    <DashboardContainer>
      <Header>
        <HeaderTitle>Video Analytics Dashboard</HeaderTitle>
        <HeaderSubtitle>
          Professional insights from your video content with advanced speech and visual analytics.
        </HeaderSubtitle>
      </Header>

      <MainContent>
        {isLoading && (
          <LoadingMessage>
            <Spinner />
            <span>Fetching video analytics...</span>
          </LoadingMessage>
        )}

        {error && (
          <ErrorMessage>
            <h4>⚠️ Connection Error</h4>
            <p>Unable to fetch data: <strong>{error}</strong></p>
            <p style={{ opacity: 0.8, marginTop: '1rem' }}>
              Backend: <code>{BACKEND_URL}/api/metadata</code>
            </p>
          </ErrorMessage>
        )}

        {!isLoading && !error && (
          <>
            {metadataList.length > 0 ? (
              <div className="d-flex flex-column gap-5">
                {metadataList.map(item => {
                  const { fillerWordsCount, pausesCount, totalWords } = countMetrics(item);
                  const fluencyScore = totalWords > 0
                    ? ((totalWords - fillerWordsCount) / totalWords) * 100
                    : 100;

                  return (
                    <DataCard key={item.id}>
                      <CardHeader>
                        <div>
                          <CardTitle>🎥 {item.original_name || item.video_name || 'Untitled Video'}</CardTitle>
                          <p style={{ margin: 0, fontSize: '0.9rem', opacity: 0.8 }}>
                            Uploaded: {formatDate(item.created_at)}
                          </p>
                        </div>
                        <FluencyBadge score={fluencyScore}>
                          📈 {fluencyScore.toFixed(1)}% Fluency
                        </FluencyBadge>
                      </CardHeader>

                      <CardBody>
                        <div style={{ paddingRight: '2rem' }}>
                          <SectionTitle>▶️ Video Preview</SectionTitle>
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
                                <span style={{ opacity: 0.7 }}>No video available</span>
                              </div>
                            )}
                          </VideoPlayerContainer>
                        </div>

                        <AnalyticsGrid>
                          <div>
                            <SectionTitle>📊 Speech Analytics</SectionTitle>
                            <StatGrid>
                              <StatCard>
                                <StatValue>{totalWords}</StatValue>
                                <StatLabel>Total Words</StatLabel>
                              </StatCard>
                              <StatCard>
                                <StatValue>{fillerWordsCount}</StatValue>
                                <StatLabel>Filler Words</StatLabel>
                              </StatCard>
                              <StatCard style={{ gridColumn: 'span 2' }}>
                                <StatValue>{pausesCount}</StatValue>
                                <StatLabel>Speech Pauses</StatLabel>
                              </StatCard>
                            </StatGrid>
                          </div>
                          
                          <div>
                            <SectionTitle>💬 Transcript</SectionTitle>
                            <TranscriptBlockquote>
                              <TranscriptText>
                                {item.deepgram_transcript || item.elevenlabs_transcript || 'No transcript available.'}
                              </TranscriptText>
                            </TranscriptBlockquote>
                          </div>

                          {item.gemini_analysis && (
                            <div>
                              <SectionTitle>🤖 AI Analysis</SectionTitle>
                              <TranscriptBlockquote>
                                <TranscriptText style={{ fontStyle: 'normal' }}>
                                  {item.gemini_analysis}
                                </TranscriptText>
                              </TranscriptBlockquote>
                            </div>
                          )}

                          <div>
                            <SectionTitle>🖼️ Key Frames ({item.frames ? (Array.isArray(item.frames) ? item.frames.length : 0) : 0})</SectionTitle>
                            {item.frames && Array.isArray(item.frames) && item.frames.length > 0 ? (
                              <KeyframesGrid>
                                {item.frames.map((frame, index) => (
                                  <a key={index} href={frame.frame_url || frame.url} target="_blank" rel="noopener noreferrer">
                                    <FrameImage src={frame.frame_url || frame.url} alt={`Frame ${index + 1}`} />
                                  </a>
                                ))}
                              </KeyframesGrid>
                            ) : (
                              <p style={{ opacity: 0.7, fontStyle: 'italic' }}>
                                No key frames extracted.
                              </p>
                            )}
                          </div>
                        </AnalyticsGrid>
                      </CardBody>
                    </DataCard>
                  );
                })}
              </div>
            ) : (
              <PlaceholderCard>
                <PlaceholderEmoji>🎥</PlaceholderEmoji>
                <h4 style={{ color: '#fff' }}>No Videos Found</h4>
                <p style={{ color: '#888' }}>
                  Upload your first video to start analyzing speech patterns and visual insights.
                </p>
                <PlaceholderButton href="/upload">
                  📤 Upload Video
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
