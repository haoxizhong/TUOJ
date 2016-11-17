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
var path = require("path");
var upload = require("../config.js").MULTER_UPLOAD;
var randomstring = require('randomstring');
var SOURCE_DIR = require('../config').SOURCE_DIR;

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
		dict.contestid=contestid
		dict.problems=x.problems
		dict.start=x.start_time
		dict.end=x.end_time
		console.log(x.problems[0])
		res.render('contest',dict)
		// contest: contains hrefs leading to problems and status
	})
}) 

router.get('/:id([0-9]+)/status',function(req,res,next){
	var contestid=parseInt(req.params.id)
	//console.log(contestID)
	var attr = {'contest':contestid}
	Step(function() {
		attr.user = req.session.uid;
		judge.find(attr, this);
	}, function(err, judgelist){
		//console.log(judgelist)
		dict={'user':req.session.user,'is_admin':req.session.is_admin}
		dict.contestid=contestid
		dict.judgelist=judgelist
		
		res.render('contest_status',dict)
	});
})

router.get('/:cid([0-9]+)/problems/:pid([0-9]+)',function(req,res,next){
    var contestid=parseInt(req.params.cid)
	var problemid=parseInt(req.params.pid)
    
	problem.findOne({_id: problemid}, function (err, x) {
		if (err) next(err)
		if (!x) next()
			
		try {
            var description = x.getDescriptionHTML();
        } catch(err) {
            var description = JSON.stringify(err);
        }
		
		dict={'user':req.session.user,"is_admin":req.session.is_admin}
		dict.problem=x
		dict.description=description
		dict.problemid=problemid
		dict.contestid=contestid
		
		res.render('contest_problem',dict)
    })

})

router.post('/:cid([0-9]+)/problems/:pid([0-9]+)/upload',upload.single('inputfile'),function(req,res,next){
	if (typeof(req.file) == 'undefined') {
        console.log("xx");
        return next(new Error("Undefined file."));
    }
    var suffix = {"g++": ".cpp", "gcc": ".c"};
	source_file = randomstring.generate(15) + suffix[req.body.language];

	var contestid=parseInt(req.params.cid);
	var problemid=parseInt(req.params.pid);

    contest.findOne({_id: contestid}).populate('problems').exec(function (err, x) {
        if (err) return next(err);
        if (problemid >= x.problems.length) return next();
        p = x.problems[problemid];

        Step(function() {
            fse.move(req.file.path, path.join(SOURCE_DIR, source_file), this);
        }, function(err) {
            if (err) return next(err);

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
                status: 'Waiting',
                case_count: p.subtasks[0].testcase_count,
                results: []
            });

            newjudge.save(this);
        }, function (err, newjudge) {
            if (err) return next(err);
            res.redirect('/contests/'+contestid+'/status');
        });
    });
});

module.exports = router;
