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

router.get('/',function(req,res,next){
	res.render('addcontests',{'user':req.session.user,'is_admin':req.session.is_admin})
})

router.post('/added',function(req,res,next){
	var starttime=req.body.startdate+' '+req.body.starttime
	var endtime=req.body.enddate+' '+req.body.endtime
	var name=req.body.contestname
	var problemlist=req.body.gitlist.trim().split('\r\n')
	var len=problemlist.length
	
	var int_start=new Date(starttime).getTime()
	var int_end=new Date(endtime).getTime()
	
	var newcontest = new contest
	newcontest.name=name
	newcontest.start_time=int_start
	newcontest.end_time=int_end
	for (var i=0;i<len;i++)
		newcontest.problems.push(parseInt(problemlist[i]))
	newcontest.save(function(err, x) {
		if (err) {
			console.log(err)
		}
		//console.log(newcontest)
		res.redirect('/')
	});
})

module.exports = router
