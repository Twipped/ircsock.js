
module.exports = function () {
	return function (irc) {
		irc.on('KICK', function (msg) {
			var params = msg.params.split(' ');

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: params[0],
				client: params[1],
				message: msg.trailing,
				isSelf: params[0].toLowerCase() === this.nick.toLowerCase(),
				raw: msg.string
			};

			if (e.isSelf) {
				this.emit('kick:self', e);
			}

			irc.emit('kick', e);
		});
	};
};
