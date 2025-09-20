import React, { useState } from 'react';
import { FiShare2, FiCopy, FiX, FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const ShareStats = ({ stats, userDisplayName, isOpen, onClose }) => {
  const [shareFormat, setShareFormat] = useState('summary'); // summary, detailed, achievement

  if (!isOpen) return null;

  const generateShareText = (format) => {
    const formatNumber = (num) => {
      if (num === 'N/A') return 'N/A';
      return typeof num === 'number' ? num.toLocaleString() : num;
    };

    const formatCurrency = (amount) => {
      if (amount === 'N/A') return 'N/A';
      const num = typeof amount === 'string' ? parseFloat(amount.replace('$', '')) : amount;
      return num >= 0 ? `$${num.toFixed(2)}` : `-$${Math.abs(num).toFixed(2)}`;
    };

    const isProfitable = stats.totalProfit > 0;
    const winRateText = stats.winRate !== 'N/A' ? `${stats.winRate}%` : 'N/A';

    switch (format) {
      case 'summary':
        return `🎰 My Poker Stats 🎰\n\n` +
               `📊 ${stats.totalGames} games played\n` +
               `🎯 ${winRateText} win rate\n` +
               `💰 ${formatCurrency(stats.totalProfit)} total profit\n` +
               `🚀 ${formatCurrency(stats.biggestWin)} biggest win\n\n` +
               `Track your poker journey at ${window.location.origin}`;

      case 'detailed':
        return `🎰 ${userDisplayName}'s Poker Journey 🎰\n\n` +
               `📈 PERFORMANCE STATS:\n` +
               `• Games Played: ${formatNumber(stats.totalGames)}\n` +
               `• Win Rate: ${winRateText}\n` +
               `• Total Winnings: ${formatCurrency(stats.totalWinnings)}\n` +
               `• Total Profit: ${formatCurrency(stats.totalProfit)}\n` +
               `• Average Buy-in: ${formatCurrency(stats.averageBuyIn)}\n\n` +
               `🏆 ACHIEVEMENTS:\n` +
               `• Biggest Win: ${formatCurrency(stats.biggestWin)}\n` +
               `• Best Position: ${stats.bestPosition}\n` +
               `• Average Position: ${stats.averagePosition}\n\n` +
               `Join me at ${window.location.origin}`;

      case 'achievement':
        const achievement = getAchievement();
        return `🏆 POKER ACHIEVEMENT UNLOCKED! 🏆\n\n` +
               `${achievement.emoji} ${achievement.text}\n\n` +
               `My Stats:\n` +
               `🎯 ${winRateText} win rate over ${stats.totalGames} games\n` +
               `💰 ${formatCurrency(stats.totalProfit)} total profit\n\n` +
               `Track your poker progress at ${window.location.origin}`;

      default:
        return generateShareText('summary');
    }
  };

  const getAchievement = () => {
    const achievements = [];

    // Win rate achievements
    if (stats.winRate >= 70) achievements.push({ emoji: '🔥', text: 'Crushing the competition with 70%+ win rate!' });
    else if (stats.winRate >= 60) achievements.push({ emoji: '🎯', text: 'Maintaining a solid 60%+ win rate!' });
    else if (stats.winRate >= 50) achievements.push({ emoji: '📈', text: 'Staying profitable with 50%+ win rate!' });

    // Game count achievements
    if (stats.totalGames >= 100) achievements.push({ emoji: '💯', text: 'Centurion - 100+ games played!' });
    else if (stats.totalGames >= 50) achievements.push({ emoji: '⭐', text: 'Half Century - 50+ games completed!' });
    else if (stats.totalGames >= 25) achievements.push({ emoji: '🎲', text: 'Quarter Century - 25+ games under the belt!' });

    // Profit achievements
    if (stats.totalProfit >= 1000) achievements.push({ emoji: '💎', text: 'Four-figure profit achieved!' });
    else if (stats.totalProfit >= 500) achievements.push({ emoji: '💰', text: 'Profitable player with $500+ earnings!' });
    else if (stats.totalProfit > 0) achievements.push({ emoji: '📊', text: 'In the green - profitable poker player!' });

    // Biggest win achievements
    if (stats.biggestWin >= 500) achievements.push({ emoji: '🚀', text: 'Massive $500+ single session win!' });
    else if (stats.biggestWin >= 200) achievements.push({ emoji: '🎆', text: 'Big win - $200+ in a single session!' });

    return achievements.length > 0 ? achievements[0] : { emoji: '🎰', text: 'Building my poker legacy!' };
  };

  const shareText = generateShareText(shareFormat);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Stats copied to clipboard!');
    } catch (err) {
      toast.error('Failed to copy to clipboard');
    }
  };

  const shareToX = () => {
    const url = `https://twitter.com/intent/tweet?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToFacebook = () => {
    const url = `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(window.location.origin)}&quote=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareToWhatsApp = () => {
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(shareText)}`;
    window.open(url, '_blank');
  };

  const shareViaWebShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'My Poker Stats',
          text: shareText,
          url: window.location.origin
        });
      } catch (err) {
        if (err.name !== 'AbortError') {
          toast.error('Failed to share');
        }
      }
    } else {
      copyToClipboard();
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FiShare2 className="mr-2" />
            Share Your Stats
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
          >
            <FiX />
          </button>
        </div>

        {/* Format Selection */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-3">
            Choose Format:
          </label>
          <div className="grid grid-cols-1 gap-2">
            <button
              onClick={() => setShareFormat('summary')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                shareFormat === 'summary'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-medium">📊 Quick Summary</div>
              <div className="text-sm text-gray-400">Key stats in a compact format</div>
            </button>
            <button
              onClick={() => setShareFormat('detailed')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                shareFormat === 'detailed'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-medium">📈 Detailed Report</div>
              <div className="text-sm text-gray-400">Complete performance breakdown</div>
            </button>
            <button
              onClick={() => setShareFormat('achievement')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                shareFormat === 'achievement'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
            >
              <div className="font-medium">🏆 Achievement Highlight</div>
              <div className="text-sm text-gray-400">Showcase your best accomplishment</div>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preview:
          </label>
          <div className="bg-gray-700 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-line border">
            {shareText}
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareViaWebShare}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <FiShare2 />
              {navigator.share ? 'Share' : 'Copy'}
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <FiCopy />
              Copy Text
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={shareToX}
              className="flex items-center justify-center gap-2 bg-black hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <RiTwitterXLine />
            </button>
            <button
              onClick={shareToFacebook}
              className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <FiFacebook />
              Facebook
            </button>
            <button
              onClick={shareToWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
            >
              <FiMessageCircle />
              WhatsApp
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ShareStats;