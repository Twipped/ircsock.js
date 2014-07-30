
module.exports = function () {
	return function (irc) {
		irc.users = {};

		irc.getUser = function (nick) {
			return this.users[nick] || (this.users[nick] = {nick: nick});
		};

		irc.on('quit', function (ev) {
			delete this.users[ev.nick];
		});

		irc.on('nick', function (ev) {
			var user = this.users[ev.nick];
			if (!user) {return;} //dunno how we got here, but ok

			delete this.users[ev.nick];

			user.nick = ev.newNick;
			this.users[ev.newNick] = user;
		});

		irc.on('join', function (ev) {
			var user = this.getUser(ev.nick);
			user.host = ev.host;
			user.lastSeen = Date.now();
		});

		irc.on('privmsg', function (ev) {
			var user = this.getUser(ev.nick);
			user.host = ev.host;
			user.lastSeen = Date.now();
		});

		irc.on('notice', function (ev) {
			var user = this.getUser(ev.nick);
			user.host = ev.host;
			user.lastSeen = Date.now();
		});

	};
};
