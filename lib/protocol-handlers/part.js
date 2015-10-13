var assign = require('lodash.assign');

module.exports = function () {
	return function (irc) {
		irc.part = function (channels, msg, fn) {
			if (typeof msg === 'function') {
				fn = msg;
				msg = '';
			}

			if (!Array.isArray(channels)) {
				channels = [channels];
			}

			this.write('PART ' + channels.join(',') + ' :' + msg, fn);
		};

		irc.on('PART', function (msg) {
			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				message: msg.trailing,
				isSelf: msg.nick === this.nick,
				raw: msg.string
			};

			// a part message can contain multiple channels.
			msg.params.split(',').forEach(function (target) {
				target = target.trim();
				if (!target) return;

				var channelEvent = assign({}, e, {
					target: target
				});

				irc.emit('part', channelEvent);
				if (e.isSelf) {
					irc.emit('part:self', channelEvent);
				}
			});

		});
	};
};
