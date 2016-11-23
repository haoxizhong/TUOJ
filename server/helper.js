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
        if (user2it[record.user.username] == undefined) {
            user2it[record.user.username] = rank_list.length;
            rank_list.push({
                user: {user_id: record.user._id, username: record.user.username},
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

var systemProblemUpdateScore = function (j, callback) {
    var c;
    var updated = false;
    Step(function () {
        Contest.findOne({_id: j.id},this);
    }, function (err, x) {
        if (err) throw err;
        c = x;
        if (typeof(c.meta.best_time) == 'undefined') {
            c.meta.best_time = new Array(j.results.length - 1).fill(1000000);
        }

        var all_correct = true;
        for (var i = 2; i < j.results.length; j++) {
            var is_correct = j.results[i].correct == j.results[i].total && j.results[i].total != 0;
            all_correct = is_correct && all_correct;
            if (is_correct) {
                var t = j.results[i].time;
                if (t < c.meta.best_time[i - 1]) {
                    updated = true;
                    c.meta.best_time[i - 1] = t;
                }
            }
        }
        if (all_correct) {
            var total_time = 0;
            for (var i = 1; i < j.results.length; i++) {
                total_time += j.results[i].time;
            }
            if (total_time < c.meta.best_time[0]) {
                updated = true;
                c.meta.best_time[0] = total_time;
            }
        }

        if (updated) {
            c.markModified('meta');
            c.save(this);
        } else {
            callback(null, c);
        }
    }, function (err, x) {
        if (err) throw err;
        c = x;
        if (updated) {
            Judge.find({contest: c._id}, this);
        } else {
            this(null, [j]);
        }
    }, function (err, judges) {
        if (err) throw err;
        judges.forEach(function (item) {
            var all_correct = true;
            var total_time = 0;
            for (var i = 2; i < item.results.length; i++) {
                var is_correct = item.results[i].correct == item.results[i].total && item.results[i].total != 0;
                all_correct = is_correct && all_correct;
                total_time += item.results[i].time;

                item.results[i].score = 25 * (item.results[i].correct / item.results[i].total);
                if (is_correct) {
                    var ratio = meta.best_time[i - 1] / item.result[i].time;
                    item.results[i].score += ratio * 25;
                }
            }

            item.results[0].score = 0;
            if (all_correct) {
                total_time += item.results[1].time;
                item.results[0].score = meta.best_time[i - 1] / total_time;
            }

            item.score = 0;
            for (var i = 1; i < item.results.length; i++) {
                item.score += item.results[i].score;
            }

            item.save(); // TODO....
        });
        callback(null, j);
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
    generateRankList: generateRankList,
    timestampToString:timestampToString,
    timestampToTimeString:timestampToTimeString
};
