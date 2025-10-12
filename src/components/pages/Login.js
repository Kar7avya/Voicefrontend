// // import React, { useState, useEffect } from "react";
// // import { useNavigate, useLocation } from "react-router-dom";
// // import { toast } from "react-toastify";
// // import { Eye, EyeOff } from "lucide-react";
// // import supabase from "./supabaseClient";
// // import shivaji from '../pages/shivaji.jpg';
// // import savarkar from '../pages/veersavarkar.jpg';
// // import bose from '../pages/subhashchandrabose.jpg';
// // import vivekananda from '../pages/swamivivekanand.jpg';
// // import michand from '../pages/michand.png';
// // import aurobindo from '../pages/aurobindo.jpg';

// // const Login = () => {
// //   const navigate = useNavigate();
// //   const location = useLocation();

// //   const [formData, setFormData] = useState({ email: "", password: "" });
// //   const [loading, setLoading] = useState(false);
// //   const [supabaseReady, setSupabaseReady] = useState(false);
// //   const [showPassword, setShowPassword] = useState(false);
// //   const [currentSlide, setCurrentSlide] = useState(0);

// //   // Add this useEffect to remove body margins/padding
// //   useEffect(() => {
// //     document.body.style.margin = '0';
// //     document.body.style.padding = '0';
// //     document.body.style.overflow = 'hidden';
// //     document.documentElement.style.margin = '0';
// //     document.documentElement.style.padding = '0';
    
// //     return () => {
// //       document.body.style.overflow = 'auto';
// //     };
// //   }, []);

// //   // Hero images with quotes
// //   const slides = [
// //     {
// //       image: shivaji,
// //       quote: "Freedom is a boon, which everyone has the right to receive.",
// //       author: "Chhatrapati Shivaji Maharaj",
// //       filter: "contrast(1.2)"
// //     },
// //     {
// //     image: aurobindo,
// //     quote: "Sanatan Dharma, that is Nationalism. This Hindu nation was born with Sanatan Dharma, with it moves and with it grows.",
// //     author: "Sri Aurobindo",
// //     filter: "grayscale(100%) contrast(1.2)"
// //   },
// //     {
// //       image: savarkar,
// //       quote: "Let us remember that the sole aim and objective is to secure the Hindu nation.",
// //       author: "Veer Savarkar",
// //       filter: "grayscale(100%) contrast(1.2)"
// //     },
// //     {
// //       image: bose,
// //       quote: "Give me blood, and I shall give you freedom.",
// //       author: "Subhash Chandra Bose",
// //       filter: "grayscale(100%) contrast(1.2)"
// //     },
// //     {
// //       image: vivekananda,
// //       quote: "Arise, awake and stop not till the goal is reached.",
// //       author: "Swami Vivekananda",
// //       filter: "grayscale(100%) contrast(1.2)"
// //     }
// //   ];

// //   // Auto-slide functionality
// //   useEffect(() => {
// //     const timer = setInterval(() => {
// //       setCurrentSlide((prev) => (prev + 1) % slides.length);
// //     }, 5000);
// //     return () => clearInterval(timer);
// //   }, []);

// //   // Check if user is already logged in
// //   useEffect(() => {
// //     const checkAuth = async () => {
// //       try {
// //         const { data: { session } } = await supabase.auth.getSession();
// //         if (session) {
// //           console.log("✅ User already logged in, redirecting...");
// //           navigate("/home");
// //           return;
// //         }
// //         setSupabaseReady(true);
// //       } catch (err) {
// //         console.error("❌ Auth check failed:", err);
// //         setSupabaseReady(true);
// //       }
// //     };
    
// //     checkAuth();
// //   }, [navigate]);

// //   useEffect(() => {
// //     const params = new URLSearchParams(location.search);
// //     if (params.get("message") === "verify-email") {
// //       const pendingEmail = sessionStorage.getItem("pending_email");
// //       if (pendingEmail) {
// //         setFormData((prev) => ({ ...prev, email: pendingEmail }));
// //         toast.info("Please verify your email before logging in.");
// //         sessionStorage.removeItem("pending_email");
// //       }
// //     }
// //   }, [location]);

// //   function handleChange(e) {
// //     setFormData((prev) => ({
// //       ...prev,
// //       [e.target.name]: e.target.value,
// //     }));
// //   }

// //   async function handleSubmit(e) {
// //     e.preventDefault();
    
// //     if (!formData.email || !formData.password) {
// //       toast.error("Please fill in all fields");
// //       return;
// //     }

// //     if (!formData.email.includes("@")) {
// //       toast.error("Please enter a valid email address");
// //       return;
// //     }

// //     setLoading(true);
    
// //     try {
// //       console.log("🔄 Attempting login for:", formData.email);
      
// //       const { data, error } = await supabase.auth.signInWithPassword({
// //         email: formData.email,
// //         password: formData.password,
// //       });

// //       console.log("🔍 Supabase login response:", { data, error });

// //       if (error) {
// //         console.error("❌ Login error:", error);
        
