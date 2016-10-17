/*引入程序包*/
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

/*设置日志级别*/
io.set('log level', 1); 

var users = {};/* 单聊存储用户 */
var roomInfo = {}; /* 讨论组存储讨论组信息 */
var loginUser = [] /* 存储登录用户 */

/*WebSocket连接监听*/
io.on('connection', function (socket) {
  var url = socket.request.headers.referer;
  var splited = url.split('/');
  var roomID = splited[splited.length - 1];
  var user = '';
  var sender = '';

/*单聊*/
  socket.on('private message', function(from, to, msg){
    if (from in users){
      if (to in users ) {
        users[to].emit('private',{from: from, mess: msg});
      }else{
        socket.emit('offline', {sender: from, msg: msg, receiver: to});
        /* 如果用户已经登录 socket 广播消息 */
        if (loginUser.indexOf(to) != -1) {
          socket.broadcast.emit('platform private info', {sender: from, category: '私聊'});
        }
      }
    }
  });

  socket.on('new user', function(data){
    sender = data
    if(data in users){
      console.log("用户已存在用户列表中!");
    }else{
      var nickname = data;
      users[nickname] = socket;
    }
  });

/*讨论组
  获取请求建立 socket 连接的 url*/
  socket.on('join', function(userName){
    user = userName;

    /*将用户加入到房间名单中*/
    if (!roomInfo[roomID]) {
      roomInfo[roomID] = [];
    } 
    roomInfo[roomID].push(user);
    socket.join(roomID);
    io.to(roomID).emit("sys", user + "进入讨论组", roomInfo[roomID]);
  });

  socket.on('leave', function(){
    socket.emit('disconnect');
  });

/*对message事件的监听*/
  socket.on('message', function(msg, members, groupName){
    /* 当前用户是否成功加入讨论组 */
    if (roomInfo[roomID].indexOf(user) == -1) {
      return false;
    }
    /*  如果用户没有进入讨论组将消息发布到 rails 保存(离线消息保存) */
    for (var i = 0; i < members.length; i++) {
      /* 如果用户不在房间中保存消息 */
      if (roomInfo[roomID].indexOf(members[i]) == -1) {
        socket.emit('group offline', {roomID: roomID, sender: user, msg: msg, receiver: members[i]});

        /* 如果用户已经登录 socket 广播消息 */
        if (loginUser.indexOf(members[i]) != -1) {
          socket.broadcast.emit('platform info', {roomID: roomID, groupName: groupName, category: '讨论组'});
        }
      }
    }

    io.to(roomID).emit('msg', user, msg);

  });

/*监听退出事件*/
  socket.on('disconnect', function () {  
    /* 单聊(用户退出则从数组中移除) */
    if (sender) {
      delete users[sender];
    }

    /* 将用户从讨论组名单中移除 */
    if (user) {
      if (roomInfo[roomID].indexOf(user) != -1) {
        roomInfo[roomID].splice(roomInfo[roomID].indexOf(user), 1);
      }
      socket.leave(roomID);    /*退出房间*/
      io.to(roomID).emit('sys', user + '离开了房间', roomInfo[roomID]);
    }
  });

/* 将登录用户保存 */
  socket.on('login', function(data){
    if (loginUser.indexOf(data) != -1) {
      console.log('您已经登录过了');
    }else{
      loginUser.push(data);
      /* 如果用户成功保存到数组中提示用户登录成功 */
      if (loginUser.indexOf(data) != -1) {
        socket.emit('prompt', {info: '登录成功 !'});
      }
    }
  });

/* 将登录用户从登录用户数组中移除 */ 
  socket.on('logout', function(data){
    idx = loginUser.indexOf(data);
    if (idx != -1) {
      loginUser.splice(idx, 1);
      if (loginUser.indexOf(data) == -1) {
        socket.emit('prompt', {info: '用户登出 !'});
      }
    }
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