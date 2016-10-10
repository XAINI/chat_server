/*引入程序包*/
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

/*设置日志级别*/
io.set('log level', 1); 

// var userNameAry = []; /*群聊*/
var users = {};
var roomInfo = {};

//WebSocket连接监听
io.on('connection', function (socket) {
  console.log('hello');
  var url = socket.request.headers.referer;
  var splited = url.split('/');
  var roomID = splited[splited.length - 1];
  var user = '';

  /*单聊*/
  socket.on('private message', function(from, to, msg){
    user = from
    if (from in users){
      if (to in users ) {
        // console.log(users[to]);
        users[to].emit('private',{from: from, mess: msg});
        console.log('message emited');
      }
    }
  });

  socket.on('new user', function(data){
    console.log("用户名为" + data);
    if(data in users){
      console.log("用户已存在用户列表中!");
    }else{
      var nickname = data;
      users[nickname] = socket;
    }
  });

  console.log(Object.getOwnPropertyNames(users).length);


  /*讨论组
  获取请求建立 socket 连接的 url*/
  socket.on('join', function(userName){
    user = userName;

    console.log("roomID为:"+roomID);

    /*将用户加入到房间名单中*/
    if (!roomInfo[roomID]) {
      roomInfo[roomID] = [];
    } 
    roomInfo[roomID].push(user);
    socket.join(roomID);
    io.to(roomID).emit("sys", user + "进入房间", roomInfo[roomID]);
    console.log(user + "进入了" + roomID);
  });

  socket.on('leave', function(){
    socket.emit('disconnect');
  });





  /*对message事件的监听*/
  socket.on('message', function(msg, userName){
    if (roomInfo[roomID].indexOf(user) == -1) {  
      return false;
    }
    io.to(roomID).emit('msg', user, msg);

  });

  /*监听退出事件*/
  socket.on('disconnect', function () {  

    // socket.leave(roomID);    /*退出房间*/
    // io.to(roomID).emit('sys', user + '离开了房间', roomInfo[roomID]);

    console.log(user + '退出了' + roomID);
  });
  
});

app.configure('development', function(){
  app.use(express.errorHandler());
});

app.get('/', function(req, res){
  res.send('<h1>welcome</h1>');
});

server.listen(8080, function(){
  console.log("Express server listening on port: *8080");
});