// //         if (error.message.includes("Email not confirmed")) {
// //           toast.error("Please check your email and confirm your account first.");
// //         } else if (error.message.includes("Invalid login credentials")) {
// //           toast.error("Invalid email or password. Please check your credentials.");
// //         } else if (error.message.includes("Too many requests")) {
// //           toast.error("Too many login attempts. Please try again later.");
// //         } else if (error.message.includes("Email address not confirmed")) {
// //           toast.error("Please verify your email address before logging in.");
// //         } else {
// //           toast.error(error.message || "Login failed. Please try again.");
// //         }
// //         return;
// //       }

// //       if (data.session && data.user) {
// //         console.log("✅ Login successful:", data.user.email);
        
// //         const userName = data.session.user.user_metadata?.full_name || 
// //                         data.session.user.email.split("@")[0] || 
// //                         "User";
        
// //         toast.success(`Welcome back, ${userName}!`);
// //         navigate("/home");
// //       } else {
// //         console.error("❌ No session returned from login");
// //         toast.error("Login failed. Please try again.");
// //       }
      
// //     } catch (err) {
// //       console.error("⚡ Unexpected login error:", err);
      
// //       if (err.message.includes("fetch")) {
// //         toast.error("Network error. Please check your connection and try again.");
// //       } else if (err.message.includes("Failed to fetch")) {
// //         toast.error("Unable to connect to authentication service. Please try again.");
// //       } else {
// //         toast.error("Something went wrong. Please try again.");
// //       }
// //     } finally {
// //       setLoading(false);
// //     }
// //   }

// //   const handleForgotPassword = async () => {
// //     if (!formData.email) {
// //       toast.error("Please enter your email address first");
// //       return;
// //     }

// //     try {
// //       const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
// //         redirectTo: `${window.location.origin}/reset-password`,
// //       });

// //       if (error) {
// //         toast.error(error.message);
// //       } else {
// //         toast.success("Password reset email sent! Check your inbox.");
// //       }
// //     } catch (err) {
// //       toast.error("Failed to send reset email");
// //     }
// //   };

// //   if (!supabaseReady) {
// //     return (
// //       <div style={{ 
// //         position: "fixed",
// //         top: 0,
// //         left: 0,
// //         right: 0,
// //         bottom: 0,
// //         display: "flex", 
// //         alignItems: "center", 
// //         justifyContent: "center",
// //         backgroundColor: "#0f0f0f",
// //         margin: 0,
// //         padding: 0
// //       }}>
// //         <div style={{ textAlign: "center", color: "white" }}>
// //           <div style={{ 
// //             width: "50px", 
// //             height: "50px", 
// //             border: "4px solid rgba(255,255,255,0.1)",
// //             borderTop: "4px solid white",
// //             borderRadius: "50%",
// //             animation: "spin 1s linear infinite",
// //             margin: "0 auto 1rem"
// //           }}></div>
// //           <p>Loading authentication service...</p>
// //         </div>
// //         <style>{`
// //           @keyframes spin {
// //             0% { transform: rotate(0deg); }
// //             100% { transform: rotate(360deg); }
// //           }
// //         `}</style>
// //       </div>
// //     );
// //   }

// //   return (
// //     <div style={{
// //       position: "fixed",
// //       top: 0,
// //       left: 0,
// //       right: 0,
// //       bottom: 0,
// //       display: "flex",
// //       backgroundColor: "#0f0f0f",
// //       fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
// //       margin: 0,
// //       padding: 0,
// //       overflow: "hidden"
// //     }}>
// //       {/* Left Side - Image Slider with Quotes */}
// //       <div style={{
// //         flex: 1,
// //         position: "relative",
// //         overflow: "hidden",
// //         backgroundColor: "#000"
// //       }}>
// //         {/* Logo */}
// //         <div style={{
// //           position: "absolute",
// //           top: "2rem",
// //           left: "2rem",
// //           fontSize: "1.8rem",
// //           fontWeight: "bold",
// //           color: "white",
// //           zIndex: 20,
// //           letterSpacing: "3px"
// //         }}>
// //           {/* <img 
// //   src={michand} 
// //   alt="Logo" 
// //   style={{
// //     width: "70px",
// //     height: "70px",
// //     borderRadius: "50%",
// //     backgroundColor: "#f4f4f4",
// //     padding: "10px",
// //     objectFit: "cover"
// //   }} 
// // /> */}
// //         </div>

// //         {/* Back to website button
// //         <button 
// //           onClick={() => window.location.href = '/'}
// //           style={{
// //             position: "absolute",
// //             top: "2rem",
// //             right: "2rem",
// //             background: "rgba(255, 255, 255, 0.1)",
// //             backdropFilter: "blur(10px)",
// //             border: "1px solid rgba(255, 255, 255, 0.2)",
// //             color: "white",
// //             padding: "0.75rem 1.5rem",
// //             borderRadius: "8px",
// //             cursor: "pointer",
// //             fontSize: "0.95rem",
// //             zIndex: 20,
// //             transition: "all 0.3s"
// //           }}
// //         >
// //           Back to website →
// //         </button> */}

