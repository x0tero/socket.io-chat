const express = require('express');
const { createServer } = require('node:http');
const { Server } = require('socket.io');
const { join } = require('node:path');
const app = express();
const server = createServer(app);
const io = new Server(server);
const PORT = 3000;

app.use(express.static("public"));

const users = {};

io.on("connection", (socket) => {
	console.log("A user connected", socket.id);


	/*
	socket.on("room", function(room) {
		let roomExist = rooms.find((rm) => rm.roomName === room);
		if (roomExist) {
			socket.emit("roomExist", `room ${room} already exist`);
		} else {
			rooms.push({roomId: uuid(), roomName: room});
			socket.emit("roomCreated", `room ${room} has been created`);
		}
	});
	*/


	socket.on("join-room", (username, room) => {
		socket.join(room);
		users[socket.id] = {username, room};
		socket.to(room).emit('user-connected', username)
	});
	
	
	socket.on("send-msg", (msg) => {
		const user = users[socket.id];
		if(user) {
			io.to(user.room).emit('receive-msg', user.username, msg);
		}
	});

	socket.on("disconnect", () => {
		const user = users[socket.id];
        	if (user) {
            		socket.to(user.room).emit('user-disconnected', user.username);
            		delete users[socket.id];
        	}
	});
});

app.get('*',(req, res) => {
	res.sendFile(__dirname + 'public' + req.url);
});


server.listen(PORT, () => {
	console.log(`Server is running on http://localhost:${PORT}`);
});

