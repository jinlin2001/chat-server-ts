import express from 'express';
import http from 'http';
import { Server } from 'socket.io';
import cors from 'cors';
const app = express();
const server = http.createServer(app);
const io = new Server(server, { cors: { origin: '*' } });

type Rooms = { [roomId: string]: string };

const rooms: Rooms = {};

app.use(cors());

app.use('/something', (req, res) => {
  res.send({ something: 'something' });
});

io.on('connection', (socket) => {
  socket.on('join', (roomId: string, pass: string) => {
    if (rooms[roomId] && rooms[roomId] === pass) {
      socket.join(roomId);
      socket.emit('join-success');
    } else {
      socket.emit('wrong-pass');
    }
  });

  socket.on('leave', (roomId: string) => {
    socket.leave(roomId);
  });

  socket.on('post-message', (roomId, message) => {
    if (io.sockets.adapter.rooms.get(roomId)?.has(socket.id)) {
      socket.broadcast.to(roomId).emit('message', { message });
    }
  });

  socket.on('create-room', (roomId, pass) => {
    if (!rooms[roomId]) {
      rooms[roomId] = pass;
      socket.emit('create-success');
    } else {
      socket.emit('duplicate-room');
    }
  });
  socket.on('get-rooms', () => {
    socket.emit('room-list', rooms);
  });
});
io.of('/').adapter.on('delete-room', (room) => {
  delete rooms[room];
});

server.listen(3000, () => {
  console.log('listening on port 3000');
});
