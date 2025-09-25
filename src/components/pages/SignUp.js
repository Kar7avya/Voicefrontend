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
//         const { data, error } = await supabase.auth.getSession();
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
//         const profileCreated = await createUserProfileSafely(data.user);
        
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

  // Check if Supabase is properly configured
  useEffect(() => {
    const checkSupabase = async () => {
      try {
        if (!supabase) {
          throw new Error("Supabase client not initialized");
        }
        
        // Simple connection test
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

  // Safe profile creation using the database function
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
        // Try direct insert as fallback
        return await createProfileDirectly(user);
      }

      console.log("✅ Profile created via function:", data);
      return true;
    } catch (err) {
      console.log("Function approach failed, trying direct insert:", err);
      return await createProfileDirectly(user);
    }
  };

  // Fallback: direct profile creation
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
        // Even if profile creation fails, user account is still created
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
      
      // Use minimal signup payload to avoid trigger issues
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
        
        // Handle specific error types with better messaging
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

      // SUCCESS! Now handle the user creation
      if (data.user) {
        console.log("✅ User created successfully:", data.user.id);
        
        // Create profile after successful user creation
        await createUserProfileSafely(data.user);
        
        if (!data.session) {
          // Email confirmation required
          console.log("📧 Email confirmation required");
          toast.success(
            `Verification email sent to ${formData.email}. Please check your email and confirm your account.`
          );
          sessionStorage.setItem("pending_email", formData.email);
          navigate("/login?message=verify-email");
        } else {
          // User immediately signed in
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
      <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
        <h2>Create Account</h2>
        <div style={{ margin: "2rem 0" }}>
          <div style={{ 
            width: "40px", 
            height: "40px", 
            border: "4px solid #f3f3f3",
            borderTop: "4px solid #007bff",
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
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem" }}>
      <h2>Create Account</h2>
      
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{ 
              width: "100%", 
              padding: "0.75rem", 
              fontSize: "1rem",
              border: "2px solid #ddd",
              borderRadius: "6px",
              boxSizing: "border-box"
            }}
            placeholder="Full Name"
            name="fullname"
            type="text"
            value={formData.fullname}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{ 
              width: "100%", 
              padding: "0.75rem", 
              fontSize: "1rem",
              border: "2px solid #ddd",
              borderRadius: "6px",
              boxSizing: "border-box"
            }}
            placeholder="Email Address"
            name="email"
            type="email"
            value={formData.email}
            onChange={handleChange}
            required
            disabled={loading}
          />
        </div>
        
        <div style={{ marginBottom: "1.5rem" }}>
          <input
            style={{ 
              width: "100%", 
              padding: "0.75rem", 
              fontSize: "1rem",
              border: "2px solid #ddd",
              borderRadius: "6px",
              boxSizing: "border-box"
            }}
            placeholder="Password (minimum 6 characters)"
            name="password"
            type="password"
            value={formData.password}
            onChange={handleChange}
            minLength={6}
            required
            disabled={loading}
          />
        </div>
        
        <button 
          type="submit" 
          disabled={loading}
          style={{ 
            width: "100%", 
            padding: "0.75rem", 
            fontSize: "1rem",
            backgroundColor: loading ? "#ccc" : "#007bff",
            color: "white",
            border: "none",
            borderRadius: "6px",
            cursor: loading ? "not-allowed" : "pointer",
            transition: "background-color 0.3s"
          }}
        >
          {loading ? (
            <span style={{ display: "flex", alignItems: "center", justifyContent: "center" }}>
              <span style={{ 
                marginRight: "0.5rem",
                display: "inline-block",
                width: "16px",
                height: "16px",
                border: "2px solid transparent",
                borderTop: "2px solid white",
                borderRadius: "50%",
                animation: "spin 1s linear infinite"
              }}></span>
              Creating Account...
            </span>
          ) : (
            "Create Account"
          )}
        </button>
      </form>
      
      <p style={{ textAlign: "center", marginTop: "1.5rem", color: "#666" }}>
        Already have an account?{" "}
        <button 
          onClick={() => navigate("/login")}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "inherit"
          }}
          disabled={loading}
        >
          Sign In
        </button>
      </p>

      {/* Development debug info */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{ 
          marginTop: "2rem", 
          padding: "1rem", 
          backgroundColor: "#f8f9fa",
          borderRadius: "6px",
          fontSize: "0.85rem",
          color: "#666"
        }}>
          <strong>Debug Info:</strong><br />
          Supabase Ready: {supabaseReady ? "✅" : "❌"}<br />
          Form Valid: {formData.fullname && formData.email && formData.password.length >= 6 ? "✅" : "❌"}
        </div>
      )}
    </div>
  );
};

export default SignUp;