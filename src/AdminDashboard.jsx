


// import React, { useState, useEffect } from 'react';
// import { useNavigate } from 'react-router-dom';
// import axios from 'axios';
// import './AdminDashboard.css';
// import RemoveBook from './RemoveBook';
// import fotter from './Footer';
// import Footer from './Footer';


// const AdminDashboard = () => {
//     // window.location.hostname checks the browser's address bar.
// // If it says 'localhost', it uses your local URL. 
// // Otherwise, it uses your live Render URL.
// const API_URL = window.location.hostname === "localhost" 
//   ? "http://localhost:10000" 
//   : "https://library-project-mgs4.onrender.com";
//     const navigate = useNavigate();
//     const [stats, setStats] = useState({ totalBooks: 0, borrowedBooks: 0, availableBooks: 0 });
//     const [showModal, setShowModal] = useState(false);
//     const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    
//     // --- Issue State ---
//     const [issueData, setIssueData] = useState({ studentId: '', bookCount: 1, bookIds: [''] });

//     // --- Return State ---
//     const [showReturnModal, setShowReturnModal] = useState(false);
//     const [returnStudentId, setReturnStudentId] = useState('');
//     const [borrowedBooksList, setBorrowedBooksList] = useState([]);
//     const [selectedBooks, setSelectedBooks] = useState([]); 

//     const adminName = localStorage.getItem('adminName') || 'Admin';

//     const fetchStats = async () => {
//         try {
//             const res = await axios.get(`${API_URL}/api/admin/stats`);
//             setStats({
//                 totalBooks: res.data.totalBooks,
//                 borrowedBooks: res.data.borrowedBooks,
//                 availableBooks: res.data.availableBooks
//             });
//         } catch (err) {
//             console.error("Failed to fetch stats:", err);
//         }
//     };

//     useEffect(() => {
//         fetchStats();
//         const interval = setInterval(fetchStats, 30000);
//         return () => clearInterval(interval);
//     }, []);
   
//     const handleLogout = () => {
//         localStorage.clear();
//         navigate('/');
//     };

//     // --- Issue Logic ---
//     const handleBookCountChange = (count) => {
//         const num = parseInt(count) || 1;
//         const newBookIds = [...issueData.bookIds];
//         if (num > newBookIds.length) {
//             while (newBookIds.length < num) newBookIds.push('');
//         } else {
//             newBookIds.length = num;
//         }
//         setIssueData({ ...issueData, bookCount: num, bookIds: newBookIds });
//     };

//     const handleBookIdChange = (index, value) => {
//         const updatedBookIds = [...issueData.bookIds];
//         updatedBookIds[index] = value;
//         setIssueData({ ...issueData, bookIds: updatedBookIds });
//     };

//     const handleIssueSubmit = async (e) => {
//         e.preventDefault();
//         try {
//             const res = await axios.post(`${API_URL}/api/admin/issue-book`, {
//                 bookIds: issueData.bookIds,
//                 studentId: issueData.studentId
//             });
//             if (res.status === 200) {
//                 fetchStats();
//                 setShowModal(false);
//                 setIssueData({ studentId: '', bookCount: 1, bookIds: [''] });
//                 alert("Books Issued Successfully!");
//             }
//         } catch (err) {
//             alert(err.response?.data?.message || "Failed to issue books");
//         }
//     };


//     const fetchBorrowedBooks = async () => {
//     // Basic validation to ensure something is entered
//     if (!returnStudentId) {
//         return alert("Please enter a Student Roll Number first.");
//     }

//     try {
//         // Calling your new GET route
//         const res = await axios.get(`${API_URL}/api/admin/student-books/${returnStudentId}`);
        
//         // Update the list state with the array of books + fines
//         setBorrowedBooksList(res.data);
        
//         // Clear any previously selected checkboxes
//         setSelectedBooks([]); 
        
//     } catch (err) {
//         console.error("Fetch Error:", err);
//         // If the student has no books or doesn't exist, the backend sends 404
//         const message = err.response?.data?.message || "Error fetching records.";
//         alert(message);
        
//         // Clear the list so old data doesn't stay on screen
//         setBorrowedBooksList([]);
//     }
// };

//     const handleCheckboxChange = (bookId) => {
//         setSelectedBooks(prev => 
//             prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
//         );
//     };

//     const calculateTotalFine = () => {
//         return borrowedBooksList
//             .filter(book => selectedBooks.includes(book.bookId))
//             .reduce((total, book) => total + (book.fine || 0), 0);
//     };

