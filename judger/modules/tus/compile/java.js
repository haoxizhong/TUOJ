var fs = require('fs-extra');
var path = require('path');

module.exports = function(source, workPath, target, oargs) {
    if (typeof(args) == 'string') {
        args = args.split(' ');
    }
    fs.copySync(source, path.resolve(workPath, 'Main.java'));
    var args = [];
    if (typeof(oargs) == 'string') {
        args = oargs.split(' ');
    } else {
        for (var i in oargs) {
            if (typeof(oargs[i]) == 'string') {
                args.push(oargs[i]);
            }
        }
    }
    args.push('Main.java');
    var ret = {
        fileName: '/usr/bin/javac',
        args: args
    };
    return ret;
}
