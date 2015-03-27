
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

		irc.on('data', function (msg) {
			if (msg.command !== 'PART') {return;}

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				message: msg.trailing,
				isSelf: msg.nick === this.nick,
				raw: msg.string
			};

			// a part message can contain multiple channels.
			var targets = msg.params.split(',').map(function (chan) {
				return chan.toLowerCase();
			});

			var i = targets.length, channelEvent;
			while (i-- > 0) {
				channelEvent = Object.create(e);
				channelEvent.target = targets[i];

				// emit a part event for each channel the user is leaving.
				this.emit('part', channelEvent);
				if (e.isSelf) {
					this.emit('part:self', channelEvent);
				}
			}

		});
	};
};