//     const handleReturnSubmit = async () => {
//         if (selectedBooks.length === 0) return alert("Select at least one book to return");
        
//         try {
//             // Matches your backend: const { studentId, bookIds } = req.body;
//             const res = await axios.post(`${API_URL}/api/admin/return-books`, {
//                 studentId: returnStudentId,
//                 bookIds: selectedBooks
//             });

//             if (res.status === 200) {
//                 alert(`Books Returned Successfully! Total Fine: ₹${res.data.totalFine}`);
//                 fetchStats();
//                 setShowReturnModal(false);
//                 setReturnStudentId('');
//                 setBorrowedBooksList([]);
//                 setSelectedBooks([]);
//             }
//         } catch (err) {
//             alert(err.response?.data?.message || "Error processing return");
//         }
//     };

//     return (
//         <div className="dashboard-wrapper">
//             <nav className="glass-nav">
//                 <div className="logo-container">
//                     <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Logo" className="nav-logo" />
//                     <div className="logo-text">
//                         <h2>Aditya</h2>
//                         <span>Library Hub</span>
//                     </div>
//                 </div>
//                 <div className="nav-links">
//                     <span className="nav-link active" onClick={() => navigate('/admin-dashboard')}>DashBoard</span>
//                     <span className="nav-link" onClick={() => navigate('/adminallbooks')}>Catalog</span>
//                     <span className="nav-link" onClick={() => navigate('/issued-books')}>Issued Books</span>
//                     <span className="nav-link" onClick={() => setIsRemoveModalOpen(true)}>Remove Book</span>
//                 </div>
//                 <div className="nav-actions">
//                     <div className="profile-section" onClick={() => navigate('/admin-profile')}>
//                         <div className="profile-avatar">{adminName.charAt(0)}</div>
//                         <span className="profile-label">Profile</span>
//                     </div>
//                     <button className="logout-btn" onClick={handleLogout}>Logout</button>
//                 </div>
//             </nav>

//             <div className="dashboard-content">
//                 <div className="welcome-section">
//                     <h2>Welcome to Digital Library System</h2>
//                     <p className="admin-greeting">Hello, {adminName}!</p>
//                 </div>

//                 <div className="stats-container">
//                     <div className="stat-card total"><span>Total Books</span><div className="count">{stats.totalBooks}</div></div>
//                     <div className="stat-card borrowed"><span>Books Borrowed</span><div className="count">{stats.borrowedBooks}</div></div>
//                     <div className="stat-card available"><span>Available Books</span><div className="count">{stats.availableBooks}</div></div>
//                 </div>

//                 <div className="action-grid">
//                     <div className="action-card" onClick={() => setShowModal(true)}>
//                         <div className="action-icon">📖</div>
//                         <h3>Issue a Book</h3>
//                     </div>
//                     <div className="action-card" onClick={() => setShowReturnModal(true)}>
//                         <div className="action-icon">↩️</div>
//                         <h3>Accept Book Return</h3>
//                     </div>
//                 </div>
//             </div>

//             {/* --- ISSUE MODAL --- */}
//             {showModal && (
//                 <div className="modal-overlay">
//                     <div className="modal-card">
//                         <h3>Issue Books</h3>
//                         <form onSubmit={handleIssueSubmit}>
//                             <div className="modal-input-group">
//                                 <label>Student Roll Number</label>
//                                 <input type="text" required value={issueData.studentId} onChange={(e) => setIssueData({ ...issueData, studentId: e.target.value })} placeholder="e.g. 23A91A05XX" />
//                             </div>
//                             <div className="modal-input-group">
//                                 <label>How many books?</label>
//                                 <input type="number" min="1" max="5" value={issueData.bookCount} onChange={(e) => handleBookCountChange(e.target.value)} />
//                             </div>
//                             <div className="book-ids-scrollable" style={{ maxHeight: '180px', overflowY: 'auto' }}>
//                                 {issueData.bookIds.map((id, index) => (
//                                     <div className="modal-input-group" key={index}>
//                                         <label>Book ID {index + 1}</label>
//                                         <input type="text" required value={id} onChange={(e) => handleBookIdChange(index, e.target.value)} placeholder="Enter ID" />
//                                     </div>
//                                 ))}
//                             </div>
//                             <div className="modal-actions">
//                                 <button type="button" className="cancel-btn" onClick={() => setShowModal(false)}>Cancel</button>
//                                 <button type="submit" className="confirm-btn">Confirm Issue</button>
//                             </div>
//                         </form>
//                     </div>
//                 </div>
//             )}

