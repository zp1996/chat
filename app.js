const express = require("express"),
	path = require("path"),
	app = express(),
	server = require("http").createServer(app),
	io = require("socket.io").listen(server);	

app.set("views", "./");
app.set("view engine", "jade");

app.use(express.static(path.join(__dirname, "build/")));

app.get('/', (req, res) => {
	res.render("./index", {
		title: "LsgoChat"
	});
});

io.on("connection", (socket) => {
	// 接受并处理客户端发送的foo事件
	socket.on("foo", (data) => {
		console.log(data);
	});
});

server.listen(6323);