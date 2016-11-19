var request = require('request');
var path = require('path');
var Step = require('step');
var fs = require('fs-extra');
var unzip = require('unzip');
var stream = require('stream');

module.exports = function(cfg) {
	var self = this;
	self.loadCfg = function(cfg) {
		self.cfg = cfg;
	};
	self.loadCfg(cfg);
	self.updateProb = function(url, md5, callback) {
		self.id = md5;
		self.path = path.resolve(self.cfg.path, self.id);
		try {
			fs.readdirSync(self.path);
		} catch (err) {
            request(url).pipe(unzip.Extract({ 
                path: self.path 
            })).on('finish', function() {
                callback(false, self.path);
            }).on('error', function(err) {
                console.log('error = ' + err);
                callback(err);
            });
		}
        callback(false, self.path);
	};
}