// //         {/* Image Slides */}
// //         {slides.map((slide, index) => (
// //           <div
// //             key={index}
// //             style={{
// //               position: "absolute",
// //               inset: 0,
// //               opacity: currentSlide === index ? 1 : 0,
// //               transition: "opacity 1.5s ease-in-out",
// //               pointerEvents: currentSlide === index ? "auto" : "none"
// //             }}
// //           >
// //             <img 
// //               src={slide.image}
// //               alt={slide.author}
// //               style={{
// //     width: "100%",
// //     height: "100%",
// //     objectFit: "cover",
// //     objectPosition: "center 10%",  // ← ADD THIS LINE (adjust 30% to move image up/down)
// //     filter: slide.filter,
// //     display: "block",
// //     margin: "2rem"  // ← ADD THIS LINE (creates space around image)
// //   }}
// //             />
// //             {/* Dark overlay */}
// //             <div style={{
// //               position: "absolute",
// //               inset: 0,
// //               background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)"
// //             }} />
// //           </div>
// //         ))}

// //         {/* Quote Section */}
// //         <div style={{
// //           position: "absolute",
// //           bottom: "4rem",
// //           left: "50%",
// //           transform: "translateX(-50%)",
// //           textAlign: "center",
// //           color: "white",
// //           maxWidth: "700px",
// //           padding: "0 2rem",
// //           zIndex: 10,
// //           animation: currentSlide >= 0 ? "fadeInUp 1s ease-out" : "none"
// //         }}>
// //           <h2 style={{
// //             fontSize: "2.2rem",
// //             fontWeight: "300",
// //             lineHeight: "1.5",
// //             marginBottom: "1.5rem",
// //             textShadow: "0 2px 20px rgba(0,0,0,0.8)",
// //             fontStyle: "italic"
// //           }}>
// //             "{slides[currentSlide].quote}"
// //           </h2>
// //           <p style={{
// //             fontSize: "1.2rem",
// //             opacity: 0.95,
// //             fontWeight: "500",
// //             letterSpacing: "1px"
// //           }}>
// //             — {slides[currentSlide].author}
// //           </p>
// //         </div>

// //         {/* Slide Indicators */}
// //         <div style={{
// //           position: "absolute",
// //           bottom: "2rem",
// //           left: "50%",
// //           transform: "translateX(-50%)",
// //           display: "flex",
// //           gap: "0.75rem",
// //           zIndex: 10
// //         }}>
// //           {slides.map((_, index) => (
// //             <div
// //               key={index}
// //               onClick={() => setCurrentSlide(index)}
// //               style={{
// //                 width: index === currentSlide ? "2.5rem" : "0.75rem",
// //                 height: "0.75rem",
// //                 borderRadius: "1rem",
// //                 backgroundColor: index === currentSlide ? "white" : "rgba(255, 255, 255, 0.3)",
// //                 cursor: "pointer",
// //                 transition: "all 0.4s ease"
// //               }}
// //             />
// //           ))}
// //         </div>
// //       </div>

// //       {/* Right Side - Login Form */}
// //       <div style={{
// //         flex: 1,
// //         display: "flex",
// //         alignItems: "center",
// //         justifyContent: "center",
// //         padding: "2rem",
// //         backgroundColor: "#1a1a1a",
// //         overflowY: "auto"
// //       }}>
// //         <div style={{
// //           width: "100%",
// //           maxWidth: "480px"
// //         }}>
// //           <h1 style={{
// //             color: "white",
// //             fontSize: "2.5rem",
// //             marginBottom: "0.5rem",
// //             fontWeight: "400"
// //           }}>
// //             Welcome back
// //           </h1>

// //           <p style={{
// //             color: "rgba(255, 255, 255, 0.5)",
// //             marginBottom: "2.5rem",
// //             fontSize: "1rem"
// //           }}>
// //             Don't have an account?{" "}
// //             <button
// //               onClick={() => navigate("/signup")}
// //               disabled={loading}
// //               style={{
// //                 background: "none",
// //                 border: "none",
// //                 color: "#fff",
// //                 textDecoration: "underline",
// //                 cursor: loading ? "not-allowed" : "pointer",
// //                 fontSize: "inherit",
// //                 opacity: loading ? 0.5 : 1
// //               }}
// //             >
// //               Sign up
// //             </button>
// //           </p>

// //           <div style={{ marginBottom: "1.25rem" }}>
// //             <input
// //               style={{ 
// //                 width: "100%", 
// //                 padding: "1rem", 
// //                 fontSize: "1rem",
// //                 border: "1px solid rgba(255, 255, 255, 0.1)",
// //                 borderRadius: "8px",
// //                 backgroundColor: "rgba(255, 255, 255, 0.05)",
// //                 color: "white",
// //                 boxSizing: "border-box",
// //                 outline: "none",
// //                 transition: "all 0.3s"
// //               }}
// //               placeholder="Email"
// //               name="email"
// //               type="email"
// //               value={formData.email}
// //               onChange={handleChange}
// //               required
// //               autoComplete="email"
// //               disabled={loading}
// //               onFocus={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"}
// //               onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
// //             />
// //           </div>
          