//             {/* --- IMPROVED RETURN MODAL --- */}
//             {showReturnModal && (
//                 <div className="modal-overlay">
//                     <div className="modal-card return-modal" style={{ width: '450px' }}>
//                         <h3>Accept Book Return</h3>
//                         <div className="modal-input-group">
//                             <label>Student Roll Number</label>
//                             <div style={{ display: 'flex', gap: '10px' }}>
//                                 <input type="text" value={returnStudentId} onChange={(e) => setReturnStudentId(e.target.value)} placeholder="Enter Roll No." />
//                                 <button type="button" onClick={fetchBorrowedBooks} className="confirm-btn" style={{ width: 'auto' }}>Fetch</button>
//                             </div>
//                         </div>

//                         {borrowedBooksList.length > 0 && (
//                             <div className="borrowed-list-section" style={{ marginTop: '20px' }}>
//                                 <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}><b>Issued Books:</b></p>
//                                 <div className="scroll-box" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
//                                     {borrowedBooksList.map((book) => (
//                                         <div key={book.bookId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
//                                             <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
//                                                 <input type="checkbox" onChange={() => handleCheckboxChange(book.bookId)} checked={selectedBooks.includes(book.bookId)} />
//                                                 <span style={{ marginLeft: '10px' }}>{book.title} ({book.bookId})</span>
//                                             </label>
//                                             <span style={{ color: book.fine > 0 ? 'red' : 'green', fontSize: '0.85rem', fontWeight: 'bold' }}>₹{book.fine}</span>
//                                         </div>
//                                     ))}
//                                 </div>
//                                 <div style={{ textAlign: 'right', marginTop: '10px' }}>
//                                     <b>Total Fine: <span style={{ color: 'red' }}>₹{calculateTotalFine()}</span></b>
//                                 </div>
//                             </div>
//                         )}

//                         <div className="modal-actions">
//                             <button type="button" className="cancel-btn" onClick={() => { setShowReturnModal(false); setBorrowedBooksList([]); }}>Cancel</button>
//                             <button type="button" className="confirm-btn accept" onClick={handleReturnSubmit} >Accept Return</button>
//                         </div>
//                     </div>
//                 </div>
//             )}

//             <RemoveBook isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} refreshCatalog={fetchStats} />
//             {/* <div className="footer-copyright"><p>Copyrights 2026 Library Hub. All Rights Reserved</p></div> */}
//             <Footer />
//         </div>
//     );
// };

// export default AdminDashboard;



import React, { useState, useRef, useEffect } from 'react'; // Added useRef just in case, but using useState for loading
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminDashboard.css';
import RemoveBook from './RemoveBook';
import Footer from './Footer';

