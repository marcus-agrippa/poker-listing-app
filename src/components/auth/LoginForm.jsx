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
  const [googleLoading, setGoogleLoading] = useState(false);
  const { login, resetPassword, reactivateAccount, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();

    try {
      setError('');
      setLoading(true);
      
      // Try to reactivate account if it was deactivated
      const result = await reactivateAccount(email, password);
      
      if (result.wasDeactivated) {
        toast.success('Welcome back! Your account has been reactivated.');
      } else {
        toast.success('Welcome back! Successfully logged in.');
      }
      
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

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await signInWithGoogle();
      toast.success('Welcome! Successfully signed in with Google.');
      onClose();
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Failed to sign in with Google';

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-in cancelled. Please try again.';
          break;
        case 'auth/popup-blocked':
          errorMessage = 'Pop-up blocked. Please allow pop-ups for this site.';
          break;
        case 'auth/account-exists-with-different-credential':
          errorMessage = 'An account already exists with this email using a different sign-in method.';
          break;
        case 'auth/network-request-failed':
          errorMessage = 'Network error. Please check your connection and try again.';
          break;
        default:
          errorMessage = 'Failed to sign in with Google. Please try again.';
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }

    setGoogleLoading(false);
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
            disabled={loading || googleLoading}
            className="btn btn-primary w-full"
            type="submit"
          >
            {loading ? 'Logging in...' : 'Login'}
          </button>

          <div className="divider text-gray-400 text-sm my-4">OR</div>

          <button
            type="button"
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className="btn btn-outline w-full text-white hover:bg-white hover:text-gray-900 border-gray-500"
          >
            {googleLoading ? (
              'Signing in...'
            ) : (
              <div className="flex items-center justify-center gap-2">
                <svg className="w-5 h-5" viewBox="0 0 48 48">
                  <path
                    fill="#EA4335"
                    d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"
                  />
                  <path
                    fill="#4285F4"
                    d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"
                  />
                  <path
                    fill="#34A853"
                    d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"
                  />
                  <path fill="none" d="M0 0h48v48H0z" />
                </svg>
                Continue with Google
              </div>
            )}
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