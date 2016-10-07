var Step = require('step');
var Path = require('path');
var Compile = require('./compile');
var Run = require('./run');
var Judge = require('./judge');
var Score = require('./score');

module.exports = function(cfg, dataPath) {
    var self = this;
	self.loadCfg = function(cfg) {
		self.cfg = cfg;
		self.dataPath = dataPath;
	};
	self.loadCfg(cfg);
    self.interpret = function(err) {
        if (err) {
            self.respond({ tusStep: self.tusStep, message: errInfo, isEnd: true });
            return self.callback(errInfo);
        }
        const cmdMap = {
            'compile': Compile,
            'run': Run,
            'judge': Judge,
            'score': Score,
            'end': -1
        };
        var curCmd = self.tus[self.tusStep];
        var curMod = cmdMap[curCmd.cmd];
        if (!curMod) {
            var errInfo = 'Unknow tus command ' + curCmd.cmd + ' at step ' + self.tusStep;
            self.respond({ tusStep: self.tusStep, message: errInfo, isEnd: true });
            return self.callback(errInfo);
        } else if (curMod == -1) {
            self.respond({ tusStep: self.tusStep, message: 'normally end', isEnd: true });
            return self.callback(false);
        }
        var runner = new curMod(curCmd, self);
        ++ self.tusStep;
        return runner.run(self.respond, self.interpret);
    };
    self.run = function(req, respond, callback) {
        self.path = path.resolve(self.cfg.path, req.runId);
        self.respond = reespond;
        self.callback = callback;
        self.res = {
            sources: [],
            compileRes: [],
            runRes: [],
            judgeRes: [],
            score: false
        };
        try {
            fs.mkdirSync(self.path);
            if (typeof(req.answer) == 'string') {
                req.answer = [ req.answer ];
            }
            if (typeof(req.answer) == 'array') {
                req.answer.forEach(function(code, id) {
                    var sourcePath = path.resolve(self.path, 'answer' + id);
                    fs.writeFileSync(sourcePath);
                    self.sources.push(sourcePath);
                });
            } else {
                throw "No answer file";
            }
            self.lang = req.lang;
            self.tus = req.tus;
            if (typeof(self.tus) != 'array' || self.tus.length > self.cfg.maxLines) {
                throw 'Illegal judge script';
            } else {
                self.tus.push({ cmd: "end" });
            }
        } catch (error) {
            self.respond({ tusStep: 0, message: error, isEnd: true });
            return self.callback(error);
        }
        self.tusStep = 0;
        return self.interpret();
    };
}

