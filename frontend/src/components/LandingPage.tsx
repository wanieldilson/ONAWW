import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';

interface LandingPageProps {
  onStartGame: () => void;
  onJoinGame: () => void;
}

const LandingPage: React.FC<LandingPageProps> = ({ onStartGame, onJoinGame }) => {
  const { state, connectToServer, clearError } = useGame();
  const [isConnecting, setIsConnecting] = useState(false);

  useEffect(() => {
    // Auto-connect when component mounts
    if (!state.isConnected) {
      handleConnect();
    }
  }, []);

  useEffect(() => {
    // Clear any previous errors when component mounts
    clearError();
  }, [clearError]);

  const handleConnect = async () => {
    setIsConnecting(true);
    try {
      await connectToServer();
    } finally {
      setIsConnecting(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 werewolf-pattern">
      <div className="werewolf-card max-w-2xl w-full p-8 text-center">
        {/* Moon decoration */}
        <div className="moon-glow mb-8 mx-auto w-24 h-24 bg-werewolf-moon rounded-full opacity-80"></div>
        
        {/* Title */}
        <h1 className="werewolf-title mb-4">
          One Night a Werewolf
        </h1>
        
        {/* Subtitle */}
        <p className="werewolf-subtitle mb-8">
          A thrilling game of deception and deduction.<br />
          Can the village survive the night?
        </p>

        {/* Game Description */}
        <div className="bg-werewolf-dark/30 rounded-lg p-6 mb-8 text-left">
          <h3 className="text-xl font-semibold text-werewolf-moon mb-4">How to Play:</h3>
          <ul className="text-werewolf-moon/90 space-y-2">
            <li className="flex items-start">
              <span className="text-werewolf-blood mr-2">🌙</span>
              One player creates a game and shares the password with others
            </li>
            <li className="flex items-start">
              <span className="text-werewolf-blood mr-2">👥</span>
              Players join the lobby and wait for the facilitator to start
            </li>
            <li className="flex items-start">
              <span className="text-werewolf-blood mr-2">🎭</span>
              Each player is secretly assigned a role: Villager or Werewolf
            </li>
            <li className="flex items-start">
              <span className="text-werewolf-blood mr-2">🗣️</span>
              Use your wits to identify the werewolves before it's too late!
            </li>
          </ul>
        </div>

        {/* Connection Status */}
        {!state.isConnected && !isConnecting && (
          <div className="error-message mb-6">
            <p>⚠️ Not connected to server</p>
            <button
              onClick={handleConnect}
              className="werewolf-button mt-2 text-sm py-2 px-4"
            >
              Try to Connect
            </button>
          </div>
        )}

        {isConnecting && (
          <div className="text-werewolf-moon/70 mb-6">
            <div className="animate-spin w-8 h-8 border-4 border-werewolf-blood border-t-transparent rounded-full mx-auto mb-2"></div>
            <p>Connecting to server...</p>
          </div>
        )}

        {/* Error Display */}
        {state.error && (
          <div className="error-message mb-6">
            <p>❌ {state.error}</p>
            <button
              onClick={clearError}
              className="werewolf-button mt-2 text-sm py-1 px-3"
            >
              Dismiss
            </button>
          </div>
        )}

        {/* Action Buttons */}
        <div className="space-y-4">
          <button
            onClick={onStartGame}
            disabled={!state.isConnected || isConnecting}
            className="werewolf-button w-full text-lg py-4"
          >
            🎮 Start New Game
          </button>
          
          <button
            onClick={onJoinGame}
            disabled={!state.isConnected || isConnecting}
            className="werewolf-button w-full text-lg py-4 
                     bg-gradient-to-r from-werewolf-forest to-green-700 
                     hover:from-green-700 hover:to-werewolf-forest
                     shadow-werewolf-forest/30"
          >
            🚪 Join Existing Game
          </button>
        </div>

        {/* Footer */}
        <div className="mt-8 pt-6 border-t border-werewolf-moon/20">
          <p className="text-werewolf-moon/60 text-sm">
            Built with TypeScript, React, and Socket.IO<br />
            <span className="text-werewolf-blood">🐺</span> May the best player survive the night!
          </p>
        </div>
      </div>
    </div>
  );
};

export default LandingPage;
