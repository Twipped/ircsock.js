
module.exports = function () {
	return function (irc) {
		var map = {};
		irc.whois = function (target, mask, fn) {
			var self = this;

			if (typeof mask === 'function') {
				fn = mask;
				mask = '';
			}

			if (fn) {
				var cb = function (ev) {
					if (ev.target !== target) {return;}

					self.removeListener('whois', cb);
					if (typeof fn === 'function') {fn(null, ev.names);}
				};
				this.on('whois', cb);
			}
			this.write(['WHOIS', target, mask].filter(Boolean).join(' '));
		};


		irc.on('data', function (msg) {
			var params, target, err;
			switch (msg.command) {
			case 'RPL_WHOISUSER':
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				if (!map[target]) {
					map[target] = {
						raw: [msg.string]
					};
				}
				map[target].target   = target;
				map[target].nickname = params[1];
				map[target].username = params[2];
				map[target].hostname = params[3];
				map[target].realname = msg.trailing;
				map[target].channels = [];
				map[target].oper = false;
				break;
			case 'RPL_WHOISCHANNELS':
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				var channels = msg.trailing.split(' ');
				map[target].channels = map[target].channels.concat(channels);
				map[target].raw.push(msg.string);
				break;
			case 'RPL_WHOISSERVER':
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				map[target].server = params[2];
				map[target].raw.push(msg.string);
				break;
			case 'RPL_AWAY':
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				if (!map[target]) {return;}
				map[target].away = msg.trailing;
				map[target].raw.push(msg.string);
				/* falls through */
			case 'RPL_WHOISOPERATOR':
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				map[target].oper = true;
				map[target].raw.push(msg.string);
				/* falls through */
			case 'RPL_WHOISIDLE':
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				map[target].idle = params[2]; // new Date(now - (n * 1000))
				map[target].sign = params[3]; // new Date(n * 1000)
				map[target].raw.push(msg.string);
				break;
			case 'RPL_ENDOFWHOIS':
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				if (!map[target]) {return;}
				map[target].raw.push(msg.string);
				irc.emit('whois', map[target]);
				break;
			case 'ERR_NEEDMOREPARAMS':
				err = 'Not enough parameters';
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				if (target !== 'whois') {return;}
				irc.emit('whois', {error: err, target: target, raw: msg.string});
				break;
			case 'ERR_NOSUCHSERVER':
				err = 'No such server';
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				irc.emit('whois', {error: err, target: target, raw: msg.string});
				break;
			case 'ERR_NOSUCHNICK':
				err = 'No such nick/channel';
				params = msg.params.split(' ');
				target = params[1].toLowerCase();
				irc.emit('whois', {error: err, target: target, raw: msg.string});
				break;
			}
		});
	};
};
