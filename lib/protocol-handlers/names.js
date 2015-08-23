
module.exports = function () {
	return function (irc) {
		var map = {};
		var raw = {};

		irc.on('RPL_NAMREPLY', function (msg, channel, names) {
			irc.emit('names:partial', {
				target: channel,
				names: names,
				raw: msg.string
			});

			if (!map[channel]) {
				map[channel] = [];
				raw[channel] = [];
			}

			map[channel] = map[channel].concat(names);
			raw[channel].push(msg.string);
		});

		irc.on('RPL_ENDOFNAMES', function (msg, channel) {
			irc.emit('names', {
				target: channel,
				names: map[channel],
				raw: raw[channel]
			});

			map[channel] = raw[channel] = undefined;
		});

		irc.names = function (channel, fn) {
			var self = this;
			channel = channel.toLowerCase();

			var cb = function (ev) {
				if (ev.target !== channel) {return;}

				self.removeListener('names', cb);
				if (typeof fn === 'function') {fn(null, ev.names);}
			};
			this.on('names', cb);

			this.write('NAMES ' + channel);
		};
	};
};