// //           <div style={{ marginBottom: "1rem", position: "relative" }}>
// //             <input
// //               style={{ 
// //                 width: "100%", 
// //                 padding: "1rem",
// //                 paddingRight: "3rem",
// //                 fontSize: "1rem",
// //                 border: "1px solid rgba(255, 255, 255, 0.1)",
// //                 borderRadius: "8px",
// //                 backgroundColor: "rgba(255, 255, 255, 0.05)",
// //                 color: "white",
// //                 boxSizing: "border-box",
// //                 outline: "none",
// //                 transition: "all 0.3s"
// //               }}
// //               placeholder="Password"
// //               name="password"
// //               type={showPassword ? "text" : "password"}
// //               value={formData.password}
// //               onChange={handleChange}
// //               required
// //               autoComplete="current-password"
// //               disabled={loading}
// //               onFocus={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"}
// //               onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
// //             />
// //             <button
// //               type="button"
// //               onClick={() => setShowPassword(!showPassword)}
// //               style={{
// //                 position: "absolute",
// //                 right: "1rem",
// //                 top: "50%",
// //                 transform: "translateY(-50%)",
// //                 background: "none",
// //                 border: "none",
// //                 color: "rgba(255, 255, 255, 0.5)",
// //                 cursor: "pointer",
// //                 padding: "0.5rem",
// //                 display: "flex",
// //                 alignItems: "center"
// //               }}
// //             >
// //               {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
// //             </button>
// //           </div>

// //           <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
// //             <button 
// //               onClick={handleForgotPassword}
// //               style={{
// //                 background: "none",
// //                 border: "none",
// //                 color: "rgba(255, 255, 255, 0.6)",
// //                 textDecoration: "underline",
// //                 cursor: "pointer",
// //                 fontSize: "0.9rem"
// //               }}
// //               disabled={loading}
// //             >
// //               Forgot Password?
// //             </button>
// //           </div>
          
// //           <button 
// //             onClick={handleSubmit}
// //             disabled={loading}
// //             style={{ 
// //               width: "100%", 
// //               padding: "1rem", 
// //               fontSize: "1rem",
// //               fontWeight: "500",
// //               backgroundColor: loading ? "#333" : "#fff",
// //               color: loading ? "#666" : "#000",
// //               border: "none",
// //               borderRadius: "8px",
// //               cursor: loading ? "not-allowed" : "pointer",
// //               transition: "all 0.3s",
// //               marginBottom: "2rem"
// //             }}
// //           >
// //             {loading ? (
// //               <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
// //                 <span style={{ 
// //                   display: "inline-block",
// //                   width: "16px",
// //                   height: "16px",
// //                   border: "2px solid transparent",
// //                   borderTop: "2px solid #666",
// //                   borderRadius: "50%",
// //                   animation: "spin 1s linear infinite"
// //                 }}></span>
// //                 Logging in...
// //               </span>
// //             ) : (
// //               "Login"
// //             )}
// //           </button>

// //           {/* <div style={{
// //             display: "flex",
// //             alignItems: "center",
// //             gap: "1rem",
// //             marginBottom: "1.5rem"
// //           }}>
// //             <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
// //             <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.9rem" }}>
// //               Or login with
// //             </span>
// //             <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
// //           </div> */}

// //           {/* <div style={{
// //             display: "grid",
// //             gridTemplateColumns: "1fr 1fr",
// //             gap: "1rem"
// //           }}>
// //             <button
// //               type="button"
// //               style={{
// //                 padding: "1rem",
// //                 borderRadius: "8px",
// //                 border: "1px solid rgba(255, 255, 255, 0.1)",
// //                 backgroundColor: "rgba(255, 255, 255, 0.05)",
// //                 color: "white",
// //                 fontSize: "1rem",
// //                 cursor: "pointer",
// //                 display: "flex",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //                 gap: "0.5rem",
// //                 transition: "all 0.3s"
// //               }}
// //             >
// //               Google
// //             </button> */}
// //             {/* <button
// //               type="button"
// //               style={{
// //                 padding: "1rem",
// //                 borderRadius: "8px",
// //                 border: "1px solid rgba(255, 255, 255, 0.1)",
// //                 backgroundColor: "rgba(255, 255, 255, 0.05)",
// //                 color: "white",
// //                 fontSize: "1rem",
// //                 cursor: "pointer",
// //                 display: "flex",
// //                 alignItems: "center",
// //                 justifyContent: "center",
// //                 gap: "0.5rem",
// //                 transition: "all 0.3s"
// //               }}
// //             >
// //               Apple
// //             </button> */}
// //           {/* </div> */}
// //         </div>
// //       </div>

// //       <style>{`
// //         * {
// //           margin: 0;
// //           padding: 0;
// //           box-sizing: border-box;
// //         }
        
// //         body, html, #root {
// //           margin: 0 !important;
// //           padding: 0 !important;
// //           overflow: hidden;
// //         }
        
// //         @keyframes fadeInUp {
// //           from { 
// //             opacity: 0; 
// //             transform: translateX(-50%) translateY(30px); 
// //           }
// //           to { 
// //             opacity: 1; 
// //             transform: translateX(-50%) translateY(0); 
// //           }
// //         }
        
// //         @keyframes spin {
// //           0% { transform: rotate(0deg); }
// //           100% { transform: rotate(360deg); }
// //         }
        
// //         input::placeholder {
// //           color: rgba(255, 255, 255, 0.3);
// //         }
        
// //         button:hover:not(:disabled) {
// //           transform: translateY(-1px);
// //           opacity: 0.9;
// //         }
// //       `}</style>
// //     </div>
// //   );
// // };

