var express=require('express')
var router=express.Router()
var upload = require("../config.js").MULTER_UPLOAD;

var fs=require('fs');
var judge=require('../models/models').judge
var contest=require('../models/models').contest

router.post('/[0-9]+/[A-Z]/upload', upload.single('inputfile'), function(req, res, next){
	console.log(req.body);
    console.log(req.file);
    if (typeof(req.file) === undefined) {
        // TODO: Returen more beautiful error information.
        return next(new Error("Undefined file."));
    }

    // TODO: Eliminate the race condition!
    // TODO: It's so important and hazard!
    judge.count(function(err, x) {
        if (err) return next(err);

        var new_judge = new judge({
            run_id: x + 1,
            user_id: req.session.user,

            contest_id: parseInt(contestid),
            problem_id: "?",
            subtask_id: 0,

            lang: req.body.language,
            source_files: "?",

            status: "Waiting",
            results: {
                "0": {
                    "status": "Waiting"
                }
            }

        });

        new_judge.save();
        res.redirect('/contests/'+contestid+'/status');
    });





    // res.redirect('/contests/'+contestid+'/status');
    /*
	var orm=new multiparty.Form({uploadDir:'./public/source/'})
	orm.parse(req,function(err,fields,files){
		var posturl=req.path.split('/')
		var contestid=posturl[1]
		var problemid=posturl[2]

		var originname=files.inputfile[0].originalFilename
		//var nowpath='./'+files.inputfile[0].path;//.replace(/\\/g,"\/")
		var nowpath='./'+files.inputfile[0].path.replace(/\\/g,"\/")
		console.log(originname+'\n')
		console.log(fields)
		var newjudge=new judge;


		judge.count(function(err,x){
			newjudge.runId=x+1
			newjudge.lang=fields.language[0]
			newjudge.userid=req.session.user
			newjudge.contestid=parseInt(contestid)
			newjudge.pd=0
			newjudge.score=0
			newjudge.probid = problemid;
			newjudge.tusStep = -1;
			newjudge.answer=String(fs.readFileSync(nowpath))
			contest.findOne({'id':parseInt(contestid)},function(err,x){
				newjudge.probGit=x.gitlist[problemid.charCodeAt()-65]
				newjudge.save()
				fs.unlinkSync(nowpath)
				res.redirect('/contests/'+contestid+'/status')
			})
		})
	})*/
})

module.exports=router
