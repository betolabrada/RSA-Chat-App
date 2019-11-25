const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 3001;
var users = [];
var connections = [];


app.use(express.static(__dirname + '/public'));

app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', socket => {

  connections.push(socket);
  if (connections.length == 1) {
    console.log('waiting for another client: ');
  }
  else if (connections.length == 2) {
    console.log('conversation started!');
  }

  socket.on('new user', function (data, cb) {
    cb(true, data);
    users.push({
      username: data.username,
      socketID: socket.id,
      publicKey: data.publicKey
    });

    if (users.length == 2) {
      sendPublicKeys();
    }
    updateUserNames();
    // sendPublicKeyToSender();

  });

  socket.on('chat message', function (chatMessage) {
    io.emit('chat message', { message: chatMessage, username: users.find(user => user.socketID == socket.id).username });
  });

  socket.on('disconnect', function (reason) {
    users = users.filter(user => {
      return user.socketID != socket.id;
    });
    updateUserNames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('user disconnected: %s users in chat', connections.length);

  });


  // const sendPublicKeyToSender = () => {
  //   io.emit('send key', users.find(user => user.socketID == socket.id).keys.publicKey)
  // }


  const updateUserNames = () => {
    io.emit('get users', users);
  }

  const sendPublicKeys = () => {
    io.to(users[0].socketID).emit('sent public key', users[1].publicKey);
    io.to(users[1].socketID).emit('sent public key', users[0].publicKey);
  }

});


http.listen(port, () => console.log(`Ejemplo escuchando en puerto ${port}`));