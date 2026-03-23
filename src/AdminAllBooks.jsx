


import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminAllBooks.css';
import RemoveBook from './RemoveBook';
import Footer from './Footer';


const AdminAllBooks = () => {
   
    // window.location.hostname checks the browser's address bar.
// If it says 'localhost', it uses your local URL. 
// Otherwise, it uses your live Render URL.
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:10000" 
  : "https://library-project-mgs4.onrender.com";

    const navigate = useNavigate();
    const [books, setBooks] = useState([]);
    const [searchTerm, setSearchTerm] = useState('');
    const [sortBy, setSortBy] = useState('');
    const [isAddModalOpen, setIsAddModalOpen] = useState(false);
    const [step, setStep] = useState(1); // Step 1: Quantity, Step 2: Details
    const [quantity, setQuantity] = useState(1);
    const [newBooksData, setNewBooksData] = useState([]);
    const [isRemoveModalOpen, setIsRemoveModalOpen] = useState(false);

    // Modal State
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editData, setEditData] = useState({ id: '', title: '', author: '', category: '', rackLocation: '' });

    const fetchBooks = async () => {
        try {
            const res = await axios.get(`${API_URL}/api/admin/adminallbooks?search=${searchTerm}&sort=${sortBy}`);
            setBooks(res.data);
        } catch (err) {
            console.error("Failed to fetch books", err);
        }
    };

    useEffect(() => {
        fetchBooks();
    }, [searchTerm, sortBy]);




    // Function to initialize empty book forms based on quantity
    const startAddProcess = () => {
        const initialData = Array.from({ length: quantity }, () => ({
            bookId: '', title: '', author: '', category: '', rackLocation: '', status: 'In Library'
        }));
        setNewBooksData(initialData);
        setStep(2);
    };

    const handleAddSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post(`${API_URL}/api/admin/add-multiple-books`, { books: newBooksData });
            setIsAddModalOpen(false);
            setStep(1);
            fetchBooks();
            alert("Books added successfully!");
        } catch (err) {
            alert(err.response?.data?.message || "Failed to add books");
        }
    };




    const openEditModal = (book) => {
        setEditData({ ...book, id: book._id }); // Using MongoDB _id for the update request
        setIsModalOpen(true);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await axios.put(`${API_URL}/api/admin/edit-book/${editData.id}`, editData);
            setIsModalOpen(false);
            fetchBooks(); // Refresh list
            alert("Book updated successfully!");
        } catch (err) {
            console.error("Update failed", err);
        }
    };

    return (
        <div className="dashboard-wrapper">
            <nav className="glass-nav">
                <div className="logo-container"  style={{ cursor: 'pointer' }}>
                    <img src="https://images.shiksha.com/mediadata/images/1727338203phpptrxCf.jpeg" alt="Logo" className="nav-logo" />
                    <div className="logo-text">
                        <h2>Aditya</h2>
                        <span>Library Hub</span>
                    </div>
                </div>
                <div className="nav-links">
                    <span className="nav-link" onClick={() => navigate('/admin-dashboard')}>DashBoard</span>
                    <span className="nav-link active" onClick={() => navigate('/adminallbooks')}>Catalog</span>
                    {/* <span className="nav-link" onClick={() => navigate('/add-book')}>Add Book</span> */}
                    <span className="nav-link" onClick={() => navigate('/issued-books')}>Issued Books</span>
                    <span className="nav-link" onClick={() => setIsRemoveModalOpen(true)}>Remove Book</span>

                    {/* <span className="nav-link" onClick={() => navigate('/remove-book')}>Remove Book</span> */}
                </div>
                <div className="nav-actions">
                     <div className="profile-section" onClick={() => navigate('/admin-profile')}>
                        <div className="profile-avatar">S</div> {/* Initial for Surya */}
                        <span className="profile-label">Profile</span>
                    </div>
                    <button className="logout-btn" onClick={() => navigate('/')}>Logout</button>
                </div>
            </nav>

            <div className="books-content">





                <div className="wel-section">
                    <h2>Book Catalog</h2>
                    <div className="catalog-actions">
                        <button
                            className="add-main-btn"
                            onClick={() => { setIsAddModalOpen(true); setStep(1); }}
                        >
                            + Add New Book
                        </button>
                        <input
                            type="text"
                            placeholder="Search title, author or ID..."
                            className="catalog-search"
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                        />
                        <select className="catalog-sort" onChange={(e) => setSortBy(e.target.value)}>
                            <option value="">Sort By</option>
                            <option value="title">Title (A-Z)</option>
                            <option value="category">Category</option>
                            <option value="newest">Recently Added</option>
                        </select>
                    </div>
                </div>
            

                <div className="catalog-table-container">
                    <table className="catalog-table">
                        <thead>
                            <tr>
                                <th>BOOK ID</th>
                                <th>TITLE & AUTHOR</th>
                                <th>CATEGORY</th>
                                <th>RACK</th>
                                <th>STATUS</th>
                                <th>ACTION</th>
                            </tr>
                        </thead>
                        <tbody>
                            {books.map((book) => (
                                <tr key={book.bookId}>
                                    <td className="id-cell">#{book.bookId}</td>
                                    <td className="title-cell">
                                        <div className="book-title">{book.title}</div>
                                        <div className="book-author">by {book.author}</div>
                                    </td>
                                    <td><span className="badge category">{book.category}</span></td>
                                    <td><span className="badge rack">{book.rackLocation || 'N/A'}</span></td>
                                    <td>
                                        <span className={`status-pill ${book.status === 'In Library' ? 'available' : 'issued'}`}>
                                            {book.status === 'In Library' ? 'IN LIBRARY' : 'ISSUED'}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="edit-btn" onClick={() => openEditModal(book)}>Edit</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Edit Modal Dialog */}
            {isModalOpen && (
                <div className="modal-overlay">
                    <div className="modal-content">
                        <h3>Edit Book Details</h3>
                        <form onSubmit={handleUpdate}>
                            <div className="input-group">
                                <label>Book Title</label>
                                <input
                                    type="text"
                                    value={editData.title}
                                    onChange={(e) => setEditData({ ...editData, title: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Author</label>
                                <input
                                    type="text"
                                    value={editData.author}
                                    onChange={(e) => setEditData({ ...editData, author: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Category</label>
                                <input
                                    type="text"
                                    value={editData.category}
                                    onChange={(e) => setEditData({ ...editData, category: e.target.value })}
                                    required
                                />
                            </div>

                            <div className="input-group">
                                <label>Rack Location</label>
                                <input
                                    type="text"
                                    value={editData.rackLocation}
                                    onChange={(e) => setEditData({ ...editData, rackLocation: e.target.value })}
                                />
                            </div>

                            <div className="modal-buttons">
                                <button type="button" className="cancel-btn" onClick={() => setIsModalOpen(false)}>Cancel</button>
                                <button type="submit" className="save-btn">Save Changes</button>
                            </div>
                        </form>
                    </div>
                </div>
            )}

            {
                isAddModalOpen && (
                    <div className="bulk-backdrop">
                        <div className="bulk-modal-container compact-mode">
                            <h3 className="bulk-title">
                                {step === 1 ? "Adding Book(s)" : `Enter Book ${quantity} Details`}
                            </h3>

                            {step === 1 ? (
                                <div className="bulk-step-one">
                                    <div className="bulk-inline-row">
                                        <label className="bulk-label-inline">Quantity to Add:</label>
                                        <input
                                            className="bulk-input-field qty-small"
                                            type="number"
                                            min="1" max="20"
                                            value={quantity}
                                            onChange={(e) => setQuantity(e.target.value)}
                                        />
                                    </div>
                                    <div className="bulk-action-row-compact">
                                        <button className="bulk-btn-secondary-sm" onClick={() => setIsAddModalOpen(false)}>Dismiss</button>
                                        <button className="bulk-btn-primary-sm" onClick={startAddProcess}>Continue</button>
                                    </div>
                                </div>
                            ) : (
                                <form onSubmit={handleAddSubmit} className="bulk-scroll-area-compact">
                                    {newBooksData.map((book, index) => (
                                        <div key={index} className="bulk-entry-card-mini">
                                            <div className="bulk-card-header">
                                                <span className="bulk-badge-mini">Book #{index + 1}</span>
                                            </div>
                                            <div className="bulk-grid-compact">
                                                <div className="bulk-field-group-sm">
                                                    <label className="bulk-label-sm">Book ID</label>
                                                    <input className="bulk-input-sm" type="text" required value={book.bookId}
                                                        onChange={(e) => {
                                                            const updated = [...newBooksData];
                                                            updated[index].bookId = e.target.value;
                                                            setNewBooksData(updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="bulk-field-group-sm">
                                                    <label className="bulk-label-sm">Title</label>
                                                    <input className="bulk-input-sm" type="text" required value={book.title}
                                                        onChange={(e) => {
                                                            const updated = [...newBooksData];
                                                            updated[index].title = e.target.value;
                                                            setNewBooksData(updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="bulk-field-group-sm">
                                                    <label className="bulk-label-sm">Author</label>
                                                    <input className="bulk-input-sm" type="text" required value={book.author}
                                                        onChange={(e) => {
                                                            const updated = [...newBooksData];
                                                            updated[index].author = e.target.value;
                                                            setNewBooksData(updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="bulk-field-group-sm">
                                                    <label className="bulk-label-sm">Category</label>
                                                    <input className="bulk-input-sm" type="text" required value={book.category}
                                                        onChange={(e) => {
                                                            const updated = [...newBooksData];
                                                            updated[index].category = e.target.value;
                                                            setNewBooksData(updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="bulk-field-group-sm">
                                                    <label className="bulk-label-sm">Rack</label>
                                                    <input className="bulk-input-sm" type="text" value={book.rackLocation}
                                                        onChange={(e) => {
                                                            const updated = [...newBooksData];
                                                            updated[index].rackLocation = e.target.value;
                                                            setNewBooksData(updated);
                                                        }}
                                                    />
                                                </div>
                                                <div className="bulk-field-group-sm">
                                                    <label className="bulk-label-sm">Status</label>
                                                    <input className="bulk-input-sm status-lock-sm" type="text" value="In Library" readOnly />
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                    <div className="bulk-footer-compact">
                                        <button type="button" className="bulk-btn-secondary-sm" onClick={() => setStep(1)}>Back</button>
                                        <button type="submit" className="bulk-btn-primary-sm">Confirm & Add All</button>
                                    </div>
                                </form>
                            )}
                        </div>
                    </div>
                )
            }

            <RemoveBook
                isOpen={isRemoveModalOpen}
                onClose={() => setIsRemoveModalOpen(false)}
                refreshCatalog={fetchBooks}
            />

            <Footer />
        </div>
    );
};

export default AdminAllBooks;







