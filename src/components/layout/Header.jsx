import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { GiPokerHand } from 'react-icons/gi';
import {
  FiUser,
  FiLogOut,
  FiSettings as FiSettingsIcon,
  FiShield,
  FiMenu,
  FiX,
  FiBook,
} from 'react-icons/fi';
import { hostname } from '../../hostname';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';
import toast from 'react-hot-toast';
import { FiSettings } from 'react-icons/fi';

const Header = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
  const [authModalMode, setAuthModalMode] = useState('login');
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
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
      : hostname === 'pokerbrisbane.com'
      ? 'POKER BRISBANE'
      : 'POKER';

  const handleLogout = async () => {
    try {
      await logout();
      toast.success('Successfully logged out. See you next time!');
      navigate('/'); // Redirect to main page after logout
      setIsMobileMenuOpen(false); // Close mobile menu
    } catch (error) {
      console.error('Failed to logout:', error);
      toast.error('Failed to logout. Please try again.');
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  return (
    <>
      <div className='navbar bg-slate-800 text-center justify-between px-4 relative'>
        <Link to='/' className='text-lg sm:text-xl text-white font-bold py-4'>
          <GiPokerHand className='text-2xl sm:text-3xl mr-2 sm:mr-3' />
        </Link>

        {/* Desktop Navigation */}
        <div className='hidden md:flex items-center space-x-4'>
          {currentUser ? (
            <>
              <Link
                to='/dashboard'
                className='text-white hover:text-gray-300 p-2 flex items-center space-x-2'
                title='Dashboard'>
                <FiUser className='text-xl' />
                <span>Dashboard</span>
              </Link>
              <Link
                to='/pokerdex'
                className='text-white hover:text-gray-300 p-2 flex items-center space-x-2'
                title='Pokerdex'>
                <FiBook className='text-xl' />
                <span>Pokerdex</span>
              </Link>
              <Link
                to='/profile'
                className='text-white hover:text-gray-300 p-2 flex items-center space-x-2'
                title='Profile'>
                <FiSettingsIcon className='text-xl' />
                <span>Profile</span>
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to='/admin/suggestions'
                    className='text-orange-400 hover:text-orange-300 p-2 flex items-center space-x-2'
                    title='Game Suggestions'>
                    <FiSettings className='text-xl' />
                    <span>Suggestions</span>
                  </Link>
                  <Link
                    to='/admin/operators'
                    className='text-blue-400 hover:text-blue-300 p-2 flex items-center space-x-2'
                    title='Operator Claims'>
                    <FiShield className='text-xl' />
                    <span>Operators</span>
                  </Link>
                </>
              )}
              <button
                onClick={handleLogout}
                className='text-white hover:text-gray-300 p-2 flex items-center space-x-2'
                title='Logout'>
                <FiLogOut className='text-xl' />
                <span>Logout</span>
              </button>
            </>
          ) : (
            <div className='flex items-center space-x-2'>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className='btn btn-ghost btn-sm text-white hover:text-gray-300'>
                Login
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className='btn btn-primary btn-sm hover:btn-primary-focus transition-all duration-200'>
                Sign Up
              </button>
            </div>
          )}
        </div>

        {/* Mobile Hamburger Button */}
        <div className='md:hidden'>
          {currentUser ? (
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className='text-white hover:text-gray-300 p-2'
              title='Menu'>
              <FiMenu className='text-2xl' />
            </button>
          ) : (
            <div className='flex items-center gap-2'>
              <button
                onClick={() => {
                  setAuthModalMode('login');
                  setIsAuthModalOpen(true);
                }}
                className='btn btn-ghost btn-sm text-white hover:text-gray-300'>
                Login
              </button>
              <button
                onClick={() => {
                  setAuthModalMode('signup');
                  setIsAuthModalOpen(true);
                }}
                className='btn btn-primary btn-sm'>
                Sign Up
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Mobile Full Screen Menu */}
      <div
        className={`fixed top-0 right-0 h-full w-full bg-slate-900 z-50 md:hidden transform transition-transform duration-300 ease-in-out ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}>
        <div className='flex flex-col h-full'>
          {/* Mobile Menu Header */}
          <div className='flex justify-between items-center p-4 border-b border-slate-700'>
            <div className='text-white font-bold text-lg'>
              <GiPokerHand className='inline text-2xl mr-2' />
              Menu
            </div>
            <button
              onClick={closeMobileMenu}
              className='text-white hover:text-gray-300 p-2 transition-colors'>
              <FiX className='text-2xl' />
            </button>
          </div>

          {/* Tips Section */}
          <div className='px-8 pt-8 pb-6'>
            <div className='bg-slate-800 rounded-lg p-4 mb-6 text-center'>
              <h4 className='text-yellow-400 font-semibold text-sm mb-2 flex items-center justify-center'>
                <span className='mr-2'>💡</span>
                Did You Know?
              </h4>
              <p className='text-gray-300 text-xs leading-relaxed'>
                {isAdmin
                  ? 'As an admin, you can review game suggestions and operator claims to keep the community updated!'
                  : 'You can suggest game edits by clicking the blue edit button on any game card, or claim ownership of your venue in your profile!'}
              </p>
            </div>
          </div>

          {/* Main Navigation Items */}
          <div className='flex-1 px-8'>
            <div className='space-y-10'>
              <Link
                to='/dashboard'
                onClick={closeMobileMenu}
                className='flex items-center text-white hover:text-blue-400 text-2xl font-semibold transition-colors transform hover:translate-x-2 duration-200'>
                <FiUser className='text-3xl mr-4' />
                Dashboard
              </Link>
              <Link
                to='/pokerdex'
                onClick={closeMobileMenu}
                className='flex items-center text-white hover:text-blue-400 text-2xl font-semibold transition-colors transform hover:translate-x-2 duration-200'>
                <FiBook className='text-3xl mr-4' />
                Pokerdex
              </Link>
              <Link
                to='/profile'
                onClick={closeMobileMenu}
                className='flex items-center text-white hover:text-blue-400 text-2xl font-semibold transition-colors transform hover:translate-x-2 duration-200'>
                <FiSettingsIcon className='text-3xl mr-4' />
                Profile
              </Link>
              {isAdmin && (
                <>
                  <Link
                    to='/admin/suggestions'
                    onClick={closeMobileMenu}
                    className='flex items-center text-orange-400 hover:text-orange-300 text-2xl font-semibold transition-colors transform hover:translate-x-2 duration-200'>
                    <FiSettings className='text-3xl mr-4' />
                    Game Suggestions
                  </Link>
                  <Link
                    to='/admin/operators'
                    onClick={closeMobileMenu}
                    className='flex items-center text-blue-400 hover:text-blue-300 text-2xl font-semibold transition-colors transform hover:translate-x-2 duration-200'>
                    <FiShield className='text-3xl mr-4' />
                    Operator Claims
                  </Link>
                </>
              )}
            </div>
          </div>

          {/* Logout Section */}
          <div className='px-8 pb-8'>
            <button
              onClick={handleLogout}
              className='flex items-center text-red-400 hover:text-red-300 text-2xl font-semibold text-left transition-colors transform hover:translate-x-2 duration-200 w-full'>
              <FiLogOut className='text-3xl mr-4' />
              Logout
            </button>
          </div>

          {/* Mobile Menu Footer */}
          <div className='p-4 border-t border-slate-700 text-center'>
            <p className='text-gray-400 text-sm'>
              Welcome, {currentUser?.displayName}
            </p>
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
        initialMode={authModalMode}
      />
    </>
  );
};

export default Header;
