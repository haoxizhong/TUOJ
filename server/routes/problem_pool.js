var express = require("express");
var router = express.Router();

var Problem = require("../models/problem.js");

router.get("/", function(req, res, next) {
    Problem.find(function(err, problems) {
        res.render("problem_pool", {
            problems: problems,
            user: req.session.user,
			call: req.session.call,
            is_admin: req.session.is_admin
        });
    });
});


router.get("/:id(\\d+)", function(req, res, next) {
    var id = parseInt(req.params.id);
    Problem.findOne({_id: id}, function (err, p) {
        if (err) return next(err);
        if (!p) return next(); // 404

        try {
            var description = p.getDescriptionHTML();
        } catch(err) {
            var description = JSON.stringify(err);
        }
        res.render("preview_problem", {
            "user": req.session.user,
			call: req.session.call,
            "is_admin": req.session.is_admin,
            "p": p,
            "description": description
        });
    });

});


router.post("/new_problem", function(req, res, next) {
    git_url = req.body.git_url.trim();
    if (git_url.length < 1) {
        return next(new Error("Please enter the address of Git."));
    }

    Problem.new(git_url, function (err, p) {
        if (err) return next(err);
        p.update(function (err, p) {
            //console.log(p);
        });
        return res.redirect("/problem_pool/" + p._id);
    });
});

router.post("/:id(\\d+)/update", function(req, res, next) {
    var id = parseInt(req.params.id);
    var git_url = req.body.git_url.trim();
    Problem.findOne({_id: id}, function (err, p) {
        if (err) return next(err);
        if (!p) return next(); // 404

        p.git_url = git_url;
        p.update(function (err, p) {
           console.log(p);
        });
    });
    res.redirect("/problem_pool/" + id);
});

module.exports = router;
