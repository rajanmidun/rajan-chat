const express = require('express');
const path = require('path');
const http = require('http');
const socketio = require('socket.io');


const PORT = process.env.port || 3000;
const app = express();
const server = http.createServer(app);

//other modules
const formatMessage = require('./utils/messages');
const { getCurrentUser, userJoin, userLeave, getRoomUsers } = require('./utils/users');

//express middleware to server static files
app.use("/",express.static(path.join(__dirname, 'public')));

//inititalize the socket
const io = socketio(server);

//Socket operations after the user connects
io.on('connection', socket => {

  //first after the connection 
  socket.on('joinMessage', ({ username, room }) => {

    //store the user to the room
    const user = userJoin(socket.id, username, room);
    socket.join(user.room);
    socket.emit('message', formatMessage('admin', `${username} welcome to the chatcord `));

    //broadcast that user has connected
    socket.broadcast.to(user.room).emit("message", formatMessage('admin', `${username} has joined the chat`));

    //runs to send the users to the particular room
    io.to(user.room).emit("users", {
      room: user.room,
      users: getRoomUsers(user.room),
    });
  })

  //listen to the new message
  socket.on('message', message => {
    const user = getCurrentUser(socket.id);
    io.to(user.room).emit('message', formatMessage(message.username, message.message));
  })

  //runs when the client disconnect
  socket.on('disconnect', () => {
    const user = userLeave(socket.id);
    if (user) {
      io.to(user.room).emit("message", formatMessage('admin', `${user.username} has left the chat`));
      //runs to send the users to the particular room
      io.to(user.room).emit("users", {
        room: user.room,
        users: getRoomUsers(user.room),
      });
    }
  })

})

server.listen(PORT, () => console.log(`Server running on port ${PORT}`));
