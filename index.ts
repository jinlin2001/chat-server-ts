import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const chats: { [key: string]: string } = {};

io.on('connection', (socket) => {
  socket.on('create', (roomId, roomPass, callback) => {
    if (!chats[roomId]) {
      chats[roomId] = roomPass;
      socket.join(roomId);
      io.emit('chat-list', Object.keys(chats));
      callback(true);
    } else {
      callback(false);
    }
  });
  socket.on('join', (roomId: string, roomPass: string, callback) => {
    if (chats[roomId] === roomPass) {
      socket.join(roomId);
      callback(true);
    } else {
      callback(false);
    }
  });
  socket.on('leave', (roomId: string) => {
    socket.leave(roomId);
  });
  socket.on('post', (roomId, msg, displayName) => {
    if (io.of('/').adapter.rooms.get(roomId)?.has(socket.id)) {
      socket.broadcast
        .to(roomId)
        .emit('chat-msg', { msg, roomId, displayName });
    }
  });
  socket.on('get-chats', (callback) => {
    callback(Object.keys(chats));
  });
});

io.of('/').adapter.on('delete-room', (roomId) => {
  if (roomId in chats) {
    delete chats[roomId];
    io.emit('chat-list', Object.keys(chats));
  }
});

server.listen(3000, () => {
  console.log('listening on port 3000');
});
