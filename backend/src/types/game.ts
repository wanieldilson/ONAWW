export type Role = 'villager' | 'werewolf';

export interface Player {
  id: string;
  name: string;
  role?: Role;
  socketId: string;
}

export interface GameRoom {
  id: string;
  password: string;
  facilitatorId: string;
  players: Player[];
  gameStarted: boolean;
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
