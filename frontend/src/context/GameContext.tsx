import { createContext, useContext, useReducer, useEffect, ReactNode } from 'react';
import { GameState, GameRoom, Player, Role, GamePhase } from '../types/game';
import { socketService } from '../services/socketService';

interface GameContextType {
  state: GameState;
  connectToServer: () => Promise<void>;
  createRoom: () => Promise<void>;
  joinRoom: (password: string, playerName: string) => Promise<void>;
  startGame: () => Promise<void>;
  changePhase: (phase: GamePhase) => Promise<void>;
  sendWerewolfMessage: (message: string) => Promise<void>;
  killPlayer: (playerId: string) => Promise<void>;
  setError: (error: string | null) => void;
  clearError: () => void;
  disconnect: () => void;
}

type GameAction =
  | { type: 'SET_CONNECTION_STATUS'; payload: boolean }
  | { type: 'SET_ROOM'; payload: GameRoom | null }
  | { type: 'SET_PLAYER'; payload: Player | null }
  | { type: 'SET_ERROR'; payload: string | null }
  | { type: 'SET_GAME_STARTED'; payload: boolean }
  | { type: 'SET_PLAYER_ROLE'; payload: Role | null }
  | { type: 'SET_GAME_PHASE'; payload: GamePhase }
  | { type: 'UPDATE_PLAYERS'; payload: Player[] }
  | { type: 'RESET_GAME' };

const initialState: GameState = {
  currentRoom: null,
  currentPlayer: null,
  isConnected: false,
  error: null,
  gameStarted: false,
  playerRole: null,
  gamePhase: 'day',
};

function gameReducer(state: GameState, action: GameAction): GameState {
  switch (action.type) {
    case 'SET_CONNECTION_STATUS':
      return { ...state, isConnected: action.payload };
    case 'SET_ROOM':
      return { ...state, currentRoom: action.payload };
    case 'SET_PLAYER':
      return { ...state, currentPlayer: action.payload };
    case 'SET_ERROR':
      return { ...state, error: action.payload };
    case 'SET_GAME_STARTED':
      return { ...state, gameStarted: action.payload };
    case 'SET_PLAYER_ROLE':
      return { ...state, playerRole: action.payload };
    case 'SET_GAME_PHASE':
      return { ...state, gamePhase: action.payload };
    case 'UPDATE_PLAYERS':
      return {
        ...state,
        currentRoom: state.currentRoom
          ? { ...state.currentRoom, players: action.payload }
          : null,
      };
    case 'RESET_GAME':
      return {
        ...initialState,
        isConnected: state.isConnected,
      };
    default:
      return state;
  }
}

const GameContext = createContext<GameContextType | undefined>(undefined);

export function GameProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(gameReducer, initialState);

  useEffect(() => {
    // Set up socket event listeners
    socketService.onPlayerJoined((data) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: data.players });
    });

    socketService.onPlayerLeft((data) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: data.players });
    });

    socketService.onGameStarted(() => {
      dispatch({ type: 'SET_GAME_STARTED', payload: true });
    });

    socketService.onRoleAssigned((data) => {
      dispatch({ type: 'SET_PLAYER_ROLE', payload: data.role as Role });
    });

    socketService.onError((error) => {
      dispatch({ type: 'SET_ERROR', payload: error.message || 'An error occurred' });
    });

    socketService.onPhaseChanged((data) => {
      dispatch({ type: 'SET_GAME_PHASE', payload: data.phase });
    });

    socketService.onPlayerKilled((data) => {
      dispatch({ type: 'UPDATE_PLAYERS', payload: data.players });
    });

    return () => {
      socketService.removeAllListeners();
    };
  }, []);

  const connectToServer = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      await socketService.connect();
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: true });
    } catch (error) {
      console.error('Failed to connect to server:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to connect to server' });
      dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
    }
  };

  const createRoom = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await socketService.createRoom();
      
      if (response.success && response.room) {
        dispatch({ type: 'SET_ROOM', payload: response.room });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error?.message || 'Failed to create room' });
      }
    } catch (error) {
      console.error('Error creating room:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to create room' });
    }
  };

  const joinRoom = async (password: string, playerName: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await socketService.joinRoom({ password, playerName });
      
      if (response.success && response.room && response.player) {
        dispatch({ type: 'SET_ROOM', payload: response.room });
        dispatch({ type: 'SET_PLAYER', payload: response.player });
      } else {
        dispatch({ type: 'SET_ERROR', payload: response.error?.message || 'Failed to join room' });
      }
    } catch (error) {
      console.error('Error joining room:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to join room' });
    }
  };

  const startGame = async (): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await socketService.startGame();
      
      if (!response.success) {
        dispatch({ type: 'SET_ERROR', payload: response.error?.message || 'Failed to start game' });
      }
    } catch (error) {
      console.error('Error starting game:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to start game' });
    }
  };

  const setError = (error: string | null): void => {
    dispatch({ type: 'SET_ERROR', payload: error });
  };

  const clearError = (): void => {
    dispatch({ type: 'SET_ERROR', payload: null });
  };

  const changePhase = async (phase: GamePhase): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await socketService.changePhase(phase);
      
      if (!response.success) {
        dispatch({ type: 'SET_ERROR', payload: response.error?.message || 'Failed to change phase' });
      }
    } catch (error) {
      console.error('Error changing phase:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to change phase' });
    }
  };

  const sendWerewolfMessage = async (message: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await socketService.sendWerewolfMessage(message);
      
      if (!response.success) {
        dispatch({ type: 'SET_ERROR', payload: response.error?.message || 'Failed to send message' });
      }
    } catch (error) {
      console.error('Error sending werewolf message:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to send message' });
    }
  };

  const killPlayer = async (playerId: string): Promise<void> => {
    try {
      dispatch({ type: 'SET_ERROR', payload: null });
      const response = await socketService.killPlayer(playerId);
      
      if (!response.success) {
        dispatch({ type: 'SET_ERROR', payload: response.error?.message || 'Failed to kill player' });
      }
    } catch (error) {
      console.error('Error killing player:', error);
      dispatch({ type: 'SET_ERROR', payload: 'Failed to kill player' });
    }
  };

  const disconnect = (): void => {
    socketService.disconnect();
    dispatch({ type: 'RESET_GAME' });
    dispatch({ type: 'SET_CONNECTION_STATUS', payload: false });
  };

  const contextValue: GameContextType = {
    state,
    connectToServer,
    createRoom,
    joinRoom,
    startGame,
    changePhase,
    sendWerewolfMessage,
    killPlayer,
    setError,
    clearError,
    disconnect,
  };

  return (
    <GameContext.Provider value={contextValue}>
      {children}
    </GameContext.Provider>
  );
}

export function useGame(): GameContextType {
  const context = useContext(GameContext);
  if (context === undefined) {
    throw new Error('useGame must be used within a GameProvider');
  }
  return context;
}
