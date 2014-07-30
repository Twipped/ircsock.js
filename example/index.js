var rc = require('rc');

var config = rc('ircsock', {
	name: 'Freenode',
	host: 'irc.freenode.net',
	port: 6667,
	ssl: false,
	nickname: 'iotest' + Math.round(Math.random() * 100),
	username: 'username',
	realname: 'realname',
	password: null
});

var IRC = require('../index.js');
var irc = new IRC(config);

var commands = {
	'quit': function () {irc.quit();},
	'join': function (channel) {irc.join(channel);},
	'part': function (channel) {irc.part(channel);},
	'msg' : function (target)  {irc.privmsg(target, this.segments.slice(1).join(' '));}
};


var inout = require('./inout')();
inout.on('quit', function () {process.exit(0);});
inout.on('data', function (text) {
	if (text[0] === '/') {
		var segments = text.substr(1).split(' ');
		var command = segments.shift();
		if (commands[command]) {
			commands[command].apply({
				args: segments.join(' '),
				segments: segments
			}, segments);
		}
	} else {
		irc.write(text);
	}
});


var emit = irc.emit;
irc.emit = function (name, data) {
	emit.apply(this, arguments);
	if (!name || name === 'data') {return;}

	inout.output(name.toUpperCase() + ': ' + JSON.stringify(data));
};

irc.on('close', function () {process.exit(0);});
irc.on('end', function () {process.exit(0);});

irc.connect();
