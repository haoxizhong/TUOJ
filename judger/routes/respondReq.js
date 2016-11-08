var request = require('request');

module.exports = function(cfg) {
	var self = this;
	self.url = cfg.wwwServer.uploadUrl;
	self.setId = function(runId) {
		self.runId = runId;
	}
	self.uploadStatus = function(data) {
        data.run_id = self.runId;
		var postData = {
			url: self.url,
			form: data
		};
		try {
			request.post(postData, function(err, httpResponse, bodyStr) {
                if (err) {
                    console.log('Upload error ' + err);
                }
            });
		} catch (error) {
			console.log('Post error ' + error);
		};
	}
}

