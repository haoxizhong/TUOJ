var request = require('request');

module.exports = function(cfg) {
	var self = this;
	self.url = cfg.wwwServer.uploadUrl;
	self.setId = function(runId) {
		self.runId = runId;
	}
	self.uploadStatus = function(data) {
        const needRespondCmds = [ 'compile', 'judge' ];
        if (needRespondCmds.indexOf(data.cmd) == -1) {
            return;
        }
		var res = {
            token: 'sometoken',
            run_id: self.runId,
            results: {},
        };
        if (data.cmd == 'compile') {
            res.results[0] = {
                status: data.message,
                extInfo: data.extError
            };
        } else {
            res.results[data.judgeId] = {
                status: data.message,
                extInfo: data.extError,
                time: data.time,
                memeory: data.memory,
            }
        }
		var postData = {
			url: self.url,
			form: res
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

