import { Server, Socket } from 'socket.io';
import { GameService } from '../services/gameService';
import { GameEvents, JoinRoomData, GameError } from '../types/game';

export class SocketHandlers {
  private gameService: GameService;
  private io: Server;

  constructor(io: Server, gameService: GameService) {
    this.io = io;
    this.gameService = gameService;
  }

  handleConnection(socket: Socket): void {
    console.log(`User connected: ${socket.id}`);

    socket.on('create_room', (callback) => {
      try {
        const room = this.gameService.createRoom(socket.id);
        socket.join(room.id);
        
        console.log(`Room created: ${room.password} by ${socket.id}`);
        
        callback({
          success: true,
          room: {
            id: room.id,
            password: room.password,
            facilitatorId: room.facilitatorId,
            players: room.players,
            gameStarted: room.gameStarted
          }
        });
      } catch (error) {
        console.error('Error creating room:', error);
        callback({
          success: false,
          error: { message: 'Failed to create room' }
        });
      }
    });

    socket.on(GameEvents.JOIN_ROOM, (data: JoinRoomData, callback) => {
      try {
        const { password, playerName } = data;
        
        if (!password || !playerName || playerName.trim() === '') {
          callback({
            success: false,
            error: { message: 'Password and player name are required' }
          });
          return;
        }

        const room = this.gameService.findRoomByPassword(password.trim().toUpperCase());
        
        if (!room) {
          callback({
            success: false,
            error: { message: 'Invalid password or game already started' }
          });
          return;
        }

        // Check if player name already exists in the room
        const existingPlayer = room.players.find(p => p.name.toLowerCase() === playerName.trim().toLowerCase());
        if (existingPlayer) {
          callback({
            success: false,
            error: { message: 'Player name already taken in this room' }
          });
          return;
        }

        const player = this.gameService.addPlayerToRoom(room, playerName.trim(), socket.id);
        socket.join(room.id);

        console.log(`Player ${playerName} joined room ${room.password}`);

        // Notify all players in the room
        socket.to(room.id).emit(GameEvents.PLAYER_JOINED, {
          player: { id: player.id, name: player.name },
          players: room.players.map(p => ({ id: p.id, name: p.name }))
        });

        callback({
          success: true,
          room: {
            id: room.id,
            password: room.password,
            facilitatorId: room.facilitatorId,
            players: room.players.map(p => ({ id: p.id, name: p.name })),
            gameStarted: room.gameStarted,
            isPlayerFacilitator: room.facilitatorId === socket.id
          },
          player: { id: player.id, name: player.name }
        });

      } catch (error) {
        console.error('Error joining room:', error);
        callback({
          success: false,
          error: { message: 'Failed to join room' }
        });
      }
    });

    socket.on(GameEvents.START_GAME, (callback) => {
      try {
        const room = this.gameService.findRoomBySocketId(socket.id);
        
        if (!room) {
          callback({
            success: false,
            error: { message: 'Room not found' }
          });
          return;
        }

        if (!this.gameService.isFacilitator(socket.id, room.id)) {
          callback({
            success: false,
            error: { message: 'Only the facilitator can start the game' }
          });
          return;
        }

        if (room.players.length < 3) {
          callback({
            success: false,
            error: { message: 'Need at least 3 players to start the game' }
          });
          return;
        }

        const updatedRoom = this.gameService.startGame(socket.id, room.id);
        
        if (!updatedRoom) {
          callback({
            success: false,
            error: { message: 'Failed to start game' }
          });
          return;
        }

        console.log(`Game started in room ${room.password}`);

        // Notify all players that the game has started
        this.io.to(room.id).emit(GameEvents.GAME_STARTED, {
          message: 'Game has started! Check your role.',
          gameStarted: true
        });

        // Send role assignments privately to each player
        updatedRoom.players.forEach(player => {
          this.io.to(player.socketId).emit(GameEvents.ROLE_ASSIGNED, {
            role: player.role,
            playerId: player.id
          });
        });

        callback({
          success: true,
          message: 'Game started successfully!'
        });

      } catch (error) {
        console.error('Error starting game:', error);
        callback({
          success: false,
          error: { message: error instanceof Error ? error.message : 'Failed to start game' }
        });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
      
      const { room, player } = this.gameService.removePlayerFromRoom(socket.id);
      
      if (room && player) {
        // Notify remaining players
        socket.to(room.id).emit(GameEvents.PLAYER_LEFT, {
          player: { id: player.id, name: player.name },
          players: room.players.map(p => ({ id: p.id, name: p.name }))
        });
        
        console.log(`Player ${player.name} left room ${room.password}`);
      } else if (player) {
        console.log(`Facilitator ${player.name} left and room was closed`);
      }
    });

    socket.on('get_room_info', (callback) => {
      const room = this.gameService.findRoomBySocketId(socket.id);
      
      if (room) {
        callback({
          success: true,
          room: {
            id: room.id,
            password: room.password,
            facilitatorId: room.facilitatorId,
            players: room.players.map(p => ({ id: p.id, name: p.name, role: p.role })),
            gameStarted: room.gameStarted,
            isPlayerFacilitator: room.facilitatorId === socket.id
          }
        });
      } else {
        callback({
          success: false,
          error: { message: 'Room not found' }
        });
      }
    });
  }
}
