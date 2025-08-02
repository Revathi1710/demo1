import React, { Component } from 'react';
import Navbar from '../components/navbar';

export default class SignUp extends Component {
  constructor(props) {
    super(props);
    this.state = {
      fname: "",
      email: "",
      number: "",
      password: "",
      cpassword: "",
      verifyButton: false,
      verifyOtp: false,
      Otp: "",
      emailOtp: "",
      otpSent: false,
      emailOtpVerified: false,
      formSubmitted: false,
      isLoading: false,
      otpLoading: false,
      errors: {},
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.handleSendOtp = this.handleSendOtp.bind(this);
    this.handleVerifyOtp = this.handleVerifyOtp.bind(this);
    this.finalSubmit = this.finalSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
  }

  validateForm() {
    const { fname, email, number, password, cpassword } = this.state;
    const errors = {};

    // First name validation
    if (!fname.trim()) {
      errors.fname = 'First name is required';
    } else if (fname.length < 2) {
      errors.fname = 'First name must be at least 2 characters';
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Phone number validation
    if (!number) {
      errors.number = 'Phone number is required';
    } else if (number.length < 10) {
      errors.number = 'Phone number must be at least 10 digits';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 8) {
      errors.password = 'Password must be at least 8 characters';
    } else if (!/(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/.test(password)) {
      errors.password = 'Password must contain uppercase, lowercase, and number';
    }

    // Confirm password validation
    if (!cpassword) {
      errors.cpassword = 'Please confirm your password';
    } else if (password !== cpassword) {
      errors.cpassword = 'Passwords do not match';
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  handleSendOtp() {
    const { email } = this.state;
    this.setState({ isLoading: true });

    fetch(`${process.env.REACT_APP_API_URL}/send-otp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ email })
    })
    .then(res => {
      this.setState({ isLoading: false });
      if (res.status === 200) {
        this.setState({ otpSent: true });
        this.showNotification('OTP sent successfully to your email!', 'success');
      } else {
        this.showNotification('Error sending OTP. Please try again.', 'error');
      }
    })
    .catch(err => {
      console.error('Error:', err);
      this.setState({ isLoading: false });
      this.showNotification('Network error. Please try again.', 'error');
    });
  }

  handleVerifyOtp() {
    const { email, emailOtp } = this.state;
    
    if (!emailOtp.trim()) {
      this.showNotification('Please enter the OTP', 'error');
      return;
    }

    this.setState({ otpLoading: true });

    fetch(`${process.env.REACT_APP_API_URL}/verify-otp`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ email, otp: emailOtp })
    })
    .then(res => {
        this.setState({ otpLoading: false });
        if (res.status === 200) {
            this.setState({ emailOtpVerified: true });
            this.showNotification('Email verified successfully!', 'success');
            this.finalSubmit();
        } else {
            this.showNotification('Invalid OTP. Please try again.', 'error');
        }
    })
    .catch(err => {
      console.error('Error:', err);
      this.setState({ otpLoading: false });
      this.showNotification('Verification failed. Please try again.', 'error');
    });
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.validateForm()) {
      return;
    }

    this.setState({ formSubmitted: true }, this.handleSendOtp);
  }

  finalSubmit() {
    const { fname, email, number, password, cpassword } = this.state;

    fetch(`${process.env.REACT_APP_API_URL}/register`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify({ fname, email, number, password, cpassword })
    })
    .then((res) => res.json())
    .then((data) => {
      console.log(data, "userRegister");
      if (data.status === 'ok') {
        this.showNotification('Registration successful! Welcome aboard!', 'success');
        // Redirect to login or dashboard
        setTimeout(() => {
          window.location.href = '/login';
        }, 2000);
      } else {
        this.showNotification(data.message || 'Registration failed. Please try again.', 'error');
        this.setState({ formSubmitted: false, emailOtpVerified: false, otpSent: false });
      }
    })
    .catch((error) => {
      console.error("Error:", error);
      this.showNotification('Registration failed. Please try again.', 'error');
      this.setState({ formSubmitted: false, emailOtpVerified: false, otpSent: false });
    });
  }

  showNotification(message, type) {
    // You can implement a toast notification here
    // For now, using alert but you should replace with a proper notification system
    alert(message);
  }

  render() {
    const { formSubmitted, otpSent, emailOtpVerified, isLoading, otpLoading, errors } = this.state;

    return (
      <div className="signup-page">
        <Navbar />
        
        <div className="signup-container">
          <div className="signup-card">
            <div className="signup-header">
              <h1>Create Your Account</h1>
              <p>Join thousands of businesses already using our platform</p>
            </div>

            {!formSubmitted ? (
              <form onSubmit={this.handleSubmit} className="signup-form">
                <div className="form-grid">
                  <div className="form-group">
                    <label htmlFor="fname" className="form-label">
                      Full Name <span className="required">*</span>
                    </label>
                    <input
                      id="fname"
                      type="text"
                      className={`form-input ${errors.fname ? 'error' : ''}`}
                      placeholder="Enter your full name"
                      value={this.state.fname}
                      onChange={(e) => this.setState({ fname: e.target.value })}
                    />
                    {errors.fname && <span className="error-message">{errors.fname}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="email" className="form-label">
                      Business Email <span className="required">*</span>
                    </label>
                    <input
                      id="email"
                      type="email"
                      className={`form-input ${errors.email ? 'error' : ''}`}
                      placeholder="name@company.com"
                      value={this.state.email}
                      onChange={(e) => this.setState({ email: e.target.value })}
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="number" className="form-label">
                      Phone Number <span className="required">*</span>
                    </label>
                    <input
                      id="number"
                      type="tel"
                      className={`form-input ${errors.number ? 'error' : ''}`}
                      placeholder="Enter your phone number"
                      value={this.state.number}
                      onChange={(e) => this.setState({ number: e.target.value })}
                    />
                    {errors.number && <span className="error-message">{errors.number}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="password" className="form-label">
                      Password <span className="required">*</span>
                    </label>
                    <input
                      id="password"
                      type="password"
                      className={`form-input ${errors.password ? 'error' : ''}`}
                      placeholder="Create a strong password"
                      value={this.state.password}
                      onChange={(e) => this.setState({ password: e.target.value })}
                    />
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="form-group">
                    <label htmlFor="cpassword" className="form-label">
                      Confirm Password <span className="required">*</span>
                    </label>
                    <input
                      id="cpassword"
                      type="password"
                      className={`form-input ${errors.cpassword ? 'error' : ''}`}
                      placeholder="Confirm your password"
                      value={this.state.cpassword}
                      onChange={(e) => this.setState({ cpassword: e.target.value })}
                    />
                    {errors.cpassword && <span className="error-message">{errors.cpassword}</span>}
                  </div>
                </div>

                <button 
                  type="submit" 
                  className="submit-btn"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="spinner"></span>
                      Creating Account...
                    </>
                  ) : (
                    'Create Account'
                  )}
                </button>

                <div className="signup-footer">
                  <p>
                    Already have an account? 
                    <a href="/login" className="login-link"> Sign in here</a>
                  </p>
                </div>
              </form>
            ) : (
              <div className="otp-verification">
                <div className="otp-header">
                  <div className="otp-icon">
                    <i className="fa fa-envelope-o"></i>
                  </div>
                  <h2>Verify Your Email</h2>
                  <p>We've sent a verification code to <strong>{this.state.email}</strong></p>
                </div>

                <form onSubmit={(e) => { e.preventDefault(); this.handleVerifyOtp(); }}>
                  <div className="form-group">
                    <label htmlFor="emailOtp" className="form-label">
                      Enter Verification Code
                    </label>
                    <input
                      id="emailOtp"
                      type="text"
                      className="form-input otp-input"
                      placeholder="Enter 6-digit code"
                      maxLength="6"
                      value={this.state.emailOtp}
                      onChange={(e) => this.setState({ emailOtp: e.target.value })}
                    />
                  </div>

                  <button 
                    type="submit" 
                    className="submit-btn"
                    disabled={otpLoading}
                  >
                    {otpLoading ? (
                      <>
                        <span className="spinner"></span>
                        Verifying...
                      </>
                    ) : (
                      'Verify Email'
                    )}
                  </button>

                  <div className="otp-footer">
                    <p>
                      Didn't receive the code? 
                      <button 
                        type="button" 
                        className="resend-btn"
                        onClick={this.handleSendOtp}
                        disabled={isLoading}
                      >
                        Resend Code
                      </button>
                    </p>
                  </div>
                </form>
              </div>
            )}
          </div>
        </div>

        <style jsx>{`
          .signup-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            padding: 20px 0;
          }

          .signup-container {
            max-width: 600px;
            margin: 40px auto;
            padding: 0 20px;
          }

          .signup-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            padding: 40px;
            position: relative;
            overflow: hidden;
          }

          .signup-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
          }

          .signup-header {
            text-align: center;
            margin-bottom: 40px;
          }

          .signup-header h1 {
            color: #2d3748;
            font-size: 32px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }

          .signup-header p {
            color: #718096;
            font-size: 16px;
            margin: 0;
          }

          .form-grid {
            display: grid;
            gap: 24px;
            margin-bottom: 32px;
          }

          .form-group {
            position: relative;
          }

          .form-label {
            display: block;
            color: #2d3748;
            font-size: 14px;
            font-weight: 600;
            margin-bottom: 8px;
          }

          .required {
            color: #e53e3e;
          }

          .form-input {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #ffffff;
            box-sizing: border-box;
          }

          .form-input:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .form-input.error {
            border-color: #e53e3e;
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
          }

          .error-message {
            display: block;
            color: #e53e3e;
            font-size: 12px;
            margin-top: 4px;
            font-weight: 500;
          }

          .submit-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            color: white;
            border: none;
            padding: 16px 24px;
            border-radius: 8px;
            font-size: 16px;
            font-weight: 600;
            cursor: pointer;
            transition: all 0.3s ease;
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            margin-bottom: 24px;
          }

          .submit-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }

          .submit-btn:disabled {
            opacity: 0.7;
            cursor: not-allowed;
            transform: none;
          }

          .spinner {
            width: 20px;
            height: 20px;
            border: 2px solid #ffffff30;
            border-top: 2px solid #ffffff;
            border-radius: 50%;
            animation: spin 1s linear infinite;
          }

          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }

          .signup-footer {
            text-align: center;
            padding-top: 20px;
            border-top: 1px solid #e2e8f0;
          }

          .signup-footer p {
            color: #718096;
            margin: 0;
            font-size: 14px;
          }

          .login-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            margin-left: 4px;
          }

