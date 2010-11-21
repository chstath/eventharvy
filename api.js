var htmlparser = require("htmlparser");
var mongo = require('mongodb');

var sources = [
//    {
//        name: 'OpenCoffee',
//        port: 80,
//        host: 'www.google.com',
//        type: 'ical',
//        method: 'GET',
//        path: '/calendar/feeds/g66phdocfd8cmc0bssii0dfk6g%40group.calendar.google.com/public/full?alt=json'
//    },
//    {
//        name: 'Bike Events',
//        port: 80,
//        host: 'www.google.com',
//        type: 'ical',
//        method: 'GET',
//        path: '/calendar/feeds/f6hvf5f7nuqh5spg4ntta04dqg@group.calendar.google.com/public/full?alt=json'
//    },
//    {
//        name: 'Olympiakos',
//        port: 80,
//        host: 'www.google.com',
//        type: 'ical',
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

// The accumulated events.
var events = exports.events = [];

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
   var db = new mongo.Db('eventharvy', new mongo.Server('flame.mongohq.com', 27084, {}), {});
   db.open(function () {
      db.authenticate('harvy', 'harvy', function (err, authOk) {
         db.collection('events', function (err, collection) {
            if (err) {
               throw err;
            }
   
            pollSingleSource(sourceIndex, db, collection);
         });
      });
   });
}

var pollSingleSource = function (sourceIndex, db, collection) {
    if (sourceIndex >= sources.length) {
         db.close();
        return;
    }
    console.log("Polling source " + sourceIndex + " " + sources[sourceIndex].name);
    var rssHandler = new htmlparser.RssHandler(function (error, dom) {
        if (error) {
            throw error;
        }
        else {
            for (var i=0; i<dom.items.length; i++) {
                var item = dom.items[i];
                var rawTitle = item.title.substring(item.title.length-2)==']]' ? item.title.substring(8, item.title.length-2) : item.title.substring(8).trim();
                var title = rawTitle.substring(0, rawTitle.indexOf(':')).trim();
                var arr = rawTitle.substring(rawTitle.indexOf(':') + 1).split(',');
                var eventDate = arr[0] ? arr[0].trim() : '';
                var eventTime = arr[1] ? arr[1].trim() : '';
                var eventTitle = arr[2] ? arr[2].trim() : '';
                var link = item.link.substring(8, item.link.length-2).trim();
                var description = item.description.substring(item.description.length-2)==']]' ? item.description.substring(8, item.description.length-2).trim() : item.description.substring(8).trim();
                var pubDate = item.pubDate;
                var newItem = {
                    category: title,
                    title: eventTitle,
                    date: eventDate,
                    time: eventTime,
                    description: description,
                    pubDate: pubDate,
                    link: link,
                    src: sources[sourceIndex].host + sources[sourceIndex].path
                };
               // console.log(newItem);

                // Generate event time.
                var dateElems = eventDate.split('/');
                //console.log('dateElems: ' + dateElems);
                var timeElems = eventTime.split('-');
                //console.log('timeElems: ' + timeElems);
                var startTimelems, start;
                startTimeElems = timeElems[0].split(':');
                //console.log('startTimeElem[0]: ' + isNaN(startTimeElems[0]));
                if (isNaN(startTimeElems[0]))
                    start = new Date(dateElems[2], dateElems[1], dateElems[0]);
                else
                    start = new Date(dateElems[2], dateElems[1], dateElems[0], startTimeElems[0], startTimeElems[1]);
                // Generate iCalendar version.
                var event = {};
                event.id = 'event-' + i;
                event.url = link;
                //event.contact = newItem.;
                event.title = newItem.title;
                event.summary = newItem.description;
                event.description = newItem.description;
                //event.location = newItem.;
                //event.recurrence = newItem.;
                event.start = start; //newItem.pubDate;
                event.src = newItem.src;
                //event.end = (end && !isNaN(end)) || '';
                events.push(event);
                result = createIcal(event);
           //     console.log(result);
               collection.find({src: event.src, url: event.url}, {}, function (err, cursor) {
                  cursor.toArray(function (err, docs) {
                     if (docs.length == 0) {
                        collection.insert(event, function (err, docs) {
                           if (err) {
                              throw err;
                           }
                           console.log('Item inserted ...');
                        });
                     }
                  });
               });
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
            rssData += chunk;

        });
        response.on('end', function () {
            rss.parseComplete(rssData);
            sourceIndex++;
            pollSingleSource(sourceIndex, db, collection);
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

var createIcal = function (event) {
    return require("./icalendar").makeICalendar(event);
};

