var express = require('express');
var router = express.Router();
var contest = require('../models/user').contest

var getID=function(getpath) {
	var tmp=0
	for (tmp=1;tmp<getpath.length;tmp++)
			if (getpath[tmp]>'9' || getpath[tmp]<'0')
				break
	return getpath.slice(1,tmp)
}


router.get('/',function(req,res,next){
	res.render('addcontests',{user:req.session.user})
})

router.get('/[0-9]+',function(req,res,next){
	var contestID=getID(req.path)
	console.log('sds')
	contest.findOne({id:parseInt(contestID)},function(err,x){
		
		var dic={}
		dic.user=req.session.user
		dic.starttime=x.starttime.time
		dic.endtime=x.endtime.time
		dic.startdate=x.starttime.date
		dic.enddate=x.endtime.date
		dic.gitlist=x.gitlist
		dic.contestname=x.name
		dic.contestid=contestID;
		
		var str=''
		for(var i=0;i<dic.gitlist.length;i++)
			str=str+dic.gitlist[i]+'\n'
		dic.tex=str;
		
		
		res.render('editcontests',dic)
	})
})

router.post('/[0-9]+/edited',function(req,res,next){
	
	var contestID=getID(req.path)
	var starttime=req.body.starttime
	var endtime=req.body.endtime
	var startdate=req.body.startdate
	var enddate=req.body.enddate
	var gitlist=req.body.gitlist
	var contestname=req.body.contestname
	var txt=req.body.gitlist.trim().split('\r\n')
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
		contest.findOne({id:parseInt(contestID)},function(err,newcontest){
			newcontest.name=contestname
			newcontest.starttime={date:startdate,time:starttime}
			newcontest.endtime={date:enddate,time:endtime}
			newcontest.gitlist=[]
			for (var i=0;i<len;i++)
				newcontest.gitlist.push(txt[i])
			newcontest.save()
		})
	}
	
	res.redirect('/')
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