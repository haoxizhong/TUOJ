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
        return next(new Error("Please select file."));
    }

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
})

module.exports=router
