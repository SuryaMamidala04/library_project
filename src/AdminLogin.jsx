

// import React, { useState } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './AdminLogin.css';

// const AdminLogin = ({ onLoginSuccess }) => {
//     const navigate = useNavigate();
//     const [formData, setFormData] = useState({ email: '', password: '' });
//     const [error, setError] = useState('');
//     const [showForgotPassword, setShowForgotPassword] = useState(false);
//     const [otp, setOtp] = useState('');
//     const [newPassword, setNewPassword] = useState('');

//     const API_URL = window.location.hostname === "localhost" 
//         ? "http://localhost:10000" 
//         : "https://library-project-mgs4.onrender.com";

//     const handleChange = (e) => {
//         setFormData({ ...formData, [e.target.name]: e.target.value });
//     };

//     const handleLogin = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post(`${API_URL}/api/admin/login`, formData);
//             if (res.status === 200) {
//                 localStorage.setItem('adminToken', res.data.token);
//                 localStorage.setItem('adminName', res.data.admin.name); 
//                 localStorage.setItem('adminId', res.data.admin._id || res.data.admin.id);     
//                 localStorage.setItem('userRole', 'admin');
//                 onLoginSuccess();
//             }
//         } catch (err) {
//             setError(err.response?.data?.message || 'Invalid credentials');
//         }
//     };

//     const sendOTP = async () => {
//         if (!formData.email) return alert("Please enter your email first");
//         try {
//             await axios.post(`${API_URL}/api/admin/forgot-password`, { email: formData.email });
//             alert("OTP Sent to " + formData.email);
//         } catch (err) {
//             alert("Failed to send OTP.");
//         }
//     };

//     const handleResetPassword = async () => {
//         try {
//             await axios.post(`${API_URL}/api/admin/reset-password`, {
//                 email: formData.email,
//                 otp,
//                 newPassword
//             });
//             alert("Password Reset Successfully!");
//             setShowForgotPassword(false);
//         } catch (err) {
//             alert("Reset failed. Please check your OTP.");
//         }
//     };

//     return (
//         <div className="login-window-container container-fluid p-0">
//             {/* Responsive Navbar */}
//             <nav className="glass-nav px-3 px-md-5">
//                 <div className="logo-container d-flex align-items-center" onClick={() => navigate("/")}>
//                     <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Aditya Logo" className="nav-logo" />
//                     <div className="logo-text d-none d-sm-block">
//                         <h2 className="m-0">Aditya</h2>
//                         <span>Library Hub</span>
//                     </div>
//                 </div>
//                 <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
//             </nav>

//             {/* Responsive Login Card */}
//             <div className="login-card-wrapper container d-flex align-items-center justify-content-center">
//                 <div className="row justify-content-center w-100">
//                     <div className="col-lg-4 col-md-6 col-11 login-card shadow">
//                         <h2 className="login-header text-center">Admin Login</h2>

//                         {error && <div className="error-pill mb-3">{error}</div>}

//                         <form className="login-form" onSubmit={handleLogin}>
//                             <div className="input-field">
//                                 <span className="icon">✉</span>
//                                 <input 
//                                     type="email" 
//                                     name="email" 
//                                     className="form-control border-0 bg-transparent shadow-none" 
//                                     placeholder="Email Address" 
//                                     value={formData.email} 
//                                     onChange={handleChange} 
//                                     required 
//                                 />
//                             </div>

//                             <div className="input-field">
//                                 <span className="icon">🔒</span>
//                                 <input 
//                                     type="password" 
//                                     name="password" 
//                                     className="form-control border-0 bg-transparent shadow-none" 
//                                     placeholder="Password" 
//                                     value={formData.password} 
//                                     onChange={handleChange} 
//                                     required 
//                                 />
//                             </div>

//                             {error &&
//                             <div className="forgot-pw-wrapper">
//                                 <span className="register-link" onClick={() => setShowForgotPassword(true)}>
//                                     Forgot Password?
//                                 </span>
//                             </div>
// }
//                             <button type="submit" className="login-main-btn w-100 mt-2">Access Dashboard</button>

