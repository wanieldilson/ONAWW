import { useState, useEffect } from 'react';
import { GameProvider, useGame } from './context/GameContext';
import LandingPage from './components/LandingPage';
import JoinGame from './components/JoinGame';
import GamePassword from './components/GamePassword';
import GameLobby from './components/GameLobby';
import GameBoard from './components/GameBoard';
import './index.css';

type AppState = 'landing' | 'join' | 'password' | 'lobby' | 'game';

function AppContent() {
  const [currentView, setCurrentView] = useState<AppState>('landing');
  const { state, createRoom, clearError } = useGame();

  // Auto-navigate to lobby when successfully joined/created a room
  useEffect(() => {
    if (state.currentRoom && currentView !== 'password' && currentView !== 'lobby' && currentView !== 'game') {
      setCurrentView('lobby');
    }
  }, [state.currentRoom, currentView]);

  // Auto-navigate to game board when game starts
  useEffect(() => {
    if (state.gameStarted && currentView !== 'game') {
      setCurrentView('game');
    }
  }, [state.gameStarted, currentView]);

  const handleStartGame = async () => {
    clearError();
    try {
      await createRoom();
      if (state.currentRoom && !state.error) {
        setCurrentView('password');
      }
    } catch (error) {
      console.error('Failed to create room:', error);
    }
  };

  const handleJoinSuccess = () => {
    setCurrentView('lobby');
  };

  const handleBackToLanding = () => {
    clearError();
    setCurrentView('landing');
  };

  const renderCurrentView = () => {
    switch (currentView) {
      case 'join':
        return (
          <JoinGame 
            onBack={handleBackToLanding}
            onJoinSuccess={handleJoinSuccess}
          />
        );
      case 'password':
        return (
          <GamePassword 
            onContinue={() => setCurrentView('lobby')}
            onBack={handleBackToLanding}
          />
        );
      case 'lobby':
        return (
          <GameLobby 
            onBack={handleBackToLanding}
          />
        );
      case 'game':
        return (
          <GameBoard 
            onBack={handleBackToLanding}
          />
        );
      case 'landing':
      default:
        return (
          <LandingPage 
            onStartGame={handleStartGame}
            onJoinGame={() => setCurrentView('join')}
          />
        );
    }
  };

  return (
    <div className="App">
      {renderCurrentView()}
    </div>
  );
}

function App() {
  return (
    <GameProvider>
      <AppContent />
    </GameProvider>
  );
}

export default App;
