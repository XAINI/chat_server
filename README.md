chat_server (socket.io)
===============
```{bash}
基于 node.js + socket.io 的即时聊天服务

在 rails 工程的 /app/views/layoutes/application.html.erb 文件中进行如下配置 (放置在 </head> 之前)

<script src="https://cdn.socket.io/socket.io-1.4.5.js"></script>
<script>
  var socket = io.connect('http://(你的服务器 ip 地址):8080/');
</script>

```

Detail
==================

http://blog.fens.me/nodejs-socketio-chat/

https://github.com/bsspirit/chat-websocket/

Install
==================

```{bash}
git clone https://github.com/XAINI/chat_server.git
cd chat_server
npm install
npm install express --registry=https://registry.npm.taobao.org
npm install socket.io
node app.js
```

