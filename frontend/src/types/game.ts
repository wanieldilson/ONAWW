export type Role = 'villager' | 'werewolf';
export type GamePhase = 'day' | 'night';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  isDead?: boolean;
}

export interface GameRoom {
  id: string;
  password: string;
  facilitatorId: string;
  players: Player[];
  gameStarted: boolean;
  gamePhase: GamePhase;
  isPlayerFacilitator?: boolean;
}

export interface GameState {
  currentRoom: GameRoom | null;
  currentPlayer: Player | null;
  isConnected: boolean;
  error: string | null;
  gameStarted: boolean;
  playerRole: Role | null;
  gamePhase: GamePhase;
}

export enum GameEvents {
  JOIN_ROOM = 'join_room',
  LEAVE_ROOM = 'leave_room',
  PLAYER_JOINED = 'player_joined',
  PLAYER_LEFT = 'player_left',
  START_GAME = 'start_game',
  GAME_STARTED = 'game_started',
  ROLE_ASSIGNED = 'role_assigned',
  CHANGE_PHASE = 'change_phase',
  PHASE_CHANGED = 'phase_changed',
  WEREWOLF_CHAT = 'werewolf_chat',
  WEREWOLF_MESSAGE = 'werewolf_message',
  KILL_PLAYER = 'kill_player',
  PLAYER_KILLED = 'player_killed',
  ERROR = 'error',
  ROOM_INFO = 'room_info'
}

export interface JoinRoomData {
  password: string;
  playerName: string;
}

export interface CreateRoomResponse {
  success: boolean;
  room?: GameRoom;
  error?: { message: string };
}

export interface JoinRoomResponse {
  success: boolean;
  room?: GameRoom;
  player?: Player;
  error?: { message: string };
}

export interface StartGameResponse {
  success: boolean;
  message?: string;
  error?: { message: string };
}

export interface GameError {
  message: string;
  code?: string;
}
