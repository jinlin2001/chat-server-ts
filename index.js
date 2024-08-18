"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const http_1 = __importDefault(require("http"));
const socket_io_1 = require("socket.io");
const app = (0, express_1.default)();
const server = http_1.default.createServer(app);
const io = new socket_io_1.Server(server, {
    cors: { origin: 'https://jinlin-portfolio.web.app' },
});
const chats = {};
io.on('connection', (socket) => {
    socket.on('create', (roomId, roomPass, callback) => {
        if (!chats[roomId]) {
            chats[roomId] = roomPass;
            socket.join(roomId);
            io.emit('chat-list', Object.keys(chats));
            callback(true);
        }
        else {
            callback(false);
        }
    });
    socket.on('join', (roomId, roomPass, callback) => {
        if (chats[roomId] === roomPass) {
            socket.join(roomId);
            callback(true);
        }
        else {
            callback(false);
        }
    });
    socket.on('leave', (roomId) => {
        socket.leave(roomId);
    });
    socket.on('post', (roomId, msg, displayName) => {
        var _a;
        if ((_a = io.of('/').adapter.rooms.get(roomId)) === null || _a === void 0 ? void 0 : _a.has(socket.id)) {
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
