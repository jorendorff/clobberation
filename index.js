require('es6-promise').polyfill();
var app = require('express')();
var server = require('http').Server(app);
var io = require('socket.io')(server);

app.get('/', function (req, res) {
  res.sendFile(__dirname + "/index.html");
});

var text = "";

io.on('connection', function (socket) {
  socket.on('update', function (msg) {
    text = msg;
    socket.broadcast.emit('update', msg);
  });
  socket.emit('update', text);  
});

server.listen(3000, function () {
  console.log('listening on *:3000');
});

exports.server = server;
exports.reset = function () { text = ""; };
