// TODO unfinished
var fs = require('fs-extra');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.tusStep = data.tusStep;
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
        self.checker = 'false';
    }
    self.run = function(respond, callback) {
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
            fs.writeFileSync(path.resolve(self.path, 'fullScore'), '100');
        } catch (error) {
            respond({ message: error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.scores.push({
                error: self.source.error,
				score: 0
            });
            return callback(cmd.haltOnFail);
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
            respond({ msg: errMsg, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep });
            data.scores.push({
                score: 0,
                error: runRes
            });
            return callback(errMsg);
        }
        try {
            fs.ensureFileSync(path.resolve(self.path, 'extInfo'));
            var res = {
                score: Number(fs.readFileSync(path.resolve(self.path, 'score'))) / 100,
				extInfo: String(fs.readFileSync(path.resolve(self.path, 'extInfo')))
            };
            data.scores.push(res);
            respond({ 
                message: 'judge done', 
                score: res.score, 
                info: res.extInfo, 
            });
            return callback(0);
        } catch (error) {
            respond({ message: self.source.error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.scores.push({
                error: self.source.error,
				score: 0
            });
            return callback(cmd.haltOnFail);
        };
    };
}

