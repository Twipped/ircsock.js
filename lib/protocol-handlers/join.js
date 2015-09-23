
module.exports = function () {
	return function (irc) {
		irc.join = function (channels, password, fn) {
			if (!Array.isArray(channels)) {
				channels = [channels];
			}

			if (typeof password === 'function') {
				fn = password;
				password = null;
			}

			this.write('JOIN ' + channels.join(',') + (password ? ' ' + password : ''), fn);
		};

		irc.on('JOIN', function (msg) {
			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: (msg.params.trim() || msg.trailing.trim()),
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
