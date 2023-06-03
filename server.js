
const express = require("express")
const path = require("path")
const http = require("http")
const socketio = require("socket.io")
const formatMessage = require("./utils/messages")
const {userJoin, getCurrentUser, userLeave, getRoomUsers} = require("./utils/users")

const app = express()
const server = http.createServer(app)
const io = socketio(server)

const port = process.env.PORT || 3000;

app.use(express.static(path.join(__dirname, 'public')));

const botName = 'Chatbot'

//run when the client connect
io.on('connection', socket => {
    socket.on('joinRoom', ({ username, room }) => {

        const user = userJoin(socket.id, username, room);
        socket.join(user.room);

        //welcome current user
        socket.emit('message', formatMessage(botName, 'Welcome to ChatCord!'))

        //Broadcast when a user connects
        socket.broadcast.to(user.room).emit('message', formatMessage(botName, `${user.username} has joined the chat`))

        //show users that are present in the room
        io.to(user.room).emit('roomUsers', {
            room: user.room,
            users: getRoomUsers(user.room)
        })
    })

    //Listen for chat message from user
    socket.on('chatMessage', msg => {
        const userName = getCurrentUser(socket.id);
        io.to(userName.room).emit('message', formatMessage(userName.username, msg))
    })

    //runs when the client disconnects
    socket.on("disconnect", () => {
        const user = userLeave(socket.id)
        if(user){
            io.to(user.room).emit("message", formatMessage(botName, `${user.username} has left the chat`))

            // Update room users list
            io.to(user.room).emit("roomUsers", {
                room: user.room,
                users: getRoomUsers(user.room),
            });
        }
    })
})

server.listen(port, function () {
    console.log("Server started on port 3000");
});