const express = require("express"),
	path = require("path"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server),
	users = {},
	MAX_LEAVE_TIME = 300,
	PONG_TIME = 3000,
	port = process.env.port || 2017;

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
	// 用户登录
	socket.on("login", (nickname) => {
		if (users[nickname] || nickname === "system") {
			socket.emit("repeat");
		} else {
			socket.nickname = nickname;
			users[nickname] = {
				name: nickname,
				socket: socket,
				lastSpeakTime: nowSecond()
			};
			socket.emit("loginSuccess");
			UsersChange(nickname, true);
		}
	});
	// 用户退出
	socket.on("disconnect", () => {
		if (socket.nickname && users[socket.nickname]) {
			delete users[socket.nickname];
			UsersChange(socket.nickname, false);
		}
	});
	// 用户发消息
	socket.on("postmsg", (msg) => {
		// 通知除自己外的其他用户
		users[socket.nickname].lastSpeakTime = nowSecond();
		socket.broadcast.emit("newmsg", socket.nickname, msg);
	});
	// 私聊
	socket.on("pc", (data) => {
		var target = data.target;
		users[socket.nickname].lastSpeakTime = nowSecond();
		if (users[target]) {
			users[target].socket.emit("pcmsg", {
				target: target,
				source: socket.nickname,
				msg: data.msg
			});
		} else {
			const msg = target === "system" ? "傲娇的system管理员不陪聊~" : "该用户已经下线";
			socket.emit("nouser", msg);
		}
	});
	// 心跳检测
	socket.on("pong", (id) => {
		socket.emit("ping");
	});
});
function pong () {
	const now = nowSecond();
	for (let k in users) {
		if (users[k].lastSpeakTime + MAX_LEAVE_TIME < now) {
			var socket = users[k].socket;
			users[k].socket.emit("disconnect");
			socket.emit("nouser", "由于长时间未说话，您已经掉线，请重新刷新页面");
			socket = null;
		}
	}
}
// 心跳检测
setInterval(pong, PONG_TIME);
function UsersChange (nickname, flag) {
	io.sockets.emit("system", {
		nickname: nickname,
		size: Object.keys(users).length,
		flag: flag
	});
}
function nowSecond () {
	return Math.floor(new Date() / 1000);
}

server.listen(port, () => {
	console.log(`server is on: http://localhost:{port}/`);
});