const AdminDashboard = () => {
    const API_URL = window.location.hostname === "localhost" 
      ? "http://localhost:10000" 
      : "https://library-project-mgs4.onrender.com";
      
    const navigate = useNavigate();
    const [stats, setStats] = useState({ totalBooks: 0, borrowedBooks: 0, availableBooks: 0 });
    const [showModal, setShowModal] = useState(false);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);
    
    // --- NEW LOADING STATES ---
    const [isIssuing, setIsIssuing] = useState(false);
    const [isReturning, setIsReturning] = useState(false);

    const [issueData, setIssueData] = useState({ studentId: '', bookCount: 1, bookIds: [''] });
    const [showReturnModal, setShowReturnModal] = useState(false);
    const [returnStudentId, setReturnStudentId] = useState('');
    const [borrowedBooksList, setBorrowedBooksList] = useState([]);
    const [selectedBooks, setSelectedBooks] = useState([]); 

    const adminName = localStorage.getItem('adminName') || 'Admin';

    const fetchStats = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/stats`);
            setStats({
                totalBooks: res.data.totalBooks,
                borrowedBooks: res.data.borrowedBooks,
                availableBooks: res.data.availableBooks
            });
        } catch (err) {
            console.error("Failed to fetch stats:", err);
        }
    };

    useEffect(() => {
        fetchStats();
        const interval = setInterval(fetchStats, 30000);
        return () => clearInterval(interval);
    }, []);
   
    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const handleBookCountChange = (count) => {
        const num = parseInt(count) || 1;
        const newBookIds = [...issueData.bookIds];
        if (num > newBookIds.length) {
            while (newBookIds.length < num) newBookIds.push('');
        } else {
            newBookIds.length = num;
        }
        setIssueData({ ...issueData, bookCount: num, bookIds: newBookIds });
    };

    const handleBookIdChange = (index, value) => {
        const updatedBookIds = [...issueData.bookIds];
        updatedBookIds[index] = value;
        setIssueData({ ...issueData, bookIds: updatedBookIds });
    };

    // --- UPDATED ISSUE LOGIC ---
    const handleIssueSubmit = async (e) => {
        e.preventDefault();
        if (isIssuing) return; // Prevent double trigger
        
        setIsIssuing(true); 
        try {
            const res = await axios.post(`${API_URL}/api/admin/issue-book`, {
                bookIds: issueData.bookIds,
                studentId: issueData.studentId
            });
            if (res.status === 200) {
                await fetchStats();
                setShowModal(false);
                setIssueData({ studentId: '', bookCount: 1, bookIds: [''] });
                alert("Books Issued Successfully!");
            }
        } catch (err) {
            alert(err.response?.data?.message || "Failed to issue books");
        } finally {
            setIsIssuing(false); // Re-enable
        }
    };

    const fetchBorrowedBooks = async () => {
        if (!returnStudentId) return alert("Please enter a Student Roll Number first.");
        try {
            const res = await axios.get(`${API_URL}/api/admin/student-books/${returnStudentId}`);
            setBorrowedBooksList(res.data);
            setSelectedBooks([]); 
        } catch (err) {
            alert(err.response?.data?.message || "Error fetching records.");
            setBorrowedBooksList([]);
        }
    };

    const handleCheckboxChange = (bookId) => {
        setSelectedBooks(prev => 
            prev.includes(bookId) ? prev.filter(id => id !== bookId) : [...prev, bookId]
        );
    };

    const calculateTotalFine = () => {
        return borrowedBooksList
            .filter(book => selectedBooks.includes(book.bookId))
            .reduce((total, book) => total + (book.fine || 0), 0);
    };

    // --- UPDATED RETURN LOGIC ---
    const handleReturnSubmit = async () => {
        if (selectedBooks.length === 0) return alert("Select at least one book to return");
        if (isReturning) return;

        setIsReturning(true);
        try {
            const res = await axios.post(`${API_URL}/api/admin/return-books`, {
                studentId: returnStudentId,
                bookIds: selectedBooks
            });

            if (res.status === 200) {
                alert(`Books Returned Successfully! Total Fine: ₹${res.data.totalFine}`);
                await fetchStats();
                setShowReturnModal(false);
                setReturnStudentId('');
                setBorrowedBooksList([]);
                setSelectedBooks([]);
            }
        } catch (err) {
            alert(err.response?.data?.message || "Error processing return");
        } finally {
            setIsReturning(false);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <nav className="glass-nav">
                <div className="logo-container">
                    <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Logo" className="nav-logo" />
                    <div className="logo-text">
                        <h2>Aditya</h2>
                        <span>Library Hub</span>
                    </div>
                </div>
                <div className="nav-links">
                    <span className="nav-link active" onClick={() => navigate('/admin-dashboard')}>DashBoard</span>
                    <span className="nav-link" onClick={() => navigate('/adminallbooks')}>Catalog</span>
                    <span className="nav-link" onClick={() => navigate('/issued-books')}>Issued Books</span>
                    <span className="nav-link" onClick={() => setIsRemoveModalOpen(true)}>Remove Book</span>
                </div>
                <div className="nav-actions">
                    <div className="profile-section" onClick={() => navigate('/admin-profile')}>
                        <div className="profile-avatar">{adminName.charAt(0)}</div>
                        <span className="profile-label">Profile</span>
                    </div>
                    <button className="logout-btn" onClick={handleLogout}>Logout</button>
                </div>
            </nav>

            <div className="dashboard-content">
                <div className="welcome-section">
                    <h2>Welcome to Digital Library System</h2>
                    <p className="admin-greeting">Hello, {adminName}!</p>
                </div>

                <div className="stats-container">
                    <div className="stat-card total"><span>Total Books</span><div className="count">{stats.totalBooks}</div></div>
                    <div className="stat-card borrowed"><span>Books Borrowed</span><div className="count">{stats.borrowedBooks}</div></div>
                    <div className="stat-card available"><span>Available Books</span><div className="count">{stats.availableBooks}</div></div>
                </div>

                <div className="action-grid">
                    <div className="action-card" onClick={() => setShowModal(true)}>
                        <div className="action-icon">📖</div>
                        <h3>Issue a Book</h3>
                    </div>
                    <div className="action-card" onClick={() => setShowReturnModal(true)}>
                        <div className="action-icon">↩️</div>
                        <h3>Accept Book Return</h3>
                    </div>
                </div>
            </div>

            {/* --- ISSUE MODAL --- */}
            {showModal && (
                <div className="modal-overlay">
                    <div className="modal-card">
                        <h3>Issue Books</h3>
                        <form onSubmit={handleIssueSubmit}>
                            <div className="modal-input-group">
                                <label>Student Roll Number</label>
                                <input type="text" required value={issueData.studentId} onChange={(e) => setIssueData({ ...issueData, studentId: e.target.value })} placeholder="e.g. 23A91A05XX" />
                            </div>
                            <div className="modal-input-group">
                                <label>How many books?</label>
                                <input type="number" min="1" max="5" value={issueData.bookCount} onChange={(e) => handleBookCountChange(e.target.value)} />
                            </div>
                            <div className="book-ids-scrollable" style={{ maxHeight: '180px', overflowY: 'auto' }}>
                                {issueData.bookIds.map((id, index) => (
                                    <div className="modal-input-group" key={index}>
                                        <label>Book ID {index + 1}</label>
                                        <input type="text" required value={id} onChange={(e) => handleBookIdChange(index, e.target.value)} placeholder="Enter ID" />
                                    </div>
                                ))}
                            </div>
                            <div className="modal-actions">
                                <button type="button" className="cancel-btn" onClick={() => setShowModal(false)} disabled={isIssuing}>Cancel</button>
                                {/* BUTTON DISABLED WHEN ISSUING */}
                                <button type="submit" className="confirm-btn" disabled={isIssuing}>
                                    {isIssuing ? "Processing..." : "Confirm Issue"}
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {/* --- IMPROVED RETURN MODAL --- */}
            {showReturnModal && (
                <div className="modal-overlay">
                    <div className="modal-card return-modal" style={{ width: '450px' }}>
                        <h3>Accept Book Return</h3>
                        <div className="modal-input-group">
                            <label>Student Roll Number</label>
                            <div style={{ display: 'flex', gap: '10px' }}>
                                <input type="text" value={returnStudentId} onChange={(e) => setReturnStudentId(e.target.value)} placeholder="Enter Roll No." />
                                <button type="button" onClick={fetchBorrowedBooks} className="confirm-btn" style={{ width: 'auto' }}>Fetch</button>
                            </div>
                        </div>

                        {borrowedBooksList.length > 0 && (
                            <div className="borrowed-list-section" style={{ marginTop: '20px' }}>
                                <p style={{ fontSize: '0.9rem', marginBottom: '10px' }}><b>Issued Books:</b></p>
                                <div className="scroll-box" style={{ maxHeight: '150px', overflowY: 'auto', border: '1px solid #eee', padding: '10px', borderRadius: '5px' }}>
                                    {borrowedBooksList.map((book) => (
                                        <div key={book.bookId} style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '8px' }}>
                                            <label style={{ display: 'flex', alignItems: 'center', cursor: 'pointer' }}>
                                                <input type="checkbox" onChange={() => handleCheckboxChange(book.bookId)} checked={selectedBooks.includes(book.bookId)} />
                                                <span style={{ marginLeft: '10px' }}>{book.title} ({book.bookId})</span>
                                            </label>
                                            <span style={{ color: book.fine > 0 ? 'red' : 'green', fontSize: '0.85rem', fontWeight: 'bold' }}>₹{book.fine}</span>
                                        </div>
                                    ))}
                                </div>
                                <div style={{ textAlign: 'right', marginTop: '10px' }}>
                                    <b>Total Fine: <span style={{ color: 'red' }}>₹{calculateTotalFine()}</span></b>
                                </div>
                            </div>
                        )}

                        <div className="modal-actions">
                            <button type="button" className="cancel-btn" onClick={() => { setShowReturnModal(false); setBorrowedBooksList([]); }} disabled={isReturning}>Cancel</button>
                            {/* BUTTON DISABLED WHEN RETURNING */}
                            <button type="button" className="confirm-btn accept" onClick={handleReturnSubmit} disabled={isReturning || selectedBooks.length === 0}>
                                {isReturning ? "Accepting..." : "Accept Return"}
                            </button>
                        </div>
                    </div>
                </div>
            )}

            <RemoveBook isOpen={isRemoveModalOpen} onClose={() => setIsRemoveModalOpen(false)} refreshCatalog={fetchStats} />
            <Footer />
        </div>
    );
};

export default AdminDashboard;