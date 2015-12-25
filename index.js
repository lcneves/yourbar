var PORT = process.env.PORT || 8080,
    dbConfig = require('./db-config.js'),
    request = require('request'),
    session = require('./session.js'),
    express = require('express'),
    app = express();

app.use('/session', session);
app.use(express.static('public'));

// yelp API configuration
var yelp = {
    consumerKey: 'yePlVZ80yRevhVbT9sv6Eg',
    consumerSecret: 'tXp5dmoFpvay8zO09pvGsRdy3X4',
    token: 'rUzRX1sbXGvBj3wZdwtVT9ptwEkK-ZBq',
    tokenSecret: 'kr_8UVWBdd44mOs-WEG6G2d4Al4'
};

// Route: respond to yelp queries



// Connect to DB and, if successful, start listening to connections
dbConfig.init(function (error) {
    if (error) { throw error; }
    console.log('Start listening on port ' + PORT);
    app.listen(PORT);
});
