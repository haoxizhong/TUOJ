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
            if (data.lang == 'java') {
                fs.copySync(self.source.target, path.resolve(self.path));
            } else {
                fs.copySync(self.source.target, path.resolve(self.path, 'exe'));
            }
			if (typeof(self.cmd.inputFile) == 'string') {
				self.cmd.inputFile = [ self.cmd.inputFile ];
			}
			if (typeof(self.cmd.inputFile) != 'object') {
				throw 'illegal script';
			}
			if (typeof(self.cmd.inputFile) == 'string') {
				self.cmd.inputFile = [ self.cmd.inputFile ];
			}
            for (var i in self.cmd.inputFile) {
				var file = self.cmd.inputFile[i];
                fs.copySync(path.resolve(self.dataPath, file), path.resolve(self.path, i + '.in'));
				fs.chmodSync(path.resolve(self.path, i + '.in'), 0444);
            }
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
            stdout: '.stdout',
            stderr: '.stderr',
            sysLimit: true,
            timeLimit: self.cmd.timeLimit ? self.cmd.timeLimit : defaults.timeLimit,
            memLimit: self.cmd.memLimit ? self.cmd.memLimit : defaults.memLimit,
        };
		if (data.lang == 'java') {
			options.fileName = 'Main';
            options.aType = 'java';
			options.lType = 'java';
            // options.memLimit = '999999999999999';
			//options.args.push('Main');
		} else if (data.lang == 'g++') {
			options.lType = 'cpp';
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

