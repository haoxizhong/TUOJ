var request = require('request');
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
			request.post({
				url: url
			}, function(err, httpResponse, bodyStr) {
				if (err) {
					callback(err);
				} else {
                    var outp = new stream.Readable;
                    outp.push(bodyStr);
                    outp.push(null);
                    outp.pipe(unzip.Extract({ path: self.path }));
					callback(false, self.path);
				}
			});
		}
	};
}