//                             <div className="register-text text-center mt-4">
//                                 New Administrator? 
//                                 <span className="register-link" onClick={() => navigate("/admin-register")}> Create Account</span>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             </div>

//             {/* Responsive Modal */}
//             {showForgotPassword && (
//                 <div className="modal-overlay d-flex align-items-center justify-content-center p-3">
//                     <div className="fform-container shadow-lg col-12 col-md-6 col-lg-4">
//                         <h3 className="login-header">Reset Password</h3>
//                         <p className="fform-subtitle">We will send a 6-digit code to your email.</p>

//                         <div className="fotp-input-wrapper d-flex gap-2">
//                             <input type="email" value={formData.email} readOnly className="fread-only-box flex-grow-1" />
//                             <button type="button" onClick={sendOTP} className="fotp-trigger">Send</button>
//                         </div>

//                         <div className="finput-group mt-3">
//                             <label>Verification Code</label>
//                             <input type="text" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} />
//                         </div>

//                         <div className="finput-group mt-2">
//                             <label>New Password</label>
//                             <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
//                         </div>

//                         <div className="fform-footer mt-4">
//                             <button type="button" className="fcancel-btn" onClick={() => setShowForgotPassword(false)}>Back</button>
//                             <button type="button" className="fsave-btn" onClick={handleResetPassword}>Reset</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             {/* Minimalist Mobile Footer */}
//             <div className="footer-copyright py-3 text-center border-top mt-auto bg-white">
//                 <p className="m-0 text-muted" style={{fontSize: '0.85rem'}}>
//                     Copyrights 2026 Library Hub. All Rights Reserved
//                 </p>
//             </div>
//         </div>
//     );
// };

// export default AdminLogin;


import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminLogin.css';

