var rss = require('./node-rss/node-rss');
var sources = [
//    {
//        name: 'OpenCoffee',
//        port: 80,
//        host: 'www.google.com',
//        method: 'GET',
//        path: '/calendar/feeds/g66phdocfd8cmc0bssii0dfk6g%40group.calendar.google.com/public/full?alt=json'
//    },
//    {
//        name: 'Bike Events',
//        port: 80,
//        host: 'www.google.com',
//        method: 'GET',
//        path: '/calendar/feeds/f6hvf5f7nuqh5spg4ntta04dqg@group.calendar.google.com/public/full?alt=json'
//    },
//    {
//        name: 'Olympiakos',
//        port: 80,
//        host: 'www.google.com',
//        method: 'GET',
//        path: '/calendar/feeds/gree_6449_%4flympiakos#sports@group.v.calendar.google.com/public/full?alt=json'
//    },
     {
        name: 'Goethe',
        port: 80,
        host: 'http://rss.goethe.de',
        type: 'rss',
        method: 'GET',
        path: '/?lang=el&land=gr&ins=ath&typ=v'
    },
 
];

// The router for the api requests.
var router = exports.router = function (app) {
	// Request for bootstrapping actions.
	app.get('/fetch', function (req, res, next) {
        pollSources(res);
    });
};

var pollSources = exports.pollSources = function(res) {
    console.log("Polling sources...");
    var sourceIndex = 0;
    pollSingleSource(sourceIndex);
}

var pollSingleSource = function (sourceIndex) {
    if (sourceIndex >= sources.length)
        return;
    console.log("Polling source " + sourceIndex + " " + sources[sourceIndex].name);
    if (sources[sourceIndex].type == 'rss') {
        rss.parseURL(sources[sourceIndex].host + sources[sourceIndex].path, function(articles) {
            console.log(articles.length);
            for(i=0; i<articles.length; i++) {
                console.log("Article: "+i+", "+
                articles[i].title+"\n"+
                articles[i].link+"\n"+
                articles[i].description+"\n"+
                articles[i].content
                );
            }
        });    
    }
    else {
        var http = require('http');
        var client = http.createClient(80, sources[sourceIndex].host);
        var request = client.request('GET', sources[sourceIndex].path,
          {'host': sources[sourceIndex].host});
        request.end();
        request.on('response', function (response) {
          console.log('STATUS: ' + response.statusCode);
          console.log('HEADERS: ' + JSON.stringify(response.headers));
          response.setEncoding('utf8');
          response.on('data', function (chunk) {
          console.log('BODY: ' + chunk);
          
    //        if (res)
    //            sendResult(res);
          });
          sourceIndex++;
          pollSingleSource(sourceIndex)
        });
    }
}

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

