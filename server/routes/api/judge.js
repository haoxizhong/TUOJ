var router = require('express').Router(); 
var Judge = require('../../models/judge');
var SubmitRecord = require('../../models/submit_record');
var Step = require('step');
var helper = require('../../helper');
var TOKEN = require('../../config').TOKEN;

router.post('/get_task/acm', function (req, res, next) {
	if (req.body.token != TOKEN) {
		return next();
	}
	Judge.findOne({'status': 'Waiting', 'lang': {'$or': ['g++', 'java', 'answer']}}).populate('problem').exec(function (err, x) {
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
			info = {
				'run_id': x._id,
				'lang': x.lang,
				'source_url': x.getSourceURL(),

				'total_cases': x.case_count,
				'data_md5': x.problem.data_md5,
				'data_url': x.problem.getDataURL()
			};
			if (x.problem.subtasks && x.problem.subtasks.length > 1) {
				info['source_url'] = new Array(x.problem.subtasks.length);
				info['source_url'][x.subtask_id] = x.getSourceURL();
			}
			res.send(info);
		});
	});
});

router.post('/update_results/acm', function (req, res, next) {
	if (req.body.token != TOKEN) {
		return next();
	}
    console.log(req.body);
	var run_id  = parseInt(req.body.run_id);
	Judge.findOne({_id: run_id}).populate('problem').exec(function (err, x) {
		//if (err) return next(err);
		if (!x) return next();
		Step(function() {
			x.updateStatus(req.body.results, this);
		}, function(err, j) {
			if (err) throw err;
			x = j;
            this();
		}, function (err) {
			if (err) throw err;
			if (!(x.status == 'Running' || x.status == 'Waiting')) {
				SubmitRecord.getSubmitRecord(x.user, x.contest, x.problem_id, this);
			} else {
				this(null, null);
			}
		}, function (err, s) {
			if (err) throw err;
			if (!s) return this(null);
			s.update(x, this);
		}, function (err) {
			if (err) {
				res.send({
					"status": "failure",
					"message": err.message,
					"stack": err.stack
				});
			} else {
				res.send({
					"status": "success"
				});
			}
		});
	});
});

router.post('/get_task/system', function (req, res, next) {
	if (req.body.token != TOKEN) {
		return next();
	}
	Judge.findOne({'status': 'Waiting', 'lang': {'$or': ['system_g++', 'system_java']}}).populate('problem').exec(function (err, x) {
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
			var lang = 'system';
			if (x.lang == 'system_g++') lang = 'g++';
			else if (x.lang == 'system_java') lang = 'java';
			info = {
				'run_id': x._id,
				'lang': lang,
				'source_url': x.getSourceURL()
			};
			res.send(info);
		});
	});
});

router.post('/update_results/system', function (req, res, next) {
	if (req.body.token != TOKEN) {
		return next();
	}
	var run_id = parseInt(req.body.run_id);
	Step(function () {
		Judge.findOne({_id: run_id}, this);
	}, function (err, j) {
		if (err) throw err;
		var results = req.body.results;
		j.systemProblemUpdate(this);
	}, function (err, j) {
		if (err) throw err;
		helper.systemProblemUpdateScore(j, this);
	}, function (err, j) {
		if (err) {
			res.send({
				"status": "failure",
				"message": err.message,
				"stack": err.stack
			});
		} else {
			res.send({
				"status": "success"
			});
		}
	});
});

module.exports = router;
