// TODO copy input file to work dir and clean it
var fs = require('fs');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.path = data.path;
    self.id = data.res.runRes.length;
    self.tusStep = data.tusStep;
    self.source = data.res.compileRes[cmd.binId];
    self.run = function(respond, callback) {
        if (!self.source.target) {
            respond({ message: 'compile error', tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.res.runRes.push({
                error: 'compile error'
            });
            return callback(cmd.haltOnFail);
        }
        var targetPath = path.resolve(self.path, 'r' + self.id + '.stdout');
        var options = {
            fileName: self.source.target,
            cwd: self.path,
            stdin: fs.open(path.resolve(self.path, 'r' + self.id + '.stdin'), 'r'),
            stdout: fs.open(targetPath, 'w'),
            stderr: fs.open(path.resolve(self.path, 'r' + self.id + '.stderr'), 'w'),
        };
        var runRes = exec(options);
        if (runRes) {
            var errMsg = 'run error ' + runRes;
            respond({ msg: errMsg, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep });
            data.res.runRes.push({
                error: runRes
            });
            return callback(errMsg);
        }
        data.res.runRes.push({
            target: targetPath
        });
        callback(0);
    };
};

