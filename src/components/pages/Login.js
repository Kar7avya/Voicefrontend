// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Eye, EyeOff } from "lucide-react";
// import supabase from "./supabaseClient";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [supabaseReady, setSupabaseReady] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   const slides = [
//     {
//       image: "https://images.unsplash.com/photo-1604610525665-6973305ff0b4?w=800&h=1200&fit=crop&q=80",
//       quote: "Freedom is a boon, which everyone has the right to receive.",
//       author: "Chhatrapati Shivaji Maharaj",
//       filter: "contrast(1.2)"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1618556947959-ec9d4c1d8bf3?w=800&h=1200&fit=crop&q=80",
//       quote: "Sanatan Dharma, that is Nationalism.",
//       author: "Sri Aurobindo",
//       filter: "grayscale(100%) contrast(1.2)"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1583324113626-70df0f4deaab?w=800&h=1200&fit=crop&q=80",
//       quote: "Give me blood, and I shall give you freedom.",
//       author: "Subhash Chandra Bose",
//       filter: "grayscale(100%) contrast(1.2)"
//     },
//     {
//       image: "https://images.unsplash.com/photo-1604610525665-6973305ff0b4?w=800&h=1200&fit=crop&q=80",
//       quote: "Arise, awake and stop not till the goal is reached.",
//       author: "Swami Vivekananda",
//       filter: "grayscale(100%) contrast(1.2)"
//     }
//   ];

//   useEffect(() => {
//     const timer = setInterval(() => {
//       setCurrentSlide((prev) => (prev + 1) % slides.length);
//     }, 5000);

//     return () => clearInterval(timer);
//   }, [slides.length]);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const { data: { session } } = await supabase.auth.getSession();
//         if (session) {
//           navigate("/home");
//           return;
//         }
//         setSupabaseReady(true);
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         setSupabaseReady(true);
//       }
//     };

//     checkAuth();
//   }, [navigate]);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     if (params.get("message") === "verify-email") {
//       const pendingEmail = sessionStorage.getItem("pending_email");
//       if (pendingEmail) {
//         setFormData((prev) => ({ ...prev, email: pendingEmail }));
//         toast.info("Please verify your email before logging in.");
//         sessionStorage.removeItem("pending_email");
//       }
//     }
//   }, [location]);

//   const handleChange = (e) => {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();

//     if (!formData.email || !formData.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     if (!formData.email.includes("@")) {
//       toast.error("Please enter a valid email address");
//       return;
//     }

//     setLoading(true);

//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (error) {
//         if (error.message.includes("Email not confirmed")) {
//           toast.error("Please confirm your email first.");
//         } else if (error.message.includes("Invalid login credentials")) {
//           toast.error("Invalid email or password.");
//         } else if (error.message.includes("Too many requests")) {
//           toast.error("Too many attempts. Please try again later.");
//         } else {
//           toast.error(error.message || "Login failed. Please try again.");
//         }
//         return;
//       }

//       if (data.session && data.user) {
//         const userName = data.user.user_metadata?.full_name ||
//                         data.user.email.split("@")[0] ||
//                         "User";

//         toast.success(`Welcome back, ${userName}!`);
//         navigate("/home");
//       } else {
//         toast.error("Login failed. Please try again.");
//       }

//     } catch (err) {
//       if (err.message?.includes("fetch")) {
//         toast.error("Network error. Please try again.");
//       } else {
//         toast.error("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!formData.email) {
//       toast.error("Please enter your email address first");
//       return;
//     }

//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
//         redirectTo: `${window.location.origin}/reset-password`,
//       });

//       if (error) {
//         toast.error(error.message);
//       } else {
//         toast.success("Password reset email sent! Check your inbox.");
//       }
//     } catch (err) {
//       toast.error("Failed to send reset email");
//     }
//   };

//   if (!supabaseReady) {
//     return (
//       <div style={{
//         position: "fixed",
//         top: 0,
//         left: 0,
//         right: 0,
//         bottom: 0,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         backgroundColor: "#0f0f0f"
//       }}>
//         <div style={{ textAlign: "center", color: "white" }}>
//           <div style={{
//             width: "50px",
//             height: "50px",
//             border: "4px solid rgba(255,255,255,0.1)",
//             borderTop: "4px solid white",
//             borderRadius: "50%",
//             animation: "spin 1s linear infinite",
//             margin: "0 auto 1rem"
//           }}></div>
//           <p>Loading authentication service...</p>
//         </div>
//         <style>{`
//           @keyframes spin {
//             0% { transform: rotate(0deg); }
//             100% { transform: rotate(360deg); }
//           }
//         `}</style>
//       </div>
//     );
//   }

