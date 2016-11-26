var fs = require('fs-extra');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

var langMods = { 
    'g++': require('./g++'),
    //'gcc': require('./gcc'),
    'java': require('./java'),
    'answer': require('./answer')
};

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.lang = data.lang;
    self.id = data.tusStep;
    self.path = path.resolve(data.path, 'c' + self.id);
    self.tusStep = data.tusStep;
    if (self.cmd.haltOnFail === undefined) {
        self.cmd.haltOnFail = true;
    }
    self.run = function(sysRespond, callback) {
        var respond = function(error, next) {
            if (error) {
                sysRespond({
                    message: 'Compilation Error',
                    extInfo: error,
                    isEnd: true
                }, next);
            } else {
                sysRespond({
                    message: 'Compilation Success'
                }, next);
            }
        };
        try {
            fs.mkdirSync(self.path);
            if (!langMods[self.lang] || !cmd.langs || !cmd.langs[self.lang]) {
                var errMsg = 'unsupported lang ' + self.lang;
                throw errMsg;
            }
        } catch (error) {
            respond(error, function() {
                data.res[self.id] = {
                    error: error
                };
                return callback(error);
            });
        }
        var targetPath = path.resolve(self.path, 'exe');
        if (self.lang == 'java') {
            targetPath = self.path;
        }
        var langFunc = langMods[self.lang];
        data.updateSource(cmd.sourceId, function(err) {
            if (err) {
                return callback(err);
            }
            var options = langFunc(data.sources[cmd.sourceId], self.path, targetPath, cmd.langs[self.lang]);
            options.cwd = self.path;
            options.stdin = 'c' + self.id + '.stdin';
            options.stdout = 'c' + self.id + '.stdout';
            options.stderr = 'c' + self.id + '.stderr';
            var runRes = exec.exec(options);
            if (!runRes || runRes.error) {
                var errMsg = 'Compilation Error';
                return respond(runRes.error, function() {
                    data.res[self.id] = {
                        error: errMsg
                    };
                    return callback(errMsg);
                });
            }
            data.res[self.id] = {
                target: targetPath
            };
            respond(null, function() {
                callback(0);
            });
        });
    };
};

