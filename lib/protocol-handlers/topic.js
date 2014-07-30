
module.exports = function () {
	return function (irc) {
		irc.topic = function (channel, topic, fn) {
			if (typeof topic === 'function') {
				fn = topic;
				topic = '';
			}

			this.write('TOPIC ' + channel + (topic && ' :' + topic || ''), fn);
		};

		irc.on('data', function (msg) {
			var channel, params = msg.params.split(' ');

			if (msg.command === 'RPL_TOPIC_WHO_TIME') {
				irc.emit('topic:time', {
					target: params[1],
					nick: params[2],
					time: new Date(params[3])
				});
				return;
			}


			switch (msg.command) {
			case 'RPL_NOTOPIC':
			case 'RPL_TOPIC':
				channel = params[1];
				break;

			case 'TOPIC':
				channel = msg.params;
				break;

			default:
				return;
			}

			var e = {};
			if (msg.command === 'TOPIC') {e.nick = msg.nick;}
			e.channel = channel.toLowerCase();
			e.topic = msg.trailing;
			irc.emit('topic', e);
		});
	};
};
