var request = require('request');
var qs = require('querystring');

module.exports = function(cfg) {
	var self = this;
	self.url = cfg.wwwServer.uploadUrl;
	self.setId = function(runId) {
		self.runId = runId;
	}
	self.uploadStatus = function(data, next) {
        const needRespondCmds = [ 'compile', 'judge' ];
        if (needRespondCmds.indexOf(data.cmd) == -1) {
			if (typeof(next) == 'function') {
				next();
			}
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
				score: (data.score === undefined) ? 0 : Math.round(data.score * 100),
                extInfo: data.extError,
                time: data.time,
                memory: data.memory,
            }
        }
		var postData = {
			url: self.url,
            method: 'POST',
            json: JSON.stringify(res), 
			/*headers: {
				"content-type": "application/json",
			},*/
		};
		try {
			request.post({ url: self.url, json: true, body: res }, function(err, httpResponse, bodyStr) {
                if (err) {
                    console.log('Upload error ' + err);
                }
				console.log(bodyStr);
				if (typeof(next) == 'function') {
					next();
				}
            });
		} catch (error) {
			console.log('Post error ' + error);
			next();
		};
	}
}