const AdminLogin = ({ onLoginSuccess }) => {
    const navigate = useNavigate();
    const [formData, setFormData] = useState({ email: '', password: '' });
    const [error, setError] = useState('');
    const [showForgotPassword, setShowForgotPassword] = useState(false);
    const [otp, setOtp] = useState('');
    const [newPassword, setNewPassword] = useState('');
    
    // --- NEW LOADING STATES ---
    const [isLoading, setIsLoading] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);

    const API_URL = window.location.hostname === "localhost" 
        ? "http://localhost:10000" 
        : "https://library-project-mgs4.onrender.com";

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleLogin = async (e) => {
        e.preventDefault();
        if (isLoading) return; // Prevent double trigger

        setIsLoading(true);
        setError(''); // Clear previous errors
        try {
            const res = await axios.post(`${API_URL}/api/admin/login`, formData);
            if (res.status === 200) {
                localStorage.setItem('adminToken', res.data.token);
                localStorage.setItem('adminName', res.data.admin.name); 
                localStorage.setItem('adminId', res.data.admin._id || res.data.admin.id);     
                localStorage.setItem('userRole', 'admin');
                onLoginSuccess();
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Invalid credentials');
        } finally {
            setIsLoading(false);
        }
    };

    const sendOTP = async () => {
        if (!formData.email) return alert("Please enter your email first");
        if (isSendingOtp) return;

        setIsSendingOtp(true);
        try {
            await axios.post(`${API_URL}/api/admin/forgot-password`, { email: formData.email });
            alert("OTP Sent to " + formData.email);
        } catch (err) {
            alert("Failed to send OTP.");
        } finally {
            setIsSendingOtp(false);
        }
    };

    const handleResetPassword = async () => {
        if (isResetting) return;
        
        setIsResetting(true);
        try {
            await axios.post(`${API_URL}/api/admin/reset-password`, {
                email: formData.email,
                otp,
                newPassword
            });
            alert("Password Reset Successfully!");
            setShowForgotPassword(false);
        } catch (err) {
            alert("Reset failed. Please check your OTP.");
        } finally {
            setIsResetting(false);
        }
    };

    return (
        <div className="login-window-container container-fluid p-0">
            <nav className="glass-nav px-3 px-md-5">
                <div className="logo-container d-flex align-items-center" onClick={() => navigate("/")}>
                    <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Aditya Logo" className="nav-logo" />
                    <div className="logo-text d-none d-sm-block">
                        <h2 className="m-0">Aditya</h2>
                        <span>Library Hub</span>
                    </div>
                </div>
                <button className="back-btn" onClick={() => navigate("/")}>← Back</button>
            </nav>

            <div className="login-card-wrapper container d-flex align-items-center justify-content-center">
                <div className="row justify-content-center w-100">
                    <div className="col-lg-4 col-md-6 col-11 login-card shadow">
                        <h2 className="login-header text-center">Admin Login</h2>

                        {error && <div className="error-pill mb-3">{error}</div>}

                        <form className="login-form" onSubmit={handleLogin}>
                            <div className="input-field">
                                <span className="icon">✉</span>
                                <input 
                                    type="email" 
                                    name="email" 
                                    className="form-control border-0 bg-transparent shadow-none" 
                                    placeholder="Email Address" 
                                    value={formData.email} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            <div className="input-field">
                                <span className="icon">🔒</span>
                                <input 
                                    type="password" 
                                    name="password" 
                                    className="form-control border-0 bg-transparent shadow-none" 
                                    placeholder="Password" 
                                    value={formData.password} 
                                    onChange={handleChange} 
                                    required 
                                />
                            </div>

                            {error &&
                                <div className="forgot-pw-wrapper">
                                    <span className="register-link" onClick={() => setShowForgotPassword(true)}>
                                        Forgot Password?
                                    </span>
                                </div>
                            }
                            
                            {/* LOGIN BUTTON WITH LOADING STATE */}
                            <button 
                                type="submit" 
                                className="login-main-btn w-100 mt-2"
                                disabled={isLoading}
                            >
                                {isLoading ? "Verifying..." : "Access Dashboard"}
                            </button>

                            <div className="register-text text-center mt-4">
                                New Administrator? 
                                <span className="register-link" onClick={() => navigate("/admin-register")}> Create Account</span>
                            </div>
                        </form>
                    </div>
                </div>
            </div>

            {showForgotPassword && (
                <div className="modal-overlay d-flex align-items-center justify-content-center p-3">
                    <div className="fform-container shadow-lg col-12 col-md-6 col-lg-4">
                        <h3 className="login-header">Reset Password</h3>
                        <p className="fform-subtitle">We will send a 6-digit code to your email.</p>

                        <div className="fotp-input-wrapper d-flex gap-2">
                            <input type="email" value={formData.email} readOnly className="fread-only-box flex-grow-1" />
                            <button 
                                type="button" 
                                onClick={sendOTP} 
                                className="fotp-trigger"
                                disabled={isSendingOtp}
                            >
                                {isSendingOtp ? "..." : "Send"}
                            </button>
                        </div>

                        <div className="finput-group mt-3">
                            <label>Verification Code</label>
                            <input type="text" placeholder="000000" value={otp} onChange={(e) => setOtp(e.target.value)} />
                        </div>

                        <div className="finput-group mt-2">
                            <label>New Password</label>
                            <input type="password" placeholder="••••••••" value={newPassword} onChange={(e) => setNewPassword(e.target.value)} />
                        </div>

                        <div className="fform-footer mt-4">
                            <button type="button" className="fcancel-btn" onClick={() => setShowForgotPassword(false)} disabled={isResetting}>Back</button>
                            {/* RESET BUTTON WITH LOADING STATE */}
                            <button 
                                type="button" 
                                className="fsave-btn" 
                                onClick={handleResetPassword}
                                disabled={isResetting}
                            >
                                {isResetting ? "Updating..." : "Reset"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <div className="footer-copyright py-3 text-center border-top mt-auto bg-white">
                <p className="m-0 text-muted" style={{fontSize: '0.85rem'}}>
                    Copyrights 2026 Library Hub. All Rights Reserved
                </p>
            </div>
        </div>
    );
};

export default AdminLogin;