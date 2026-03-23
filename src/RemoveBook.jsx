import React, { useState } from 'react';
import axios from 'axios';
import './RemoveBook.css';

const RemoveBook = ({ isOpen, onClose, refreshCatalog }) => {
    // window.location.hostname checks the browser's address bar.
// If it says 'localhost', it uses your local URL. 
// Otherwise, it uses your live Render URL.
const API_URL = window.location.hostname === "localhost" 
  ? "http://localhost:10000" 
  : "https://library-project-mgs4.onrender.com";
    const [bookId, setBookId] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState({ text: '', type: '' });

    if (!isOpen) return null;

    const handleRemove = async (e) => {
        e.preventDefault();
        if (!bookId) return;

        setLoading(true);
        setMessage({ text: '', type: '' });

        try {
            const res = await axios.delete(`${API_URL}/api/admin/remove-book/${bookId}`);
            setMessage({ text: res.data.message, type: 'success' });
            setBookId('');
            if (refreshCatalog) refreshCatalog(); // Refresh list if function passed
            
            // Auto-close after success
            setTimeout(() => {
                onClose();
                setMessage({ text: '', type: '' });
            }, 2000);

        } catch (err) {
            const errMsg = err.response?.data?.message || "Failed to remove book.";
            setMessage({ text: errMsg, type: 'error' });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="remove-modal-backdrop">
            <div className="remove-dialog-box">
                <div className="remove-header">
                    <h3>Remove Book from Catalog</h3>
                    <button className="close-x" onClick={onClose}>&times;</button>
                </div>
                
                <form onSubmit={handleRemove} className="remove-body">
                    <p className="remove-warning">
                        Warning: This action is permanent. Enter the Book ID to confirm deletion.
                    </p>
                    
                    <div className="remove-input-group">
                        <label>Book ID</label>
                        <input 
                            type="number" 
                            placeholder="e.g. 820" 
                            value={bookId}
                            onChange={(e) => setBookId(e.target.value)}
                            required
                        />
                    </div>

                    {message.text && (
                        <div className={`remove-alert ${message.type}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="remove-actions">
                        <button type="button" className="btn-cancel" onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn-confirm-delete" disabled={loading}>
                            {loading ? "Removing..." : "Confirm Removal"}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default RemoveBook;