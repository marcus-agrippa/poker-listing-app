import React, { useState, useEffect } from 'react';
import LoginForm from './LoginForm';
import SignupForm from './SignupForm';

const AuthModal = ({ isOpen, onClose }) => {
  const [isLogin, setIsLogin] = useState(true);

  useEffect(() => {
    const handleToggle = () => {
      setIsLogin(!isLogin);
    };

    window.addEventListener('toggleAuth', handleToggle);
    return () => window.removeEventListener('toggleAuth', handleToggle);
  }, [isLogin]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="relative">
        <button 
          onClick={onClose}
          className="absolute -top-2 -right-2 btn btn-circle btn-sm bg-gray-700 text-white border-none hover:bg-gray-600 z-10"
        >
          ✕
        </button>
        
        {isLogin ? (
          <LoginForm onClose={onClose} />
        ) : (
          <SignupForm onClose={onClose} />
        )}
      </div>
    </div>
  );
};

export default AuthModal;