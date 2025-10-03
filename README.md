# 🐺 One Night a Werewolf

A real-time, browser-based multiplayer implementation of the popular social deduction game "One Night Ultimate Werewolf" built with TypeScript, React, and Socket.IO.

## 🎮 Game Features

### Core Gameplay
- **Real-time multiplayer** - Play with friends using WebSocket connections
- **Smart role assignment** - 4-5 players = 1 werewolf, 6+ players = 2 werewolves
- **Day/Night phases** - Dynamic game phases with sun ☀️ and moon 🌙 icons
- **Werewolf coordination** - Private werewolf chat during night phase
- **Facilitator oversight** - Game creator can observe and control the game

### User Experience
- **Werewolf-themed UI** - Dark, atmospheric interface with medieval styling
- **Password-protected rooms** - Share a 6-letter code to join games
- **Player status tracking** - See your own name and role clearly
- **Death system** - Visual skull indicators for eliminated players
- **Observer mode** - Dead players can still watch the game unfold

### Facilitator Powers
- **Phase control** - Switch between day and night phases
- **Player management** - Kill/revive players with visual buttons
- **Role visibility** - See all player roles (werewolves 🐺 and villagers 👤)
- **Chat monitoring** - Observe werewolf coordination without participating

## 🚀 Quick Start

### Using Docker (Recommended)

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd ONAWW
   ```

2. **Build and run with Docker**
   ```bash
   docker build -t onaww .
   ```

3. **Or use Docker Compose**
   ```bash
   docker-compose up --build
   ```

4. **Open your browser**
   ```
   http://localhost:3001
   ```

### Development Setup

#### Prerequisites
- Node.js 18+ 
- npm or yarn

#### Backend Setup
```bash
cd backend
npm install
npm run dev
```

#### Frontend Setup (in another terminal)
```bash
cd frontend
npm install
npm run dev
```

The backend runs on `http://localhost:3001` and the frontend on `http://localhost:5173`.

## 🎯 How to Play

### Getting Started

1. **Create a Game** (Become the Facilitator)
   - Click "Start New Game" to create a room
   - Enter your player name when prompted
   - Share the 6-letter password with your friends
   - You become the facilitator with special powers

2. **Join a Game** (Become a Player)
   - Click "Join Existing Game"
   - Enter the room password and your player name
   - Wait in the lobby for the facilitator to start

### Game Setup

3. **Lobby Phase**
   - Minimum **4 players** required (facilitator + 3 players)
   - Facilitator sees a "Start Game" button when ready
   - Players see "Waiting for facilitator to start the game..."

4. **Role Assignment** (Automatic)
   - **4-5 total players**: 1 werewolf assigned
   - **6+ total players**: 2 werewolves assigned
   - **Facilitator**: Gets no role, manages the game
   - **Other players**: Become villagers or werewolves

### Game Flow

5. **Day Phase** ☀️ (Game starts here)
   - All players can discuss openly
   - Try to identify who the werewolves might be
   - **Facilitator**: Can switch to night phase when ready

6. **Night Phase** 🌙
   - **Werewolves**: Can chat privately to coordinate
   - **Villagers**: Wait quietly while werewolves plan
   - **Facilitator**: Can observe werewolf chat and switch back to day

### Player Roles

- **👑 Facilitator**
  - Controls day/night phases
  - Can see all player roles
  - Can kill/revive players during the game
  - Observes werewolf chat but cannot participate

- **🐺 Werewolf** 
  - Know who the other werewolves are
  - Can chat privately with other werewolves during night
  - Goal: Eliminate villagers and avoid detection

- **👤 Villager**
  - Don't know who anyone else is
  - Must work together to identify werewolves
  - Goal: Identify and eliminate all werewolves

### Death System

7. **Player Elimination**
   - **Facilitator** can click 💀 to kill players
   - **Dead players** see skull 💀 and "You have been killed"
   - **Dead players** can still observe but cannot participate
   - **Facilitator** can click 🔄 to revive dead players

### Special Features

- **Real-time updates**: All actions happen instantly for all players
- **Phase indicators**: Clear visual cues for day ☀️ vs night 🌙
- **Role visibility**: Facilitator sees everyone's roles, werewolves see each other
- **Chat system**: Private werewolf coordination during night phase
- **Observer mode**: Dead players and facilitator can watch without affecting gameplay

## 🏗️ Architecture

### Backend
- **Node.js + TypeScript** - Server runtime and type safety
- **Express.js** - Web server framework
- **Socket.IO** - Real-time bidirectional communication
- **Jest** - Testing framework

