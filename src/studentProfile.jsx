

// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './studentProfile.css';

// const StudentProfile = () => {
//     // window.location.hostname checks the browser's address bar.
// // If it says 'localhost', it uses your local URL. 
// // Otherwise, it uses your live Render URL.
// const API_URL = window.location.hostname === "localhost" 
//   ? "http://localhost:10000" 
//   : "https://library-project-mgs4.onrender.com";
//     const navigate = useNavigate();
//     const [user, setSet] = useState(null);
//     const [view, setView] = useState('profile'); 
//     const [formData, setFormData] = useState({ current: '', new: '', otp: '', email: '' });
    
//     const studentId = localStorage.getItem('studentId');
//     console.log(studentId); 

//     useEffect(() => {
//         const fetchProfile = async () => {
//             if (!studentId || studentId === "undefined") {
//                 console.error("Student ID is missing from localStorage");
//                 return;
//             }
//             try {
//                 const res = await axios.get(`${API_URL}/api/student/profile/${studentId}`);
//                 setSet(res.data);
//                 setFormData(prev => ({ ...prev, email: res.data.email }));
//             } catch (err) {
//                 console.error("Profile fetch failed:", err);
//             }
//         };
//         fetchProfile();
//     }, [studentId]);

//     const handleChangePassword = async (e) => {
//         e.preventDefault();
//         try {
//             await axios.put(`${API_URL}/api/student/change-password`, {
//                 studentId, 
//                 currentPassword: formData.current, 
//                 newPassword: formData.new
//             });
//             alert("Password Updated Successfully!");
//             setView('profile');
//             setFormData({ ...formData, current: '', new: '' });
//         } catch (err) { 
//             alert(err.response?.data?.message || "Update failed"); 
//         }
//     };

//     const sendOTP = async () => {
//         try {
//             await axios.post(`${API_URL}/api/student/forgot-password`, { email: formData.email });
//             alert("OTP Sent to " + formData.email);
//         } catch (err) {
//             alert("Failed to send OTP. Check if email is valid.");
//         }
//     };

//     if (!user) return (
//         <div className="profile-loading-state">
//             <div className="loader"></div>
//             <p>Loading Profile...</p>
//             <button onClick={() => navigate('/admin-dashboard')}>Go Back</button>
//         </div>
//     );

//     return (
//         <div className="profile-page-wrapper">
//             {/* Top Navigation Bar */}
//            <nav className="glass-nav">
//     <div className="nav-left">
//         <div className="logo-container"  style={{ cursor: 'pointer' }}>
//             <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Logo" className="nav-logo" />
//             <div className="logo-text">
//                 <h2>Aditya</h2>
//                 <span>Library Hub</span>
//             </div>
//         </div>
//     </div>
    
//     <div className="nav-right">
//         <span className="admin-tag">Student</span>
//         {/* Back Button moved to the right side */}
//         <button className="back-circle-btn" onClick={() => navigate('/all-books')} title="Back to Dashboard">
//             ←Back
//         </button>
//     </div>
// </nav>
//             <div className="profile-main-content">
//                 <div className="profile-card">
//                     {view === 'profile' && (
//                         <div className="profile-view">
//                             <div className="avatar-circle">
//                                 {user.name.charAt(0).toUpperCase()}
//                             </div>
//                             <h2 className="profile-title">Student Settings</h2>
                            
//                             <div className="info-grid">
//                                  <div className="info-row">
//                                     <label>Student Id</label>
//                                     <p>{user.studentId}</p>
//                                 </div>
//                                 <div className="info-row">
//                                     <label>Full Name</label>
//                                     <p>{user.name}</p>
//                                 </div>
//                                 <div className="info-row">
//                                     <label>Email Address</label>
//                                     <p>{user.email}</p>
//                                 </div>
//                                 {/* <div className="info-row">
//                                     <label>Account Role</label>
//                                     <p>Senior Administrator</p>
//                                 </div> */}
//                             </div>

//                             <div className="profile-btn-group">
//                                 <button className="primary-btn" onClick={() => setView('change')}>
//                                     Update Password
//                                 </button>
//                                 <button className="text-btn" onClick={() => setView('forgot')}>
//                                     Forgot Password?
//                                 </button>
//                             </div>
//                         </div>
//                     )}

