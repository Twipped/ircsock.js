
module.exports = function () {
	var EXPIRE_AFTER = 10;
	return function (irc) {
		var map = {};

		function lookup (nickname) {
			if (!map[nickname] || map[nickname].timestamp < Date.now() - EXPIRE_AFTER) {
				map[nickname] = {
					timestamp: Date.now(),
					target:    nickname,
					nickname:  nickname,
					username:  null,
					hostname:  null,
					realname:  null,
					server:    null,
					channels:  [],
					away:      false,
					oper:      false,
					idle:      false,
					raw:       []
				};
			}
			return map[nickname];
		}

		irc.on('RPL_WHOISUSER', function (msg, nickname, username, hostname, realname) {
			var whois = lookup(nickname);
			whois.raw.push(msg.string);

			whois.nickname = nickname;
			whois.username = username;
			whois.hostname = hostname;
			whois.realname = realname;
		});

		irc.on('RPL_WHOISCHANNELS', function (msg, nickname, channels) {
			var whois = lookup(nickname);
			whois.raw.push(msg.string);

			//append to the channels array
			whois.channels.push.apply(whois.channels, channels);
		});

		irc.on('RPL_WHOISSERVER', function (msg, nickname, server) {
			var whois = lookup(nickname);
			whois.raw.push(msg.string);

			whois.server = server;
		});

		irc.on('RPL_AWAY', function (msg, nickname, message) {
			var whois = map[nickname];
			if (!whois) {return;}

			whois.raw.push(msg.string);

			whois.away = message;
		});

		irc.on('RPL_WHOISOPERATOR', function (msg, nickname) {
			var whois = lookup(nickname);
			whois.raw.push(msg.string);

			whois.oper = true;
		});

		irc.on('RPL_WHOISIDLE', function (msg, nickname, seconds) {
			var whois = lookup(nickname);
			whois.raw.push(msg.string);

			whois.idle = seconds;
		});

		irc.on('RPL_ENDOFWHOIS', function (msg, nickname) {
			var whois = lookup(nickname);
			whois.raw.push(msg.string);

			irc.emit('whois', whois);
		});


		var pending = {};
		irc.whois = function (target, mask, fn) {
			if (typeof mask === 'function') {
				fn = mask;
				mask = '';
			}

			if (fn) {
				pending[target] = fn;
			}

			this.write(['WHOIS', target, mask].filter(Boolean).join(' '));
		};

		irc.on('whois', function (e) {
			if (typeof pending[e.target] === 'function') {
				pending[e.target](null, e);
				pending[e.target] = undefined;
			}
		});

		irc.on('ERR_NOSUCHNICK', function (msg, nickname) {
			if (typeof pending[nickname] === 'function') {
				pending[nickname]({error: 'No such nickname', target: nickname, raw: msg.string});
				pending[nickname] = undefined;
			}
		});


	};
};
