var FetchReq = require('./routes/fetchReq');
var sandbox = require('./modules/executer-ctrl');

var app = function(cfg) {
	var self = this;
	self.loadCfg = function(cfg) {
		self.cfg = cfg;
        sandbox.loadCfg(cfg.local.sandbox);
	};
	self.loadCfg(cfg);
	self.fetchReq = new FetchReq(self.cfg);
    self.start = function() {
        self.fetchReq.run(self.cfg.wwwServer.reqInterval);
    }
};

module.exports = app;

