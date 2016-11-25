var express = require('express')
var router = express.Router()
var git = require('nodegit')
var markdown = require('markdown').markdown
var fs = require('fs')
var fse = require('fs-extra')
var Step = require('step')
var contest = require('../models/contest.js')
var problem = require('../models/problem.js')
var judge = require('../models/judge.js')
var user = require('../models/user.js')
var SubmitRecord = require('../models/submit_record');
var helper = require('../helper');
var path = require('path')
var upload = require('../config.js').MULTER_UPLOAD
var randomstring = require('randomstring')
var SOURCE_DIR = require('../config').SOURCE_DIR

router.get('/', function(req, res, next) {
	contest.find({},function(err,contestlist){
		var dict={
			user: req.session.user,
			call: req.session.call,
			is_admin: req.session.is_admin
		};
		dict.contestlist=[];
        contestlist.forEach(function (item) {
            var d = new Date();
            dict.contestlist.push({
                id: item._id,
                name: item.name,
                status: item.get_status(),
                start_time: helper.timestampToString(item.start_time),
                end_time: helper.timestampToString(item.end_time)
            });
        });
		res.render('contest_home',dict)
	});
});

router.get('/:id([0-9]+)',function(req,res,next){
	var contestid=parseInt(req.params.id)
	contest.findOne({_id:contestid}).populate('problems').exec(function(err,x){
		if (err) next(err)
		if (!x) next()
        if (x.get_status() == 'unstated') return next(new Error('Contest is not in progress!'));

		var dict={
			user: req.session.user,
			call: req.session.call,
			is_admin: req.session.is_admin
		};
		dict.contestid=contestid;
		dict.contesttitle = x.name;
		dict.problems=x.problems;
		dict.start = new Date().setTime(x.star).toLocaleString();
		dict.end = new Date().setTime(x.end).toLocaleString();
        dict.status = x.get_status();
		dict.active = 'problems';
		//console.log(x.problems[0])
		res.render('contest',dict);
	})
}) 


router.get('/:id([0-9]+)/status',function(req,res,next){
	var contestid=parseInt(req.params.id)
	var page=parseInt(req.params.page)
	var attr = {'contest':contestid}
	Step(function() {
		attr.user = req.session.uid;
		judge.find(attr).populate('problem').populate('user').populate('contest').exec(this);
	}, function(err, judgelist){
		//console.log(judgelist)
		var len=judgelist.length;
		if (page<1 || (page>(len-1)/10+1 && len)) next();
		if (!len && page>1) next();
		var dict={
			user: req.session.user,
			call: req.session.call,
			is_admin: req.session.is_admin
		};
		dict.contestid=contestid;
		
		var jlist=[];
		for(var i=0;i<len;i++){
			var judict={};
			//console.log(judgelist[i].user.username)
			judict.id=judgelist[i]._id;
			judict.title=judgelist[i].problem.title;
			judict.problemid=judgelist[i].problem_id;
			if (!judgelist[i].user) {
				judict.user = 'Unknown';
			} else {
				judict.user=judgelist[i].user.username;
			}
			judict.status=judgelist[i].status;
			judict.score=judgelist[i].score;
			judict.lang = judgelist[i].lang;
			var newtime=new Date();
			newtime.setTime(judgelist[i].submitted_time);
			judict.time=newtime.toLocaleString();
			jlist.push(judict);
		}
		dict.judgelist=jlist.reverse();
		dict.active = 'status';
		if (judgelist.length) {
			dict.contestname = judgelist[0].contest.name;
		}
		res.render('contest_status',dict)
	});
})

router.post('/:id([0-9]+)/skip',function(req,res,next){
	var contestid=req.params.id
	var page=req.body.page
	res.redirect('/contests/'+contestid+'/status/');
})

