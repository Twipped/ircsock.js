
module.exports = function () {
	return function (irc) {
		irc.on('RPL_WELCOME', function (msg, nickname, message) {
			irc.nick = nickname;
			irc.emit('welcome', nickname, message);
		});
	};
};
