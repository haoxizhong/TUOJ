var fs = require('fs-extra');
var path = require('path');
var exec = require('../../../modules/executer-ctrl');

var langMods = { 
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
        try {
            fs.mkdirSync(self.path);
            if (!langMods[self.lang] || !cmd.langs || !cmd.langs[self.lang]) {
                var errMsg = 'unsupported lang ' + self.lang;
            }
        } catch (error) {
            respond({ msg: error, isEnd: true });
            data.res.compileRes.push({
                error: error
            });
            return callback(error);
        }
        var targetPath = path.resolve(self.path, 'exe');
        var langFunc = langMods[self.lang];
        var options = langFunc(data.res.sources[cmd.sourceId], self.path, targetPath, cmd.langs[self.lang]);
        options.cwd = self.path;
        options.stdin = path.resolve(self.path, 'c' + self.id + '.stdin');
        options.stdout = path.resolve(self.path, 'c' + self.id + '.stdout');
        options.stderr = path.resolve(self.path, 'c' + self.id + '.stderr');
        var runRes = exec(options);
        if (runRes) {
            var errMsg = 'compile error ' + runRes;
            respond({ message: errMsg, isEnd: self.cmd.haltOnFail, tusStep: self.tusStep });
            data.res.compileRes.push({
                error: errMsg
            });
            return callback(errMsg);
        }
        data.res.compileRes.push({
            target: targetPath
        });
        respond({ message: 'compile done' });
        callback(0);
    };
};

