var path = require("path");

config = {
    BASE_DIR: __dirname,
    DATA_DIR: path.join(__dirname, "data"),
    PROB_DIR: path.join(__dirname, "data", "problems"),
    USER_SOL_DIR: path.join(__dirname, "data", "user_solutions"),
    TMP_DIR: path.join(__dirname, "data", "tmp"),

    EXPRESS_SESSION: {
        secret:'grejpomvit98c39cmjrfasdolc',
        cookie:{maxAge:1000*60*10},
        resave: true,
        saveUninitialized: false
    }

};

module.exports = config;