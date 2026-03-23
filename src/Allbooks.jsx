
import React, { useEffect, useState } from 'react';
import './Allbooks.css';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Footer from './Footer';

const Catalog = () => {
    // window.location.hostname checks the browser's address bar.
// If it says 'localhost', it uses your local URL. 
// Otherwise, it uses your live Render URL.
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:10000" 
  : "https://library-project-mgs4.onrender.com";
    const [books, setBooks] = useState([]);
    const [myBooks, setMyBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [viewMode, setViewMode] = useState('all');
    const [userName, setUserName] = useState('Student'); 
    const navigate = useNavigate();

    useEffect(() => {
        // Fetch username from localStorage
        const storedName = localStorage.getItem('studentName');
        if (storedName) {
            setUserName(storedName);
        }
        handleShowCatalog();
    }, []);

    const handleShowCatalog = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/books`);
            setBooks(res.data);
            setViewMode('all');
        } catch (err) {
            console.error("Catalog fetch failed", err);
        }
    };

    const handleShowMyBooks = async () => {
        const mongoId = localStorage.getItem('studentId');
        if (!mongoId) {
            alert("Session expired. Please login again.");
            return;
        }
        try {
            const res = await axios.get(`${API_URL}/api/borrowed/${mongoId}`);
            setMyBooks(res.data);
            setViewMode('mine');
        } catch (err) {
            console.error("Borrowed fetch failed", err);
        }
    };

    const calculateStatusAndFine = (returnDate) => {
        if (!returnDate) return { status: 'Unknown', fine: 0, class: '' };
        const today = new Date();
        const rDate = new Date(returnDate);
        today.setHours(0, 0, 0, 0);
        rDate.setHours(0, 0, 0, 0);
        
        if (today <= rDate) {
            return { status: 'Active', fine: 0, class: 'status-green' };
        } else {
            const diffTime = today - rDate;
            const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));
            return { status: `Overdue`, fine: diffDays * 10, class: 'status-red' };
        }
    };

    const handleLogout = () => {
        localStorage.clear();
        navigate('/');
    };

    const displayedBooks = (viewMode === 'all' ? books : myBooks).filter(book => {
        const term = searchTerm.toLowerCase();
        return (
            book.title?.toLowerCase().includes(term) ||
            book.author?.toLowerCase().includes(term) ||
            book.category?.toLowerCase().includes(term) ||
            book.bookId?.toString().includes(term)
        );
    });

    return (
        <div className="catalog-wrapper">
            <nav className="glass-nav">
                <div className="nav-left">
                    <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Logo" className="nav-logo" />
                    <div className="logo-text">
                        <h2>Aditya</h2>
                        <span>Library Hub</span>
                    </div>
                </div>

                <div className="nav-center">
                    <div className="search-container">
                        <span className="search-icon">🔍</span>
                        <input 
                            type="text" 
                            placeholder="Search your library..." 
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            className="search-bar"
                        />
                    </div>
                </div>

                <div className="nav-right">
                    <div className="toggle-buttons">
                        <button onClick={handleShowCatalog} className={viewMode === 'all' ? 'nav-btn active' : 'nav-btn'}>Catalog</button>
                        <button onClick={handleShowMyBooks} className={viewMode === 'mine' ? 'nav-btn active' : 'nav-btn'}>My Books</button>
                    </div>
                    <div className="profile-section" onClick={() => navigate('/student-profile')}>
                        <div className="profile-avatar">{userName.charAt(0).toUpperCase()}</div>
                        <span className="profile-label">Profile</span>
                    </div> 
                    <button onClick={handleLogout} className="logout-circle-btn">Logout</button>
                </div>
            </nav>

            <main className="catalog-container">
                {/* Updated Header Section for Single Line Layout */}
                <div className="catalog-header-flex">
                    <div className="header-left">
                        <h2>{viewMode === 'all' ? 'Full Technical Catalog' : 'My Borrowed Books'}</h2>
                        <p>Track your physical copies and returns.</p>
                    </div>
                    <div className="header-right">
                        <h1>Hello, <span className="highlight-name">{userName}</span>! 👋</h1>
                    </div>
                </div>
                
                <div className="table-responsive">
                    <table className="books-table">
                        <thead>
                            {viewMode === 'all' ? (
                                <tr>
                                    <th>ID</th>
                                    <th>TITLE & AUTHOR</th>
                                    <th>CATEGORY</th>
                                    <th>EDITION</th>
                                    <th>LOCATION</th>
                                    <th>STATUS</th>
                                </tr>
                            ) : (
                                <tr>
                                    <th>BOOK ID</th>
                                    <th>ISSUED DATE</th>
                                    <th>RETURN BY</th>
                                    <th>STATUS</th>
                                    <th>FINE (₹)</th>
                                </tr>
                            )}
                        </thead>
                        <tbody>
                            {displayedBooks.length > 0 ? (
                                displayedBooks.map((book) => {
                                    const { status, fine, class: statusClass } = viewMode === 'mine' 
                                        ? calculateStatusAndFine(book.returnDate) 
                                        : { status: book.status, fine: 0, class: book.status === 'Issued' ? 'status-red' : 'status-green' };

                                    return (
                                        <tr key={book._id}>
                                            <td className="book-id">#{book.bookId}</td>
                                            {viewMode === 'all' ? (
                                                <>
                                                    <td>
                                                        <div className="book-info">
                                                            <span className="book-title">{book.title}</span>
                                                            <span className="book-author">by {book.author}</span>
                                                        </div>
                                                    </td>
                                                    <td><span className="badge category">{book.category}</span></td>
                                                    <td>{book.edition || 'N/A'}</td>
                                                    <td><code>{book.rackLocation || 'A-1'}</code></td>
                                                    <td><span className={`status-pill ${statusClass}`}>{status}</span></td>
                                                </>
                                            ) : (
                                                <>
                                                    <td>{book.issuedDate ? new Date(book.issuedDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td>{book.returnDate ? new Date(book.returnDate).toLocaleDateString() : 'N/A'}</td>
                                                    <td><span className={`status-pill ${statusClass}`}>{status}</span></td>
                                                    <td className="fine-value">₹{fine}</td>
                                                </>
                                            )}
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={viewMode === 'all' ? "6" : "5"} className="no-results">
                                        No records found.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </main>

            <footer className="privacy-notice">
                <div className="notice-content">
                    <h3>Library Care & Privacy Notice</h3>
                    <p>Handle physical copies with care. No marking or folding pages.</p>
                    <div className="warning-box">
                        <strong>⚠️ PENALTY:</strong> Lost/Damaged books incur <strong>Full Cost + ₹500 penalty</strong>.
                    </div>
                </div>
            </footer>
            <Footer />
        </div>
    );
};

export default Catalog;