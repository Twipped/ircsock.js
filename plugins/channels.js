
module.exports = function () {
	return function (irc) {
		irc.channels = {};

		irc.getChannel = function (channel, create) {
			return this.channels[channel] || (create && (this.channels[channel] = {
				users: []
			}));
		};

		irc.on('join', function (ev) {
			var channel = this.getChannel(ev.target, true);
			channel.users[ev.nick] = {
				nick: ev.nick,
				host: ev.host
			};
		});

		irc.on('part', function (ev) {
			if (this.channels[ev.target] && this.channels[ev.target].users[ev.nick]) {
				delete this.channels[ev.target].users[ev.nick];
			}
		});

		irc.on('part:self', function (ev) {
			if (this.channels[ev.target]) {
				delete this.channels[ev.target];
			}
		});

		irc.on('kick', function (ev) {
			if (ev.nick === this.nick) {
				delete this.channels[ev.target];
			} else if (this.channels[ev.target]) {
				delete this.channels[ev.target].users[ev.nick];
			}
		});

		irc.on('quit', function (ev) {
			// figure out what channels this user was in and extend the event.
			var activeChannels = Object.keys(this.channels);
			var inChannels = [];
			var i = activeChannels.length, channelEvent;
			while (i-- > 0) {
				if (this.channels[activeChannels[i]].users[ev.nick]) {
					inChannels.push(activeChannels[i]);
					delete this.channels[activeChannels[i]].users[ev.nick];

					channelEvent = Object.create(ev);
					channelEvent.target = activeChannels[i];
					this.emit('quit:channel', channelEvent);
				}
			}
			ev.targets = activeChannels;
		});

		irc.on('quit:self', function () {
			this.channels = {};
		});

		irc.on('names', function (ev) {
			var channel = this.channels[ev.target];
			if (!channel) {return;}

			var i = ev.names.length, name, user;
			while (i-- > 0) {
				name = ev.names[i];
				user = channel.users[name.nick] || (channel.users[name.nick] = {nick: name.nick});
				user.isOperator = name.isOperator;
				user.hasVoice = name.hasVoice;
			}
		});

		irc.on('nick', function (ev) {
			var activeChannels = Object.keys(this.channels), channel;
			var user, channelEvent;
			var i = activeChannels.length;
			while (i-- > 0) {
				channel = activeChannels[i];
				if (this.channels[channel].users[ev.nick]) {
					user = this.channels[channel].users[ev.nick];
					delete this.channels[channel].users[ev.nick];
					this.channels[channel].users[ev.newNick] = user;

					channelEvent = Object.create(ev);
					channelEvent.target = channel;
					this.emit('nick:channel', channelEvent);
				}
			}
		});

		irc.on('privmsg', function (ev) {
			var channel = this.channels[ev.target];
			if (!channel) {return;}

			var user = channel.users[name.nick] || (channel.users[name.nick] = {nick: name.nick});
			user.host = ev.host;
			user.lastSeen = Date.now();
		});

		irc.on('notice', function (ev) {
			var channel = this.channels[ev.target];
			if (!channel) {return;}

			var user = channel.users[name.nick] || (channel.users[name.nick] = {nick: name.nick});
			user.host = ev.host;
			user.lastSeen = Date.now();
		});

		irc.on('mode:channel', function (ev) {
			var channel = this.getChannel(ev.target);

			var i = ev.modes.length;
			while (i-- > 0) {
				var m = ev.modes[i];
				switch (m.mode) {
				case 'o':
					channel.users[m.target].isOperator = m.delta;
					break;
				case 'k':
					channel.users[m.target].hasVoice = m.delta;
					break;
				}
			}
		});

		irc.on('topic', function (ev) {
			var channel = this.getChannel(ev.channel);
			channel.topic = ev.topic;
			if (ev.nick) {
				channel.topicBy = ev.nick;
			}
		});

		irc.on('topic:time', function (ev) {
			var channel = this.getChannel(ev.channel);

			channel.topicBy = ev.nick;
			channel.topicSet = ev.time;
		});
	};
};
