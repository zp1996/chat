const express = require("express"),
	path = require("path"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server),
	users = {};

app.set("views", "./");
app.set("view engine", "jade");

app.use(express.static(path.join(__dirname, "build/")));

app.get('/', (req, res) => {
	res.render("./index", {
		title: "LsgoChat",
		val: "连接中"
	});
});

io.on("connection", (socket) => {
	// 接受并处理客户端发送的foo事件
	socket.on("login", (nickname) => {
		if (users[nickname]) {
			socket.emit("repeat");			
		} else {
			socket.nickname = nickname;
			users[nickname] = {
				name: nickname,
				socket: socket
			};
			socket.emit("loginSuccess");			
			UsersChange(nickname, true);
		}
	});
	// 用户退出
	socket.on("disconnect", () => {
		delete users[socket.nickname];
		console.log(socket.nickname);
		UsersChange(socket.nickname, false);
	});
	// 用户发消息
	socket.on("postmsg", (msg) => {
		// 通知除自己外的其他用户
		socket.broadcast.emit("newmsg", socket.nickname, msg);
	});
	// 私聊
	socket.on("pc", (data) => {
		var target = data.target;
		if (users[target]) {
			users[target].socket.emit("pcmsg", {
				target: target,
				source: socket.nickname,
				msg: data.msg
			});
		} else {
			socket.emit("nouser");
		}
	});
});

function UsersChange (nickname, flag) {
	io.sockets.emit("system", {
		nickname: nickname,
		size: Object.keys(users).length,
		flag: flag
	});
}

server.listen(6323, () => {
	console.log("server is on: http://localhost:6323/");
});