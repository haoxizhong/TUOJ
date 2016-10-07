// TODO unfinished
var fs = require('fs-extra');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.id = data.res.runRes.length;
    self.path = path.resolve(data.path, 'j' + self.id);
    self.tusStep = data.tusStep;
    self.dataPath = data.dataPath;
    self.source = data.res.runRes[cmd.ansId];
    if (cmd.type == 'default') {
        self.checker = path.resolve(__dirname, '../../../bin/oj7-diff');
    } else {
        self.checker = 'false';
    }
    self.run = function(respond, callback) {
        var targetPath = path.resolve(self.path, 'res');
        try {
            if (!self.source.target) {
                if (!self.source) {
                    throw 'illegal judge script at step ' + self.tusStep;
                }
                throw self.source.error;
            }
            fs.mkdirSync(self.path);
            if (typeof(cmd.stdOutputFile) == 'string') {
                cmd.stdOutputFile = [ cmd.stdOutputFile ];
            }
            if (typeof(cmd.stdOutputFile) != 'array') {
                throw 'illegal std output file';
            }
            cmd.stdOutputFile.forEach(function(file, i) {
                fs.copySync(path.resolve(self.dataPath, file), path.resolve(self.path, i + '.ans'));
            });
            fs.copySync(self.source, path.resolve(self.path, 'out'));
            fs.copySync(self.checker, path.resolve(self.path, 'checker'));
            fs.writeFileSync(path.resolve(self.path, 'fullScore'), '100');
        } catch (error) {
            respond({ message: self.source.error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.res.runRes.push({
                error: self.source.error,
				score: 0
            });
            return callback(cmd.haltOnFail);
        };
        var args = ['0.in', 'ans', 'r.stdout', 'fullScore', 'score', 'extraInfo'];
        var options = {
            fileName: 'checker',
            args: args,
            cwd: self.path,
            stdin: path.resolve(self.path, 'stdin'),
            stdout: path.resolve(self.path, 'stdout'),
            stderr: path.resolve(self.path, 'stderr'),
        };
        var runRes = exec(options);
        if (runRes) {
            var errMsg = 'checker error ' + runRes;
            respond({ msg: errMsg, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep });
            data.res.runRes.push({
                error: runRes
            });
            return callback(errMsg);
        }
        try {
            var res = {
                score: Number(fs.readFileSync(path.resolve(self.path, 'score'))) / 100,
            };
            if (ensureFileSync(path.resolve(self.path, 'extInfo'))) { 
                res.extInfo = fs.readFileSync(path.resolve(self.path, 'extInfo'));
            }
            data.res.runRes.push(res);
            callback(0);
        } catch (error) {
            respond({ message: self.source.error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.res.runRes.push({
                error: self.source.error,
				score: 0
            });
            return callback(cmd.haltOnFail);
        };
    };
}

