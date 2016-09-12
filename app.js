//引入程序包
var express = require('express')
  , path = require('path')
  , app = express()
  , server = require('http').createServer(app)
  , io = require('socket.io').listen(server);

//设置日志级别
io.set('log level', 1); 

var userNameAry = [];

//WebSocket连接监听
io.on('connection', function (socket) {
  socket.emit('open');//通知客户端已连接

  // 构造客户端对象
  var client = {
    socket:socket,
    name:false,
    color:getColor()
  }
  // 对message事件的监听
  socket.on('message', function(msg, userName){
    var obj = {time:getTime(),color:client.color};

    client.name = userName;
    obj['text'] = msg;
    obj['author'] = client.name; 
    obj['type'] = 'message'; 
    console.log(client.name + ' say: ' + msg); 

    // 返回消息（可以省略）
    socket.emit('message', obj); 
    // 广播向其他用户发消息
    socket.broadcast.emit('message', obj); 

    
    userNameAry.push(client.name);
    socket.emit('search', userNameAry);
    socket.broadcast.emit('search', userNameAry);

    // 判断是不是第一次连接，以第一条消息作为用户名
    // if(!client.name){
    //   client.name = userName;
    //   obj['text'] = client.name;
    //   obj['author'] = 'System';
    //   obj['type'] = 'welcome';

    //   //返回欢迎语
    //   socket.emit('system', obj);
    //   //广播新用户已登陆
    //   socket.broadcast.emit('system', obj);

    //   userNameAry.push(client.name);
    //   socket.emit('search', userNameAry);
    //   socket.broadcast.emit('search', userNameAry);

    // }else{
    //   //如果不是第一次的连接，正常的聊天消息
    //   obj['text'] = msg;
    //   obj['author'] = client.name; 
    //   obj['type'] = 'message'; 
    //   console.log(client.name + ' say: ' + msg); 

    //   // 返回消息（可以省略）
    //   socket.emit('message', obj); 
    //   // 广播向其他用户发消息
    //   socket.broadcast.emit('message', obj); 
    // }
  });

  //监听出退事件
  socket.on('disconnect', function () {  
    var obj = {
      time:getTime(),
      color:client.color,
      author:'System',
      text:client.name,
      type:'disconnect'
    };

    var idx = userNameAry.indexOf(client.name);
    userNameAry.splice(idx, 1);
    socket.broadcast.emit('search', userNameAry);
    // 广播用户已退出
    socket.broadcast.emit('system',obj);
    console.log(client.name + 'Disconnect');
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

var getTime = function(){
  var date = new Date();
  return date.getHours()+":"+date.getMinutes()+":"+date.getSeconds();
}

var getColor = function(){
  var colors = ['#e21400', '#91580f', '#f8a700', '#f78b00',
    '#58dc00', '#287b00', '#a8f07a', '#4ae8c4',
    '#3b88eb', '#3824aa', '#a700ff', '#d300e7'];
  return colors[Math.round(Math.random() * 10000 % colors.length)];
}