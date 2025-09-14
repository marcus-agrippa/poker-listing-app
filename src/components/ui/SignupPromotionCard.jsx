import React, { useState } from 'react';
import {
  FiBarChart2,
  FiEdit3,
  FiSettings,
  FiTrendingUp,
  FiArrowRight,
  FiHeart,
  FiClipboard,
  FiUsers,
} from 'react-icons/fi';
import AuthModal from '../auth/AuthModal';

const SignupPromotionCard = () => {
  const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);

  const features = [
    {
      icon: <FiBarChart2 className='text-blue-400' />,
      title: 'Track Your Results',
      description:
        'Log your poker game results and see your performance over time',
    },
    {
      icon: <FiTrendingUp className='text-green-400' />,
      title: 'View Statistics',
      description:
        'Get insights on your winnings, average position, and best results',
    },
    {
      icon: <FiSettings className='text-purple-400' />,
      title: 'Personalized Experience',
      description: 'Set your region to see games relevant to your area',
    },
    {
      icon: <FiEdit3 className='text-yellow-400' />,
      title: 'Suggest Game Updates',
      description:
        'Help keep game information accurate by reporting incorrect details',
    },
    {
      icon: <FiHeart className='text-red-400' />,
      title: 'Favourite Games',
      description:
        'Choose your favourite games and see when you last played there',
    },
    {
      icon: <FiClipboard className='text-orange-400' />,
      title: 'Pokerdex Notes',
      description: 'Track player observations, strategies, and venue insights like a pro',
    },
    {
      icon: <FiUsers className='text-cyan-400' />,
      title: 'Player Intelligence',
      description: 'Build a database of player tendencies and game dynamics for every venue',
    },
  ];

  return (
    <>
      <div className='card bg-gradient-to-br from-slate-800 to-slate-700 shadow-xl border border-slate-600 mb-8'>
        <div className='card-body text-center'>
          <div className='mb-4'>
            <div className='w-16 h-16 bg-blue-500 bg-opacity-20 rounded-full flex items-center justify-center mx-auto mb-4'>
              <FiBarChart2 className='text-3xl text-blue-400' />
            </div>
            <div className='bg-red-500 bg-opacity-20 text-red-400 text-sm font-semibold px-3 py-1 rounded-full border border-red-500 mb-3 inline-block'>
              🔥 10+ players already joined this week!
            </div>
            <h2 className='card-title text-2xl text-white justify-center mb-2'>
              Level Up Your Poker Journey
            </h2>
            <p className='text-gray-300 text-lg mb-6'>
              Join our growing community of{' '}
              <span className='text-green-400 font-semibold'>
                active players
              </span>{' '}
              to track your results and enhance your poker experience
            </p>
          </div>

          <div className='grid md:grid-cols-2 gap-4 mb-8'>
            {features.map((feature, index) => (
              <div
                key={index}
                className='flex items-start space-x-3 p-3 bg-slate-700 bg-opacity-50 rounded-lg'>
                <div className='text-2xl mt-1'>{feature.icon}</div>
                <div className='text-left'>
                  <h3 className='font-semibold text-white text-sm'>
                    {feature.title}
                  </h3>
                  <p className='text-gray-400 text-xs'>{feature.description}</p>
                </div>
              </div>
            ))}
          </div>

          <div className='flex flex-col items-center justify-center'>
            <button
              onClick={() => setIsAuthModalOpen(true)}
              className='btn btn-primary btn-lg group'>
              Get Started - It's Free
              <FiArrowRight className='ml-2 group-hover:translate-x-1 transition-transform' />
            </button>
            <p className='text-xs text-gray-400 mt-3'>
              ✨ No credit card required • Takes less than 30 seconds
            </p>
            <p className='text-xs text-green-400 mt-1 font-semibold'>
              🚀 Join one of the fastest growing poker communities in Australia!
            </p>
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

export default SignupPromotionCard;
