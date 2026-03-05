// // import React from "react";
// // import { useNavigate } from "react-router-dom";
// // import { FaRocket, FaPlayCircle, FaMicrophone, FaHandshake, FaChartLine } from "react-icons/fa";

// // export default function Home() {
// //   const navigate = useNavigate();

// //   return (
// //     <div className="bg-dark text-light min-vh-100 d-flex flex-column">
// //       {/* Hero */}
// //       <section className="hero-section py-5 py-lg-0 text-center text-lg-start d-flex align-items-center">
// //         <div className="container position-relative">
// //           <div className="row align-items-center">
// //             <div className="col-lg-6 mx-auto mx-lg-0">
// //               <h1 className="display-4 fw-bold text-shadow">
// //                 Speak with Unwavering Confidence
// //               </h1>
// //               <p className="lead text-white-75 my-4">
// //                 Harness AI for actionable insights on your voice, gestures, and content.
// //                 Elevate every presentation with data-driven feedback.
// //               </p>
// //               <div className="d-flex flex-column flex-sm-row gap-3 justify-content-center justify-content-lg-start">
// //                 <button
// //                   className="btn btn-light btn-lg rounded-pill px-4 shadow-sm d-flex gap-2 justify-content-center align-items-center"
// //                   onClick={() => navigate("/upload")}
// //                 >
// //                   <FaRocket /> Get Started – It’s Free!
// //                 </button>
// //                 <button
// //                   className="btn btn-outline-light btn-lg rounded-pill px-4 d-flex gap-2 justify-content-center align-items-center"
// //                   onClick={() =>
// //                     window.open(
// //                       "https://www.youtube.com/results?search_query=public+speaking+demo",
// //                       "_blank"
// //                     )
// //                   }
// //                 >
// //                   <FaPlayCircle /> Watch Demo
// //                 </button>
// //               </div>
// //             </div>
// //             <div className="col-lg-6 d-none d-lg-block" />
// //           </div>
// //         </div>
// //       </section>

// //       {/* Features */}
// //       <section className="py-5 bg-light text-dark flex-grow-1">
// //         <div className="container">
// //           <div className="text-center mb-5">
// //             <h2 className="fw-bold mb-3">Unlock Every Dimension of Your Delivery</h2>
// //             <p className="text-secondary lead">
// //               Our AI analyzes what matters most for impactful public speaking.
// //             </p>
// //           </div>

// //           <div className="row g-4">
// //             <div className="col-md-6 col-lg-4">
// //               <div className="card h-100 border-0 shadow feature-card text-center p-4">
// //                 <div className="display-5 mb-3 text-primary"><FaMicrophone /></div>
// //                 <h4>Filler Word Mastery</h4>
// //                 <p className="text-secondary mb-0">
// //                   Identify and reduce “um,” “uh,” and other speech disfluencies with precise tracking and actionable feedback.
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="col-md-6 col-lg-4">
// //               <div className="card h-100 border-0 shadow feature-card text-center p-4">
// //                 <div className="display-5 mb-3 text-primary"><FaHandshake /></div>
// //                 <h4>Body Language Insights</h4>
// //                 <p className="text-secondary mb-0">
// //                   Analyze gestures, posture, and movement patterns to enhance your non-verbal communication impact.
// //                 </p>
// //               </div>
// //             </div>

// //             <div className="col-md-6 col-lg-4 mx-md-auto mx-lg-0">
// //               <div className="card h-100 border-0 shadow feature-card text-center p-4">
// //                 <div className="display-5 mb-3 text-primary"><FaChartLine /></div>
// //                 <h4>Confidence Analytics</h4>
// //                 <p className="text-secondary mb-0">
// //                   Track vocal tone, pacing, and delivery strength with detailed confidence scoring and improvement trends.
// //                 </p>
// //               </div>
// //             </div>
// //           </div>
// //         </div>
// //       </section>

// //       {/* Local styles */}
// //       <style>{`
// //         .hero-section {
// //   min-height: 100vh;
// //   background: linear-gradient(135deg, #0f0c29, #302b63, #24243e);
// //   position: relative;
// //   overflow: hidden;
// //   padding-top: 90px; /* ✅ add this */
// // }
// //         .hero-section::before {
// //           content: "";
// //           position: absolute;
// //           inset: 0;
// //           background-image: url("https://images.unsplash.com/photo-1556761175-b413da4baf72?auto=format&fit=crop&w=1920&q=80");
// //           background-size: cover;
// //           background-position: center;
// //           opacity: 0.2;
// //           mix-blend-mode: multiply;
// //         }
// //         .hero-section > .container {
// //           position: relative;
// //           z-index: 2;
// //         }
// //         .text-shadow {
// //           text-shadow: 0 4px 10px rgba(0,0,0,0.4);
// //         }
// //         .feature-card {
// //           border-radius: 1rem;
// //           transition: transform 0.3s ease, box-shadow 0.3s ease;
// //         }
// //         .feature-card:hover {
// //           transform: translateY(-6px);
// //           box-shadow: 0 20px 35px rgba(0,0,0,0.1);
// //         }
// //         @media (max-width: 991px) {
// //           .hero-section {
// //             text-align: center;
// //           }
// //         }
// //       `}</style>
// //     </div>
// //   );
// // }