router.get('/:cid([0-9]+)/problems/:pid([0-9]+)',function(req,res,next){
    var contestid=parseInt(req.params.cid)
	var problemid=parseInt(req.params.pid)
    contest.findOne({_id: contestid}).populate("problems").exec(function (err, c) {
		if (err) next(err)
        if (c.get_status() == 'unstarted') return next(new Error('Contest is not in progress!'));
		if (!c || problemid < 0 || problemid > c.problems.length) next()

		p = c.problems[problemid];
		// console.log(p);

		try {
			var description = p.getDescriptionHTML();
		} catch (err) {
			var description = JSON.stringify(err);
		}
		var dict={
			user: req.session.user,
			call: req.session.call,
			is_admin: req.session.is_admin
		};
		dict.title = p.title;
		dict.problem = p;
		dict.description = description;
		dict.problemid = problemid;
		dict.contestid = contestid;
		dict.active = 'problem';
        dict.langs = p.meta.supported_languages;
        SubmitRecord.getSubmitRecord(req.session.uid, c._id, problemid, function (err, s) {
            if (err) return next(err);
            dict.best_solution = s.judge;
            dict.submitted_times = s.submitted_times;
            judge.find({user: req.session.uid, contest: c._id, problem_id: problemid}, function (err, judge_staus) {
                if (err) return next(err);
                dict.judge_status = [];
				var tmpStatus = [];
                judge_staus.forEach(function (item) {
                    tmpStatus.push({
                        _id: item._id,
                        status: item.status,
                        submitted_time: helper.timestampToTimeString(item.submitted_time),
                        score: item.score
                    });
                });
				dict.judge_status = tmpStatus.reverse();
                res.render('contest_problem', dict);
            });
        });
	});

});

router.post('/:cid([0-9]+)/problems/:pid([0-9]+)/upload',upload.single('inputfile'),function(req,res,next){
	console.log(req.session);
	if (typeof(req.file) == 'undefined') {
        // console.log("xx");
        return next(new Error("Undefined file."));
    }

    if (req.file.size > 0.5 * 1024 * 1024) {
        return next(new Error("The solution size is at most 512 KB."));
    }

    var suffix = {"g++": ".cpp", "java": ".java", "system": ".zip", "answer": ".ans", "system_g++": ".zip", "system_java": ".zip"};
	source_file = randomstring.generate(15) + suffix[req.body.language];

	var contestid=parseInt(req.params.cid);
	var problemid=parseInt(req.params.pid);


    contest.findOne({_id: contestid}).populate('problems').exec(function (err, x) {
        if (err) return next(err);
        if (problemid >= x.problems.length) return next();
        if (x.get_status() != 'in_progress') return next(new Error('Contest is not in progress!'));

        p = x.problems[problemid];
        var s;

        Step(function() {
			SubmitRecord.getSubmitRecord(req.session.uid, x._id, problemid, this);
		}, function (err, x) {
			if (err) throw err;
            if (x.submitted_times > 10) throw (new Error("You do not have s"));
			submit_record = x;
			submit_record.submitted_times += 1;
			submit_record.save(this);
            s = submit_record;
		}, function(err) {
			if (err) throw err;
			fse.move(req.file.path, path.join(SOURCE_DIR, source_file), this);
		}, function(err) {
            if (err) throw err;

            var newjudge = new judge({
                user:req.session.uid,
                contest: x._id,
                problem: p._id,

                problem_id: problemid,
                subtask_id:0,

                submitted_time:Date.now(),

                // solution information
                lang: req.body.language,
                source_file: source_file,

                // judge result
                score: 0,
                status: 'Waiting',
                case_count: p.subtasks[0].testcase_count,
                results: [{
                    score: 0,
                    memory: 0,
                    time: 0,
                    status: "Waiting"
                }]
            });
            for (var i = 0;  i < newjudge.case_count; i++) {
                if (newjudge.lang == 'system_g++' || newjudge.lang == 'system_java') {
                    newjudge.results.push({
                        score: 0,
                        total: 0,
                        correct: 0,
                        time: 0
                    });
                } else {
                    newjudge.results.push({
                        score: 0,
                        memory: 0,
                        time: 0,
                        status: "Waiting"
                    });
                }
            }
            // console.log(newjudge);

            newjudge.save(this);
        }, function (err, j) {
            if (err) throw err;
            s.update(j, this);
        }, function (err) {
            if (err) return next(err);
            res.redirect('/contests/'+contestid+'/status/');
        });
    });
});

