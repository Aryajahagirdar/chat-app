const chatForm = document.getElementById('chat-form')
const chatMessages = document.querySelector('.chat-messages')
const userList = document.getElementById('users');
const roomName = document.getElementById('room-name');

//Get username and room from url
const {username, room}  = Qs.parse(location.search, {
    ignoreQueryPrefix: true
})

console.log(username, room)

const socket = io();

//Join chatroom
socket.emit('joinRoom', {username, room});

//Message from server
socket.on('message', message =>{
    console.log(message)
    outputMessage(message)

    chatMessages.scrollTop = chatMessages.scrollHeight;
})

//submit message
chatForm.addEventListener('submit', (e)=>{
    e.preventDefault();

    //get message text
    const msg = e.target.elements.msg.value

    //Emitting message to server
    socket.emit('chatMessage', msg)

    // Clear input field after submitting
    e.target.elements.msg.value = '';
    e.target.elements.msg.focus();
})

//List of room users
socket.on('roomUsers', ({room, users}) => {
    outputRoomName(room)
    outputRoomUsers(users)
  });

//Output function to DOM
function outputMessage(message){
    const div = document.createElement('div')
    div.classList.add('message')
    div.innerHTML = `<p class="meta">${message.username} <span>${message.time}</span></p>
    <p class="text">
        ${message.text}
    </p>`
    document.querySelector('.chat-messages').appendChild(div)
}

//Add room name to DOM
function outputRoomName(room){
    roomName.innerText = room;
}

//Add room users to DOM
function outputRoomUsers(users){
    console.log(users)
    userList.innerHTML = `
    ${users.map(user => `<li>${user.username}</li>`).join('')}
    `
}
