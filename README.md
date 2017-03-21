# chat
基于`express`与`socket.io`的简易聊天室，[在线地址][1]，浏览器端`js`实现利用到了自己仿照`zepto`写的一套工具方法[LSGO.js][2]。
注意防止`XSS`攻击，需要对输入的内容进行转义：
```
function encodeHTML (val) {
    return String(val)
      .replace(/&/g, "&amp;")
      .replace(/</g, "&lt;")
      .replace(/>/g, "&gt;")
      .replace(/"/g, "&quot;")
      .replace(/'/g, "&#39;");
};
```

  [1]: http://101.201.70.218/lsgo-chat/
  [2]: https://github.com/zp1996/LSGO.js


