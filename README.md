# ChatApp - Real-Time Messaging Platform

WhatsApp-inspired real-time chat application with 1-1 messaging, group chats, image sharing, and online presence.

## ✨ Features

- 🔐 Google OAuth authentication
- 💬 Real-time 1-1 messaging
- 👥 Group chats
- 📷 Image sharing (Cloudinary)
- 🟢 Online/offline presence
- ⌨️ Typing indicators
- 🌓 Dark/Light mode
- 📱 Responsive design

## 🛠️ Tech Stack

**Frontend:**
- Next.js 14 (App Router)
- TypeScript
- Tailwind CSS
- NextAuth.js v5
- Socket.io-client
- Zustand
- React Hot Toast

**Backend:**
- Node.js + Express
- Socket.io
- Prisma ORM
- MongoDB
- Cloudinary

## 🚀 Quick Start

### Prerequisites
- Node.js 18+
- MongoDB Atlas account
- Google OAuth credentials
- Cloudinary account (optional, for images)

### 1. Clone & Install

```bash
git clone https://github.com/Purvi-Vaghela/chat-app-nextjs.git
cd chat-app-nextjs

# Install backend dependencies
cd backend
npm install

# Install frontend dependencies
cd ../frontend
npm install
```

### 2. Environment Setup

**Backend (.env):**
```env
PORT=4000
DATABASE_URL="your-mongodb-url"
FRONTEND_URL="http://localhost:3000"
CLOUDINARY_CLOUD_NAME="your-cloud-name"
CLOUDINARY_API_KEY="your-api-key"
CLOUDINARY_API_SECRET="your-api-secret"
```

**Frontend (.env):**
```env
DATABASE_URL="your-mongodb-url"
NEXTAUTH_SECRET="generate-with-openssl"
NEXTAUTH_URL="http://localhost:3000"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
NEXT_PUBLIC_SOCKET_URL="http://localhost:4000"
```

### 3. Generate Prisma Client

```bash
# Backend
cd backend
npx prisma generate

# Frontend
cd ../frontend
npx prisma generate
```

### 4. Run Development Servers

```bash
# Terminal 1 - Backend
cd backend
npm run dev

# Terminal 2 - Frontend
cd frontend
npm run dev
```

Open [http://localhost:3000](http://localhost:3000)

## 📁 Project Structure

```
chat-app-nextjs/
├── backend/
│   ├── src/
│   │   ├── server.js          # Express + Socket.io server
│   │   ├── lib/prisma.js      # Prisma client
│   │   ├── socket/            # Socket.io handlers
│   │   └── routes/            # REST API routes
│   └── prisma/schema.prisma
├── frontend/
│   ├── app/                   # Next.js pages
│   ├── components/            # React components
│   ├── lib/                   # Utilities
│   ├── store/                 # Zustand stores
│   ├── hooks/                 # Custom hooks
│   └── prisma/schema.prisma
```

## 🎨 Design

- Clean, minimal WhatsApp-inspired UI
- Green accent color (#00a884)
- Dark/Light mode support
- Smooth animations

## 📝 License

MIT
