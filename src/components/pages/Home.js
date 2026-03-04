// import React from "react";
// import { useNavigate } from "react-router-dom";
// import { FaRocket, FaPlayCircle, FaMicrophone, FaHandshake, FaChartLine } from "react-icons/fa";

// export default function Home() {
//   const navigate = useNavigate();

//   return (
//     <div className="bg-dark text-light min-vh-100 d-flex flex-column">
//       {/* Hero */}
//       <section className="hero-section py-5 py-lg-0 text-center text-lg-start d-flex align-items-center">
//         <div className="container position-relative">
//           <div className="row align-items-center">
//             <div className="col-lg-6 mx-auto mx-lg-0">
//               <h1 className="display-4 fw-bold text-shadow">
//                 Speak with Unwavering Confidence
//               </h1>
//               <p className="lead text-white-75 my-4">
//                 Harness AI for actionable insights on your voice, gestures, and content.
//                 Elevate every presentation with data-driven feedback.
//               </p>
//               <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
//                 <button
//                   className="btn btn-light btn-lg rounded-pill px-4 shadow-sm d-flex gap-2 justify-content-center align-items-center"
//                   onClick={() => navigate("/upload")}
//                 >
//                   <FaRocket /> Get Started – It’s Free!
//                 </button>
//                 <button
//                   className="btn btn-outline-light btn-lg rounded-pill px-4 d-flex gap-2 justify-content-center align-items-center"
//                   onClick={() =>
//                     window.open(
//                       "https://www.youtube.com/results?search_query=public+speaking+demo",
//                       "_blank"
//                     )
//                   }
//                 >
//                   <FaPlayCircle /> Watch Demo
//                 </button>
//               </div>
//             </div>
//             <div className="col-lg-6 d-none d-lg-block" />
//           </div>
//         </div>
//       </section>

//       {/* Features */}
//       <section className="py-5 bg-light text-dark flex-grow-1">
//         <div className="container">
//           <div className="text-center mb-5">
//             <h2 className="fw-bold mb-3">Unlock Every Dimension of Your Delivery</h2>
//             <p className="text-secondary lead">
//               Our AI analyzes what matters most for impactful public speaking.
//             </p>
//           </div>

//           <div className="row g-4">
//             <div className="col-md-6 col-lg-4">
//               <div className="card h-100 border-0 shadow feature-card text-center p-4">
//                 <div className="display-5 mb-3 text-primary"><FaMicrophone /></div>
//                 <h4>Filler Word Mastery</h4>
//                 <p className="text-secondary mb-0">
//                   Identify and reduce “um,” “uh,” and other speech disfluencies with precise tracking and actionable feedback.
//                 </p>
//               </div>
//             </div>

//             <div className="col-md-6 col-lg-4">
//               <div className="card h-100 border-0 shadow feature-card text-center p-4">
//                 <div className="display-5 mb-3 text-primary"><FaHandshake /></div>
//                 <h4>Body Language Insights</h4>
//                 <p className="text-secondary mb-0">
//                   Analyze gestures, posture, and movement patterns to enhance your non-verbal communication impact.
//                 </p>
//               </div>
//             </div>

//             <div className="col-md-6 col-lg-4 mx-md-auto mx-lg-0">
//               <div className="card h-100 border-0 shadow feature-card text-center p-4">
//                 <div className="display-5 mb-3 text-primary"><FaChartLine /></div>
//                 <h4>Confidence Analytics</h4>
//                 <p className="text-secondary mb-0">
//                   Track vocal tone, pacing, and delivery strength with detailed confidence scoring and improvement trends.
//                 </p>
//               </div>
//             </div>
//           </div>
//         </div>
//       </section>

