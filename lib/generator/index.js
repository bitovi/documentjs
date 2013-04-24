var statics = require('./static');
var docs = require('./docs');
var path = require('path');
var async = require('async');
var utils = require('./utilities');
var _ = require('underscore');

var generate = module.exports = function (files, options, callback) {
	options.helpers = _.extend(options.helpers, require('./helpers'));
	
	var staticTask = function (cb) {
		statics(options, cb);
	}
	var docsTask = function (cb) {
		docs(files, options, cb);
	}

	async.parallel([staticTask, docsTask], function (error, args) {
		if (error) {
			return callback(error);
		}
		callback(null, args[0].concat(args[1]));
	});
}
