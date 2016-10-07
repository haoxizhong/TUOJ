var fs = require('fs-extra');
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
    self.id = data.res.compileRes.length;
    self.path = path.resolve(data.path, 'c' + self.id);
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
        var targetPath = path.resolve(self.path, 'exe');
        var options = langs[self.lang](data.sources[cmd.sourceId], self.path, targetPath, cmd.langs[self.lang].args.split(' '));
        options.cwd = self.path;
        options.stdin = path.resolve(self.path, 'c' + self.id + '.stdin');
        options.stdout = path.resolve(self.path, 'c' + self.id + '.stdout');
        options.stderr = path.resolve(self.path, 'c' + self.id + '.stderr');
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

