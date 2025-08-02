import React, { useState } from 'react';
import { Modal, Button, Form, Alert, Card } from 'react-bootstrap';
import axios from 'axios';
import './EnquiryModal.css';

const EnquiryModal = ({ show, handleClose, product, userData }) => {
  const [quantity, setQuantity] = useState(1);
  const [message, setMessage] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [customMessage, setCustomMessage] = useState('');

  const handleQuantityChange = (e) => {
    setQuantity(e.target.value);
  };

  const handleCustomMessageChange = (e) => {
    setCustomMessage(e.target.value);
  };

  const handleEnquirySubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    if (!userData) {
      window.localStorage.setItem('redirectAfterLogin', window.location.pathname);
      window.location.href = '/login';
      return;
    }

    const enquiryData = {
      productname: product.name,
      product_id: product._id,
      productPrice: product.sellingPrice,
      vendorId: product.vendorDetails._id,
      UserId: userData._id,
      Username: userData.fname,
      UserNumber: userData.number,
      quantity: quantity,
      message: customMessage,
    };

    try {
      const response = await axios.post(`${process.env.REACT_APP_API_URL}/sendEnquiry`, enquiryData, {
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = response.data;

      if (data.status === 'ok') {
        setMessage('Enquiry sent successfully! The seller will contact you soon.');
        setTimeout(() => {
          handleClose();
          setMessage('');
          setCustomMessage('');
          setQuantity(1);
        }, 2000);
      } else {
        setMessage(data.message);
      }
    } catch (error) {
      console.error("Error:", error);
      setMessage('An error occurred: ' + error.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!product) return null;

  return (
    <Modal 
      show={show} 
      onHide={handleClose} 
      size="lg" 
      centered
      className="enquiry-modal"
    >
      <Modal.Header closeButton className="enquiry-modal-header">
        <Modal.Title className="enquiry-modal-title">
          <i className="fas fa-envelope me-2"></i>
          Send Enquiry
        </Modal.Title>
      </Modal.Header>
      
      <Modal.Body className="enquiry-modal-body p-0">
        <div className="enquiry-content">
          {/* Product Information Section */}
          <div className="product-info-section">
            <Card className="product-card border-0 shadow-sm">
              <Card.Body className="p-3">
                <div className="row align-items-center">
                  <div className="col-md-3">
                    <div className="product-image-container">
                      <img 
                        src={`${process.env.REACT_APP_API_URL}/${product.image[0].replace('\\', '/')}`} 
                        className="product-image" 
                        alt={product.name}
                      />
                    </div>
                  </div>
                  <div className="col-md-9">
                    <h5 className="product-title mb-2">{product.name}</h5>
                    <div className="price-container mb-2">
                      <span className="price">₹{product.sellingPrice}</span>
                      <span className="price-unit">/ Piece</span>
                    </div>
                    <div className="seller-info">
                      <i className="fas fa-store me-2 text-primary"></i>
                      <strong>{product.vendorDetails.businessName}</strong>
                      <div className="seller-location">
                        <i className="fas fa-map-marker-alt me-1"></i>
                        {product.vendorDetails.City}, {product.vendorDetails.State}
                      </div>
                    </div>
                  </div>
                </div>
              </Card.Body>
            </Card>
          </div>

          {/* Enquiry Form Section */}
          <div className="enquiry-form-section p-4">
            <Form onSubmit={handleEnquirySubmit}>
              <div className="row">
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <i className="fas fa-shopping-cart me-2"></i>
                      Quantity Required
                    </Form.Label>
                    <div className="quantity-input-container">
                      <Form.Control 
                        type="number" 
                        value={quantity} 
                        onChange={handleQuantityChange} 
                        min="1"
                        className="quantity-input"
                        placeholder="Enter quantity"
                      />
                      <span className="quantity-unit">Pieces</span>
                    </div>
                  </Form.Group>
                </div>
                
                <div className="col-md-6">
                  <Form.Group className="mb-3">
                    <Form.Label className="form-label-custom">
                      <i className="fas fa-calendar-alt me-2"></i>
                      Required By
                    </Form.Label>
                    <Form.Control 
                      type="date" 
                      className="date-input"
                      min={new Date().toISOString().split('T')[0]}
                    />
                  </Form.Group>
                </div>
              </div>

              <Form.Group className="mb-3">
                <Form.Label className="form-label-custom">
                  <i className="fas fa-comment-alt me-2"></i>
                  Additional Requirements (Optional)
                </Form.Label>
                <Form.Control 
                  as="textarea" 
                  rows={3}
                  value={customMessage}
                  onChange={handleCustomMessageChange}
                  placeholder="Describe your specific requirements, quantity, delivery location, etc."
                  className="message-textarea"
                />
              </Form.Group>

              {/* Contact Information Display */}
              <div className="contact-info-section">
                <h6 className="section-title">
                  <i className="fas fa-user me-2"></i>
                  Your Contact Information
                </h6>
                <div className="contact-info-card">
                  {userData ? (
                    <div className="contact-details">
                      <div className="contact-item">
                        <i className="fas fa-user-circle me-2"></i>
                        <span>{userData.fname}</span>
                      </div>
                      <div className="contact-item">
                        <i className="fas fa-phone me-2"></i>
                        <span>{userData.number}</span>
                      </div>
                    </div>
                  ) : (
                    <div className="login-prompt">
                      <i className="fas fa-exclamation-triangle me-2"></i>
                      Please log in to continue with your enquiry
                    </div>
                  )}
                </div>
              </div>

              {message && (
                <Alert variant={message.includes('successfully') ? 'success' : 'danger'} className="mt-3">
                  <i className={`fas ${message.includes('successfully') ? 'fa-check-circle' : 'fa-exclamation-circle'} me-2`}></i>
                  {message}
                </Alert>
              )}

              <div className="form-actions mt-4">
                <Button 
                  variant="outline-secondary" 
                  onClick={handleClose}
                  className="cancel-btn me-3"
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  className="submit-enquiry-btn"
                  disabled={isSubmitting || !userData}
                >
                  {isSubmitting ? (
                    <>
                      <span className="spinner-border spinner-border-sm me-2" role="status"></span>
                      Sending...
                    </>
                  ) : (
                    <>
                      <i className="fas fa-paper-plane me-2"></i>
                      Send Enquiry
                    </>
                  )}
                </Button>
              </div>
            </Form>
          </div>
        </div>
      </Modal.Body>
    </Modal>
  );
};

export default EnquiryModal;