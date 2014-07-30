
module.exports = function () {
	return function (irc) {
		if (typeof irc.channels === 'undefined') {
			throw new Error('The channels ircsock plugin depends must be loaded before the channel-log plugin.');
		}

		irc.channels = {};

		var emit = irc.emit;
		irc.emit = function (name, ev) {
			emit.apply(this, arguments);
			if (name === 'data' || !ev.target) {return;}

			// capture all non-data events with a target attribute, indicating it is likely a channel event

			var channel = this.getChannel(ev.target);
			if (!channel) {return;}

			if (!Array.isArray(channel.log)) {
				channel.log = [];
			}

			channel.log.push({
				event: event,
				data: ev,
				time: Date.now()
			});
		};

	};
};
