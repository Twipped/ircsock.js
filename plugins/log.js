module.exports = function () {
	return function (irc) {
		irc.log = [];

		var emit = irc.emit;
		irc.emit = function (name, data) {
			emit.apply(this, arguments);
			if (name === 'data') {return;}

			this.log.push({
				event: name,
				data: data,
				time: Date.now()
			});
		};

	};
};
