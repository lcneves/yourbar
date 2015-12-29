var PORT = process.env.PORT || 8080,
    SESSION_KEY = 'xr"~S���&�(b�oY1~��ۋ�!~�߶�Rd���)���_�/=S,�ܔ�eO���f�W���㒐A��ro�����0s��p����� rW���J�B��!�[!',
    dbConfig = require('./db-config.js'),
    Yelp = require('yelp'),
    mySession = require('./session.js'),
    bodyparser = require('body-parser'),
    session = require('express-session'),
    express = require('express'),
    app = express();
    
    // Testing requirements
var util = require('util');

app.use(bodyparser.urlencoded({extended: false}));

app.use(session({
    resave: false,
    saveUninitialized: false,
    cookie: {
        secure: true,
    },
    secret: SESSION_KEY
}));
    
// Route login calls to /session to my session.js.
mySession.init(SESSION_KEY);
app.use('/session', mySession.router);

// Serve static HTML and JS files from the "public" dir.
app.use(express.static('public'));

// yelp API configuration
var yelp = new Yelp({
    consumer_key: 'yePlVZ80yRevhVbT9sv6Eg',
    consumer_secret: 'tXp5dmoFpvay8zO09pvGsRdy3X4',
    token: 'rUzRX1sbXGvBj3wZdwtVT9ptwEkK-ZBq',
    token_secret: 'kr_8UVWBdd44mOs-WEG6G2d4Al4'
});



// Route: respond to yelp queries

app.post('/query', function(req, res) {
    if (req.body.location) {
        var location = req.body.location.trim();
    } else {
        res.send({
            error: true,
            message: 'Please fill in your area'
        });
        return;
    }
    yelp.search({ term: 'bar', location: location }, function(err, data) {
        if (err) {
            res.send({
                error: true,
                message: 'Server error. Service might be unavailable in your area. Sorry!'
            });
            return console.log(err);
        }
        var sendData = {
            bars: []
        };
        var collection = dbConfig.db.collection('bars');
        data.businesses.forEach(function(element, index, array) {
            var thisBar = {
                id: element.id,
                name: element.name,
                url: element.url,
                image_url: element.image_url,
                rating_img_url: element.rating_img_url,
                snippet_text: element.snippet_text,
                review_count: element.review_count,
                going: []
            };
            collection.findOne({bar: element.id}, function(err, result) {
                if (result && result.going) {
                    thisBar.going = result.going;
                }
                sendData.bars.push(thisBar);
                if (sendData.bars.length == data.businesses.length) {
                    res.send({
                        error: false,
                        data: sendData
                    });
                }
            });
        });
    });
});

app.post('/add-going', function (req, res) {
    var barObject = {bar: req.body.bar};
    var optionKey = 'going';
    var userID = req.session.passport.user;
    var pushObject = {};
    pushObject[optionKey] = userID;
    var collection = dbConfig.db.collection('bars');
    collection.update(barObject, {'$push': pushObject}, { upsert: true }, function(err, data) {
        if (err) {
            res.send({
                error: true
            });
            return console.log(err);
        }
        res.end();
    });
});

app.post('/remove-going', function (req, res) {
    var barObject = {bar: req.body.bar};
    var optionKey = 'going';
    var userID = req.session.passport.user;
    var pullObject = {};
    pullObject[optionKey] = userID;
    var collection = dbConfig.db.collection('bars');
    collection.update(barObject, {'$pull': pullObject}, function(err, data) {
        if (err) {
            res.send({
                error: true
            });
            return console.log(err);
        }
        res.end();
    });
});

// Connect to DB and, if successful, start listening to connections
dbConfig.init(function (error) {
    if (error) { throw error; }
    console.log('Start listening on port ' + PORT);
    app.listen(PORT);
});