//       {/* Local styles */}
//       <style>{`
//         .hero-section {
//   min-height: 100vh;
//   background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
//   position: relative;
//   overflow: hidden;
//   padding-top: 90px; /* ✅ add this */
// }
//         .hero-section::before {
//           content: "";
//           position: absolute;
//           inset: 0;
//           background-image: url("https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1920&q=80");
//           background-size: cover;
//           background-position: center;
//           opacity: 0.2;
//           mix-blend-mode: multiply;
//         }
//         .hero-section > .container {
//           position: relative;
//           z-index: 2;
//         }
//         .text-shadow {
//           text-shadow: 0 4px 10px rgba(0,0,0,0.4);
//         }
//         .feature-card {
//           border-radius: 1rem;
//           transition: transform 0.3s ease, box-shadow 0.3s ease;
//         }
//         .feature-card:hover {
//           transform: translateY(-6px);
//           box-shadow: 0 20px 35px rgba(0,0,0,0.1);
//         }
//         @media (max-width: 991px) {
//           .hero-section {
//             text-align: center;
//           }
//         }
//       `}</style>
//     </div>
//   );
// }

import React from "react";
import { useNavigate } from "react-router-dom";

const FEATURES = [
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
      </svg>
    ),
    title: "Filler Word Mastery",
    desc: 'Identify and eliminate "um," "uh," and other disfluencies with precise tracking and session-over-session trend data.',
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
      </svg>
    ),
    title: "Body Language Insights",
    desc: "AI-powered analysis of gestures, posture, and movement patterns to strengthen your non-verbal communication.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    title: "Confidence Analytics",
    desc: "Track vocal tone, pacing, and delivery strength with detailed scoring and improvement trends over time.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    ),
    title: "Real-Time Transcription",
    desc: "Dual-engine transcription via ElevenLabs and Deepgram — get word-perfect transcripts within seconds of upload.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
    title: "Gemini AI Coaching",
    desc: "Personalized feedback powered by Google Gemini — contextual, actionable, and tailored to your specific delivery.",
  },
  {
    icon: (
      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
          d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
      </svg>
    ),
    title: "Frame-by-Frame Analysis",
    desc: "Visual AI scans every key moment of your video — posture, expression, and slide alignment reviewed automatically.",
  },
];

const STATS = [
  { value: "98%", label: "Accuracy" },
  { value: "3s", label: "Avg. feedback" },
  { value: "6", label: "Indian languages" },
  { value: "500MB", label: "Max file size" },
];

const STEPS = [
  { num: "01", title: "Upload your video", desc: "Drop any MP4, MOV, AVI, MP3, or WAV file up to 500 MB." },
  { num: "02", title: "AI processes it", desc: "Transcription, visual analysis, and Gemini coaching run in parallel." },
  { num: "03", title: "Review your results", desc: "Get fluency scores, WPM, filler counts, and personalized feedback." },
];

