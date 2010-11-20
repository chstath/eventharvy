/* Construct an iCalendar with an event object.
   @param  event  (object) the event details
   @return  (string) the iCalendar definition */
var makeICalendar = exports.makeICalendar = function (event) {
	var limit75 = function(text) {
		var out = '';
		while (text.length > 75) {
			out += text.substr(0, 75) + '\n';
			text = ' ' + text.substr(75);
		}
		out += text;
		return out;
	};
	return 'BEGIN:VCALENDAR\n' +
		'VERSION:2.0\n' +
		'PRODID:jquery.icalendar\n' +
		'METHOD:PUBLISH\n' +
		'BEGIN:VEVENT\n' +
		'UID:' + new Date().getTime() + '@' + 'eventharvy' + '\n' +
		'DTSTAMP:' + formatDateTime(new Date()) + '\n' +
		(event.url ? limit75('URL:' + event.url) + '\n' : '') +
		(event.contact ? limit75('MAILTO:' + event.contact) + '\n' : '') +
		limit75('TITLE:' + event.title) + '\n' +
		'DTSTART:' + formatDateTime(event.start) + '\n' +
		'DTEND:' + formatDateTime(event.end) + '\n' +
		(event.summary ? limit75('SUMMARY:' + event.summary) + '\n' : '') +
		(event.description ? limit75('DESCRIPTION:' + event.description) + '\n' : '') +
		(event.location ? limit75('LOCATION:' + event.location) + '\n' : '') +
		(event.recurrence ? makeRecurrence(event.recurrence) + '\n' : '') +
		'END:VEVENT\n' +
		'END:VCALENDAR';
};

/* Format a date/time for iCalendar: yyyymmddThhmmss[Z].
   @param  dateTime  (Date) the date/time to format
   @param  local     (boolean) true if this should be a local date/time
   @return  (string) the formatted date/time */
var formatDateTime = function (dateTime, local) {
	return (!dateTime ? '' : (local ?
		'' + dateTime.getFullYear() + ensureTwo(dateTime.getMonth() + 1) +
		ensureTwo(dateTime.getDate()) + 'T' + ensureTwo(dateTime.getHours()) +
		ensureTwo(dateTime.getMinutes()) + ensureTwo(dateTime.getSeconds()) :
		'' + dateTime.getUTCFullYear() + ensureTwo(dateTime.getUTCMonth() + 1) +
		ensureTwo(dateTime.getUTCDate()) + 'T' + ensureTwo(dateTime.getUTCHours()) +
		ensureTwo(dateTime.getUTCMinutes()) + ensureTwo(dateTime.getUTCSeconds()) + 'Z'));
};

/* Ensure a string has at least two digits.
   @param  value  (number) the number to convert
   @return  (string) the string equivalent */
var ensureTwo = function(value) {
	return (value < 10 ? '0' : '') + value;
};

/* Construct an iCalendar recurrence definition.                                         ;
    @param  recur  (object) the recurrence details
    @return  (string) the iCalendar definition */
var makeRecurrence = function (recur) {
 	if (!recur) {
 	return '';
 	}
 	var def = '';
 	if (recur.dates) {
 		def = 'RDATE;VALUE=DATE:';
 		if (!isArray(recur.dates)) {
 			recur.dates = [recur.dates];
 		}
 		for (var i = 0; i < recur.dates.length; i++) {
 			def += (i > 0 ? ',' : '') + formatDate(recur.dates[i]);
 		}
 	}
 	else if (recur.times) {
 		def = 'RDATE;VALUE=DATE-TIME:';
 		if (!isArray(recur.times)) {
 			recur.times = [recur.times];
 		}
 		for (var i = 0; i < recur.times.length; i++) {
 			def += (i > 0 ? ',' : '') + formatDateTime(recur.times[i]);
 		}
 	}
 	else if (recur.periods) {
 		def = 'RDATE;VALUE=PERIOD:';
 		if (!isArray(recur.periods[0])) {
 			recur.periods = [recur.periods];
 		}
 		for (var i = 0; i < recur.periods.length; i++) {
 			def += (i > 0 ? ',' : '') + formatDateTime(recur.periods[i][0]) +
 				'/' + (recur.periods[i][1].constructor != Date ? recur.periods[i][1] :
 				formatDateTime(recur.periods[i][1]));
 		}
 	}
 	else {
 		def = 'RRULE:FREQ=' + (recur.freq || 'daily').toUpperCase() +
 			(recur.interval ? ';INTERVAL=' + recur.interval : '') +
 			(recur.until ? ';UNTIL=' + formatDateTime(recur.until) :
 			(recur.count ? ';COUNT=' + recur.count : '')) +
 			(recur.weekStart != null ? ';WKST=' +
 			['SU', 'MO', 'TU', 'WE', 'TH', 'FR', 'SA'][recur.weekStart] : '');
 		if (recur.by) {
 			if (!isArray(recur.by)) {
 				recur.by = [recur.by];
 			}
 			for (var i = 0; i < recur.by.length; i++) {
 				if (!isArray(recur.by[i].values)) {
 					recur.by[i].values = [recur.by[i].values];
 				}
 				def += ';BY' + recur.by[i].type.toUpperCase() + '=' +
 					recur.by[i].values.join(',');
 			}
 		}
 	}
 	return def;
 };

/* Determine whether an object is an array.
   @param  a  (object) the object to test
   @return  (boolean) true if it is an array, or false if not */
var isArray = function (a) {
	return (a && a.constructor == Array);
};

/* Format a date for iCalendar: yyyymmdd.
   @param  date   (Date) the date to format
   @return  (string) the formatted date */
var formatDate = function (date, local) {
	return (!date ? '' : '' + date.getFullYear() +
		ensureTwo(date.getMonth() + 1) + ensureTwo(date.getDate()));
};

