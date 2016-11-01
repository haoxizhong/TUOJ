var express = require('express')
var router = express.Router()
var git = require('nodegit')
var markdown = require('markdown').markdown
var fs = require('fs')
var fse = require('fs-extra')
var contest = require('../models/user').contest
var judge = require('../models/user').judge

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

var getID=function(getpath) {
	var tmp=0
	for (tmp=1;tmp<getpath.length;tmp++)
			if (getpath[tmp]>'9' || getpath[tmp]<'0')
				break
	return getpath.slice(1,tmp)
}

router.get('/', function(req, res, next) {
	contest.find({},function(err,contestlist){
		res.render('contest_home',{'contestlist':contestlist,'user':req.session.user,'power':req.session.admin})
	})
});

router.get('/[0-9]+',function(req,res,next){
	var contestID=getID(req.path)
	contest.findOne({'id':parseInt(contestID)},function(err,x){
		console.log(x.gitlist)
		res.render('contest',{'contestid':contestID,'gitlist':x.gitlist,'user':req.session.user})
	})
}) 

router.get('/[0-9]+/status',function(req,res,next){
	var contestID=getID(req.path)
	console.log(contestID)
	judge.find({contestid:parseInt(contestID)},function(err,judgelist){
		console.log(judgelist)
		res.render('contest_status',{'contestid':contestID,'user':req.session.user,'judgelist':judgelist})
	})
})

router.get('/[0-9]+/problems/[A-Z]',function(req,res,next){
	var contestID=getID(req.path)
	var problemID=req.path.substr(-1)
	
	contest.findOne({'id':parseInt(contestID)},function(err,x){
		var probgit=x.gitlist[problemID.charCodeAt()-65]
		git.Clone(probgit,'tmpprob').then(function(repository){
			var filepath='./tmpprob/files/description.md'
			var probmd=markdown.toHTML(String(fs.readFileSync(filepath)))
			fse.remove('./tmpprob',function(err){
				console.log(err);
				res.render('contest_problem',{'user':req.session.user,'probmd':probmd,'contestid':contestID,'problemid':problemID,'gitt':x.gitlist[problemID.charCodeAt()-65]})
			})
		},function(err){console.log(err)});//.catch((err)=>console.log(err))
	})
})

module.exports = router;
