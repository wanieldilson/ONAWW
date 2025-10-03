import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import { GameProvider } from '../context/GameContext';
import LandingPage from '../components/LandingPage';

// Mock the socket service
jest.mock('../services/socketService', () => ({
  socketService: {
    connect: jest.fn().mockResolvedValue({}),
    disconnect: jest.fn(),
    createRoom: jest.fn(),
    joinRoom: jest.fn(),
    startGame: jest.fn(),
    changePhase: jest.fn(),
    sendWerewolfMessage: jest.fn(),
    killPlayer: jest.fn(),
    doctorHeal: jest.fn(),
    onPlayerJoined: jest.fn(),
    onPlayerLeft: jest.fn(),
    onGameStarted: jest.fn(),
    onRoleAssigned: jest.fn(),
    onPhaseChanged: jest.fn(),
    onWerewolfMessage: jest.fn(),
    onPlayerKilled: jest.fn(),
    onPlayerAction: jest.fn(),
    onError: jest.fn(),
    removeAllListeners: jest.fn(),
    isConnected: jest.fn().mockReturnValue(true),
    getSocket: jest.fn(),
  }
}));

const renderWithProvider = (component: React.ReactElement) => {
  return render(
    <GameProvider>
      {component}
    </GameProvider>
  );
};

describe('LandingPage', () => {
  const mockOnStartGame = jest.fn();
  const mockOnJoinGame = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the landing page correctly', () => {
    renderWithProvider(
      <LandingPage onStartGame={mockOnStartGame} onJoinGame={mockOnJoinGame} />
    );

    expect(screen.getByText('One Night a Werewolf')).toBeInTheDocument();
    expect(screen.getByText(/A thrilling game of deception and deduction/)).toBeInTheDocument();
    expect(screen.getByText('🎮 Start New Game')).toBeInTheDocument();
    expect(screen.getByText('🚪 Join Existing Game')).toBeInTheDocument();
  });

  it('displays game instructions', () => {
    renderWithProvider(
      <LandingPage onStartGame={mockOnStartGame} onJoinGame={mockOnJoinGame} />
    );

    expect(screen.getByText('How to Play:')).toBeInTheDocument();
    expect(screen.getByText(/One player creates a game and shares the password/)).toBeInTheDocument();
    expect(screen.getByText(/Players join the lobby and wait for the facilitator/)).toBeInTheDocument();
    expect(screen.getByText(/Each player is secretly assigned a role/)).toBeInTheDocument();
    expect(screen.getByText(/Use your wits to identify the werewolves/)).toBeInTheDocument();
  });

  it('calls onStartGame when start game button is clicked', async () => {
    renderWithProvider(
      <LandingPage onStartGame={mockOnStartGame} onJoinGame={mockOnJoinGame} />
    );

    const startButton = screen.getByText('🎮 Start New Game');
    fireEvent.click(startButton);

    await waitFor(() => {
      expect(mockOnStartGame).toHaveBeenCalledTimes(1);
    });
  });

  it('calls onJoinGame when join game button is clicked', async () => {
    renderWithProvider(
      <LandingPage onStartGame={mockOnStartGame} onJoinGame={mockOnJoinGame} />
    );

    const joinButton = screen.getByText('🚪 Join Existing Game');
    fireEvent.click(joinButton);

    await waitFor(() => {
      expect(mockOnJoinGame).toHaveBeenCalledTimes(1);
    });
  });

  it('displays connection status', () => {
    renderWithProvider(
      <LandingPage onStartGame={mockOnStartGame} onJoinGame={mockOnJoinGame} />
    );

    // Since we mocked isConnected to return true, buttons should be enabled
    const startButton = screen.getByText('🎮 Start New Game');
    const joinButton = screen.getByText('🚪 Join Existing Game');

    expect(startButton).not.toBeDisabled();
    expect(joinButton).not.toBeDisabled();
  });

  it('shows footer information', () => {
    renderWithProvider(
      <LandingPage onStartGame={mockOnStartGame} onJoinGame={mockOnJoinGame} />
    );

    expect(screen.getByText(/Built with TypeScript, React, and Socket.IO/)).toBeInTheDocument();
    expect(screen.getByText(/May the best player survive the night!/)).toBeInTheDocument();
  });
});
