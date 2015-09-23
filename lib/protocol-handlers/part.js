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
			var targets = msg.params.split(',').map(function (chan) {
				return chan;
			});

			var i = targets.length, channelEvent;
			while (i-- > 0) {
				channelEvent = assign(e, {
					target: targets[1]
				});

				// emit a part event for each channel the user is leaving.
				this.emit('part', channelEvent);
				if (e.isSelf) {
					this.emit('part:self', channelEvent);
				}
			}

		});
	};
};
