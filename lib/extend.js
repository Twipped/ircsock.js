
module.exports = {
	combine: combine,
	extend: extend
};

/**
 * Combines multiple objects into one.
 * Syntax: combine([true], object1, object2, ... objectN)
 * If first argument is true, function will merge recursively.
 * @return {Object}
 */
function combine () {
	var deep = (arguments[0]===true),
		i = deep ? 1 : 0,
		target = {};

	while (i < arguments.length) {
		_update(target, arguments[i++], deep);
	}

	return target;
}

/**
 * Extends the first object with the contents of all other objects.
 * Syntax: extend([true], target, object2, ... objectN)
 * If first argument is true, function will merge recursively.
 * @return {void}
 */
function extend () {
	var deep = (arguments[0]===true),
		i = deep ? 1 : 0,
		target = arguments[i++];

	while (i < arguments.length) {
		_update(target, arguments[i++], deep);
	}
}

function _update(a, b, deep) {
	for (var k in b) if (b.hasOwnProperty(k)) {
		//if property is an object or array, merge the contents instead of overwriting, if extend() was called as such
		if (deep && typeof a[k] === 'object' && typeof b[k] === 'object') _update(a[k], b[k]);
		else a[k] = b[k];
	}
	return a;
}