import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

interface GamePasswordProps {
  onContinue: () => void;
  onBack: () => void;
}

const GamePassword: React.FC<GamePasswordProps> = ({ onContinue, onBack }) => {
  const { state } = useGame();
  const [copied, setCopied] = useState(false);

  const copyToClipboard = async () => {
    if (state.currentRoom?.password) {
      try {
        await navigator.clipboard.writeText(state.currentRoom.password);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      } catch (err) {
        console.error('Failed to copy password:', err);
        // Fallback for browsers that don't support clipboard API
        const textArea = document.createElement('textarea');
        textArea.value = state.currentRoom.password;
        document.body.appendChild(textArea);
        textArea.select();
        document.execCommand('copy');
        document.body.removeChild(textArea);
        setCopied(true);
        setTimeout(() => setCopied(false), 2000);
      }
    }
  };

  const shareText = `Join my One Night a Werewolf game! Password: ${state.currentRoom?.password}`;

  const handleShare = async () => {
    if (navigator.share) {
      try {
        await navigator.share({
          title: 'One Night a Werewolf - Join My Game',
          text: shareText,
        });
      } catch (err) {
        console.error('Error sharing:', err);
      }
    } else {
      // Fallback to clipboard
      await copyToClipboard();
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 werewolf-pattern">
      <div className="werewolf-card max-w-md w-full p-8 text-center">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center text-werewolf-moon/70 hover:text-werewolf-moon mb-6 transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Menu
        </button>

        {/* Success indicator */}
        <div className="moon-glow mb-6 mx-auto w-20 h-20 bg-gradient-to-br from-green-400 to-green-600 rounded-full opacity-90 flex items-center justify-center">
          <span className="text-2xl">✓</span>
        </div>

        <h2 className="text-3xl font-bold text-werewolf-moon mb-2">Game Created!</h2>
        <p className="text-werewolf-moon/80 mb-8">Share this password with your friends</p>

        {/* Password Display */}
        <div className="bg-werewolf-dark/60 rounded-xl p-6 mb-6">
          <p className="text-werewolf-moon/80 mb-2">Game Password:</p>
          <div className="text-4xl font-mono font-bold text-werewolf-moon tracking-widest mb-4">
            {state.currentRoom?.password || 'LOADING...'}
          </div>
          
          <div className="flex gap-2">
            <button
              onClick={copyToClipboard}
              className="werewolf-button flex-1 py-2 text-sm"
            >
              {copied ? '✓ Copied!' : '📋 Copy Password'}
            </button>
            
            {navigator.share && (
              <button
                onClick={handleShare}
                className="werewolf-button flex-1 py-2 text-sm 
                         bg-gradient-to-r from-werewolf-forest to-green-700 
                         hover:from-green-700 hover:to-werewolf-forest
                         shadow-werewolf-forest/30"
              >
                📤 Share
              </button>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="bg-werewolf-dark/30 rounded-lg p-4 mb-6 text-left">
          <h4 className="text-werewolf-moon font-medium mb-3">📋 Next Steps:</h4>
          <ol className="text-werewolf-moon/90 text-sm space-y-2">
            <li className="flex items-start">
              <span className="text-werewolf-blood mr-2 font-bold">1.</span>
              Share this password with your friends
            </li>
            <li className="flex items-start">
              <span className="text-werewolf-blood mr-2 font-bold">2.</span>
              Wait for players to join the lobby
            </li>
            <li className="flex items-start">
              <span className="text-werewolf-blood mr-2 font-bold">3.</span>
              Start the game when everyone is ready
            </li>
          </ol>
        </div>

        {/* Continue Button */}
        <button
          onClick={onContinue}
          className="werewolf-button w-full text-lg py-4"
        >
          🚪 Enter Game Lobby
        </button>

        {/* Warning */}
        <div className="mt-6 p-3 bg-yellow-900/20 border border-yellow-500/50 rounded-lg">
          <p className="text-yellow-200 text-sm">
            <span className="font-semibold">⚠️ Important:</span> Keep this password safe! 
            Players need it to join your game.
          </p>
        </div>
      </div>
    </div>
  );
};

export default GamePassword;
