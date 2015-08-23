
module.exports = function () {
	return function (irc) {
		irc.invite = function (name, channel, fn) {
			this.write('INVITE ' + name + ' ' + channel, fn);
		};

		irc.on('INVITE', function (msg) {
			var params = msg.params.split(' ');

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: params[1],
				client: params[0],
				raw: msg.string
			};

			irc.emit('invite', e);

		});
	};
};
