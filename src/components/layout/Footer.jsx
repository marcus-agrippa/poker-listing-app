import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { hostname } from '../../hostname';
import { useAuth } from '../../contexts/AuthContext';
import AuthModal from '../auth/AuthModal';

const Footer = () => {
  const { currentUser } = useAuth();
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const copyright =
    hostname === 'pokercentralcoast.com'
      ? 'PokerCentralCoast'
      : hostname === 'pokernewcastle.com'
      ? 'PokerNewcastle'
      : hostname === 'pokerballarat.com'
      ? 'PokerBallarat'
      : hostname === 'pokerwollongong.com'
      ? 'PokerWollongong'
      : hostname === 'pokertownsville.com'
      ? 'PokerTownsville'
      : hostname === 'pokersunshinecoast.com'
      ? 'PokerSunshineCoast'
      : hostname === 'pokerperth.com'
      ? 'PokerPerth'
      : hostname === 'pokergeelong.com'
      ? 'PokerGeelong'
      : hostname === 'pokergoldcoast.com'
      ? 'PokerGoldCoast'
      : hostname === 'pokerbrisbane.com'
      ? 'PokerBrisbane'
      : hostname === 'pokersydney.com'
      ? 'PokerSydney'
      : hostname === 'pokermelbourne.com'
      ? 'PokerMelbourne'
      : hostname === 'pokeradelaide.com'
      ? 'PokerAdelaide'
      : hostname === 'pokercanberra.com'
      ? 'PokerCanberra'
      : 'Poker';

  return (
    <footer className='bg-slate-800 text-center p-6 bottom-0 w-full'>
      <p className='text-white text-sm'>
        {currentUser
          ? 'Track your results in your dashboard! Game info needs updating? Register a new game? Something else?'
          : 'Game information needs updating? Register a game? Track your poker results?'}
      </p>

      {!currentUser && (
        <div className='mt-4 mb-4'>
          <p className='text-gray-300 text-xs mb-3'>
            Sign up to track your poker results and suggest game edits directly!
          </p>
          <button
            onClick={() => setIsAuthModalOpen(true)}
            className='bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded text-sm mr-3'>
            Sign Up / Login
          </button>
        </div>
      )}

      <div className='flex flex-wrap items-center justify-center gap-4 mt-4'>
        <Link to='/contact' className='font-bold text-blue-500 hover:text-blue-400'>
          Contact Us
        </Link>
        <span className='text-gray-600'>•</span>
        <Link to='/privacy' className='font-bold text-blue-500 hover:text-blue-400'>
          Privacy Policy
        </Link>
        <span className='text-gray-600'>•</span>
        <Link to='/terms' className='font-bold text-blue-500 hover:text-blue-400'>
          Terms of Service
        </Link>
      </div>
      <p className='text-xs mt-4 text-neutral-400'>
        Disclaimer: The information provided herein is for general guidance
        only. We do not guarantee its completeness or accuracy.<br></br> For the
        most current and precise information, please consult the official
        sources or the respective organizers.<br></br> Each game is linked to
        relevant social media pages or websites for further information.
      </p>
      <p className='text-xs mt-4 text-neutral-400'>
        {copyright} © {new Date().getFullYear()}
      </p>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </footer>
  );
};

export default Footer;
