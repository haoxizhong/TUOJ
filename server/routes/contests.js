var express = require('express')
var router = express.Router()
var git = require('nodegit')
var markdown = require('markdown').markdown
var fs = require('fs')
var fse = require('fs-extra')
var Step = require('step');
var contest = require('../models/user').contest
var judge = require('../models/user').judge
var user = require('../models/user').user
var path = require("path");
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
		//console.log(x.gitlist)
		res.render('contest',{'contestid':contestID,'gitlist':x.gitlist,'user':req.session.user,'power':req.session.admin})
	})
}) 

router.get('/[0-9]+/status',function(req,res,next){
	var contestID=getID(req.path)
	//console.log(contestID)
	var attr = {
		contestid:parseInt(contestID),
	};
	Step(function() {
		user.findOne({ userid: req.session.user }, this);
	}, function(err, doc) {
		if (!doc) {
			return res.redirect('/login'), undefined;
		}
		if (!doc.power) {
			attr.userid = req.session.user;
		}
		judge.find(attr, this);
	}, function(err, judgelist){
		//console.log(judgelist)
		res.render('contest_status',{'contestid':contestID,'user':req.session.user,'judgelist':judgelist,'power':req.session.admin})
	});
})

router.get('/[0-9]+/problems/[A-Z]',function(req,res,next){
    var contestID=getID(req.path)
    var problemID=req.path.substr(-1)
	var problemID_int = problemID.charCodeAt() - 'A'.charCodeAt();
    contest.findOne({'id': parseInt(contestID)}, function (err, x) {
        var filepath = path.join(x.getProblemRepo(problemID_int), "files", "description.md");
        var probmd = markdown.toHTML(String(fs.readFileSync(filepath)));
        res.render('contest_problem', {
            'user': req.session.user,
            'probmd': probmd,
            'contestid': contestID,
            'problemid': problemID,
            'gitt': x.gitlist[problemID_int]
        });
    });

})

module.exports = router;
