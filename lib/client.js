var assign = require('lodash.assign');
var Emitter = require('events').EventEmitter;
var Parser = require('slate-irc-parser');
var replies = require('./replies.json');
var net = require('net');
var tls = require('tls');
var handlers = require('./protocol-handlers');
var replyHandler = require('./reply-handlers');

var connection_counter = 0;

var Client = module.exports = exports = function (options) {
	var self = this;
	Emitter.call(this);

	this.options = assign({
		host: null,
		port: 6667,
		ssl: false,
		nickname: null,
		username: 'username',
		realname: 'realname',
		password: null
	}, options || {});

	this.name = this.options.name || 'Connection ' + (connection_counter++);

	this.parser = new Parser();
	this.parser.on('message', function (msg) {
		if (msg.prefix) {
			var split = msg.prefix.split('!');
			if (split.length > 1) {
				msg.nick = split[0];
				msg.hostmask = split[1];
			} else {
				msg.hostmask = msg.prefix;
			}
		}

		self.emit('data', msg);
		self.emit(msg.command.toUpperCase(), msg);

		// check if the command is a numeric code
		if (replies[msg.command]) {
			// change to the named reply string
			msg.command = replies[msg.command];

			if (msg.command.substr(0,4) === 'RPL_') {
				self.emit('RPL', msg.command, msg);
			} else if (msg.command.substr(0,4) === 'ERR_') {
				self.emit('ERR', msg.command, msg);
			}

			replyHandler(self, msg);
		}
	});

	this.stream = null;

	this.setMaxListeners(100);
	this.registerDefaultHandlers();
};

Client.prototype = Object.create(Emitter.prototype);

Client.prototype.write = function (str, fn) {
	this.stream.write(str + '\r\n', fn);
	return this;
};

Client.prototype.connect = function (options, fn) {
	var self = this;
	if (typeof options === 'function') {
		fn = options;
	} else {
		assign(this.options, options || {});
	}

	if (this.stream) {
		if (fn) {fn();}
		return; // already connected
	}

	if (!this._validateOptions()) {
		if (fn) {fn(new Error('One or more required connection details were missing.'));}
		return;
	}

	this.emit('connecting');

	var stream = this.stream = (this.options.ssl ? tls : net).connect(this.options, function (err) {
		if (err) {
			self.emit('error', err);
			if (fn) {fn(err);}
			return;
		}
		self.emit('connect');
		self._sendHandshake();
		if (fn) {fn();}
	});

	stream.pipe(this.parser);

	stream.on('close', function () {
		// remove the socket stream when the socket closes.
		self.stream = null;
	});

	proxyEvent('error', stream, this);
	proxyEvent('end', stream, this);
	proxyEvent('close', stream, this);

	return this;
};

Client.prototype._validateOptions = function () {
	return this.options.host && this.options.port && this.options.nickname && this.options.username && this.options.realname && true || false;
};

Client.prototype._sendHandshake = function () {
	this.write('USER ' + this.options.username + ' 0 * :' + this.options.realname);
	if (this.options.password) {
		this.write('PASS ' + this.options.password);
	}
	this.write('NICK ' + this.options.nickname);
};

Client.prototype.isConnected = function () {
	return !!this.stream;
};

Client.prototype.close = function (fn) {
	if (!this.stream) {
		if (typeof fn === 'function') {fn();}
		return this;
	}
	this.stream.end(fn);
	return this;
};

Client.prototype.end = Client.prototype.close;

Client.prototype.remoteAddress = function () {
	return this.stream && this.stream.remoteAddress();
};

Client.prototype.use = function (fn) {
	fn(this);
	return this;
};

Client.prototype.registerDefaultHandlers = function () {
	// handlers are in order of frequency of event
	this.use(handlers.pong());
	this.use(handlers.privmsg());
	this.use(handlers.notice());
	this.use(handlers.quit());
	this.use(handlers.join());
	this.use(handlers.part());
	this.use(handlers.nick());
	this.use(handlers.kick());
	this.use(handlers.away());
	this.use(handlers.topic());
	this.use(handlers.names());
	this.use(handlers.mode());
	this.use(handlers.whois());
	this.use(handlers.invite());
	this.use(handlers.welcome());
	this.use(handlers.motd());
};

function proxyEvent (event, source, dest) {
	source.on(event, function () {
		var args = [].slice.call(arguments);
		args.push(event);
		dest.emit.apply(dest, args);
	});
}
