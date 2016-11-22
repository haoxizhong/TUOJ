var fs = require('fs-extra');
var path = require('path');

module.exports = function(source, workPath, target, oargs) {
    if (typeof(args) == 'string') {
        args = args.split(' ');
    }
    fs.writeFileSync(path.resolve(workPath, 'Main.java'), source);
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
    //args.push('Main');
    var ret = {
        fileName: 'Main.java',
        args: args,
        aType: 'javac'
    };
    return ret;
}
