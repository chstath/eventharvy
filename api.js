// The router for the api requests.
var router = exports.router = function (app) {
	// Request for bootstrapping actions.
	app.get('/fetch', function (req, res, next) {
        var http = require('http');
        var google = http.createClient(80, 'www.google.com');
        var request = google.request('GET', '/calendar/feeds/g66phdocfd8cmc0bssii0dfk6g%40group.calendar.google.com/public/full?alt=json',
          {'host': 'www.google.com'});
        request.end();
        request.on('response', function (response) {
          console.log('STATUS: ' + response.statusCode);
          console.log('HEADERS: ' + JSON.stringify(response.headers));
          response.setEncoding('utf8');
          response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
            sendResult(res);
          });
        });

    });

};

// Helper function to send the result.
var sendResult = function (res, data, extraHeaders) {
    var headers = {'Content-Type': 'application/json'};
    if (extraHeaders)
        for (var h in extraHeaders)
            headers[h] = extraHeaders[h];
	res.writeHead(200, headers);
	if (data)
		res.end(data);
	else
		res.end();
};

// Helper function to send the result in error cases.
var sendError = function (res, status, data, extraHeaders) {
    var headers = {'Content-Type': 'text/plain'};
    if (extraHeaders)
        for (var h in extraHeaders)
            headers[h] = extraHeaders[h];
	res.writeHead(status, headers);
	if (data)
		res.end(data);
	else
		res.end();
};

