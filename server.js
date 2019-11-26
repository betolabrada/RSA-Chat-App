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
      secureConversation();
    }
    updateUserNames();
    // sendPublicKeyToSender();
    
  });
  
  const secureConversation = () => {
    io.to(users[0].socketID).emit('my pair', users[1]);
    io.to(users[1].socketID).emit('my pair', users[0]);
  }

  socket.on('encrypted', function(med) {
    var receiver = users.find(user => user.socketID != socket.id);
    var sender = users.find(user => user.socketID == socket.id);
    console.log(`Mensaje encriptado: ${med.encryptedMessage.c} Enviado por: ${sender.username}`);
    io.to(receiver.socketID).emit('decrypt', {message: med, username: sender.username});
    
  });

  socket.on('update med', function(decrypted){
    io.emit('update med', decrypted);
  });

  socket.on('chat message', function (chatMessage) {
    var senderName = users.find(user => user.socketID == socket.id).username;
    console.log(`Encrypted message from ${senderName}: ${chatMessage}`);
    io.emit('chat message', { message: chatMessage, username: senderName});
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


});


http.listen(port, () => console.log(`Ejemplo escuchando en puerto ${port}`));