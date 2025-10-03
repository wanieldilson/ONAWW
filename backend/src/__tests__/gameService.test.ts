import { GameService } from '../services/gameService';
import { GameRoom, Player } from '../types/game';

describe('GameService', () => {
  let gameService: GameService;

  beforeEach(() => {
    gameService = new GameService();
  });

  describe('createRoom', () => {
    it('should create a new room with facilitator', () => {
      const facilitatorSocketId = 'facilitator-123';
      const room = gameService.createRoom(facilitatorSocketId);

      expect(room).toBeDefined();
      expect(room.id).toBeDefined();
      expect(room.password).toBeDefined();
      expect(room.password).toHaveLength(6);
      expect(room.facilitatorId).toBe(facilitatorSocketId);
      expect(room.players).toEqual([]);
      expect(room.gameStarted).toBe(false);
      expect(room.gamePhase).toBe('day');
      expect(room.createdAt).toBeInstanceOf(Date);
    });

    it('should generate unique room IDs and passwords', () => {
      const room1 = gameService.createRoom('facilitator-1');
      const room2 = gameService.createRoom('facilitator-2');

      expect(room1.id).not.toBe(room2.id);
      expect(room1.password).not.toBe(room2.password);
    });
  });

  describe('findRoomByPassword', () => {
    it('should find room by password', () => {
      const room = gameService.createRoom('facilitator-123');
      const foundRoom = gameService.findRoomByPassword(room.password);

      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe(room.id);
    });

    it('should return null for invalid password', () => {
      gameService.createRoom('facilitator-123');
      const foundRoom = gameService.findRoomByPassword('INVALID');

      expect(foundRoom).toBeNull();
    });

    it('should not return rooms that have already started', () => {
      const room = gameService.createRoom('facilitator-123');
      // Add players to meet minimum requirement
      gameService.addPlayerToRoom(room, 'Player1', 'socket-1');
      gameService.addPlayerToRoom(room, 'Player2', 'socket-2');
      gameService.addPlayerToRoom(room, 'Player3', 'socket-3');
      
      // Start the game
      gameService.startGame('facilitator-123', room.id);

      const foundRoom = gameService.findRoomByPassword(room.password);
      expect(foundRoom).toBeNull();
    });
  });

  describe('addPlayerToRoom', () => {
    it('should add player to room', () => {
      const room = gameService.createRoom('facilitator-123');
      const player = gameService.addPlayerToRoom(room, 'TestPlayer', 'socket-456');

      expect(player).toBeDefined();
      expect(player.id).toBeDefined();
      expect(player.name).toBe('TestPlayer');
      expect(player.socketId).toBe('socket-456');
      expect(player.role).toBeUndefined();

      const updatedRoom = gameService.getRoom(room.id);
      expect(updatedRoom?.players).toHaveLength(1);
      expect(updatedRoom?.players[0]).toEqual(player);
    });

    it('should add multiple players to room', () => {
      const room = gameService.createRoom('facilitator-123');
      const player1 = gameService.addPlayerToRoom(room, 'Player1', 'socket-1');
      const player2 = gameService.addPlayerToRoom(room, 'Player2', 'socket-2');

      const updatedRoom = gameService.getRoom(room.id);
      expect(updatedRoom?.players).toHaveLength(2);
      expect(updatedRoom?.players).toContain(player1);
      expect(updatedRoom?.players).toContain(player2);
    });
  });

  describe('removePlayerFromRoom', () => {
    it('should remove player from room', () => {
      const room = gameService.createRoom('facilitator-123');
      const player = gameService.addPlayerToRoom(room, 'TestPlayer', 'socket-456');

      const result = gameService.removePlayerFromRoom('socket-456');

      expect(result.room).toBeDefined();
      expect(result.player).toEqual(player);
      
      const updatedRoom = gameService.getRoom(room.id);
      expect(updatedRoom?.players).toHaveLength(0);
    });

    it('should delete room when facilitator leaves', () => {
      const room = gameService.createRoom('facilitator-123');
      gameService.addPlayerToRoom(room, 'TestPlayer', 'socket-456');

      const result = gameService.removePlayerFromRoom('facilitator-123');

      expect(result.room).toBeNull();
      expect(result.player).toBeDefined();
      
      const updatedRoom = gameService.getRoom(room.id);
      expect(updatedRoom).toBeNull();
    });

    it('should delete room when it becomes empty', () => {
      const room = gameService.createRoom('facilitator-123');
      const player = gameService.addPlayerToRoom(room, 'TestPlayer', 'socket-456');

      // Remove the only player
      gameService.removePlayerFromRoom('socket-456');
      
      const updatedRoom = gameService.getRoom(room.id);
      expect(updatedRoom?.players).toHaveLength(0);
    });

    it('should return null for non-existent socket', () => {
      const result = gameService.removePlayerFromRoom('non-existent-socket');
      expect(result.room).toBeNull();
      expect(result.player).toBeNull();
    });
  });

  describe('startGame', () => {
    let room: GameRoom;

    beforeEach(() => {
      room = gameService.createRoom('facilitator-123');
      gameService.addPlayerToRoom(room, 'Player1', 'socket-1');
      gameService.addPlayerToRoom(room, 'Player2', 'socket-2');
      gameService.addPlayerToRoom(room, 'Player3', 'socket-3');
      gameService.addPlayerToRoom(room, 'Player4', 'socket-4');
    });

    it('should start game with minimum players', () => {
      const startedRoom = gameService.startGame('facilitator-123', room.id);

      expect(startedRoom).toBeDefined();
      expect(startedRoom?.gameStarted).toBe(true);
      
      // Check that roles are assigned
      const players = startedRoom?.players;
      expect(players?.every(p => p.role !== undefined)).toBe(true);
    });

    it('should assign werewolf, doctor, and villager roles', () => {
      const startedRoom = gameService.startGame('facilitator-123', room.id);
      
      // Filter out facilitator
      const nonFacilitatorPlayers = startedRoom?.players.filter(p => p.socketId !== 'facilitator-123');
      const roles = nonFacilitatorPlayers?.map(p => p.role);
      
      expect(roles).toContain('werewolf');
      expect(roles).toContain('doctor');
      expect(roles).toContain('villager');
    });

    it('should not assign role to facilitator', () => {
      const startedRoom = gameService.startGame('facilitator-123', room.id);
      
      // Find facilitator in players
      const facilitator = startedRoom?.players.find(p => p.socketId === 'facilitator-123');
      expect(facilitator?.role).toBeUndefined();
    });

    it('should start game in day phase', () => {
      const startedRoom = gameService.startGame('facilitator-123', room.id);
      
      expect(startedRoom?.gamePhase).toBe('day');
    });

    it('should not allow non-facilitator to start game', () => {
      const startedRoom = gameService.startGame('socket-1', room.id);
      expect(startedRoom).toBeNull();
    });

    it('should not start game with less than 4 players', () => {
      const smallRoom = gameService.createRoom('facilitator-456');
      gameService.addPlayerToRoom(smallRoom, 'Player1', 'socket-1');
      gameService.addPlayerToRoom(smallRoom, 'Player2', 'socket-2');
      gameService.addPlayerToRoom(smallRoom, 'Player3', 'socket-3');

      expect(() => {
        gameService.startGame('facilitator-456', smallRoom.id);
      }).toThrow('Need at least 4 players to start the game');
    });

    it('should not start already started game', () => {
      gameService.startGame('facilitator-123', room.id);
      const secondStart = gameService.startGame('facilitator-123', room.id);
      expect(secondStart).toBeNull();
    });
  });

  describe('isFacilitator', () => {
    it('should correctly identify facilitator', () => {
      const room = gameService.createRoom('facilitator-123');
      
      expect(gameService.isFacilitator('facilitator-123', room.id)).toBe(true);
      expect(gameService.isFacilitator('other-socket', room.id)).toBe(false);
    });
  });

  describe('findRoomBySocketId', () => {
    it('should find room by facilitator socket ID', () => {
      const room = gameService.createRoom('facilitator-123');
      const foundRoom = gameService.findRoomBySocketId('facilitator-123');
      
      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe(room.id);
    });

    it('should find room by player socket ID', () => {
      const room = gameService.createRoom('facilitator-123');
      gameService.addPlayerToRoom(room, 'TestPlayer', 'socket-456');
      
      const foundRoom = gameService.findRoomBySocketId('socket-456');
      
      expect(foundRoom).toBeDefined();
      expect(foundRoom?.id).toBe(room.id);
    });

    it('should return null for non-existent socket', () => {
      const foundRoom = gameService.findRoomBySocketId('non-existent');
      expect(foundRoom).toBeNull();
    });
  });

  describe('changePhase', () => {
    it('should change game phase when game is started', () => {
      const room = gameService.createRoom('facilitator-123');
      gameService.addPlayerToRoom(room, 'Player1', 'socket-1');
      gameService.addPlayerToRoom(room, 'Player2', 'socket-2');
      gameService.addPlayerToRoom(room, 'Player3', 'socket-3');
      gameService.addPlayerToRoom(room, 'Player4', 'socket-4');
      gameService.startGame('facilitator-123', room.id);

      const updatedRoom = gameService.changePhase('facilitator-123', room.id, 'night');
      
      expect(updatedRoom).toBeDefined();
      expect(updatedRoom?.gamePhase).toBe('night');
    });

    it('should not allow non-facilitator to change phase', () => {
      const room = gameService.createRoom('facilitator-123');
      gameService.addPlayerToRoom(room, 'Player1', 'socket-1');
      gameService.addPlayerToRoom(room, 'Player2', 'socket-2');
      gameService.addPlayerToRoom(room, 'Player3', 'socket-3');
      gameService.addPlayerToRoom(room, 'Player4', 'socket-4');
      gameService.startGame('facilitator-123', room.id);

      const updatedRoom = gameService.changePhase('socket-1', room.id, 'night');
      
      expect(updatedRoom).toBeNull();
    });

    it('should not change phase if game not started', () => {
      const room = gameService.createRoom('facilitator-123');

      const updatedRoom = gameService.changePhase('facilitator-123', room.id, 'night');
      
      expect(updatedRoom).toBeNull();
    });
  });

  describe('killPlayer and revivePlayer', () => {
    let room: GameRoom;

    beforeEach(() => {
      room = gameService.createRoom('facilitator-123');
      gameService.addPlayerToRoom(room, 'Player1', 'socket-1');
      gameService.addPlayerToRoom(room, 'Player2', 'socket-2');
      gameService.addPlayerToRoom(room, 'Player3', 'socket-3');
      gameService.addPlayerToRoom(room, 'Player4', 'socket-4');
      gameService.startGame('facilitator-123', room.id);
    });

    it('should kill a player', () => {
      const player = room.players[0];
      const updatedRoom = gameService.killPlayer('facilitator-123', room.id, player.id);
      
      expect(updatedRoom).toBeDefined();
      const killedPlayer = updatedRoom?.players.find(p => p.id === player.id);
      expect(killedPlayer?.isDead).toBe(true);
    });

    it('should revive a dead player', () => {
      const player = room.players[0];
      gameService.killPlayer('facilitator-123', room.id, player.id);
      
      const updatedRoom = gameService.revivePlayer('facilitator-123', room.id, player.id);
      
      expect(updatedRoom).toBeDefined();
      const revivedPlayer = updatedRoom?.players.find(p => p.id === player.id);
      expect(revivedPlayer?.isDead).toBe(false);
    });

    it('should not allow non-facilitator to kill player', () => {
      const player = room.players[0];
      const updatedRoom = gameService.killPlayer('socket-1', room.id, player.id);
      
      expect(updatedRoom).toBeNull();
    });

    it('should not kill player in non-started game', () => {
      const newRoom = gameService.createRoom('facilitator-456');
      const player = gameService.addPlayerToRoom(newRoom, 'Player1', 'socket-5');
      
      const updatedRoom = gameService.killPlayer('facilitator-456', newRoom.id, player.id);
      
      expect(updatedRoom).toBeNull();
    });
  });

  describe('getWerewolves', () => {
    it('should return all werewolves in a room', () => {
      const room = gameService.createRoom('facilitator-123');
      gameService.addPlayerToRoom(room, 'Player1', 'socket-1');
      gameService.addPlayerToRoom(room, 'Player2', 'socket-2');
      gameService.addPlayerToRoom(room, 'Player3', 'socket-3');
      gameService.addPlayerToRoom(room, 'Player4', 'socket-4');
      gameService.startGame('facilitator-123', room.id);

      const werewolves = gameService.getWerewolves(room.id);
      
      expect(werewolves.length).toBeGreaterThan(0);
      expect(werewolves.every(w => w.role === 'werewolf')).toBe(true);
    });

    it('should return empty array for non-existent room', () => {
      const werewolves = gameService.getWerewolves('non-existent');
      
      expect(werewolves).toEqual([]);
    });
  });

  describe('cleanupOldRooms', () => {
    it('should not remove recent rooms', () => {
      const room = gameService.createRoom('facilitator-123');
      gameService.cleanupOldRooms();
      
      expect(gameService.getRoom(room.id)).toBeDefined();
    });

    it('should remove old rooms', () => {
      const room = gameService.createRoom('facilitator-123');
      
      // Manually set an old creation date
      const oldRoom = gameService.getRoom(room.id);
      if (oldRoom) {
        oldRoom.createdAt = new Date(Date.now() - 25 * 60 * 60 * 1000); // 25 hours ago
      }
      
      gameService.cleanupOldRooms();
      
      expect(gameService.getRoom(room.id)).toBeNull();
    });
  });
});
