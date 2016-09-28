//引入程序包
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//设置日志级别
io.set('log level', 1); 

// var userNameAry = []; //群聊
var users = {};
var roomInfo = {};

//WebSocket连接监听
io.on('connection', function (socket) {
  // 首次连接时将用户名保存到 userNameAry 数组中
  // socket.emit('open');
  // socket.on('add user', function(name){
  //   console.log("传到 server 中的用户名为:" + name);
  //   if (userNameAry.length == 0) {
  //     userNameAry.push(name);
  //   }else{
  //     var tag = false;
  //     for (var i = 0; i < userNameAry.length; i++) {
  //       if (userNameAry[i] == name) {
  //         return true;
  //       }
  //     }
  //     if (tag == false) {
  //       userNameAry.push(name);
  //     }
  //   }
  //   socket.emit('search', userNameAry);
  //   socket.broadcast.emit('search', userNameAry); 
  // });

  // 构造客户端对象
  var client = {
    socket:socket,
    name:false,
    color:getColor()
  }

  // 单聊
  socket.on('private message', function(from, to, msg){
    console.log('I received a private message by ', from, ' say to ',to, msg);
    if (to in users) {
      users[to].emit('to'+to,{from:from, mess:msg});
    }
  });

  socket.on('new user', function(from, to){
    // if(data in users){

    // }else{
    var fromName = from;
    var toName = to;
    users[fromName] = socket;
    users[toName] = socket;
    // }
  });


  // 讨论组
  // 获取请求建立 socket 连接的 url
  var url = socket.request.headers.referer;
  var splited = url.split('/');
  var roomID = splited[splited.length - 1];
  var user = '';

  socket.on('join', function(userName){
    user = userName;

    console.log("roomID为:"+roomID);

    // 将用户加入到房间名单中
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





  // 对message事件的监听
  socket.on('message', function(msg, userName){
    // var obj = {time:getTime(),color:client.color};

    // client.name = userName;
    // if(!client.name){

    // }
    // obj['text'] = msg;
    // obj['author'] = client.name; 
    // obj['type'] = 'message'; 
    // console.log(client.name + ' say: ' + msg); 

    // // 返回消息（可以省略）
    // socket.emit('message', obj); 
    // // 广播向其他用户发消息
    // socket.broadcast.emit('message', obj); 

    // 验证如果用户不在房间内则不给发送
    if (roomInfo[roomID].indexOf(user) == -1) {  
      return false;
    }
    io.to(roomID).emit('msg', user, msg);

  });

  //监听退出事件
  socket.on('disconnect', function () {  
    // var obj = {
    //   time:getTime(),
    //   color:client.color,
    //   author:'System',
    //   text:client.name,
    //   type:'disconnect'
    // };

    // 从房间名单中移除
    // var index = roomInfo[roomID].indexOf(user);
    // if (index != -1) {
    //   roomInfo[roomID].splice(index, 1);
    // }
    socket.leave(roomID);    // 退出房间
    io.to(roomID).emit('sys', user + '离开了房间', roomInfo[roomID]);
    console.log(user + '退出了' + roomID);


    // var idx = userNameAry.indexOf(client.name);
    // userNameAry.splice(idx, 1);
    // socket.broadcast.emit('search', userNameAry);
    // 广播用户已退出
    // socket.broadcast.emit('system',obj);
    // console.log(client.name + 'Disconnect');
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

// var getTime = function(){
//   var date = new Date();
//   return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
// }

// var getColor = function(){
//   var colors = ['#e21400', '#91580f', '#f8a700', '#f78b00',
//     '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
//     '#3b88eb', '#3824aa', '#a700ff', '#d300e7'];
//   return colors[Math.round(Math.random() * 10000 % colors.length)];
// }