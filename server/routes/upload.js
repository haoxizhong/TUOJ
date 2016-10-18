var express=require('express')
var router=express.Router()

var multiparty=require('multiparty')
var fs=require('fs');
var judge=require('../models/user').judge
var contest=require('../models/user').contest

router.post('/[0-9]+/[A-Z]/upload',function(req,res,next){
	var orm=new multiparty.Form({uploadDir:'./public/source/'})
	orm.parse(req,function(err,fields,files){
		var posturl=req.path.split('/')
		var contestid=posturl[1]
		var problemid=posturl[2]
		
		var originname=files.inputfile[0].originalFilename
		var nowpath='./'+files.inputfile[0].path.replace(/\\/g,"\/")
		
		console.log(originname+'\n')
		console.log(fields)
		var newjudge=new judge;
		
		
		judge.count(function(err,x){
			newjudge.runId=x+1
			newjudge.lang=fields.language[0]
			newjudge.pd=0
			newjudge.answer=String(fs.readFileSync(nowpath))
			contest.findOne({'id':parseInt(contestid)},function(err,x){
				newjudge.probGit=x.gitlist[problemid.charCodeAt()-65]
				newjudge.save()
				fs.unlinkSync(nowpath)
				res.redirect('/contests/'+contestid+'/status')
			})
		})
	})
})

module.exports=router