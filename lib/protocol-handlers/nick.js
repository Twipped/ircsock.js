
module.exports = function () {
	return function (irc) {
		irc.changeNick = function (nickname, fn) {
			if (this.stream) {
				this.write('NICK ' + nickname, fn);
			} else {
				if (typeof fn === 'function') {fn();}
			}
		};

		irc.on('data', function (msg) {
			if (msg.command !== 'NICK') {return;}

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				newNick: msg.trailing,
				isSelf: msg.nick === this.nick
			};

			if (e.isSelf) {
				this.nick = e.newNick;
				irc.emit('nick:self', e);
			}

			irc.emit('nick', e);
		});
	};
};