// import React from "react";
// import { useNavigate } from "react-router-dom";

// const FEATURES = [
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//           d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
//       </svg>
//     ),
//     title: "Filler Word Mastery",
//     desc: 'Identify and eliminate "um," "uh," and other disfluencies with precise tracking and session-over-session trend data.',
//   },
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//           d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" />
//       </svg>
//     ),
//     title: "Body Language Insights",
//     desc: "AI-powered analysis of gestures, posture, and movement patterns to strengthen your non-verbal communication.",
//   },
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//           d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//       </svg>
//     ),
//     title: "Confidence Analytics",
//     desc: "Track vocal tone, pacing, and delivery strength with detailed scoring and improvement trends over time.",
//   },
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//           d="M13 10V3L4 14h7v7l9-11h-7z" />
//       </svg>
//     ),
//     title: "Real-Time Transcription",
//     desc: "Dual-engine transcription via ElevenLabs and Deepgram — get word-perfect transcripts within seconds of upload.",
//   },
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//           d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
//       </svg>
//     ),
//     title: "Gemini AI Coaching",
//     desc: "Personalized feedback powered by Google Gemini — contextual, actionable, and tailored to your specific delivery.",
//   },
//   {
//     icon: (
//       <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//         <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//           d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" />
//       </svg>
//     ),
//     title: "Frame-by-Frame Analysis",
//     desc: "Visual AI scans every key moment of your video — posture, expression, and slide alignment reviewed automatically.",
//   },
// ];

// const STATS = [
//   { value: "98%", label: "Accuracy" },
//   { value: "3s", label: "Avg. feedback" },
//   { value: "6", label: "Indian languages" },
//   { value: "500MB", label: "Max file size" },
// ];

// const STEPS = [
//   { num: "01", title: "Upload your video", desc: "Drop any MP4, MOV, AVI, MP3, or WAV file up to 500 MB." },
//   { num: "02", title: "AI processes it", desc: "Transcription, visual analysis, and Gemini coaching run in parallel." },
//   { num: "03", title: "Review your results", desc: "Get fluency scores, WPM, filler counts, and personalized feedback." },
// ];

// export default function Home() {
//   const navigate = useNavigate();

//   return (
//     <div className="bg-[#F5F5F7] min-h-screen">

//       {/* ── HERO ─────────────────────────────────────────────────────────── */}
//       <section className="relative min-h-screen bg-[#0A0A0F] overflow-hidden flex items-center">

//         {/* Background image */}
//         <div
//           className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
//           style={{
//             backgroundImage: "url('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1920&q=80')",
//             maskImage: "linear-gradient(180deg, black 0%, black 60%, transparent 100%)",
//             WebkitMaskImage: "linear-gradient(180deg, black 0%, black 60%, transparent 100%)",
//           }}
//         />

//         {/* Subtle radial glow — not an orb, just ambient */}
//         <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#007AFF] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

//         <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 w-full">
//           <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

//             {/* Left */}
//             <div className="lg:col-span-7 space-y-8">

//               {/* Badge */}
//               <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 backdrop-blur-md">
//                 <span className="relative flex h-2 w-2">
//                   <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
//                   <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
//                 </span>
//                 <span className="text-[11px] uppercase tracking-widest text-white/60 font-medium">
//                   AI-Powered Speech Analysis
//                 </span>
//               </div>

//               {/* Heading */}
//               <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-white">
//                 Speak with<br />
//                 <span className="text-white/40">Unwavering</span><br />
//                 Confidence
//               </h1>

//               <p className="text-white/50 text-lg leading-relaxed max-w-lg">
//                 Upload your presentation. Get instant AI feedback on speech clarity,
//                 delivery pace, and body language — so every talk lands.
//               </p>

//               {/* CTAs */}
//               <div className="flex flex-col sm:flex-row gap-3">
//                 <button
//                   onClick={() => navigate("/upload")}
//                   className="inline-flex items-center justify-center gap-2 bg-white text-[#1D1D1F] text-sm font-semibold
//                     px-7 py-3.5 rounded-full hover:bg-white/90 active:scale-95 transition-all duration-150"
//                 >
//                   Get started — it's free
//                   <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                     <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
//                   </svg>
//                 </button>
//                 <button
//                   onClick={() => window.open("https://www.youtube.com/results?search_query=public+speaking+demo", "_blank")}
//                   className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5
//                     text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white/10
//                     backdrop-blur-sm transition-all duration-150"
//                 >
//                   <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
//                     <path d="M8 5v14l11-7z" />
//                   </svg>
//                   Watch demo
//                 </button>
//               </div>
//             </div>

