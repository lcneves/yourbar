var PORT = process.env.PORT || 8080,
    dbConfig = require('./db-config.js'),
    session = require('./session.js'),
    express = require('express'),
    app = express();

app.use('/session', session);
app.use(express.static('public'));

// Connect to DB and, if successful, start listening to connections
dbConfig.init(function (error) {
    if (error) { throw error; }
    console.log('Will start listening on port ' + PORT);
    app.listen(PORT);
});
