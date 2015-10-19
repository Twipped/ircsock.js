
module.exports = function () {
	return function (irc) {

		function handler (msg, target) {
			var params = msg.splitParams.slice(1).concat(msg.trailing.split(' '));
			var modes = processModes(params);

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: target,
				modes: modes,
				raw: msg.string
			};

			irc.emit('mode', e);

			if (irc.isTargetChannel(e.target)) {
				irc.emit('mode:channel', e);
			} else {
				irc.emit('mode:user', e);
			}
		}

		irc.on('RPL_CHANNELMODEIS', handler);
		irc.on('MODE', handler);
	};
};

var targeted = {
	l: true,
	b: true,
	o: true,
	v: true,
	h: true
};

function processModes (params) {
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
			target: targeted[token] && params.shift(),
			delta: delta
		});
	}

	return modes;
}
