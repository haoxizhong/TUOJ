var cp = require('child_process');
var fs = require('fs');
var path = require('path');

module.exports = function(options) {
    try {
        cp.execFileSync(options.fileName, options.args, {
            cwd: options.cwd,
            stdio: [ options.stdin, options.stdout, options.stderr ]
        });
    } catch (err) {
        return err;
    }
    return 0;
};
