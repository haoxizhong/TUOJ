module.exports = function(cmd, data) {
    var self = this;
    self.cmd = cmd;
    self.tusStep = data.tusStep;
    self.data = data;
    self.run = function(respond, callback) {
        try {
            if (typeof(self.cmd.compoments) != 'object') {
                throw 'illegal score logic';
            }
            var score = self.calc(self.cmd.compoments);
            respond({ tusStep: self.tusStep, score: score, isEnd: true });
            callback(0);
        } catch(error) {
            respond({ tusStep: self.tusStep, score: 0, error: error, isEnd: true });
            callback(error);
        }
    };
    self.calc = function(logic) {
        if (typeof(logic) == 'number' || typeof(logic) == 'string') {
            if (self.data.scores[logic]) {
                return data.scores[logic].score;
            } else {
                return 0;
            }
        } else if (typeof(logic) == 'object') {
            const funcs = {
                'and': function(a, b) { return a & b; },
                'or': function(a, b) { return a | b; },
                'sum': function(a, b) { return a + b; }
            };
            var res = 0;
            if (logic.func == 'and') {
                res = 1;
            }
            if (funcs[logic.func] && typeof(logic.compoments) == 'object') {
                var cFunc = funcs[logic.func];
                for (var i in logic.compoments) {
                    var item = logic.compoments[i];
                    res = cFunc(res, self.calc(item));
                }
            }
            return res * logic.fullScore;
        }
        return 0;
    };
}

