var defaultHandler = function (msg) {
	return msg.splitParams.concat([msg.trailing]);
};

var trailingWithSingleParam = function (msg) {
	return [msg.trailing, msg.splitParams[0]];
};

var trailingWithParams = function (msg) {
	var args = msg.splitParams.concat();
	if (msg.trailing) {args.unshift(msg.trailing);}
};

var paramsOnly = function (msg) {
	return msg.splitParams.concat();
};

var trailingOnly = function (msg) {
	return [msg.trailing];
};

var singleParamTrailing = function (msg) {
	return [msg.splitParams[0], msg.trailing];
};

function trailingWithPattern (pattern) {
	return function (msg) {
		var match = pattern.exec(msg.trailing);

		if (match) {
			return [msg.trailing].concat(match.slice(1));
		} else {
			return [msg.trailing];
		}
	};
}

var handlers = {
	"RPL_WELCOME"          : function (msg) {return [msg.params.split(' ')[0], msg.trailing];},
	"RPL_YOURHOST"         : trailingOnly,
	"RPL_CREATED"          : trailingOnly,
	"RPL_MYINFO"           : paramsOnly,
	"RPL_ISUPPORT"         : function (msg) {
		var support = {};
		msg.splitParams.forEach(function (param) {
			var kv = param.split('=');
			if (kv.length === 1) kv.push(true);
			support[kv[0]] = kv[1];
		});
		return [support, msg.trailing];
	},
	"RPL_BOUNCE"           : trailingWithPattern(/Try server ([^\s,]+), port (\d+)/),

	"RPL_MAP"              : defaultHandler,
	"RPL_MAPEND"           : defaultHandler,
	"RPL_MAPSTART"         : defaultHandler,

	"RPL_HELLO"            : defaultHandler,
	"RPL_YOURID"           : defaultHandler,
	"RPL_SAVENICK"         : trailingOnly,

	"RPL_TRACELINK"        : defaultHandler,
	"RPL_TRACECONNECTING"  : defaultHandler,
	"RPL_TRACEHANDSHAKE"   : defaultHandler,
	"RPL_TRACEUNKNOWN"     : defaultHandler,
	"RPL_TRACEOPERATOR"    : defaultHandler,
	"RPL_TRACEUSER"        : defaultHandler,
	"RPL_TRACESERVER"      : defaultHandler,
	"RPL_TRACESERVICE"     : defaultHandler,
	"RPL_TRACENEWTYPE"     : defaultHandler,
	"RPL_TRACECLASS"       : defaultHandler,

	"RPL_STATSLINKINFO"    : defaultHandler,
	"RPL_STATSCOMMANDS"    : defaultHandler,
	"RPL_STATSCLINE"       : defaultHandler,
	"RPL_STATSNLINE"       : defaultHandler,
	"RPL_STATSILINE"       : defaultHandler,
	"RPL_STATSKLINE"       : defaultHandler,
	"RPL_STATSQLINE"       : defaultHandler,
	"RPL_STATSYLINE"       : defaultHandler,
	"RPL_STATSPLINE"       : defaultHandler,
	"RPL_STATSIAUTH"       : defaultHandler,
	"RPL_STATSVLINE"       : defaultHandler,
	"RPL_STATSLLINE"       : defaultHandler,
	"RPL_STATSUPTIME"      : defaultHandler,
	"RPL_STATSOLINE"       : defaultHandler,
	"RPL_STATSHLINE"       : defaultHandler,
	"RPL_STATSSLINE"       : defaultHandler,
	"RPL_STATSPING"        : defaultHandler,
	"RPL_STATSBLINE"       : defaultHandler,
	"RPL_STATSDEFINE"      : defaultHandler,
	"RPL_STATSDEBUG"       : defaultHandler,
	"RPL_STATSDLINE"       : defaultHandler,
	"RPL_ENDOFSTATS"       : defaultHandler,

	"RPL_UMODEIS"          : paramsOnly,

	"RPL_SERVICEINFO"      : defaultHandler,
	"RPL_ENDOFSERVICES"    : defaultHandler,
	"RPL_SERVICE"          : defaultHandler,

	"RPL_SERVLIST"         : trailingWithParams,
	"RPL_SERVLISTEND"      : trailingWithParams,

	"RPL_LUSERCLIENT"      : trailingWithPattern(/There are (\d+) users and (\d+) invisible on (\d+) servers/),
	"RPL_LUSEROP"          : defaultHandler,
	"RPL_LUSERUNKNOWN"     : defaultHandler,
	"RPL_LUSERCHANNELS"    : defaultHandler,
	"RPL_LUSERME"          : trailingWithPattern(/I have (\d+) clients and (\d+) servers/),

	"RPL_ADMINME"          : trailingWithParams,
	"RPL_ADMINLOC1"        : trailingOnly,
	"RPL_ADMINLOC2"        : trailingOnly,
	"RPL_ADMINEMAIL"       : trailingOnly,

	"RPL_TRACELOG"         : defaultHandler,
	"RPL_TRACEEND"         : trailingWithParams,

	"RPL_TRYAGAIN"         : trailingWithSingleParam,
	"RPL_LOCALUSERS"       : defaultHandler,
	"RPL_GLOBALUSERS"      : defaultHandler,

	"RPL_START_NETSTAT"    : defaultHandler,
	"RPL_NETSTAT"          : defaultHandler,
	"RPL_END_NETSTAT"      : defaultHandler,
	"RPL_PRIVS"            : defaultHandler,
	"RPL_SILELIST"         : defaultHandler,
	"RPL_ENDOFSILELIST"    : defaultHandler,
	"RPL_NOTIFY"           : defaultHandler,
	"RPL_ENDNOTIFY"        : defaultHandler,

	"RPL_VCHANEXIST"       : defaultHandler,
	"RPL_VCHANLIST"        : defaultHandler,
	"RPL_VCHANHELP"        : defaultHandler,
	"RPL_GLIST"            : defaultHandler,
	"RPL_ENDOFGLIST"       : defaultHandler,

	"RPL_NONE"             : function () {return [];},

	"RPL_AWAY"             : singleParamTrailing,
	"RPL_UNAWAY"           : trailingWithParams,
	"RPL_NOWAWAY"          : trailingWithParams,

	"RPL_USERHOST"         : function (msg) {
		// RPL_USERHOST comes as a list of nickname and hostmask pairs.
		var mask = /(.+)(\*?)=([+-]?)(~?)(.+)@(.+)/;
		var hosts = msg.trailing.split(' ');
		hosts = hosts.map(function (host) {
			var matches = mask.exec(host);
			return matches && {
				nickname: matches[1],
				operator: matches[2],
				away: matches[3] === '-',
				idented: matches[4] === '~',
				username: matches[5],
				host: matches[6]
			};
		}).filter(Boolean);
		return [hosts];
	},

	"RPL_ISON"             : function (msg) {
		// ISON replies with a list of nicknames
		return [msg.trailing.split(' ')];
	},

	"RPL_TEXT"             : defaultHandler,

	"RPL_WHOISUSER"        : function (msg) {return [msg.splitParams[0], msg.splitParams[1], msg.splitParams[2], msg.trailing];},
	"RPL_WHOISSERVER"      : function (msg) {return [msg.splitParams[0], msg.splitParams[1], msg.trailing];},
	"RPL_WHOISOPERATOR"    : function (msg) {return [msg.splitParams[0], msg.trailing];},
	"RPL_WHOWASUSER"       : function (msg) {return [msg.splitParams[0], msg.splitParams[1], msg.splitParams[2], msg.trailing];},
	"RPL_WHOISACCOUNT"     : function (msg) {return [msg.splitParams[0], msg.splitParams[1], msg.trailing];},
	"RPL_ENDOFWHO"         : function (msg) {return [msg.splitParams[0], msg.trailing];},
	"RPL_WHOISCHANOP"      : defaultHandler,
	"RPL_WHOISIDLE"        : function (msg) {return [msg.splitParams[0], msg.splitParams[1], msg.trailing];},
	"RPL_ENDOFWHOIS"       : singleParamTrailing,
	"RPL_WHOISCHANNELS"    : function (msg) {
		var channels = msg.trailing.split(' ').map(function (channel) {
			return {
				channel: channel.replace(/[@%+]/g, ''),
				op: channel.indexOf('@') > -1,
				halfop: channel.indexOf('%') > -1,
				voice: channel.indexOf('+') > -1
			};
		});
		return [msg.splitParams[0], channels];
	},

	"RPL_LISTSTART"        : function (   ) {return [];},
	"RPL_LIST"             : function (msg) {return [msg.splitParams[0], msg.splitParams[1], msg.trailing];},
	"RPL_LISTEND"          : function (msg) {return [msg.trailing];},

	"RPL_CHANNELMODEIS"    : paramsOnly,
	"RPL_UNIQOPIS"         : paramsOnly,

	"RPL_CHANNEL_URL"      : singleParamTrailing,
	"RPL_CREATIONTIME"     : singleParamTrailing,

	"RPL_NOTOPIC"          : singleParamTrailing,
	"RPL_TOPIC"            : singleParamTrailing,
	"RPL_TOPIC_WHO_TIME"   : paramsOnly,

	"RPL_INVITING"         : paramsOnly,
	"RPL_SUMMONING"        : trailingWithParams,

	"RPL_REOPLIST"         : defaultHandler,
	"RPL_ENDOFREOPLIST"    : defaultHandler,

	"RPL_INVITELIST"       : paramsOnly,
	"RPL_ENDOFINVITELIST"  : singleParamTrailing,

	"RPL_EXCEPTLIST"       : paramsOnly,
	"RPL_ENDOFEXCEPTLIST"  : singleParamTrailing,

	"RPL_VERSION"          : defaultHandler,
	"RPL_WHOREPLY"         : defaultHandler,

	"RPL_NAMREPLY"         : function (msg) {
		var channel = msg.splitParams[1];
		var names = msg.trailing.split(' ').map(function (name) {
			return {
				nick:   name.replace(/[@%+]/g, ''),
				op:     name.indexOf('@') > -1,
				halfop: name.indexOf('%') > -1,
				voice:  name.indexOf('+') > -1
			};
		});
		return [channel, names];
	},
	"RPL_ENDOFNAMES"       : singleParamTrailing,

	"RPL_KILLDONE"         : defaultHandler,
	"RPL_CLOSING"          : defaultHandler,
	"RPL_CLOSEEND"         : defaultHandler,

	"RPL_LINKS"            : defaultHandler,
	"RPL_ENDOFLINKS"       : defaultHandler,

	"RPL_BANLIST"          : defaultHandler,
	"RPL_ENDOFBANLIST"     : defaultHandler,

	"RPL_ENDOFWHOWAS"      : singleParamTrailing,

	"RPL_INFO"             : trailingOnly,
	"RPL_INFOSTART"        : trailingOnly,
	"RPL_ENDOFINFO"        : trailingOnly,

	"RPL_MOTD"             : trailingOnly,
	"RPL_MOTDSTART"        : trailingOnly,
	"RPL_ENDOFMOTD"        : trailingOnly,
	"ERR_NOMOTD"           : trailingOnly,

	"RPL_YOUREOPER"        : trailingOnly,
	"RPL_NOTOPERANYMORE"   : defaultHandler,

	"RPL_REHASHING"        : defaultHandler,
	"RPL_YOURESERVICE"     : trailingOnly,

	"RPL_MYPORTIS"         : defaultHandler,

	"RPL_TIME"             : trailingWithParams,

	"RPL_USERSSTART"       : trailingOnly,
	"RPL_USERS"            : trailingOnly,
	"RPL_ENDOFUSERS"       : trailingOnly,
	"RPL_NOUSERS"          : trailingOnly,

	"ERR_UNKNOWNERROR"     : trailingWithParams,

	"ERR_NOSUCHNICK"       : singleParamTrailing,
	"ERR_NOSUCHSERVER"     : singleParamTrailing,
	"ERR_NOSUCHCHANNEL"    : singleParamTrailing,
	"ERR_CANNOTSENDTOCHAN" : singleParamTrailing,
	"ERR_TOOMANYCHANNELS"  : singleParamTrailing,
	"ERR_WASNOSUCHNICK"    : singleParamTrailing,
	"ERR_TOOMANYTARGETS"   : singleParamTrailing,
	"ERR_NOSUCHSERVICE"    : singleParamTrailing,
	"ERR_NOCOLORSONCHAN"   : singleParamTrailing,

	"ERR_NOORIGIN"         : trailingOnly,
	"ERR_NORECIPIENT"      : trailingOnly,
	"ERR_NOTEXTTOSEND"     : trailingOnly,
	"ERR_NOTOPLEVEL"       : trailingWithParams,
	"ERR_WILDTOPLEVEL"     : trailingWithParams,
	"ERR_BADMASK"          : trailingWithParams,
	"ERR_TOOMANYMATCHES"   : defaultHandler,
	"ERR_UNKNOWNCOMMAND"   : defaultHandler,
	"ERR_NOADMININFO"      : trailingOnly,
	"ERR_FILEERROR"        : trailingOnly,
	"ERR_NONICKNAMEGIVEN"  : trailingOnly,
	"ERR_ERRONEOUSNICKNAME": singleParamTrailing,
	"ERR_NICKNAMEINUSE"    : singleParamTrailing,
	"ERR_BANONCHAN"        : defaultHandler,
	"ERR_NICKCOLLISION"    : trailingOnly,
	"ERR_UNAVAILRESOURCE"  : defaultHandler,
	"ERR_USERNOTINCHANNEL" : defaultHandler,
	"ERR_NOTONCHANNEL"     : defaultHandler,
	"ERR_USERONCHANNEL"    : defaultHandler,
	"ERR_NOLOGIN"          : singleParamTrailing,
	"ERR_SUMMONDISABLED"   : trailingOnly,
	"ERR_USERSDISABLED"    : trailingOnly,
	"ERR_NOTIMPLEMENTED"   : defaultHandler,
	"ERR_NOTREGISTERED"    : trailingOnly,
	"ERR_NEEDMOREPARAMS"   : defaultHandler,
	"ERR_ALREADYREGISTRED" : trailingOnly,
	"ERR_NOPERMFORHOST"    : trailingOnly,
	"ERR_PASSWDMISMATCH"   : trailingOnly,
	"ERR_YOUREBANNEDCREEP" : trailingOnly,
	"ERR_YOUWILLBEBANNED"  : defaultHandler,
	"ERR_KEYSET"           : singleParamTrailing,
	"ERR_CHANNELISFULL"    : singleParamTrailing,
	"ERR_UNKNOWNMODE"      : singleParamTrailing,
	"ERR_INVITEONLYCHAN"   : singleParamTrailing,
	"ERR_BANNEDFROMCHAN"   : singleParamTrailing,
	"ERR_BADCHANNELKEY"    : singleParamTrailing,
	"ERR_BADCHANMASK"      : singleParamTrailing,
	"ERR_NOCHANMODES"      : singleParamTrailing,
	"ERR_BANLISTFULL"      : defaultHandler,
	"ERR_NOPRIVILEGES"     : trailingOnly,
	"ERR_CHANOPRIVSNEEDED" : singleParamTrailing,
	"ERR_CANTKILLSERVER"   : trailingOnly,
	"ERR_DESYNC"           : defaultHandler,
	"ERR_UNIQOPRIVSNEEDED" : trailingOnly,
	"ERR_MSGSERVICES"      : defaultHandler,
	"ERR_NOOPERHOST"       : trailingOnly,
	"ERR_NOSERVICEHOST"    : defaultHandler,
	"ERR_STATSKLINE"       : defaultHandler,
	"ERR_UMODEUNKNOWNFLAG" : trailingOnly,
	"ERR_USERSDONTMATCH"   : trailingOnly,

	"RPL_LOGON"                  : defaultHandler,
	"RPL_LOGOFF"                 : defaultHandler,
	"RPL_WATCHOFF"               : defaultHandler,
	"RPL_WATCHSTAT"              : defaultHandler,
	"RPL_NOWON"                  : defaultHandler,
	"RPL_NOWOFF"                 : defaultHandler,
	"RPL_WATCHLIST"              : defaultHandler,
	"RPL_ENDOFWATCHLIST"         : defaultHandler,
	"RPL_WATCHCLEAR"             : defaultHandler,
	"RPL_ISOPER"                 : defaultHandler,
	"RPL_ISLOCOP"                : defaultHandler,
	"RPL_ISNOTOPER"              : defaultHandler,
	"RPL_ENDOFISOPER"            : defaultHandler,
	"RPL_WHOISMODES"             : defaultHandler,
	"RPL_WHOISHOST"              : defaultHandler,
	"RPL_WHOWASHOST"             : defaultHandler,
	"RPL_RULESSTART"             : defaultHandler,
	"RPL_RULES"                  : defaultHandler,
	"RPL_ENDOFRULES"             : defaultHandler,
	"RPL_MAPMORE"                : defaultHandler,
	"RPL_OMOTDSTART"             : defaultHandler,
	"RPL_OMOTD"                  : defaultHandler,
	"RPL_ENDOFO"                 : defaultHandler,
	"RPL_SETTINGS"               : defaultHandler,
	"RPL_ENDOFSETTINGS"          : defaultHandler,

	"RPL_TRACEROUTE_HOP"         : defaultHandler,
	"RPL_TRACEROUTE_START"       : defaultHandler,
	"RPL_MODECHANGEWARN"         : defaultHandler,
	"RPL_CHANREDIR"              : defaultHandler,
	"RPL_SERVMODEIS"             : defaultHandler,
	"RPL_OTHERUMODEIS"           : defaultHandler,
	"RPL_ENDOF_GENERIC"          : defaultHandler,
	"RPL_WHOWASDETAILS"          : defaultHandler,
	"RPL_WHOISSECURE"            : defaultHandler,
	"RPL_UNKNOWNMODES"           : defaultHandler,
	"RPL_CANNOTSETMODES"         : defaultHandler,
	"RPL_LUSERSTAFF"             : defaultHandler,
	"RPL_TIMEONSERVERIS"         : defaultHandler,
	"RPL_NETWORKS"               : defaultHandler,
	"RPL_YOURLANGUAGEIS"         : defaultHandler,
	"RPL_LANGUAGE"               : defaultHandler,
	"RPL_WHOISSTAFF"             : defaultHandler,
	"RPL_WHOISLANGUAGE"          : defaultHandler,

	"RPL_MODLIST"                : defaultHandler,
	"RPL_ENDOFMODLIST"           : defaultHandler,
	"RPL_HELPSTART"              : defaultHandler,
	"RPL_HELPTXT"                : defaultHandler,
	"RPL_ENDOFHELP"              : defaultHandler,
	"RPL_ETRACEFULL"             : defaultHandler,
	"RPL_ETRACE"                 : defaultHandler,
	"RPL_KNOCK"                  : defaultHandler,
	"RPL_KNOCKDLVR"              : defaultHandler,
	"ERR_TOOMANYKNOCK"           : defaultHandler,
	"ERR_CHANOPEN"               : defaultHandler,
	"ERR_KNOCKONCHAN"            : defaultHandler,
	"ERR_KNOCKDISABLED"          : defaultHandler,
	"RPL_TARGUMODEG"             : defaultHandler,
	"RPL_TARGNOTIFY"             : defaultHandler,
	"RPL_UMODEGMSG"              : defaultHandler,
	"RPL_ENDOFOMOTD"             : defaultHandler,
	"ERR_NOPRIVS"                : defaultHandler,
	"RPL_TESTMARK"               : defaultHandler,
	"RPL_TESTLINE"               : defaultHandler,
	"RPL_NOTESTLINE"             : defaultHandler,
	"RPL_ETRACEEND"              : defaultHandler,
	"RPL_XINFO"                  : defaultHandler,
	"RPL_XINFOSTART"             : defaultHandler,
	"RPL_XINFOEND"               : defaultHandler,

	"ERR_CANNOTDOCOMMAND"        : defaultHandler,
	"ERR_CANNOTCHANGEUMODE"      : defaultHandler,
	"ERR_CANNOTCHANGECHANMODE"   : defaultHandler,
	"ERR_CANNOTCHANGESERVERMODE" : defaultHandler,
	"ERR_CANNOTSENDTONICK"       : defaultHandler,
	"ERR_UNKNOWNSERVERMODE"      : defaultHandler,
	"ERR_SERVERMODELOCK"         : defaultHandler,
	"ERR_BADCHARENCODING"        : defaultHandler,
	"ERR_TOOMANYLANGUAGES"       : defaultHandler,
	"ERR_NOLANGUAGE"             : defaultHandler,
	"ERR_TEXTTOOSHORT"           : defaultHandler,
	"ERR_NUMERIC_ERR"            : defaultHandler

};


module.exports = function (emitter, msg) {
	msg.splitParams = msg.params.split(' ').slice(1);

	var args;
	if (handlers[msg.command]) {
		args = handlers[msg.command](msg);
	} else {
		args = defaultHandler(msg) || [];
	}

	args.unshift(msg.command, msg);

	emitter.emit.apply(emitter, args);
};
