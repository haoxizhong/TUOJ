var cp = require('child_process');
var fs = require('fs-extra');
var path = require('path');

module.exports = function(options) {
    var args = [];
    for (var i in options.args) {
        if (typeof(options.args[i]) == 'string') {
            args.push(options.args[i]);
        }
    }
    fs.ensureFileSync(options.stdin);
    var stdin = fs.openSync(options.stdin, 'r');
    var stdout = fs.openSync(options.stdout, 'w');
    var stderr = fs.openSync(options.stderr, 'w');
    try {
        cp.execFileSync(options.fileName, args, {
            cwd: options.cwd,
            stdio: [ stdin, stdout, stderr ]
        });
    } catch (err) {
        return err;
    }
    return 0;
};
