import React, { useState, useEffect } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
// Import brand icons for social media
import { faLinkedinIn, faYoutube, faFacebookF, faInstagram } from '@fortawesome/free-brands-svg-icons';
// Import solid icons for phone, email, and up-arrow
import { faPhone, faEnvelope, faAngleUp } from '@fortawesome/free-solid-svg-icons';
import './Footer.css'; // Don't forget to import your CSS

const Footer = () => {
  // State to control visibility of the "Back to Top" button
  const [showScroll, setShowScroll] = useState(false);

  // Check scroll position and update button visibility
  const checkScrollTop = () => {
    if (!showScroll && window.pageYOffset > 300) {
      setShowScroll(true);
    } else if (showScroll && window.pageYOffset <= 300) {
      setShowScroll(false);
    }
  };

  // Smoothly scroll the page to the top
  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  // Set up the scroll listener when the component mounts
  useEffect(() => {
    window.addEventListener('scroll', checkScrollTop);
    // Clean up listener when component unmounts
    return () => {
      window.removeEventListener('scroll', checkScrollTop);
    };
  }, [showScroll]);

  return (
    <footer className="main-footer">
      <div className="footer-content">
        {/* === Left Section: Logo === */}
        <div className="footer-section logo-section">
          {/* Replace this placeholder with your actual Aditya Library logo */}
          <div className="placeholder-logo-container">
            <span className="placeholder-logo-icon">ADITYA</span>
          </div>
          {/* <h2 className="library-title">ADITYA</h2> */}
          <span className="library-hub-text">Library Hub</span>
        </div>

        {/* === Middle Section: Contact Info === */}
        <div className="footer-section contact-section">
          <h4 className="section-header">Contact</h4>
          <div className="contact-item">
            <FontAwesomeIcon icon={faPhone} className="contact-icon phone-icon" />
            <span className="contact-text">+91 97 05 29 03 03</span>
          </div>
          <div className="contact-item">
            <FontAwesomeIcon icon={faEnvelope} className="contact-icon email-icon" />
            <span className="contact-text email-link">
              {/* You might want to update this to a generic library email */}
              support@libraryhub.io
            </span>
          </div>
        </div>

        {/* === Right Section: Social Media === */}
        <div className="footer-section social-section">
          <h4 className="section-header">Our Social Media</h4>
          <div className="social-icons-wrapper">
            <a href="https://linkedin.com" target="_blank" rel="noopener noreferrer" className="social-icon-link linkedin">
              <FontAwesomeIcon icon={faLinkedinIn} />
            </a>
            <a href="https://youtube.com" target="_blank" rel="noopener noreferrer" className="social-icon-link youtube">
              <FontAwesomeIcon icon={faYoutube} />
            </a>
            <a href="https://facebook.com" target="_blank" rel="noopener noreferrer" className="social-icon-link facebook">
              <FontAwesomeIcon icon={faFacebookF} />
            </a>
            <a href="https://instagram.com" target="_blank" rel="noopener noreferrer" className="social-icon-link instagram">
              <FontAwesomeIcon icon={faInstagram} />
            </a>
          </div>
        </div>
      </div>

      {/* === Copyright Row === */}
      <div className="footer-copyright">
        <p>Copyrights 2026 Library Hub. All Rights Reserved</p>
      </div>

      {/* === Back to Top Button === */}
      <button 
        className={`scroll-to-top ${showScroll ? 'show-btn' : ''}`}
        onClick={scrollToTop}
        aria-label="Scroll to Top"
      >
        <FontAwesomeIcon icon={faAngleUp} className="up-arrow-icon" />
      </button>
    </footer>
  );
};

export default Footer;