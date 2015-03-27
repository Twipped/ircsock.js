
module.exports = function () {
	return function (irc) {
		irc.on('data', function (msg) {
			if (msg.command !== 'RPL_WELCOME') {return;}

			irc.nick = msg.params;
			irc.emit('welcome', irc.nick, msg.string);
		});
	};
};