          .login-link:hover {
            text-decoration: underline;
          }

          .otp-verification {
            text-align: center;
          }

          .otp-header {
            margin-bottom: 32px;
          }

          .otp-icon {
            width: 80px;
            height: 80px;
            background: linear-gradient(135deg, #667eea, #764ba2);
            border-radius: 50%;
            display: flex;
            align-items: center;
            justify-content: center;
            margin: 0 auto 24px;
          }

          .otp-icon i {
            font-size: 32px;
            color: white;
          }

          .otp-header h2 {
            color: #2d3748;
            font-size: 24px;
            font-weight: 700;
            margin-bottom: 8px;
          }

          .otp-header p {
            color: #718096;
            font-size: 16px;
            margin: 0;
          }

          .otp-input {
            text-align: center;
            font-size: 24px;
            letter-spacing: 8px;
            font-weight: 600;
          }

          .otp-footer {
            margin-top: 24px;
          }

          .otp-footer p {
            color: #718096;
            font-size: 14px;
            margin: 0;
          }

          .resend-btn {
            background: none;
            border: none;
            color: #667eea;
            font-weight: 600;
            cursor: pointer;
            text-decoration: underline;
            margin-left: 4px;
          }

          .resend-btn:hover {
            color: #5a67d8;
          }

          .resend-btn:disabled {
            opacity: 0.5;
            cursor: not-allowed;
          }

          @media (max-width: 768px) {
            .signup-container {
              margin: 20px auto;
              padding: 0 16px;
            }

            .signup-card {
              padding: 24px;
            }

            .signup-header h1 {
              font-size: 24px;
            }

            .form-grid {
              gap: 20px;
            }
          }
        `}</style>
      </div>
    );
  }
}