var connect = require('connect'),
	api = require('./api'),
	port = parseInt(process.env.PORT) || 8000;

var server = connect.createServer(
	connect.logger(),
	connect.errorHandler({ dumpExceptions: true, showStack: true })
);
// Serve static resources.
server.use("/",
    connect.conditionalGet(),
    connect.cache(),
    connect.gzip(),
	connect.staticProvider(__dirname + '/public')
);
// Serve the API responses.
server.use("/api",
	connect.bodyDecoder(),
	connect.cookieDecoder(),
	connect.router(api.router)
);
server.listen(port);
console.log('Eventharvy server running at http://127.0.0.1:' + port);

process.addListener('uncaughtException', function (err) {
	console.log(err.stack);
});

api.pollSources();
setInterval(api.pollSources, 30000);

