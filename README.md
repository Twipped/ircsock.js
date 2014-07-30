ircsock.js
===

A modular socket library for connecting to IRC servers. Inspired by [slate-irc](https://www.npmjs.org/package/slate-irc), ircsock uses a modular use pattern to handle all portions of the IRC protocol, emitting processed events for all incoming communications.

Note, this library is functional but not yet fully complete and may experience API changes during development.

###Usage:

```js
var IRC = require('ircsock');
var irc = new IRC({
	name: 'Freenode',
	host: 'irc.freenode.net',
	port: 6667,
	ssl: false,
	nickname: 'nickname',
	username: 'username',
	realname: 'realname',
	password: null
});

irc.on('connect', function () {
	irc.join('#node.js');
});

irc.on('privmsg', function (event) {
	if (event.message === '!ircsock') {
		irc.privmsg('#node.js', 'I LIVE!');
	}
});

irc.connect();
```

See included example app for more detail.

###Events

All events receive a details object as their only argument, except where otherwise noted.

- connect - Socket opened (No arguments)
- welcome - Login accepted, current nickname provided as first argument.
- motd - Message of the day. First argument contains the body of the MOTD.
- close - Socket closed from our side.
- end - Socket closed from their side.
- privmsg - Message from user
- notice - Notice from user or server (details.server will be true for the later)
- action - Emote from user
- ctcp - Client to Client Protocol, both incoming and outgoing.
- ctcp:request - CTCP request from a user
- ctcp:reply - CTCP reply from a user
- join - User joined an existing channel
- join:self - Server confirmed join of new channel
- part - User left and existing channel
- part:self - Server confirmed that client left a channel.
- quit - User disconnected from the server
- quit:self - Server confirms client disconnect.
- topic - Channel topic, either existing or a change by a user. (Nickname will be empty for former).
- topic:time - Time that the channel was last set, and by who.
- pingpong - Client responded to a ping from the server (No arguments)
- whois - Response to a WHOIS on a user. Details will contain an `error` property in the event of failure.
- names - Complete list of the users on a channel. Details object will contain a `names` property with an array of all users in the channel in the format of: `{nick: STRING, hasVoice: BOOLEAN, isOperator: BOOLEAN}`
- mode - Mode change on user or channel. Details will contain a `modes` array of `{mode: STRING, delta: BOOLEAN, target: STRING}` where delta indicates if the mode is on or off.
- mode:channel - Mode change on a channel
- mode:user - Mode change on a user.
- kick - User kicked from channel
- invite - User inviting client to a channel.
- away - User is marked away.

All events receive a single argument, an object containing the details of the event.

All person-to-person and person-to-channel event details contain the following:

- `nick`: The nickname of the user
- `host`: The hostmask of that user, sans-nickname.
- `target`: The target of the event (usually a channel or user)
- `message`: The body of the event message, if it applies.


###Methods

- **irc.connect([options],[callback])**
- **irc.close([callback])**
- **irc.quit([message],[callback])**
- **irc.write(body, [callback])**
- **irc.remoteAddress()**
- **irc.use(module)**
- **irc.on(eventName, callback)**
- **irc.join(channels)**
- **irc.part(channels)**
- **irc.changeNick(nickname)**
- **irc.names(channel)**
- **irc.invite(nickname, channel)**
- **irc.whois(nickname, hostmask, [callback])**
- **irc.privmsg(target, message)**
- **irc.notice(target, message)**
- **irc.ctcpSend(command, target, message)**
- **irc.ctcpReply(command, target, message)**
- **irc.topic(channel, [replacement])**

##Plugins

Four optional plugins are included in the package:

- `ircsock/plugins/channels` - Keeps tracks of channel details such as current users and channel topic. Adds `irc.channels` collection and the `irc.getChannel(channel)` function.
- `ircsock/plugins/channel-log` - Logs all channel events to a `log` property on the channel object (requires the channels plugin).
- `ircsock/plugins/users` - Keeps track of user details such as hostmask and last seen activity. Adds `irc.users` collection and the `irc.getUser(nickname)` function.
- `ircsock/plugins/log` - Records all events on the `irc.log` array.