//             {/* Right — stats card */}
//             <div className="lg:col-span-5">
//               <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 overflow-hidden">

//                 {/* Top stat */}
//                 <div className="flex items-center gap-4 mb-8">
//                   <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
//                     <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
//                       <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
//                         d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
//                     </svg>
//                   </div>
//                   <div>
//                     <p className="text-white text-3xl font-bold tracking-tight">150+</p>
//                     <p className="text-white/40 text-sm">Presentations analyzed</p>
//                   </div>
//                 </div>

//                 {/* Satisfaction bar */}
//                 <div className="mb-8">
//                   <div className="flex justify-between text-sm mb-2">
//                     <span className="text-white/40">User satisfaction</span>
//                     <span className="text-white font-medium">98%</span>
//                   </div>
//                   <div className="h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
//                     <div className="h-full w-[98%] bg-white rounded-full" />
//                   </div>
//                 </div>

//                 <div className="h-px bg-white/8 mb-6" />

//                 {/* Mini stats */}
//                 <div className="grid grid-cols-3 gap-4 text-center">
//                   {[
//                     { val: "6", label: "Languages" },
//                     { val: "3s", label: "Feedback" },
//                     { val: "100%", label: "Private" },
//                   ].map((s, i) => (
//                     <div key={i}>
//                       <p className="text-white text-xl font-bold">{s.val}</p>
//                       <p className="text-white/30 text-[11px] uppercase tracking-widest mt-0.5">{s.label}</p>
//                     </div>
//                   ))}
//                 </div>

//                 {/* Tags */}
//                 <div className="flex flex-wrap gap-2 mt-6">
//                   <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
//                     <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
//                     Live
//                   </span>
//                   <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
//                     Gemini AI
//                   </span>
//                   <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
//                     ElevenLabs
//                   </span>
//                   <span className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
//                     Deepgram
//                   </span>
//                 </div>
//               </div>
//             </div>
//           </div>
//         </div>

//         {/* Bottom fade into next section */}
//         <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
//       </section>

//       {/* ── STATS STRIP ──────────────────────────────────────────────────── */}
//       <section className="bg-white border-y border-[#E8E8ED]">
//         <div className="max-w-4xl mx-auto px-6">
//           <div className="grid grid-cols-2 md:grid-cols-4 divide-x divide-[#F2F2F7]">
//             {STATS.map((s, i) => (
//               <div key={i} className="px-8 py-7 text-center">
//                 <p className="text-[#1D1D1F] text-2xl font-bold tabular-nums mb-0.5">{s.value}</p>
//                 <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium">{s.label}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── HOW IT WORKS ─────────────────────────────────────────────────── */}
//       <section className="py-20 px-6">
//         <div className="max-w-4xl mx-auto">
//           <div className="mb-12">
//             <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">How it works</p>
//             <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight">Three steps to better speaking</h2>
//           </div>

//           <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
//             {STEPS.map((step, i) => (
//               <div key={i} className="bg-white border border-[#E8E8ED] rounded-3xl p-7 shadow-sm">
//                 <p className="text-[#AEAEB2] text-xs font-semibold tracking-widest mb-5">{step.num}</p>
//                 <h3 className="text-[#1D1D1F] text-base font-semibold mb-2">{step.title}</h3>
//                 <p className="text-[#6E6E73] text-sm leading-relaxed">{step.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── FEATURES GRID ────────────────────────────────────────────────── */}
//       <section className="py-20 px-6 bg-white border-t border-[#E8E8ED]">
//         <div className="max-w-4xl mx-auto">
//           <div className="mb-12">
//             <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">Capabilities</p>
//             <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight mb-3">
//               Every dimension of your delivery
//             </h2>
//             <p className="text-[#6E6E73] text-base max-w-lg leading-relaxed">
//               Our AI analyzes what actually matters for impactful public speaking — from words to posture.
//             </p>
//           </div>

//           <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
//             {FEATURES.map((f, i) => (
//               <div
//                 key={i}
//                 className="group bg-[#F5F5F7] hover:bg-white border border-transparent hover:border-[#E8E8ED]
//                   rounded-2xl p-6 transition-all duration-200 hover:shadow-sm cursor-default"
//               >
//                 <div className="w-10 h-10 rounded-xl bg-white border border-[#E8E8ED] flex items-center justify-center
//                   text-[#6E6E73] group-hover:text-[#1D1D1F] group-hover:border-[#C7C7CC] transition-all duration-200 mb-4">
//                   {f.icon}
//                 </div>
//                 <h3 className="text-[#1D1D1F] text-sm font-semibold mb-2">{f.title}</h3>
//                 <p className="text-[#6E6E73] text-sm leading-relaxed">{f.desc}</p>
//               </div>
//             ))}
//           </div>
//         </div>
//       </section>

