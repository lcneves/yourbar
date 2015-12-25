var SESSION_KEY = 'xr"~S���&�(b�oY1~��ۋ�!~�߶�Rd���)���_�/=S,�ܔ�eO���f�W���㒐A��ro�����0s��p����� rW���J�B��!�[!',
    BCRIPT_COST = 8,
    dbConfig = require('./db-config.js'),
    objectID=require('mongodb').ObjectID,
    bcrypt = require('bcrypt'),
    passport = require('passport'),
    LocalStrategy = require('passport-local').Strategy,
    bodyparser = require('body-parser'),
    session = require('express-session'),
    express = require('express'),
    router = express.Router();

// Router config

router.use(bodyparser.urlencoded({extended: false}));
router.use(session({
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: false,
    },
    secret: SESSION_KEY
}));
router.use(passport.initialize());
router.use(passport.session());

// Passport config

passport.use(new LocalStrategy(
    function(username, password, done) {
        var collection = dbConfig.db.collection('users');
        collection.findOne({ username: username }, function(err, user) {
            if (err) { return done(err); }
            if (!user) {
                return done(null, false, { message: 'Incorrect username.' });
            } else {
                bcrypt.compare(password, user.password, function(err, res) {
                    if (err) { throw err; }
                    if (res) {
                        return done(null, user);
                    } else {
                        return done(null, false, { message: 'Incorrect password.' });
                    }
                });
            }
        });
    }
));

passport.serializeUser(function(user, done) {
    done(null, user._id);
});

passport.deserializeUser(function(id, done) {
    var collection = dbConfig.db.collection('users');
    collection.findOne({_id: objectID(id)}, function(err, user) {
        if (err) { throw err; }
        if (user) {
            var userInfo = {
                _id: user._id,
                username: user.username,
                realname: user.realname
            }
            done(err, userInfo);
        }
    });
});

// Routing begins here

router.post('/register', function (req, res) {
    var user = req.body.username;
    var pass = req.body.password;
    var passRepeat = req.body.passwordRepeat;
    var name = req.body.realname;
    if (user == "") {
        res.send("Username cannot be empty");
        return;
    }
    if (pass == "") {
        res.send("Password cannot be empty");
        return;
    }
    if (passRepeat == "") {
        res.send("Please repeat the password");
        return;
    }
    if (name == "") {
        res.send("Please enter your name");
        return;
    }
    if (pass != passRepeat) {
        res.send("Passwords do not match");
        return;
    }
    var collection = dbConfig.db.collection('users');
    collection.findOne(
        {username: user},
        function(err, document) {
            if (err) { throw err; }
            if (document) {
                res.send("User " + user + " already exists");
            } else {
                bcrypt.hash(pass, BCRIPT_COST, function(err, hash) {
                    if (err) {
                        throw err;
                    }
                    var userObject = {username: user, password: hash, realname: name};
                    collection.insert(userObject, function(err, data){
                        if (err) {
                            res.send("Server error!");
                            throw err;
                        }
                        res.send(true);
                    });
                });
            }
        }
    );
});

router.post('/login', function (req, res) {
    passport.authenticate('local', function (err, user, info) {
        if (err) {
            res.status(500).send(err);
            console.log(err);
            return err;
        }
        if (user) {
            req.logIn(user, function() {
                res.status(200).send(user);
            });
        }
        else if (info) {
            res.send(info);
        }
    })(req, res);
});

router.post('/check', function (req, res) {
    if (req.user) {
        res.send(req.user.realname);
    } else {
        res.send(false);
    }
});

router.post('/logout', function (req, res) {
    req.logout();
    res.send('Logout');
});

module.exports = router;