const send = document.getElementById("send");
const Chat = function () {
	function Chat () {
		this.socket = null;
		this.init();
	}
	var p = Chat.prototype,
		cache = document.createElement("div"),
		info = null,
		peopel = null,
		msg = null,
		pickname = null,
		login = false;
	p.init = function () {
		this.socket = io.connect();
		// 监听connect事件(表示连接已经建立)
		this.socket.on("connect", () => {
			L(".loading").css({
				display: "none"
			});
			L(".enter-name").css({
				display: "block"
			});	
			initDom();			
			this.login();
			this.system();
		});
	};
	p.login = function () {
		// 对昵称进行判断
		L("#send-name").click(() => {
			const send = pickname.val();
			if (send.trim()) {
				this.socket.emit("login", send);
			} else {
				info.text("your pickname can't be blank or just spaces");
			}
		});
		this.socket.on("loginSuccess", () => {
			login = true;
			L("#mask").css({
				display: "none"
			});
		});
		this.socket.on("repeat", () => {
			info.text("your pickname is token, please use another");
		});
	};
	p.system = function () {
		this.socket.on("system", (data) => {
			if (login) {
				updateUser(data);
			}
		});
	};
	function updateUser (data) {
		peopel.text(data.size);
		if (data.flag)
			msg.get(0).appendChild(getDom(`<div class="user-log">欢迎${data.pickname}加入群聊！</div>`));
		else 
			msg.get(0).appendChild(getDom(`<div class="user-log">${data.pickname}离开群聊！</div>`));
	}
	function initDom () {
		info = L(".info");
		peopel = L("#peopel");
		msg = L(".msg");
		pickname = L("#pickname");
	}
	function getDom (html) {
		cache.innerHTML = html;
		return cache.childNodes[0];
	}
	return Chat;
}();
// 页面加载完成初始化Chat
L(window).load(() => {
	new Chat();
});