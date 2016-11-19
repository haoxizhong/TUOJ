var fs = require('fs-extra');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

const defaults = {
    timeLimit: 1000,
    memLimit: 512
};

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.tusStep = data.tusStep;
    self.id = self.tusStep;
    self.path = path.resolve(data.path, 'r' + self.id);;
    self.source = data.res[cmd.binId];
    self.dataPath = data.dataPath;
    self.run = function(respond, callback) {
		try {
			if (!self.source.target) {
				throw 'compile error';
			}
			fs.mkdirSync(self.path);
			fs.copySync(self.source.target, path.resolve(self.path, 'exe'));
			if (typeof(self.cmd.inputFile) == 'string') {
				self.cmd.inputFile = [ self.cmd.inputFile ];
			}
			if (typeof(self.cmd.inputFile) != 'object') {
				throw 'illegal script';
			}
            self.cmd.inputFile.forEach(function(file, i) {
                fs.copySync(path.resolve(self.dataPath, file), path.resolve(self.path, i + '.in'));
				fs.chmodSync(path.resolve(self.path, i + '.in'), 0444);
            });
		} catch (error) {
			respond({ message: error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.res[self.id] = {
                error: error
            };
            return callback(cmd.haltOnFail);
		}
		if (typeof(self.cmd.args) == 'string') {
			self.cmd.args = self.cmd.args.split(' ');
		}
        var targetPath = path.resolve(self.path, 'r.stdout');
        var options = {
            fileName: './exe',
			args: self.cmd.args,
            cwd: self.path,
            stdin: '0.in',
            stdout: 'r.stdout',
            stderr: 'r.stderr',
            //sysLimit: true,
            timeLimit: self.cmd.timeLimit ? self.cmd.timeLimit : defaults.timeLimit,
            memLimit: self.cmd.memLimit ? self.cmd.memLimit : defaults.memLimit,
        };
		if (data.lang == 'java') {
			options.filename = '/usr/bin/java';
			options.args.push('Main');
		}
        var runRes = exec.exec(options);
        if (!runRes || runRes.error) {
            var errMsg = 'run error ' + runRes.error;
            respond({ msg: errMsg, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep });
            if (self.cmd.haltOnFail) {
                return callback(errMsg);
            }
        }
        if (!runRes.error) {
            runRes.target = targetPath;
        }
        data.res[self.id] = runRes;
        respond({ message: 'exec done', tusStep: self.tusStep, execInfo: runRes });
        return callback(0);
    };
};