//   return (
//     <div style={{
//       position: "fixed",
//       top: 0,
//       left: 0,
//       right: 0,
//       bottom: 0,
//       display: "flex",
//       backgroundColor: "#0f0f0f",
//       fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
//       overflow: "hidden"
//     }}>
//       <div style={{
//         flex: 1,
//         position: "relative",
//         overflow: "hidden",
//         backgroundColor: "#000"
//       }}>
//         <div style={{
//           position: "absolute",
//           top: "2rem",
//           left: "2rem",
//           fontSize: "1.8rem",
//           fontWeight: "bold",
//           color: "white",
//           zIndex: 20,
//           letterSpacing: "3px"
//         }}>
//           AMLI
//         </div>

//         {slides.map((slide, index) => (
//           <div
//             key={index}
//             style={{
//               position: "absolute",
//               inset: 0,
//               opacity: currentSlide === index ? 1 : 0,
//               transition: "opacity 1.5s ease-in-out"
//             }}
//           >
//             <img
//               src={slide.image}
//               alt={slide.author}
//               style={{
//                 width: "100%",
//                 height: "100%",
//                 objectFit: "cover",
//                 filter: slide.filter
//               }}
//             />
//             <div style={{
//               position: "absolute",
//               inset: 0,
//               background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)"
//             }} />
//           </div>
//         ))}

//         <div style={{
//           position: "absolute",
//           bottom: "4rem",
//           left: "50%",
//           transform: "translateX(-50%)",
//           textAlign: "center",
//           color: "white",
//           maxWidth: "700px",
//           padding: "0 2rem",
//           zIndex: 10
//         }}>
//           <h2 style={{
//             fontSize: "2.2rem",
//             fontWeight: "300",
//             lineHeight: "1.5",
//             marginBottom: "1.5rem",
//             textShadow: "0 2px 20px rgba(0,0,0,0.8)",
//             fontStyle: "italic"
//           }}>
//             "{slides[currentSlide].quote}"
//           </h2>
//           <p style={{
//             fontSize: "1.2rem",
//             opacity: 0.95,
//             fontWeight: "500",
//             letterSpacing: "1px"
//           }}>
//             — {slides[currentSlide].author}
//           </p>
//         </div>

//         <div style={{
//           position: "absolute",
//           bottom: "2rem",
//           left: "50%",
//           transform: "translateX(-50%)",
//           display: "flex",
//           gap: "0.75rem",
//           zIndex: 10
//         }}>
//           {slides.map((_, index) => (
//             <div
//               key={index}
//               onClick={() => setCurrentSlide(index)}
//               style={{
//                 width: index === currentSlide ? "2.5rem" : "0.75rem",
//                 height: "0.75rem",
//                 borderRadius: "1rem",
//                 backgroundColor: index === currentSlide ? "white" : "rgba(255, 255, 255, 0.3)",
//                 cursor: "pointer",
//                 transition: "all 0.4s ease"
//               }}
//             />
//           ))}
//         </div>
//       </div>

//       <div style={{
//         flex: 1,
//         display: "flex",
//         alignItems: "center",
//         justifyContent: "center",
//         padding: "2rem",
//         backgroundColor: "#1a1a1a",
//         overflowY: "auto"
//       }}>
//         <div style={{
//           width: "100%",
//           maxWidth: "480px"
//         }}>
//           <h1 style={{
//             color: "white",
//             fontSize: "2.5rem",
//             marginBottom: "0.5rem",
//             fontWeight: "400"
//           }}>
//             Welcome back
//           </h1>

//           <p style={{
//             color: "rgba(255, 255, 255, 0.5)",
//             marginBottom: "2.5rem",
//             fontSize: "1rem"
//           }}>
//             Don't have an account?{" "}
//             <button
//               onClick={() => navigate("/signup")}
//               disabled={loading}
//               style={{
//                 background: "none",
//                 border: "none",
//                 color: "#fff",
//                 textDecoration: "underline",
//                 cursor: loading ? "not-allowed" : "pointer",
//                 fontSize: "inherit",
//                 opacity: loading ? 0.5 : 1
//               }}
//             >
//               Sign up
//             </button>
//           </p>