// // export default Login;


// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Eye, EyeOff } from "lucide-react";
// import supabase from "../components/supabaseClient";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [supabaseReady, setSupabaseReady] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   const slides = [
//     {
//       image: "https://images.unsplash.com/photo-1604610525665-6973305ff0b4?w=800&h=1200&fit=crop&q=80",
//       quote: "Freedom is a boon, which everyone has the right to receive.",
//       author: "Chhatrapati Shivaji Maharaj",
//       filter: "contrast(1.2)"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1618556947959-ec9d4c1d8bf3?w=800&h=1200&fit=crop&q=80",
//       quote: "Sanatan Dharma, that is Nationalism.",
//       author: "Sri Aurobindo",
//       filter: "grayscale(100%) contrast(1.2)"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=800&h=1200&fit=crop&q=80",
//       quote: "Give me blood, and I shall give you freedom.",
//       author: "Subhash Chandra Bose",
//       filter: "grayscale(100%) contrast(1.2)"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1604610525665-6973305ff0b4?w=800&h=1200&fit=crop&q=80",
//       quote: "Arise, awake and stop not till the goal is reached.",
//       author: "Swami Vivekananda",
//       filter: "grayscale(100%) contrast(1.2)"
//     }
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, 5000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         if (session) {
//           console.log("✅ User already logged in, redirecting...");
//           navigate("/home");
//           return;
//         }
//         setSupabaseReady(true);
//       } catch (err) {
//         console.error("❌ Auth check failed:", err);
//         setSupabaseReady(true);
//       }
//     };
//     
//     checkAuth();
//   }, [navigate]);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     if (params.get("message") === "verify-email") {
//       const pendingEmail = sessionStorage.getItem("pending_email");
//       if (pendingEmail) {
//         setFormData((prev) => ({ ...prev, email: pendingEmail }));
//         toast.info("Please verify your email before logging in.");
//         sessionStorage.removeItem("pending_email");
//       }
//     }
//   }, [location]);

//   function handleChange(e) {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     
//     if (!formData.email || !formData.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     if (!formData.email.includes("@")) {
//       toast.error("Please enter a valid email address");
//       return;
//     }

//     setLoading(true);
//     
//     try {
//       console.log("🔄 Attempting login for:", formData.email);
//       
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       });

//       console.log("🔍 Supabase login response:", { data, error });

//       if (error) {
//         console.error("❌ Login error:", error);
//         
//         if (error.message.includes("Email not confirmed")) {
//           toast.error("Please check your email and confirm your account first.");
//         } else if (error.message.includes("Invalid login credentials")) {
//           toast.error("Invalid email or password. Please check your credentials.");
//         } else if (error.message.includes("Too many requests")) {
//           toast.error("Too many login attempts. Please try again later.");
//         } else {
//           toast.error(error.message || "Login failed. Please try again.");
//         }
//         return;
//       }

//       if (data.session && data.user) {
//         console.log("✅ Login successful:", data.user.email);
//         
//         const userName = data.user.user_metadata?.full_name || 
//                         data.user.email.split("@")[0] || 
//                         "User";
//         
//         toast.success(`Welcome back, ${userName}!`);
//         navigate("/home");
//       } else {
//         console.error("❌ No session returned from login");
//         toast.error("Login failed. Please try again.");
//       }
//       
//     } catch (err) {
//       console.error("⚡ Unexpected login error:", err);
//       
//       if (err.message.includes("fetch")) {
//         toast.error("Network error. Please check your connection and try again.");
//       } else {
//         toast.error("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   const handleForgotPassword = async () => {
//     if (!formData.email) {
//       toast.error("Please enter your email address first");
//       return;
//     }

//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
//         redirectTo: `${window.location.origin}/reset-password`,
//       });

//       if (error) {
//         toast.error(error.message);
//       } else {
//         toast.success("Password reset email sent! Check your inbox.");
//       }
//     } catch (err) {
//       toast.error("Failed to send reset email");
//     }
//   };

//   if (!supabaseReady) {
//     return (
//       <div style={{ 
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         display: "flex", 
//         alignItems: "center", 
//         justifyContent: "center",
//         backgroundColor: "#0f0f0f"
//       }}>
//         <div style={{ textAlign: "center", color: "white" }}>
//           <div style={{ 
//             width: "50px", 
//             height: "50px", 
//             border: "4px solid rgba(255,255,255,0.1)",
//             borderTop: "4px solid white",
//             borderRadius: "50%",
//             animation: "spin 1s linear infinite",
//             margin: "0 auto 1rem"
//           }}></div>
//           <p>Loading authentication service...</p>
//         </div>
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       position: "fixed",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       display: "flex",
//       backgroundColor: "#0f0f0f",
//       fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
//       overflow: "hidden"
//     }}>
//       {/* Left Side - Image Slider */}
//       <div style={{
//         flex: 1,
//         position: "relative",
//         overflow: "hidden",
//         backgroundColor: "#000"
//       }}>
//         <div style={{
//           position: "absolute",
//           top: "2rem",
//           left: "2rem",
//           fontSize: "1.8rem",
//           fontWeight: "bold",
//           color: "white",
//           zIndex: 20,
//           letterSpacing: "3px"
//         }}>
//           AMLI
//         </div>

