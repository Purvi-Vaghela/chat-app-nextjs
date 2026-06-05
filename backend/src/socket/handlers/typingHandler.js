export const handleConversationTyping = () => (socket) => {
  // Start typing in conversation
  socket.on('typing:start', (data) => {
    const { conversationId, userId, userName } = data;
    socket.to(`conversation:${conversationId}`).emit('typing:update', {
      userId,
      userName,
      isTyping: true
    });
  });

  // Stop typing in conversation
  socket.on('typing:stop', (data) => {
    const { conversationId, userId } = data;
    socket.to(`conversation:${conversationId}`).emit('typing:update', {
      userId,
      isTyping: false
    });
  });
};

export const handleGroupTyping = () => (socket) => {
  // Start typing in group
  socket.on('group:typing:start', (data) => {
    const { groupId, userId, userName } = data;
    socket.to(`group:${groupId}`).emit('group:typing:update', {
      userId,
      userName,
      isTyping: true
    });
  });

  // Stop typing in group
  socket.on('group:typing:stop', (data) => {
    const { groupId, userId } = data;
    socket.to(`group:${groupId}`).emit('group:typing:update', {
      userId,
      isTyping: false
    });
  });
};
