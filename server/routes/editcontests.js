var express = require('express');
var router = express.Router();
var contest = require('../models/contest.js')
var path = require("path");
var randomstring = require("randomstring");
var fse = require("fs-extra");
var git = require("nodegit");

// Import configurations
var CONFIG = require("../config");
var PROB_DIR = CONFIG.PROB_DIR;
var TMP_DIR = CONFIG.TMP_DIR;

/*var updateProblems = function(contest) {
    for (var i = 0 ; i < contest.problems; i++) {
        url = contest.gitlist[i];
        tmp_repo = randomstring.generate(8);

        repo = contest.getProblemRepo(i);
        tmp_repo = path.join(TMP_DIR, tmp_repo);

        // WTF... I hate async paradigm now. // via Chenyao2333

        (function(url, repo, tmp_repo) {
            git.Clone(url, tmp_repo).then(function (repository) {
                //console.log("Repo: " + repo);
                fse.remove(repo, function (err) {
                    if (err) return console.log(err);
                    fse.move(tmp_repo, repo, function (err) {
                        if (err) return console.log(err);
                        console.log("Successfully cloned into " + repo);
                    });
                });
            }, function (err) {
                // TODO: threw error
                console.log(err)
            });
        })(url, repo, tmp_repo);

    }
};
*/

function add0(m) {
	return m<10?'0'+m:m;
}
function getdate(inttime){
	var time=new Date(inttime);
	var y=time.getFullYear();
	var m=time.getMonth();
	var d=time.getDate();
	return y+'-'+add0(m)+'-'+add0(d);
}
function gettime(inttime){
	var time=new Date(inttime);
	var h=time.getHours();
	var m=time.getMinutes();
	var s=time.getSeconds();
	return add0(h)+':'+add0(m)+':'add0(s);
}

router.get('/:id([0-9]+)',function(req,res,next){
	var contestid=req.params.id;
	contest.findOne({_id:contestid},function(err,x){
		dict={'user':req.session.user,'is_admin':req.session.is_admin};
		var str='';
		for (var i=0;i<x.problems.length;i++)
			str=str+x.problems[i].toString()+'\n';
		
		dict.startdate=getdate(x.int_start);
		dict.starttime=getdate(x.int_start);
		dict.enddate=getdate(x.int_end);
		dict.endtime=getdate(x.int_end);
		
		dict.gitlist=str;
		dict.name=x.name;
		res.render('editcontests',dict);
	})
})

router.post('/:id([0-9]+)/edited',function(req,res,next){
	var contestid=req.params.id;
	var starttime=req.body.startdate+' '+req.body.starttime;
	var endtime=req.body.enddate+' '+req.body.endtime;
	var name=req.body.contestname;
	var problemlist=req.body.gitlist.split('\r\n');
	var len=problemlist.length;
	
	var int_start=new Date(starttime).getTime();
	var int_end=new Date(endtime).getTime();
	
	contest.findOne({_id:contestid},function(err,x){
		x.name=name;
		x.start_time=int_start;
		x.end_time=int_end;
		x.problems=[];
		for (var i=0;i<len;i++)
			x.problems.push(parseInt(problemlist[i]));
		x.save();
		res.redirect('/contests');
	})
})

module.exports = router
