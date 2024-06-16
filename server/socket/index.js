const socketIO = require('socket.io');
const jwt = require('jsonwebtoken');

const User = require('../models/userModel');
const { SecretKey } = require('../config');
const { _log } = require('../utils/logging');

let io;

module.exports = {
  init: (server) => {
    io = socketIO(server, {
      cors: {
        origin: '*',
      },
    });
    io.use((socket, next) => {
      if (socket.handshake.query && socket.handshake.query.token) {
        jwt.verify(socket.handshake.query.token.replace('jwt ', ''), SecretKey, async function (err, decoded) {
          if (err) return next(new Error('Authentication error'));
          socket.user = decoded;
          await User.findByIdAndUpdate(decoded.id, { $push: { socketId: socket.id } }, { new: true });
          next();
        });
      }
      else {
        next(new Error('Authentication error'));
      }
    }).on('connection', (socket) => {
      _log(socket.user.name, `socket ${socket.id} connected!`);
      socket.join(socket.user.id.toString());
      socket.on(`disconnect`, async (reason) => {
        socket.leave(socket.user.id.toString());
        await User.findByIdAndUpdate(socket.user.id, { $pull: { socketId: socket.id } }, { new: true });
        _log(socket.user.name, `socket ${socket.id} disconnected due to ${reason}`);
      });
    });
    return io;
  },
  getSocketIO: () => {
    if (!io) {
      throw new Error("Can't get io instance before calling .init()");
    }
    return io;
  },
};
