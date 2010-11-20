// The router for the api requests.
var router = exports.router = function (app) {
	// Request for bootstrapping actions.
	app.get('/init', function (req, res, next) {
        var http = require('http');
        var google = http.createClient(80, 'www.google.com');
        var request = google.request('GET', '/',
          {'host': 'http://www.google.com/calendar/feeds/g66phdocfd8cmc0bssii0dfk6g%40group.calendar.google.com/public/full?alt=json'});
        request.end();
        request.on('response', function (response) {
          console.log('STATUS: ' + response.statusCode);
          console.log('HEADERS: ' + JSON.stringify(response.headers));
          response.setEncoding('utf8');
          response.on('data', function (chunk) {
            console.log('BODY: ' + chunk);
          });
        });

    });

};

