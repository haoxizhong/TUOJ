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
        with (options) {
            cmdl += ' <' + stdin;
            cmdl += ' 1>' + stdout;
            cmdl += ' 2>' + stderr;
        }
        if (options.timeLimit) {
            cmdl += ' -t ' + options.timeLimit;
        }
        if (options.memLimit) {
            cmdl += ' -m ' + options.memLimit;
        }
        try {
            var args = [cmdl];
            fs.emptyDirSync(self.path);
            fs.copySync(options.cwd, self.path);
            if (!options.sysLimit) {
                args.push('-r');
            }
            cp.execFileSync(path.resolve(__dirname, '../../bin/sandbox_exec'), args, {
                stdio: self.dockerIO,
                cwd: self.path
            });
            fs.copySync(self.path, options.cwd);
            //fs.emptyDirSync(self.path);
         } catch (err) {
             console.log('run error = ' + err);
             //console.log(err);
             return { error: err };
        }
        try {
            //var resStr = String(fs.readFileSync(path.resolve(options.cwd, '.result'))).split('\n');
            var resStr = String(fs.readFileSync(path.resolve(self.cfg.path, 'res.log'))).split('\n');
            var tmStr = resStr[0].split(' ');
            var res = {
                time: Number(tmStr[0]),
                memory: Number(tmStr[1]),
                error: resStr[1]
            };
            if (res.error == 'Accepted') {
                res.error = 0;
            }
            return res;
        } catch(error) {
            console.log(error);
            return { error: error };
        }
    };
};

module.exports = new Executer();

