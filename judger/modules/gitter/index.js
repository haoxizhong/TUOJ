var nodeGit = require('nodegit');
var path = require('path');
var crypto = require('crypto');

function hash(str) {
    var md5 = crypto.createHash('md5');
    md5.update(String(str));
    return md5.digest('hex');
}

var ret = function(cfg) {
    var self = this;
	self.loadCfg = function(cfg) {
		self.cfg = cfg;
	};
	self.loadCfg(cfg);
    self.updateProb = function(url, callback) {
        self.id = hash(url);
        self.path = path.resolve(self.cfg.path, self.id);
        try {
            fs.readdirSync(self.path);
        } catch (err) {
            nodeGit.clone(url, self.path).then(function(repo) {
            }).catch(function(err) {
                if (err) {
                    callback(err);
                }
            });
        }
        nodeGit.Repository.open(self.path).then(function(repo) {
            return repo.fetchAll({});
        }).catch(function(err) {
            callback(err);
        }).done(function() {
            callback(false);
        });
    };
};

module.exports = ret;
