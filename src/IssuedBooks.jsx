






import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './IssuedBooks.css';
// 1. MUST IMPORT the RemoveBook component
import RemoveBook from './RemoveBook'; 
import Footer from './Footer';


const IssuedBooks = () => {
    // window.location.hostname checks the browser's address bar.
// If it says 'localhost', it uses your local URL. 
// Otherwise, it uses your live Render URL.
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:10000" 
  : "https://library-project-mgs4.onrender.com";
    const navigate = useNavigate();
    const [issuedList, setIssuedList] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    // 2. Define the fetch function so it can be reused by the Modal
    const fetchIssuedData = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/issued-books?search=${searchTerm}`);
            setIssuedList(res.data);
        } catch (err) {
            console.error("Failed to load issued books", err);
        }
    };

    useEffect(() => {
        fetchIssuedData();
    }, [searchTerm]);

    const formatDate = (dateString) => {
        if (!dateString) return "N/A";
        const date = new Date(dateString);
        return isNaN(date.getTime()) ? "Invalid Date" : date.toLocaleDateString('en-GB'); 
    };

    return (
        <div className="issued-dashboard">
            <nav className="glass-nav">
                <div className="logo-container" style={{cursor: 'pointer'}}>
                    <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Logo" className="nav-logo" />
                    <div className="logo-text">
                        <h2>Aditya</h2>
                        <span>Library Hub</span>
                    </div>
                </div>
                <div className="nav-links">
                    <span className="nav-link" onClick={() => navigate('/admin-dashboard')}>DashBoard</span>
                    <span className="nav-link" onClick={() => navigate('/adminallbooks')}>Catalog</span>
                    {/* <span className="nav-link" onClick={() => navigate('/add-book')}>Add Book</span> */}
                    <span className="nav-link active" onClick={() => navigate('/issued-books')}>Issued Books</span>
                    <span className="nav-link" onClick={() => setIsRemoveModalOpen(true)}>Remove Book</span>
                </div>
                <div className="nav-actions">
                    <div className="profile-section" onClick={() => navigate('/admin-profile')}>
                        <div className="profile-avatar">S</div> {/* Initial for Surya */}
                        <span className="profile-label">Profile</span>
                    </div>
                    <button className="logout-btn" onClick={() => navigate('/admin-login')}>Logout</button>
                </div>
            </nav>

            <div className="issued-content">
                <div className="issued-header">
                    <h2>Issued Books Inventory</h2>
                    <input 
                        type="text" 
                        placeholder="Search Student ID or Book ID..." 
                        className="issued-search"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                    />
                </div>

                <div className="issued-table-card">
                    <table className="issued-table">
                        <thead>
                            <tr>
                                <th>BOOK ID</th>
                                <th>STUDENT ID</th>
                                <th>ISSUE DATE</th>
                                <th>EXPECTED RETURN</th>
                                <th>STATUS</th>
                            </tr>
                        </thead>
                        <tbody>
                            {issuedList.length > 0 ? (
                                issuedList.map((log) => (
                                    <tr key={log._id}>
                                        <td className="issued-id-cell">#{log.bookId}</td>
                                        <td>{log.studentId}</td>
                                        <td>{formatDate(log.issuedDate)}</td>
                                        <td>{formatDate(log.returnDate)}</td>
                                        <td>
                                            <span className="issued-status-pill">Active</span>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan="5" style={{ textAlign: 'center', padding: '20px' }}>
                                        No issued books found matching your search.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* 3. Pass the correct refresh function name (fetchIssuedData) */}
            <RemoveBook 
                isOpen={isRemoveModalOpen} 
                onClose={() => setIsRemoveModalOpen(false)} 
                refreshCatalog={fetchIssuedData} 
            />
            {/* <Footer /> */}
            {/* === Copyright Row === */}
      <div className="footer-copyright">
        <p>Copyrights 2026 Library Hub. All Rights Reserved</p>
      </div>

        </div>
    );
};

export default IssuedBooks;