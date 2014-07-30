
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

			var e = {};
			e.nick = msg.nick;
			e.host = msg.hostmask;
			e.newNick = msg.trailing;

			if (msg.nick === this.nick) {
				this.nick = msg.trailing;
				irc.emit('nick:self', e);
			}

			irc.emit('nick', e);
		});
	};
};
