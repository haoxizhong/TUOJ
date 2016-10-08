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
        var containerId = hash(String(Date.now()));
        try {
            var dockerIO = [
                'pipe',
                fs.openSync(path.resolve(options.cwd, 'res.log'), 'w'),
                fs.openSync(path.resolve(options.cwd, 'runtime.log'), 'w')
            ];
            var dockerArgs = ['run', '-p', '3388:3388', '-v', options.cwd + ':/home/judger/shared', '--name', containerId, self.cfg.image, 'bin/sandbox_exec', cmdl];
            var stdo = cp.execFileSync('docker', dockerArgs, {
                stdio: dockerIO
            });
            cp.execFileSync('docker', ['rm', containerId]);
        } catch (err) {
            return { error: err };
        }
        var resStr = String(fs.readFileSync(path.resolve(options.cwd, '.result'))).split('\n');
        var tmStr = resStr[0].split(' ');
        var res = {
            time: Number(tmStr[0]),
            memory: Number(tmStr[1]),
            error: resStr[1]
        };
        if (res.error == 'Accept') {
            res.error = 0;
        }
        return res;
    };
};

module.exports = new Executer();
