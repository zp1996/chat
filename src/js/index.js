const img = new Image();
function formatDate () {
	const date = new Date();
	return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}  ${date.getHours()}:${date.getMinutes()}:${date.getSeconds()}`;
}
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
		nickname = null,
		append = null,
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
			initDom.call(this);			
			this.login();
			this.system();
			this.newmsg();
		});
	};
	p.login = function () {
		// 对昵称进行判断
		L("#send-name").click(() => {
			const send = nickname.val();
			if (send.trim()) {
				this.socket.emit("login", send);
			} else {
				info.text("your nickname can't be blank or just spaces");
			}
		});
		this.socket.on("loginSuccess", () => {
			login = true;
			L("#mask").css({
				display: "none"
			});
		});
		this.socket.on("repeat", () => {
			info.text("your nickname is token, please use another");
		});
	};
	p.system = function () {
		this.socket.on("system", (data) => {
			if (login) {
				updateUser(data);
			}
		});
	};
	p.newmsg = function () {
		this.socket.on("newmsg", (nickname, message) => {
			otherMsg(nickname, message);
		});
	};
	p.initSend = function () {
		L("#send").click(() => {
			const ele = L("#msg-input"),
				message = ele.val();
			if (message.trim()) {
				ele.val("");
				meMsg(message);
				this.socket.emit("postmsg", message);
			}
			ele.get(0).focus();
		});
	};
	function updateUser (data) {
		peopel.text(data.size);
		if (data.flag) {
			append(`<div class="user-in">
				欢迎
				<img class="user-img" src="images/face.jpeg" />
				<strong class="user-name">${data.nickname}</strong> 
				加入群聊！
			</div>`);
		} else { 
			otherMsg("system", `用户 ${data.nickname} 已经离开群聊`)
		}
	}
	function BaseMsg (user, message, me) {
		me = me ? "me-" : "";
		const html = `<div class="${me}chat-info">
			<img class="user-normal-img" src="images/face.jpeg" />
			<span class="time">
				<strong class="user-name">${user}</strong> 
				${formatDate()}
			</span>
			<span class="${me}message">
				${message}
			</span>
		</div>`;
		append(html);
	}
	function otherMsg (user, message) {
		BaseMsg(user, message, false);
	}
	function meMsg (message) {
		BaseMsg("我", message, true);
	}
	function initDom () {
		info = L(".info");
		peopel = L("#peopel");
		msg = L(".msg");
		nickname = L("#nickname");
		nickname.get(0).focus();
		append = MsgAppend(msg);
		this.initSend();
	}
	function getDom (html) {
		cache.innerHTML = html;
		return cache.childNodes[0];
	}
	function MsgAppend (ldom) {
		const ele = ldom.get(0);
		return function (html) {
			ele.appendChild(getDom(html));
			ele.scrollTop = ele.scrollHeight;
		};
	}
	return Chat;
}();
// 页面加载完成初始化Chat
L(window).load(() => {
	new Chat();
	// loading headimg
	img.src = "images/face.jpeg";
	img.onerror = function () {
		this.src = "images/logo.png";
	};
});