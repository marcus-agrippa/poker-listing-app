import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiPokerHand } from 'react-icons/gi';
import { FiUser, FiLogOut, FiSettings as FiSettingsIcon, FiShield } from 'react-icons/fi';
import { hostname } from '../../hostname';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import toast from 'react-hot-toast';
import { FiSettings } from 'react-icons/fi';

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const { currentUser, logout } = useAuth();
  const navigate = useNavigate();

  // Get admin emails from environment variables
  const adminEmails = process.env.REACT_APP_ADMIN_EMAILS
    ? process.env.REACT_APP_ADMIN_EMAILS.split(',').map(email => email.trim())
    : [];

  const isAdmin = currentUser && adminEmails.includes(currentUser.email);

  const title =
    hostname === 'pokercentralcoast.com'
      ? 'POKER CENTRAL COAST'
      : hostname === 'pokernewcastle.com'
      ? 'POKER NEWCASTLE'
      : hostname === 'pokerballarat.com'
      ? 'POKER BALLARAT'
      : hostname === 'pokerwollongong.com'
      ? 'POKER WOLLONGONG'
      : hostname === 'pokertownsville.com'
      ? 'POKER TOWNSVILLE'
      : hostname === 'pokersunshinecoast.com'
      ? 'POKER SUNSHINE COAST'
      : hostname === 'pokerperth.com'
      ? 'POKER PERTH'
      : hostname === 'pokergeelong.com'
      ? 'POKER GEELONG'
      : hostname === 'pokergoldcoast.com'
      ? 'POKER GOLD COAST'
      : 'POKER';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out. See you next time!');
      navigate('/'); // Redirect to main page after logout
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  return (
    <>
      <div className='navbar bg-slate-800 text-center justify-between px-4'>
        <Link to='/' className='text-xl text-white font-bold py-4'>
          <GiPokerHand className='text-3xl mr-3' /> {title}
        </Link>
        <div className='flex items-center space-x-2 sm:space-x-4'>
          {currentUser ? (
            <>
              <Link
                to='/dashboard'
                className='text-white hover:text-gray-300 p-3 sm:p-2'
                title='Dashboard'>
                <FiUser className='text-xl sm:text-xl' />
              </Link>
              <Link
                to='/profile'
                className='text-white hover:text-gray-300 p-3 sm:p-2'
                title='Profile'>
                <FiSettingsIcon className='text-xl sm:text-xl' />
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to='/admin/suggestions'
                    className='text-orange-400 hover:text-orange-300 p-3 sm:p-2'
                    title='Game Suggestions'>
                    <FiSettings className='text-xl sm:text-xl' />
                  </Link>
                  <Link
                    to='/admin/operators'
                    className='text-blue-400 hover:text-blue-300 p-3 sm:p-2'
                    title='Operator Claims'>
                    <FiShield className='text-xl sm:text-xl' />
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className='text-white hover:text-gray-300 p-3 sm:p-2'
                title='Logout'>
                <FiLogOut className='text-xl sm:text-xl' />
              </button>
            </>
          ) : (
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => setIsAuthModalOpen(true)}
                className='btn btn-primary btn-sm hover:btn-primary-focus transition-all duration-200'>
                Join Free
              </button>
              <div className='hidden sm:block text-xs text-green-400 font-semibold'>
                Free to join!
              </div>
            </div>
          )}
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default Header;
