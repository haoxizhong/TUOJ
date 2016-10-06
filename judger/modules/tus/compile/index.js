var fs = require('fs');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

const langs = { 
    'g++': require('./g++'),
    //'gcc': require('./gcc'),
    //'java': require('./java')
};

module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.lang = data.lang;
    self.path = data.path;
    self.id = data.res.compileRes.length;
    self.tusStep = data.tusStep;
    if (self.cmd.haltOnFail === undefined) {
        self.cmd.haltOnFail = true;
    }
    self.run = function(respond, callback) {
        if (!langs[self.lang] || !cmd.langs || !cmd.langs[self.lang]) {
            var errMsg = 'unsupported lang ' + self.lang;
            respond({ msg: errMsg, isEnd: true, tusStep: self.tusStep });
            data.res.compileRes.push({
                error: errMsg
            });
            return callback(errMsg);
        }
        var targetPath = path.resolve(self.path, self.id + '.exe');
        var options = langs[self.lang](data.sources[cmd.sourceId], targetPath, cmd.langs[self.lang].args.split(' '));
        options.cwd = self.path;
        options.stdin = fs.open(path.resolve(self.path, 'c' + self.id + '.stdin'), 'r');
        options.stdout = fs.open(path.resolve(self.path, 'c' + self.id + '.stdout'), 'w');
        options.stderr = fs.open(path.resolve(self.path, 'c' + self.id + '.stderr'), 'w');
        var runRes = exec(options);
        if (runRes) {
            var errMsg = 'compile error ' + runRes;
            respond({ msg: errMsg, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep });
            data.res.compileRes.push({
                error: errMsg
            });
            return callback(errMsg);
        }
        data.res.compileRes.push({
            target: targetPath
        });
        callback(0);
    };
};