//         {slides.map((slide, index) => (
//           <div
//             key={index}
//             style={{
//               position: "absolute",
//               inset: 0,
//               opacity: currentSlide === index ? 1 : 0,
//               transition: "opacity 1.5s ease-in-out"
//             }}
//           >
//             <img 
//               src={slide.image}
//               alt={slide.author}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover",
//                 filter: slide.filter
//               }}
//             />
//             <div style={{
//               position: "absolute",
//               inset: 0,
//               background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)"
//             }} />
//             </div>
//         ))}

//         <div style={{
//           position: "absolute",
//           bottom: "4rem",
//           left: "50%",
//           transform: "translateX(-50%)",
//           textAlign: "center",
//           color: "white",
//           maxWidth: "700px",
//           padding: "0 2rem",
//           zIndex: 10
//         }}>
//           <h2 style={{
//             fontSize: "2.2rem",
//             fontWeight: "300",
//             lineHeight: "1.5",
//             marginBottom: "1.5rem",
//             textShadow: "0 2px 20px rgba(0,0,0,0.8)",
//             fontStyle: "italic"
//           }}>
//             "{slides[currentSlide].quote}"
//           </h2>
//           <p style={{
//             fontSize: "1.2rem",
//             opacity: 0.95,
//             fontWeight: "500",
//             letterSpacing: "1px"
//           }}>
//             — {slides[currentSlide].author}
//           </p>
//         </div>

//         <div style={{
//           position: "absolute",
//           bottom: "2rem",
//           left: "50%",
//           transform: "translateX(-50%)",
//           display: "flex",
//           gap: "0.75rem",
//           zIndex: 10
//         }}>
//           {slides.map((_, index) => (
//             <div
//               key={index}
//               onClick={() => setCurrentSlide(index)}
//               style={{
//                 width: index === currentSlide ? "2.5rem" : "0.75rem",
//                 height: "0.75rem",
//                 borderRadius: "1rem",
//                 backgroundColor: index === currentSlide ? "white" : "rgba(255, 255, 255, 0.3)",
//                 cursor: "pointer",
//                 transition: "all 0.4s ease"
//               }}
//             />
//           ))}
//         </div>
//       </div>

//       {/* Right Side - Login Form */}
//       <div style={{
//         flex: 1,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "2rem",
//         backgroundColor: "#1a1a1a",
//         overflowY: "auto"
//       }}>
//         <div style={{
//           width: "100%",
//           maxWidth: "480px"
//         }}>
//           <h1 style={{
//             color: "white",
//             fontSize: "2.5rem",
//             marginBottom: "0.5rem",
//             fontWeight: "400"
//           }}>
//             Welcome back
//           </h1>

//           <p style={{
//             color: "rgba(255, 255, 255, 0.5)",
//             marginBottom: "2.5rem",
//             fontSize: "1rem"
//           }}>
//             Don't have an account?{" "}
//             <button
//               onClick={() => navigate("/signup")}
//               disabled={loading}
//               style={{
//                 background: "none",
//                 border: "none",
//                 color: "#fff",
//                 textDecoration: "underline",
//                 cursor: loading ? "not-allowed" : "pointer",
//                 fontSize: "inherit",
//                 opacity: loading ? 0.5 : 1
//               }}
//             >
//               Sign up
//             </button>
//           </p>

//           <form onSubmit={handleSubmit}>
//             <div style={{ marginBottom: "1.25rem" }}>
//               <input
//                 style={{ 
//                   width: "100%", 
//                   padding: "1rem", 
//                   fontSize: "1rem",
//                   border: "1px solid rgba(255, 255, 255, 0.1)",
//                   borderRadius: "8px",
//                   backgroundColor: "rgba(255, 255, 255, 0.05)",
//                   color: "white",
//                   boxSizing: "border-box",
//                   outline: "none",
//                   transition: "all 0.3s"
//                 }}
//                 placeholder="Email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 autoComplete="email"
//                 disabled={loading}
//               />
//             </div>
//             
//             <div style={{ marginBottom: "1rem", position: "relative" }}>
//               <input
//                 style={{ 
//                   width: "100%", 
//                   padding: "1rem",
//                   paddingRight: "3rem",
//                   fontSize: "1rem",
//                   border: "1px solid rgba(255, 255, 255, 0.1)",
//                   borderRadius: "8px",
//                   backgroundColor: "rgba(255, 255, 255, 0.05)",
//                   color: "white",
//                   boxSizing: "border-box",
//                   outline: "none",
//                   transition: "all 0.3s"
//                 }}
//                 placeholder="Password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 autoComplete="current-password"
//                 disabled={loading}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 style={{
//                   position: "absolute",
//                   right: "1rem",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   background: "none",
//                   border: "none",
//                   color: "rgba(255, 255, 255, 0.5)",
//                   cursor: "pointer",
//                   padding: "0.5rem",
//                   display: "flex",
//                   alignItems: "center"
//                 }}
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>

