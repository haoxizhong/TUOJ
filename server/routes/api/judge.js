var router = require('express').Router(); 
var Judge = require('../../models/judge');
var TOKEN = require('../../config').TOKEN;

router.post('/get_task/acm', function (req, res, next) {
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

router.post('/update_results', function (req, res, next) {
    if (req.body.token != TOKEN) {
        return next();
    }
    Judge.findOne({_id: req.body.run_id}).populate('problem').exec(function (err, x) {
        if (err) return next(err);
        if (!x) return next();

        try {
            x.updateStatus(req.body.results, function (err, x) {
                console.error(err);
                if (err) return next(err);
                res.send({
                    "status": "success"
                });
            });
        } catch (err) {
            res.send({
				"status": "failure",
				"message": err.message,
				"stack": err.stack
			});
        }
    });
});

module.exports = router;
