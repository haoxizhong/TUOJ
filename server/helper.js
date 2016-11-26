var Contest = require('./models/contest');
var SubmitRecord = require('./models/submit_record');
var RankList = require('./models/rank_list');
var Judge = require('./models/judge');
var Step = require('step');

var updateRankList = function (c, rank_list, records, callback) {
    if (typeof(rank_list) == 'undefined') rank_list = [];
    var user2it = {};
    for (var i = 0; i < rank_list.length; i++) {
       user2it[rank_list[i].user.username] = i;
    }

    for (var i = 0; i < records.length; i++) {
        var record =records[i];
		if (!record.user) {
			continue;
		}
		if (user2it[record.user.username] == undefined) {
            user2it[record.user.username] = rank_list.length;
            rank_list.push({
                user: {
					user_id: record.user._id, 
					username: record.user.username, 
					realname: record.user.realname,
					school: record.user.school
				},
                total_score:0,
                details: new Array(c.problems.length).fill({judge_id: undefined, score: 0, is_system: false})
            });
        }
        var list_it = user2it[record.user.username];
		var judge_id = record.judge ? record.judge._id : 'null';
        rank_list[list_it].details[record.contest_problem_id] = {
			judge_id: judge_id, 
			score: record.score, 
			is_system: record.judge ? record.judge.isSystem() : false
		};
    }

    for (var i = 0; i < rank_list.length; i++) {
        rank_list[i].total_score = 0;
        for (var j = 0; j < rank_list[i].details.length; j++) {
            rank_list[i].total_score += rank_list[i].details[j].score;
        }
    }
    // sort by score in descending order.
    rank_list = rank_list.sort(function (r1, r2) {
        return r2.total_score - r1.total_score;
    });

    callback(null, rank_list);
};

var generateRankList = function(c, user, callback) {
    var find_cond = {};
    var rank_list = [];
    Step(function () {
        if (c.is_frozen() && user.is_admin == false) {
            find_cond = {
                contest: c._id,
                user: user._id
            };
            RankList.findOne({contest: c._id}).sort('-_id').exec(this);
        } else {
            find_cond = {
                contest: c._id
            };
            this(null, null);
        }
    }, function (err, r) {
        if (err) throw err;
        if (r) {
            rank_list = r.list;
        }
        this();
    }, function (err) {
        if (err) throw err;
        SubmitRecord.find(find_cond).populate('user').populate('judge').exec(this);
    }, function (err, records) {
        if (err) throw err;
        updateRankList(c, rank_list, records, this);
    }, function (err, rank_list) {
        if (err) return callback(err);
        if (!c.is_frozen()) {
            var r = new RankList({
                contest: c._id,
                generated_time: Date.now(),
                list: rank_list
            });
            r.save();
        }
        callback(err, rank_list);
    });
};

var isPassQuery = function(r) {
    return r.correct > 0 && r.total == r.correct;
};

var isPassAllQuery = function (r) {
    for (var i = 2; i < r.length; i++) {
        if (r[i].correct > 0 && isPassQuery(r[i])) {
        } else {
            return false;
        }
    }
    return true;
};

var calTotalTime = function (r) {
    var total_time = 0;
    for (var i = 0; i < r.length; i++) {
        if (typeof(r[i].time) != 'undefined') {
            total_time += r[i].time;
        }
    }
    return total_time;
};

var updateScore = function (judge, best_times, mid_times) {

    var total_score = 0;
    for (var i = 2; i < judge.results.length; i++) {
        var r = judge.results[i];
        if (isPassQuery(r)) {
            r.score = 25;
            if (r.time != 0) r.score += Math.min(10, 10 * mid_times[i - 1] / r.time) + Math.min(15, 15 * best_times[i - 1] / r.time);
            else r.score += 25;
        } else {
            if (r.total != 0) r.score = 25 * r.correct / r.total;
            else r.score = 0;
        }
        total_score += r.score;
    }

    var r =  judge.results[1];

    if (isPassAllQuery(judge.results)) {
        var t = calTotalTime(judge.results);
        if (t == 0) r.score = 50;
        else r.score = Math.min(20, 20 * mid_times[0] / t) + Math.min(30, 30 * best_times[0] / t);

    } else {
        r.score = 0;
    }

    total_score += r.score;
    total_score = total_score.toFixed(2);
    judge.score = total_score;

};

var systemProblemUpdateScore = function (contest_id, problem_id, callback) {
    var inf = 100000000;
    var judges = {}; // judges[user]: judges
    var times = new Array(5);
    for (var i = 0; i < times.length; i++) times[i] = [inf]

    Step(function () {
        Judge.find({problem: problem_id, $or: [{'status': 'Running success'}, {'status': 'Running timeout'}, {'status': 'Running error'}]}, this);
    }, function (err, js) {
        if (err) throw err;
        for (var i = 0; i < js.length; i++) {
            var j = js[i];
            if (typeof(judges[j.user]) == 'undefined') judges[j.user] = [];
            judges[j.user].push(j);
        }

        for (var user_id in judges) {
            if (typeof(user_id) == 'undefined') continue;
            var user_best_times = new Array(5).fill(inf);
            for (var i = 0; i < judges[user_id].length; i++) {
                var r = judges[user_id][i].results;

                if (isPassAllQuery(r)) user_best_times[0] = Math.min(user_best_times[0], calTotalTime(r));
                for (var j = 2; j < r.length; j++) {
                    if (isPassQuery(r[j])) user_best_times[j - 1] = Math.min(user_best_times[j - 1], r[j].time);
                }
            }
            for (var i = 0; i < 5; i++) if (user_best_times[i] < inf) {
                times[i].push(user_best_times[i]);
            }
        }

        var best_times = new Array(5).fill(inf);
        var mid_times = new Array(5).fill(inf);
        for (var i = 0; i < 5; i++) {
            times[i].sort(function (a, b) {
                return a - b;
            });
            best_times[i] = times[i][0];
            mid_times[i] = times[i][Math.floor(times[i].length / 2)];
        }
        for (var user_id in judges) {
            for (var i = 0; i < judges[user_id].length; i++) {
                updateScore(judges[user_id][i], best_times, mid_times);
            }

            (function (user_id) {
                for (var i = 0; i < judges[user_id].length; i++) {
                    judges[user_id][i].markModified('results');
                    judges[user_id][i].save(function (err) {
                       if (err) console.error(err);
                    });
                }
                var problem_id = judges[user_id][0].problem_id;
                SubmitRecord.getSubmitRecord(user_id, contest_id, problem_id, function (err, s) {
                    if (err) return console.error(err);
                    s.score = -1;
                    for (var i = 0; i < judges[user_id].length; i++) {
                        var j =judges[user_id][i];
                        if (j.score >= s.score) {
                            s.score = j.score;
                            s.judge = j._id;
                        }
                    }
                    s.save(function (err) {
                        if (err) console.error(err);
                    })
                });
            })(user_id);
        }

        this(null);
    }, function (err) {
        callback(err);
    });
};

var timestampToString = function (t) {
    var d = new Date();
    d.setTime(t);
    return d.toLocaleString();
};
var timestampToTimeString = function (t) {
    var d = new Date();
    d.setTime(t);
    return d.toLocaleTimeString();
};

module.exports = {
    systemProblemUpdateScore: systemProblemUpdateScore,
    generateRankList: generateRankList,
    timestampToString:timestampToString,
    timestampToTimeString:timestampToTimeString
};
