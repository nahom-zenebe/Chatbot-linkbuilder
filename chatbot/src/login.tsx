import React, { useState } from 'react';
import axios from 'axios';
import './login.css';

export default function Login() {
  const [email, setEmail] = useState<string>("");
  const [password, setPassword] = useState<string>("");
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [message, setMessage] = useState<string>("");

  const handleLogin = async () => {
    setIsLoading(true);
    setMessage("");
    try {
      const response = await axios.post("http://localhost:3001/api/users/login", {
        email,
        password,
      },{  withCredentials: true});
      setMessage("Login successful!");
      window.location.href = "/";
      console.log("Login successful:", response.data);
    } catch (error: any) {
      const errorMsg = error.response?.data?.message || "Login failed. Please try again.";
      setMessage(errorMsg);
      console.error("Login failed:", error.response?.data || error.message);
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    handleLogin();
  };

  return (
    <div className="login-container">
      <div className="login-card">
        <div className="login-header">
          <h2>Welcome Back</h2>
          <p>Please enter your credentials to continue</p>
        </div>
        
        <form onSubmit={handleSubmit} className="login-form">
          <div className="input-group">
            <label htmlFor="email">Email Address</label>
            <input
              id="email"
              placeholder="Enter your email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          
          <div className="input-group">
            <label htmlFor="password">Password</label>
            <input
              id="password"
              placeholder="Enter your password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          
          <button 
            type="submit" 
            className={`login-button ${isLoading ? 'loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="spinner"></span>
                Logging in...
              </>
            ) : (
              'Login'
            )}
          </button>
        </form>
        
        {message && (
          <div className={`message ${message.includes('successful') ? 'success' : 'error'}`}>
            {message}
          </div>
        )}
        
        <div className="login-footer">
          <p>Don't have an account? <a href="/signup">Sign up</a></p>
          <a href="/forgot-password" className="forgot-link">Forgot password?</a>
        </div>
      </div>
    </div>
  );
}