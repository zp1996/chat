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
	socket.on("login", (pickname) => {
		if (users[pickname]) {
			socket.emit("repeat");			
		} else {
			socket.pickname = pickname;
			users[pickname] = pickname;
			socket.emit("loginSuccess");			
			UsersChange(pickname, true);
		}
	});
	// 用户退出
	socket.on("disconnect", () => {
		delete users[socket.pickname];
		UsersChange(socket.pickname, false);
	});
});

function UsersChange (pickname, flag) {
	io.sockets.emit("system", {
		pickname: pickname,
		size: Object.keys(users).length,
		flag: flag
	});
}

server.listen(6323, () => {
	console.log("server is on: http://localhost:6323/");
});