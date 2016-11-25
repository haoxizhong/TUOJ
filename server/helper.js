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
                details: new Array(c.problems.length).fill({judge_id: undefined, score: 0})
            });
        }
        var list_it = user2it[record.user.username];
        rank_list[list_it].details[record.contest_problem_id] = {judge_id: record.judge, score: record.score};
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
            this(null, null);
        } else {
            find_cond = {
                contest: c._id
            };
            RankList.findOne(find_cond, this);
        }
    }, function (err, r) {
        if (err) throw err;
        if (r) {
            rank_list = r.list;
        }
        this();
    }, function (err) {
        if (err) throw err;
        SubmitRecord.find(find_cond).populate('user').exec(this);
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

var systemProblemUpdateScore = function (p, callback) {
    var inf = 10000000;
    var judges;

    // TODO: ...
    var best_time = new Array(5).fill(inf);
    var times;
    var corrects;

    Step(function () {
        Judge.find({problem: p._id, $or: [{'status': 'Running success'}, {'status': 'Running timeout'}, {'status': 'Running error'}]}, this);
    }, function (err, x) {
        judges = x;
        times = new Array(judges.length).fill(inf);
        corrects = new Array(judges.length).fill(false);
        for (var i = 0; i < judges.length; i++) {
            var all_correct = true;
            var total_time = 0;
            for (var j = 2; j < judges[i].results.length; j++) {
                var r = judges[i].results[j];
                var is_correct = r.total && r.correct == r.total;
                all_correct = all_correct && is_correct;
                total_time += r.time;
                if (is_correct) {
                    best_time[j-1] = Math.min(best_time[j-1], r.time);
                }

                if (r.total <= 0) {
                    r.score = 0;
                } else {
                    r.score = r.correct / r.total * 25;
                }
            }
            total_time += judges[i].results[1].time;
            if (all_correct) {
                best_time[0] = Math.min(total_time);
            }

            times[i] = total_time;
            corrects[i] = all_correct;
        }

        for (var i = 0; i < judges.length; i++) {
            var total_score = 0;
            if (corrects[i]) {
                judges[i].results[1].score = 50 * (best_time[0] / times[i]);
                total_score += judges.results[1].score;
            } else {
                judges[i].results[1].score = 0;
            }

            for (var j = 2; j < judges[i].results.length; j++) {
                var r = judges[i].results[j];
                var is_correct = r.total && r.correct == r.total;
                if (is_correct) {
                    if (r.time <= 0) {
                        r.score += 25;
                    } else {
                        r.score += 25 * (best_time[j - 1] / r.time);
                    }
                }
                total_score += judges[i].results[j].score;
            }

            judges[i].score = total_score;

            judges[i].markModified('results');
            // console.log(judges[i]);
            judges[i].save(function (err) {
                if (err) {
                    console.error(err);
                }
            });
        }

        callback(null);
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
