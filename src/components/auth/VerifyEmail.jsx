import React, { useEffect, useState } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { applyActionCode } from 'firebase/auth';
import { auth } from '../../firebase/config';
import { FiCheckCircle, FiXCircle, FiLoader } from 'react-icons/fi';

const VerifyEmail = () => {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [verificationState, setVerificationState] = useState('loading'); // loading, success, error
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    const verifyEmail = async () => {
      // Firebase can send oobCode in different ways depending on configuration
      const oobCode = searchParams.get('oobCode') || searchParams.get('code');
      const mode = searchParams.get('mode');

      // Check if this is an email verification action
      if (mode && mode !== 'verifyEmail') {
        setVerificationState('error');
        setErrorMessage('This link is not for email verification.');
        return;
      }

      if (!oobCode) {
        setVerificationState('error');
        setErrorMessage('Invalid verification link. Please request a new verification email.');
        return;
      }

      try {
        // Apply the email verification code
        await applyActionCode(auth, oobCode);

        setVerificationState('success');

        // Redirect to dashboard after 3 seconds
        setTimeout(() => {
          navigate('/dashboard');
        }, 3000);
      } catch (error) {
        console.error('Error verifying email:', error);

        let message = 'Failed to verify email. ';
        switch (error.code) {
          case 'auth/expired-action-code':
            message += 'The verification link has expired. Please request a new one.';
            break;
          case 'auth/invalid-action-code':
            message += 'The verification link is invalid or has already been used.';
            break;
          case 'auth/user-disabled':
            message += 'This account has been disabled.';
            break;
          case 'auth/user-not-found':
            message += 'No account found with this email.';
            break;
          default:
            message += 'Please try again or request a new verification email.';
        }

        setErrorMessage(message);
        setVerificationState('error');
      }
    };

    verifyEmail();
  }, [searchParams, navigate]);

  return (
    <div className='min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 flex items-center justify-center p-4'>
      <div className='max-w-md w-full'>
        <div className='card bg-slate-800 shadow-2xl border border-slate-700'>
          <div className='card-body text-center'>
            {verificationState === 'loading' && (
              <>
                <div className='flex justify-center mb-4'>
                  <FiLoader className='text-6xl text-blue-400 animate-spin' />
                </div>
                <h2 className='card-title justify-center text-2xl text-white mb-2'>
                  Verifying Your Email
                </h2>
                <p className='text-gray-300'>
                  Please wait while we verify your email address...
                </p>
              </>
            )}

            {verificationState === 'success' && (
              <>
                <div className='flex justify-center mb-4'>
                  <div className='w-20 h-20 bg-green-500 bg-opacity-20 rounded-full flex items-center justify-center'>
                    <FiCheckCircle className='text-5xl text-green-400' />
                  </div>
                </div>
                <h2 className='card-title justify-center text-2xl text-white mb-2'>
                  Email Verified! 🎉
                </h2>
                <p className='text-gray-300 mb-4'>
                  Your email has been successfully verified. You now have full access to all features!
                </p>
                <div className='bg-green-900/30 border border-green-600/50 rounded-lg p-4 mb-4'>
                  <h3 className='font-semibold mb-2 text-green-400'>
                    ✨ You've unlocked:
                  </h3>
                  <div className='text-sm space-y-1 text-left text-gray-300'>
                    <div>• Full dashboard access</div>
                    <div>• Pokerdex notes and player tracking</div>
                    <div>• Share your poker stats</div>
                    <div>• Operator features (if verified)</div>
                  </div>
                </div>
                <p className='text-sm text-gray-400'>
                  Redirecting to your dashboard in 3 seconds...
                </p>
                <button
                  onClick={() => navigate('/dashboard')}
                  className='btn btn-primary btn-block mt-4'>
                  Go to Dashboard Now
                </button>
              </>
            )}

            {verificationState === 'error' && (
              <>
                <div className='flex justify-center mb-4'>
                  <div className='w-20 h-20 bg-red-500 bg-opacity-20 rounded-full flex items-center justify-center'>
                    <FiXCircle className='text-5xl text-red-400' />
                  </div>
                </div>
                <h2 className='card-title justify-center text-2xl text-white mb-2'>
                  Verification Failed
                </h2>
                <div className='bg-red-900/30 border border-red-600/50 rounded-lg p-4 mb-4'>
                  <p className='text-gray-300 text-sm'>{errorMessage}</p>
                </div>
                <div className='flex flex-col gap-3'>
                  <button
                    onClick={() => navigate('/dashboard')}
                    className='btn btn-primary btn-block'>
                    Go to Dashboard
                  </button>
                  <button
                    onClick={() => navigate('/')}
                    className='btn btn-outline btn-block text-white'>
                    Go to Home
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyEmail;
