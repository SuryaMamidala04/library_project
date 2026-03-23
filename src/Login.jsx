

import React, { useState } from 'react';
import axios from 'axios';
import './Login.css';
import { useNavigate } from 'react-router-dom';


function Login({ onBack, onLoginSuccess, onRegisterClick, onVerify }) {
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:10000" 
    : "https://library-project-mgs4.onrender.com";
    
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [showForgotPassword, setShowForgotPassword] = useState(false);
  const [otp, setOtp] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const navigate = useNavigate();

  // --- NEW LOADING STATES ---
  const [isLoading, setIsLoading] = useState(false);
  const [isSendingOtp, setIsSendingOtp] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Guard clause

    setIsLoading(true);
    setError('');
    try {
      const res = await axios.post(`${API_URL}/api/student/login`, { email, password });

      if (res.status === 200) {
        const { _id, name } = res.data.user;
        localStorage.setItem('studentId', _id);
        localStorage.setItem('studentName', name);
        localStorage.setItem('userRole', 'student');
        onLoginSuccess();
      }
    } catch (err) {
      if (err.response && err.response.status === 403 && err.response.data.unverified) {
            alert("Your account is not verified. Redirecting to verification page...");
            navigate('/verify', { state: { email: email, fromLogin: true } });
        } else {
            setError(err.response?.data?.message || 'Login failed. Check your credentials.');
        }
    } finally {
      setIsLoading(false);
    }
  };

  const sendOTP = async () => {
    if (!email) return alert("Please enter your email first");
    if (isSendingOtp) return;

    setIsSendingOtp(true);
    try {
      await axios.post(`${API_URL}/api/student/forgot-password`, { email });
      alert("OTP Sent to " + email);
    } catch (err) {
      alert("Failed to send OTP. Check if email is valid.");
    } finally {
      setIsSendingOtp(false);
    }
  };

  const handleResetPassword = async () => {
    if (isResetting) return;

    setIsResetting(true);
    try {
      await axios.post(`${API_URL}/api/student/reset-password`, {
        email,
        otp,
        newPassword
      });
      alert("Password Reset Successfully!");
      setShowForgotPassword(false);
      setError(''); 
    } catch (err) {
      alert("Reset failed. Please check your OTP.");
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <div className="login-window-container container-fluid p-0">
      <nav className="glass-nav px-3 px-md-5">
        <div className="logo-container">
          <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Aditya Logo" className="nav-logo" />
          <div className="logo-text">
            <h2 className="d-none d-sm-block">Aditya</h2>
            <span>Library Hub</span>
          </div>
        </div>
        <div className="nav-actions">
          <button className="back-btn" onClick={onBack} disabled={isLoading}>← Back</button>
        </div>
      </nav>

      <div className="login-card-wrapper container">
        <div className="row justify-content-center w-100">
          <div className="col-lg-4 col-md-6 col-11 login-card shadow-sm p-4">
            <h2 className="login-header">Student Login</h2>
            
            {error && <div className="error-pill mb-3" style={{color: 'red', textAlign: 'center'}}>{error}</div>}
            
            <form className="login-form" onSubmit={handleSubmit}>
              <div className="input-field">
                <span className="icon">✉</span>
                <input 
                  type="email" 
                  placeholder="Email" 
                  className="form-control border-0 bg-transparent"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required 
                />
              </div>
              <div className="input-field">
                <span className="icon">🔒</span>
                <input 
                  type="password" 
                  placeholder="Password" 
                  className="form-control border-0 bg-transparent"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required 
                />
              </div>
              {error && (
                <div className="forgot-pw-wrapper text-center mb-3">
                  <span className="register-link" onClick={() => setShowForgotPassword(true)}>
                    Forgot Password?
                  </span>
                </div>
              )}
              {/* LOGIN BUTTON WITH LOADING STATE */}
              <button type="submit" className="login-main-btn w-100" disabled={isLoading}>
                {isLoading ? "Logging in..." : "Login"}
              </button>
              
              <div className="register-text text-center mt-4">
                Don't have an account? 
                <span className="register-link" onClick={onRegisterClick}> Register here</span>
              </div>
            </form>
          </div>
        </div>
      </div>

      {showForgotPassword && (
        <div className="modal-overlay d-flex align-items-center justify-content-center p-3">
          <div className="fform-container col-lg-4 col-md-6 col-12 mx-auto">
            <h3 className="login-header" style={{textAlign: 'left'}}>Reset Password</h3>
            <p className="fform-subtitle">We will send a 6-digit code to your registered email.</p>

            <div className="fotp-input-wrapper">
              <input type="email" value={email} readOnly className="fread-only-box" />
              <button 
                type="button" 
                onClick={sendOTP} 
                className="fotp-trigger"
                disabled={isSendingOtp}
              >
                {isSendingOtp ? "..." : "Send OTP"}
              </button>
            </div>

            <div className="finput-group">
              <label>Verification Code</label>
              <input type="text" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} />
            </div>

            <div className="finput-group">
              <label>New Password</label>
              <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
            </div>

            <div className="fform-footer">
              <button type="button" className="fcancel-btn" onClick={() => setShowForgotPassword(false)} disabled={isResetting}>Back</button>
              <button 
                type="button" 
                className="fsave-btn" 
                onClick={handleResetPassword}
                disabled={isResetting}
              >
                {isResetting ? "Resetting..." : "Reset"}
              </button>
            </div>
          </div>
        </div>
      )}

      <div className="footer-copyright mt-auto">
        <p>Copyrights 2026 Library Hub. All Rights Reserved</p>
      </div>
    </div>
  );
}

export default Login;