//           <form onSubmit={handleSubmit}>
//             <div style={{ marginBottom: "1.25rem" }}>
//               <input
//                 style={{
//                   width: "100%",
//                   padding: "1rem",
//                   fontSize: "1rem",
//                   border: "1px solid rgba(255, 255, 255, 0.1)",
//                   borderRadius: "8px",
//                   backgroundColor: "rgba(255, 255, 255, 0.05)",
//                   color: "white",
//                   boxSizing: "border-box",
//                   outline: "none",
//                   transition: "all 0.3s"
//                 }}
//                 placeholder="Email"
//                 name="email"
//                 type="email"
//                 value={formData.email}
//                 onChange={handleChange}
//                 required
//                 autoComplete="email"
//                 disabled={loading}
//               />
//             </div>

//             <div style={{ marginBottom: "1rem", position: "relative" }}>
//               <input
//                 style={{
//                   width: "100%",
//                   padding: "1rem",
//                   paddingRight: "3rem",
//                   fontSize: "1rem",
//                   border: "1px solid rgba(255, 255, 255, 0.1)",
//                   borderRadius: "8px",
//                   backgroundColor: "rgba(255, 255, 255, 0.05)",
//                   color: "white",
//                   boxSizing: "border-box",
//                   outline: "none",
//                   transition: "all 0.3s"
//                 }}
//                 placeholder="Password"
//                 name="password"
//                 type={showPassword ? "text" : "password"}
//                 value={formData.password}
//                 onChange={handleChange}
//                 required
//                 autoComplete="current-password"
//                 disabled={loading}
//               />
//               <button
//                 type="button"
//                 onClick={() => setShowPassword(!showPassword)}
//                 style={{
//                   position: "absolute",
//                   right: "1rem",
//                   top: "50%",
//                   transform: "translateY(-50%)",
//                   background: "none",
//                   border: "none",
//                   color: "rgba(255, 255, 255, 0.5)",
//                   cursor: "pointer",
//                   padding: "0.5rem",
//                   display: "flex",
//                   alignItems: "center"
//                 }}
//               >
//                 {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//               </button>
//             </div>

//             <div style={{ textAlign: "right", marginBottom: "1.5rem" }}>
//               <button
//                 type="button"
//                 onClick={handleForgotPassword}
//                 style={{
//                   background: "none",
//                   border: "none",
//                   color: "rgba(255, 255, 255, 0.6)",
//                   textDecoration: "underline",
//                   cursor: "pointer",
//                   fontSize: "0.9rem"
//                 }}
//                 disabled={loading}
//               >
//                 Forgot Password?
//               </button>
//             </div>

//             <button
//               type="submit"
//               disabled={loading}
//               style={{
//                 width: "100%",
//                 padding: "1rem",
//                 fontSize: "1rem",
//                 fontWeight: "500",
//                 backgroundColor: loading ? "#333" : "#fff",
//                 color: loading ? "#666" : "#000",
//                 border: "none",
//                 borderRadius: "8px",
//                 cursor: loading ? "not-allowed" : "pointer",
//                 transition: "all 0.3s"
//               }}
//             >
//               {loading ? "Logging in..." : "Login"}
//             </button>
//           </form>
//         </div>
//       </div>

//       <style>{`
//         * {
//           margin: 0;
//           padding: 0;
//           box-sizing: border-box;
//         }

//         @keyframes spin {
//           0% { transform: rotate(0deg); }
//           100% { transform: rotate(360deg); }
//         }

//         input::placeholder {
//           color: rgba(255, 255, 255, 0.3);
//         }

//         button:hover:not(:disabled) {
//           opacity: 0.9;
//         }
//       `}</style>
//     </div>
//   );
// };

// export default Login;

// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import { Eye, EyeOff } from "lucide-react";
// import supabase from "./supabaseClient";
// import aurobindoImage from "../pages/aurobindo.jpg";
// import shivajiImage from "../pages/shivaji.jpg";
// import swamivivekanandaImage from "../pages/swamivivekanand.jpg";
// import veersavarkarImage from "../pages/veersavarkar.jpg";

