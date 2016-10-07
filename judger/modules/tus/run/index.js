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
    self.id = data.res.runRes.length;
    self.path = path.resolve(data.path, 'r' + self.id);;
    self.tusStep = data.tusStep;
    self.source = data.res.compileRes[cmd.binId];
    self.dataPath = data.dataPath;
    self.run = function(respond, callback) {
		try {
			if (!self.source.target) {
				throw 'compile error';
			}
			fs.mkdirSync(self.path);
			fs.copySync(self.source, path.resolve(self.path, 'exe'));
			if (typeof(self.cmd.inputFile) == 'string') {
				self.cmd.inputFile = [ self.cmd.inputFile ];
			}
			if (typeof(self.cmd.inputFile) != 'array') {
				throw 'illegal script';
			}
            self.cmd.inputFile.forEach(function(file, i) {
                fs.copySync(path.resolve(self.dataPath, file), path.resolve(self.path, i + '.in'));
				fs.chmodSync(path.resolve(self.path, i + '.in'), 0444);
            });
		} catch (error) {
			respond({ message: error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.res.runRes.push({
                error: error
            });
            return callback(cmd.haltOnFail);
		}
		if (typeof(self.cmd.args) == 'string') {
			self.cmd.args = self.cmd.args.split(' ');
		}
        var targetPath = path.resolve(self.path, 'r.stdout');
        var options = {
            fileName: path.resolve(self.path, 'exe'),
			args: self.cmd.args,
            cwd: self.path,
            stdin: path.resolve(self.path, '0.in'),
            stdout: targetPath,
            stderr: path.resolve(self.path, 'r.stderr'),
			executerout: path.resolve(self.path, 'r.log'),
            timeLimit: self.cmd.timeLimit ? self.cmd.timeLimit : defaults.timeLimit,
            memLimit: self.cmd.memLimit ? self.cmd.memLimit : defaults.memLimit,
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
		try {
			var runRes = JSON.parse(fs.readFileSync(path.resolve(self.path, 'r.log')));
			data.res.runRes.push({
				target: targetPath,
				time: runRes.time,
				mem: runRes.mem
			});
			callback(0);
		} catch (error) {
			respond({ message: error, tusStep: self.tusStep, isEnd: cmd.haltOnFail });
            data.res.runRes.push({
                error: error
            });
            return callback(cmd.haltOnFail);
		}
    };
};

