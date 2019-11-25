// new socket client
const socket = io();

// generate user keys
const userKeys = RSA.generateKeys();
var user = {
  username: null,
  socketID: null,
  keys: userKeys
}

// DOM elements
const chatArea = document.querySelector('#chatArea');
const messageForm = document.querySelector('#messageForm');
const chatMessage = document.querySelector('#m');
const messagesList = document.querySelector('#messagesList');

const userFormArea = document.querySelector('#userFormArea')
const userForm = document.querySelector('#userForm');
const userInput = document.querySelector('#userInput');
const usersList = document.querySelector('#usersList');

// helper function to add list node to DOM
const newListNode = function (list, content) {
  const element = document.createElement('li');
  element.classList.add("list-group-item");
  element.appendChild(document.createTextNode(content));
  list.appendChild(element);
}

// event: new user, saves user client, sends public key to server
userForm.addEventListener('submit', function (e) {
  e.preventDefault();
  socket.emit('new user', {
    username: userInput.value.charAt(0).toUpperCase() + userInput.value.slice(1),
    publicKey: userKeys.publicKey
  }, function (hayData, data) {
    if (hayData, data) {
      user.username = data.username;
      user.socketID = data.socketID;
      userFormArea.classList.add('d-none');
      if (chatArea.classList.contains('d-none')) {
        chatArea.classList.remove('d-none');
      }
      console.log(user);
      const saludoNombre = document.querySelector('#saludoNombre');
      saludoNombre.innerHTML = `¡Hola ${user.username}!`;
    }
  });
  userInput.value = '';
  return false;
});

// conversation started 
socket.on('sent public key', function (publicKey) {
  console.log(`\n
  My pk n: ${userKeys.publicKey.n}\n
  My pk e: ${userKeys.publicKey.e}\n
  Their pk n: ${publicKey.n}\n
  Their pk e: ${publicKey.e}
  `);
});

// send messages to server
messageForm.addEventListener('submit', function (e) {
  e.preventDefault();
  // event: chat message, send encrypted data to server
  socket.emit('chat message', chatMessage.value);
  chatMessage.value = '';
  return false;
});

socket.on('chat message', function (msg) {
  const senderName =  msg.username == user.username ? "Tú" : msg.username;
  newListNode(messagesList, senderName + ': ' + msg.message);
});


const removeUsersList = () => usersList.innerHTML = '';

socket.on('get users', function (data) {
  console.log(data);
  removeUsersList();
  const headerListNode = document.createElement('li');
  headerListNode.classList.add("list-group-item", "list-group-item-dark");
  headerListNode.appendChild(document.createTextNode("Personas en el chat"));
  usersList.appendChild(headerListNode);
  for (var i = 0; i < data.length; i++) {
    newListNode(usersList, data[i].username == user.username ? "Tú" : data[i].username);
  }
});

socket.on('send key', function (data) {

});