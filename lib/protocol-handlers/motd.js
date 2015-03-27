
module.exports = function () {
	return function (irc) {
		var motd = [];
		var raw = [];

		irc.on('data', function (msg) {
			switch (msg.command) {
			case "RPL_MOTDSTART":
				raw = [msg.string];
				motd = [];
				/* falls through */
			case "RPL_ENDOFMOTD":
			case "RPL_MOTD":
				motd.push(msg.trailing);
				raw.push(msg.string);
				break;
			}

			if (msg.command === "RPL_ENDOFMOTD") {
				irc.emit('motd', motd.join('\n'), raw);
				raw = [];
				motd = [];
			}
		});
	};
};
