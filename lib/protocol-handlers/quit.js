
module.exports = function () {
	return function (irc) {
		irc.quit = function (msg, fn) {
			msg = msg || 'Bye!';
			this.write('QUIT :' + msg);

			var self = this;

			// wait one second for server response before forcing disconnect.
			// callback will be invoked when the socket closes

			setTimeout(function () {
				if (fn) {
					self.removeListener('close', fn);
				}
				self.close(fn);
			}.bind(this), 1000);

			if (fn) {
				this.once('close', fn);
			}
		};

		irc.on('QUIT', function (msg) {
			var e = {
				nick: msg.nick,
				host: msg.hostmask,
				message: msg.trailing,
				isSelf: msg.nick === this.nick,
				raw: msg.string
			};

			irc.emit('quit', e);

			if (e.isSelf) {
				this.emit('quit:self', e);
			}
		});
	};
};
