import React, { useState, useEffect } from "react";
import axios from 'axios';
import { Link } from 'react-router-dom';
import Navbar from "../components/navbar";
import './VendorProfile.css';
import EnquiryModal from './Enquiry';

const VendorProfile = () => {
  const [vendorData, setVendorData] = useState(null);
  const [error, setError] = useState(null);
  const [products, setProducts] = useState([]);
  const [selectedProduct, setSelectedProduct] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [userData, setUserData] = useState(null);
  const [activeTab, setActiveTab] = useState('products');

  useEffect(() => {
    const slug = window.location.pathname.split("/")[1];
    const vendortoken = window.localStorage.getItem("vendortoken");

    if (vendortoken) {
      fetch(`${process.env.REACT_APP_API_URL}/vendorData`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json",
        },
        body: JSON.stringify({ vendortoken }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.status === "ok") {
            setUserData(data.data);
          } else {
            setError(data.message);
          }
        })
        .catch((error) => {
          console.error("Error:", error);
          setError(error.message);
        });
    }

    const fetchVendorData = async () => {
      try {
        const response = await axios.get(`${process.env.REACT_APP_API_URL}/getBusinessSlug/${slug}`);
        if (response.data.status === 'ok') {
          setVendorData(response.data.data);
        } else {
          setError(response.data.message);
        }
      } catch (error) {
        console.error('Error fetching vendor data:', error);
        setError(error.message);
      }
    };

    fetchVendorData();
  }, []);

  useEffect(() => {
    const fetchProducts = async () => {
      if (vendorData) {
        try {
          const response = await axios.post(`${process.env.REACT_APP_API_URL}/getVendorThreeProduct`, { vendorId: vendorData._id });
          if (response.data.status === 'ok') {
            setProducts(response.data.data);
          } else {
            console.error('Error fetching products:', response.data.message);
          }
        } catch (error) {
          console.error('Error fetching products:', error);
        }
      }
    };

    fetchProducts();
  }, [vendorData]);

  if (error) return (
    <div className="error-container">
      <div className="error-message">
        <i className="fas fa-exclamation-triangle"></i>
        <h3>Something went wrong</h3>
        <p>{error}</p>
      </div>
    </div>
  );

  if (!vendorData) return (
    <div className="loading-container">
      <div className="loading-spinner">
        <div className="spinner"></div>
        <p>Loading vendor profile...</p>
      </div>
    </div>
  );

  const handleEnquiryClick = (product) => {
    setSelectedProduct(product);
    setShowModal(true);
  };

  const handleModalClose = () => {
    setShowModal(false);
    setSelectedProduct(null);
  };

  return (
    <div className="vendor-profile-wrapper">
      <Navbar />
      
      {/* Hero Section */}
      <div className="vendor-hero-section">
        <div className="container">
          <div className="vendor-header-card">
            <div className="row align-items-center">
              <div className="col-md-2">
                <div className="vendor-logo-container">
                  {vendorData.logo ? (
                    <img 
                      src={vendorData.logo} 
                      alt={vendorData.businessName}
                      className="vendor-logo"
                    />
                  ) : (
                    <div className="vendor-logo-placeholder">
                      <i className="fas fa-building"></i>
                    </div>
                  )}
                </div>
              </div>
              <div className="col-md-7">
                <div className="vendor-info">
                  <h1 className="vendor-business-name">{vendorData.businessName}</h1>
                  <div className="vendor-rating">
                    <div className="rating-stars">
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="fas fa-star"></i>
                      <i className="far fa-star"></i>
                      <span className="rating-text">4.0</span>
                    </div>
                  </div>
                  <p className="vendor-location">
                    <i className="fas fa-map-marker-alt"></i>
                    {vendorData.address}, {vendorData.City}, {vendorData.State}
                  </p>
                  <div className="vendor-badges">
                    <span className="badge badge-verified">
                      <i className="fas fa-check-circle"></i> Verified Supplier
                    </span>
                    <span className="badge badge-gst">GST Verified</span>
                  </div>
                </div>
              </div>
              <div className="col-md-3">
                <div className="vendor-contact-actions">
                  <Link to={`tel:${vendorData.number}`} className="btn btn-call">
                    <i className="fas fa-phone"></i> Call Now
                  </Link>
                  <button className="btn btn-whatsapp">
                    <i className="fab fa-whatsapp"></i> WhatsApp
                  </button>
                  <button className="btn btn-email">
                    <i className="fas fa-envelope"></i> Send Email
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Navigation Tabs */}
      <div className="vendor-nav-section">
        <div className="container">
          <ul className="vendor-nav-tabs">
            <li className={`nav-tab ${activeTab === 'products' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('products')}>
                <i className="fas fa-box"></i>
                Products & Services
              </button>
            </li>
            <li className={`nav-tab ${activeTab === 'seller' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('seller')}>
                <i className="fas fa-info-circle"></i>
                Company Profile
              </button>
            </li>
            <li className={`nav-tab ${activeTab === 'reviews' ? 'active' : ''}`}>
              <button onClick={() => setActiveTab('reviews')}>
                <i className="fas fa-star"></i>
                Reviews & Ratings
              </button>
            </li>
          </ul>
        </div>
      </div>

      {/* Main Content */}
      <div className="vendor-main-content">
        <div className="container">
          <div className="row">
            <div className="col-lg-9">
              {/* Products Tab */}
              {activeTab === 'products' && (
                <div className="products-section">
                  <div className="section-header">
                    <h2><i className="fas fa-box"></i> Our Products & Services</h2>
                    <p>Explore our comprehensive range of quality products</p>
                  </div>
                  
                  {products.length > 0 ? (
                    <div className="products-grid">
                      {products.map((product) => (
                        <div key={product._id} className="product-card">
                          <div className="product-image-container">
                            <img 
                              src={product.image ? `${process.env.REACT_APP_API_URL}/${product.image[0].replace('\\', '/')}` : '/api/placeholder/300/200'} 
                              className="product-image" 
                              alt={product.name}
                              onError={(e) => {
                                e.target.src = '/api/placeholder/300/200';
                              }}
                            />
                            <div className="product-overlay">
                              <button 
                                className="btn-view-details"
                                onClick={() => handleEnquiryClick(product)}
                              >
                                View Details
                              </button>
                            </div>
                          </div>
                          <div className="product-info">
                            <h3 className="product-name">{product.name}</h3>
                            <p className="product-price">Price on Request</p>
                            <div className="product-actions">
                              <button 
                                className="btn btn-enquiry"
                                onClick={() => handleEnquiryClick(product)}
                              >
                                <i className="fas fa-paper-plane"></i>
                                Send Enquiry
                              </button>
                              <button className="btn btn-whatsapp-product">
                                <i className="fab fa-whatsapp"></i>
                              </button>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="no-products">
                      <div className="no-products-icon">
                        <i className="fas fa-box-open"></i>
                      </div>
                      <h3>No Products Available</h3>
                      <p>This vendor hasn't added any products yet.</p>
                    </div>
                  )}
                </div>
              )}

              {/* Company Profile Tab */}
              {activeTab === 'seller' && (
                <div className="company-profile-section">
                  <div className="section-header">
                    <h2><i className="fas fa-building"></i> Company Profile</h2>
                  </div>
                  
                  <div className="profile-content">
                    <div className="about-section">
                      <h3>About Our Company</h3>
                      <p className="company-description">
                        {vendorData.companyDescription || 'We are a leading supplier committed to providing quality products and excellent service to our customers worldwide.'}
                      </p>
                    </div>

                    <div className="company-details-grid">
                      <div className="detail-card">
                        <h4><i className="fas fa-info-circle"></i> Basic Information</h4>
                        <ul className="detail-list">
                          <li><strong>Business Name:</strong> {vendorData.businessName}</li>
                          <li><strong>Business Type:</strong> Manufacturer & Supplier</li>
                          <li><strong>Year Established:</strong> 2020</li>
                          <li><strong>Legal Status:</strong> Private Limited Company</li>
                        </ul>
                      </div>

                      <div className="detail-card">
                        <h4><i className="fas fa-map-marker-alt"></i> Contact Details</h4>
                        <ul className="detail-list">
                          <li><strong>Phone:</strong> {vendorData.number}</li>
                          <li><strong>Email:</strong> {vendorData.email}</li>
                          <li><strong>Address:</strong> {vendorData.address}</li>
                          <li><strong>City:</strong> {vendorData.City}, {vendorData.State}</li>
                        </ul>
                      </div>

                      <div className="detail-card">
                        <h4><i className="fas fa-award"></i> Certifications</h4>
                        <div className="certifications">
                          <span className="cert-badge">ISO 9001:2015</span>
                          <span className="cert-badge">CE Certified</span>
                          <span className="cert-badge">GST Registered</span>
                        </div>
                      </div>

                      <div className="detail-card">
                        <h4><i className="fas fa-chart-line"></i> Business Stats</h4>
                        <ul className="detail-list">
                          <li><strong>Annual Turnover:</strong> ₹ 1-5 Crore</li>
                          <li><strong>Employee Count:</strong> 11-50 People</li>
                          <li><strong>Market Presence:</strong> Pan India</li>
                          <li><strong>Export Markets:</strong> Asia, Europe</li>
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {/* Reviews Tab */}
              {activeTab === 'reviews' && (
                <div className="reviews-section">
                  <div className="section-header">
                    <h2><i className="fas fa-star"></i> Customer Reviews & Ratings</h2>
                  </div>
                  
                  <div className="reviews-summary">
                    <div className="rating-overview">
                      <div className="overall-rating">
                        <span className="rating-number">4.0</span>
                        <div className="rating-stars">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="far fa-star"></i>
                        </div>
                        <p>Based on 25 reviews</p>
                      </div>
                    </div>
                  </div>

                  <div className="reviews-list">
                    <div className="review-item">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <h4>Rajesh Kumar</h4>
                          <p>Verified Buyer</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="stars">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                        </div>
                      </div>
                      <p className="review-text">
                        Excellent quality products and timely delivery. Very satisfied with the service.
                      </p>
                      <span className="review-date">2 weeks ago</span>
                    </div>

                    <div className="review-item">
                      <div className="reviewer-info">
                        <div className="reviewer-avatar">
                          <i className="fas fa-user"></i>
                        </div>
                        <div>
                          <h4>Priya Sharma</h4>
                          <p>Verified Buyer</p>
                        </div>
                      </div>
                      <div className="review-rating">
                        <div className="stars">
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="fas fa-star"></i>
                          <i className="far fa-star"></i>
                        </div>
                      </div>
                      <p className="review-text">
                        Good products but could improve packaging. Overall experience was positive.
                      </p>
                      <span className="review-date">1 month ago</span>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Sidebar */}
            <div className="col-lg-3">
              <div className="vendor-sidebar">
                {/* Quick Contact Card */}
                <div className="sidebar-card contact-card">
                  <h3><i className="fas fa-phone"></i> Quick Contact</h3>
                  <div className="contact-item">
                    <i className="fas fa-user"></i>
                    <div>
                      <p><strong>Contact Person</strong></p>
                      <p>Sales Manager</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-phone"></i>
                    <div>
                      <p><strong>Mobile Number</strong></p>
                      <p>{vendorData.number}</p>
                    </div>
                  </div>
                  <div className="contact-item">
                    <i className="fas fa-envelope"></i>
                    <div>
                      <p><strong>Email</strong></p>
                      <p>{vendorData.email}</p>
                    </div>
                  </div>
                </div>

                {/* Trust Indicators */}
                <div className="sidebar-card trust-card">
                  <h3><i className="fas fa-shield-alt"></i> Trust Indicators</h3>
                  <ul className="trust-list">
                    <li><i className="fas fa-check text-success"></i> GST Verified</li>
                    <li><i className="fas fa-check text-success"></i> Phone Verified</li>
                    <li><i className="fas fa-check text-success"></i> Email Verified</li>
                    <li><i className="fas fa-check text-success"></i> Address Verified</li>
                  </ul>
                </div>

                {/* Business Hours */}
                <div className="sidebar-card hours-card">
                  <h3><i className="fas fa-clock"></i> Business Hours</h3>
                  <div className="hours-list">
                    <div className="hour-item">
                      <span>Monday - Friday</span>
                      <span>9:00 AM - 6:00 PM</span>
                    </div>
                    <div className="hour-item">
                      <span>Saturday</span>
                      <span>9:00 AM - 1:00 PM</span>
                    </div>
                    <div className="hour-item">
                      <span>Sunday</span>
                      <span>Closed</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Footer Section */}
      <div className="vendor-footer">
        <div className="container">
          <div className="footer-content">
            <div className="row">
              <div className="col-md-6">
                <h4>Get in Touch</h4>
                <p>Ready to start a conversation? Contact us today for all your business needs.</p>
              </div>
              <div className="col-md-6 text-end">
                <div className="social-links">
                  <a href="#" className="social-link"><i className="fab fa-facebook"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-twitter"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-linkedin"></i></a>
                  <a href="#" className="social-link"><i className="fab fa-instagram"></i></a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      <EnquiryModal
        show={showModal}
        handleClose={handleModalClose}
        product={selectedProduct}
        userData={userData}
        vendorData={vendorData}
      />
    </div>
  );
};

export default VendorProfile;