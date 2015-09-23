
module.exports = function () {
	return function (irc) {
		irc.quit = function (msg, fn) {
			if (!this.stream) {
				return fn && fn();
			}

			var self = this;

			// wait one second for server response before forcing disconnect.
			// callback will be invoked when the socket closes

			var timer = setTimeout(function () {
				self.removeListener('end', closed);
				self.removeListener('quit:self', closed);
				self.end(fn);
			}, 1000);

			var closed = function () {
				clearTimeout(timer);
				if (typeof fn === 'function') fn();
			};

			this.once('quit:self', closed);
			this.once('end', closed);

			msg = msg || 'Bye!';
			this.write('QUIT :' + msg);
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
