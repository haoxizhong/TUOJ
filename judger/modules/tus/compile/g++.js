module.exports = function(source, target, args) {
    if (typeof(args) != 'array') {
        args = [args];
    }
    args.push(source);
    args.push('-o');
    args.push(target);
    var ret = {
        fileName: 'g++',
        args: args
    };
    return ret;
}
