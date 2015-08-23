
var CTCP_CODE = '\u0001';
var CTCP_MATCH = /\u0001(\w+) ?(.*)\u0001/;

module.exports = function () {
	return function (irc) {
		irc.notice = function (target, msg, fn) {
			this.write('NOTICE ' + target + ' :' + msg, fn);
		};

		irc.ctcpReply = function (command, target, msg, fn) {
			msg = CTCP_CODE + command + ' ' + msg + CTCP_CODE;
			this.notice(target, msg, fn);
		};

		irc.on('NOTICE', function (msg) {
			var e = {
				nick:    msg.nick,
				host:    msg.hostmask,
				target:  msg.params.toLowerCase(),
				message: msg.trailing,
				raw: msg.string
			};

			if (!msg.nick || e.target === '*') {
				e.server = true;
			} else if (e.target === this.nick) {
				e.toSelf = true;
			}

			var ctcp;
			if ((ctcp = e.message.match(CTCP_MATCH))) {
				e.command = ctcp[1].toUpperCase();
				e.message = ctcp[2];
				e.method = 'NOTICE';
				if (e.command === 'ACTION') {
					irc.emit('action', e);
				} else {
					irc.emit('ctcp', e);
					irc.emit('ctcp:reply', e);
				}
			} else {
				irc.emit('notice', e);
			}
		});
	};
};
