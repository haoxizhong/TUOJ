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
/* GET users listing. */

var delet=function(path){
	var flag=0
	fs.readdir(path,function(err,files){
		for(var i=0;i<files.length;i++){
			var filepath=files[i]
			fs.stat(filepath,function(err,stats){
				if (stats.isFile())
					fs.unlinkSync(filepath)
				else	
					if (stats.isDirectory())
						delet(filepath)
			});
		}
		fs.rmdirSync(path)
	});
}

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
	if (typeof(req.file) === undefined) {
        return next(new Error("Undefined file."));
    }
	
	var contestid=parseInt(req.params.cid)
	var problemid=parseInt(req.params.pid)
	
	var newjudge = new judge({
		user:req.session.uid,
		contest:contestid,
		problem:problemid,
		subtask_id:0,
		
		submitted_time:Date.now(),

		// solution information
		lang: req.body.language,
		source_file: '?',

		// judge result
		status: 'Waiting',
		cases_count: 0,
		results: []
	})
	console.log(newjudge)
	newjudge.save(function(err,x){console.log(err)})
    res.redirect('/contests/'+contestid+'/status');
})

module.exports = router;
