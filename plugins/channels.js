
var assign = require('lodash.assign');

module.exports = function () {
	return function (irc) {
		irc.channels = {};

		irc.getChannel = function (channel, create) {
			if (!channel) return;

			channel = channel.toLowerCase();
			if (!irc.channels[channel] && create) {
				irc.channels[channel] = {
					members: {}
				};
			}
			return irc.channels[channel];
		};

		irc.on('join', function (ev) {
			var channel = irc.getChannel(ev.target, true);
			channel.members[ev.nick] = {
				nick: ev.nick,
				host: ev.host
			};
		});

		irc.on('part', function (ev) {
			var channel = irc.getChannel(ev.target);
			if (!channel) {return;}

			if (channel.members[ev.nick]) {
				delete channel.members[ev.nick];
			}
		});

		irc.on('part:self', function (ev) {
			var channelName = ev.target.toLowerCase();

			if (irc.channels[channelName]) {
				delete irc.channels[channelName];
			}
		});

		irc.on('kick', function (ev) {
			var channelName = ev.target.toLowerCase();

			if (ev.isSelf) {
				delete irc.channels[channelName];
			} else if (irc.channels[channelName]) {
				delete irc.channels[channelName].members[ev.nick];
			}
		});

		irc.on('quit', function (ev) {
			// figure out what channels this user was in and extend the event.
			var inChannels = [];
			var nick = ev.nick;
			Object.keys(irc.channels).forEach(function (channelName) {
				var channel = irc.getChannel(channelName);

				if (channel.members[nick]) {
					inChannels.push(channel);

					delete channel.members[nick];

					var channelEvent = assign({}, ev);
					channelEvent.target = channelName;
					irc.emit('quit:channel', channelEvent);
				}
			});
			ev.targets = inChannels;
		});

		irc.on('quit:self', function () {
			irc.channels = {};
		});

		irc.on('names', function (ev) {
			var channel = irc.getChannel(ev.target);

			if (!channel) {return;}

			ev.names.forEach(function (name) {
				channel.members[name.nick] = assign(channel.members[name.nick] || {}, name);
			});
		});

		irc.on('nick', function (ev) {
			var inChannels = [];

			Object.keys(irc.channels).forEach(function (channelName) {
				var channel = irc.getChannel(channelName);

				if (channel.members[ev.nick]) {
					inChannels.push(channel);

					var user = channel.members[ev.nick];
					delete channel.members[ev.nick];
					channel.members[ev.newNick] = user;

					var channelEvent = assign({}, ev);
					channelEvent.target = channelName;
					irc.emit('nick:channel', channelEvent);
				}
			});

			ev.targets = inChannels;
		});

		irc.on('privmsg', function (ev) {
			var channel = irc.getChannel(ev.target);
			if (!channel) return;

			var user = channel.members[ev.nick] || (channel.members[ev.nick] = {nick: ev.nick});
			user.host = ev.host;
			user.lastSeen = Date.now();
		});

		irc.on('notice', function (ev) {
			var channel = irc.getChannel(ev.target);
			if (!channel) {return;}

			var user = channel.members[ev.nick] || (channel.members[ev.nick] = {nick: ev.nick});
			user.host = ev.host;
			user.lastSeen = Date.now();
		});

		irc.on('mode:channel', function (ev) {
			var channel = irc.getChannel(ev.target);
			if (!channel) return;

			var i = ev.modes.length;
			while (i-- > 0) {
				var m = ev.modes[i];
				switch (m.mode) {
				case 'o':
					channel.members[m.target].op = m.delta;
					break;
				case 'k':
					channel.members[m.target].voice = m.delta;
					break;
				}
			}
		});

		irc.on('topic', function (ev) {
			var channel = irc.getChannel(ev.target);
			if (!channel) return;

			channel.topic = ev.message;
			if (ev.nick) {
				channel.topicBy = ev.nick;
			}
		});

		irc.on('topic:time', function (ev) {
			var channel = irc.getChannel(ev.target);
			if (!channel) return;

			channel.topicBy = ev.nick;
			channel.topicSet = ev.time;
		});
	};
};
