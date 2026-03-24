import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import 'bootstrap/dist/css/bootstrap.min.css';

import Home from './components/pages/Home';
import Upload from './components/pages/Upload';
import Layout from './components/navigators/Layout';
import SignUp from './components/pages/SignUp';
import Login from './components/pages/Login';
import Dashboard from './components/pages/Dashboard';
import AuthCallback from './components/pages/AuthCallback';
import supabase from './components/pages/supabaseClient';
import Teleprompter from './components/pages/Teleprompter';
import TTSPage from "./components/pages/TTSPage";
import SpeakWell from "./components/pages/SpeakWell";   // ← ADD THIS

// ── Protected Route ───────────────────────────────────────────────
const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session }, error } = await supabase.auth.getSession();
        if (error) {
          console.error('Auth check error:', error);
          setIsAuthenticated(false);
        } else {
          setIsAuthenticated(!!session);
          if (session) {
            localStorage.setItem('access_token',  session.access_token);
            localStorage.setItem('refresh_token', session.refresh_token);
            localStorage.setItem('user_id',       session.user.id);
            localStorage.setItem('user_email',    session.user.email);
          }
        }
      } catch (error) {
        console.error('Auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };

    checkAuth();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log('Auth state changed:', event, session);
        if (event === 'SIGNED_IN' && session) {
          setIsAuthenticated(true);
          localStorage.setItem('access_token',  session.access_token);
          localStorage.setItem('refresh_token', session.refresh_token);
          localStorage.setItem('user_id',       session.user.id);
          localStorage.setItem('user_email',    session.user.email);
        } else if (event === 'SIGNED_OUT') {
          setIsAuthenticated(false);
          localStorage.removeItem('access_token');
          localStorage.removeItem('refresh_token');
          localStorage.removeItem('user_id');
          localStorage.removeItem('user_email');
        }
      }
    );

    return () => subscription.unsubscribe();
  }, []);

  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh', flexDirection:'column' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
        <p style={{ marginTop:'1rem' }}>Checking authentication...</p>
      </div>
    );
  }

  if (!isAuthenticated) return <Navigate to="/login" replace />;
  return children;
};

// ── Public Route ──────────────────────────────────────────────────
const PublicRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { data: { session } } = await supabase.auth.getSession();
        setIsAuthenticated(!!session);
      } catch (error) {
        console.error('Public route auth check failed:', error);
        setIsAuthenticated(false);
      } finally {
        setLoading(false);
      }
    };
    checkAuth();
  }, []);

  if (loading) {
    return (
      <div style={{ display:'flex', justifyContent:'center', alignItems:'center', height:'100vh' }}>
        <div className="spinner-border text-primary" role="status">
          <span className="visually-hidden">Loading...</span>
        </div>
      </div>
    );
  }

  if (isAuthenticated) return <Navigate to="/home" replace />;
  return children;
};

// ── App ───────────────────────────────────────────────────────────
function App() {
  return (
    <Router>
      <ToastContainer
        position="top-center"
        autoClose={3000}
        theme="colored"
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />

      <Routes>
        {/* Root redirect */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Navigate to="/login" replace />
            </PublicRoute>
          }
        />

        {/* Public auth routes */}
        <Route path="/login"  element={<PublicRoute><Login  /></PublicRoute>} />
        <Route path="/signup" element={<PublicRoute><SignUp /></PublicRoute>} />

        {/* Email verification callback */}
        <Route path="/auth/callback" element={<AuthCallback />} />

        {/* Protected routes inside Layout */}
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Layout />
            </ProtectedRoute>
          }
        >
          <Route path="home"         element={<Home />} />
          <Route path="upload"       element={<Upload />} />
          <Route path="dashboard"    element={<Dashboard />} />
          <Route path="teleprompter" element={<Teleprompter />} />
          <Route path="tts"          element={<TTSPage />} />
          <Route path="speakwell"    element={<SpeakWell />} />  {/* ← ADD THIS */}
        </Route>

        {/* Catch-all */}
        <Route
          path="*"
          element={
            <PublicRoute>
              <Navigate to="/login" replace />
            </PublicRoute>
          }
        />
      </Routes>
    </Router>
  );
}

export default App;