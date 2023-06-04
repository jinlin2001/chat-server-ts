import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });
const rooms: { [key: string]: string } = {};

io.on('connection', (socket) => {
  socket.on('create', (id, pass, callback) => {
    if (!rooms[id]) {
      rooms[id] = pass;
      socket.join(id);
      io.emit('list', Object.keys(rooms));
      callback(true);
    } else {
      callback(false);
    }
  });
  socket.on('join', (id: string, pass: string, callback) => {
    if (rooms[id] === pass) {
      socket.join(id);
      callback(true);
    } else {
      callback(false);
    }
  });
  socket.on('leave', (id: string) => {
    socket.leave(id);
  });
  socket.on('post', (id, msg, displayName) => {
    if (io.of('/').adapter.rooms.get(id)?.has(socket.id)) {
      socket.broadcast.to(id).emit('msg', { msg, id, displayName });
    }
  });
  socket.on('get', (callback) => {
    callback(Object.keys(rooms));
  });
});

io.of('/').adapter.on('delete-room', (id) => {
  if (id in rooms) {
    delete rooms[id];
    io.emit('list', Object.keys(rooms));
  }
});

server.listen(3000, () => {
  console.log('listening on port 3000');
});
