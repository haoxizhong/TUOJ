var request = require('request');
var Step = require('step');
var fs = require('fs-extra');
var curl = require('node-curl');
var unzip = require('unzip');

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
			curl(url, function(err) {
				if (err) {
					callback(err);
				} else {
					this.body.pipe(unzip.Extract({ path: self.path }));
					callback(false, self.path);
				}
			});
		}
	};
}
