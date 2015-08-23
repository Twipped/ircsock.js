
module.exports = function () {
	return function (irc) {
		irc.on('PING', function (msg) {
			irc.write('PONG :' + msg.trailing);
			irc.emit('pingpong');
		});
	};
};
