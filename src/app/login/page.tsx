"use client";

import { useState, useEffect } from "react";
import { supabaseClient } from "@/lib/supabase-client";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [theme, setTheme] = useState<string>("light");
  const [showPassword, setShowPassword] = useState(false);

  useEffect(() => {
    const savedTheme = localStorage.getItem("theme") || "light";
    let activeTheme = savedTheme;
    if (savedTheme === "system") {
      activeTheme = window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    }
    setTheme(activeTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === "light" ? "dark" : "light";
    setTheme(newTheme);
    localStorage.setItem("theme", newTheme);
    document.documentElement.setAttribute("data-bs-theme", newTheme);
  };

  const handleEmailLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    const { error } = await supabaseClient.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      setError(error.message);
      setLoading(false);
    } else {
      window.location.href = "/users/profile";
    }
  };

  const handleGoogleLogin = async () => {
    setLoading(true);
    const { error } = await supabaseClient.auth.signInWithOAuth({
      provider: "google",
      options: {
        redirectTo: `${window.location.origin}/auth/callback`,
      },
    });
    if (error) {
      setError(error.message);
      setLoading(false);
    }
  };

  return (
    <div className="min-vh-100 d-flex align-items-center justify-content-center position-relative overflow-hidden" 
      style={{ 
        background: theme === "dark" ? "#0f172a" : "#f8fafc",
        fontFamily: "'Space Grotesk', sans-serif"
      }}>
      
      {/* Decorative Blobs */}
      <div className="position-absolute" style={{
        top: "-10%", right: "-5%", width: "400px", height: "400px",
        background: "radial-gradient(circle, rgba(67, 97, 238, 0.15) 0%, rgba(67, 97, 238, 0) 70%)",
        borderRadius: "50%", zIndex: 0
      }}></div>
      <div className="position-absolute" style={{
        bottom: "-10%", left: "-5%", width: "500px", height: "500px",
        background: "radial-gradient(circle, rgba(29, 146, 241, 0.1) 0%, rgba(29, 146, 241, 0) 70%)",
        borderRadius: "50%", zIndex: 0
      }}></div>

      <button
        onClick={toggleTheme}
        className="btn btn-icon position-absolute top-0 end-0 m-4 shadow-sm"
        style={{ 
          width: "44px", height: "44px", borderRadius: "12px",
          background: theme === "dark" ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
          border: "1px solid " + (theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(0,0,0,0.05)"),
          backdropFilter: "blur(8px)", zIndex: 10
        }}
      >
        {theme === "dark" ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f1f5f9" strokeWidth="2"><circle cx="12" cy="12" r="5"/><path d="M12 1v2M12 21v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M1 12h2M21 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"/></svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1e293b" strokeWidth="2"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>
        )}
      </button>

      <div className="container position-relative" style={{ zIndex: 1, maxWidth: "440px" }}>
        <div className="card border-0 shadow-lg overflow-hidden" 
          style={{ 
            borderRadius: "24px",
            background: theme === "dark" ? "rgba(30, 41, 59, 0.7)" : "rgba(255, 255, 255, 0.8)",
            backdropFilter: "blur(16px)",
            border: "1px solid " + (theme === "dark" ? "rgba(255,255,255,0.1)" : "rgba(255,255,255,0.5)")
          }}>
          <div className="card-body p-4 p-md-5">
            <div className="text-center mb-5">
              <div className="d-inline-block p-3 rounded-4 mb-4" style={{ background: "linear-gradient(135deg, rgba(67, 97, 238, 0.1), rgba(29, 146, 241, 0.1))" }}>
                <img src="https://visora-dev-assets-id.assetsvsiddev.workers.dev/index/base-logo.png" alt="Logo" width="100" />
              </div>
              <h3 className="fw-bold mb-1" style={{ color: theme === "dark" ? "#f1f5f9" : "#1e293b" }}>Welcome Back</h3>
              <p className="text-muted small">Enter your credentials to access your account</p>
            </div>

            {error && (
              <div className="alert border-0 py-3 mb-4 d-flex align-items-center gap-3" 
                style={{ 
                  background: "rgba(239, 68, 68, 0.1)", 
                  color: "#ef4444", 
                  borderRadius: "12px",
                  fontSize: "0.9rem"
                }}>
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
                {error}
              </div>
            )}

            <form onSubmit={handleEmailLogin}>
              <div className="mb-4">
                <label className="form-label small fw-bold mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>Email Address</label>
                <div className="input-group">
                  <span className="input-group-text border-0" style={{ background: theme === "dark" ? "#1e293b" : "#f1f5f9", borderRadius: "12px 0 0 12px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>
                  </span>
                  <input
                    type="email"
                    className="form-control border-0"
                    placeholder="name@example.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    style={{ 
                      height: "52px", 
                      borderRadius: "0 12px 12px 0",
                      background: theme === "dark" ? "#1e293b" : "#f1f5f9",
                      color: theme === "dark" ? "#f1f5f9" : "#1e293b"
                    }}
                  />
                </div>
              </div>

              <div className="mb-4">
                <label className="form-label small fw-bold mb-2" style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>Password</label>
                <div className="input-group">
                  <span className="input-group-text border-0" style={{ background: theme === "dark" ? "#1e293b" : "#f1f5f9", borderRadius: "12px 0 0 12px" }}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>
                  </span>
                  <input
                    type={showPassword ? "text" : "password"}
                    className="form-control border-0"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    style={{ 
                      height: "52px", 
                      background: theme === "dark" ? "#1e293b" : "#f1f5f9",
                      color: theme === "dark" ? "#f1f5f9" : "#1e293b"
                    }}
                  />
                  <button 
                    type="button"
                    className="input-group-text border-0" 
                    onClick={() => setShowPassword(!showPassword)}
                    style={{ background: theme === "dark" ? "#1e293b" : "#f1f5f9", borderRadius: "0 12px 12px 0", cursor: "pointer" }}
                  >
                    {showPassword ? (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/></svg>
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#64748b" strokeWidth="2"><path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/></svg>
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="btn w-100 fw-bold text-white mb-4"
                style={{ 
                  height: "52px", 
                  borderRadius: "12px", 
                  background: "linear-gradient(135deg, #4361EE, #1D92F1)",
                  boxShadow: "0 10px 20px -5px rgba(67, 97, 238, 0.4)",
                  transition: "all 0.3s ease"
                }}
              >
                {loading ? (
                  <span className="spinner-border spinner-border-sm me-2" role="status" aria-hidden="true"></span>
                ) : null}
                {loading ? "Signing in..." : "Sign In"}
              </button>
            </form>

            <div className="d-flex align-items-center mb-4">
              <hr className="flex-grow-1" style={{ opacity: 0.1 }} />
              <span className="px-3 text-muted small">or continue with</span>
              <hr className="flex-grow-1" style={{ opacity: 0.1 }} />
            </div>

            <button
              onClick={handleGoogleLogin}
              disabled={loading}
              className="btn w-100 d-flex align-items-center justify-content-center gap-3 fw-medium"
              style={{ 
                height: "52px", 
                borderRadius: "12px",
                background: theme === "dark" ? "rgba(255,255,255,0.05)" : "#fff",
                border: "1px solid " + (theme === "dark" ? "rgba(255,255,255,0.1)" : "#e2e8f0"),
                color: theme === "dark" ? "#f1f5f9" : "#1e293b"
              }}
            >
              <svg width="20" height="20" viewBox="0 0 24 24">
                <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
              </svg>
              Google Account
            </button>

            <p className="text-center mt-5 mb-0 small" style={{ color: theme === "dark" ? "#94a3b8" : "#64748b" }}>
              Don't have an account?{" "}
              <a href="/register" className="fw-bold text-decoration-none" style={{ color: "#4361EE" }}>
                Create Account
              </a>
            </p>
          </div>
        </div>
        
        <p className="text-center mt-4 text-muted small" style={{ opacity: 0.5 }}>
          &copy; 2026 Vallzx APIs • All rights reserved
        </p>
      </div>

      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Space+Grotesk:wght@300;400;500;600;700&display=swap');
        body {
          margin: 0;
          padding: 0;
        }
        .btn:hover {
          transform: translateY(-1px);
          filter: brightness(1.1);
        }
        .form-control:focus {
          box-shadow: none;
          background: ${theme === "dark" ? "#2a374a" : "#fff"} !important;
          border: 1px solid #4361EE !important;
        }
        .input-group:focus-within .input-group-text {
          background: ${theme === "dark" ? "#2a374a" : "#fff"} !important;
          color: #4361EE !important;
        }
      `}</style>
    </div>
  );
}
