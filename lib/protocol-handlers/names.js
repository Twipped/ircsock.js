
module.exports = function () {
	return function (irc) {
		var map = {}, chan;

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
				map[chan] = map[chan] || [];
				map[chan] = map[chan].concat(names);

				break;

			case 'RPL_ENDOFNAMES':
				chan = msg.params.split(' ')[1].toLowerCase();

				irc.emit('names', {
					target: chan,
					names: map[chan]
				});

				delete map[chan];
				break;
			}
		});
	};
};
