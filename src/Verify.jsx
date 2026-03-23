
import React, { useState, useRef, useEffect } from 'react';
import { useLocation } from 'react-router-dom'; 
import './Verify.css'; 

function VerifyOtp({ email: propEmail, onVerified }) {
  const location = useLocation();
  const email = propEmail || location.state?.email || "";
  const hasTriggered = useRef(false);

  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:10000" 
    : "https://library-project-mgs4.onrender.com";

  const [otp, setOtp] = useState(new Array(6).fill(""));
  const [timer, setTimer] = useState(60); 
  const [canResend, setCanResend] = useState(false);
  
  // --- LOADING STATES FOR PROTECTION ---
  const [loading, setLoading] = useState(false); // For Resend
  const [isVerifying, setIsVerifying] = useState(false); // For Verify Button
  
  const inputRefs = useRef([]);

  useEffect(() => {
    let interval;
    if (timer > 0) {
      interval = setInterval(() => {
        setTimer((prev) => prev - 1);
      }, 1000);
    } else {
      setCanResend(true);
    }
    return () => clearInterval(interval);
  }, [timer]);

  useEffect(() => {
    if (email && location.state?.fromLogin && !hasTriggered.current) {
      hasTriggered.current = true;
      triggerInitialOTP();
    }
  }, [email, location.state, API_URL]);

  const triggerInitialOTP = async () => {
    try {
      await fetch(`${API_URL}/api/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
    } catch (err) {
      console.error("Auto-OTP failed", err);
    }
  };

  useEffect(() => {
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus();
    }
  }, []);

  const handleChange = (element, index) => {
    if (isNaN(element.value)) return false;
    const newOtp = [...otp];
    newOtp[index] = element.value.substring(element.value.length - 1);
    setOtp(newOtp);
    if (element.value !== "" && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (e, index) => {
    if (e.key === "Backspace") {
      if (!otp[index] && index > 0) {
        const newOtp = [...otp];
        newOtp[index - 1] = "";
        setOtp(newOtp);
        inputRefs.current[index - 1].focus();
      } else {
        const newOtp = [...otp];
        newOtp[index] = "";
        setOtp(newOtp);
      }
    }
  };

  const handleResend = async () => {
    if (!canResend || loading) return;
    setLoading(true);
    try {
      const response = await fetch(`${API_URL}/api/resend-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (response.ok) {
        alert("A new OTP has been sent to " + email);
        setTimer(60); 
        setCanResend(false);
      } else {
        alert("Failed to resend OTP. Please try again.");
      }
    } catch (error) {
      alert("Error connecting to server.");
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (e) => {
    e.preventDefault();
    if (isVerifying) return; // Prevent double trigger

    const finalOtp = otp.join("");
    if (finalOtp.length !== 6) {
      alert("Please enter all 6 digits.");
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch(`${API_URL}/api/verify-otp`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: email, otp: finalOtp })
      });

      const data = await response.json();
      if (response.ok) {
        alert("Account verified successfully!");
        onVerified(); 
      } else {
        alert(data.message || "Invalid or expired OTP");
      }
    } catch (error) {
      console.error("Verification error:", error);
      alert("Could not connect to the server.");
    } finally {
      setIsVerifying(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-header">Verify Email</h2>
        <p style={{ textAlign: 'center', marginBottom: '15px', color: '#555' }}>
          An OTP has been sent to <br/>
          <strong style={{ color: '#2563eb' }}>{email || "your email"}</strong>
        </p>
        
        <form onSubmit={handleVerify}>
          <div style={{ display: 'flex', gap: '10px', justifyContent: 'center', marginBottom: '20px' }}>
            {otp.map((data, index) => (
              <input
                key={index}
                type="text"
                maxLength="1"
                className="otp-box"
                value={data}
                ref={(el) => (inputRefs.current[index] = el)}
                onChange={(e) => handleChange(e.target, index)}
                onKeyDown={(e) => handleKeyDown(e, index)}
                style={{
                  width: '40px', height: '50px', textAlign: 'center',
                  fontSize: '20px', borderRadius: '8px', border: '2px solid #ddd'
                }}
              />
            ))}
          </div>
          {/* VERIFY BUTTON WITH LOADING PROTECTION */}
          <button 
            type="submit" 
            className="auth-btn" 
            disabled={isVerifying}
          >
            {isVerifying ? "Verifying..." : "Verify & Activate"}
          </button>
        </form>

        <div style={{ textAlign: 'center', marginTop: '15px' }}>
          <p style={{ fontSize: '14px', color: '#666' }}>
            Didn't receive the code?
          </p>
          <button 
            onClick={handleResend}
            disabled={!canResend || loading}
            style={{
              background: 'none',
              border: 'none',
              color: canResend ? '#2563eb' : '#999',
              cursor: (canResend && !loading) ? 'pointer' : 'not-allowed',
              fontWeight: 'bold',
              marginTop: '3px',
              textDecoration: canResend ? 'underline' : 'none'
            }}
          >
            {loading ? "Sending..." : canResend ? "Resend OTP" : `Resend in ${timer}s`}
          </button>
        </div>
      </div>
    </div>
  );
}

export default VerifyOtp;