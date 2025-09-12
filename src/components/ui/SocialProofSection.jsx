import React from 'react';
import { FiStar, FiUsers, FiTrendingUp, FiActivity } from 'react-icons/fi';

const SocialProofSection = () => {

  const stats = [
    {
      icon: <FiUsers className="text-blue-400 text-2xl" />,
      value: "Many",
      label: "Active Members",
      subtext: "And growing daily!"
    },
    {
      icon: <FiActivity className="text-green-400 text-2xl" />,
      value: "Hundreds",
      label: "Games Tracked",
      subtext: "This month"
    },
    {
      icon: <FiTrendingUp className="text-purple-400 text-2xl" />,
      value: "Growing",
      label: "Results Logged",
      subtext: "Total winnings tracked"
    }
  ];

  return (
    <div className="py-16 bg-gradient-to-b from-slate-900 to-slate-800">
      <div className="max-w-6xl mx-auto px-4">
        {/* Stats Section */}
        <div className="text-center mb-16">
          <h2 className="text-3xl md:text-4xl font-bold text-white mb-4">
            Join the Community
          </h2>
          <p className="text-xl text-gray-300 mb-8">
            Built for poker players, by poker players
          </p>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 max-w-4xl mx-auto">
            {stats.map((stat, index) => (
              <div key={index} className="bg-slate-700 bg-opacity-50 rounded-xl p-6 border border-slate-600 backdrop-blur-sm hover:bg-opacity-70 transition-all duration-200">
                <div className="flex items-center justify-center mb-3">
                  {stat.icon}
                </div>
                <div className="text-3xl font-bold text-white mb-1">{stat.value}</div>
                <div className="text-lg text-gray-300 font-semibold mb-1">{stat.label}</div>
                <div className="text-sm text-gray-400">{stat.subtext}</div>
              </div>
            ))}
          </div>
        </div>


        {/* Recent Activity */}
        <div className="mt-12 text-center">
          <div className="bg-slate-700 bg-opacity-30 rounded-xl p-6 max-w-2xl mx-auto border border-slate-600">
            <div className="flex items-center justify-center mb-3">
              <div className="w-3 h-3 bg-green-400 rounded-full animate-pulse mr-2"></div>
              <span className="text-green-400 font-semibold">Live Activity</span>
            </div>
            <div className="text-sm text-gray-300 space-y-1">
              <p>🔥 2 new players joined today</p>
              <p>📈 20+ games updated this month</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default SocialProofSection;