

// import React from 'react';
// import './Register.css';
// import VerifyOtp from './Verify';

// function Register({ onGoToLogin, onVerify }) {
//   // window.location.hostname checks the browser's address bar.
// // If it says 'localhost', it uses your local URL. 
// // Otherwise, it uses your live Render URL.
// const API_URL = window.location.hostname === "localhost" 
//   ? "http://localhost:10000" 
//   : "https://library-project-mgs4.onrender.com";
//   const handleRegister = async (e) => {
//     e.preventDefault();
    
//     const formData = new FormData(e.target);
//     const userData = Object.fromEntries(formData.entries());

//     try {
//       const response = await fetch(`${API_URL}/api/register`, {
//         method: 'POST',
//         headers: { 'Content-Type': 'application/json' },
//         body: JSON.stringify(userData)
//       });

//       const data = await response.json();

//       if (response.ok) {
//         alert("Registration Successful! Please check your email for the OTP.");
//         onVerify(userData.email); 
//       } else {
//         alert(data.message || "Registration failed");
//       }
//     } catch (error) {
//       console.error("Error connecting to backend:", error);
//       alert("Server is not running or connection failed!");
//     }
//   };

//   return (
//     <div className="auth-container">
      
//       {/* <div className="window-label">Register Window</div> */}
//       <div className="auth-card">
//         <h2 className="auth-header">Register</h2>
//         <form className="auth-form" onSubmit={handleRegister}>
//           {/* Student ID Field Added Below */}
//           <div className="input-group">
//             <span className="input-icon">🆔</span>
//             <input name="studentId" type="text" placeholder="Student ID / Roll No" required />
//           </div>
//           <div className="input-group">
//             <span className="input-icon">👤</span>
//             <input name="name" type="text" placeholder="Name" required />
//           </div>
//           <div className="input-group">
//             <span className="input-icon">✉</span>
//             <input name="email" type="email" placeholder="Email" required />
//           </div>
//           <div className="input-group">
//             <span className="input-icon">🔒</span>
//             <input name="password" type="password" placeholder="Password" required />
//           </div>
//           <button type="submit" className="auth-btn">Register</button>
//           <div className="auth-footer">
//             Already have an account? <span className="auth-link" onClick={onGoToLogin}>Login here</span>
//           </div>
//         </form>
//       </div>
//     </div>
//   );
// }

// export default Register;


import React, { useState } from 'react';
import './Register.css';
import VerifyOtp from './Verify';

function Register({ onGoToLogin, onVerify }) {
  const API_URL = window.location.hostname === "localhost" 
    ? "http://localhost:10000" 
    : "https://library-project-mgs4.onrender.com";

  // --- NEW LOADING STATE ---
  const [isLoading, setIsLoading] = useState(false);

  const handleRegister = async (e) => {
    e.preventDefault();
    if (isLoading) return; // Prevent double trigger

    setIsLoading(true);
    const formData = new FormData(e.target);
    const userData = Object.fromEntries(formData.entries());

    try {
      const response = await fetch(`${API_URL}/api/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(userData)
      });

      const data = await response.json();

      if (response.ok) {
        alert("Registration Successful! Please check your email for the OTP.");
        onVerify(userData.email); 
      } else {
        alert(data.message || "Registration failed");
      }
    } catch (error) {
      console.error("Error connecting to backend:", error);
      alert("Server is not running or connection failed!");
    } finally {
      // Re-enable if registration fails so they can fix errors
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2 className="auth-header">Register</h2>
        <form className="auth-form" onSubmit={handleRegister}>
          <div className="input-group">
            <span className="input-icon">🆔</span>
            <input name="studentId" type="text" placeholder="Student ID / Roll No" required />
          </div>
          <div className="input-group">
            <span className="input-icon">👤</span>
            <input name="name" type="text" placeholder="Name" required />
          </div>
          <div className="input-group">
            <span className="input-icon">✉</span>
            <input name="email" type="email" placeholder="Email" required />
          </div>
          <div className="input-group">
            <span className="input-icon">🔒</span>
            <input name="password" type="password" placeholder="Password" required />
          </div>

          {/* BUTTON DISABLED DURING LOADING */}
          <button 
            type="submit" 
            className="auth-btn" 
            disabled={isLoading}
          >
            {isLoading ? "Processing..." : "Register"}
          </button>

          <div className="auth-footer">
            Already have an account? 
            <span 
              className="auth-link" 
              style={{ cursor: isLoading ? 'not-allowed' : 'pointer' }}
              onClick={!isLoading ? onGoToLogin : null}
            >
               Login here
            </span>
          </div>
        </form>
      </div>
    </div>
  );
}

export default Register;