router.post('/rejudge/:id([0-9]+)/:judgeid([0-9]+)',function(req,res,next){
	var contestId = parseInt(req.params.id);
    var judgeId = parseInt(req.params.judgeid);
	judge.findOne({_id:judgeId}).populate('contest').populate('problem').exec(function(err,x){
        if (err) return next(err);
        x.rejudge(function (err, x) {
            if (err) return next(err);
            res.redirect('/contests/' + x.contest._id + '/detail/' + x._id);
        });
	})
});

router.get('/:contestId/detail/:judgeId', function(req, res, next) {
    var contestId = req.params.contestId;
    var judgeId = req.params.judgeId;
    judge.findOne({ _id: judgeId }).populate('user').populate('problem').populate('contest').exec(function(err, doc) {
        if (err || !doc) {
            return res.status(400).render('error', {
                status: 400,
                message: 'No such submission'
            });
        }

        var has_permission = req.session.is_admin || (req.session.user  == doc.user.username); // 是管理员或者是自己的提交
        has_permission |= !doc.contest.is_frozen() && doc.isSystem(); // 没有封榜且是系统题

        if (!has_permission) {
            return res.status(400).render('error', {
                status: 400,
                message: 'Access denied'
            });
        }
        var renderArgs = {
            id: doc._id,
            problem_id: doc.problem_id,
            problem_name: doc.problem.title,
            lang: doc.lang,
            source: 'Source not found',
            status: doc.status,
            score: doc.score,
            results: doc.results
        };
		if (!doc.user) {
			renderArgs.user = 'Unknown';
		} else {
            renderArgs.user = doc.user.username;
		}

        if (doc.lang == 'system_g++' || doc.lang == 'system_java') {
            var total_time = 0;
            for (var i = 1; i < doc.results.length; i++) {
                total_time += doc.results[i].time;
            }
            renderArgs.total_time = total_time;
        } else {
            try {
                renderArgs.source = fs.readFileSync(path.resolve(__dirname, '../public/source', doc.source_file));
            } catch (error) {
            }
        }

        console.log(renderArgs);

        res.status(200).render('judge_detail', {
            active: 'judge_detail',
            title: 'TUOJ Judge details',
            contestid: contestId,
            user: req.session.user,
            call: req.session.call,
            is_admin: req.session.is_admin,
            res: renderArgs
        });
    });
});

router.get('/:cid([0-9]+)/rank_list', function (req, res, next) {
	var contest_id = parseInt(req.params.cid);
	contest.findOne({_id: contest_id}).populate('problems').exec(function (err, c) {
		if (err) return next(err);
		if (!c) return next();
        user.findOne({_id: req.session.uid}, function (err, u) {
            if (err) return next(err);
            helper.generateRankList(c, u, function (err, rank_list) {
                if (err) return next(err);
                var renderArgs = {
                    user: req.session.user,
					call: req.session.call,
                    is_admin: req.session.is_admin,
					is_frozen: c.is_frozen(),
                    contestid: c._id,
                    problems: [],
                    players: rank_list,
					active: 'ranklist'
                };
                for (var i in c.problems) {
                    if (c.problems[i].title) {
                        renderArgs.problems.push({
                            id: i,
                            title: c.problems[i].title
                        });
                    }
                }
                res.status(200).render('contest_ranklist', renderArgs);
            });
        });
	});
});

module.exports = router;
