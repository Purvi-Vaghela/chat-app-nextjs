# ChatApp Backend - Socket.io Server

Real-time messaging backend with WebSocket support built using Node.js, Express, Socket.io, and MongoDB.

## 🚀 Features

- **Real-time Messaging**: WebSocket-based instant messaging using Socket.io rooms
- **1-1 Conversations**: Direct messaging between users
- **Group Chats**: Multi-user group conversations
- **Online Presence**: Live online/offline status tracking
- **Typing Indicators**: Real-time typing status in conversations and groups
- **Message Persistence**: All messages stored in MongoDB
- **Image Sharing**: Cloudinary integration for image uploads
- **RESTful API**: Express routes for data fetching and management

## 🛠️ Tech Stack

- **Node.js** - Runtime environment
- **Express** - Web framework
- **Socket.io** - Real-time bidirectional communication
- **Prisma** - Type-safe ORM
- **MongoDB** - NoSQL database
- **Cloudinary** - Image upload and CDN

## 📦 Installation

```bash
# Install dependencies
npm install

# Generate Prisma Client
npx prisma generate

# Start development server
npm run dev

# Start production server
npm start
```

## 🔧 Environment Variables

Create a `.env` file in the root:

```env
PORT=4000
NODE_ENV=development
DATABASE_URL="mongodb+srv://username:password@cluster.mongodb.net/chatapp"
FRONTEND_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

## 📡 API Endpoints

### Users
- `GET /api/users` - Get all users
- `GET /api/users/:id` - Get user by ID

### Conversations
- `GET /api/conversations/user/:userId` - Get all conversations for a user
- `POST /api/conversations/find-or-create` - Find or create conversation between two users
- `GET /api/conversations/:conversationId/messages` - Get messages for a conversation

### Groups
- `GET /api/groups/user/:userId` - Get all groups for a user
- `POST /api/groups` - Create a new group
- `GET /api/groups/:groupId` - Get group by ID
- `POST /api/groups/:groupId/members` - Add member to group
- `DELETE /api/groups/:groupId/members/:userId` - Remove member from group
- `GET /api/groups/:groupId/messages` - Get messages for a group

### Upload
- `POST /api/upload/signature` - Get Cloudinary signed upload URL

## 🔌 Socket.io Events

### Client → Server

- `user:online` - User comes online (payload: `userId`)
- `conversation:join` - Join conversation room (payload: `conversationId`)
- `conversation:leave` - Leave conversation room (payload: `conversationId`)
- `group:join` - Join group room (payload: `groupId`)
- `group:leave` - Leave group room (payload: `groupId`)
- `message:send` - Send message in conversation (payload: `{ conversationId, senderId, content, imageUrl }`)
- `group:message:send` - Send message in group (payload: `{ groupId, senderId, content, imageUrl }`)
- `typing:start` - Start typing in conversation (payload: `{ conversationId, userId, userName }`)
- `typing:stop` - Stop typing in conversation (payload: `{ conversationId, userId }`)
- `group:typing:start` - Start typing in group (payload: `{ groupId, userId, userName }`)
- `group:typing:stop` - Stop typing in group (payload: `{ groupId, userId }`)

### Server → Client

- `user:status` - User online/offline status update (payload: `{ userId, isOnline }`)
- `message:new` - New message in conversation (payload: `message object`)
- `group:message:new` - New message in group (payload: `message object`)
- `typing:update` - Typing status update (payload: `{ userId, userName, isTyping }`)
- `group:typing:update` - Group typing status update (payload: `{ userId, userName, isTyping }`)
- `message:error` - Message sending error (payload: `{ error }`)

## 🏗️ Architecture

```
User connects → Socket.io authenticates → User joins rooms
                                                ↓
Message sent → Validate → Save to MongoDB → Broadcast to room
                                                ↓
Other users in room receive message instantly
```

## 📝 Database Schema

- **User**: User accounts with online status
- **Conversation**: 1-1 chat containers
- **Group**: Multi-user chat rooms
- **GroupMember**: Group membership with roles (admin/member)
- **Message**: Text and image messages
- **Account/Session**: NextAuth authentication

## 🚢 Deployment

Deploy to Railway, Render, or any Node.js hosting:

1. Set environment variables
2. Run `npm install`
3. Run `npx prisma generate`
4. Run `npm start`

## 📄 License

MIT
