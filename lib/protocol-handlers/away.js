
module.exports = function () {
	return function (irc) {
		irc.on('RPL_AWAY', function (msg) {

			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				message: msg.trailing,
				raw: msg.string
			};

			irc.emit('away', e);
		});
	};
};
