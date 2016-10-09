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
    self.refreshContainer = function() {
        if (self.containerId) {
            var oldContainerId = self.containerId;
            setTimeout(function() {
                var dockerArgs = ['rm', oldContainerId];
                var stdo = cp.execFileSync('docker', dockerArgs, {
                    stdio: self.dockerIO
                });
            }, 60000);
        }
        self.containerId = hash(String(Date.now()));
        var dockerArgs = ['run', '-d', '-v', self.path + ':/home/judger/shared', '--name', self.containerId, self.cfg.image, 'sleep', String(self.cfg.refreshInterval / 1000 + 1)];
        fs.ensureDirSync(self.path);
        var stdo = cp.execFileSync('docker', dockerArgs, {
            stdio: self.dockerIO
        });
        // TODO refresh container after a period of time without breaking current process
        setTimeout(self.refreshContainer, self.cfg.refreshInterval);
    }
    self.loadCfg = function(cfg) {
        self.cfg = cfg;
        self.path = path.resolve(self.cfg.path, 'tmp');
        self.dockerIO = [
            'pipe',
            fs.openSync(path.resolve(self.cfg.path, 'res.log'), 'w'),
            fs.openSync(path.resolve(self.cfg.path, 'runtime.log'), 'w')
        ];
        self.refreshContainer();
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
            //fs.emptyDirSync(self.path);
            fs.copySync(options.cwd, self.path);
            var dockerArgs = ['exec', self.containerId, 'bin/sandbox_exec', cmdl];
            if (!options.sysLimit) {
                dockerArgs.push('-r');
            }
            cp.execFileSync('docker', dockerArgs, {
                stdio: self.dockerIO
            });
            fs.removeSync(options.cwd);
            fs.copySync(self.path, options.cwd);
         } catch (err) {
             return { error: err };
        }
        try {
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
        } catch(error) {
            return { error: error };
        }
    };
};

module.exports = new Executer();

