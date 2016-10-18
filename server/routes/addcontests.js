var express = require('express');
var router = express.Router();
var contest = require('../models/user').contest

router.get('/',function(req,res,next){
	res.render('addcontests',{})
})

router.post('/added',function(req,res,next){
	
	var starttime=req.body.starttime
	var endtime=req.body.endtime
	var startdate=req.body.startdate
	var enddate=req.body.enddate
	var gitlist=req.body.gitlist
	var contestname=req.body.contestname
	var txt=req.body.gitlist.split('\r\n')
	var len=txt.length
	
	var flag=0;
	
	if (!len) flag=6
	if (!contestname) flag=5
	if (!endtime) flag=4
	if (!enddate) flag=3
	if (!starttime) flag=2
	if (!startdate) flag=1 
	
	if (startdate>enddate || (startdate==enddate && starttime>=enddate))
		flag=7
	
	if (!flag)
	{
		var newcontest=new contest
		contest.count(function(err,x){
			newcontest.name=contestname
			newcontest.id=x+1;
			newcontest.starttime={date:startdate,time:starttime}
			newcontest.endtime={date:enddate,time:endtime}
			for (var i=0;i<len;i++)
				newcontest.gitlist.push(txt[i])
			newcontest.save()
			console.log(newcontest)
		})
	}
	
	res.redirect('/')
})
module.exports = router