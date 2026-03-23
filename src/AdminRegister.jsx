
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminRegister.css'; 

const AdminRegister = () => {
    const API_URL = window.location.hostname === "localhost" 
      ? "http://localhost:10000" 
      : "https://library-project-mgs4.onrender.com";
      
    const [formData, setFormData] = useState({
        empId: '',
        name: '',
        email: '',
        password: '',
        adminSecret: ''    
    });
    
    const [error, setError] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const navigate = useNavigate();

    const handleChange = (e) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleRegister = async (e) => {
        e.preventDefault();
        if (isLoading) return; 

        setIsLoading(true);
        setError('');
        
        try {
            const res = await axios.post(`${API_URL}/api/admin/register`, formData);
            if (res.status === 201) {
                alert("Admin Registered Successfully!");
                navigate('/admin-login');
            }
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="admin-register-container">
            <div className="back-nav">
                <button 
                    className="back-circle-btn" 
                    onClick={() => navigate(-1)} 
                    disabled={isLoading}
                >
                    ←<span>Back</span>
                </button>
            </div>

            <div className="admin-register-card">
                <div className="admin-header">
                    <div className="shield-icon">🛡️</div>
                    <h2>Admin Creation</h2>
                </div>
                
                <div className="dev-team-warning">
                    ⚠️ Accessible for institution development team only
                </div>

                <form onSubmit={handleRegister}>
                    <div className="input-group">
                        <label>Employee ID</label>
                        <input 
                            type="text" 
                            name="empId" 
                            placeholder="EMP123" 
                            value={formData.empId}
                            onChange={handleChange} 
                            required 
                            /* Removed disabled attribute to keep CSS consistent */
                        />
                    </div>

                    <div className="input-group">
                        <label>Full Name</label>
                        <input 
                            type="text" 
                            name="name" 
                            placeholder="Enter full name" 
                            value={formData.name}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Email Address</label>
                        <input 
                            type="email" 
                            name="email" 
                            placeholder="admin@aditya.ac.in" 
                            value={formData.email}
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>Password</label>
                        <input 
                            type="password" 
                            name="password" 
                            placeholder="••••••••" 
                            // name="password"
                            onChange={handleChange} 
                            required 
                        />
                    </div>

                    <div className="input-group">
                        <label>System Admin Secret</label>
                        <input 
                            type="password" 
                            name="adminSecret" 
                            placeholder="Enter Secret Key" 
                            onChange={handleChange} 
                            required 
                        />
                    </div>
                    
                    {error && <div className="error-pill">{error}</div>}
                    
                    <button 
                        type="submit" 
                        className="admin-submit-btn" 
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating Account..." : "Create Admin Account"}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AdminRegister;