// const slides = [
//   {
//     image: shivajiImage,
//     quote: "Freedom is a boon, which everyone has the right to receive.",
//     author: "Chhatrapati Shivaji Maharaj",
//   },
//   {
//     image: aurobindoImage,
//     quote: "Sanatan Dharma, that is Nationalism.",
//     author: "Sri Aurobindo",
//   },
//   {
//     image: veersavarkarImage,
//     quote: "Give me blood, and I shall give you freedom.",
//     author: "Subhash Chandra Bose",
//   },
//   {
//     image: swamivivekanandaImage,
//     quote: "Arise, awake and stop not till the goal is reached.",
//     author: "Swami Vivekananda",
//   },
// ];

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);
//   const [supabaseReady, setSupabaseReady] = useState(false);
//   const [showPassword, setShowPassword] = useState(false);
//   const [currentSlide, setCurrentSlide] = useState(0);

//   useEffect(() => {
//     const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
//     return () => clearInterval(timer);
//   }, []);

//   useEffect(() => {
//     const checkAuth = async () => {
//       try {
//         const {
//           data: { session },
//         } = await supabase.auth.getSession();
//         if (session) {
//           navigate("/home");
//           return;
//         }
//         setSupabaseReady(true);
//       } catch (err) {
//         console.error("Auth check failed:", err);
//         setSupabaseReady(true);
//       }
//     };
//     checkAuth();
//   }, [navigate]);

//   useEffect(() => {
//     const params = new URLSearchParams(location.search);
//     if (params.get("message") === "verify-email") {
//       const pendingEmail = sessionStorage.getItem("pending_email");
//       if (pendingEmail) {
//         setFormData((prev) => ({ ...prev, email: pendingEmail }));
//         toast.info("Please verify your email before logging in.");
//         sessionStorage.removeItem("pending_email");
//       }
//     }
//   }, [location]);

//   const handleChange = (e) => {
//     setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
//   };

