// import React, { useState, useEffect } from "react";
// import { useNavigate } from "react-router-dom";
// import { toast } from "react-toastify";
// import supabase from "./supabaseClient";

// const SignUp = () => {
//   const navigate = useNavigate();

//   const [formData, setFormData] = useState({
//     fullname: "",
//     email: "",
//     password: "",
//   });

//   const [loading, setLoading] = useState(false);
//   const [supabaseReady, setSupabaseReady] = useState(false);

//   // Check if Supabase is properly configured
//   useEffect(() => {
//     const checkSupabase = async () => {
//       try {
//         if (!supabase) {
//           throw new Error("Supabase client not initialized");
//         }
        
//         // Simple connection test
//         const { error } = await supabase.auth.getSession();
//         if (error) {
//           console.error("Session check error:", error);
//         }
//         setSupabaseReady(true);
//         console.log("✅ Supabase connection verified");
//       } catch (err) {
//         console.error("❌ Supabase connection failed:", err);
//         toast.error("Authentication service unavailable. Please try again later.");
//       }
//     };
    
//     checkSupabase();
//   }, []);

//   function handleChange(e) {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   }

//   // Safe profile creation using the database function
//   const createUserProfileSafely = async (user) => {
//     try {
//       console.log("🔄 Creating profile for user:", user.id);
      
//       const { data, error } = await supabase.rpc('safe_create_profile', {
//         p_user_id: user.id,
//         p_email: user.email,
//         p_full_name: formData.fullname || ''
//       });

//       if (error) {
//         console.log("Profile creation via function failed:", error);
//         // Try direct insert as fallback
//         return await createProfileDirectly(user);
//       }

//       console.log("✅ Profile created via function:", data);
//       return true;
//     } catch (err) {
//       console.log("Function approach failed, trying direct insert:", err);
//       return await createProfileDirectly(user);
//     }
//   };

//   // Fallback: direct profile creation
//   const createProfileDirectly = async (user) => {
//     try {
//       const { data, error } = await supabase
//         .from('profiles')
//         .insert({
//           auth_user_id: user.id,
//           user_id: user.id,
//           email: user.email,
//           full_name: formData.fullname || '',
//           role: 'user',
//           total_videos: 0,
//           total_storage_used: 0
//         })
//         .select()
//         .single();

//       if (error) {
//         console.log("Direct profile creation also failed:", error);
//         // Even if profile creation fails, user account is still created
//         toast.warning("Account created but profile setup incomplete. You can still use the app.");
//         return false;
//       }

//       console.log("✅ Profile created directly:", data);
//       return true;
//     } catch (err) {
//       console.log("All profile creation methods failed:", err);
//       return false;
//     }
//   };

//   async function handleSubmit(e) {
//     e.preventDefault();
//     console.log("📩 Starting signup process...");

//     if (!supabaseReady) {
//       toast.error("Authentication service is not ready. Please refresh and try again.");
//       return;
//     }

//     if (!formData.fullname || !formData.email || !formData.password) {
//       toast.error("Please fill in all fields");
//       return;
//     }

//     if (formData.password.length < 6) {
//       toast.error("Password must be at least 6 characters");
//       return;
//     }

//     setLoading(true);

//     try {
//       console.log("🔄 Attempting Supabase signup (minimal payload)...");
      
//       // Use minimal signup payload to avoid trigger issues
//       const { data, error } = await supabase.auth.signUp({
//         email: formData.email,
//         password: formData.password,
//         options: {
//           data: { 
//             full_name: formData.fullname 
//           }
//         }
//       });

//       console.log("🔍 Supabase signup response:", { data, error });

//       if (error) {
//         console.error("❌ Supabase signup error:", error);
        
//         // Handle specific error types with better messaging
//         if (error.message.includes("Database error saving new user")) {
//           toast.error("There's a temporary issue with account creation. Our team has been notified. Please try again in a few minutes.");
//         } else if (error.message.includes("already registered") || error.message.includes("already been registered")) {
//           toast.error("This email is already registered. Try logging in instead.");
//         } else if (error.message.includes("Invalid email")) {
//           toast.error("Please enter a valid email address.");
//         } else if (error.message.includes("Password")) {
//           toast.error("Password must be at least 6 characters long.");
//         } else {
//           toast.error(`Account creation failed: ${error.message}`);
//         }
//         return;
//       }

