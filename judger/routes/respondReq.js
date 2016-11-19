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
            token: cfg.wwwServer.verify.token,
            run_id: self.runId,
            results: {},
        };
        if (data.cmd == 'compile') {
            res.results[0] = {
                status: data.message,
                extInfo: data.extError
            };
        } else {
            res.results[data.judgeStep] = {
                status: data.message,
                extInfo: data.extError,
                time: data.time,
                memory: data.memory,
            }
        }
		var postData = {
			url: self.url,
            method: 'POST',
            json: res
		};
		try {
			request(postData, function(err, httpResponse, bodyStr) {
                if (err) {
                    console.log('Upload error ' + err);
                }
                console.log(bodyStr);
            });
		} catch (error) {
			console.log('Post error ' + error);
		};
	}
}

