window.onload = function () {
    // Get container elements
    var current = document.getElementById('currentCurator');
    var next = document.getElementById('nextCurator');
    var following = document.getElementById('followingCurator');
    var successive = document.getElementById('successiveCurators');
	
    // Get file path, add time-stamp to prevent caching
    var filePath = 'http://scratchtools.tk/fpc/api/v1/json/?u=' + new Date().getTime();

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
    };
    
    xmlHttp.onerror = function() {
        console.log('Error');
        error();
    };
    
    xmlHttp.onreadystatechange = function() {
        if (xmlHttp.readyState === 4 && xmlHttp.status === 200) {
            downloaded(JSON.parse(xmlHttp.responseText));
        }
    };
    
    xmlHttp.open('GET', filePath, true);
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
                    // There are successive curators
                    
                    // For each successive curator
                    for (var i = 2; i < result['following'].length; i++) {
                        // Add date
                        successive.innerHTML += '<span class="date">' + getWeekRange(i + 1) + '</span>';
                        
                        // Check if curator has been suggested
                        if (result['following'][i] !== '') {
                            // Curator has been suggested
                            
                            // Check if last character is a '?'
                            // Thus indicating if the FPC is confirmed
                            if (result['following'][i][result['following'][i].length - 1] === '?') {
                                // Curator is not yet confirmed
                                
                                // Add curator with TBC warning and no link
                                successive.innerHTML +=
                                        '<span class="gray" title="This FPC has not yet been confirmed">@' +
                                        result['following'][i].substr(0, result['following'][i].length - 1) +
                                        ' (TBC)</span>';
                            } else {
                                // Curator is confirmed
                                
                                // Add curator with link
                                successive.innerHTML +=
                                        '<a href="https://scratch.mit.edu/users/' + 
                                        result['following'][i] + '/" target="_blank" title="@' +
                                        result['following'][i] + '">@' +
                                        result['following'][i] + '</a>';
                            }
                        } else {
                            // No known FPC for this period
                            
                            // Display unknown message
                            successive.innerHTML +=
                                    '<span class="gray" title="The FPC during this period is currently unknown">Unknown</span>';
                        }
                    }
                    
                    // Show container for successive curators
                    document.getElementById('successiveContainer').className = 'box hover-box';
                }
            } else {
                // Following FPC not known
                
                unknown(following, 2);
            }
        } else {
            // Next and following FPCs are unknown
            // (Ideally this case shouldn't happen)
            
            unknown(next, 1);
            unknown(following, 2);
        }

        // Show notice
        if (result['message']) {
            document.getElementById('alert-text').innerHTML = result['message'];
            document.getElementById('alert').className = 'box';
        }
    }

    // Display error messages in every container
    function error() {
        current.innerText = 'Error';
        next.innerText = 'Error';
        following.innerText = 'Error';
    }

    // Loads the curator name into the specified container
    function load(user, element, index) {
        // Check if curator has been suggested
        
        if (user !== '') {
            // Curator has been suggested for this period
            
            var date = document.createElement('span');

            date.className = 'date';
            date.innerText = getWeekRange(index);

            element.parentElement.insertBefore(date, element.parentElement.childNodes[0]);

            if (user.endsWith('?')) {
                //FPC not confirmed
                
                element.innerHTML =
                        '<span title="This FPC has not yet been confirmed"">@' + 
                        user.substring(0, user.length - 1) + 
                        ' (TBC)</span>';
                element.className = 'gray';
            } else {
                //FPC was confirmed
                
                element.innerHTML = '<span title="@' + user +'">@' + user + '</span>';
                element.parentElement.href = 'https://scratch.mit.edu/users/' + user + '/';
                element.className = '';
            }
        } else {
            // Curator is not known for this period
            unknown(element, index);
        }
    }

    // Marks the fpc for the specified element as unknown
    function unknown(element, index) {
        var date = document.createElement('span');
        
        date.className = 'date';
        date.innerText = getWeekRange(index);
        
        element.parentElement.insertBefore(date, element.parentElement.childNodes[0]);
        
        element.title = 'The FPC during this period is currently unknown';
        element.innerText = 'Unknown';
    }

    // Gets a human readable range representing the specified week (0 = this week)
    function getWeekRange(week) {
        return formatDate(offsetDate(weekStart, week * 7)) +
                ' - ' +
                formatDate(offsetDate(weekStart, (week + 1) * 7));
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