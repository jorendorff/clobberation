"use strict";

require('es6-promise').polyfill();
var app = require('express')();
var server = require('http').Server(app);
var io = require('slow.io')(server);

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

var port = Number(process.env.PORT) || 3001;
server.listen(port, function () {
  console.log('listening on *:' + port);
});

exports.server = server;
exports.reset = function () { text = ""; };
