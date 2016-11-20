var express = require('express');
var router = express.Router();
var fse = require('fs-extra');

var contest = require('../models/contest.js');
var problem = require('../models/problem.js');
var judge = require('../models/judge.js');
var user = require('../models/user.js');

router.get('/:page([0-9]+)',function(req,res,next){
	var page=parseInt(req.params.page);
	judge.find({}).populate("user").populate("problem").exec(function(err,judgelist){
		var len=judgelist.length;
		if (page<1 || (page>(len-1)/10+1 && len)) next();
		if (!len && page>1) next();
		dict={'user':req.session.user,'is_admin':req.session.is_admin};
		
		var jlist=[];
		for(var i=0;i<len;i++){
			var judict={};
			console.log(judgelist[i].user.username)
			judict.id=judgelist[i]._id;
			judict.title=judgelist[i].problem.title;
			judict.user=judgelist[i].user.username;
			judict.status=judgelist[i].status;
			judict.score=judgelist[i].score;
			var newtime=new Date();
			newtime.setTime(judgelist[i].submitted_time);
			judict.time=newtime.toLocaleString();
			jlist.push(judict);
		}
			
		console.log(judict);
		dict.judgelist=jlist;
		dict.maxpage=(len-1)/10+1;
		dict.nowpage=page;
		res.render('all_status',dict);
	})
});

router.post('/skip',function(req,res,next){
	var page=req.body.page;
	res.redirect('/status/'+page);
});

router.get('/detail/:id([0-9]+)', function (req, res, next) {
	var judge_id = parseInt(req.params.id);
	judge.findOne({_id: judge_id}).populate('user').populate('problem').populate('contest').exec(function (err, j) {
		if (err) next(err);
		if (!j) next();
		var code = j.getSource();
		var d = {
			user: req.session.user,
			is_admin: req.session.is_admin,
			j: j,
			code: code
		};
		res.render('judge_detail', d)
	});
});

module.exports = router;