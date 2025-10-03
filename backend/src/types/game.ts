export type Role = 'villager' | 'werewolf' | 'doctor';
export type GamePhase = 'day' | 'night';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  socketId: string;
  isDead?: boolean;
}

export interface GameRoom {
  id: string;
  password: string;
  facilitatorId: string;
  players: Player[];
  gameStarted: boolean;
  gamePhase: GamePhase;
  createdAt: Date;
}

export interface GameState {
  rooms: Map<string, GameRoom>;
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
  DOCTOR_HEAL = 'doctor_heal',
  PLAYER_ACTION = 'player_action',
  ERROR = 'error',
  ROOM_INFO = 'room_info'
}

export interface JoinRoomData {
  password: string;
  playerName: string;
}

export interface GameError {
  message: string;
  code?: string;
}
