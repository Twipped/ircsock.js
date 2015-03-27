
module.exports = function () {
	return function (irc) {
		var map = {};
		var raw = {};

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

		irc.on('data', function (msg) {
			var chan;
			switch (msg.command) {
			case 'RPL_NAMREPLY':
				chan = msg.params.split(/ [=@*] /)[1].toLowerCase();
				var names = msg.trailing.split(' ').map(function (name) {
					return {
						nick: name.replace(/[@+]/g, ''),
						op: name.indexOf('@') > -1,
						halfop: name.indexOf('%') > -1,
						voice: name.indexOf('+') > -1
					};
				});

				irc.emit('names:partial', {
					target: chan,
					names: names,
					raw: msg.string
				});

				if (!map[chan]) {
					map[chan] = [];
					raw[chan] = [];
				}

				Array.prototype.push.apply(map[chan], names);
				raw[chan].push(msg.string);

				break;

			case 'RPL_ENDOFNAMES':
				chan = msg.params.split(' ')[1].toLowerCase();

				irc.emit('names', {
					target: chan,
					names: map[chan],
					raw: raw[chan]
				});

				map[chan] = raw[chan] = undefined;
				break;
			}
		});
	};
};
