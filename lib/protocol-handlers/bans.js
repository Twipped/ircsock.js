
module.exports = function () {
	return function (irc) {
		var map = {};
		var raw = {};

		irc.on('RPL_BANLIST', function (msg, channel, mask, author, time) {

			var e = {
				target: channel,
				mask: mask,
				author: author,
				time: new Date(parseFloat(time)*1000),
				raw: msg.string
			};

			irc.emit('channel:bans:partial', e);

			if (!map[channel]) {
				map[channel] = [];
				raw[channel] = [];
			}

			map[channel].push({
				mask: e.mask,
				author: e.author,
				time: e.time
			});
			raw[channel].push(msg.string);
		});

		irc.on('RPL_ENDOFBANLIST', function (msg, channel) {
			irc.emit('channel:bans', {
				target: channel,
				bans: map[channel],
				raw: raw[channel]
			});

			irc.emit('channel:bans:for:' + channel, {
				target: channel,
				bans: map[channel],
				raw: raw[channel]
			});

			map[channel] = raw[channel] = undefined;
		});

		irc.getBans = function (channel, fn) {
			var self = this;

			if (typeof fn === 'function') {
				this.once('channel:bans:for:' + channel, fn);
			}

			this.write('MODE ' + channel + '+b');
		};
	};
};
