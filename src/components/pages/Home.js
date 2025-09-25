// import React from "react";
// import { useNavigate } from "react-router-dom";

// export default function Home() {
//   const navigate = useNavigate();

//   const goToUpload = () => {
//     navigate("/upload");
//   };

//   return (
//     <>
//       {/* Hero Section */}
//       <section
//         id="home"
//         className="text-white py-5"
//         style={{
//           background: "linear-gradient(to right, #07181eff, #4035bcff)",
//           backgroundColor: "#1c0942",
//           minHeight: "100vh",
//           display: "flex",
//           alignItems: "center",
//           marginTop: "-62px", // Offset for typical navbar height
//           paddingTop: "56px", // Add padding back for content
//         }}
//       >
//         <div className="container">
//           <div className="row align-items-center">
//             {/* Left Content */}
//             <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
//               <h1 className="display-3 fw-bold mb-4">
//                 Speak with Unwavering Confidence
//               </h1>
//               <p className="lead mb-4 opacity-75">
//                 Harness AI for actionable insights on your voice, gestures, and
//                 content. <br />
//                 Elevate every presentation with data-driven feedback powered by
//                 our backend API.
//               </p>
//               <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
//                 <button className="btn btn-light btn-lg" onClick={goToUpload}>
//                   <i className="bi bi-rocket-takeoff-fill me-2"></i>
//                   Get Started - It's Free!
//                 </button>
//                 <button
//                   className="btn btn-outline-light btn-lg"
//                   onClick={() =>
//                     window.open(
//                       "https://www.youtube.com/results?search_query=public+speaking+demo",
//                       "_blank"
//                     )
//                   }
//                 >
//                   <i className="bi bi-play-circle-fill me-2"></i>
//                   Watch Demo
//                 </button>
//               </div>
//             </div>

//             {/* Right Image */}
//             <div className="col-lg-6 text-center">
//               <img
//                 src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
//                 alt="Professional speaker presenting with confidence"
//                 className="img-fluid rounded-4 shadow-lg"
//                 style={{ maxHeight: "450px" }}
//               />
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Features Section */}
//       <section id="features" className="py-5 bg-light">
//         <div className="container">
//           {/* Section Heading */}
//           <div className="text-center mb-5">
//             <h2 className="display-5 fw-bold mb-3">
//               Unlock Every Dimension of Your Delivery
//             </h2>
//             <p className="lead text-muted">
//               Our AI analyzes what matters most for impactful public speaking
//             </p>
//           </div>

//           {/* Feature Cards */}
//           <div className="row g-4">
//             <div className="col-md-4">
//               <div className="card h-100 shadow-sm text-center">
//                 <div className="card-body p-4">
//                   <div className="text-primary mb-3">
//                     <i className="bi bi-chat-text-fill fs-1"></i>
//                   </div>
//                   <h4 className="fw-bold mb-3">Filler Word Mastery</h4>
//                   <p className="text-muted">
//                     Identify and reduce "um," "uh," and other speech disfluencies
//                     with precise tracking and actionable feedback.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="card h-100 shadow-sm text-center">
//                 <div className="card-body p-4">
//                   <div className="text-success mb-3">
//                     <i className="bi bi-hand-index-thumb-fill fs-1"></i>
//                   </div>
//                   <h4 className="fw-bold mb-3">Body Language Insights</h4>
//                   <p className="text-muted">
//                     Analyze gestures, posture, and movement patterns to enhance
//                     your non-verbal communication impact.
//                   </p>
//                 </div>
//               </div>
//             </div>

//             <div className="col-md-4">
//               <div className="card h-100 shadow-sm text-center">
//                 <div className="card-body p-4">
//                   <div className="text-warning mb-3">
//                     <i className="bi bi-graph-up fs-1"></i>
//                   </div>
//                   <h4 className="fw-bold mb-3">Confidence Analytics</h4>
//                   <p className="text-muted">
//                     Track vocal tone, pacing, and delivery strength with detailed
//                     confidence scoring and improvement trends.
//                   </p>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>
//     </>
//   );
// }

import React from "react";
import { useNavigate } from "react-router-dom";
import styled, { keyframes } from 'styled-components';
import { FaRocket, FaPlayCircle, FaMicrophone, FaHandshake, FaChartLine } from 'react-icons/fa';

// --- Animations ---
// const fadeIn = keyframes`
//   from { opacity: 0; transform: translateY(20px); }
//   to { opacity: 1; transform: translateY(0); }
// `;

const heroFadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

// --- Styled Components ---
const HomeWrapper = styled.div`
  min-height: 100vh;
  font-family: 'Inter', sans-serif;
  color: #f0f0f0;
`;

const HeroSection = styled.section`
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 6rem 1rem;
  text-align: center;
  overflow: hidden;
  position: relative;
  margin-top:-3.9rem;

  @media (min-width: 992px) {
    text-align: left;
  }

  &:before {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: url("https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=1920&q=80");
    background-size: cover;
    background-position: center;
    background-blend-mode: multiply;
    opacity: 0.15;
    z-index: 1;
  }
`;

const HeroContent = styled.div`
  position: relative;
  z-index: 2;
  animation: ${heroFadeIn} 1.5s ease-out;
`;

const HeroTitle = styled.h1`
  font-size: 3.5rem;
  font-weight: 700;
  line-height: 1.2;
  margin-bottom: 1rem;
  text-shadow: 0 4px 10px rgba(0, 0, 0, 0.3);

  @media (min-width: 768px) {
    font-size: 5rem;
  }
`;

const HeroSubtitle = styled.p`
  font-size: 1.25rem;
  max-width: 700px;
  margin: 0 auto 2rem;
  opacity: 0.8;
  line-height: 1.6;

  @media (min-width: 992px) {
    margin: 0 0 2rem;
  }
`;

const ButtonGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 1rem;
  justify-content: center;
  
  @media (min-width: 576px) {
    flex-direction: row;
    justify-content: center;
  }

  @media (min-width: 992px) {
    justify-content: flex-start;
  }
`;

const StyledButton = styled.button`
  padding: 1rem 2rem;
  font-size: 1rem;
  font-weight: 600;
  border-radius: 50px;
  border: none;
  cursor: pointer;
  transition: all 0.3s ease;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 0.5rem;
  text-transform: uppercase;
  letter-spacing: 1px;
  box-shadow: 0 4px 15px rgba(0, 0, 0, 0.2);

  &:hover {
    transform: translateY(-3px);
    box-shadow: 0 6px 20px rgba(0, 0, 0, 0.3);
  }
`;

const PrimaryButton = styled(StyledButton)`
  background: #f0f0f0;
  color: #1a1a1a;
`;

const SecondaryButton = styled(StyledButton)`
  background: transparent;
  color: #f0f0f0;
  border: 1px solid rgba(240, 240, 240, 0.5);
  &:hover {
    background: rgba(240, 240, 240, 0.1);
  }
`;

const FeaturesSection = styled.section`
  padding: 5rem 1rem;
  background-color: #f8f9fa;
  color: #1a1a1a;
`;

// const SectionHeader = styled.div`
//   text-align: center;
//   margin-bottom: 4rem;
// `;

const SectionTitle = styled.h2`
  font-size: 2.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const SectionSubtitle = styled.p`
  font-size: 1.1rem;
  color: #6c757d;
  max-width: 600px;
  margin: 0 auto;
`;

const FeatureCardContainer = styled.div`
  display: grid;
  gap: 1.5rem;
  grid-template-columns: 1fr;
  
  @media (min-width: 768px) {
    grid-template-columns: repeat(3, 1fr);
  }
`;

const FeatureCard = styled.div`
  background: #fff;
  border-radius: 12px;
  padding: 2.5rem;
  text-align: center;
  box-shadow: 0 8px 20px rgba(0, 0, 0, 0.1);
  transition: transform 0.3s ease, box-shadow 0.3s ease;
  
  &:hover {
    transform: translateY(-10px);
    box-shadow: 0 12px 30px rgba(0, 0, 0, 0.15);
  }
`;

const CardIcon = styled.div`
  font-size: 3rem;
  margin-bottom: 1rem;
  color: #1a1a1a;
`;

const CardTitle = styled.h4`
  font-size: 1.5rem;
  font-weight: 700;
  margin-bottom: 1rem;
`;

const CardDescription = styled.p`
  font-size: 1rem;
  color: #6c757d;
`;

export default function Home() {
  const navigate = useNavigate();

  const goToUpload = () => {
    navigate("/upload");
  };

  return (
    <HomeWrapper>
      {/* Hero Section */}
      <HeroSection>
        <div className="container">
          <HeroContent>
            <div className="row align-items-center">
              {/* Left Content */}
              <div className="col-lg-6">
                <HeroTitle>
                  Speak with Unwavering Confidence
                </HeroTitle>
                <HeroSubtitle>
                  Harness AI for actionable insights on your voice, gestures, and content. Elevate every presentation with data-driven feedback.
                </HeroSubtitle>
                <ButtonGroup>
                  <PrimaryButton onClick={goToUpload}>
                    <FaRocket />
                    Get Started - It's Free!
                  </PrimaryButton>
                  <SecondaryButton
                    onClick={() =>
                      window.open(
                        "https://www.youtube.com/results?search_query=public+speaking+demo",
                        "_blank"
                      )
                    }
                  >
                    <FaPlayCircle />
                    Watch Demo
                  </SecondaryButton>
                </ButtonGroup>
              </div>

              {/* Right Image Placeholder (the image is now in the background) */}
              <div className="col-lg-6 d-none d-lg-block">
                {/* This column is empty as the image is a background pseudo-element */}
              </div>
            </div>
          </HeroContent>
        </div>
      </HeroSection>

      {/* Features Section */}
      <FeaturesSection>
        <div className="container">
          {/* Using Bootstrap's grid to cover all 12 columns */}
          <div className="row">
            <div className="col-12 text-center mb-5">
              <SectionTitle>
                Unlock Every Dimension of Your Delivery
              </SectionTitle>
              <SectionSubtitle>
                Our AI analyzes what matters most for impactful public speaking.
              </SectionSubtitle>
            </div>
          </div>
          
          <FeatureCardContainer>
            <FeatureCard>
              <CardIcon>
                <FaMicrophone />
              </CardIcon>
              <CardTitle>Filler Word Mastery</CardTitle>
              <CardDescription>
                Identify and reduce "um," "uh," and other speech disfluencies with precise tracking and actionable feedback.
              </CardDescription>
            </FeatureCard>

            <FeatureCard>
              <CardIcon>
                <FaHandshake />
              </CardIcon>
              <CardTitle>Body Language Insights</CardTitle>
              <CardDescription>
                Analyze gestures, posture, and movement patterns to enhance your non-verbal communication impact.
              </CardDescription>
            </FeatureCard>

            <FeatureCard>
              <CardIcon>
                <FaChartLine />
              </CardIcon>
              <CardTitle>Confidence Analytics</CardTitle>
              <CardDescription>
                Track vocal tone, pacing, and delivery strength with detailed confidence scoring and improvement trends.
              </CardDescription>
            </FeatureCard>
          </FeatureCardContainer>
        </div>
      </FeaturesSection>
    </HomeWrapper>
  );
}