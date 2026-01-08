import React, { useState } from 'react';
import { FiShare2, FiCopy, FiX, FiFacebook, FiMessageCircle } from 'react-icons/fi';
import { RiTwitterXLine } from 'react-icons/ri';
import toast from 'react-hot-toast';

const GameShareMenu = ({ game, isOpen, onClose }) => {
  const [shareFormat, setShareFormat] = useState('summary');

  if (!isOpen) return null;

  const generateShareText = (format) => {
    const buyInText = game.buy_in ? `$${game.buy_in}` : 'TBA';
    const regoTime = game.rego_time || 'TBA';
    const gameTime = game.game_time || 'TBA';
    const lateRego = game.late_rego ? ` (Late rego: ${game.late_rego})` : '';

    switch (format) {
      case 'summary':
        return `🎰 ${game.competition || 'Poker Game'}\n` +
               `📍 ${game.venue}\n` +
               `📅 ${game.day} @ ${gameTime}\n` +
               `💰 Buy-in: ${buyInText}\n\n` +
               `Find more games at ${window.location.origin}`;

      case 'detailed':
        let detailedText = `🎰 ${game.competition || 'Poker Game'}\n\n` +
               `📍 VENUE: ${game.venue}\n` +
               `📅 DAY: ${game.day}\n` +
               `⏰ REGISTRATION: ${regoTime}\n` +
               `🎲 GAME START: ${gameTime}${lateRego}\n` +
               `💰 BUY-IN: ${buyInText}\n`;

        if (game.re_buy) detailedText += `🔄 RE-BUY: $${game.re_buy}\n`;
        if (game.re_entry) detailedText += `↩️ RE-ENTRY: $${game.re_entry}\n`;
        if (game.addons) detailedText += `➕ ADD-ONS: $${game.addons}\n`;
        if (game.bounty) detailedText += `🎯 BOUNTY: $${game.bounty}\n`;
        if (game.starting_stack) detailedText += `🎲 STARTING STACK: ${game.starting_stack}\n`;
        if (game.guarantee) detailedText += `💎 GUARANTEE: $${game.guarantee}\n`;
        if (game.prize_pool) detailedText += `🏆 PRIZE POOL: $${game.prize_pool}\n`;

        detailedText += `\nJoin us! ${window.location.origin}`;
        return detailedText;

      case 'venue':
        return `🏢 Playing at ${game.venue}\n\n` +
               `🎰 ${game.competition || 'Poker Game'}\n` +
               `📅 ${game.day} @ ${gameTime}\n` +
               `💰 ${buyInText} buy-in\n\n` +
               `Who's in? ${window.location.origin}`;

      default:
        return generateShareText('summary');
    }
  };

  const shareText = generateShareText(shareFormat);

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(shareText);
      toast.success('Game details copied to clipboard!');
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
          title: `${game.competition} - ${game.venue}`,
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
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50" onClick={onClose}>
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg max-h-[90vh] overflow-y-auto" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center mb-6">
          <h2 className="text-2xl font-bold text-white flex items-center">
            <FiShare2 className="mr-2" />
            Share Game
          </h2>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white text-2xl"
            aria-label="Close share menu"
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
              aria-pressed={shareFormat === 'summary'}
            >
              <div className="font-medium">🎯 Quick Summary</div>
              <div className="text-sm text-gray-400">Essential game details</div>
            </button>
            <button
              onClick={() => setShareFormat('detailed')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                shareFormat === 'detailed'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
              aria-pressed={shareFormat === 'detailed'}
            >
              <div className="font-medium">📋 Full Details</div>
              <div className="text-sm text-gray-400">Complete game information</div>
            </button>
            <button
              onClick={() => setShareFormat('venue')}
              className={`p-3 rounded-lg border text-left transition-colors ${
                shareFormat === 'venue'
                  ? 'border-blue-500 bg-blue-500 bg-opacity-20 text-white'
                  : 'border-gray-600 text-gray-300 hover:border-gray-500'
              }`}
              aria-pressed={shareFormat === 'venue'}
            >
              <div className="font-medium">🏢 Venue Focused</div>
              <div className="text-sm text-gray-400">Highlight the location</div>
            </button>
          </div>
        </div>

        {/* Preview */}
        <div className="mb-6">
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Preview:
          </label>
          <div className="bg-gray-700 rounded-lg p-4 text-sm text-gray-300 whitespace-pre-line border border-gray-600">
            {shareText}
          </div>
        </div>

        {/* Share Options */}
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={shareViaWebShare}
              className="flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white py-3 px-4 rounded-lg transition-colors"
              aria-label="Share game"
            >
              <FiShare2 />
              {navigator.share ? 'Share' : 'Copy'}
            </button>
            <button
              onClick={copyToClipboard}
              className="flex items-center justify-center gap-2 bg-gray-600 hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
              aria-label="Copy to clipboard"
            >
              <FiCopy />
              Copy Text
            </button>
          </div>

          <div className="grid grid-cols-3 gap-3">
            <button
              onClick={shareToX}
              className="flex items-center justify-center gap-2 bg-black hover:bg-gray-700 text-white py-3 px-4 rounded-lg transition-colors"
              aria-label="Share on X"
            >
              <RiTwitterXLine />
            </button>
            <button
              onClick={shareToFacebook}
              className="flex items-center justify-center gap-2 bg-blue-700 hover:bg-blue-800 text-white py-3 px-4 rounded-lg transition-colors"
              aria-label="Share on Facebook"
            >
              <FiFacebook />
            </button>
            <button
              onClick={shareToWhatsApp}
              className="flex items-center justify-center gap-2 bg-green-600 hover:bg-green-700 text-white py-3 px-4 rounded-lg transition-colors"
              aria-label="Share on WhatsApp"
            >
              <FiMessageCircle />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default GameShareMenu;
