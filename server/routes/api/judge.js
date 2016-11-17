var router = require('express').Router(); 
var Judge = require('../../models/judge');
var TOKEN = require('../../config').TOKEN;

router.post('/get_task/acm', function (req, res) {
	if (req.body.token != TOKEN) {
		return next();
	}
	Judge.findOne({'status': 'Waiting'}).populate('problem').exec(function (err, x) {
		if (err) return next(err);
		if (!x) {
			return res.send({
				'run_id': -1
			})
		}
		x.status = 'Running';
		x.judge_start_time = Date.now();
		x.save(function (err, x) {
			if (err) return next(err);
			res.send({
				'run_id': x._id,
				'lang': x.lang,
				'source_url': x.getSourceURL(),

				'total_cases': x.case_count,
				'data_md5': x.problem.data_md5,
				'data_url': x.problem.getDataURL()
			});
		});
	});
});
/*
router.post('/adopt', function(req, res) {
	judge.findOne({'pd':0},function(err,x){
		if (!x) {
			return res.send({});
		}
		pd=1
		x.save()
		res.send(x);
	})
});

router.post('/upload', function(req, res) {
	if (req.body.isEnd) {
		var cmd=req.body.cmd
		// judge score exec compile
		if (cmd=='score'){
			var id=parseInt(req.body.runId);
			judge.findOne({'runId':id},function(err,x){
				x.pd=2
				x.score=parseInt(req.body.score)
				x.save()
			})
			//console.log(req.body.runId,req.body.score);
		} else {
			judge.findOne({runId: req.body.runId}, function(err, doc) {
				if (doc) {
					doc.tusStep = req.body.tusStep;
					if (req.body.cmd == 'end') {
						doc.pd = 3;
					}
					doc.save();
				}
			});
		}
	}
	res.send({});
});
*/

module.exports = router;
