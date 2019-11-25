const app = require('express')();
const http = require('http').createServer(app);
const io = require('socket.io')(http);
const port = 8080;
var users = [];
var connections = [];



app.get('/', (req, res) => res.sendFile(__dirname + '/index.html'));

io.on('connection', socket => {
  connections.push(socket);
  console.log('new user connected: %s users in chat', connections.length);

  socket.on('chat message', function(chatMessage){
    io.emit('chat message', {message: chatMessage, username: users.find(user => user.socketID == socket.id).username});
  });

  socket.on('disconnect', function(reason){
    users = users.filter(user => {
      return user.socketID != socket.id;
    });
    updateUserNames();
    connections.splice(connections.indexOf(socket), 1);
    console.log('user disconnected: %s users in chat', connections.length);

  });

  socket.on('new user', function(data, cb) {
    cb(true);
    if (users.length == 2) {
      alert("room lleno, espera a que alguien se desconecte");
    }
    else {
      users.push({
        username: data.username,
        socketID: socket.id,
        publicKey: data.publicKey
      });
      updateUserNames();
      // sendPublicKeyToSender();
    }
  });

  // const sendPublicKeyToSender = () => {
  //   io.emit('send key', users.find(user => user.socketID == socket.id).keys.publicKey)
  // }

  const updateUserNames = () => {
    io.emit('get users', users);
  }

});


http.listen(port, () => console.log(`Ejemplo escuchando en puerto ${port}`));