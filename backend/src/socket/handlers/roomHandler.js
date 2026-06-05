export const handleConversationRoom = () => (socket) => {
  // Join conversation room
  socket.on('conversation:join', (conversationId) => {
    socket.join(`conversation:${conversationId}`);
    console.log(`💬 Socket ${socket.id} joined conversation ${conversationId}`);
  });

  // Leave conversation room
  socket.on('conversation:leave', (conversationId) => {
    socket.leave(`conversation:${conversationId}`);
    console.log(`👋 Socket ${socket.id} left conversation ${conversationId}`);
  });
};

export const handleGroupRoom = () => (socket) => {
  // Join group room
  socket.on('group:join', (groupId) => {
    socket.join(`group:${groupId}`);
    console.log(`👥 Socket ${socket.id} joined group ${groupId}`);
  });

  // Leave group room
  socket.on('group:leave', (groupId) => {
    socket.leave(`group:${groupId}`);
    console.log(`🚪 Socket ${socket.id} left group ${groupId}`);
  });
};