//       // SUCCESS! Now handle the user creation
//       if (data.user) {
//         console.log("✅ User created successfully:", data.user.id);
        
//         // Create profile after successful user creation
//         await createUserProfileSafely(data.user);
        
//         if (!data.session) {
//           // Email confirmation required
//           console.log("📧 Email confirmation required");
//           toast.success(
//             `Verification email sent to ${formData.email}. Please check your email and confirm your account.`
//           );
//           sessionStorage.setItem("pending_email", formData.email);
//           navigate("/login?message=verify-email");
//         } else {
//           // User immediately signed in
//           console.log("✅ User signed in immediately");
//           localStorage.setItem("access_token", data.session.access_token);
//           localStorage.setItem("refresh_token", data.session.refresh_token);
//           toast.success("Account created and logged in successfully!");
//           navigate("/home");
//         }
//       } else {
//         toast.error("Unexpected response from server. Please try again.");
//       }
      
//     } catch (err) {
//       console.error("⚡ Unexpected signup error:", err);
      
//       if (err.message?.includes("fetch") || err.name === "TypeError") {
//         toast.error("Network error. Please check your internet connection and try again.");
//       } else if (err.message?.includes("500") || err.message?.includes("Database error")) {
//         toast.error("Server temporarily unavailable. Please try again in a few minutes.");
//       } else {
//         toast.error("An unexpected error occurred. Please try again.");
//       }
//     } finally {
//       setLoading(false);
//     }
//   }

//   if (!supabaseReady) {
//     return (
//       <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
//         <h2>Create Account</h2>
//         <div style={{ margin: "2rem 0" }}>
//           <div style={{ 
//             width: "40px", 
//             height: "40px", 
//             border: "4px solid #f3f3f3",
//             borderTop: "4px solid #007bff",
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
//     <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem" }}>
//       <h2>Create Account</h2>
      
//       <form onSubmit={handleSubmit}>
//         <div style={{ marginBottom: "1rem" }}>
//           <input
//             style={{ 
//               width: "100%", 
//               padding: "0.75rem", 
//               fontSize: "1rem",
//               border: "2px solid #ddd",
//               borderRadius: "6px",
//               boxSizing: "border-box"
//             }}
//             placeholder="Full Name"
//             name="fullname"
//             type="text"
//             value={formData.fullname}
//             onChange={handleChange}
//             required
//             disabled={loading}
//           />
//         </div>
        
//         <div style={{ marginBottom: "1rem" }}>
//           <input
//             style={{ 
//               width: "100%", 
//               padding: "0.75rem", 
//               fontSize: "1rem",
//               border: "2px solid #ddd",
//               borderRadius: "6px",
//               boxSizing: "border-box"
//             }}
//             placeholder="Email Address"
//             name="email"
//             type="email"
//             value={formData.email}
//             onChange={handleChange}
//             required
//             disabled={loading}
//           />
//         </div>
        
//         <div style={{ marginBottom: "1.5rem" }}>
//           <input
//             style={{ 
//               width: "100%", 
//               padding: "0.75rem", 
//               fontSize: "1rem",
//               border: "2px solid #ddd",
//               borderRadius: "6px",
//               boxSizing: "border-box"
//             }}
//             placeholder="Password (minimum 6 characters)"
//             name="password"
//             type="password"
//             value={formData.password}
//             onChange={handleChange}
//             minLength={6}
//             required
//             disabled={loading}
//           />
//         </div>
        
//         <button 
//           type="submit" 
//           disabled={loading}
//           style={{ 
//             width: "100%", 
//             padding: "0.75rem", 
//             fontSize: "1rem",
//             backgroundColor: loading ? "#ccc" : "#007bff",
//             color: "white",
//             border: "none",
//             borderRadius: "6px",
//             cursor: loading ? "not-allowed" : "pointer",
//             transition: "background-color 0.3s"
//           }}
//         >
//           {loading ? (
//             <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
//               <span style={{ 
//                 marginRight: "0.5rem",
//                 display: "inline-block",
//                 width: "16px",
//                 height: "16px",
//                 border: "2px solid transparent",
//                 borderTop: "2px solid white",
//                 borderRadius: "50%",
//                 animation: "spin 1s linear infinite"
//               }}></span>
//               Creating Account...
//             </span>
//           ) : (
//             "Create Account"
//           )}
//         </button>
//       </form>
      