//                     {view === 'change' && (
//                         <form onSubmit={handleChangePassword} className="form-container">
//                             <h3>Security Update</h3>
//                             <p className="form-subtitle">Enter your current password to verify it's you.</p>
                            
//                             <div className="input-group">
//                                 <label>Current Password</label>
//                                 <input 
//                                     type="password" 
//                                     required 
//                                     onChange={e => setFormData({...formData, current: e.target.value})} 
//                                 />
//                             </div>

//                             <div className="input-group">
//                                 <label>New Password</label>
//                                 <input 
//                                     type="password" 
//                                     required 
//                                     onChange={e => setFormData({...formData, new: e.target.value})} 
//                                 />
//                             </div>

//                             <div className="form-footer">
//                                 <button type="button" className="cancel-btn" onClick={() => setView('profile')}>Cancel</button>
//                                 <button type="submit" className="save-btn">Save Changes</button>
//                             </div>
//                         </form>
//                     )}

//                     {view === 'forgot' && (
//                         <div className="form-container">
//                             <h3>Reset Password</h3>
//                             <p className="form-subtitle">We will send a 6-digit code to your registered email.</p>
                            
//                             <div className="otp-input-wrapper">
//                                 <input type="email" value={formData.email} readOnly className="read-only-box" />
//                                 <button type="button" onClick={sendOTP} className="otp-trigger">Send OTP</button>
//                             </div>

//                             <div className="input-group">
//                                 <label>Verification Code</label>
//                                 <input type="text" placeholder="000000" onChange={e => setFormData({...formData, otp: e.target.value})} />
//                             </div>

//                             <div className="input-group">
//                                 <label>New Password</label>
//                                 <input type="password" onChange={e => setFormData({...formData, new: e.target.value})} />
//                             </div>

//                             <div className="form-footer">
//                                 <button type="button" className="cancel-btn" onClick={() => setView('profile')}>Back</button>
//                                 <button className="save-btn" onClick={async () => {
//                                     await axios.post(`${API_URL}/api/student/reset-password`, { 
//                                         email: formData.email, otp: formData.otp, newPassword: formData.new 
//                                     });
//                                     alert("Success!"); setView('profile');
//                                 }}>Reset</button>
//                             </div>
//                         </div>
//                     )}
//                 </div>
//             </div>
//              <div className="footer-copyright">
//         <p>Copyrights 2026 Library Hub. All Rights Reserved</p>
//       </div>
//         </div>
//     );
// };

// export default StudentProfile;

import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './studentProfile.css';

