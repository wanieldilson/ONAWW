import { Server, Socket } from 'socket.io';
import { GameService } from '../services/gameService';
import { GameEvents, JoinRoomData, GameError, GamePhase } from '../types/game';

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
            players: room.players.map(p => ({ id: p.id, name: p.name })),
            gameStarted: room.gameStarted,
            gamePhase: room.gamePhase,
            isPlayerFacilitator: true // Creator is always the facilitator
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
            gamePhase: room.gamePhase,
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

        if (room.players.length < 4) {
          callback({
            success: false,
            error: { message: 'Need at least 4 players to start the game' }
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

    // Handle phase changes
    socket.on(GameEvents.CHANGE_PHASE, (data: { phase: GamePhase }, callback) => {
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
            error: { message: 'Only the facilitator can change game phase' }
          });
          return;
        }

        if (!room.gameStarted) {
          callback({
            success: false,
            error: { message: 'Game must be started to change phases' }
          });
          return;
        }

        const updatedRoom = this.gameService.changePhase(socket.id, room.id, data.phase);
        
        if (!updatedRoom) {
          callback({
            success: false,
            error: { message: 'Failed to change phase' }
          });
          return;
        }

        console.log(`Phase changed to ${data.phase} in room ${room.password}`);

        // Notify all players about the phase change
        this.io.to(room.id).emit(GameEvents.PHASE_CHANGED, {
          phase: data.phase,
          message: data.phase === 'night' 
            ? 'Night has fallen... Werewolves, choose your target.' 
            : 'Dawn breaks! Discuss who might be the werewolf.'
        });

        callback({
          success: true,
          phase: data.phase
        });

      } catch (error) {
        console.error('Error changing phase:', error);
        callback({
          success: false,
          error: { message: 'Failed to change phase' }
        });
      }
    });

    // Handle werewolf chat
    socket.on(GameEvents.WEREWOLF_CHAT, (data: { message: string }, callback) => {
      try {
        const room = this.gameService.findRoomBySocketId(socket.id);
        
        if (!room || !room.gameStarted) {
          callback({
            success: false,
            error: { message: 'Game not found or not started' }
          });
          return;
        }

        // Find the player
        const player = room.players.find(p => p.socketId === socket.id);
        if (!player || player.role !== 'werewolf' || room.facilitatorId === socket.id) {
          callback({
            success: false,
            error: { message: 'Only werewolves can use this chat' }
          });
          return;
        }

        if (room.gamePhase !== 'night') {
          callback({
            success: false,
            error: { message: 'Werewolf chat is only available during night phase' }
          });
          return;
        }

        // Send message to all werewolves and the facilitator
        const werewolves = this.gameService.getWerewolves(room.id);
        const messageData = {
          playerId: player.id,
          playerName: player.name,
          message: data.message,
          timestamp: new Date().toISOString()
        };

        // Send to all werewolves
        werewolves.forEach(werewolf => {
          this.io.to(werewolf.socketId).emit(GameEvents.WEREWOLF_MESSAGE, messageData);
        });

        // Send to facilitator (using facilitatorId directly)
        this.io.to(room.facilitatorId).emit(GameEvents.WEREWOLF_MESSAGE, messageData);

        console.log(`Werewolf message sent to ${werewolves.length} werewolves and facilitator ${room.facilitatorId}`);

        callback({
          success: true
        });

      } catch (error) {
        console.error('Error handling werewolf chat:', error);
        callback({
          success: false,
          error: { message: 'Failed to send message' }
        });
      }
    });

    // Handle kill player
    socket.on(GameEvents.KILL_PLAYER, (data: { playerId: string }, callback) => {
      try {
        const room = this.gameService.findRoomBySocketId(socket.id);
        
        if (!room || !room.gameStarted) {
          callback({
            success: false,
            error: { message: 'Game not found or not started' }
          });
          return;
        }

        if (!this.gameService.isFacilitator(socket.id, room.id)) {
          callback({
            success: false,
            error: { message: 'Only the facilitator can kill players' }
          });
          return;
        }

        const player = room.players.find(p => p.id === data.playerId);
        const wasAlive = !player?.isDead;
        
        const updatedRoom = wasAlive 
          ? this.gameService.killPlayer(socket.id, room.id, data.playerId)
          : this.gameService.revivePlayer(socket.id, room.id, data.playerId);
        
        if (!updatedRoom) {
          callback({
            success: false,
            error: { message: wasAlive ? 'Failed to kill player' : 'Failed to revive player' }
          });
          return;
        }

        const targetPlayer = updatedRoom.players.find(p => p.id === data.playerId);
        console.log(`Player ${targetPlayer?.name} was ${wasAlive ? 'killed' : 'revived'} in room ${room.password}`);

        // Notify all players about the death/revival
        this.io.to(room.id).emit(GameEvents.PLAYER_KILLED, {
          playerId: data.playerId,
          playerName: targetPlayer?.name,
          wasKilled: wasAlive,
          players: updatedRoom.players.map(p => ({ 
            id: p.id, 
            name: p.name, 
            isDead: p.isDead || false 
          }))
        });

        callback({
          success: true
        });

      } catch (error) {
        console.error('Error killing player:', error);
        callback({
          success: false,
          error: { message: 'Failed to kill player' }
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