### Frontend  
- **React 18** - UI framework
- **TypeScript** - Type safety and better DX
- **Vite** - Fast build tool and dev server
- **Tailwind CSS** - Utility-first CSS framework
- **Socket.IO Client** - Real-time communication

### Key Components

```
├── backend/
│   ├── src/
│   │   ├── services/gameService.ts    # Game logic and state management
│   │   ├── handlers/socketHandlers.ts # WebSocket event handling  
│   │   ├── types/game.ts             # Shared type definitions
│   │   └── server.ts                 # Express server setup
│   └── __tests__/                    # Backend tests
└── frontend/
    ├── src/
    │   ├── components/               # React components
    │   ├── context/GameContext.tsx  # Global game state
    │   ├── services/socketService.ts # WebSocket client
    │   └── types/game.ts            # Frontend type definitions
    └── __tests__/                   # Frontend tests
```

## 🧪 Testing

### Run Backend Tests
```bash
cd backend
npm test
```

### Run Frontend Tests
```bash
cd frontend  
npm test
```

### Run All Tests
```bash
npm test
```

## 🔒 Security

This project includes comprehensive security scanning to protect against vulnerabilities:

### Quick Security Checks
```bash
# Run all security audits
npm run security:all

# Run just NPM audit
npm run security:audit

# Run Snyk vulnerability scanning
npm run security:snyk

# Fix vulnerabilities automatically
npm run security:fix
```

### Security Features
- **🛡️ Snyk integration** - Real-time vulnerability scanning
- **📊 NPM audit** - Built-in dependency security checks  
- **🐳 Docker security** - Container image scanning during builds
- **🔄 CI/CD security** - Automated security checks on every commit
- **📋 Security monitoring** - Continuous dependency monitoring

For detailed security information, see [SECURITY.md](./SECURITY.md).

## 🐳 Docker

The application includes a multi-stage Dockerfile that:

1. **Builds the frontend** - Creates optimized production build
2. **Builds the backend** - Compiles TypeScript to JavaScript
3. **Creates production image** - Lightweight Node.js runtime

### Build Options

```bash
# Basic build
docker build -t onaww .

# With Docker Compose (includes nginx proxy)
docker-compose --profile production up --build
```

## 🔧 Configuration

### Environment Variables

**Backend:**
- `NODE_ENV` - Set to 'production' for production builds
- `PORT` - Server port (default: 3001)

**Frontend:**
- `VITE_SERVER_URL` - Backend server URL (default: http://localhost:3001)

## 🚀 Deployment

1. **Build the application**
   ```bash
   docker build -t onaww .
   ```

2. **Run in production**
   ```bash
   docker run -p 80:3001 -e NODE_ENV=production onaww
   ```

3. **With reverse proxy** (recommended)
   ```bash
   docker-compose --profile production up -d
   ```

## 🎨 Customization

### Theming
The application uses a custom werewolf theme defined in `frontend/src/index.css`:
- Dark atmospheric backgrounds
- Blood-red accents
- Medieval typography (Cinzel font)
- Moon-glow effects

### Game Rules
Current role assignment logic in `backend/src/services/gameService.ts`:
```typescript
private assignRoles(room: GameRoom): void {
  // Filter out facilitator from role assignment
  const playersToAssign = room.players.filter(player => player.socketId !== room.facilitatorId);
  
  // Determine werewolf count: 4-5 players = 1 werewolf, 6+ players = 2 werewolves
  const werewolfCount = playersToAssign.length >= 5 ? 2 : 1;
  
  // Randomly assign werewolf and villager roles
  // Facilitator gets no role
}
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests for new functionality
5. Ensure all tests pass
6. Submit a pull request

## 📝 License

MIT License - see LICENSE file for details.

## 🐛 Known Issues

- Game rooms are stored in memory (will reset on server restart)
- No persistent user accounts  
- No voting system implemented yet
- No win/lose conditions implemented yet

## 🔮 Future Enhancements

### Gameplay
- [ ] Voting system for player elimination
- [ ] Win/lose conditions and game end detection
- [ ] Additional special roles (Seer, Robber, Troublemaker, etc.)
- [ ] Timed phases with automatic progression
- [ ] Multiple game rounds

### Features  
- [ ] Persistent game history and statistics
- [ ] User accounts and player profiles
- [ ] Voice chat integration
- [ ] Mobile app versions
- [ ] Tournament and league modes
- [ ] Spectator mode for non-players
- [ ] Game replay system

### Technical
- [ ] Database persistence for game state
- [ ] Reconnection handling for dropped connections
- [ ] Room size limits and player management
- [ ] Advanced anti-cheat measures

---

**May the best player survive the night!** 🌙🐺
