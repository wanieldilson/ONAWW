import React, { useState, useEffect } from 'react';
import { useGame } from '../context/GameContext';
import { socketService } from '../services/socketService';

interface GameBoardProps {
  onBack: () => void;
}

interface WerewolfMessage {
  playerId: string;
  playerName: string;
  message: string;
  timestamp: string;
}

const GameBoard: React.FC<GameBoardProps> = ({ onBack }) => {
  const { state, changePhase, sendWerewolfMessage, killPlayer, clearError, disconnect } = useGame();
  const [showLeaveConfirm, setShowLeaveConfirm] = useState(false);
  const [werewolfMessages, setWerewolfMessages] = useState<WerewolfMessage[]>([]);
  const [werewolfInput, setWerewolfInput] = useState('');
  const [phaseMessage, setPhaseMessage] = useState('');

  const isFacilitator = state.currentRoom?.isPlayerFacilitator;
  const isWerewolf = state.playerRole === 'werewolf' && !isFacilitator;
  const canSeeWerewolfChat = isWerewolf || isFacilitator;
  const canSendWerewolfMessages = isWerewolf && !isFacilitator;
  const isNight = state.gamePhase === 'night';
  const isDay = state.gamePhase === 'day';

  // Listen for werewolf messages
  useEffect(() => {
    const handleWerewolfMessage = (data: WerewolfMessage) => {
      setWerewolfMessages(prev => [...prev, data]);
    };

    const handlePhaseChanged = (data: { phase: string; message: string }) => {
      setPhaseMessage(data.message);
      // Clear werewolf messages when switching to day
      if (data.phase === 'day') {
        setWerewolfMessages([]);
      }
    };

    socketService.onWerewolfMessage(handleWerewolfMessage);
    socketService.onPhaseChanged(handlePhaseChanged);

    return () => {
      // Note: We don't remove all listeners here as they're managed by GameContext
    };
  }, []);

  const handlePhaseChange = async (newPhase: 'day' | 'night') => {
    clearError();
    await changePhase(newPhase);
  };

  const handleSendWerewolfMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!werewolfInput.trim()) return;

    await sendWerewolfMessage(werewolfInput);
    setWerewolfInput('');
  };

  const handleKillPlayer = async (playerId: string) => {
    clearError();
    await killPlayer(playerId);
  };

  const handleLeave = () => {
    setShowLeaveConfirm(false);
    disconnect();
    onBack();
  };

  const getPhaseIcon = () => {
    return isDay ? '☀️' : '🌙';
  };

  const getPhaseColor = () => {
    return isDay ? 'from-yellow-600 to-orange-600' : 'from-blue-900 to-purple-900';
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 werewolf-pattern">
      <div className="werewolf-card max-w-4xl w-full p-8">
        {/* Header */}
        <div className="text-center mb-8">
          <div className={`moon-glow mb-4 mx-auto w-20 h-20 bg-gradient-to-br ${getPhaseColor()} rounded-full opacity-80 flex items-center justify-center`}>
            <span className="text-3xl">{getPhaseIcon()}</span>
          </div>
          <h2 className="text-3xl font-bold text-werewolf-moon mb-2">
            {isDay ? 'Daytime Discussion' : 'Nighttime'}
          </h2>
          <p className="text-werewolf-moon/80">
            {phaseMessage || (isDay ? 'Discuss and find the werewolves!' : 'Werewolves, choose your target...')}
          </p>
        </div>

        {/* Error Display */}
        {state.error && (
          <div className="error-message mb-6">
            <p>❌ {state.error}</p>
          </div>
        )}

        {/* Game Info */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          {/* Player Role/Status */}
          <div className="bg-werewolf-dark/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-werewolf-moon mb-4">Your Status</h3>
            {/* Show player's own name (except facilitator) */}
            {!isFacilitator && (
              <div className="text-lg text-werewolf-moon/90 mb-3">
                Playing as: <span className="font-semibold text-werewolf-moon">{state.currentPlayer?.name}</span>
              </div>
            )}
            
            {/* Check if current player is dead */}
            {!isFacilitator && state.currentPlayer?.isDead ? (
              <div className="text-center">
                <div className="text-6xl mb-4">💀</div>
                <div className="text-2xl font-bold text-red-400 mb-2">You have been killed</div>
                <p className="text-werewolf-moon/80 text-sm">
                  You can no longer participate in the game, but you can observe.
                </p>
              </div>
            ) : (
              <div>
                <div className={`text-3xl font-bold mb-2 ${
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
                      ? "You are a werewolf! Work with other werewolves to eliminate villagers."
                      : "You are a villager! Work together to identify and eliminate the werewolves."
                  }
                </p>
              </div>
            )}
          </div>

          {/* Players List */}
          <div className="bg-werewolf-dark/30 rounded-lg p-6">
            <h3 className="text-xl font-semibold text-werewolf-moon mb-4">
              Players ({state.currentRoom?.players?.length || 0})
            </h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {state.currentRoom?.players?.map((player) => (
                <div key={player.id} className={`player-card flex items-center justify-between ${
                  player.isDead ? 'opacity-60 bg-red-900/10' : ''
                }`}>
                  <div className="flex items-center">
                    <span className={`font-medium ${
                      player.isDead ? 'text-red-400 line-through' : 'text-werewolf-moon'
                    }`}>
                      {player.isDead && '💀 '}{player.name}
                    </span>
                    {state.currentRoom?.facilitatorId === player.id && (
                      <span className="facilitator-badge ml-2">Facilitator</span>
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-werewolf-moon/60 text-sm">
                      {(isWerewolf || isFacilitator) && player.role === 'werewolf' ? '🐺' : 
                       isFacilitator && player.role === 'villager' ? '👤' : '❓'}
                    </span>
                    {/* Kill/Revive button for facilitator */}
                    {isFacilitator && player.id !== state.currentRoom?.facilitatorId && (
                      <button
                        onClick={() => handleKillPlayer(player.id)}
                        className={`px-2 py-1 text-xs rounded transition-colors ${
                          player.isDead 
                            ? 'bg-green-600 hover:bg-green-700 text-white' 
                            : 'bg-red-600 hover:bg-red-700 text-white'
                        }`}
                        title={player.isDead ? 'Revive player' : 'Kill player'}
                      >
                        {player.isDead ? '🔄' : '💀'}
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Werewolf Chat (visible to werewolves and facilitator during night) */}
        {canSeeWerewolfChat && isNight && (
          <div className="bg-red-900/20 border border-red-500/50 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-red-200 mb-4">
              🐺 Werewolf Chat {isFacilitator && <span className="text-yellow-400 text-sm">(Observer Mode)</span>}
            </h3>
            
            {/* Messages */}
            <div className="bg-black/30 rounded-lg p-4 mb-4 h-40 overflow-y-auto">
              {werewolfMessages.length === 0 ? (
                <p className="text-red-200/60 text-center py-4">
                  {isFacilitator 
                    ? "No werewolf messages yet. You can observe their coordination here."
                    : "No messages yet. Coordinate with your fellow werewolves!"
                  }
                </p>
              ) : (
                <div className="space-y-2">
                  {werewolfMessages.map((msg, index) => (
                    <div key={index} className="text-red-200">
                      <span className="font-medium">{msg.playerName}:</span>{' '}
                      <span className="text-red-200/90">{msg.message}</span>
                      <span className="text-red-200/60 text-xs ml-2">
                        {new Date(msg.timestamp).toLocaleTimeString()}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Message Input (only for werewolves, not facilitator) */}
            {canSendWerewolfMessages ? (
              <form onSubmit={handleSendWerewolfMessage} className="flex gap-2">
                <input
                  type="text"
                  value={werewolfInput}
                  onChange={(e) => setWerewolfInput(e.target.value)}
                  placeholder="Send a message to other werewolves..."
                  className="flex-1 px-4 py-2 rounded-lg bg-black/30 border border-red-500/30 
                           text-red-200 placeholder-red-200/50 focus:border-red-500/70 
                           focus:outline-none focus:ring-2 focus:ring-red-500/30"
                />
                <button
                  type="submit"
                  disabled={!werewolfInput.trim()}
                  className="px-6 py-2 bg-red-600 hover:bg-red-700 disabled:bg-red-600/50 
                           disabled:cursor-not-allowed rounded-lg text-white font-medium 
                           transition-colors"
                >
                  Send
                </button>
              </form>
            ) : (
              <div className="text-center py-3 text-yellow-200/80 text-sm bg-yellow-900/20 rounded-lg border border-yellow-500/30">
                👑 As the facilitator, you can observe werewolf coordination but cannot participate in their chat.
              </div>
            )}
          </div>
        )}

        {/* Phase Controls (Facilitator only) */}
        {isFacilitator && (
          <div className="bg-werewolf-dark/30 rounded-lg p-6 mb-6">
            <h3 className="text-xl font-semibold text-werewolf-moon mb-4">🎮 Game Controls</h3>
            <div className="flex gap-4">
              <button
                onClick={() => handlePhaseChange('day')}
                disabled={isDay}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  isDay 
                    ? 'bg-yellow-600/20 text-yellow-200/50 cursor-not-allowed' 
                    : 'bg-yellow-600 hover:bg-yellow-700 text-white'
                }`}
              >
                ☀️ Change to Day
              </button>
              <button
                onClick={() => handlePhaseChange('night')}
                disabled={isNight}
                className={`flex-1 py-3 px-6 rounded-lg font-medium transition-colors ${
                  isNight 
                    ? 'bg-blue-600/20 text-blue-200/50 cursor-not-allowed' 
                    : 'bg-blue-600 hover:bg-blue-700 text-white'
                }`}
              >
                🌙 Change to Night
              </button>
            </div>
          </div>
        )}

        {/* Game Instructions */}
        <div className="bg-werewolf-dark/30 rounded-lg p-4 mb-6">
          <h4 className="text-werewolf-moon font-medium mb-3">
            {isDay ? '☀️ Day Phase:' : '🌙 Night Phase:'}
          </h4>
          <ul className="text-werewolf-moon/80 text-sm space-y-1">
            {isDay ? (
              <>
                <li>• All players can discuss and share information</li>
                <li>• Try to identify who the werewolves are</li>
                <li>• Vote to eliminate suspected werewolves</li>
              </>
            ) : (
              <>
                <li>• Werewolves can communicate privately</li>
                <li>• Werewolves choose their target for elimination</li>
                <li>• Villagers should remain quiet</li>
              </>
            )}
          </ul>
        </div>

        {/* Action Buttons */}
        <div className="space-y-4">
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
      </div>
    </div>
  );
};

export default GameBoard;
