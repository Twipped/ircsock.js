
var test    = require('tap').test;
var stubnet = require('stubnet');
var sinon   = require('sinon');

var Client = require('../../lib/client');

test('simple connection negotiation', function (t) {
	// t.plan(15);
	var tp = {pass: t.pass, fail: t.fail};

	var irc = new Client({
		host: 'localhost',
		port: 60000,
		ssl: false,
		nickname: 'NICKNAME',
		username: 'USERNAME',
		realname: 'REALNAME',
		password: 'PASSWORD'
	});

	irc.on('error', function (err) {
		console.error(err);
		t.fail('Client emitted an error');
	});

	var stubs = {};

	irc.on('connect',         (stubs.connect = sinon.stub()));
	irc.on('welcome',         (stubs.welcome = sinon.stub()));
	irc.on('RPL_WELCOME',     (stubs.RPL_WELCOME = sinon.stub()));
	irc.on('RPL_YOURHOST',    (stubs.RPL_YOURHOST = sinon.stub()));
	irc.on('RPL_CREATED',     (stubs.RPL_CREATED = sinon.stub()));
	irc.on('RPL_MYINFO',      (stubs.RPL_MYINFO = sinon.stub()));
	irc.on('RPL_ISUPPORT',    (stubs.RPL_ISUPPORT = sinon.stub()));
	irc.on('RPL_LUSERCLIENT', (stubs.RPL_LUSERCLIENT = sinon.stub()));
	irc.on('RPL_LUSEROP',     (stubs.RPL_LUSEROP = sinon.stub()));
	irc.on('RPL_MOTDSTART',   (stubs.RPL_MOTDSTART = sinon.stub()));
	irc.on('RPL_MOTD',        (stubs.RPL_MOTD = sinon.stub()));
	irc.on('RPL_ENDOFMOTD',   (stubs.RPL_ENDOFMOTD = sinon.stub()));
	irc.on('motd',            (stubs.motd = sinon.stub()));

	stubnet()
		.listenTo({port: 60000, pass: onReady, fail: t.fail})
		.expectConnection(tp)
		.expectData('USER USERNAME 0 * :REALNAME\r\n', tp)
		.expectData('PASS PASSWORD\r\n', tp)
		.expectData('NICK NICKNAME\r\n', tp)
		.thenSend(':server.dev 001 NICKNAME :Welcome to the testing server NICKNAME\r\n')
		.thenSend(':server.dev 002 NICKNAME :Your host is server.dev, running version stubnet-1.0\r\n')
		.thenSend(':server.dev 003 NICKNAME :This server was created Wed Jul 15 2015 at 16:52:09 UTC\r\n')
		.thenSend(':server.dev 004 NICKNAME server.dev stubnet-1.0 DOQRSZaghilopswz CFILMPQSbcefgijklmnopqrstvz bkloveqjfI\r\n')
		.thenSend(':server.dev 005 NICKNAME CHANTYPES=# EXCEPTS INVEX CHANMODES=eIbq,k,flj,CFLMPQScgimnprstz CHANLIMIT=#:120 PREFIX=(ov)@+ MAXLIST=bqeI:100 MODES=4 NETWORK=freenode KNOCK STATUSMSG=@+ CALLERID=g :are supported by this server\r\n')
		.thenSend(':server.dev 005 NICKNAME CASEMAPPING=rfc1459 CHARSET=ascii NICKLEN=16 CHANNELLEN=50 TOPICLEN=390 ETRACE CPRIVMSG CNOTICE DEAF=D MONITOR=100 FNC TARGMAX=NAMES:1,LIST:1,KICK:1,WHOIS:1,PRIVMSG:4,NOTICE:4,ACCEPT:,MONITOR: :are supported by this server\r\n')
		.thenSend(':server.dev 251 NICKNAME :There are 164 users and 92068 invisible on 26 servers\r\n')
		.thenSend(':server.dev 252 NICKNAME 21 :IRC Operators online\r\n')
		.thenSend(':server.dev 375 NICKNAME :- server.dev Message of the Day -\r\n')
		.thenSend(':server.dev 372 NICKNAME :- Some MOTD content\r\n')
		.thenSend(':server.dev 376 NICKNAME :End of /MOTD command.\r\n', tp)
		.expectData('QUIT :MESSAGE\r\n', tp)
		.thenClose(tp)
		.start(onFinish);

	function onReady () {
		irc.once('motd', function () {
			irc.quit('MESSAGE');
		});
		irc.connect();
	}

	function onFinish () {
		t.equal(stubs.connect.callCount, 1, 'connect event happens once');
		t.ok(stubs.connect.calledWith(), 'connect receives no arguments');

		t.equal(stubs.welcome.callCount, 1, 'welcome event happens once');
		t.ok(stubs.welcome.calledWith(
			'NICKNAME',
			'Welcome to the testing server NICKNAME'
		), 'welcome event arguments');

		t.equal(stubs.RPL_WELCOME.callCount, 1, 'RPL_WELCOME event happens once');
		t.ok(stubs.RPL_WELCOME.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'NICKNAME',
			'Welcome to the testing server NICKNAME'
		), 'RPL_WELCOME event arguments');

		t.equal(stubs.RPL_YOURHOST.callCount, 1, 'RPL_YOURHOST event happens once');
		t.ok(stubs.RPL_YOURHOST.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'Your host is server.dev, running version stubnet-1.0'
		), 'RPL_YOURHOST event arguments');

		t.equal(stubs.RPL_CREATED.callCount, 1, 'RPL_CREATED event happens once');
		t.ok(stubs.RPL_CREATED.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'This server was created Wed Jul 15 2015 at 16:52:09 UTC'
		), 'RPL_CREATED event arguments');

		t.equal(stubs.RPL_MYINFO.callCount, 1, 'RPL_MYINFO event happens once');
		t.ok(stubs.RPL_MYINFO.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'server.dev',
			'stubnet-1.0',
			'DOQRSZaghilopswz',
			'CFILMPQSbcefgijklmnopqrstvz',
			'bkloveqjfI'
		), 'RPL_MYINFO event arguments');

		t.equal(stubs.RPL_ISUPPORT.callCount, 2, 'RPL_ISUPPORT event happens once');
		t.ok(stubs.RPL_ISUPPORT.calledWith(
			sinon.match({prefix: 'server.dev'}),
			sinon.match({
				'CHANTYPES': '#',
				'EXCEPTS': true,
				'CHANMODES': 'eIbq,k,flj,CFLMPQScgimnprstz'
			}),
			'are supported by this server'
		), 'RPL_ISUPPORT event arguments');
		t.ok(stubs.RPL_ISUPPORT.calledWith(
			sinon.match({prefix: 'server.dev'}),
			sinon.match({
				'CASEMAPPING':'rfc1459',
				'CHARSET':'ascii',
				'NICKLEN': '16'
			}),
			'are supported by this server'
		), 'RPL_ISUPPORT event arguments');

		t.equal(stubs.RPL_LUSERCLIENT.callCount, 1, 'RPL_LUSERCLIENT event happens once');
		t.ok(stubs.RPL_LUSERCLIENT.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'There are 164 users and 92068 invisible on 26 servers',
			'164',
			'92068',
			'26'
		), 'RPL_LUSERCLIENT event arguments');

		t.equal(stubs.RPL_LUSEROP.callCount, 1, 'RPL_LUSEROP event happens once');
		t.ok(stubs.RPL_LUSEROP.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'21',
			'IRC Operators online'
		), 'RPL_LUSEROP event arguments');

		t.equal(stubs.RPL_MOTDSTART.callCount, 1, 'RPL_MOTDSTART event happens once');
		t.ok(stubs.RPL_MOTDSTART.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'- server.dev Message of the Day -'
		), 'RPL_MOTDSTART event arguments');

		t.equal(stubs.RPL_MOTD.callCount, 1, 'RPL_MOTD event happens once');
		t.ok(stubs.RPL_MOTD.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'- Some MOTD content'
		), 'RPL_MOTD event arguments');

		t.equal(stubs.RPL_ENDOFMOTD.callCount, 1, 'RPL_ENDOFMOTD event happens once');
		t.ok(stubs.RPL_ENDOFMOTD.calledWith(
			sinon.match({prefix: 'server.dev'}),
			'End of /MOTD command.'
		), 'RPL_ENDOFMOTD event arguments');

		// console.log(stubs.RPL_LUSERCLIENT.getCall(0).args)
		t.end();
	}
});
