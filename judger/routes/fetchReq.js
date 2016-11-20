var request = require('request');
var querystring = require('querystring');
var Step = require('step');
var Tus = require('../modules/tus');
// var Gitter = require('../modules/gitter');
var Puller = require('../modules/puller');
var RespondReq = require('./respondReq');

module.exports = function(mycfg) {
    var self = this;
	self.postData = querystring.stringify({
        token: mycfg.wwwServer.verify.token,
		//verify: mycfg.wwwServer.verify,
		//judgerType: mycfg.judgerType
	});
    self.respondReq = new RespondReq(mycfg);
    self.run = function(timeout) {
		self.timeout = timeout;
        Step(function() {
            request.post({
                url: mycfg.wwwServer.fetchUrl,
                form: self.postData
            }, this);
        }, function(err, httpResponse, bodyStr) {
			var body = (typeof(bodyStr) == 'string') ? JSON.parse(bodyStr) : bodyStr;
			console.log(bodyStr);
            if (!body || !body.run_id || body.run_id == -1) {
				return this(err ? err : 'no need', mycfg.wwwServer.reqInterval);
            }
            self.respondReq.setId(body.run_id);
            body.runId = body.run_id;
            var next = this;
            Step(function() {
                var gitter = new Puller(mycfg.local.gitter);
                gitter.updateProb(body.data_url, body.data_md5, this);
            }, function(err, dataPath) {
                if (err) {
                    return next(err);
                }
                var tus = new Tus(dataPath, mycfg.local.tus);
                tus.run(body, self.respondReq.uploadStatus, next);
            });
        }, function(err, timeout) {
			if (timeout === undefined) {
				timeout = self.timeout;
			}
            if (err) {
                console.log((new Date).toLocaleString() + ': ' + err);
            } else {
                console.log((new Date).toLocaleString() + ': done');
			}
			if (!mycfg.singleRun) {
				setTimeout(self.run, timeout);
			}
        });
    };
};

