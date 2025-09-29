import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

interface JoinGameProps {
  onBack: () => void;
  onJoinSuccess: () => void;
}

const JoinGame: React.FC<JoinGameProps> = ({ onBack, onJoinSuccess }) => {
  const { state, joinRoom, clearError } = useGame();
  const [password, setPassword] = useState('');
  const [playerName, setPlayerName] = useState('');
  const [isJoining, setIsJoining] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password.trim() || !playerName.trim()) {
      return;
    }

    setIsJoining(true);
    clearError();
    
    try {
      await joinRoom(password.trim().toUpperCase(), playerName.trim());
      if (!state.error) {
        onJoinSuccess();
      }
    } finally {
      setIsJoining(false);
    }
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Auto-uppercase and limit to 6 characters
    const value = e.target.value.toUpperCase().slice(0, 6);
    setPassword(value);
  };

  const handlePlayerNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    // Limit to 20 characters
    const value = e.target.value.slice(0, 20);
    setPlayerName(value);
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 werewolf-pattern">
      <div className="werewolf-card max-w-md w-full p-8">
        {/* Back button */}
        <button
          onClick={onBack}
          className="flex items-center text-werewolf-moon/70 hover:text-werewolf-moon mb-6 transition-colors"
        >
          <span className="mr-2">←</span>
          Back to Menu
        </button>

        {/* Title */}
        <div className="text-center mb-8">
          <div className="moon-glow mb-4 mx-auto w-16 h-16 bg-werewolf-moon rounded-full opacity-60"></div>
          <h2 className="text-3xl font-bold text-werewolf-moon mb-2">Join Game</h2>
          <p className="text-werewolf-moon/70">Enter the game password to join</p>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="error-message mb-6">
            <p>❌ {state.error}</p>
          </div>
        )}

        {/* Join Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <label htmlFor="password" className="block text-werewolf-moon font-medium mb-2">
              Game Password
            </label>
            <input
              type="text"
              id="password"
              value={password}
              onChange={handlePasswordChange}
              placeholder="Enter 6-letter code"
              className="werewolf-input w-full text-center text-xl font-mono tracking-widest"
              maxLength={6}
              required
              disabled={isJoining}
            />
            <p className="text-werewolf-moon/50 text-sm mt-1">
              {password.length}/6 characters
            </p>
          </div>

          <div>
            <label htmlFor="playerName" className="block text-werewolf-moon font-medium mb-2">
              Your Name
            </label>
            <input
              type="text"
              id="playerName"
              value={playerName}
              onChange={handlePlayerNameChange}
              placeholder="Enter your player name"
              className="werewolf-input w-full"
              maxLength={20}
              required
              disabled={isJoining}
            />
            <p className="text-werewolf-moon/50 text-sm mt-1">
              {playerName.length}/20 characters
            </p>
          </div>

          <button
            type="submit"
            disabled={!password.trim() || !playerName.trim() || isJoining || password.length < 6}
            className="werewolf-button w-full text-lg py-4"
          >
            {isJoining ? (
              <div className="flex items-center justify-center">
                <div className="animate-spin w-5 h-5 border-2 border-werewolf-moon border-t-transparent rounded-full mr-2"></div>
                Joining Game...
              </div>
            ) : (
              <>🚪 Join Game</>
            )}
          </button>
        </form>

        {/* Instructions */}
        <div className="mt-8 p-4 bg-werewolf-dark/30 rounded-lg">
          <h4 className="text-werewolf-moon font-medium mb-2">💡 Instructions:</h4>
          <ul className="text-werewolf-moon/80 text-sm space-y-1">
            <li>• Get the game password from the host</li>
            <li>• Choose a unique player name</li>
            <li>• Wait in the lobby for the game to start</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default JoinGame;
