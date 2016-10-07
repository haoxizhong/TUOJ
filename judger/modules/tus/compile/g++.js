var fs = require('fs-extra');

module.exports = function(source, path, target, args) {
    if (typeof(args) != 'array') {
        args = [args];
    }
    fs.copySync(source, path + 'source.cpp');
    args.push('source.cpp');
    args.push('-o');
    args.push('exe');
    var ret = {
        fileName: 'g++',
        args: args
    };
    return ret;
}
