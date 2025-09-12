import React from "react";
import { useNavigate } from "react-router-dom";

export default function Home() {
  const navigate = useNavigate();

  const goToUpload = () => {
    navigate("/upload");
  };

  return (
    <>
      {/* Hero Section */}
      <section
        id="home"
        className="text-white py-5"
        style={{
          background: "linear-gradient(to right, #07181eff, #4035bcff)",
          backgroundColor: "#1c0942",
          minHeight: "100vh",
          display: "flex",
          alignItems: "center",
          marginTop: "-62px", // Offset for typical navbar height
          paddingTop: "56px", // Add padding back for content
        }}
      >
        <div className="container">
          <div className="row align-items-center">
            {/* Left Content */}
            <div className="col-lg-6 text-center text-lg-start mb-5 mb-lg-0">
              <h1 className="display-3 fw-bold mb-4">
                Speak with Unwavering Confidence
              </h1>
              <p className="lead mb-4 opacity-75">
                Harness AI for actionable insights on your voice, gestures, and
                content. <br />
                Elevate every presentation with data-driven feedback powered by
                our backend API.
              </p>
              <div className="d-flex flex-column flex-sm-row justify-content-center justify-content-lg-start gap-3">
                <button className="btn btn-light btn-lg" onClick={goToUpload}>
                  <i className="bi bi-rocket-takeoff-fill me-2"></i>
                  Get Started - It's Free!
                </button>
                <button
                  className="btn btn-outline-light btn-lg"
                  onClick={() =>
                    window.open(
                      "https://www.youtube.com/results?search_query=public+speaking+demo",
                      "_blank"
                    )
                  }
                >
                  <i className="bi bi-play-circle-fill me-2"></i>
                  Watch Demo
                </button>
              </div>
            </div>

            {/* Right Image */}
            <div className="col-lg-6 text-center">
              <img
                src="https://images.unsplash.com/photo-1556761175-b413da4baf72?ixlib=rb-4.0.3&auto=format&fit=crop&w=800&h=600"
                alt="Professional speaker presenting with confidence"
                className="img-fluid rounded-4 shadow-lg"
                style={{ maxHeight: "450px" }}
              />
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-5 bg-light">
        <div className="container">
          {/* Section Heading */}
          <div className="text-center mb-5">
            <h2 className="display-5 fw-bold mb-3">
              Unlock Every Dimension of Your Delivery
            </h2>
            <p className="lead text-muted">
              Our AI analyzes what matters most for impactful public speaking
            </p>
          </div>

          {/* Feature Cards */}
          <div className="row g-4">
            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body p-4">
                  <div className="text-primary mb-3">
                    <i className="bi bi-chat-text-fill fs-1"></i>
                  </div>
                  <h4 className="fw-bold mb-3">Filler Word Mastery</h4>
                  <p className="text-muted">
                    Identify and reduce "um," "uh," and other speech disfluencies
                    with precise tracking and actionable feedback.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body p-4">
                  <div className="text-success mb-3">
                    <i className="bi bi-hand-index-thumb-fill fs-1"></i>
                  </div>
                  <h4 className="fw-bold mb-3">Body Language Insights</h4>
                  <p className="text-muted">
                    Analyze gestures, posture, and movement patterns to enhance
                    your non-verbal communication impact.
                  </p>
                </div>
              </div>
            </div>

            <div className="col-md-4">
              <div className="card h-100 shadow-sm text-center">
                <div className="card-body p-4">
                  <div className="text-warning mb-3">
                    <i className="bi bi-graph-up fs-1"></i>
                  </div>
                  <h4 className="fw-bold mb-3">Confidence Analytics</h4>
                  <p className="text-muted">
                    Track vocal tone, pacing, and delivery strength with detailed
                    confidence scoring and improvement trends.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>
    </>
  );
}