import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

const LoginForm = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resetLoading, setResetLoading] = useState(false);
  const { login, resetPassword } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      await login(email, password);
      toast.success('Welcome back! Successfully logged in.');
      onClose();
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'An error occurred during login';
      
      // Convert Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/invalid-credential':
          errorMessage = 'Invalid email or password. Please check your credentials and try again.';
          break;
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/wrong-password':
          errorMessage = 'Incorrect password. Please try again.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/user-disabled':
          errorMessage = 'This account has been disabled. Please contact support.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many failed attempts. Please try again later.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          errorMessage = 'Login failed. Please try again.';
          break;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    setLoading(false);
  };

  const handleForgotPassword = async () => {
    if (!email) {
      setError('Please enter your email address first');
      toast.error('Please enter your email address first');
      return;
    }

    try {
      setError('');
      setResetLoading(true);
      await resetPassword(email);
      toast.success('Password reset email sent! Check your inbox.');
    } catch (error) {
      let errorMessage = 'Failed to send reset email';
      
      switch (error.code) {
        case 'auth/user-not-found':
          errorMessage = 'No account found with this email address.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many requests. Please try again later.';
          break;
        default:
          errorMessage = 'Failed to send reset email. Please try again.';
          break;
      }
      
      setError(errorMessage);
      toast.error(errorMessage);
    }
    
    setResetLoading(false);
  };

  return (
    <div className="card w-full max-w-md bg-slate-800 shadow-xl">
      <form onSubmit={handleSubmit} className="card-body">
        <div className="card-title text-white justify-center mb-4">Login</div>
        
        {error && (
          <div className="alert alert-error">
            <span>{error}</span>
          </div>
        )}

        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Email</span>
          </label>
          <input
            type="email"
            placeholder="email"
            className="input input-bordered w-full"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
        </div>
        
        <div className="form-control">
          <label className="label">
            <span className="label-text text-white">Password</span>
          </label>
          <input
            type="password"
            placeholder="password"
            className="input input-bordered w-full"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <label className="label">
            <button
              type="button"
              onClick={handleForgotPassword}
              disabled={resetLoading}
              className="label-text-alt link link-hover text-blue-400"
            >
              {resetLoading ? 'Sending...' : 'Forgot your password?'}
            </button>
          </label>
        </div>
        
        <div className="form-control mt-6">
          <button 
            disabled={loading} 
            className="btn btn-primary w-full"
            type="submit"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>
          
          <div className="text-center mt-3">
            <button
              type="button"
              onClick={() => window.dispatchEvent(new CustomEvent('toggleAuth'))}
              className="text-white hover:text-gray-300 underline text-sm"
            >
              Need an account? Sign up
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default LoginForm;