// TODO unfinished
var fs = require('fs-extra');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.tusStep = data.tusStep;
    self.judgeStep = ++ data.judgeStep;
    self.id = self.tusStep;
    self.dataPath = data.dataPath;
    self.path = path.resolve(data.path, 'j' + self.id);
	if (cmd.ansId == 'last') {
		self.source = data.res[self.id - 1];
    } else {
        self.source = data.res[cmd.ansId];
    }
    if (cmd.checker == 'default') {
        self.checker = path.resolve(__dirname, '../../../bin/fdiff');
    } else {
        self.checker = path.resolve(self.dataPath, cmd.checker);
    }
    self.run = function(sysRespond, callback) {
        self.respond = sysRespond;
        var respond = function(res, callback) {
			res.judgeStep = self.judgeStep;
            res.time = self.source.time;
            res.memory = self.source.memory;
            if (self.source.error) {
                res.message = self.source.error;
            }
            self.respond(res, callback);
        }
        var targetPath = path.resolve(self.path, 'res');
        try {
            if (!self.source.target) {
                if (!self.source) {
                    throw 'illegal judge script at step ' + self.tusStep;
                }
                throw String(self.source.error);
            }
            fs.mkdirSync(self.path);
            if (typeof(cmd.stdOutputFile) == 'string') {
                cmd.stdOutputFile = [ cmd.stdOutputFile ];
            }
            if (typeof(cmd.stdOutputFile) != 'object') {
                throw 'illegal std output file';
            }
            cmd.stdOutputFile.forEach(function(file, i) {
                var ansPath = path.resolve(self.path, String(i) + '.ans');
                fs.copySync(path.resolve(self.dataPath, file), ansPath);
            });
            fs.copySync(self.source.target, path.resolve(self.path, 'out'));
            fs.copySync(self.checker, path.resolve(self.path, 'checker'));
            fs.chmodSync(path.resolve(self.path, 'checker'), 0755);
            fs.writeFileSync(path.resolve(self.path, 'fullScore'), '100');
			if (typeof(self.cmd.inputFile) == 'string') {
				self.cmd.inputFile = [ self.cmd.inputFile ];
			}
            for (var i in self.cmd.inputFile) {
				var file = self.cmd.inputFile[i];
                fs.copySync(path.resolve(self.dataPath, file), path.resolve(self.path, i + '.in'));
            }
        } catch (error) {
            respond({ message: 'Wrong Answer', extError: error, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep }, function() {
                data.scores.push({
                    error: self.source.error,
                    score: 0
                });
                return callback(cmd.haltOnFail);
            });
            return;
        };
        var args = ['0.in', 'out', '0.ans', 'fullScore', 'score', 'extInfo'];
        var options = {
            fileName: './checker',
            args: args,
            cwd: self.path,
            stdin: 'stdin',
            stdout: 'stdout',
            stderr: 'stderr',
        };
        var runRes = exec.exec(options);
        if (!runRes || runRes.error) {
            var errMsg = 'checker error ' + runRes;
            respond({ message: 'Wrong Answer', extError: errMsg, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep }, function() {
                data.scores.push({
                    score: 0,
                    error: runRes
                });
                return callback(errMsg);
            });
            return;
        }
        try {
            fs.ensureFileSync(path.resolve(self.path, 'extInfo'));
            var res = {
                score: Number(fs.readFileSync(path.resolve(self.path, 'score'))) / 100,
				extInfo: String(fs.readFileSync(path.resolve(self.path, 'extInfo')))
            };
            data.scores.push(res);
            respond({ 
                message: res.score > 0.99 ? 'Accepted' : 'Wrong Answer', 
                score: res.score, 
                extError: res.extInfo, 
            }, function() {
                callback(0);
            });
            return ;
        } catch (error) {
            respond({ message: self.source.error, tusStep: self.tusStep, isEnd: cmd.haltOnFail }, function() {
                data.scores.push({
                    error: self.source.error,
                    score: 0
                });
                return callback(cmd.haltOnFail);
            });
            return;
        };
    };
}

