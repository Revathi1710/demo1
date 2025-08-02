import React, { Component } from 'react';
import Navbar from '../components/navbar';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default class Login extends Component {
  constructor(props) {
    super(props);
    this.state = {
      email: '',
      password: '',
      isLoading: false,
      rememberMe: false,
      errors: {},
      showPassword: false,
    };

    this.handleSubmit = this.handleSubmit.bind(this);
    this.validateForm = this.validateForm.bind(this);
    this.togglePasswordVisibility = this.togglePasswordVisibility.bind(this);
  }

  validateForm() {
    const { email, password } = this.state;
    const errors = {};

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) {
      errors.email = 'Email is required';
    } else if (!emailRegex.test(email)) {
      errors.email = 'Please enter a valid email address';
    }

    // Password validation
    if (!password) {
      errors.password = 'Password is required';
    } else if (password.length < 6) {
      errors.password = 'Password must be at least 6 characters';
    }

    this.setState({ errors });
    return Object.keys(errors).length === 0;
  }

  togglePasswordVisibility() {
    this.setState(prevState => ({
      showPassword: !prevState.showPassword
    }));
  }

  handleSubmit(event) {
    event.preventDefault();

    if (!this.validateForm()) {
      toast.error("Please fill in all required fields correctly");
      return;
    }

    const { email, password, rememberMe } = this.state;
    this.setState({ isLoading: true });

    console.log(email, password);
    fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
      }),
    })
    .then((res) => {
      if (!res.ok) {
        throw new Error('Invalid credentials');
      }
      return res.json();
    })
    .then((data) => {
      this.setState({ isLoading: false });
      console.log(data, "userLogin");
      if (data.status === "ok") {
        toast.success("Welcome back! Login successful", {
          position: "top-center",
          autoClose: 2000,
        });
        window.localStorage.setItem("token", data.data.token);
        window.localStorage.setItem("userId", data.data.userId);
        window.localStorage.setItem("loggedIn", true);
        
        if (rememberMe) {
          window.localStorage.setItem("rememberUser", email);
        }
        
        setTimeout(() => {
          window.location.href = "./userDetails";
        }, 1500);
      } else {
        toast.error(data.message || "Login failed. Please try again.");
      }
    })
    .catch((error) => {
      this.setState({ isLoading: false });
      console.error("There was an error!", error);
      toast.error("Invalid email or password. Please try again.");
    });
  }

  componentDidMount() {
    // Check if user email is remembered
    const rememberedEmail = window.localStorage.getItem("rememberUser");
    if (rememberedEmail) {
      this.setState({ email: rememberedEmail, rememberMe: true });
    }
  }

  render() {
    const { email, password, isLoading, rememberMe, errors, showPassword } = this.state;

    return (
      <div className="login-wrapper">
        <Navbar/>
        <ToastContainer position="top-center" autoClose={3000} />
        
        <div className='toppage'>
          <div className='container'>
            <form onSubmit={this.handleSubmit} className="professional-form">
              <div className="form-header">
                <h3>Welcome Back</h3>
                <p>Sign in to your account</p>
              </div>
              
              <div className='formbox'>
                <div className="form-container loginregForm">
                  <div className="mb-3">
                    <div className="labelcontainer mb-3">
                      <label>Email address <span className="required">*</span></label>
                    </div>
                    <input
                      type="email"
                      className={`form-control ${errors.email ? 'error' : ''}`}
                      placeholder="Enter your email address"
                      value={email}
                      onChange={(e) => this.setState({ email: e.target.value })}
                      autoComplete="email"
                    />
                    {errors.email && <span className="error-message">{errors.email}</span>}
                  </div>

                  <div className="mb-3">
                    <div className="labelcontainer mb-3">
                      <label>Password <span className="required">*</span></label>
                    </div>
                    <div className="password-field">
                      <input
                        type={showPassword ? "text" : "password"}
                        className={`form-control ${errors.password ? 'error' : ''}`}
                        placeholder="Enter your password"
                        value={password}
                        onChange={(e) => this.setState({ password: e.target.value })}
                        autoComplete="current-password"
                      />
                      <button
                        type="button"
                        className="password-toggle-btn"
                        onClick={this.togglePasswordVisibility}
                      >
                        <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                      </button>
                    </div>
                    {errors.password && <span className="error-message">{errors.password}</span>}
                  </div>

                  <div className="mb-3 form-options">
                    <div className="custom-control custom-checkbox">
                      <input
                        type="checkbox"
                        className="custom-control-input"
                        id="customCheck1"
                        checked={rememberMe}
                        onChange={(e) => this.setState({ rememberMe: e.target.checked })}
                      />
                      <label className="custom-control-label" htmlFor="customCheck1">
                        Remember me
                      </label>
                    </div>
                    <a href="/forgot-password" className="forgot-link">
                      Forgot Password?
                    </a>
                  </div>

                  <div className="d-grid">
                    <button 
                      type="submit" 
                      className="btn login professional-btn"
                      disabled={isLoading}
                    >
                      {isLoading ? (
                        <>
                          <span className="spinner"></span>
                          Signing in...
                        </>
                      ) : (
                        'Sign In'
                      )}
                    </button>
                  </div>
                  
                  <p className="forgot-password text-right">
                    Don't have an account? <a href="/signup">Create one here</a>
                  </p>
                </div>
              </div>
            </form>
          </div>
        </div>

        <style jsx>{`
          .login-wrapper {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          }

          .toppage {
            padding: 60px 0;
            min-height: calc(100vh - 80px);
            display: flex;
            align-items: center;
          }

          .container {
            max-width: 500px;
            margin: 0 auto;
            padding: 0 20px;
          }

          .professional-form {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            padding: 40px;
            position: relative;
            overflow: hidden;
          }

          .professional-form::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
          }

          .form-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .form-header h3 {
            color: #2d3748;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }

          .form-header p {
            color: #718096;
            font-size: 16px;
            margin: 0;
          }

          .formbox {
            margin: 0;
          }

          .form-container {
            padding: 0;
          }

          .labelcontainer {
            margin-bottom: 8px !important;
          }

          .labelcontainer label {
            color: #2d3748;
            font-size: 14px;
            font-weight: 600;
            margin: 0;
          }

          .required {
            color: #e53e3e;
          }

          .form-control {
            width: 100%;
            padding: 14px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            font-size: 16px;
            transition: all 0.3s ease;
            background: #ffffff;
            box-sizing: border-box;
          }

          .form-control:focus {
            outline: none;
            border-color: #667eea;
            box-shadow: 0 0 0 3px rgba(102, 126, 234, 0.1);
          }

          .form-control.error {
            border-color: #e53e3e;
            box-shadow: 0 0 0 3px rgba(229, 62, 62, 0.1);
          }

          .password-field {
            position: relative;
          }

          .password-toggle-btn {
            position: absolute;
            right: 12px;
            top: 50%;
            transform: translateY(-50%);
            background: none;
            border: none;
            color: #718096;
            cursor: pointer;
            padding: 4px;
            border-radius: 4px;
            transition: color 0.2s ease;
          }

          .password-toggle-btn:hover {
            color: #2d3748;
          }

          .error-message {
            display: block;
            color: #e53e3e;
            font-size: 12px;
            margin-top: 4px;
            font-weight: 500;
          }

          .form-options {
            display: flex;
            justify-content: space-between;
            align-items: center;
            margin-bottom: 24px !important;
          }

          .custom-control {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .custom-control-input {
            width: 16px;
            height: 16px;
            accent-color: #667eea;
          }

          .custom-control-label {
            color: #4a5568;
            font-size: 14px;
            cursor: pointer;
            margin: 0;
          }

          .forgot-link {
            color: #667eea;
            text-decoration: none;
            font-size: 14px;
            font-weight: 500;
          }

          .forgot-link:hover {
            text-decoration: underline;
          }

          .professional-btn {
            width: 100%;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%) !important;
            color: white !important;
            border: none !important;
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

          .professional-btn:hover:not(:disabled) {
            transform: translateY(-1px);
            box-shadow: 0 8px 25px rgba(102, 126, 234, 0.3);
          }

          .professional-btn:disabled {
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

          .forgot-password {
            text-align: center;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
            margin: 0;
            color: #718096;
            font-size: 14px;
          }

          .forgot-password a {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            margin-left: 4px;
          }

          .forgot-password a:hover {
            text-decoration: underline;
          }

          @media (max-width: 768px) {
            .toppage {
              padding: 40px 0;
            }

            .professional-form {
              padding: 24px;
              margin: 16px;
            }

            .form-header h3 {
              font-size: 24px;
            }

            .form-options {
              flex-direction: column;
              gap: 12px;
              align-items: flex-start;
            }
          }
        `}</style>
      </div>
    );
  }
}