import { v4 as uuidv4 } from 'uuid';
import { GameRoom, Player, Role, GameState } from '../types/game';

export class GameService {
  private gameState: GameState;

  constructor() {
    this.gameState = {
      rooms: new Map<string, GameRoom>()
    };
  }

  /**
   * Generate a random 6-digit password for the game room
   */
  private generatePassword(): string {
    return Math.random().toString(36).substr(2, 6).toUpperCase();
  }

  /**
   * Create a new game room
   */
  createRoom(facilitatorSocketId: string): GameRoom {
    const roomId = uuidv4();
    const password = this.generatePassword();
    
    const room: GameRoom = {
      id: roomId,
      password,
      facilitatorId: facilitatorSocketId,
      players: [],
      gameStarted: false,
      createdAt: new Date()
    };

    this.gameState.rooms.set(roomId, room);
    return room;
  }

  /**
   * Find room by password
   */
  findRoomByPassword(password: string): GameRoom | null {
    for (const room of this.gameState.rooms.values()) {
      if (room.password === password && !room.gameStarted) {
        return room;
      }
    }
    return null;
  }

  /**
   * Add player to room
   */
  addPlayerToRoom(room: GameRoom, playerName: string, socketId: string): Player {
    const player: Player = {
      id: uuidv4(),
      name: playerName,
      socketId
    };

    room.players.push(player);
    this.gameState.rooms.set(room.id, room);
    
    return player;
  }

  /**
   * Remove player from room
   */
  removePlayerFromRoom(socketId: string): { room: GameRoom | null, player: Player | null } {
    for (const room of this.gameState.rooms.values()) {
      const playerIndex = room.players.findIndex(p => p.socketId === socketId);
      if (playerIndex !== -1) {
        const [player] = room.players.splice(playerIndex, 1);
        
        // If the room is empty or only the facilitator left, delete the room
        if (room.players.length === 0 || socketId === room.facilitatorId) {
          this.gameState.rooms.delete(room.id);
          return { room: null, player };
        }
        
        this.gameState.rooms.set(room.id, room);
        return { room, player };
      }
    }
    return { room: null, player: null };
  }

  /**
   * Start the game and assign roles
   */
  startGame(facilitatorSocketId: string, roomId: string): GameRoom | null {
    const room = this.gameState.rooms.get(roomId);
    
    if (!room || room.facilitatorId !== facilitatorSocketId || room.gameStarted) {
      return null;
    }

    if (room.players.length < 3) {
      throw new Error('Need at least 3 players to start the game');
    }

    // Assign roles
    this.assignRoles(room);
    
    room.gameStarted = true;
    this.gameState.rooms.set(roomId, room);
    
    return room;
  }

  /**
   * Assign roles to players (simplified version)
   * In a real One Night Ultimate Werewolf, there would be more complex role assignment
   */
  private assignRoles(room: GameRoom): void {
    const players = [...room.players];
    
    // For simplicity, assign 1 werewolf for every 3-4 players
    const werewolfCount = Math.max(1, Math.floor(players.length / 3));
    
    // Shuffle players
    for (let i = players.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [players[i], players[j]] = [players[j], players[i]];
    }

    // Assign werewolf roles
    for (let i = 0; i < werewolfCount; i++) {
      players[i].role = 'werewolf';
    }

    // Assign villager roles to the rest
    for (let i = werewolfCount; i < players.length; i++) {
      players[i].role = 'villager';
    }
  }

  /**
   * Get room by ID
   */
  getRoom(roomId: string): GameRoom | null {
    return this.gameState.rooms.get(roomId) || null;
  }

  /**
   * Find room by socket ID
   */
  findRoomBySocketId(socketId: string): GameRoom | null {
    for (const room of this.gameState.rooms.values()) {
      if (room.players.some(p => p.socketId === socketId) || room.facilitatorId === socketId) {
        return room;
      }
    }
    return null;
  }

  /**
   * Check if socket is facilitator
   */
  isFacilitator(socketId: string, roomId: string): boolean {
    const room = this.gameState.rooms.get(roomId);
    return room?.facilitatorId === socketId || false;
  }

  /**
   * Get all rooms (for debugging/admin purposes)
   */
  getAllRooms(): GameRoom[] {
    return Array.from(this.gameState.rooms.values());
  }

  /**
   * Clean up old rooms (call periodically)
   */
  cleanupOldRooms(): void {
    const now = new Date();
    const maxAge = 24 * 60 * 60 * 1000; // 24 hours

    for (const [roomId, room] of this.gameState.rooms.entries()) {
      if (now.getTime() - room.createdAt.getTime() > maxAge) {
        this.gameState.rooms.delete(roomId);
      }
    }
  }
}
