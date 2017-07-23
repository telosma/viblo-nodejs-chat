var express = require('express'),
	app = express(),
	server = require('http').createServer(app),
	io = require('socket.io').listen(server),
	users = {};
server.listen(process.env.PORT || 5000);

app.use(express.static(__dirname + '/public'));
app.get('/', function(req, res){
	res.sendfile(__dirname + '/chatui.html');
});

io.sockets.on('connection', function(socket){
	socket.on('new user', function(name, data){
			if (name in users){
				data(false);
			}else{
				data(true);
			socket.nickname = name;
			users[socket.nickname] = socket;
			console.log('add nickName');
			updateNickNames();
		}

	});

	function updateNickNames(){
		io.sockets.emit('usernames', Object.keys(users));
	}
	socket.on('open-chatbox', function(data){
		users[data].emit('openbox', {nick: socket.nickname});
	});
	socket.on('send message',function(data, sendto){
		users[sendto].emit('new message',{msg: data, nick: socket.nickname, sendto: sendto});
		users[socket.nickname].emit('new message',{msg: data, nick: socket.nickname, sendto: sendto});

		console.log(data);
	});
	socket.on('disconnect', function(data){
		if (!socket.nickname) return;
		delete users[socket.nickname];
		updateNickNames();
	});
});
