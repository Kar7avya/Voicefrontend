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
  {
    image: shivajiImage,
    quote: "Freedom is a boon, which everyone has the right to receive.",
    author: "Chhatrapati Shivaji Maharaj",
  },
  {
    image: aurobindoImage,
    quote: "Sanatan Dharma, that is Nationalism.",
    author: "Sri Aurobindo",
  },
  {
    image: veersavarkarImage,
    quote: "Give me blood, and I shall give you freedom.",
    author: "Subhash Chandra Bose",
  },
  {
    image: swamivivekanandaImage,
    quote: "Arise, awake and stop not till the goal is reached.",
    author: "Swami Vivekananda",
  },
];

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => setCurrentSlide((prev) => (prev + 1) % slides.length), 5000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const {
          data: { session },
        } = await supabase.auth.getSession();
        if (session) {
          navigate("/home");
          return;
        }
        setSupabaseReady(true);
      } catch (err) {
        console.error("Auth check failed:", err);
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

  const handleChange = (e) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e) => {
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email: formData.email,
        password: formData.password,
      });

      if (error) {
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please confirm your email first.");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password.");
        } else if (error.message.includes("Too many requests")) {
          toast.error("Too many attempts. Please try again later.");
        } else {
          toast.error(error.message || "Login failed. Please try again.");
        }
        return;
      }

      if (data.session && data.user) {
        const userName =
          data.user.user_metadata?.full_name || data.user.email.split("@")[0] || "User";
        toast.success(`Welcome back, ${userName}!`);
        navigate("/home");
      } else {
        toast.error("Login failed. Please try again.");
      }
    } catch (err) {
      if (err.message?.includes("fetch")) {
        toast.error("Network error. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  };

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
      <div className="d-flex flex-column justify-content-center align-items-center vh-100 bg-dark text-white">
        <div className="spinner-border text-light mb-3" role="status" />
        <p>Loading authentication service...</p>
      </div>
    );
  }

  return (
    <div className="container-fluid min-vh-100 bg-dark text-light">
      <div className="row min-vh-100">
        {/* Left carousel panel */}
        <div className="col-lg-6 d-none d-lg-flex flex-column p-0 position-relative">
          <div className="w-100 h-100 position-relative">
            <div className="position-absolute top-0 start-0 m-4 fw-bold fs-3 letter-spacing-3">
              
            </div>

            {slides.map((slide, index) => (
              <div
                key={index}
                className={`position-absolute w-100 h-100 transition opacity-${
                  currentSlide === index ? "100" : "0"
                }`}
                style={{
                  transition: "opacity 1.5s ease-in-out",
                }}
              >
                <img
                  src={slide.image}
                  alt={slide.author}
                  className="w-100 h-100"
                  style={{ objectFit: "cover", filter: slide.filter }}
                />
                <div className="position-absolute top-0 start-0 w-100 h-100 bg-gradient" />
              </div>
            ))}

            <div className="position-absolute bottom-0 start-0 w-100 text-center text-white px-4 pb-5">
              <blockquote className="display-6 fw-light fst-italic mb-3">
                “{slides[currentSlide].quote}”
              </blockquote>
              <p className="h5 fw-semibold">— {slides[currentSlide].author}</p>
            </div>

            <div className="position-absolute bottom-0 start-50 translate-middle-x mb-3 d-flex gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  className={`btn rounded-pill p-0 ${
                    index === currentSlide ? "bg-white" : "bg-white-50"
                  }`}
                  style={{
                    width: index === currentSlide ? "2.5rem" : "0.75rem",
                    height: "0.75rem",
                    opacity: index === currentSlide ? 1 : 0.4,
                  }}
                  onClick={() => setCurrentSlide(index)}
                />
              ))}
            </div>
          </div>
        </div>

        {/* Right form panel */}
        <div className="col-lg-6 d-flex align-items-center">
          <div className="w-100 px-4 py-5 mx-auto" style={{ maxWidth: "480px" }}>
            <h1 className="fw-normal mb-2">Welcome back</h1>
            <p className="text-white-50 mb-4">
              Don’t have an account?{" "}
              <button
                type="button"
                className="btn btn-link p-0 align-baseline text-decoration-underline"
                onClick={() => navigate("/signup")}
                disabled={loading}
              >
                Sign up
              </button>
            </p>

            <form onSubmit={handleSubmit}>
              <div className="form-floating mb-3">
                <input
                  type="email"
                  className="form-control bg-dark text-light border-secondary"
                  id="loginEmail"
                  placeholder="name@example.com"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  autoComplete="email"
                  disabled={loading}
                  required
                />
                <label htmlFor="loginEmail" className="text-secondary">
                  Email address
                </label>
              </div>

              <div className="form-floating mb-3 position-relative">
                <input
                  type={showPassword ? "text" : "password"}
                  className="form-control bg-dark text-light border-secondary"
                  id="loginPassword"
                  placeholder="Password"
                  name="password"
                  value={formData.password}
                  onChange={handleChange}
                  autoComplete="current-password"
                  disabled={loading}
                  required
                />
                <label htmlFor="loginPassword" className="text-secondary">
                  Password
                </label>
                <button
                  type="button"
                  className="btn bg-transparent border-0 text-white-50 position-absolute top-50 end-0 translate-middle-y me-3"
                  onClick={() => setShowPassword((prev) => !prev)}
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>

              <div className="text-end mb-3">
                <button
                  type="button"
                  className="btn btn-link text-decoration-underline text-white-50 p-0"
                  onClick={handleForgotPassword}
                  disabled={loading}
                >
                  Forgot Password?
                </button>
              </div>

              <button type="submit" className="btn btn-light w-100 py-3" disabled={loading}>
                {loading ? "Logging in..." : "Login"}
              </button>
            </form>
          </div>
        </div>
      </div>

      <style>{`
        .bg-gradient {
          background: linear-gradient(
            to top,
            rgba(0,0,0,0.9) 0%,
            rgba(0,0,0,0.4) 50%,
            rgba(0,0,0,0.6) 100%
          );
        }
        .letter-spacing-3 {
          letter-spacing: 3px;
        }
        .opacity-0 { opacity: 0 !important; }
        .opacity-100 { opacity: 1 !important; }
        .transition { transition: opacity 1.5s ease-in-out; }
      `}</style>
    </div>
  );
};

export default Login;