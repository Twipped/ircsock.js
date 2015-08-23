
module.exports = function () {
	return function (irc) {
		var motd = [];
		var raw = [];

		irc.on('RPL_MOTDSTART', function (msg, message) {
			raw = [message];
			motd = [];
		});

		irc.on('RPL_MOTD', function (msg, message) {
			motd.push(message);
			raw.push(msg.string);
		});

		irc.on('RPL_ENDOFMOTD', function (msg, message) {
			motd.push(message);
			raw.push(msg.string);

			irc.emit('motd', motd.join('\n'), raw);

			raw = [];
			motd = [];
		});
	};
};
