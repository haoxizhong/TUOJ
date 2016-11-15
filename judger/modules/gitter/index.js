var nodeGit = require('nodegit');
var path = require('path');
var fs = require('fs-extra');
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
		if (self.cfg.noFetch) {
			return callback(0, self.path);
		}
        try {
            fs.readdirSync(self.path);
        } catch (err) {
			nodeGit.Clone.clone(url, self.path).catch(function(err) {
				if (err) {
					callback(err);
				}
			});
        }
        nodeGit.Repository.open(self.path).then(function(repo) {
            self.repo = repo;
            return repo.fetchAll({
                callbacks: {
                    credentials: function(url, userName) {
                        return nodeGit.Cred.sshKeyFromAgent(userName);
                    },
                    certificateCheck: function() {
                        return 1;
                    }
                }
            })
        }).then(function() {
            return self.repo.mergeBranches("master", "origin/master");
        }).catch(function(err) {
            callback(err);
        }).done(function() {
            callback(false, self.path);
        });
    };
};

module.exports = ret;
