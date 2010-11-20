var htmlparser = require("htmlparser");
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
        host: 'rss.goethe.de',
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
    var rssHandler = new htmlparser.RssHandler(function (error, dom) {
        if (error) {
            console.log(error);
            throw err;
        }
        else {
            for (var i=0; i<dom.items.length; i++) {
                var item = dom.items[i];
                var title = item.title.substring(8, item.title.length-2);
                var link = item.link.substring(8, item.link.length-2);;
                var description = item.description.substring(8, item.description.length-2);;
                var pubDate = item.pubDate;
                console.log(title);
                console.log(link);
                console.log(description);
                console.log(pubDate);
            }
        }
    });
    var rss = new htmlparser.Parser(rssHandler);
    var http = require('http');
    var client = http.createClient(80, sources[sourceIndex].host);
    var request = client.request('GET', sources[sourceIndex].path,
      {'host': sources[sourceIndex].host});
    request.end();
    var rssData = '';
    request.on('response', function (response) {
        console.log('STATUS: ' + response.statusCode);
        console.log('HEADERS: ' + JSON.stringify(response.headers));
        response.setEncoding('utf8');
        response.on('data', function (chunk) {
 //           console.log('BODY: ' + chunk);
            rssData += chunk;
      
//        if (res)
//            sendResult(res);
        });
        response.on('end', function () {
            rss.parseComplete(rssData);
            sourceIndex++;
            pollSingleSource(sourceIndex)
        });
    });
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

