var cp = require('child_process');
var fs = require('fs-extra');
var path = require('path');
var crypto = require('crypto');

function hash(str) {
    var md5 = crypto.createHash('md5');
    md5.update(String(str));
    return md5.digest('hex');
}

var Executer = function() {
    var self = this;
    self.loadCfg = function(cfg) {
        self.cfg = cfg;
        self.path = path.resolve(self.cfg.path, 'tmp');
        self.dockerIO = [
            'pipe',
            fs.openSync(path.resolve(self.cfg.path, 'res.log'), 'w'),
            fs.openSync(path.resolve(self.cfg.path, 'runtime.log'), 'w')
        ];
    }
    self.exec = function(options) {
        var cmdl = options.fileName;
        for (var i in options.args) {
            if (typeof(options.args[i]) == 'string') {
                cmdl += ' ' + options.args[i];
            }
        }
        fs.ensureFileSync(path.resolve(options.cwd, options.stdin));
		/*if (!options.aType) {
			with (options) {
				cmdl += ' <' + stdin;
				cmdl += ' 1>' + stdout;
				cmdl += ' 2>' + stderr;
			}
        }*/
        var args = [cmdl];
        if (options.timeLimit) {
            args.push('-t');
            args.push(String(options.timeLimit));
        } else {
            args.push('-t');
            args.push('99999');
		}
        if (options.memLimit) {
            args.push('-m');
            args.push(String(options.memLimit));
        } else {
            args.push('-m');
            args.push('4096');
		}
        if (!options.sysLimit) {
            args.push('-r');
        }
        if (options.aType) {
            args.push('-a');
            args.push(options.aType);
        }
        if (options.lType) {
            args.push('-o');
            args.push(options.lType);
        }
		console.log(args);
        try {
            fs.emptyDirSync(self.path);
            fs.copySync(options.cwd, self.path);
            cp.execFileSync(path.resolve(__dirname, '../../bin/sandbox_exec'), args, {
                stdio: self.dockerIO,
                cwd: self.path
            });
            fs.copySync(self.path, options.cwd);
            fs.emptyDirSync(self.path);
         } catch (err) {
             //console.log('run error = ' + err);
             //console.log(err);
             return { error: err };
        }
        try {
            var resStr = String(fs.readFileSync(path.resolve(options.cwd, '.result'))).split('\n');
            //var resStr = String(fs.readFileSync(path.resolve(self.cfg.path, 'res.log'))).split('\n');
            var tmStr = resStr[0].split(' ');
            var res = {
                time: Number(tmStr[0]),
                memory: Number(tmStr[1]),
                error: resStr[1]
            };
            if (tmStr[0] == 'Dangerous') {
                res.error = 'Dangerous Program';
            }
            if (res.error == 'Accepted') {
                res.error = 0;
            }
            return res;
        } catch(error) {
            //console.log(error);
            return { error: error };
        }
    };
};

module.exports = new Executer();

