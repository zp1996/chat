"use strict";

var img = new Image();
var Chat = function () {
	function Chat() {
		this.socket = null;
		this.init();
	}
	var cache = {
		del: function del(id) {
			if (currentUser.ele === id) {
				currentUser.ele = cache["group"].user;
			}
			userEle.get(0).removeChild(cache[id].user.get(0));
			msgArea.removeChild(cache[id].ele.get(0));
			delete cache[id];
		}
	},
	    myself = "我",
	    group = "group",
	    toPClass = "to-private";
	var p = Chat.prototype,
	    cacheDiv = document.createElement("div"),
	    info,
	    peopel,
	    msgArea,
	    nickname,
	    append,
	    userEle,
	    currentUser = {},
	    cacheName,
	    msgBox,
	    login = false;
	p.init = function () {
		var _this = this;

		this.socket = io.connect();
		// 监听connect事件(表示连接已经建立)
		this.socket.on("connect", function () {
			L(".loading").hide();
			L(".enter-name").show();
			initDom.call(_this);
			_this.login();
			_this.register();
		});
	};
	p.register = function () {
		// 登录成功
		this.socket.on("loginSuccess", function () {
			login = true;
			L("#mask").hide();
		});
		// 用户名重复
		this.socket.on("repeat", function () {
			info.text("your nickname is token, please use another");
		});
		// 私聊
		this.socket.on("pcmsg", function (data) {
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
		this.socket.on("nouser", function () {
			append("<p class=\"attention\">\u8BE5\u7528\u6237\u5DF2\u7ECF\u4E0B\u7EBF</p>", msgBox.get(0));
		});
		// 群聊新消息
		this.socket.on("newmsg", function (nickname, message) {
			cache[group].num += 1;
			otherMsg(nickname, message);
		});
		// 用户管理
		this.socket.on("system", function (data) {
			if (login) {
				updateUser(data);
			}
		});
	};
	p.login = function () {
		var _this2 = this;

		// 对昵称进行判断
		L("#send-name").click(function () {
			cacheName = nickname.val();
			if (cacheName.trim()) {
				_this2.socket.emit("login", cacheName);
			} else {
				info.text("your nickname can't be blank or just spaces");
			}
		});
	};
	p.initSend = function () {
		var _this3 = this;

		L("#send").click(function () {
			var ele = L("#msg-input"),
			    message = ele.val();
			if (message.trim()) {
				var target = currentUser.ele;
				ele.val("");
				meMsg(message, msgBox.get(0));
				if (target === group) {
					_this3.socket.emit("postmsg", message);
				} else {
					_this3.socket.emit("pc", {
						target: target,
						msg: message
					});
				}
			}
			ele.get(0).focus();
		});
	};
	function updateUser(data) {
		peopel.text(data.size);
		if (data.flag) {
			append("<div class=\"user-in\">\n\t\t\t\t\u6B22\u8FCE\n\t\t\t\t<img class=\"user-img " + toPClass + "\" alt=\"" + (data.nickname === cacheName ? myself : data.nickname) + "\" src=\"images/face.jpeg\" />\n\t\t\t\t<strong class=\"user-name\">" + data.nickname + "</strong> \n\t\t\t\t\u52A0\u5165\u7FA4\u804A\uFF01\n\t\t\t</div>");
		} else {
			otherMsg("system", "\u7528\u6237 " + data.nickname + " \u5DF2\u7ECF\u79BB\u5F00\u7FA4\u804A");
		}
	}
	function BaseMsg(user, message, me, dom) {
		me = me ? "me-" : "";
		var html = "<div class=\"" + me + "chat-info\">\n\t\t\t<img class=\"user-normal-img " + toPClass + "\" alt=\"" + user + "\" src=\"images/face.jpeg\" />\n\t\t\t<span class=\"time\">\n\t\t\t\t<strong class=\"user-name\">" + user + "</strong> \n\t\t\t\t" + formatDate() + "\n\t\t\t</span>\n\t\t\t<span class=\"" + me + "message\">\n\t\t\t\t" + message + "\n\t\t\t</span>\n\t\t</div>";
		append(html, dom);
	}
	function otherMsg(user, message, dom) {
		BaseMsg(user, message, false, dom);
	}
	function meMsg(message, dom) {
		BaseMsg(myself, message, true, dom);
	}
	function initDom() {
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
			get: function get() {
				return user.data("id");
			},
			set: function set(val) {
				var id = val.data("id");
				user.removeClass("active");
				val.addClass("active");
				msgBox.removeClass("show");
				if (cache[id]) {
					msgBox = cache[id]["ele"];
					msgBox.addClass("show");
					cache[id].num = 0;
				} else {
					var dom = createMsgBox(id);
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
	}
	function setNum(id) {
		var num = 0;
		var ele = cache[id].user.find(".count");
		Object.defineProperty(cache[id], "num", {
			get: function get() {
				return num;
			},
			set: function set(val) {
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
	function createMsgBox(id, hide) {
		var dom = L("<div class=\"msg" + (hide ? "" : " show") + "\" data-id=" + id + ">\n\t\t\t\t<p class=\"attention\">\u4E0E" + id + "\u79C1\u804A\u4E2D</p>\n\t\t\t</div>");
		msgArea.appendChild(dom.get(0));
		return dom;
	}
	function createUserBox(id) {
		return L("<li class=\"user\" data-id=\"" + id + "\">\n\t\t\t\t<img class=\"user-img-style\", src=\"images/face.jpeg\" />\n\t\t\t\t" + id + "\n\t\t\t\t<span class=\"count\">0</span>\n\t\t\t\t<span class=\"close\">\u2573</span>\n\t\t\t</li>");
	}
	function BindImgClick() {
		L("#group").click(function (e) {
			var cur = e.target;
			if (~cur.className.indexOf(toPClass) && cur.alt !== "我") {
				var id = cur.alt;
				if (!cache[id]) {
					var dom = createUserBox(id);
					userEle.get(0).appendChild(dom.get(0));
					currentUser.ele = dom;
				}
				currentUser.ele = cache[id].user;
			}
		});
	}
	function BindUserClick() {
		userEle.click(function (e) {
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
	function release(dom) {
		dom = dom.parentNode;
		cache.del(dom.getAttribute("data-id"));
	}
	function getDom(html) {
		cacheDiv.innerHTML = html;
		return cacheDiv.childNodes[0];
	}
	function MsgAppend(ldom) {
		var ele = ldom.get(0);
		return function (html, dom) {
			var e = dom || ele;
			e.appendChild(getDom(html));
			e.scrollTop = e.scrollHeight;
		};
	}
	function formatDate() {
		var date = new Date();
		return date.getFullYear() + "/" + date.getMonth() + "/" + date.getDate() + "  " + date.getHours() + ":" + fillTo(date.getMinutes()) + ":" + fillTo(date.getSeconds());
	}
	function fillTo(str) {
		return String(str).length < 2 ? "0" + str : str;
	}
	return Chat;
}();
// 页面加载完成初始化Chat
L(window).load(function () {
	new Chat();
	// loading headimg
	img.src = "images/face.jpeg";
	img.onerror = function () {
		this.src = "images/logo.png";
	};
});