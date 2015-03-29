
module.exports = function () {
	return function (irc) {
		irc.join = function (channels, fn) {
			if (!Array.isArray(channels)) {
				channels = [channels];
			}

			this.write('JOIN ' + channels.join(','), fn);
		};

		irc.on('data', function (msg) {
			if (msg.command !== 'JOIN') {return;}

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: (msg.params.trim() || msg.trailing.trim()).toLowerCase(),
				isSelf: msg.nick === this.nick,
				raw: msg.string
			};

			if (e.isSelf) {
				this.emit('join:self', e);
			}

			irc.emit('join', e);

		});
	};
};