//       <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#666" }}>
//         Already have an account?{" "}
//         <button 
//           onClick={() => navigate("/login")}
//           style={{
//             background: "none",
//             border: "none",
//             color: "#007bff",
//             textDecoration: "underline",
//             cursor: "pointer",
//             fontSize: "inherit"
//           }}
//           disabled={loading}
//         >
//           Sign In
//         </button>
//       </p>

//       {/* Development debug info */}
//       {process.env.NODE_ENV === 'development' && (
//         <div style={{ 
//           marginTop: "2rem", 
//           padding: "1rem", 
//           backgroundColor: "#f8f9fa",
//           borderRadius: "6px",
//           fontSize: "0.85rem",
//           color: "#666"
//         }}>
//           <strong>Debug Info:</strong><br />
//           Supabase Ready: {supabaseReady ? "✅" : "❌"}<br />
//           Form Valid: {formData.fullname && formData.email && formData.password.length >= 6 ? "✅" : "❌"}
//         </div>
//       )}
//     </div>
//   );
// };

// export default SignUp;
import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { toast } from "react-toastify";
import { Eye, EyeOff } from "lucide-react";
import supabase from "./supabaseClient";

const SignUp = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    fullname: "",
    email: "",
    password: "",
  });

  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [currentSlide, setCurrentSlide] = useState(0);

  // Hero images with quotes
  const slides = [
    {
      image: "https://images.unsplash.com/photo-1604610525665-6973305ff0b4?w=800&h=1200&fit=crop&q=80",
      quote: "Freedom is a boon, which everyone has the right to receive.",
      author: "Chhatrapati Shivaji Maharaj",
      filter: "grayscale(100%) contrast(1.2)"
    },
    {
      image: "https://images.unsplash.com/photo-1618556947959-ec9d4c1d8bf3?w=800&h=1200&fit=crop&q=80",
      quote: "Let us remember that the sole aim and objective is to secure the Hindu nation.",
      author: "Veer Savarkar",
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

  // Auto-slide functionality
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % slides.length);
    }, 5000);
    return () => clearInterval(timer);
  }, []);

  // Check if Supabase is properly configured
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }
        
        const { error } = await supabase.auth.getSession();
        if (error) {
          console.error("Session check error:", error);
        }
        setSupabaseReady(true);
        console.log("✅ Supabase connection verified");
      } catch (err) {
        console.error("❌ Supabase connection failed:", err);
        toast.error("Authentication service unavailable. Please try again later.");
      }
    };
    
    checkSupabase();
  }, []);

  function handleChange(e) {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }));
  }

  const createUserProfileSafely = async (user) => {
    try {
      console.log("🔄 Creating profile for user:", user.id);
      
      const { data, error } = await supabase.rpc('safe_create_profile', {
        p_user_id: user.id,
        p_email: user.email,
        p_full_name: formData.fullname || ''
      });

      if (error) {
        console.log("Profile creation via function failed:", error);
        return await createProfileDirectly(user);
      }

      console.log("✅ Profile created via function:", data);
      return true;
    } catch (err) {
      console.log("Function approach failed, trying direct insert:", err);
      return await createProfileDirectly(user);
    }
  };

  const createProfileDirectly = async (user) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .insert({
          auth_user_id: user.id,
          user_id: user.id,
          email: user.email,
          full_name: formData.fullname || '',
          role: 'user',
          total_videos: 0,
          total_storage_used: 0
        })
        .select()
        .single();

      if (error) {
        console.log("Direct profile creation also failed:", error);
        toast.warning("Account created but profile setup incomplete. You can still use the app.");
        return false;
      }

      console.log("✅ Profile created directly:", data);
      return true;
    } catch (err) {
      console.log("All profile creation methods failed:", err);
      return false;
    }
  };

  async function handleSubmit(e) {
    e.preventDefault();
    console.log("📩 Starting signup process...");

    if (!supabaseReady) {
      toast.error("Authentication service is not ready. Please refresh and try again.");
      return;
    }

    if (!formData.fullname || !formData.email || !formData.password) {
      toast.error("Please fill in all fields");
      return;
    }

    if (formData.password.length < 6) {
      toast.error("Password must be at least 6 characters");
      return;
    }

    setLoading(true);

    try {
      console.log("🔄 Attempting Supabase signup (minimal payload)...");
      
      const { data, error } = await supabase.auth.signUp({
        email: formData.email,
        password: formData.password,
        options: {
          data: { 
            full_name: formData.fullname 
          }
        }
      });

      console.log("🔍 Supabase signup response:", { data, error });

      if (error) {
        console.error("❌ Supabase signup error:", error);
        
        if (error.message.includes("Database error saving new user")) {
          toast.error("There's a temporary issue with account creation. Our team has been notified. Please try again in a few minutes.");
        } else if (error.message.includes("already registered") || error.message.includes("already been registered")) {
          toast.error("This email is already registered. Try logging in instead.");
        } else if (error.message.includes("Invalid email")) {
          toast.error("Please enter a valid email address.");
        } else if (error.message.includes("Password")) {
          toast.error("Password must be at least 6 characters long.");
        } else {
          toast.error(`Account creation failed: ${error.message}`);
        }
        return;
      }

      if (data.user) {
        console.log("✅ User created successfully:", data.user.id);
        
        await createUserProfileSafely(data.user);
        
        if (!data.session) {
          console.log("📧 Email confirmation required");
          toast.success(
            `Verification email sent to ${formData.email}. Please check your email and confirm your account.`
          );
          sessionStorage.setItem("pending_email", formData.email);
          navigate("/login?message=verify-email");
        } else {
          console.log("✅ User signed in immediately");
          localStorage.setItem("access_token", data.session.access_token);
          localStorage.setItem("refresh_token", data.session.refresh_token);
          toast.success("Account created and logged in successfully!");
          navigate("/home");
        }
      } else {
        toast.error("Unexpected response from server. Please try again.");
      }
      
    } catch (err) {
      console.error("⚡ Unexpected signup error:", err);
      
      if (err.message?.includes("fetch") || err.name === "TypeError") {
        toast.error("Network error. Please check your internet connection and try again.");
      } else if (err.message?.includes("500") || err.message?.includes("Database error")) {
        toast.error("Server temporarily unavailable. Please try again in a few minutes.");
      } else {
        toast.error("An unexpected error occurred. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  if (!supabaseReady) {
    return (
      <div style={{ 
        minHeight: "100vh", 
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
      display: "flex",
      minHeight: "100vh",
      backgroundColor: "#0f0f0f",
      fontFamily: "-apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif"
    }}>
      {/* Left Side - Image Slider with Quotes */}
      <div style={{
        flex: 1,
        position: "relative",
        overflow: "hidden",
        backgroundColor: "#000"
      }}>
        {/* Logo */}
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

        {/* Back to website button */}
        <button 
          onClick={() => window.location.href = '/'}
          style={{
            position: "absolute",
            top: "2rem",
            right: "2rem",
            background: "rgba(255, 255, 255, 0.1)",
            backdropFilter: "blur(10px)",
            border: "1px solid rgba(255, 255, 255, 0.2)",
            color: "white",
            padding: "0.75rem 1.5rem",
            borderRadius: "8px",
            cursor: "pointer",
            fontSize: "0.95rem",
            zIndex: 20,
            transition: "all 0.3s"
          }}
        >
          Back to website →
        </button>

        {/* Image Slides */}
        {slides.map((slide, index) => (
          <div
            key={index}
            style={{
              position: "absolute",
              inset: 0,
              opacity: currentSlide === index ? 1 : 0,
              transition: "opacity 1.5s ease-in-out",
              pointerEvents: currentSlide === index ? "auto" : "none"
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
            {/* Dark overlay */}
            <div style={{
              position: "absolute",
              inset: 0,
              background: "linear-gradient(to top, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.4) 50%, rgba(0,0,0,0.6) 100%)"
            }} />
          </div>
        ))}

        {/* Quote Section */}
        <div style={{
          position: "absolute",
          bottom: "4rem",
          left: "50%",
          transform: "translateX(-50%)",
          textAlign: "center",
          color: "white",
          maxWidth: "700px",
          padding: "0 2rem",
          zIndex: 10,
          animation: currentSlide >= 0 ? "fadeInUp 1s ease-out" : "none"
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

        {/* Slide Indicators */}
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

      {/* Right Side - Sign Up Form */}
      <div style={{
        flex: 1,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        backgroundColor: "#1a1a1a"
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
            Create an account
          </h1>

          <p style={{
            color: "rgba(255, 255, 255, 0.5)",
            marginBottom: "2.5rem",
            fontSize: "1rem"
          }}>
            Already have an account?{" "}
            <button
              onClick={() => navigate("/login")}
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
              Log in
            </button>
          </p>

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
              placeholder="Fletcher"
              name="fullname"
              type="text"
              value={formData.fullname}
              onChange={handleChange}
              required
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
            />
          </div>
          
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
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
            />
          </div>
          
          <div style={{ marginBottom: "1.5rem", position: "relative" }}>
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
              placeholder="Enter your password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={formData.password}
              onChange={handleChange}
              minLength={6}
              required
              disabled={loading}
              onFocus={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.3)"}
              onBlur={(e) => e.target.style.borderColor = "rgba(255, 255, 255, 0.1)"}
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

          <label style={{
            display: "flex",
            alignItems: "flex-start",
            gap: "0.75rem",
            color: "rgba(255, 255, 255, 0.6)",
            marginBottom: "1.5rem",
            cursor: "pointer",
            fontSize: "0.95rem"
          }}>
            <input
              type="checkbox"
              required
              style={{
                width: "1.2rem",
                height: "1.2rem",
                cursor: "pointer",
                marginTop: "0.1rem"
              }}
            />
            <span>
              I agree to the <span style={{ color: "#fff", textDecoration: "underline" }}>Terms & Conditions</span>
            </span>
          </label>
          
          <button 
            onClick={handleSubmit}
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
              transition: "all 0.3s",
              marginBottom: "2rem"
            }}
          >
            {loading ? (
              <span style={{ display: "flex", alignItems: "center", justifyContent: "center", gap: "0.5rem" }}>
                <span style={{ 
                  display: "inline-block",
                  width: "16px",
                  height: "16px",
                  border: "2px solid transparent",
                  borderTop: "2px solid #666",
                  borderRadius: "50%",
                  animation: "spin 1s linear infinite"
                }}></span>
                Creating Account...
              </span>
            ) : (
              "Create account"
            )}
          </button>

          <div style={{
            display: "flex",
            alignItems: "center",
            gap: "1rem",
            marginBottom: "1.5rem"
          }}>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
            <span style={{ color: "rgba(255, 255, 255, 0.4)", fontSize: "0.9rem" }}>
              Or register with
            </span>
            <div style={{ flex: 1, height: "1px", backgroundColor: "rgba(255, 255, 255, 0.1)" }} />
          </div>

          <div style={{
            display: "grid",
            gridTemplateColumns: "1fr 1fr",
            gap: "1rem"
          }}>
            <button
              type="button"
              style={{
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "white",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.3s"
              }}
            >
              Google
            </button>
            <button
              type="button"
              style={{
                padding: "1rem",
                borderRadius: "8px",
                border: "1px solid rgba(255, 255, 255, 0.1)",
                backgroundColor: "rgba(255, 255, 255, 0.05)",
                color: "white",
                fontSize: "1rem",
                cursor: "pointer",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                gap: "0.5rem",
                transition: "all 0.3s"
              }}
            >
              Apple
            </button>
          </div>
        </div>
      </div>

      <style>{`
        @keyframes fadeInUp {
          from { 
            opacity: 0; 
            transform: translateX(-50%) translateY(30px); 
          }
          to { 
            opacity: 1; 
            transform: translateX(-50%) translateY(0); 
          }
        }
        
        input::placeholder {
          color: rgba(255, 255, 255, 0.3);
        }
        
        button:hover:not(:disabled) {
          transform: translateY(-1px);
          opacity: 0.9;
        }
      `}</style>
    </div>
  );
};

export default SignUp;