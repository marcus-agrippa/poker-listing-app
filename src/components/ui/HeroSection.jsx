import React, { useState } from 'react';
import { FiPlay, FiUsers, FiTrendingUp, FiMapPin } from 'react-icons/fi';
import { GiPokerHand, GiCardAceSpades, GiDiamonds } from 'react-icons/gi';
import AuthModal from '../auth/AuthModal';

const HeroSection = ({ regionName, currentUser }) => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  return (
    <>
      <div className='relative overflow-hidden bg-gradient-to-br from-slate-800 via-slate-700 to-blue-900'>
        {/* Background decorative elements */}
        <div className='absolute inset-0'>
          <GiCardAceSpades className='absolute top-10 left-10 text-6xl text-blue-500 opacity-10 rotate-12' />
          <GiDiamonds className='absolute top-20 right-20 text-5xl text-green-500 opacity-10' />
          <GiPokerHand className='absolute bottom-20 left-20 text-7xl text-purple-500 opacity-10 -rotate-12' />
          <div className='absolute top-0 right-0 w-64 h-64 bg-gradient-to-bl from-blue-600 to-transparent opacity-20 rounded-full blur-3xl'></div>
          <div className='absolute bottom-0 left-0 w-80 h-80 bg-gradient-to-tr from-purple-600 to-transparent opacity-20 rounded-full blur-3xl'></div>
        </div>

        <div className='relative max-w-6xl mx-auto px-4 py-6'>
          <div className='text-center'>
            {/* Main headline */}
            <div className='flex items-center justify-center mb-4'>
              <FiMapPin className='text-blue-400 text-2xl mr-3' />
              <span className='text-blue-400 font-semibold text-lg uppercase tracking-wide'>
                {regionName || 'Your Local'} Poker Scene
              </span>
            </div>

            <h1 className='text-2xl md:text-4xl font-bold text-white mb-3 leading-tight'>
              Find Your Next
              <span className='text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-500'>
                {' '}
                Big Win
              </span>
            </h1>

            <p className='text-base md:text-lg text-gray-300 mb-5 max-w-3xl mx-auto leading-relaxed'>
              Track your winnings across competitions, discover live games, and
              join{' '}
              <span className='text-green-400 font-semibold'>
                other players
              </span>{' '}
              in your area
            </p>

            {/* Stats row */}
            <div className='grid grid-cols-1 md:grid-cols-3 gap-3 mb-6 max-w-2xl mx-auto'>
              <div className='bg-slate-700 bg-opacity-50 rounded-lg p-3 backdrop-blur-sm border border-slate-600'>
                <div className='flex items-center justify-center mb-1'>
                  <FiUsers className='text-blue-400 text-xl mr-2' />
                  <span className='text-xl font-bold text-white'>Many</span>
                </div>
                <p className='text-gray-300 text-sm'>Active Players</p>
              </div>

              <div className='bg-slate-700 bg-opacity-50 rounded-lg p-3 backdrop-blur-sm border border-slate-600'>
                <div className='flex items-center justify-center mb-1'>
                  <FiPlay className='text-green-400 text-xl mr-2' />
                  <span className='text-xl font-bold text-white'>New</span>
                </div>
                <p className='text-gray-300 text-sm'>Games Added Frequently</p>
              </div>

              <div className='bg-slate-700 bg-opacity-50 rounded-lg p-3 backdrop-blur-sm border border-slate-600'>
                <div className='flex items-center justify-center mb-1'>
                  <FiTrendingUp className='text-purple-400 text-xl mr-2' />
                  <span className='text-xl font-bold text-white'>Growing</span>
                </div>
                <p className='text-gray-300 text-sm'>Community</p>
              </div>
            </div>

            {/* CTA Button */}
            {!currentUser && (
              <div className='flex flex-col items-center'>
                <button
                  onClick={() => setIsAuthModalOpen(true)}
                  className='btn btn-primary btn-lg group hover:scale-105 transition-all duration-200 shadow-lg'>
                  <FiPlay className='mr-2' />
                  Join Free & Start Tracking
                  <span className='ml-2 group-hover:translate-x-1 transition-transform'>
                    →
                  </span>
                </button>
                <p className='text-sm text-gray-400 mt-3'>
                  ✨ No credit card required • Made by poker players
                </p>
                <p className='text-xs text-green-400 mt-1 font-semibold'>
                  🚀 Join one of the fastest growing poker community in
                  Australia!
                </p>
              </div>
            )}
          </div>
        </div>
      </div>

      <AuthModal
        isOpen={isAuthModalOpen}
        onClose={() => setIsAuthModalOpen(false)}
      />
    </>
  );
};

export default HeroSection;
