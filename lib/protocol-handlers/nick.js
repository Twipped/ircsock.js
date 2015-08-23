
module.exports = function () {
	return function (irc) {
		irc.changeNick = function (nickname, fn) {
			if (this.stream) {
				this.write('NICK ' + nickname, fn);
			} else {
				if (typeof fn === 'function') {fn();}
			}
		};

		irc.on('NICK', function (msg) {
			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				newNick: msg.trailing,
				isSelf: msg.nick === this.nick,
				raw: msg.string
			};

			if (e.isSelf) {
				this.nick = e.newNick;
				irc.emit('nick:self', e);
			}

			irc.emit('nick', e);
		});
	};
};
