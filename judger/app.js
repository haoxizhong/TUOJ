var app = function(cfg) {
	var self = this;
	self.loadCfg = function(cfg) {
		self.config = cfg;
	};
	self.loadCfg(cfg);
	self.fetchReq = require('./routes/fetchReq');
    self.start = function() {
        self.fetchReq();
    }
};

module.exports = app;