//       {/* ── CTA ──────────────────────────────────────────────────────────── */}
//       <section className="py-20 px-6 bg-[#F5F5F7] border-t border-[#E8E8ED]">
//         <div className="max-w-2xl mx-auto text-center">
//           <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight mb-4">
//             Ready to improve your speaking?
//           </h2>
//           <p className="text-[#6E6E73] text-base leading-relaxed mb-8">
//             Upload your first presentation and get detailed AI feedback in under a minute.
//             No credit card. No setup.
//           </p>
//           <div className="flex flex-col sm:flex-row gap-3 justify-center">
//             <button
//               onClick={() => navigate("/upload")}
//               className="px-8 py-3.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full
//                 hover:bg-[#3A3A3C] active:scale-95 transition-all duration-150"
//             >
//               Upload your first presentation
//             </button>
//             <button
//               onClick={() => navigate("/dashboard")}
//               className="px-8 py-3.5 bg-white border border-[#E8E8ED] text-[#1D1D1F] text-sm font-semibold
//                 rounded-full hover:bg-[#F5F5F7] active:scale-95 transition-all duration-150"
//             >
//               View dashboard
//             </button>
//           </div>
//         </div>
//       </section>

//       {/* ── FOOTER ───────────────────────────────────────────────────────── */}
//       <footer className="border-t border-[#E8E8ED] bg-white px-6 py-8">
//         <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
//           <p className="text-[#AEAEB2] text-sm">© 2025 VoiceAI. All rights reserved.</p>
//           <div className="flex items-center gap-6">
//             {["Privacy", "Terms", "Contact"].map(link => (
//               <button key={link} className="text-[#AEAEB2] text-sm hover:text-[#1D1D1F] transition-colors duration-150">
//                 {link}
//               </button>
//             ))}
//           </div>
//         </div>
//       </footer>

//     </div>
//   );
// }
import React, { useState, useRef, useEffect } from "react";
import { useNavigate } from "react-router-dom";

// ─── TIMELINE DATA — each step has a page, route, and what you do there ───────
const TIMELINE_DATA = [
  {
    id: 1,
    step: "Step 1",
    title: "Create Your Account",
    page: "Login / Sign Up",
    route: "/login",
    pageBadgeColor: "#007AFF",
    content: "Go to the Login page. Click 'Sign Up', enter your email and a password. That's it — you're in. No credit card needed.",
    whatYouSee: "A simple sign-in form. Fill it in and press Sign Up.",
    tip: "Already signed up before? Just enter your email and password and press Sign In.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
      </svg>
    ),
    relatedIds: [2],
    color: "#007AFF",
    energy: 100,
  },
  {
    id: 2,
    step: "Step 2",
    title: "Upload Your Speech",
    page: "Upload Page",
    route: "/upload",
    pageBadgeColor: "#34C759",
    content: "Go to the Upload page. Drag and drop your video or audio file, or click to browse. Supported formats: MP4, MOV, AVI, MP3, WAV — up to 500MB.",
    whatYouSee: "A big drag-and-drop box. Just drop your file there and the AI starts automatically.",
    tip: "No video? You can also paste text directly on this page and still get AI feedback on your words.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
      </svg>
    ),
    relatedIds: [1, 3],
    color: "#34C759",
    energy: 85,
  },
  {
    id: 3,
    step: "Step 3",
    title: "AI Processes It",
    page: "Upload Page",
    route: "/upload",
    pageBadgeColor: "#FF9F0A",
    content: "After you upload, stay on the Upload page. A progress bar shows what is happening: uploading, transcribing, analysing frames, then Gemini AI coaching. This takes 30–90 seconds.",
    whatYouSee: "A spinning loader and progress percentage. You do not need to do anything — just wait.",
    tip: "Do not close the page while it is processing. Results appear right below when done.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    relatedIds: [2, 4],
    color: "#FF9F0A",
    energy: 70,
  },
  {
    id: 4,
    step: "Step 4",
    title: "Read Your Results",
    page: "Dashboard",
    route: "/dashboard",
    pageBadgeColor: "#BF5AF2",
    content: "Go to your Dashboard. Here you see your fluency score, words per minute, how many filler words you used, your full transcript, and personal AI coaching written in plain English.",
    whatYouSee: "Score cards at the top, your video player, your transcript below, and an AI coaching section. All of your past uploads are saved here too.",
    tip: "The AI coaching section tells you exactly what to work on next. Read it carefully — it is personalised to your speech.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
      </svg>
    ),
    relatedIds: [3, 5],
    color: "#BF5AF2",
    energy: 55,
  },
  {
    id: 5,
    step: "Step 5",
    title: "Practice with Teleprompter",
    page: "Teleprompter",
    route: "/teleprompter",
    pageBadgeColor: "#FF3B30",
    content: "Go to the Teleprompter page. Paste your speech script and it scrolls automatically while you speak — so you never lose your place or forget your words.",
    whatYouSee: "A large scrolling text area. You control the speed with a slider. Great for rehearsing before a presentation.",
    tip: "Use this to practise the speech you plan to upload next. Then upload the recording and compare your scores.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
      </svg>
    ),
    relatedIds: [4, 6],
    color: "#FF3B30",
    energy: 40,
  },
  {
    id: 6,
    step: "Step 6",
    title: "Try Text-to-Speech",
    page: "TTS Page",
    route: "/tts",
    pageBadgeColor: "#30D158",
    content: "Go to the TTS page. Type any text and hear it spoken in a natural AI voice. Use this to hear how your script sounds before you record yourself saying it.",
    whatYouSee: "A text box and a Play button. Type your speech, press play, and listen to an AI read it back to you.",
    tip: "Listen to the AI read your script, then try to match that pace and tone when you record yourself on the Upload page.",
    icon: (
      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15.536 8.464a5 5 0 010 7.072M12 6v12m-3.536-9.536a5 5 0 000 7.072M6.343 6.343a8 8 0 000 11.314" />
      </svg>
    ),
    relatedIds: [5, 2],
    color: "#30D158",
    energy: 95,
  },
];

