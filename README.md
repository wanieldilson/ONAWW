# 🐺 One Night a Werewolf

A real-time, browser-based multiplayer implementation of the popular social deduction game "One Night Ultimate Werewolf" built with TypeScript, React, and Socket.IO.

## 🎮 Game Features

- **Real-time multiplayer** - Play with friends using WebSocket connections
- **Werewolf-themed UI** - Dark, atmospheric interface with medieval styling
- **Role assignment** - Automatic role distribution (Villagers & Werewolves)
- **Game lobby system** - Wait for players before starting
- **Facilitator controls** - Game creator manages the session
- **Password-protected rooms** - Share a 6-letter code to join games

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
   docker run -p 3001:3001 onaww
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

1. **Start a Game**
   - Click "Start New Game" to create a room
   - Share the 6-letter password with your friends

2. **Join a Game**
   - Click "Join Existing Game"
   - Enter the password and your player name
   - Wait in the lobby for the facilitator to start

3. **Game Begins**
   - Minimum 3 players required
   - Each player is secretly assigned a role:
     - **🐺 Werewolf**: Know who the other werewolves are
     - **👤 Villager**: Work together to identify werewolves

4. **Discussion Phase**
   - Players discuss and try to identify the werewolves
   - Use your role knowledge and deduction skills

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
Modify role assignment logic in `backend/src/services/gameService.ts`:
```typescript
private assignRoles(room: GameRoom): void {
  // Customize werewolf-to-villager ratio
  const werewolfCount = Math.max(1, Math.floor(players.length / 3));
  // Add special roles, etc.
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
- Limited to basic Villager/Werewolf roles

## 🔮 Future Enhancements

- [ ] Additional special roles (Seer, Robber, etc.)
- [ ] Persistent game history
- [ ] User accounts and statistics  
- [ ] Voice chat integration
- [ ] Mobile app versions
- [ ] Tournament mode

---

**May the best player survive the night!** 🌙🐺
