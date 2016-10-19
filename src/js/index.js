const img = new Image();
const Chat = function () {
	function Chat () {
		this.socket = null;
		this.init();
	}
	const cache = {
			del: function (id) {
				if (currentUser.ele === id) {
					currentUser.ele = cache["group"].user;
				}
				userEle.get(0).removeChild(cache[id].user.get(0));
				msgArea.removeChild(cache[id].ele.get(0));
				delete cache[id];
			}
		}, myself = "我", group = "group", 
		toPClass = "to-private",
		imageRE = /^image\//;
	var p = Chat.prototype,
		cacheDiv = document.createElement("div"),
		info, peopel, msgArea, nickname, append, userEle,
		currentUser = {}, cacheName, msgBox,
		login = false;
	p.init = function () {
		this.socket = io.connect();
		// 监听connect事件(表示连接已经建立)
		this.socket.on("connect", () => {
			L(".loading").hide();
			L(".enter-name").show();	
			initDom.call(this);			
			this.login();
			this.register();
		});
	};
	p.register = function () {
		// 登录成功
		this.socket.on("loginSuccess", () => {
			login = true;
			L("#mask").hide();
		});
		// 用户名重复
		this.socket.on("repeat", () => {
			info.text("your nickname is token, please use another");
		});
		// 私聊
		this.socket.on("pcmsg", (data) => {
			var source = data.source,
				msgBox = null;
			if (!cache[source]) {
				cache[source] = {
					user: createUserBox(source),
					ele: createMsgBox(source, true)
				};
				setNum(source);
				userEle.get(0).appendChild(cache[source].user.get(0));
			}
			cache[source].num += 1;
			msgBox = cache[source].ele;
			otherMsg(source, data.msg, msgBox.get(0));
		});
		// 私聊没有该用户
		this.socket.on("nouser", (msg) => {
			append(`<p class="attention">${msg}</p>`, msgBox.get(0));
		});
		// 群聊新消息
		this.socket.on("newmsg", (nickname, message) => {
			cache[group].num += 1;
			otherMsg(nickname, message);
		});
		// 用户管理
		this.socket.on("system", (data) => {
			if (login) {
				updateUser(data);
			}
		});
	};
	p.login = function () {
		// 对昵称进行判断
		L("#send-name").click(() => {
			cacheName = nickname.val();
			if (cacheName.trim()) {
				this.socket.emit("login", cacheName);
			} else {
				info.text("your nickname can't be blank or just spaces");
			}
		});
	};
	p.initSend = function () {
		L("#send").click(() => {
			const ele = L("#msg-input"),
				message = ele.val();
			if (message.trim()) {
				const target = currentUser.ele;
				ele.val("");
				this.message(target, message);
			}
			ele.get(0).focus();
		});
	};
	p.message = function (target, msg) {
		meMsg(msg, msgBox.get(0));
		if (target === group) {
			this.socket.emit("postmsg", msg);
		} else {
			this.socket.emit("pc", {
				target: target,
				msg: msg
			});
		}
	};
	p.initImg = function () {
		const ele = L("#file"),
			self = this;
		L("#image").click(() => {
			ele.get(0).click();
		});
		ele.change(function () {
			if (this.files.length !== 0) {
				const file = this.files[0];
				if (imageRE.test(file.type)) {
					const reader = new FileReader();
					reader.onload = (e) => {
						this.value = "";
						self.message(currentUser.ele, BurnImg(e.target.result));
					};
					reader.readAsDataURL(file);
				}
			}
		});
	};
	function updateUser (data) {
		peopel.text(data.size);
		if (data.flag) {
			append(`<div class="user-in">
				欢迎
				<img class="user-img ${toPClass}" alt="${data.nickname === cacheName ? myself : data.nickname}" src="images/face.jpeg" />
				<strong class="user-name">${data.nickname}</strong> 
				加入群聊！
			</div>`);
		} else { 
			otherMsg("system", `用户 ${data.nickname} 已经离开群聊`)
		}
	}
	function BaseMsg (user, message, me, dom) {
		me = me ? "me-" : "";
		const html = `<div class="${me}chat-info">
			<img class="user-normal-img ${toPClass}" alt="${user}" src="images/face.jpeg" />
			<span class="time">
				<strong class="user-name">${user}</strong> 
				${formatDate()}
			</span>
			<span class="${me}message">
				${message}
			</span>
		</div>`;
		append(html, dom);
	}
	function otherMsg (user, message, dom) {
		BaseMsg(user, message, false, dom);
	}
	function meMsg (message, dom) {
		BaseMsg(myself, message, true, dom);
	}
	function BurnImg (url) {
		return `<img src="${url}" class="msg-img" />`
	}
	function initDom () {
		var user = L(".active"); 
		msgBox = L(".show");
		info = L(".info");
		peopel = L("#peopel");
		msgArea = L("#msg-area").get(0);
		nickname = L("#nickname");
		userEle = L("#users");
		cache[group] = {
			user: user,
			ele: msgBox
		};
		setNum(group);
		msgBox.show();
		Object.defineProperty(currentUser, "ele", {
			get: () => {
				return user.data("id");
			},
			set: (val) => {
				const id = val.data("id");
				user.removeClass("active");
				val.addClass("active");
				msgBox.removeClass("show");
				if (cache[id]) {
					msgBox = cache[id]["ele"];
					msgBox.addClass("show");
					cache[id].num = 0;
				} else {
					const dom = createMsgBox(id);
					msgArea.appendChild(dom.get(0));
					msgBox = dom;
					cache[id] = {
						user: val,
						ele: msgBox
					};
					setNum(id);
				}
				msgBox.get(0).scrollTop = msgBox.get(0).scrollHeight;
				user = val;
			}
		});
		nickname.get(0).focus();
		BindUserClick();
		BindImgClick();
		append = MsgAppend(cache[group].ele);
		this.initSend();
		this.initImg();
	}
	function setNum (id) {
		var num = 0;
		const ele = cache[id].user.find(".count");
		Object.defineProperty(cache[id], "num", {
			get: () => {
				return num;
			},
			set: function (val) {
				if (currentUser.ele === id) return void 0;
				if (val === 0) {
					ele.css({ visibility: "hidden" });
				} else if (val === 1) {
					ele.css({ visibility: "visible" });
				}
				num = val;
				ele.text(num);
			}
		});
	}
	function createMsgBox (id, hide) {
		const dom = L(`<div class="msg${hide ? "" : " show"}" data-id=${id}>
				<p class="attention">与${id}私聊中</p>
			</div>`);
		msgArea.appendChild(dom.get(0));
		return dom;
	}
	function createUserBox (id) {
		return L(`<li class="user" data-id="${id}">
				<img class="user-img-style", src="images/face.jpeg" />
				${id}
				<span class="count">0</span>
				<span class="close">╳</span>
			</li>`);
	}
	function BindImgClick () {
		L("#group").click((e) => {
			var cur = e.target;
			if (~cur.className.indexOf(toPClass) && cur.alt !== "我") {
				const id = cur.alt;
				if (!cache[id]) {
					const dom = createUserBox(id);
					userEle.get(0).appendChild(dom.get(0));
					currentUser.ele = dom;
				}
				currentUser.ele = cache[id].user;
			}
		});
	}
	function BindUserClick () {
		userEle.click((e) => {
			var cur = e.target;
			if (cur.className === "close") {
				release(cur);
				return void 0;
			}
			while (cur.tagName !== "LI") {
				cur = cur.parentNode;
			}
			currentUser.ele = L(cur);
		});
	}
	function release (dom) {
		dom = dom.parentNode;
		cache.del(dom.getAttribute("data-id"));
	}
	function getDom (html) {
		cacheDiv.innerHTML = html;
		return cacheDiv.childNodes[0];
	}
	function MsgAppend (ldom) {
		var ele = ldom.get(0);
		return function (html, dom) {
			const e = dom || ele;
			e.appendChild(getDom(html));
			e.scrollTop = e.scrollHeight;
		};
	}
	function formatDate () {
		const date = new Date();
		return `${date.getFullYear()}/${date.getMonth()}/${date.getDate()}  ${date.getHours()}:${fillTo(date.getMinutes())}:${fillTo(date.getSeconds())}`;
	}
	function fillTo (str) {
		return String(str).length < 2 ? `0${str}` : str;
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