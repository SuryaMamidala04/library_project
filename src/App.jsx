


import React, { useState } from 'react';
import { Routes, Route, useNavigate, Navigate } from 'react-router-dom';
import Catalog from './Allbooks.jsx'; 
import Login from './Login';
import Register from './Register'; 
import VerifyOtp from './Verify'; 
import './App.css';
import AdminRegister from './AdminRegister.jsx';
import AdminLogin from './AdminLogin.jsx';
import AdminDashboard from './AdminDashboard.jsx';
import AdminAllBooks from './AdminAllBooks.jsx';
import IssuedBooks from './IssuedBooks.jsx';
import AdminProfile from './AdminProfile.jsx';
import StudentProfile from './studentProfile.jsx';
import Footer from './Footer.jsx';

function App() {
  const [searchTerm, setSearchTerm] = useState("");
  const [userEmail, setUserEmail] = useState(""); // Bridge for OTP verification
  const [isSearching, setIsSearching] = useState(false);
  
  const [userRole, setUserRole] = useState(localStorage.getItem("userRole") || null);

  const navigate = useNavigate();

  const loginUser = (role, path) => {
    setUserRole(role);
    localStorage.setItem("userRole", role);
    navigate(path);
  };

  const featuredBooks = [
    { id: 101, title: "Java: The Complete Reference", author: "Herbert Schildt", category: "Programming", image: "https://images.unsplash.com/photo-1517694712202-14dd9538aa97?w=400" },
    { id: 102, title: "Database System Concepts", author: "Silberschatz & Korth", category: "Database", image: "https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=400" },
    { id: 103, title: "Operating System Concepts", author: "Galvin", category: "Systems", image: "https://images.unsplash.com/photo-1629654297299-c8506221ca97?w=400" },
    { id: 104, title: "Introduction to Algorithms", author: "Cormen", category: "Theory", image: "https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=400" },
    { id: 105, title: "Computer Networking", author: "James Kurose", category: "Networking", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400" },
    { id: 106, title: "Discrete Mathematics", author: "Kenneth Rosen", category: "Math", image: "https://images.unsplash.com/photo-1635070041078-e363dbe005cb?w=400" },
    { id: 107, title: "Digital Logic Design", author: "Morris Mano", category: "Hardware", image: "https://images.unsplash.com/photo-1518770660439-4636190af475?w=400" },
    { id: 108, title: "Software Engineering", author: "Roger Pressman", category: "Engineering", image: "https://images.unsplash.com/photo-1519389950473-47ba0277781c?w=400" },
    { id: 109, title: "Artificial Intelligence", author: "Stuart Russell", category: "AI/ML", image: "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400" },
    { id: 111, title: "The Pragmatic Programmer", author: "Andrew Hunt", category: "Career", image: "https://images.unsplash.com/photo-1515879218367-8466d910aaa4?w=400" },
    { id: 112, title: "Machine Learning", author: "Tom Mitchell", category: "AI/ML", image: "https://images.unsplash.com/photo-1527474305487-b87b222841cc?w=400" },
    { id: 113, title: "Compilers: Principles", author: "Alfred Aho", category: "Systems", image: "https://images.unsplash.com/photo-1587620962725-abab7fe55159?w=400" },
    { id: 114, title: "Computer Architecture", author: "Hennessy & Patterson", category: "Hardware", image: "https://images.unsplash.com/photo-1591799264318-7e6ef8ddb7ea?w=400" },
    { id: 115, title: "Design Patterns", author: "Gang of Four", category: "Architecture", image: "https://images.unsplash.com/photo-1504639725590-34d0984388bd?w=400" },
    { id: 116, title: "Cloud Computing", author: "Ray J. Rafael", category: "Cloud", image: "https://images.unsplash.com/photo-1544197150-b99a580bb7a8?w=400" }
  ];

  const handleSearchChange = (e) => {
    const value = e.target.value;
    setSearchTerm(value);
    setIsSearching(value.length > 0);
  };

  const filteredBooks = featuredBooks.filter(book => 
    book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.author.toLowerCase().includes(searchTerm.toLowerCase()) ||
    book.category.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <Routes>
      <Route path="/" element={
        <div className="library-landing">
          <nav className="glass-nav">
            <div className="logo-container" onClick={() => {setSearchTerm(""); setIsSearching(false); navigate("/");}}>
              <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Aditya Logo" className="nav-logo" />
              <div className="logo-text">
                <h2>Aditya</h2>
                <span>Library Hub</span>
              </div>
            </div>

            <div className="nav-search-wrapper">
              <span className="search-icon">🔍</span>
              <input 
                type="text" 
                placeholder="Search across 100+ technical books..." 
                className="main-search"
                value={searchTerm}
                onChange={handleSearchChange}
              />
              {isSearching && <button className="clear-search" onClick={() => {setSearchTerm(""); setIsSearching(false);}}>✕</button>}
            </div>

            <div className="nav-actions">
              <button className="student-login-btn" onClick={() => navigate("/login")}>Student</button>
              <button className="admin-pill" onClick={() => navigate("/admin-login")}>Admin</button>
            </div>
          </nav>

          {!isSearching && (
            <header className="hero-section animate-fade-in">
              <div className="hero-overlay">
                <div className="hero-content">
                  <span className="welcome-tag">Welcome to the Future of Learning</span>
                  <h1>Empowering Minds Through <span>Digital Access</span></h1>
                  <p>Browse our exhaustive collection of physical assets. Check real-time shelf status before you visit.</p>
                  <div className="hero-btns">
                    <button className="cta-primary" onClick={() => navigate("/login")}>View Catalog</button>
                    <button className="cta-outline">Virtual Tour</button>
                  </div>
                </div>
              </div>
            </header>
          )}

          <main className={`main-content ${isSearching ? 'search-active' : ''}`}>
            <div className="section-title">
              <h2>{isSearching ? `Search Results for "${searchTerm}"` : 'Featured Engineering Collection'}</h2>
              <div className="underline"></div>
            </div>
            
            <div className="book-visual-grid">
              {filteredBooks.length > 0 ? (
                filteredBooks.map(book => (
                  <div key={book.id} className="modern-book-card">
                    <div className="book-image-container">
                      <img src={book.image} alt={book.title} />
                      <div className="category-overlay">{book.category}</div>
                    </div>
                    <div className="book-card-body">
                      <h4>{book.title}</h4>
                      <p className="author-text">By {book.author}</p>
                      <button className="details-link" onClick={() => navigate("/login")}>View Location →</button>
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-results-container">
                  <div className="no-results-content">
                    <span className="no-results-icon">📂</span>
                    <h3>Oops! Book Not Found</h3>
                    <p>We couldn't find any featured books matching your search. Please login to our full catalog of 5000+ books to find what you need.</p>
                    <div className="no-results-btns">
                      <button className="cta-primary" onClick={() => navigate("/login")}>Login Now</button>
                      <button className="cta-outline-dark" onClick={() => navigate("/register")}>Create Account</button>
                    </div>
                  </div>
                </div>
              )}
            </div>

             {!isSearching && (
               <div className="center-footer">
                 <button className="load-more-btn" onClick={() => navigate("/login")}>
                   Access Full Catalog
                 </button>
               </div>
             )}

          </main>
          <Footer />
        </div>
      } />

      {/* --- AUTH ROUTES --- */}
      <Route path="/login" element={<Login onBack={() => navigate("/")} onLoginSuccess={() => loginUser('student', '/all-books')} onRegisterClick={() => navigate("/register")} />} />
      
      {/* UPDATE: Ensure onVerify correctly sets the email state */}
      <Route path="/register" element={<Register onGoToLogin={() => navigate("/login")} onVerify={(email) => { setUserEmail(email); navigate("/verify"); }} />} />
      
      {/* UPDATE: Pass the saved email to VerifyOtp component */}
      <Route path="/verify" element={<VerifyOtp email={userEmail} onVerified={() => navigate("/login")} />} />
      
      <Route path="/admin-login" element={<AdminLogin onLoginSuccess={() => loginUser('admin', '/admin-dashboard')} />} />
      <Route path="/admin-register" element={<AdminRegister />} />

      {/* --- PROTECTED STUDENT ROUTES --- */}
      <Route path="/all-books" element={userRole === 'student' ? <Catalog onBack={() => navigate("/")} /> : <Navigate to="/login" />} />
      <Route path="/student-profile" element={userRole === 'student' ? <StudentProfile /> : <Navigate to="/login" />} />

      {/* --- PROTECTED ADMIN ROUTES --- */}
      <Route path="/admin-dashboard" element={userRole === 'admin' ? <AdminDashboard /> : <Navigate to="/admin-login" />} />
      <Route path="/adminallbooks" element={userRole === 'admin' ? <AdminAllBooks /> : <Navigate to="/admin-login" />} />
      <Route path="/issued-books" element={userRole === 'admin' ? <IssuedBooks /> : <Navigate to="/admin-login" />} />
      <Route path="/admin-profile" element={userRole === 'admin' ? <AdminProfile /> : <Navigate to="/admin-login" />} />
      
    </Routes>
  );
  
}

export default App;