//   const handleSubmit = async (e) => {
//     e.preventDefault();
//     if (!formData.email || !formData.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }
//     if (!formData.email.includes("@")) {
//       toast.error("Please enter a valid email address");
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (error) {
//         if (error.message.includes("Email not confirmed")) {
//           toast.error("Please confirm your email first.");
//         } else if (error.message.includes("Invalid login credentials")) {
//           toast.error("Invalid email or password.");
//         } else if (error.message.includes("Too many requests")) {
//           toast.error("Too many attempts. Please try again later.");
//         } else {
//           toast.error(error.message || "Login failed. Please try again.");
//         }
//         return;
//       }

//       if (data.session && data.user) {
//         const userName =
//           data.user.user_metadata?.full_name || data.user.email.split("@")[0] || "User";
//         toast.success(`Welcome back, ${userName}!`);
//         navigate("/home");
//       } else {
//         toast.error("Login failed. Please try again.");
//       }
//     } catch (err) {
//       if (err.message?.includes("fetch")) {
//         toast.error("Network error. Please try again.");
//       } else {
//         toast.error("Something went wrong. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   };

//   const handleForgotPassword = async () => {
//     if (!formData.email) {
//       toast.error("Please enter your email address first");
//       return;
//     }
//     try {
//       const { error } = await supabase.auth.resetPasswordForEmail(formData.email, {
//         redirectTo: `${window.location.origin}/reset-password`,
//       });
//       if (error) {
//         toast.error(error.message);
//       } else {
//         toast.success("Password reset email sent! Check your inbox.");
//       }
//     } catch (err) {
//       toast.error("Failed to send reset email");
//     }
//   };

//   if (!supabaseReady) {
//     return (
//       <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
//         <div className="spinner-border text-light mb-3" role="status" />
//         <p>Loading authentication service...</p>
//       </div>
//     );
//   }

//   return (
//     <div className="container-fluid min-vh-100 bg-dark text-light">
//       <div className="row min-vh-100">
//         {/* Left carousel panel */}
//         <div className="col-lg-6 d-none d-lg-flex flex-column p-0 position-relative">
//           <div className="w-100 h-100 position-relative">
//             <div className="position-absolute top-0 start-0 m-4 fw-bold fs-3 letter-spacing-3">
              
//             </div>

//             {slides.map((slide, index) => (
//               <div
//                 key={index}
//                 className={`position-absolute w-100 h-100 transition opacity-${
//                   currentSlide === index ? "100" : "0"
//                 }`}
//                 style={{
//                   transition: "opacity 1.5s ease-in-out",
//                 }}
//               >
//                 <img
//                   src={slide.image}
//                   alt={slide.author}
//                   className="w-100 h-100"
//                   style={{ objectFit: "cover", filter: slide.filter }}
//                 />
//                 <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient" />
//               </div>
//             ))}

//             <div className="position-absolute bottom-0 start-0 w-100 text-center text-white px-4 pb-5">
//               <blockquote className="display-6 fw-light fst-italic mb-3">
//                 “{slides[currentSlide].quote}”
//               </blockquote>
//               <p className="h5 fw-semibold">— {slides[currentSlide].author}</p>
//             </div>

//             <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
//               {slides.map((_, index) => (
//                 <button
//                   key={index}
//                   type="button"
//                   className={`btn rounded-pill p-0 ${
//                     index === currentSlide ? "bg-white" : "bg-white-50"
//                   }`}
//                   style={{
//                     width: index === currentSlide ? "2.5rem" : "0.75rem",
//                     height: "0.75rem",
//                     opacity: index === currentSlide ? 1 : 0.4,
//                   }}
//                   onClick={() => setCurrentSlide(index)}
//                 />
//               ))}
//             </div>
//           </div>
//         </div>

//         {/* Right form panel */}
//         <div className="col-lg-6 d-flex align-items-center">
//           <div className="w-100 px-4 py-5 mx-auto" style={{ maxWidth: "480px" }}>
//             <h1 className="fw-normal mb-2">Welcome back</h1>
//             <p className="text-white-50 mb-4">
//               Don’t have an account?{" "}
//               <button
//                 type="button"
//                 className="btn btn-link p-0 align-baseline text-decoration-underline"
//                 onClick={() => navigate("/signup")}
//                 disabled={loading}
//               >
//                 Sign up
//               </button>
//             </p>

//             <form onSubmit={handleSubmit}>
//               <div className="form-floating mb-3">
//                 <input
//                   type="email"
//                   className="form-control bg-dark text-light border-secondary"
//                   id="loginEmail"
//                   placeholder="name@example.com"
//                   name="email"
//                   value={formData.email}
//                   onChange={handleChange}
//                   autoComplete="email"
//                   disabled={loading}
//                   required
//                 />
//                 <label htmlFor="loginEmail" className="text-secondary">
//                   Email address
//                 </label>
//               </div>

//               <div className="form-floating mb-3 position-relative">
//                 <input
//                   type={showPassword ? "text" : "password"}
//                   className="form-control bg-dark text-light border-secondary"
//                   id="loginPassword"
//                   placeholder="Password"
//                   name="password"
//                   value={formData.password}
//                   onChange={handleChange}
//                   autoComplete="current-password"
//                   disabled={loading}
//                   required
//                 />
//                 <label htmlFor="loginPassword" className="text-secondary">
//                   Password
//                 </label>
//                 <button
//                   type="button"
//                   className="btn bg-transparent border-0 text-white-50 position-absolute top-50 end-0 translate-middle-y me-3"
//                   onClick={() => setShowPassword((prev) => !prev)}
//                 >
//                   {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
//                 </button>
//               </div>

//               <div className="text-end mb-3">
//                 <button
//                   type="button"
//                   className="btn btn-link text-decoration-underline text-white-50 p-0"
//                   onClick={handleForgotPassword}
//                   disabled={loading}
//                 >
//                   Forgot Password?
//                 </button>
//               </div>

//               <button type="submit" className="btn btn-light w-100 py-3" disabled={loading}>
//                 {loading ? "Logging in..." : "Login"}
//               </button>
//             </form>
//           </div>
//         </div>
//       </div>

//       <style>{`
//         .bg-gradient {
//           background: linear-gradient(
//             to top,
//             rgba(0,0,0,0.9) 0%,
//             rgba(0,0,0,0.4) 50%,
//             rgba(0,0,0,0.6) 100%
//           );
//         }
//         .letter-spacing-3 {
//           letter-spacing: 3px;
//         }
//         .opacity-0 { opacity: 0 !important; }
//         .opacity-100 { opacity: 1 !important; }
//         .transition { transition: opacity 1.5s ease-in-out; }
//       `}</style>
//     </div>
//   );
// };

// export default Login;

import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import supabase from "./supabaseClient";
import aurobindoImage from "../pages/aurobindo.jpg";
import shivajiImage from "../pages/shivaji.jpg";
import swamivivekanandaImage from "../pages/swamivivekanand.jpg";
import veersavarkarImage from "../pages/veersavarkar.jpg";

const slides = [
  { image: shivajiImage, quote: "Freedom is a boon, which everyone has the right to receive.", author: "Chhatrapati Shivaji Maharaj" },
  { image: aurobindoImage, quote: "Sanatan Dharma, that is Nationalism.", author: "Sri Aurobindo" },
  { image: veersavarkarImage, quote: "Give me blood, and I shall give you freedom.", author: "Subhash Chandra Bose" },
  { image: swamivivekanandaImage, quote: "Arise, awake and stop not till the goal is reached.", author: "Swami Vivekananda" },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);
  const [focused, setFocused] = useState("");

  useEffect(() => {
    const t = setInterval(() => setCurrentSlide(p => (p + 1) % slides.length), 5000);
    return () => clearInterval(t);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        if (session) { navigate("/home"); return; }
        setSupabaseReady(true);
      } catch { setSupabaseReady(true); }
    };
    checkAuth();
  }, [navigate]);

  useEffect(() => {
    const params = new URLSearchParams(location.search);
    if (params.get("message") === "verify-email") {
      const e = sessionStorage.getItem("pending_email");
      if (e) { setFormData(p => ({ ...p, email: e })); toast.info("Please verify your email before logging in."); sessionStorage.removeItem("pending_email"); }
    }
  }, [location]);

  const handleChange = e => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.email || !formData.password) { toast.error("Please fill in all fields"); return; }
    setLoading(true);
    try {
      const { data, error } = await supabase.auth.signInWithPassword({ email: formData.email, password: formData.password });
      if (error) { toast.error(error.message || "Login failed"); return; }
      if (data.session) { toast.success(`Welcome back!`); navigate("/home"); }
    } catch { toast.error("Something went wrong."); }
    finally { setLoading(false); }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) { toast.error("Enter your email first"); return; }
    const { error } = await supabase.auth.resetPasswordForEmail(formData.email, { redirectTo: `${window.location.origin}/reset-password` });
    if (error) toast.error(error.message); else toast.success("Reset email sent!");
  };

  if (!supabaseReady) return (
    <div style={{ display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", minHeight:"100vh", background:"#0c0c0e" }}>
      <div style={{ width:28,height:28,border:"2px solid rgba(255,255,255,0.1)",borderTop:"2px solid white",borderRadius:"50%",animation:"spin 0.8s linear infinite" }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  );

  return (
    <div style={s.root}>
      <style>{css}</style>

      {/* ══ LEFT PANEL: Image Carousel ══ */}
      <div style={s.left}>

        {/* Image slides */}
        {slides.map((slide, i) => (
          <div key={i} style={{ position:"absolute", inset:0, opacity: currentSlide === i ? 1 : 0, transition:"opacity 1.6s ease", zIndex: currentSlide === i ? 1 : 0 }}>
            <img src={slide.image} alt={slide.author} style={{ width:"100%", height:"100%", objectFit:"cover" }} />
            <div style={s.imgOverlay} />
          </div>
        ))}

        {/* Brand badge top-left */}
        <div style={s.badge}>
          <span style={s.badgeDot} />
          <span style={s.badgeLabel}>Bharat Speaks</span>
        </div>

        {/* Quote at bottom */}
        <div style={s.quoteBox}>
          <svg width="28" height="20" viewBox="0 0 28 20" fill="none" style={{ marginBottom: 12, opacity: 0.4 }}>
            <path d="M0 20V12.5C0 5.6 4.2 1.4 12.6 0L13.4 1.8C9.6 2.8 7.4 5 6.8 8.4H12V20H0ZM16 20V12.5C16 5.6 20.2 1.4 28.6 0L29.4 1.8C25.6 2.8 23.4 5 22.8 8.4H28V20H16Z" fill="white"/>
          </svg>
          <p style={s.quoteText}>{slides[currentSlide].quote}</p>
          <p style={s.quoteAuthor}>— {slides[currentSlide].author}</p>
        </div>

        {/* Dots */}
        <div style={s.dots}>
          {slides.map((_, i) => (
            <button key={i} onClick={() => setCurrentSlide(i)} style={{ ...s.dot, width: i === currentSlide ? 32 : 8, opacity: i === currentSlide ? 1 : 0.3 }} />
          ))}
        </div>

      </div>

      {/* ══ RIGHT PANEL: Login Form ══ */}
      <div style={s.right}>
        <div style={s.card}>

          <h1 style={s.title}>Welcome back</h1>
          <p style={s.sub}>
            Don't have an account?{" "}
            <button onClick={() => navigate("/signup")} disabled={loading} style={s.linkBtn}>Sign up</button>
          </p>

          <form onSubmit={handleSubmit} style={{ display:"flex", flexDirection:"column", gap:16 }}>

            {/* Email */}
            <div style={s.field}>
              <label style={{
                ...s.label,
                top: formData.email || focused==="email" ? 9 : 19,
                fontSize: formData.email || focused==="email" ? 11 : 15,
                color: focused==="email" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                letterSpacing: formData.email || focused==="email" ? 0.5 : 0,
              }}>Email address</label>
              <input type="email" name="email" value={formData.email} onChange={handleChange}
                onFocus={() => setFocused("email")} onBlur={() => setFocused("")}
                disabled={loading} required
                style={{ ...s.input, borderColor: focused==="email" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)" }}
              />
            </div>

            {/* Password */}
            <div style={s.field}>
              <label style={{
                ...s.label,
                top: formData.password || focused==="password" ? 9 : 19,
                fontSize: formData.password || focused==="password" ? 11 : 15,
                color: focused==="password" ? "rgba(255,255,255,0.7)" : "rgba(255,255,255,0.35)",
                letterSpacing: formData.password || focused==="password" ? 0.5 : 0,
              }}>Password</label>
              <input type={showPassword ? "text" : "password"} name="password" value={formData.password}
                onChange={handleChange}
                onFocus={() => setFocused("password")} onBlur={() => setFocused("")}
                disabled={loading} required
                style={{ ...s.input, paddingRight:50, borderColor: focused==="password" ? "rgba(255,255,255,0.35)" : "rgba(255,255,255,0.08)" }}
              />
              <button type="button" onClick={() => setShowPassword(p => !p)} style={s.eyeBtn}>
                {showPassword ? <EyeOff size={17}/> : <Eye size={17}/>}
              </button>
            </div>

            {/* Forgot */}
            <div style={{ textAlign:"right", marginTop:-4 }}>
              <button type="button" onClick={handleForgotPassword} disabled={loading} style={s.forgotBtn}>Forgot password?</button>
            </div>

            {/* Submit */}
            <button type="submit" disabled={loading} style={s.submitBtn} className="login-submit">
              {loading
                ? <span style={{ display:"flex", alignItems:"center", justifyContent:"center", gap:10 }}>
                    <span style={s.btnSpin} />Signing in...
                  </span>
                : "Sign in"
              }
            </button>

          </form>

          {/* Divider */}
          <div style={{ display:"flex", alignItems:"center", gap:14, margin:"28px 0" }}>
            <span style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }} />
            <span style={{ color:"rgba(255,255,255,0.25)", fontSize:12, letterSpacing:0.5 }}>or continue with</span>
            <span style={{ flex:1, height:1, background:"rgba(255,255,255,0.07)" }} />
          </div>

          {/* Social */}
          <div style={{ display:"flex", gap:12 }}>
            <button style={s.socialBtn} className="social-btn">
              <svg width="17" height="17" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l3.66-2.84z"/>
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google
            </button>
            <button style={s.socialBtn} className="social-btn">
              <svg width="17" height="17" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.8-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M13 3.5c.73-.83 1.94-1.46 2.94-1.5.13 1.17-.34 2.35-1.04 3.19-.69.85-1.83 1.51-2.95 1.42-.15-1.15.41-2.35 1.05-3.11z"/>
              </svg>
              Apple
            </button>
          </div>

        </div>
      </div>
    </div>
  );
};

const s = {
  root: {
    display: "flex", minHeight: "100vh",
    backgroundColor: "#0c0c0e",
    fontFamily: "'SF Pro Display', -apple-system, BlinkMacSystemFont, 'Helvetica Neue', sans-serif",
  },

  // Left
  left: { flex:"0 0 48%", position:"relative", overflow:"hidden" },
  imgOverlay: {
    position:"absolute", inset:0,
    background:"linear-gradient(to top, rgba(0,0,0,0.93) 0%, rgba(0,0,0,0.15) 55%, rgba(0,0,0,0.5) 100%)",
  },
  badge: {
    position:"absolute", top:24, left:24, zIndex:10,
    display:"flex", alignItems:"center", gap:8,
    backgroundColor:"rgba(255,255,255,0.1)",
    backdropFilter:"blur(12px)",
    borderRadius:20, padding:"7px 14px",
    border:"1px solid rgba(255,255,255,0.15)",
  },
  badgeDot: { width:7, height:7, borderRadius:"50%", backgroundColor:"#4ade80" },
  badgeLabel: { color:"white", fontSize:13, fontWeight:600, letterSpacing:0.3 },
  quoteBox: { position:"absolute", bottom:72, left:0, right:0, padding:"0 40px", zIndex:10 },
  quoteText: { color:"white", fontSize:19, fontWeight:300, fontStyle:"italic", lineHeight:1.6, marginBottom:14 },
  quoteAuthor: { color:"rgba(255,255,255,0.45)", fontSize:12, letterSpacing:1.5, fontWeight:600, textTransform:"uppercase" },
  dots: { position:"absolute", bottom:28, left:"50%", transform:"translateX(-50%)", display:"flex", gap:8, zIndex:10 },
  dot: { height:8, borderRadius:4, backgroundColor:"white", border:"none", cursor:"pointer", padding:0, transition:"all 0.3s ease" },

  // Right
  right: {
    flex:1, display:"flex", alignItems:"center", justifyContent:"center",
    padding:"48px 32px",
    background:"radial-gradient(ellipse at 20% 20%, rgba(255,255,255,0.025) 0%, transparent 60%), #0c0c0e",
  },
  card: { width:"100%", maxWidth:380 },
  title: { color:"white", fontSize:30, fontWeight:600, letterSpacing:"-0.7px", marginBottom:8 },
  sub: { color:"rgba(255,255,255,0.35)", fontSize:14.5, marginBottom:36 },
  linkBtn: { background:"none", border:"none", color:"rgba(255,255,255,0.75)", fontSize:14.5, cursor:"pointer", textDecoration:"underline", textDecorationColor:"rgba(255,255,255,0.2)", padding:0 },
  field: { position:"relative" },
  label: { position:"absolute", left:16, zIndex:1, pointerEvents:"none", transition:"all 0.18s ease" },
  input: {
    width:"100%", backgroundColor:"rgba(255,255,255,0.05)",
    border:"1px solid", borderRadius:14, color:"white", fontSize:15,
    padding:"26px 16px 10px", outline:"none",
    transition:"border-color 0.2s ease", boxSizing:"border-box",
  },
  eyeBtn: { position:"absolute", right:14, top:"50%", transform:"translateY(-50%)", background:"none", border:"none", color:"rgba(255,255,255,0.35)", cursor:"pointer", padding:4, display:"flex", alignItems:"center" },
  forgotBtn: { background:"none", border:"none", color:"rgba(255,255,255,0.3)", fontSize:13, cursor:"pointer", padding:0 },
  submitBtn: { width:"100%", padding:"15px", backgroundColor:"white", color:"#000", border:"none", borderRadius:14, fontSize:15, fontWeight:600, cursor:"pointer", transition:"all 0.18s ease", marginTop:4 },
  btnSpin: { display:"inline-block", width:15, height:15, border:"2px solid rgba(0,0,0,0.15)", borderTop:"2px solid #000", borderRadius:"50%", animation:"spin 0.75s linear infinite" },
  socialBtn: { flex:1, display:"flex", alignItems:"center", justifyContent:"center", gap:10, padding:"13px 16px", backgroundColor:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.08)", borderRadius:14, color:"rgba(255,255,255,0.65)", fontSize:14, fontWeight:500, cursor:"pointer", transition:"all 0.18s ease" },
};

const css = `
  @keyframes spin { to { transform: rotate(360deg); } }

  @media (max-width: 768px) {
    [style*="flex: 0 0 48%"] { display: none !important; }
  }

  .login-submit:hover:not(:disabled) {
    background-color: #e5e5e5 !important;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(255,255,255,0.1);
  }
  .login-submit:active:not(:disabled) { transform: translateY(0) !important; }

  .social-btn:hover {
    background-color: rgba(255,255,255,0.08) !important;
    border-color: rgba(255,255,255,0.18) !important;
    color: white !important;
  }

  input:-webkit-autofill {
    -webkit-box-shadow: 0 0 0 1000px #131316 inset !important;
    -webkit-text-fill-color: white !important;
  }

  * { box-sizing: border-box; }
`;

export default Login;