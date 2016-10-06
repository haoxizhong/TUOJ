var Tus = require('../modules/tus');
var Gitter = require('../modules/gitter');
var RespondReq = require('./respondReq');
var request = require('request');

module.exports = function(me) {
    var self = this;
	self.postData = querystring.stringify({
		verify: me.cfg.wwwServer.verify,
		judgerType: me.cfg.judgerType
	});
    self.respondReq = new RespondReq(me.cfg);
    self.run = function() {
        Step(function() {
            request.post({
                url: me.cfg.wwwServer.url,
                formData: postData
            }, this);
        }, function(err, httpResponse, body) {
            if (!body.runId) {
                return setTimeout(self.run, me.cfg.wwwServer.reqInterval), undefined;
            }
            var next = this;
            Step(function() {
                var gitter = new Gitter(me.cfg.loal.gitter);
                gitter.updateProb(body.probGit, this);
            }, function(err) {
                if (err) {
                    return next(err);
                }
                var tus = new Tus(me.cfg.local.tus);;
                tus.run(body, self.respondReq, next);
            });
        }, function(err) {
            if (err) {
                console.log(err);
            }
            self.run();
        });
    };
};

