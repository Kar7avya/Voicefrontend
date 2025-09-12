// import React, { useState, useEffect } from "react";
// import { useNavigate, useLocation } from "react-router-dom";
// import { toast } from "react-toastify";
// import supabase from "./supabaseClient";

// const Login = () => {
//   const navigate = useNavigate();
//   const location = useLocation();

//   const [formData, setFormData] = useState({ email: "", password: "" });
//   const [loading, setLoading] = useState(false);

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

//   function handleChange(e) {
//     setFormData((prev) => ({
//       ...prev,
//       [e.target.name]: e.target.value,
//     }));
//   }

//   async function handleSubmit(e) {
//     e.preventDefault();
//     if (!formData.email || !formData.password) {
//       toast.error("Fill in all fields");
//       return;
//     }

//     setLoading(true);
//     try {
//       const { data, error } = await supabase.auth.signInWithPassword({
//         email: formData.email,
//         password: formData.password,
//       });

//       if (error) {
//         toast.error(error.message);
//         return;
//       }

//       if (data.session) {
//         localStorage.setItem("access_token", data.session.access_token);
//         localStorage.setItem("refresh_token", data.session.refresh_token);
//         localStorage.setItem("user_id", data.session.user.id);
//         localStorage.setItem("user_email", data.session.user.email);

//         toast.success(`Welcome ${data.session.user.user_metadata?.full_name || "User"}!`);
//         navigate("/home");
//       }
//     } catch (err) {
//       console.error("Login error:", err);
//       toast.error("Something went wrong.");
//     } finally {
//       setLoading(false);
//     }
//   }

//   return (
//     <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem" }}>
//       <h2>Login</h2>
//       <form onSubmit={handleSubmit}>
//         <input
//           type="email"
//           name="email"
//           placeholder="Email"
//           value={formData.email}
//           onChange={handleChange}
//           required
//         />
//         <input
//           type="password"
//           name="password"
//           placeholder="Password"
//           value={formData.password}
//           onChange={handleChange}
//           required
//         />
//         <button type="submit" disabled={loading}>
//           {loading ? "Logging in..." : "Login"}
//         </button>
//       </form>
//       <p>
//         Don’t have an account?{" "}
//         <button onClick={() => navigate("/signup")}>Sign Up</button>
//       </p>
//     </div>
//   );
// };

// export default Login;
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { toast } from "react-toastify";
import supabase from "./supabaseClient";

const Login = () => {
  const navigate = useNavigate();
  const location = useLocation();

  const [formData, setFormData] = useState({ email: "", password: "" });
  const [loading, setLoading] = useState(false);
  const [supabaseReady, setSupabaseReady] = useState(false);

  // Check if user is already logged in
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
        setSupabaseReady(true); // Still allow login attempt
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
        
        // Handle specific error types
        if (error.message.includes("Email not confirmed")) {
          toast.error("Please check your email and confirm your account first.");
        } else if (error.message.includes("Invalid login credentials")) {
          toast.error("Invalid email or password. Please check your credentials.");
        } else if (error.message.includes("Too many requests")) {
          toast.error("Too many login attempts. Please try again later.");
        } else if (error.message.includes("Email address not confirmed")) {
          toast.error("Please verify your email address before logging in.");
        } else {
          toast.error(error.message || "Login failed. Please try again.");
        }
        return;
      }

      if (data.session && data.user) {
        console.log("✅ Login successful:", data.user.email);
        
        // Store session data
        localStorage.setItem("access_token", data.session.access_token);
        localStorage.setItem("refresh_token", data.session.refresh_token);
        localStorage.setItem("user_id", data.session.user.id);
        localStorage.setItem("user_email", data.session.user.email);
        
        // Store user metadata if available
        if (data.session.user.user_metadata) {
          localStorage.setItem("user_metadata", JSON.stringify(data.session.user.user_metadata));
        }

        const userName = data.session.user.user_metadata?.full_name || 
                        data.session.user.email.split("@")[0] || 
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
      } else if (err.message.includes("Failed to fetch")) {
        toast.error("Unable to connect to authentication service. Please try again.");
      } else {
        toast.error("Something went wrong. Please try again.");
      }
    } finally {
      setLoading(false);
    }
  }

  // Handle forgot password
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
      <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem", textAlign: "center" }}>
        <h2>Login</h2>
        <p>Loading authentication service...</p>
      </div>
    );
  }

  return (
    <div style={{ maxWidth: 400, margin: "2rem auto", padding: "2rem" }}>
      <h2>Login</h2>
      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
            autoComplete="email"
          />
        </div>
        <div style={{ marginBottom: "1rem" }}>
          <input
            style={{ width: "100%", padding: "0.5rem", fontSize: "1rem" }}
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
            autoComplete="current-password"
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
            borderRadius: "4px",
            cursor: loading ? "not-allowed" : "pointer",
            marginBottom: "1rem"
          }}
        >
          {loading ? "Logging in..." : "Login"}
        </button>
      </form>
      
      <div style={{ textAlign: "center", marginBottom: "1rem" }}>
        <button 
          onClick={handleForgotPassword}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer",
            fontSize: "0.9rem"
          }}
          disabled={loading}
        >
          Forgot Password?
        </button>
      </div>
      
      <p style={{ textAlign: "center" }}>
        Don't have an account?{" "}
        <button 
          onClick={() => navigate("/signup")}
          style={{
            background: "none",
            border: "none",
            color: "#007bff",
            textDecoration: "underline",
            cursor: "pointer"
          }}
        >
          Sign Up
        </button>
      </p>
    </div>
  );
};

export default Login;
