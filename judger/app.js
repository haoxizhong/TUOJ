var FetchReq = require('./routes/fetchReq');
var app = function(cfg) {
	var self = this;
	self.loadCfg = function(cfg) {
		self.cfg = cfg;
	};
	self.loadCfg(cfg);
	self.fetchReq = new FetchReq(self.cfg);
    self.start = function() {
        self.fetchReq.run();
    }
};

module.exports = app;

