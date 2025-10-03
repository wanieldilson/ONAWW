import React, { useState } from 'react';
import { useGame } from '../context/GameContext';

interface GameLobbyProps {
  onBack: () => void;
}

const GameLobby: React.FC<GameLobbyProps> = ({ onBack }) => {
  const { state, startGame, clearError, disconnect } = useGame();
  const [isStarting, setIsStarting] = useState(false);
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);

  const handleStartGame = async () => {
    if (!state.currentRoom?.players || state.currentRoom.players.length < 3) {
      return;
    }

    setIsStarting(true);
    clearError();
    
    try {
      await startGame();
    } finally {
      setIsStarting(false);
    }
  };

  const handleLeave = () => {
    setShowLeaveConfirm(false);
    disconnect();
    onBack();
  };

  const isFacilitator = state.currentRoom?.isPlayerFacilitator;
  const playerCount = state.currentRoom?.players?.length || 0;
  const minPlayers = 4;
  const canStart = isFacilitator && playerCount >= minPlayers && !state.gameStarted;

  return (
    <div className="min-h-screen flex items-center justify-center p-4 werewolf-pattern">
      <div className="werewolf-card max-w-2xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="moon-glow mb-4 mx-auto w-16 h-16 bg-werewolf-moon rounded-full opacity-80"></div>
          <h2 className="text-3xl font-bold text-werewolf-moon mb-2">Game Lobby</h2>
          
          {/* Game Info */}
          <div className="bg-werewolf-dark/40 rounded-lg p-4 mb-4">
            <p className="text-werewolf-moon/80 mb-2">Game Password:</p>
            <div className="text-2xl font-mono font-bold text-werewolf-moon tracking-widest">
              {state.currentRoom?.password}
            </div>
          </div>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="error-message mb-6">
            <p>❌ {state.error}</p>
          </div>
        )}

        {/* Game Status */}
        {state.gameStarted ? (
          <div className="success-message mb-6 text-center">
            <p>🎮 Game has started! Check your role above.</p>
          </div>
        ) : (
          <div className="text-center mb-6">
            <p className="text-werewolf-moon/80">
              {isFacilitator 
                ? "You are the facilitator. Start the game when everyone is ready!"
                : "Waiting for the facilitator to start the game..."
              }
            </p>
          </div>
        )}

        {/* Players List */}
        <div className="bg-werewolf-dark/30 rounded-lg p-6 mb-6">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-semibold text-werewolf-moon">
              Players ({playerCount})
            </h3>
            <span className={`px-3 py-1 rounded-full text-sm font-medium ${
              playerCount >= minPlayers 
                ? 'bg-green-900/30 text-green-200 border border-green-500/50' 
                : 'bg-yellow-900/30 text-yellow-200 border border-yellow-500/50'
            }`}>
              {playerCount >= minPlayers ? 'Ready to play!' : `Need ${minPlayers - playerCount} more`}
            </span>
          </div>

          <div className="space-y-2 max-h-60 overflow-y-auto">
            {state.currentRoom?.players?.map((player, index) => (
              <div key={player.id} className="player-card flex items-center justify-between">
                <div className="flex items-center">
                  <span className="text-werewolf-moon font-medium">{player.name}</span>
                  {state.currentRoom?.facilitatorId === player.id && (
                    <span className="facilitator-badge ml-2">Facilitator</span>
                  )}
                </div>
                <span className="text-werewolf-moon/60 text-sm">
                  {index === 0 ? '👑' : '🐺'}
                </span>
              </div>
            ))}
          </div>

          {playerCount === 0 && (
            <p className="text-werewolf-moon/60 text-center py-8">
              No players have joined yet...
            </p>
          )}
        </div>

        {/* Game Rules Reminder */}
        <div className="bg-werewolf-dark/30 rounded-lg p-4 mb-6">
          <h4 className="text-werewolf-moon font-medium mb-3">🎲 Quick Rules:</h4>
          <ul className="text-werewolf-moon/80 text-sm space-y-1">
            <li>• Minimum {minPlayers} players needed to start</li>
            <li>• Each player gets a secret role: Villager or Werewolf</li>
            <li>• Werewolves know each other, villagers don't</li>
            <li>• The facilitator guides the game but doesn't play</li>
            <li>• Work together to identify the werewolves!</li>
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
          {isFacilitator && !state.gameStarted && (
            <button
              onClick={handleStartGame}
              disabled={!canStart || isStarting}
              className="werewolf-button w-full text-lg py-4"
            >
              {isStarting ? (
                <div className="flex items-center justify-center">
                  <div className="animate-spin w-5 h-5 border-2 border-werewolf-moon border-t-transparent rounded-full mr-2"></div>
                  Starting Game...
                </div>
              ) : (
                <>🚀 Start Game ({playerCount}/{minPlayers})</>
              )}
            </button>
          )}

          <button
            onClick={() => setShowLeaveConfirm(true)}
            className="w-full py-3 px-6 rounded-lg border border-werewolf-moon/30 
                     text-werewolf-moon/80 hover:text-werewolf-moon 
                     hover:border-werewolf-moon/50 transition-colors"
          >
            🚪 Leave Game
          </button>
        </div>

        {/* Leave Confirmation Modal */}
        {showLeaveConfirm && (
          <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
            <div className="werewolf-card max-w-sm w-full p-6 text-center">
              <h3 className="text-xl font-bold text-werewolf-moon mb-4">Leave Game?</h3>
              <p className="text-werewolf-moon/80 mb-6">
                {isFacilitator 
                  ? "As the facilitator, leaving will close the game for all players."
                  : "Are you sure you want to leave this game?"
                }
              </p>
              <div className="flex gap-3">
                <button
                  onClick={() => setShowLeaveConfirm(false)}
                  className="flex-1 py-2 px-4 rounded-lg border border-werewolf-moon/30 
                           text-werewolf-moon/80 hover:text-werewolf-moon 
                           hover:border-werewolf-moon/50 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleLeave}
                  className="flex-1 werewolf-button py-2"
                >
                  Leave
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Player Role Display (shown after game starts) */}
        {state.gameStarted && (
          <div className="mt-6 text-center">
            <div className="werewolf-card p-6">
              <h3 className="text-2xl font-bold text-werewolf-moon mb-4">Your Role</h3>
              <div className={`text-4xl font-bold mb-2 ${
                isFacilitator ? 'text-yellow-400' : 
                state.playerRole === 'werewolf' ? 'role-werewolf' : 'role-villager'
              }`}>
                {isFacilitator ? '👑 FACILITATOR' :
                 state.playerRole === 'werewolf' ? '🐺 WEREWOLF' : '👤 VILLAGER'}
              </div>
              <p className="text-werewolf-moon/80 text-sm">
                {isFacilitator 
                  ? "You are the facilitator! Control the game phases and guide the players."
                  : state.playerRole === 'werewolf' 
                    ? "You are a werewolf! Find your allies and deceive the villagers."
                    : "You are a villager! Work with others to identify the werewolves."
                }
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default GameLobby;