const StudentProfile = () => {
    const API_URL = window.location.hostname === "localhost" 
      ? "http://localhost:10000" 
      : "https://library-project-mgs4.onrender.com";
      
    const navigate = useNavigate();
    const [user, setSet] = useState(null);
    const [view, setView] = useState('profile'); 
    const [formData, setFormData] = useState({ current: '', new: '', otp: '', email: '' });
    
    // --- NEW LOADING STATES ---
    const [isUpdating, setIsUpdating] = useState(false);
    const [isSendingOtp, setIsSendingOtp] = useState(false);
    const [isResetting, setIsResetting] = useState(false);
    
    const studentId = localStorage.getItem('studentId');

    useEffect(() => {
        const fetchProfile = async () => {
            if (!studentId || studentId === "undefined") return;
            try {
                const res = await axios.get(`${API_URL}/api/student/profile/${studentId}`);
                setSet(res.data);
                setFormData(prev => ({ ...prev, email: res.data.email }));
            } catch (err) {
                console.error("Profile fetch failed:", err);
            }
        };
        fetchProfile();
    }, [studentId, API_URL]);

    const handleChangePassword = async (e) => {
        e.preventDefault();
        if (isUpdating) return; // Prevent double trigger

        setIsUpdating(true);
        try {
            await axios.put(`${API_URL}/api/student/change-password`, {
                studentId, 
                currentPassword: formData.current, 
                newPassword: formData.new
            });
            alert("Password Updated Successfully!");
            setView('profile');
            setFormData({ ...formData, current: '', new: '' });
        } catch (err) { 
            alert(err.response?.data?.message || "Update failed"); 
        } finally {
            setIsUpdating(false);
        }
    };

    const sendOTP = async () => {
        if (isSendingOtp) return;
        setIsSendingOtp(true);
        try {
            await axios.post(`${API_URL}/api/student/forgot-password`, { email: formData.email });
            alert("OTP Sent to " + formData.email);
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
                email: formData.email, 
                otp: formData.otp, 
                newPassword: formData.new 
            });
            alert("Success!"); 
            setView('profile');
        } catch (err) {
            alert(err.response?.data?.message || "Reset failed");
        } finally {
            setIsResetting(false);
        }
    };

    if (!user) return (
        <div className="profile-loading-state">
            <div className="loader"></div>
            <p>Loading Profile...</p>
            <button onClick={() => navigate('/all-books')}>Go Back</button>
        </div>
    );

    return (
        <div className="profile-page-wrapper">
            <nav className="glass-nav">
                <div className="nav-left">
                    <div className="logo-container" style={{ cursor: 'pointer' }}>
                        <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Logo" className="nav-logo" />
                        <div className="logo-text">
                            <h2>Aditya</h2>
                            <span>Library Hub</span>
                        </div>
                    </div>
                </div>
                <div className="nav-right">
                    <span className="admin-tag">Student</span>
                    <button className="back-circle-btn" onClick={() => navigate('/all-books')} title="Back to Dashboard">
                        ←Back
                    </button>
                </div>
            </nav>

            <div className="profile-main-content">
                <div className="profile-card">
                    {view === 'profile' && (
                        <div className="profile-view">
                            <div className="avatar-circle">
                                {user.name.charAt(0).toUpperCase()}
                            </div>
                            <h2 className="profile-title">Student Settings</h2>
                            <div className="info-grid">
                                <div className="info-row"><label>Student Id</label><p>{user.studentId}</p></div>
                                <div className="info-row"><label>Full Name</label><p>{user.name}</p></div>
                                <div className="info-row"><label>Email Address</label><p>{user.email}</p></div>
                            </div>
                            <div className="profile-btn-group">
                                <button className="primary-btn" onClick={() => setView('change')}>Update Password</button>
                                <button className="text-btn" onClick={() => setView('forgot')}>Forgot Password?</button>
                            </div>
                        </div>
                    )}

                    {view === 'change' && (
                        <form onSubmit={handleChangePassword} className="form-container">
                            <h3>Security Update</h3>
                            <p className="form-subtitle">Enter your current password to verify it's you.</p>
                            <div className="input-group">
                                <label>Current Password</label>
                                <input type="password" required onChange={e => setFormData({...formData, current: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>New Password</label>
                                <input type="password" required onChange={e => setFormData({...formData, new: e.target.value})} />
                            </div>
                            <div className="form-footer">
                                <button type="button" className="cancel-btn" onClick={() => setView('profile')} disabled={isUpdating}>Cancel</button>
                                <button type="submit" className="save-btn" disabled={isUpdating}>
                                    {isUpdating ? "Saving..." : "Save Changes"}
                                </button>
                            </div>
                        </form>
                    )}

                    {view === 'forgot' && (
                        <div className="form-container">
                            <h3>Reset Password</h3>
                            <p className="form-subtitle">We will send a 6-digit code to your registered email.</p>
                            <div className="otp-input-wrapper">
                                <input type="email" value={formData.email} readOnly className="read-only-box" />
                                <button type="button" onClick={sendOTP} className="otp-trigger" disabled={isSendingOtp}>
                                    {isSendingOtp ? "..." : "Send OTP"}
                                </button>
                            </div>
                            <div className="input-group">
                                <label>Verification Code</label>
                                <input type="text" placeholder="000000" onChange={e => setFormData({...formData, otp: e.target.value})} />
                            </div>
                            <div className="input-group">
                                <label>New Password</label>
                                <input type="password" onChange={e => setFormData({...formData, new: e.target.value})} />
                            </div>
                            <div className="form-footer">
                                <button type="button" className="cancel-btn" onClick={() => setView('profile')} disabled={isResetting}>Back</button>
                                <button className="save-btn" onClick={handleResetPassword} disabled={isResetting}>
                                    {isResetting ? "Resetting..." : "Reset"}
                                </button>
                            </div>
                        </div>
                    )}
                </div>
            </div>
            <div className="footer-copyright">
                <p>Copyrights 2026 Library Hub. All Rights Reserved</p>
            </div>
        </div>
    );
};

export default StudentProfile;