export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F5F7] min-h-screen">

      {/* ── HERO ─────────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0A0A0F] overflow-hidden flex items-center">

        {/* Background image */}
        <div
          className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1920&q=80')",
            maskImage: "linear-gradient(180deg, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, black 60%, transparent 100%)",
          }}
        />

        {/* Subtle radial glow — not an orb, just ambient */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#007AFF] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            {/* Left */}
            <div className="lg:col-span-7 space-y-8">

              {/* Badge */}
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-medium">
                  AI-Powered Speech Analysis
                </span>
              </div>

              {/* Heading */}
              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-white">
                Speak with<br />
                <span className="text-white/40">Unwavering</span><br />
                Confidence
              </h1>

              <p className="text-white/50 text-lg leading-relaxed max-w-lg">
                Upload your presentation. Get instant AI feedback on speech clarity,
                delivery pace, and body language — so every talk lands.
              </p>

              {/* CTAs */}
              <div className="flex flex-col sm:flex-row gap-3">
                <button
                  onClick={() => navigate("/upload")}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#1D1D1F] text-sm font-semibold
                    px-7 py-3.5 rounded-full hover:bg-white/90 active:scale-95 transition-all duration-150"
                >
                  Get started — it's free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button
                  onClick={() => window.open("https://www.youtube.com/results?search_query=public+speaking+demo", "_blank")}
                  className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5
                    text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white/10
                    backdrop-blur-sm transition-all duration-150"
                >
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                    <path d="M8 5v14l11-7z" />
                  </svg>
                  Watch demo
                </button>
              </div>
            </div>

            {/* Right — stats card */}
            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 overflow-hidden">

                {/* Top stat */}
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
                        d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-3xl font-bold tracking-tight">150+</p>
                    <p className="text-white/40 text-sm">Presentations analyzed</p>
                  </div>
                </div>

                {/* Satisfaction bar */}
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">User satisfaction</span>
                    <span className="text-white font-medium">98%</span>
                  </div>
                  <div className="h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-white rounded-full" />
                  </div>
                </div>

                <div className="h-px bg-white/8 mb-6" />

                {/* Mini stats */}
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[
                    { val: "6", label: "Languages" },
                    { val: "3s", label: "Feedback" },
                    { val: "100%", label: "Private" },
                  ].map((s, i) => (
                    <div key={i}>
                      <p className="text-white text-xl font-bold">{s.val}</p>
                      <p className="text-white/30 text-[11px] uppercase tracking-widest mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>

                {/* Tags */}
                <div className="flex flex-wrap gap-2 mt-6">
                  <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
                    <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                    Live
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
                    Gemini AI
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
                    ElevenLabs
                  </span>
                  <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
                    Deepgram
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Bottom fade into next section */}
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
      </section>

      {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
      <section className="bg-white border-y border-[#E8E8ED]">
        <div className="max-w-4xl mx-auto px-6">
          <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F2F2F7]">
            {STATS.map((s, i) => (
              <div key={i} className="px-8 py-7 text-center">
                <p className="text-[#1D1D1F] text-2xl font-bold tabular-nums mb-0.5">{s.value}</p>
                <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
      <section className="py-20 px-6">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">How it works</p>
            <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight">Three steps to better speaking</h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            {STEPS.map((step, i) => (
              <div key={i} className="bg-white border border-[#E8E8ED] rounded-3xl p-7 shadow-sm">
                <p className="text-[#AEAEB2] text-xs font-semibold tracking-widest mb-5">{step.num}</p>
                <h3 className="text-[#1D1D1F] text-base font-semibold mb-2">{step.title}</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">{step.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-[#E8E8ED]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">Capabilities</p>
            <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight mb-3">
              Every dimension of your delivery
            </h2>
            <p className="text-[#6E6E73] text-base max-w-lg leading-relaxed">
              Our AI analyzes what actually matters for impactful public speaking — from words to posture.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div
                key={i}
                className="group bg-[#F5F5F7] hover:bg-white border border-transparent hover:border-[#E8E8ED]
                  rounded-2xl p-6 transition-all duration-200 hover:shadow-sm cursor-default"
              >
                <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8ED] flex items-center justify-center
                  text-[#6E6E73] group-hover:text-[#1D1D1F] group-hover:border-[#C7C7CC] transition-all duration-200 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-[#1D1D1F] text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ──────────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F5F5F7] border-t border-[#E8E8ED]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight mb-4">
            Ready to improve your speaking?
          </h2>
          <p className="text-[#6E6E73] text-base leading-relaxed mb-8">
            Upload your first presentation and get detailed AI feedback in under a minute.
            No credit card. No setup.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => navigate("/upload")}
              className="px-8 py-3.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full
                hover:bg-[#3A3A3C] active:scale-95 transition-all duration-150"
            >
              Upload your first presentation
            </button>
            <button
              onClick={() => navigate("/dashboard")}
              className="px-8 py-3.5 bg-white border border-[#E8E8ED] text-[#1D1D1F] text-sm font-semibold
                rounded-full hover:bg-[#F5F5F7] active:scale-95 transition-all duration-150"
            >
              View dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ───────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E8ED] bg-white px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#AEAEB2] text-sm">© 2025 VoiceAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map(link => (
              <button key={link} className="text-[#AEAEB2] text-sm hover:text-[#1D1D1F] transition-colors duration-150">
                {link}
              </button>
            ))}
          </div>
        </div>
      </footer>

    </div>
  );
}