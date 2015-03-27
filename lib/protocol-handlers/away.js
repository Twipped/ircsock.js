
module.exports = function () {
	return function (irc) {
		irc.on('data', function (msg) {
			if (msg.command !== 'RPL_AWAY') {return;}

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				message: msg.trailing,
				raw: msg.string
			};

			irc.emit('away', e);
		});
	};
};
