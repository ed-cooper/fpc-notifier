window.onload = function () {
	// Get container elements
    var current = document.getElementById('currentCurator');
    var next = document.getElementById('nextCurator');
    var following = document.getElementById('followingCurator');
    var successive = document.getElementById('successiveCurators');
	
	// Get file path, add time-stamp to prevent caching
	var filePath = "http://scratchtools.tk/fpc/data/data.json?u=" + new Date().getTime();
	
	// Get date info
	var weekStart;
    var monthNames = ['Jan',
                      'Feb',
                      'Mar',
                      'Apr',
                      'May',
                      'Jun',
                      'Jul',
                      'Aug',
                      'Sep',
                      'Oct',
                      'Nov',
                      'Dec'];
	
	// Init http request
	var xmlHttp = new XMLHttpRequest();
	xmlHttp.ontimeout = function() {
		console.log('Timeout');
		error();
	}
	xmlHttp.onerror = function() {
		console.log('Error');
		error();
	}
	xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState == 4 && xmlHttp.status == 200) {
            downloaded(JSON.parse(xmlHttp.responseText));
		}
    }
    xmlHttp.open("GET", filePath, true);
	xmlHttp.timeout = 10000;
	
	// Send http request
    xmlHttp.send(null);
	
	// Interpret downloaded data
	function downloaded(result) {
		// Get start date
		weekStart = new Date(result['date']);
		
		// Load current fpc
		load(result['current'], current, 0);
		if (result['following'].length > 0) {
			// Load next fpc
			load(result['following'][0], next, 1);
			if (result['following'].length > 1) {
				// Load following fpc
				load(result['following'][1], following, 2);
				if (result['following'].length > 2) {
					// Add successive curators
					for (var i = 2; i < result['following'].length; i++) {
						successive.innerHTML += '<span class="date">' + getWeekRange(i + 1) + '</span>';
						if (result['following'][i] !== '') {
							if (result['following'][i][result['following'][i].length - 1] == "?") {
								successive.innerHTML += '<span class="gray" title="This FPC has not yet been confirmed">@' + result['following'][i].substr(0, result['following'][i].length - 1) + ' (TBC)</span>';
							} else {
								successive.innerHTML += '<a href="https://scratch.mit.edu/users/' + result['following'][i] + '/" target="_blank" title="@' + result['following'][i] + '">@' + result['following'][i] + '</a>';
							}
						} else {
							successive.innerHTML += '<span class="gray" title="The FPC during this period is currently unknown">Unknown</span>';
						}
					}
					// Show successive curators container
					document.getElementById('successiveContainer').className = "container";
				}
			} else {
				unknown(following, 2);
			}
		} else {
			unknown(next, 1);
			unknown(following, 2);
		}
	}

	// Display error messages
	function error() {
		current.innerText = 'Error';
		next.innerText = 'Error';
		following.innerText = 'Error';
	}
	
	// Loads the curator name into the specified element
	function load(data, element, index) {
		if (data !== '') {
			var date = document.createElement('span');
			date.className = 'date';
			date.innerText = getWeekRange(index);
			element.parentElement.insertBefore(date, element.parentElement.childNodes[0]);
			element.innerHTML = '<span title="@' + data +'">@' + data + '</span>';
			element.parentElement.parentElement.href = "https://scratch.mit.edu/users/" + data + "/";
			element.className = '';
		} else {
			unknown(element, index);
		}
	}
	
	// Marks the fpc for the specified element as unknown
	function unknown(element, index) {
		var date = document.createElement('span');
		date.className = 'date';
		date.innerText = getWeekRange(index);
		element.parentElement.insertBefore(date, element.parentElement.childNodes[0]);
		element.title = "The FPC during this period is currently unknown";
		element.innerText = 'Unknown';
	}
	
	// Gets a human readable range representing the specified week (0 = this week)
	function getWeekRange(week) {
        return formatDate(offsetDate(weekStart, week * 7)) + ' - ' + formatDate(offsetDate(weekStart, (week + 1) * 7));
    }

	// Adds the specified amount of days to a specified date
    function offsetDate(d, offset) {
        var newDate = new Date();
		newDate.setMonth(d.getMonth());
        newDate.setDate(d.getDate() + offset);
        return newDate;
    }

	// Makes a date human readable
    function formatDate(d) {
        return d.getDate() + ' ' + monthNames[d.getMonth()];
    }
};