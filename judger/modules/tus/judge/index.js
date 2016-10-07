// TODO unfinished
var fs = require('fs-extra');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.id = data.res.judgeRes.length;
    self.path = path.resolve(data.path, 'j' + self.id);
    self.tusStep = data.tusStep;
    self.dataPath = data.dataPath;
    self.source = data.res.execRes[cmd.ansId];
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
            data.res.judgeRes.push({
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
            fs.ensureFileSync(path.resolve(self.path, 'extInfo'));
            var res = {
                score: Number(fs.readFileSync(path.resolve(self.path, 'score'))) / 100,
				extInfo: String(fs.readFileSync(path.resolve(self.path, 'extInfo')))
            };
            data.res.judgeRes.push(res);
            respond({ 
                message: 'judge done', 
                score: res.score, 
                info: res.extInfo, 
            });
            return callback(0);
        } catch (error) {
            respond({ message: self.source.error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.res.judgeRes.push({
                error: self.source.error,
				score: 0
            });
            return callback(cmd.haltOnFail);
        };
    };
}

