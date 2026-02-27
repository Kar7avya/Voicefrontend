import React from "react";
import { useNavigate } from "react-router-dom";
import { FaRocket, FaPlayCircle, FaMicrophone, FaHandshake, FaChartLine } from "react-icons/fa";

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-dark text-light min-vh-100 d-flex flex-column">
      {/* Hero */}
      <section className="hero-section py-5 py-lg-0 text-center text-lg-start d-flex align-items-center">
        <div className="container position-relative">
          <div className="row align-items-center">
            <div className="col-lg-6 mx-auto mx-lg-0">
              <h1 className="display-4 fw-bold text-shadow">
                Speak with Unwavering Confidence
              </h1>
              <p className="lead text-white-75 my-4">
                Harness AI for actionable insights on your voice, gestures, and content.
                Elevate every presentation with data-driven feedback.
              </p>
              <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
                <button
                  className="btn btn-light btn-lg rounded-pill px-4 shadow-sm d-flex gap-2 justify-content-center align-items-center"
                  onClick={() => navigate("/upload")}
                >
                  <FaRocket /> Get Started – It’s Free!
                </button>
                <button
                  className="btn btn-outline-light btn-lg rounded-pill px-4 d-flex gap-2 justify-content-center align-items-center"
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/results?search_query=public+speaking+demo",
                      "_blank"
                    )
                  }
                >
                  <FaPlayCircle /> Watch Demo
                </button>
              </div>
            </div>
            <div className="col-lg-6 d-none d-lg-block" />
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="py-5 bg-light text-dark flex-grow-1">
        <div className="container">
          <div className="text-center mb-5">
            <h2 className="fw-bold mb-3">Unlock Every Dimension of Your Delivery</h2>
            <p className="text-secondary lead">
              Our AI analyzes what matters most for impactful public speaking.
            </p>
          </div>

          <div className="row g-4">
            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow feature-card text-center p-4">
                <div className="display-5 mb-3 text-primary"><FaMicrophone /></div>
                <h4>Filler Word Mastery</h4>
                <p className="text-secondary mb-0">
                  Identify and reduce “um,” “uh,” and other speech disfluencies with precise tracking and actionable feedback.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4">
              <div className="card h-100 border-0 shadow feature-card text-center p-4">
                <div className="display-5 mb-3 text-primary"><FaHandshake /></div>
                <h4>Body Language Insights</h4>
                <p className="text-secondary mb-0">
                  Analyze gestures, posture, and movement patterns to enhance your non-verbal communication impact.
                </p>
              </div>
            </div>

            <div className="col-md-6 col-lg-4 mx-md-auto mx-lg-0">
              <div className="card h-100 border-0 shadow feature-card text-center p-4">
                <div className="display-5 mb-3 text-primary"><FaChartLine /></div>
                <h4>Confidence Analytics</h4>
                <p className="text-secondary mb-0">
                  Track vocal tone, pacing, and delivery strength with detailed confidence scoring and improvement trends.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Local styles */}
      <style>{`
        .hero-section {
  min-height: 100vh;
  background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
  position: relative;
  overflow: hidden;
  padding-top: 90px; /* ✅ add this */
}
        .hero-section::before {
          content: "";
          position: absolute;
          inset: 0;
          background-image: url("https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1920&q=80");
          background-size: cover;
          background-position: center;
          opacity: 0.2;
          mix-blend-mode: multiply;
        }
        .hero-section > .container {
          position: relative;
          z-index: 2;
        }
        .text-shadow {
          text-shadow: 0 4px 10px rgba(0,0,0,0.4);
        }
        .feature-card {
          border-radius: 1rem;
          transition: transform 0.3s ease, box-shadow 0.3s ease;
        }
        .feature-card:hover {
          transform: translateY(-6px);
          box-shadow: 0 20px 35px rgba(0,0,0,0.1);
        }
        @media (max-width: 991px) {
          .hero-section {
            text-align: center;
          }
        }
      `}</style>
    </div>
  );
}