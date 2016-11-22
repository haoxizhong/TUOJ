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
		dict={'user':req.session.user,'is_admin':req.session.is_admin}
		dict.contestlist=contestlist
		res.render('contest_home',dict)
	})
});

router.get('/:id([0-9]+)',function(req,res,next){
	var contestid=parseInt(req.params.id)
	contest.findOne({_id:contestid}).populate('problems').exec(function(err,x){
		if (err) next(err)
		if (!x) next()
		
		dict={'user':req.session.user,"is_admin":req.session.is_admin}
		dict.contestid=contestid;
		dict.contesttitle = x.name;
		dict.problems=x.problems;
		dict.start=x.start_time;
		dict.end=x.end_time;
		dict.active = 'problems';
		//console.log(x.problems[0])
		res.render('contest',dict);
		// contest: contains hrefs leading to problems and status
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
		dict={'user':req.session.user,'is_admin':req.session.is_admin};
		dict.contestid=contestid;
		
		var jlist=[];
		for(var i=0;i<len;i++){
			var judict={};
			//console.log(judgelist[i].user.username)
			judict.id=judgelist[i]._id;
			judict.title=judgelist[i].problem.title;
			judict.problemid=judgelist[i].problem_id;
			judict.user=judgelist[i].user.username;
			judict.status=judgelist[i].status;
			judict.score=judgelist[i].score;
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
		if (!c || problemid < 0 || problemid > c.problems.length) next()

		p = c.problems[problemid];
		// console.log(p);

		try {
			var description = p.getDescriptionHTML();
		} catch (err) {
			var description = JSON.stringify(err);
		}

		dict = {'user': req.session.user, "is_admin": req.session.is_admin}
		dict.title = p.title;
		dict.problem = p;
		dict.description = description;
		dict.problemid = problemid;
		dict.contestid = contestid;
		dict.active = 'problem';
		// console.log(dict);
		res.render('contest_problem', dict);
	});

})

router.post('/:cid([0-9]+)/problems/:pid([0-9]+)/upload',upload.single('inputfile'),function(req,res,next){
	if (typeof(req.file) == 'undefined') {
        // console.log("xx");
        return next(new Error("Undefined file."));
    }
    var suffix = {"g++": ".cpp", "java": ".java", "system": ".zip"};
	source_file = randomstring.generate(15) + suffix[req.body.language];

	var contestid=parseInt(req.params.cid);
	var problemid=parseInt(req.params.pid);

    contest.findOne({_id: contestid}).populate('problems').exec(function (err, x) {
        if (err) return next(err);
        if (problemid >= x.problems.length) return next();
        p = x.problems[problemid];

        Step(function() {
			SubmitRecord.getSubmitRecord(req.session.uid, x._id, problemid, this);
		}, function (err, x) {
			if (err) throw err;
			submit_record = x;
			submit_record.submitted_times += 1;
			submit_record.save(this);
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
                results: []
            });
            for (var i = 0;  i < newjudge.case_count + 1; i++) {
                newjudge.results.push({
                    score: 0,
                    memory: 0,
                    time: 0,
                    status: "Waiting"
                });
            }
            // console.log(newjudge);

            newjudge.save(this);
        }, function (err) {
			if (err) return next(err);
			res.redirect('/contests/'+contestid+'/status/');
		});
    });
});

router.get('/detail/:contestId/:judgeId', function(req, res, next) {
    var contestId = req.params.contestId;
    var judgeId = req.params.judgeId;
    judge.findOne({ _id: judgeId }).populate('user').populate('problem').exec(function(err, doc) {
        if (err || !doc) {
            return res.status(400).render('error', {
                status: 400,
                message: 'No such submission'
            });
        }
        if (!req.session.is_admin && req.session.user != doc.user.username) {
            return res.status(400).render('error', {
                status: 400,
                message: 'Access denied'
            });
        }
        var renderArgs = {
            id: doc._id,
            user: doc.user.username,
            problem_id: doc.problem_id,
            problem_name: doc.problem.title,
            source: fs.readFileSync(path.resolve(__dirname, '../public/source', doc.source_file)),
            status: doc.status,
            score: doc.score,
            results: doc.results
        };
        res.status(200).render('judge_detail', {
			active: 'judge_detail',
            title: 'TUOJ Judge details',
            contestid: contestId,
            user: req.session.user,
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
                    is_admin: req.session.is_admin,
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
