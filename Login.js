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
      return;
    }

    const { email, password, rememberMe } = this.state;
    this.setState({ isLoading: true });

    fetch(`${process.env.REACT_APP_API_URL}/login`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json",
      },
      body: JSON.stringify({
        email,
        password,
        rememberMe,
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
          position: "top-right",
          autoClose: 2000,
          hideProgressBar: false,
          closeOnClick: true,
          pauseOnHover: true,
          draggable: true,
        });
        
        // Store tokens and user data
        window.localStorage.setItem("token", data.data.token);
        window.localStorage.setItem("userId", data.data.userId);
        window.localStorage.setItem("loggedIn", true);
        
        if (rememberMe) {
          window.localStorage.setItem("rememberUser", email);
        }
        
        // Redirect after a short delay to show the success message
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
      <div className="login-page">
        <Navbar />
        <ToastContainer />
        
        <div className="login-container">
          <div className="login-card">
            <div className="login-header">
              <h1>Welcome Back</h1>
              <p>Sign in to your account to continue</p>
            </div>

            <form onSubmit={this.handleSubmit} className="login-form">
              <div className="form-group">
                <label htmlFor="email" className="form-label">
                  Email Address <span className="required">*</span>
                </label>
                <input
                  id="email"
                  type="email"
                  className={`form-input ${errors.email ? 'error' : ''}`}
                  placeholder="Enter your email address"
                  value={email}
                  onChange={(e) => this.setState({ email: e.target.value })}
                  autoComplete="email"
                />
                {errors.email && <span className="error-message">{errors.email}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="password" className="form-label">
                  Password <span className="required">*</span>
                </label>
                <div className="password-input-container">
                  <input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    className={`form-input ${errors.password ? 'error' : ''}`}
                    placeholder="Enter your password"
                    value={password}
                    onChange={(e) => this.setState({ password: e.target.value })}
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    className="password-toggle"
                    onClick={this.togglePasswordVisibility}
                    aria-label={showPassword ? "Hide password" : "Show password"}
                  >
                    <i className={`fa ${showPassword ? 'fa-eye-slash' : 'fa-eye'}`}></i>
                  </button>
                </div>
                {errors.password && <span className="error-message">{errors.password}</span>}
              </div>

              <div className="form-options">
                <div className="remember-me">
                  <input
                    type="checkbox"
                    id="rememberMe"
                    className="checkbox-input"
                    checked={rememberMe}
                    onChange={(e) => this.setState({ rememberMe: e.target.checked })}
                  />
                  <label htmlFor="rememberMe" className="checkbox-label">
                    Remember me
                  </label>
                </div>
                <a href="/forgot-password" className="forgot-link">
                  Forgot Password?
                </a>
              </div>

              <button 
                type="submit" 
                className="submit-btn"
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

              <div className="login-footer">
                <p>
                  Don't have an account? 
                  <a href="/signup" className="signup-link"> Create one here</a>
                </p>
              </div>
            </form>

            <div className="login-divider">
              <span>or continue with</span>
            </div>

            <div className="social-login">
              <button type="button" className="social-btn google-btn">
                <i className="fa fa-google"></i>
                Google
              </button>
              <button type="button" className="social-btn microsoft-btn">
                <i className="fa fa-windows"></i>
                Microsoft
              </button>
            </div>
          </div>
        </div>

        <style jsx>{`
          .login-page {
            min-height: 100vh;
            background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
            display: flex;
            flex-direction: column;
          }

          .login-container {
            flex: 1;
            display: flex;
            align-items: center;
            justify-content: center;
            padding: 20px;
          }

          .login-card {
            background: #ffffff;
            border-radius: 16px;
            box-shadow: 0 20px 60px rgba(0, 0, 0, 0.1);
            padding: 40px;
            width: 100%;
            max-width: 450px;
            position: relative;
            overflow: hidden;
          }

          .login-card::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            right: 0;
            height: 4px;
            background: linear-gradient(90deg, #667eea, #764ba2);
          }

          .login-header {
            text-align: center;
            margin-bottom: 32px;
          }

          .login-header h1 {
            color: #2d3748;
            font-size: 28px;
            font-weight: 700;
            margin-bottom: 8px;
            letter-spacing: -0.5px;
          }

          .login-header p {
            color: #718096;
            font-size: 16px;
            margin: 0;
          }

          .login-form {
            margin-bottom: 24px;
          }

          .form-group {
            margin-bottom: 24px;
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

          .password-input-container {
            position: relative;
          }

          .password-toggle {
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

          .password-toggle:hover {
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
            margin-bottom: 24px;
          }

          .remember-me {
            display: flex;
            align-items: center;
            gap: 8px;
          }

          .checkbox-input {
            width: 16px;
            height: 16px;
            accent-color: #667eea;
          }

          .checkbox-label {
            color: #4a5568;
            font-size: 14px;
            cursor: pointer;
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

          .login-footer {
            text-align: center;
            padding-top: 16px;
            border-top: 1px solid #e2e8f0;
          }

          .login-footer p {
            color: #718096;
            margin: 0;
            font-size: 14px;
          }

          .signup-link {
            color: #667eea;
            text-decoration: none;
            font-weight: 600;
            margin-left: 4px;
          }

          .signup-link:hover {
            text-decoration: underline;
          }

          .login-divider {
            text-align: center;
            margin: 24px 0;
            position: relative;
          }

          .login-divider::before {
            content: '';
            position: absolute;
            top: 50%;
            left: 0;
            right: 0;
            height: 1px;
            background: #e2e8f0;
          }

          .login-divider span {
            background: #ffffff;
            color: #718096;
            padding: 0 16px;
            font-size: 14px;
            position: relative;
          }

          .social-login {
            display: grid;
            grid-template-columns: 1fr 1fr;
            gap: 12px;
          }

          .social-btn {
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            padding: 12px 16px;
            border: 2px solid #e2e8f0;
            border-radius: 8px;
            background: #ffffff;
            color: #4a5568;
            font-size: 14px;
            font-weight: 500;
            cursor: pointer;
            transition: all 0.3s ease;
          }

          .social-btn:hover {
            border-color: #cbd5e0;
            background: #f7fafc;
          }

          .google-btn:hover {
            border-color: #ea4335;
            color: #ea4335;
          }

          .microsoft-btn:hover {
            border-color: #0078d4;
            color: #0078d4;
          }

          @media (max-width: 768px) {
            .login-container {
              padding: 16px;
            }

            .login-card {
              padding: 24px;
            }

            .login-header h1 {
              font-size: 24px;
            }

            .form-options {
              flex-direction: column;
              gap: 12px;
              align-items: flex-start;
            }

            .social-login {
              grid-template-columns: 1fr;
            }
          }
        `}</style>
      </div>
    );
  }
}