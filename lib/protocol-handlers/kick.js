
module.exports = function () {
	return function (irc) {
		irc.on('data', function (msg) {
			if (msg.command !== 'KICK') {return;}

			var params = msg.params.split(' ');

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: params[0].toLowerCase(),
				client: params[1],
				message: msg.trailing,
				isSelf: params[0].toLowerCase() === this.nick,
				raw: msg.string
			};

			if (e.isSelf) {
				this.emit('kick:self', e);
			}

			irc.emit('kick', e);
		});
	};
};
