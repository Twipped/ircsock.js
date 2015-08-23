
var CTCP_CODE = '\u0001';
var CTCP_MATCH = /\u0001(\w+) ?(.*)\u0001/;

module.exports = function () {
	return function (irc) {
		irc.privmsg = function (target, msg, fn) {
			return this.write('PRIVMSG ' + target + ' :' + msg, fn);
		};

		irc.ctcpSend = function (command, target, msg, fn) {
			msg = CTCP_CODE + command + ' ' + msg + CTCP_CODE;
			return this.privmsg(target, msg, fn);
		};

		irc.action = function (target, msg, fn) {
			return this.ctcpSend('ACTION', target, msg, fn);
		};

		irc.on('PRIVMSG', function (msg) {
			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				target: msg.params.toLowerCase(),
				message: msg.trailing,
				raw: msg.string
			};

			if (e.target === '*') {
				e.server = true;
			} else if (e.target === this.nick) {
				e.toSelf = true;
			}

			var ctcp;
			if ((ctcp = e.message.match(CTCP_MATCH))) {
				e.command = ctcp[1].toUpperCase();
				e.message = ctcp[2];
				e.method = 'PRIVMSG';
				if (e.command === 'ACTION') {
					irc.emit('action', e);
				} else {
					irc.emit('ctcp', e);
					irc.emit('ctcp:request', e);
				}
			} else {
				irc.emit('privmsg', e);
			}
		});
	};
};
