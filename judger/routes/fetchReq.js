var request = require('request');
var querystring = require('querystring');
var Step = require('step');
var Tus = require('../modules/tus');
var Gitter = require('../modules/gitter');
var RespondReq = require('./respondReq');

module.exports = function(mycfg) {
    var self = this;
	self.postData = querystring.stringify({
		verify: mycfg.wwwServer.verify,
		judgerType: mycfg.judgerType
	});
    self.respondReq = new RespondReq(mycfg);
    self.run = function() {
        Step(function() {
            request.post({
                url: mycfg.wwwServer.fetchUrl,
                formData: self.postData
            }, this);
        }, function(err, httpResponse, body) {
            if (!body || !body.runId) {
				return this(err, mycfg.wwwServer.reqInterval);
            }
            var next = this;
            Step(function() {
                var gitter = new Gitter(mycfg.loal.gitter);
                gitter.updateProb(body.probGit, this);
            }, function(err, dataPath) {
                if (err) {
                    return next(err);
                }
                var tus = new Tus(mycfg.local.tus, dataPath);;
                tus.run(body, self.respondReq.uploadStatus, next);
            });
        }, function(err, timeout) {
			if (timeout === undefined) {
				timeout = 0;
			}
            if (err) {
                console.log((new Date).toLocaleString() + ': ' + err);
            }
            setTimeout(self.run, timeout);
        });
    };
};

