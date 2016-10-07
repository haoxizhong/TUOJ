var request = require('request');

module.exports = function(cfg) {
	var self = this;
	self.url = cfg.wwwServer.uploadUrl;
	self.uploadStatus = function(data) {
		request.post({
			url: self.url,
			formData: data
		}, function(err, httpResponse, body) {
			if (err) {
				console.log('Status upload error = ' + err);
			}
		});
	}
}

