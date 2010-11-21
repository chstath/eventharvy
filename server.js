var express = require('express'),
	api = require('./api'),
	port = parseInt(process.env.PORT) || 80,
    connect = require('connect');

api.pollSources();
setInterval(api.pollSources, 120000);

var app = module.exports = express.createServer();

// Configuration

app.configure(function(){
    app.set('views', __dirname + '/views');
    app.use(connect.bodyDecoder());
    app.use(connect.methodOverride());
    app.use(connect.compiler({ src: __dirname + '/public', enable: ['less'] }));
    app.use(app.router);
    app.use(connect.staticProvider(__dirname + '/public'));
});

app.configure('development', function(){
    app.use(connect.errorHandler({ dumpExceptions: true, showStack: true }));
});

app.configure('production', function(){
   app.use(connect.errorHandler());
});

// Routes

app.get('/', function(req, res){
    res.render('index.jade', {
        locals: {
            title: 'eventharvy'
        }
    });
});

app.get('/fetch', function (req, res) {
    res.render('fetch.jade', {
        locals: {
            title: 'Events',
            events: api.events
        }
    });
});

// Only listen on $ node app.js

if (!module.parent) app.listen(port);








console.log('Eventharvy server running at http://127.0.0.1:' + port);

process.addListener('uncaughtException', function (err) {
	console.log(err.stack);
});