//             <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
//               <button 
//                 type="button"
//                 onClick={handleForgotPassword}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: "rgba(255, 255, 255, 0.6)",
//                   textDecoration: "underline",
//                   cursor: "pointer",
//                   fontSize: "0.9rem"
//                 }}
//                 disabled={loading}
//               >
//                 Forgot Password?
//               </button>
//             </div>
//             
//             <button 
//               type="submit"
//               disabled={loading}
//               style={{ 
//                 width: "100%", 
//                 padding: "1rem", 
//                 fontSize: "1rem",
//                 fontWeight: "500",
//                 backgroundColor: loading ? "#333" : "#fff",
//                 color: loading ? "#666" : "#000",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: loading ? "not-allowed" : "pointer",
//                 transition: "all 0.3s"
//               }}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         </div>
//       </div>

//       <style>{`
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }
//         
//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }
//         
//         input::placeholder {
//           color: rgba(255, 255, 255, 0.3);
//         }
//         
//         button:hover:not(:disabled) {
//           opacity: 0.9;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;


import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import supabase from "../components/supabaseClient"; 

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  const slides = [
    {
      image: "https://images.unsplash.com/photo-1604610525665-6973305ff0b4?w=800&h=1200&fit=crop&q=80",
      quote: "Freedom is a boon, which everyone has the right to receive.",
      author: "Chhatrapati Shivaji Maharaj",
      filter: "contrast(1.2)"
    },
    {
      image: "https://images.unsplash.com/photo-1618556947959-ec9d4c1d8bf3?w=800&h=1200&fit=crop&q=80",
      quote: "Sanatan Dharma, that is Nationalism.",
      author: "Sri Aurobindo",
      filter: "grayscale(100%) contrast(1.2)"
    },
    {
      image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=800&h=1200&fit=crop&q=80",
      quote: "Give me blood, and I shall give you freedom.",
      author: "Subhash Chandra Bose",
      filter: "grayscale(100%) contrast(1.2)"
    },
    {
      image: "https://images.unsplash.com/photo-1604610525665-6973305ff0b4?w=800&h=1200&fit=crop&q=80",
      quote: "Arise, awake and stop not till the goal is reached.",
      author: "Swami Vivekananda",
      filter: "grayscale(100%) contrast(1.2)"
    }
  ];

  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) {
          console.log("✅ User already logged in, redirecting...");
          navigate("/home");
          return;
        }
        setSupabaseReady(true);
      } catch (err) {
        console.error("❌ Auth check failed:", err);
        setSupabaseReady(true);
      }
    };
    
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("message") === "verify-email") {
      const pendingEmail = sessionStorage.getItem("pending_email");
      if (pendingEmail) {
        setFormData((prev) => ({ ...prev, email: pendingEmail }));
        toast.info("Please verify your email before logging in.");
        sessionStorage.removeItem("pending_email");
      }
    }
  }, [location]);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    
    if (!formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (!formData.email.includes("@")) {
      toast.error("Please enter a valid email address");
      return;
    }

    setLoading(true);
    
    try {
      console.log("🔄 Attempting login for:", formData.email);
      
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      console.log("🔍 Supabase login response:", { data, error });

      if (error) {
        console.error("❌ Login error:", error);
        
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account first.");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Too many requests")) {
          toast.error("Too many login attempts. Please try again later.");
        } else {
          toast.error(error.message || "Login failed. Please try again.");
        }
        return;
      }

      if (data.session && data.user) {
        console.log("✅ Login successful:", data.user.email);
        // The successful login triggers the storage of the new JWT internally in the client,
        // which will be retrieved by getAuthHeaders() later.
        
        const userName = data.user.user_metadata?.full_name || 
                        data.user.email.split("@")[0] || 
                        "User";
        
        toast.success(`Welcome back, ${userName}!`);
        navigate("/home");
      } else {
        console.error("❌ No session returned from login");
        toast.error("Login failed. Please try again.");
      }
      
    } catch (err) {
      console.error("⚡ Unexpected login error:", err);
      
      if (err.message.includes("fetch")) {
        toast.error("Network error. Please check your connection and try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  const handleForgotPassword = async () => {
    if (!formData.email) {
      toast.error("Please enter your email address first");
      return;
    }

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
        redirectTo: `${window.location.origin}/reset-password`,
      });

      if (error) {
        toast.error(error.message);
      } else {
        toast.success("Password reset email sent! Check your inbox.");
      }
    } catch (err) {
      toast.error("Failed to send reset email");
    }
  };

  if (!supabaseReady) {
    return (
      <div style={{ 
        position: "fixed",
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        display: "flex", 
        alignItems: "center", 
        justifyContent: "center",
        backgroundColor: "#0f0f0f"
      }}>
        <div style={{ textAlign: "center", color: "white" }}>
          <div style={{ 
            width: "50px", 
            height: "50px", 
            border: "4px solid rgba(255,255,255,0.1)",
            borderTop: "4px solid white",
            borderRadius: "50%",
            animation: "spin 1s linear infinite",
            margin: "0 auto 1rem"
          }}></div>
          <p>Loading authentication service...</p>
        </div>
        <style>{`
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        `}</style>
      </div>
    );
  }

  return (
    <div style={{
      position: "fixed",
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      display: "flex",
      backgroundColor: "#0f0f0f",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
      overflow: "hidden"
    }}>
      {/* Left Side - Image Slider */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000"
      }}>
        <div style={{
          position: "absolute",
          top: "2rem",
          left: "2rem",
          fontSize: "1.8rem",
          fontWeight: "bold",
          color: "white",
          zIndex: 20,
          letterSpacing: "3px"
        }}>
          AMLI
        </div>

        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              inset: 0,
              opacity: currentSlide === index ? 1 : 0,
              transition: "opacity 1.5s ease-in-out"
            }}
          >
            <img 
              src={slide.image}
              alt={slide.author}
              style={{
                width: "100%",
                height: "100%",
                objectFit: "cover",
                filter: slide.filter
              }}
            />
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)"
            }} />
          </div>
        ))}

        <div style={{
          position: "absolute",
          bottom: "4rem",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "white",
          maxWidth: "700px",
          padding: "0 2rem",
          zIndex: 10
        }}>
          <h2 style={{
            fontSize: "2.2rem",
            fontWeight: "300",
            lineHeight: "1.5",
            marginBottom: "1.5rem",
            textShadow: "0 2px 20px rgba(0,0,0,0.8)",
            fontStyle: "italic"
          }}>
            "{slides[currentSlide].quote}"
          </h2>
          <p style={{
            fontSize: "1.2rem",
            opacity: 0.95,
            fontWeight: "500",
            letterSpacing: "1px"
          }}>
            — {slides[currentSlide].author}
          </p>
        </div>

        <div style={{
          position: "absolute",
          bottom: "2rem",
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: "0.75rem",
          zIndex: 10
        }}>
          {slides.map((_, index) => (
            <div
              key={index}
              onClick={() => setCurrentSlide(index)}
              style={{
                width: index === currentSlide ? "2.5rem" : "0.75rem",
                height: "0.75rem",
                borderRadius: "1rem",
                backgroundColor: index === currentSlide ? "white" : "rgba(255, 255, 255, 0.3)",
                cursor: "pointer",
                transition: "all 0.4s ease"
              }}
            />
          ))}
        </div>
      </div>

      {/* Right Side - Login Form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "#1a1a1a",
        overflowY: "auto"
      }}>
        <div style={{
          width: "100%",
          maxWidth: "480px"
        }}>
          <h1 style={{
            color: "white",
            fontSize: "2.5rem",
            marginBottom: "0.5rem",
            fontWeight: "400"
          }}>
            Welcome back
          </h1>

          <p style={{
            color: "rgba(255, 255, 255, 0.5)",
            marginBottom: "2.5rem",
            fontSize: "1rem"
          }}>
            Don't have an account?{" "}
            <button
              onClick={() => navigate("/signup")}
              disabled={loading}
              style={{
                background: "none",
                border: "none",
                color: "#fff",
                textDecoration: "underline",
                cursor: loading ? "not-allowed" : "pointer",
                fontSize: "inherit",
                opacity: loading ? 0.5 : 1
              }}
            >
              Sign up
            </button>
          </p>

          <form onSubmit={handleSubmit}>
            <div style={{ marginBottom: "1.25rem" }}>
              <input
                style={{ 
                  width: "100%", 
                  padding: "1rem", 
                  fontSize: "1rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "all 0.3s"
                }}
                placeholder="Email"
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                required
                autoComplete="email"
                disabled={loading}
              />
              </div>
            
            <div style={{ marginBottom: "1rem", position: "relative" }}>
              <input
                style={{ 
                  width: "100%", 
                  padding: "1rem",
                  paddingRight: "3rem",
                  fontSize: "1rem",
                  border: "1px solid rgba(255, 255, 255, 0.1)",
                  borderRadius: "8px",
                  backgroundColor: "rgba(255, 255, 255, 0.05)",
                  color: "white",
                  boxSizing: "border-box",
                  outline: "none",
                  transition: "all 0.3s"
                }}
                placeholder="Password"
                name="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={handleChange}
                required
                autoComplete="current-password"
                disabled={loading}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                style={{
                  position: "absolute",
                  right: "1rem",
                  top: "50%",
                  transform: "translateY(-50%)",
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.5)",
                  cursor: "pointer",
                  padding: "0.5rem",
                  display: "flex",
                  alignItems: "center"
                }}
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>

            <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
              <button 
                type="button"
                onClick={handleForgotPassword}
                style={{
                  background: "none",
                  border: "none",
                  color: "rgba(255, 255, 255, 0.6)",
                  textDecoration: "underline",
                  cursor: "pointer",
                  fontSize: "0.9rem"
                }}
                disabled={loading}
              >
                Forgot Password?
              </button>
            </div>
            
            <button 
              type="submit"
              disabled={loading}
              style={{ 
                width: "100%", 
                padding: "1rem", 
                fontSize: "1rem",
                fontWeight: "500",
                backgroundColor: loading ? "#333" : "#fff",
                color: loading ? "#666" : "#000",
                border: "none",
                borderRadius: "8px",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.3s"
              }}
            >
              {loading ? "Logging in..." : "Login"}
            </button>
          </form>
        </div>
      </div>

      <style>{`
        * {
          margin: 0;
          padding: 0;
          box-sizing: border-box;
        }
        
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        
        button:hover:not(:disabled) {
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default Login;
