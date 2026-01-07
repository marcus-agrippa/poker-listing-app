import React, { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { FiEye, FiEyeOff } from 'react-icons/fi';
import toast from 'react-hot-toast';
import { sanitizeDisplayName } from '../../utils/sanitize';

const SignupForm = ({ onClose }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [region, setRegion] = useState('');
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [receiveNotifications, setReceiveNotifications] = useState(true);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const { signup, signInWithGoogle } = useAuth();
  const navigate = useNavigate();

  const regions = [
    'Central Coast',
    'Newcastle',
    'Ballarat',
    'Wollongong',
    'Townsville',
    'Sunshine Coast',
    'Perth',
    'Geelong',
    'Gold Coast',
    'Brisbane',
    'Sydney',
    'Melbourne',
    'Adelaide',
    'Canberra',
  ];

  const handleSubmit = async e => {
    e.preventDefault();

    if (password !== confirmPassword) {
      return setError('Passwords do not match');
    }

    if (!acceptTerms) {
      return setError('Please accept the Terms and Conditions to continue');
    }

    // Sanitize display name to prevent XSS attacks
    const cleanDisplayName = sanitizeDisplayName(displayName);

    if (cleanDisplayName.length < 2 || cleanDisplayName.length > 50) {
      return setError('Display name must be between 2 and 50 characters');
    }

    try {
      setError('');
      setLoading(true);
      await signup(email, password, cleanDisplayName, region, receiveNotifications);
      toast.success(
        `🎉 Account created! Check your email (including spam/promotion folders) for a verification link. You can start using the app right away!`,
        {
          duration: 8000,
        }
      );
      onClose();
      // Don't navigate to dashboard - user needs to verify email first
    } catch (error) {
      let errorMessage = 'An error occurred during signup';

      // Convert Firebase error codes to user-friendly messages
      switch (error.code) {
        case 'auth/email-already-in-use':
          errorMessage =
            'An account with this email already exists. Please try logging in instead.';
          break;
        case 'auth/invalid-email':
          errorMessage = 'Please enter a valid email address.';
          break;
        case 'auth/weak-password':
          errorMessage =
            'Password is too weak. Please use at least 6 characters.';
          break;
        case 'auth/operation-not-allowed':
          errorMessage =
            'Account creation is currently disabled. Please contact support.';
          break;
        case 'auth/network-request-failed':
          errorMessage =
            'Network error. Please check your connection and try again.';
          break;
        case 'auth/too-many-requests':
          errorMessage = 'Too many attempts. Please try again later.';
          break;
        default:
          errorMessage = 'Failed to create account. Please try again.';
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }

    setLoading(false);
  };

  const handleGoogleSignIn = async () => {
    try {
      setError('');
      setGoogleLoading(true);
      await signInWithGoogle();
      toast.success('Welcome! Your account has been created with Google.');
      onClose();
      navigate('/dashboard');
    } catch (error) {
      let errorMessage = 'Failed to sign up with Google';

      switch (error.code) {
        case 'auth/popup-closed-by-user':
          errorMessage = 'Sign-up cancelled. Please try again.';
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
          errorMessage = 'Failed to sign up with Google. Please try again.';
          break;
      }

      setError(errorMessage);
      toast.error(errorMessage);
    }

    setGoogleLoading(false);
  };

  return (
    <div className='card w-full max-w-4xl bg-slate-800 shadow-xl max-h-[80vh] overflow-y-auto'>
      <form onSubmit={handleSubmit} className='card-body'>
        <div className='card-title text-white justify-center mb-6'>Sign Up</div>

        {error && (
          <div className='alert alert-error mb-4'>
            <span>{error}</span>
          </div>
        )}

        {/* Form fields */}
        <div className='space-y-4'>
          {/* Display Name and Email row */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white'>Display Name</span>
              </label>
              <input
                type='text'
                placeholder='Your name'
                className='input input-bordered w-full'
                value={displayName}
                onChange={e => setDisplayName(e.target.value)}
                required
              />
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white'>Email</span>
              </label>
              <input
                type='email'
                placeholder='email'
                className='input input-bordered w-full'
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
              />
            </div>
          </div>

          {/* Password and Confirm Password row */}
          <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white'>Password</span>
              </label>
              <div className='relative'>
                <input
                  type={showPassword ? 'text' : 'password'}
                  placeholder='password'
                  className='input input-bordered w-full pr-10'
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowPassword(!showPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                  tabIndex={-1}
                >
                  {showPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>

            <div className='form-control'>
              <label className='label'>
                <span className='label-text text-white'>Confirm Password</span>
              </label>
              <div className='relative'>
                <input
                  type={showConfirmPassword ? 'text' : 'password'}
                  placeholder='confirm password'
                  className='input input-bordered w-full pr-10'
                  value={confirmPassword}
                  onChange={e => setConfirmPassword(e.target.value)}
                  required
                />
                <button
                  type='button'
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  className='absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white transition-colors'
                  tabIndex={-1}
                >
                  {showConfirmPassword ? <FiEyeOff size={20} /> : <FiEye size={20} />}
                </button>
              </div>
            </div>
          </div>

          {/* Region field (full width) */}
          <div className='form-control'>
            <label className='label'>
              <span className='label-text text-white'>Region</span>
            </label>
            <select
              className='select select-bordered w-full'
              value={region}
              onChange={e => setRegion(e.target.value)}
              required>
              <option value=''>Select your region</option>
              {regions.map(r => (
                <option key={r} value={r}>
                  {r}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Checkboxes section */}
        <div className='space-y-4 mt-6'>
          <div className='form-control'>
            <label className='label cursor-pointer justify-start gap-3'>
              <input
                type='checkbox'
                className='checkbox checkbox-primary'
                checked={receiveNotifications}
                onChange={e => setReceiveNotifications(e.target.checked)}
              />
              <span className='label-text text-white'>
                Send me notifications about new games and updates in my region
              </span>
            </label>
          </div>

          <div className='form-control'>
            <label className='label cursor-pointer justify-start gap-3'>
              <input
                type='checkbox'
                className='checkbox checkbox-primary'
                checked={acceptTerms}
                onChange={e => setAcceptTerms(e.target.checked)}
                required
              />
              <span className='label-text text-white'>
                I agree to the{' '}
                <a
                  href='/terms'
                  target='_blank'
                  className='link link-primary'
                  onClick={e => e.stopPropagation()}>
                  Terms and Conditions
                </a>{' '}
                and{' '}
                <a
                  href='/privacy'
                  target='_blank'
                  className='link link-primary'
                  onClick={e => e.stopPropagation()}>
                  Privacy Policy
                </a>
                *
              </span>
            </label>
          </div>
        </div>

        <div className='form-control mt-8'>
          <button
            disabled={loading || googleLoading}
            className='btn btn-primary w-full'
            type='submit'>
            {loading ? 'Creating Account...' : 'Sign Up'}
          </button>

          <div className='divider text-gray-400 text-sm my-4'>OR</div>

          <button
            type='button'
            onClick={handleGoogleSignIn}
            disabled={loading || googleLoading}
            className='btn btn-outline w-full text-white hover:bg-white hover:text-gray-900 border-gray-500'>
            {googleLoading ? (
              'Signing up...'
            ) : (
              <div className='flex items-center justify-center gap-2'>
                <svg className='w-5 h-5' viewBox='0 0 48 48'>
                  <path
                    fill='#EA4335'
                    d='M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z'
                  />
                  <path
                    fill='#4285F4'
                    d='M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z'
                  />
                  <path
                    fill='#FBBC05'
                    d='M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z'
                  />
                  <path
                    fill='#34A853'
                    d='M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z'
                  />
                  <path fill='none' d='M0 0h48v48H0z' />
                </svg>
                Continue with Google
              </div>
            )}
          </button>

          <div className='text-center mt-4'>
            <button
              type='button'
              onClick={() =>
                window.dispatchEvent(new CustomEvent('toggleAuth'))
              }
              className='text-white hover:text-gray-300 underline text-sm'>
              Already have an account? Login
            </button>
          </div>
        </div>
      </form>
    </div>
  );
};

export default SignupForm;
