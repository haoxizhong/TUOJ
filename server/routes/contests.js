var express = require('express');
var router = express.Router();
var git = require('nodegit');
var markdown = require('markdown').markdown
var fs = require('fs')
var contest = require('../models/user').contest

/* GET users listing. */

var getID=function(getpath) {
	var tmp=0
	for (tmp=1;tmp<getpath.length;tmp++)
			if (getpath[tmp]>'9' || getpath[tmp]<'0')
				break
	return getpath.slice(1,tmp)
}

router.get('/', function(req, res, next) {
	contest.find({},function(err,contestlist){
		res.render('contest_home',{'contestlist':contestlist})
	})
});

router.get('/[0-9]+',function(req,res,next){
	var contestID=getID(req.path)
	contest.findOne({'id':parseInt(contestID)},function(err,x){
		console.log(x.gitlist)
		res.render('contest',{'contestid':contestID,'gitlist':x.gitlist})
	})
}) 

router.get('/[0-9]+/status',function(req,res,next){
	var contestID=req.path
	res.render('contest_status',{contestid:getID(contestID)})
})

router.get('/[0-9]+/problems/[A-Z]',function(req,res,next){
	var contestID=getID(req.path)
	var problemID=req.path.substr(-1)
	
	contest.findOne({'id':parseInt(contestID)},function(err,x){
		var probgit=x.gitlist[problemID.charCodeAt()-65]
		git.Clone(probgit,'tmpprob').then(function(repository){
			var filepath='./tmpprob/doc/description.md'
			var probmd=markdown.toHTML(String(fs.readFileSync(filepath)))
			res.render('contest_problem',{'probmd':probmd,'contestid':contestID,'problemid':problemID,'gitt':x.gitlist[problemID.charCodeAt()-65]})
		},function(err){console.log(err)});//.catch((err)=>console.log(err))
	})
})

module.exports = router;
