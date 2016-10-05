// TODO start all services here
var tus = require('./modules/tus');
var gitter = require('./modules/gitter');
var request = require('request');

var app = function(cfg) {
	var self = this;
	self.loadCfg = function(cfg) {
		this.config = cfg;
	};
	self.loadCfg(cfg);
	self.fetchReq = function() {
		var postData = querystring.stringify({
			verify: self.cfg.wwwServer.verify,
			judgerType: self.cfg.judgerType
		});
		Step(function() {
			request.post({
				url: self.cfg.wwwServer.url,
				formData: postData
			}, this);
		}, function(err, httpResponse, body) {
			if (!body.runId) {
				return setTimeout(self.fetchReq, self.cfg.reqInterval), undefined;
			}
			var next = this;
			Step(function() {
				gitter.updateProb(body.probId, this);
			}, function(err) {
				if (err) {
					return console.log(err);
				}
				tus.run(body, next);
			});
		}, function(err) {
			if (err) {
				console.log(err);
			}
			self.fetchReq();
		});
	};
};

module.exports = app;