// ─── ORBITAL TIMELINE COMPONENT ───────────────────────────────────────────────
function OrbitalTimeline({ data }) {
  const [expandedId, setExpandedId] = useState(null);
  const [rotation, setRotation] = useState(0);
  const [autoRotate, setAutoRotate] = useState(true);
  const containerRef = useRef(null);
  const timerRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    if (autoRotate) {
      timerRef.current = setInterval(() => {
        setRotation(prev => (prev + 0.35) % 360);
      }, 50);
    }
    return () => clearInterval(timerRef.current);
  }, [autoRotate]);

  const handleNodeClick = (id) => {
    if (expandedId === id) {
      setExpandedId(null);
      setAutoRotate(true);
    } else {
      setExpandedId(id);
      setAutoRotate(false);
    }
  };

  const getPosition = (index, total) => {
    const angle = ((index / total) * 360 + rotation) % 360;
    const radius = 170;
    const rad = (angle * Math.PI) / 180;
    const x = radius * Math.cos(rad);
    const y = radius * Math.sin(rad);
    const zIndex = Math.round(100 + 50 * Math.cos(rad));
    const opacity = Math.max(0.35, Math.min(1, 0.35 + 0.65 * ((1 + Math.sin(rad)) / 2)));
    return { x, y, zIndex, opacity };
  };

  const activeItem = data.find(d => d.id === expandedId);

  return (
    <div
      ref={containerRef}
      onClick={(e) => {
        if (e.target === containerRef.current) {
          setExpandedId(null);
          setAutoRotate(true);
        }
      }}
      className="relative w-full flex items-center justify-center select-none"
      style={{ height: "520px" }}
    >
      {/* Orbit rings */}
      <div className="absolute w-[340px] h-[340px] rounded-full border border-[#E8E8ED] pointer-events-none" />
      <div className="absolute w-[240px] h-[240px] rounded-full border border-[#F2F2F7] pointer-events-none" />

      {/* Center hub */}
      <div className="absolute z-10 flex flex-col items-center justify-center w-20 h-20 rounded-full bg-[#1D1D1F] shadow-xl pointer-events-none">
        <svg className="w-6 h-6 text-white mb-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5}
            d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" />
        </svg>
        <span className="text-white/50 text-[9px] uppercase tracking-widest font-semibold">Start</span>
      </div>

      {/* Nodes */}
      {data.map((item, index) => {
        const pos = getPosition(index, data.length);
        const isExpanded = expandedId === item.id;
        const isRelated = activeItem?.relatedIds.includes(item.id);

        return (
          <div
            key={item.id}
            onClick={(e) => { e.stopPropagation(); handleNodeClick(item.id); }}
            className="absolute cursor-pointer transition-all duration-500"
            style={{
              transform: `translate(${pos.x}px, ${pos.y}px)`,
              zIndex: isExpanded ? 200 : pos.zIndex,
              opacity: isExpanded ? 1 : pos.opacity,
            }}
          >
            {/* Node */}
            <div
              className={`w-11 h-11 rounded-full flex items-center justify-center border-2 transition-all duration-300
                ${isExpanded ? "scale-125 shadow-lg" : isRelated ? "scale-110" : "hover:scale-110"}`}
              style={{
                backgroundColor: isExpanded ? item.color : "#fff",
                borderColor: item.color,
                color: isExpanded ? "#fff" : item.color,
                boxShadow: isExpanded ? `0 0 24px ${item.color}50` : undefined,
              }}
            >
              {item.icon}
            </div>

            {/* Label */}
            <div className="absolute text-center whitespace-nowrap" style={{ top: "50px", left: "50%", transform: "translateX(-50%)" }}>
              <p className="text-[#1D1D1F] text-[11px] font-semibold">{item.title}</p>
              <p className="text-[#AEAEB2] text-[10px]">{item.step}</p>
            </div>

            {/* Expanded card */}
            {isExpanded && (
              <div
                className="absolute bg-white border border-[#E8E8ED] rounded-2xl shadow-2xl overflow-hidden"
                style={{ width: "272px", top: "64px", left: "50%", transform: "translateX(-50%)", zIndex: 300 }}
                onClick={e => e.stopPropagation()}
              >
                {/* Color top bar */}
                <div className="h-1 w-full" style={{ backgroundColor: item.color }} />

                <div className="p-4">
                  {/* Page badge + step */}
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-bold uppercase tracking-widest px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: item.color }}>
                      {item.step}
                    </span>
                    <span className="text-[11px] font-semibold text-[#1D1D1F] bg-[#F5F5F7] border border-[#E8E8ED] px-2.5 py-1 rounded-full flex items-center gap-1">
                      <svg className="w-3 h-3 text-[#6E6E73]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                      </svg>
                      {item.page}
                    </span>
                  </div>

                  {/* Title */}
                  <h4 className="text-[#1D1D1F] text-sm font-bold mb-2">{item.title}</h4>

                  {/* What to do */}
                  <p className="text-[#3A3A3C] text-xs leading-relaxed mb-3">{item.content}</p>

                  {/* What you see */}
                  <div className="bg-[#F5F5F7] rounded-xl p-3 mb-3">
                    <p className="text-[#AEAEB2] text-[10px] uppercase tracking-widest font-semibold mb-1">What you will see</p>
                    <p className="text-[#3A3A3C] text-xs leading-relaxed">{item.whatYouSee}</p>
                  </div>

                  {/* Tip */}
                  <div className="border border-[#E8E8ED] rounded-xl p-3 mb-3">
                    <p className="text-[#6E6E73] text-xs leading-relaxed">
                      <span className="font-semibold text-[#1D1D1F]">Tip: </span>{item.tip}
                    </p>
                  </div>

                  {/* Go to page button */}
                  <button
                    onClick={() => navigate(item.route)}
                    className="w-full py-2.5 rounded-xl text-white text-xs font-semibold flex items-center justify-center gap-2 transition-opacity hover:opacity-90 active:scale-95"
                    style={{ backgroundColor: item.color }}
                  >
                    Go to {item.page}
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                    </svg>
                  </button>

                  {/* Related steps */}
                  {item.relatedIds.length > 0 && (
                    <div className="mt-3 pt-3 border-t border-[#F2F2F7]">
                      <p className="text-[#AEAEB2] text-[10px] uppercase tracking-widest font-medium mb-2">Next steps</p>
                      <div className="flex flex-wrap gap-1.5">
                        {item.relatedIds.map(rid => {
                          const rel = data.find(d => d.id === rid);
                          return rel ? (
                            <button
                              key={rid}
                              onClick={(e) => { e.stopPropagation(); handleNodeClick(rid); }}
                              className="text-[11px] font-medium px-2.5 py-1 rounded-lg border border-[#E8E8ED] text-[#1D1D1F] hover:bg-[#F5F5F7] transition-colors flex items-center gap-1"
                            >
                              {rel.step}: {rel.title}
                              <svg className="w-2.5 h-2.5 text-[#AEAEB2]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                              </svg>
                            </button>
                          ) : null;
                        })}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>
        );
      })}

      {!expandedId && (
        <div className="absolute bottom-2 left-1/2 -translate-x-1/2 pointer-events-none">
          <p className="text-[#AEAEB2] text-xs text-center">Tap any step to see which page to go to</p>
        </div>
      )}
    </div>
  );
}

// ─── FEATURES ─────────────────────────────────────────────────────────────────
const FEATURES = [
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M19 11a7 7 0 01-7 7m0 0a7 7 0 01-7-7m7 7v4m0 0H8m4 0h4m-4-8a3 3 0 01-3-3V5a3 3 0 116 0v6a3 3 0 01-3 3z" /></svg>),
    title: "Filler Word Mastery",
    desc: 'Identify and eliminate "um" and "uh" disfluencies with precise tracking and session-over-session trend data.',
  },
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z" /></svg>),
    title: "Body Language Insights",
    desc: "AI-powered analysis of gestures, posture, and movement patterns to strengthen your non-verbal communication.",
  },
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" /></svg>),
    title: "Confidence Analytics",
    desc: "Track vocal tone, pacing, and delivery strength with detailed scoring and improvement trends over time.",
  },
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" /></svg>),
    title: "Real-Time Transcription",
    desc: "Dual-engine transcription via ElevenLabs and Deepgram — word-perfect transcripts within seconds of upload.",
  },
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" /></svg>),
    title: "Gemini AI Coaching",
    desc: "Personalized feedback powered by Google Gemini — contextual, actionable, tailored to your delivery.",
  },
  {
    icon: (<svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M7 4v16M17 4v16M3 8h4m10 0h4M3 12h18M3 16h4m10 0h4M4 20h16a1 1 0 001-1V5a1 1 0 00-1-1H4a1 1 0 00-1 1v14a1 1 0 001 1z" /></svg>),
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

// ─── HOME ─────────────────────────────────────────────────────────────────────
export default function Home() {
  const navigate = useNavigate();

  return (
    <div className="bg-[#F5F5F7] min-h-screen">

      {/* ── HERO ──────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen bg-[#0A0A0F] overflow-hidden flex items-center">
        <div className="absolute inset-0 z-0 bg-cover bg-center opacity-20"
          style={{
            backgroundImage: "url('https://images.unsplash.com/photo-1475721027785-f74eccf877e2?auto=format&fit=crop&w=1920&q=80')",
            maskImage: "linear-gradient(180deg, black 0%, black 60%, transparent 100%)",
            WebkitMaskImage: "linear-gradient(180deg, black 0%, black 60%, transparent 100%)",
          }}
        />
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-[#007AFF] opacity-[0.04] rounded-full blur-[120px] pointer-events-none" />

        <div className="relative z-10 max-w-6xl mx-auto px-6 pt-32 pb-24 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">

            <div className="lg:col-span-7 space-y-8">
              <div className="inline-flex items-center gap-2 border border-white/10 bg-white/5 rounded-full px-4 py-1.5 backdrop-blur-md">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500" />
                </span>
                <span className="text-[11px] uppercase tracking-widest text-white/60 font-medium">AI-Powered Speech Analysis</span>
              </div>

              <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[0.95] text-white">
                Speak with<br />
                <span className="text-white/40">Unwavering</span><br />
                Confidence
              </h1>

              <p className="text-white/50 text-lg leading-relaxed max-w-lg">
                Upload your presentation. Get instant AI feedback on speech clarity,
                delivery pace, and body language — so every talk lands.
              </p>

              <div className="flex flex-col sm:flex-row gap-3">
                <button onClick={() => navigate("/upload")}
                  className="inline-flex items-center justify-center gap-2 bg-white text-[#1D1D1F] text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white/90 active:scale-95 transition-all duration-150">
                  Get started — it is free
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 8l4 4m0 0l-4 4m4-4H3" />
                  </svg>
                </button>
                <button onClick={() => window.open("https://www.youtube.com/results?search_query=public+speaking+demo", "_blank")}
                  className="inline-flex items-center justify-center gap-2 border border-white/10 bg-white/5 text-white text-sm font-semibold px-7 py-3.5 rounded-full hover:bg-white/10 backdrop-blur-sm transition-all duration-150">
                  <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24"><path d="M8 5v14l11-7z" /></svg>
                  Watch demo
                </button>
              </div>
            </div>

            <div className="lg:col-span-5">
              <div className="relative rounded-3xl border border-white/10 bg-white/[0.04] backdrop-blur-xl p-8 overflow-hidden">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/10 flex items-center justify-center">
                    <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-white text-3xl font-bold tracking-tight">150+</p>
                    <p className="text-white/40 text-sm">Presentations analyzed</p>
                  </div>
                </div>
                <div className="mb-8">
                  <div className="flex justify-between text-sm mb-2">
                    <span className="text-white/40">User satisfaction</span>
                    <span className="text-white font-medium">98%</span>
                  </div>
                  <div className="h-[3px] w-full bg-white/10 rounded-full overflow-hidden">
                    <div className="h-full w-[98%] bg-white rounded-full" />
                  </div>
                </div>
                <div className="h-px bg-white/[0.08] mb-6" />
                <div className="grid grid-cols-3 gap-4 text-center">
                  {[{ val: "6", label: "Languages" }, { val: "3s", label: "Feedback" }, { val: "100%", label: "Private" }].map((s, i) => (
                    <div key={i}>
                      <p className="text-white text-xl font-bold">{s.val}</p>
                      <p className="text-white/30 text-[11px] uppercase tracking-widest mt-0.5">{s.label}</p>
                    </div>
                  ))}
                </div>
                <div className="flex flex-wrap gap-2 mt-6">
                  {["Live", "Gemini AI", "ElevenLabs", "Deepgram"].map((tag, i) => (
                    <span key={i} className="inline-flex items-center gap-1.5 border border-white/10 bg-white/5 rounded-full px-3 py-1 text-[11px] text-white/50 font-medium">
                      {tag === "Live" && <span className="w-1.5 h-1.5 rounded-full bg-green-500" />}
                      {tag}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-24 bg-gradient-to-t from-[#F5F5F7] to-transparent pointer-events-none" />
      </section>

      {/* ── STATS STRIP ────────────────────────────────────────────────── */}
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

      {/* ── HOW TO USE — ORBITAL TIMELINE ──────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-[#E8E8ED]">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-6">
            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">Complete guide</p>
            <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight mb-3">How to use SpeakMasterAI</h2>
            <p className="text-[#6E6E73] text-base max-w-lg mx-auto leading-relaxed">
              Six steps in order. Tap any step on the orbit to see exactly which page to go to,
              what you will see there, and what to do.
            </p>
          </div>

          {/* Orbital */}
          <OrbitalTimeline data={TIMELINE_DATA} />

          {/* Step-by-step list — clear for everyone */}
          <div className="mt-6 space-y-3">
            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium px-1 mb-4">Follow this order</p>
            {TIMELINE_DATA.map((item) => (
              <div key={item.id}
                className="flex items-center gap-4 bg-[#F5F5F7] hover:bg-white border border-transparent hover:border-[#E8E8ED] rounded-2xl p-4 transition-all duration-150 group">
                {/* Step number */}
                <div className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 text-white text-xs font-bold"
                  style={{ backgroundColor: item.color }}>
                  {item.id}
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5 flex-wrap">
                    <p className="text-[#1D1D1F] text-sm font-semibold">{item.title}</p>
                    <span className="text-[10px] font-semibold px-2 py-0.5 rounded-full border text-white"
                      style={{ backgroundColor: item.pageBadgeColor, borderColor: item.pageBadgeColor }}>
                      {item.page}
                    </span>
                  </div>
                  <p className="text-[#6E6E73] text-xs leading-relaxed truncate">{item.content}</p>
                </div>

                {/* Go button */}
                <button
                  onClick={() => navigate(item.route)}
                  className="flex-shrink-0 flex items-center gap-1.5 text-xs font-semibold px-3 py-2 rounded-xl text-white transition-opacity hover:opacity-80 active:scale-95"
                  style={{ backgroundColor: item.color }}
                >
                  Open
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FEATURES GRID ──────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-[#F5F5F7] border-t border-[#E8E8ED]">
        <div className="max-w-4xl mx-auto">
          <div className="mb-12">
            <p className="text-[#AEAEB2] text-xs uppercase tracking-widest font-medium mb-2">Capabilities</p>
            <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight mb-3">Every dimension of your delivery</h2>
            <p className="text-[#6E6E73] text-base max-w-lg leading-relaxed">
              Our AI analyzes what actually matters for impactful public speaking — from words to posture.
            </p>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {FEATURES.map((f, i) => (
              <div key={i} className="group bg-white border border-[#E8E8ED] hover:border-[#C7C7CC] rounded-2xl p-6 transition-all duration-200 hover:shadow-sm cursor-default">
                <div className="w-10 h-10 rounded-xl bg-[#F5F5F7] border border-[#E8E8ED] flex items-center justify-center text-[#6E6E73] group-hover:text-[#1D1D1F] transition-all duration-200 mb-4">
                  {f.icon}
                </div>
                <h3 className="text-[#1D1D1F] text-sm font-semibold mb-2">{f.title}</h3>
                <p className="text-[#6E6E73] text-sm leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ───────────────────────────────────────────────────────── */}
      <section className="py-20 px-6 bg-white border-t border-[#E8E8ED]">
        <div className="max-w-2xl mx-auto text-center">
          <h2 className="text-[#1D1D1F] text-3xl font-bold tracking-tight mb-4">Ready to improve your speaking?</h2>
          <p className="text-[#6E6E73] text-base leading-relaxed mb-8">
            Upload your first presentation and get detailed AI feedback in under a minute. No credit card. No setup.
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button onClick={() => navigate("/upload")}
              className="px-8 py-3.5 bg-[#1D1D1F] text-white text-sm font-semibold rounded-full hover:bg-[#3A3A3C] active:scale-95 transition-all duration-150">
              Upload your first presentation
            </button>
            <button onClick={() => navigate("/dashboard")}
              className="px-8 py-3.5 bg-[#F5F5F7] border border-[#E8E8ED] text-[#1D1D1F] text-sm font-semibold rounded-full hover:bg-[#E8E8ED] active:scale-95 transition-all duration-150">
              View dashboard
            </button>
          </div>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#E8E8ED] bg-[#F5F5F7] px-6 py-8">
        <div className="max-w-4xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-[#AEAEB2] text-sm">© 2025 SpeakMasterAI. All rights reserved.</p>
          <div className="flex items-center gap-6">
            {["Privacy", "Terms", "Contact"].map(link => (
              <button key={link} className="text-[#AEAEB2] text-sm hover:text-[#1D1D1F] transition-colors duration-150">{link}</button>
            ))}
          </div>
        </div>
      </footer>
    </div>
  );
}