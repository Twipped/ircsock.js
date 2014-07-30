
var CHANNEL_MATCH = /^[^a-zA-Z0-9]/;

module.exports = function () {
	return function (irc) {
		irc.on('data', function (msg) {
			if (msg.command !== 'MODE') {return;}

			var target = msg.params;
			var params = msg.trailing.split(' ');
			var modes = [];

			var flags = params.shift().split('');
			var token, delta = null;
			var i = 0, c = flags.length;

			for (;i < c;i++) {
				token = flags[i];
				if (token === '+') {delta = true;continue;}
				if (token === '-') {delta = false;continue;}
				modes.push({
					mode: token,
					target: params.shift(),
					delta: delta
				});
			}

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: target,
				modes: modes
			};

			irc.emit('mode', e);

			if (e.target.match(CHANNEL_MATCH)) {
				irc.emit('mode:channel', e);
			} else {
				irc.emit('mode:user', e);
			}
		});
	};
};
