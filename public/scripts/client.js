// new socket client
const socket = io();

// generate user keys
const userKeys = RSA.generateKeys();
var user = {
  username: null,
  socketID: null,
  keys: userKeys
}

var myPair = {
  username: null,
  socketID: null,
  publicKey: null
}

var med = {
  cifradoCesar: null,
  primerCifrado: 0,
  segundoCifrado: 0
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
      const saludoNombre = document.querySelector('#saludoNombre');
      saludoNombre.classList.add('text-light');
      saludoNombre.innerHTML = `¡Hola ${user.username}!`;
    }
  });
  userInput.value = '';
  return false;
});

// conversation started
socket.on('my pair', function (userPair) {

  myPair.username = userPair.username;
  myPair.socketID = userPair.socketID;
  myPair.publicKey = userPair.publicKey;

  setLimit();

  console.log(`My public key: {${user.keys.publicKey.n},${user.keys.publicKey.e}}
  my private key: {${user.keys.privateKey.n},${user.keys.privateKey.d}}
  partner public key: {${myPair.publicKey.n},${myPair.publicKey.e}}`);

});

// send messages to server
messageForm.addEventListener('submit', function (e) {
  e.preventDefault();
  // event: chat message, send encrypted data to server
  // dom
  newListNode(messagesList, 'Tú: ' + chatMessage.value);
  // encrypt for server
  var encryptedMessage = RSA.encrypt(chatMessage.value, myPair.publicKey);
  med.primerCifrado = encryptedMessage.cifradoNum;
  med.cifradoCesar = encryptedMessage.cifradoCesar
  console.log(med);
  socket.emit('encrypted', { encryptedMessage, med });
  chatMessage.value = '';


  return false;
});


socket.on('decrypt', function (c) {
  med = c.message.med;
  var dcm = RSA.decrypt(c.message.encryptedMessage.c, user.keys.privateKey);
  med.segundoCifrado = dcm;
  console.log(med);
  if (med.primerCifrado == med.segundoCifrado) {
    console.log('Crypto successful');
    newListNode(messagesList, c.username + ': ' + RSA.descifrar(med.cifradoCesar));
  }
  else {
    newListNode(messagesList, 'Error');
  }

});

socket.on('update med', function (decrypted) {
  med.segundoCifrado = decrypted;
  if (med.segundoCifrado == med.primerCifrado) {
    console.log(med.primerCifrado + " = " + med.segundoCifrado);

  }
});

socket.on('disconnect', () => {
  document.querySelector('#not-connected').classList.remove('d-none');
  userFormArea.classList.add('d-none');
});

const removeUsersList = () => usersList.innerHTML = '';

socket.on('get users', function (data) {
  removeUsersList();
  const headerListNode = document.createElement('li');
  headerListNode.classList.add("list-group-item", "list-group-item-dark");
  headerListNode.style.backgroundColor = '#27ae60';
  headerListNode.style.borderColor = '#27ae60';
  headerListNode.style.color = '#fff';
  headerListNode.appendChild(document.createTextNode("Personas en el chat"));
  usersList.appendChild(headerListNode);
  for (var i = 0; i < data.length; i++) {
    newListNode(usersList, data[i].username == user.username ? "Tú" : data[i].username);
  }
});

function setLimit() {
  const limit = user.keys.publicKey.n < myPair.publicKey.n ? user.keys.publicKey.n : myPair.publicKey.n
  chatMessage.setAttribute('placeholder', 'Mensaje... (limite: ' + limit + ' caracteres)');
  chatMessage.setAttribute('aria-label', 'Mensaje... (limite: ' + limit + ' caracteres)');
  chatMessage.setAttribute('maxlength', limit);
}