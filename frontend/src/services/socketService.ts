import { io, Socket } from 'socket.io-client';
import { GameEvents, JoinRoomData, CreateRoomResponse, JoinRoomResponse, StartGameResponse, GamePhase } from '../types/game';

class SocketService {
  private socket: Socket | null = null;
  private serverUrl: string;

  constructor() {
    this.serverUrl = import.meta.env.VITE_SERVER_URL || 'http://localhost:3001';
  }

  connect(): Promise<Socket> {
    return new Promise((resolve, reject) => {
      this.socket = io(this.serverUrl, {
        transports: ['websocket', 'polling'],
        autoConnect: true,
      });

      this.socket.on('connect', () => {
        console.log('Connected to server');
        resolve(this.socket!);
      });

      this.socket.on('connect_error', (error) => {
        console.error('Connection error:', error);
        reject(error);
      });

      this.socket.on('disconnect', (reason) => {
        console.log('Disconnected:', reason);
      });
    });
  }

  disconnect(): void {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
  }

  createRoom(): Promise<CreateRoomResponse> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: { message: 'Not connected to server' } });
        return;
      }

      this.socket.emit('create_room', (response: CreateRoomResponse) => {
        resolve(response);
      });
    });
  }

  joinRoom(data: JoinRoomData): Promise<JoinRoomResponse> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: { message: 'Not connected to server' } });
        return;
      }

      this.socket.emit(GameEvents.JOIN_ROOM, data, (response: JoinRoomResponse) => {
        resolve(response);
      });
    });
  }

  startGame(): Promise<StartGameResponse> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: { message: 'Not connected to server' } });
        return;
      }

      this.socket.emit(GameEvents.START_GAME, (response: StartGameResponse) => {
        resolve(response);
      });
    });
  }

  onPlayerJoined(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.PLAYER_JOINED, callback);
    }
  }

  onPlayerLeft(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.PLAYER_LEFT, callback);
    }
  }

  onGameStarted(callback: (data: any) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.GAME_STARTED, callback);
    }
  }

  onRoleAssigned(callback: (data: { role: string; playerId: string }) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.ROLE_ASSIGNED, callback);
    }
  }

  onError(callback: (error: any) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.ERROR, callback);
    }
  }

  removeAllListeners(): void {
    if (this.socket) {
      this.socket.removeAllListeners();
    }
  }

  isConnected(): boolean {
    return this.socket?.connected || false;
  }

  changePhase(phase: GamePhase): Promise<{ success: boolean; phase?: GamePhase; error?: { message: string } }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: { message: 'Not connected to server' } });
        return;
      }

      this.socket.emit(GameEvents.CHANGE_PHASE, { phase }, (response: any) => {
        resolve(response);
      });
    });
  }

  sendWerewolfMessage(message: string): Promise<{ success: boolean; error?: { message: string } }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: { message: 'Not connected to server' } });
        return;
      }

      this.socket.emit(GameEvents.WEREWOLF_CHAT, { message }, (response: any) => {
        resolve(response);
      });
    });
  }

  onPhaseChanged(callback: (data: { phase: GamePhase; message: string }) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.PHASE_CHANGED, callback);
    }
  }

  onWerewolfMessage(callback: (data: { playerId: string; playerName: string; message: string; timestamp: string }) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.WEREWOLF_MESSAGE, callback);
    }
  }

  killPlayer(playerId: string): Promise<{ success: boolean; error?: { message: string } }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: { message: 'Not connected to server' } });
        return;
      }

      this.socket.emit(GameEvents.KILL_PLAYER, { playerId }, (response: any) => {
        resolve(response);
      });
    });
  }

  onPlayerKilled(callback: (data: { playerId: string; playerName: string; players: any[] }) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.PLAYER_KILLED, callback);
    }
  }

  doctorHeal(targetPlayerId: string): Promise<{ success: boolean; message?: string; error?: { message: string } }> {
    return new Promise((resolve) => {
      if (!this.socket) {
        resolve({ success: false, error: { message: 'Not connected to server' } });
        return;
      }

      this.socket.emit(GameEvents.DOCTOR_HEAL, { targetPlayerId }, (response: any) => {
        resolve(response);
      });
    });
  }

  onPlayerAction(callback: (data: { type: string; actor: string; target: string; message: string; timestamp: string }) => void): void {
    if (this.socket) {
      this.socket.on(GameEvents.PLAYER_ACTION, callback);
    }
  }

  getSocket(): Socket | null {
    return this.socket;
  }
}

export const socketService = new SocketService();
