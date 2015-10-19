
module.exports = function () {
	return function (irc) {
		irc.topic = function (channel, topic, fn) {
			if (typeof topic === 'function') {
				fn = topic;
				topic = '';
			}

			this.write('TOPIC ' + channel + (topic && ' :' + topic || ''), fn);
		};

		irc.on('RPL_NOTOPIC', function (msg, channel) {
			var e = {};
			e.target = channel;
			e.message = null;
			e.raw = msg.string;
			irc.emit('topic', e);
		});

		irc.on('RPL_TOPIC', function (msg, channel, topic) {
			var e = {};
			e.target = channel;
			e.message = topic;
			e.raw = msg.string;
			irc.emit('topic', e);
		});

		irc.on('RPL_TOPIC_WHO_TIME', function (msg, channel, author, time) {
			irc.emit('topic:time', {
				target: channel,
				nick: author.split('!')[0],
				hostmask: author.split('!')[1],
				time: new Date(parseFloat(time)*1000),
				raw: msg.string
			});
		});

		irc.on('TOPIC', function (msg) {
			var e = {};
			e.nick = msg.nick;
			e.target = msg.params.split(' ')[0];
			e.message = msg.trailing;
			e.raw = msg.string;
			irc.emit('topic', e);
			irc.emit('topic:changed', e);
		});
	};
};
