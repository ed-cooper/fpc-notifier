window.onload = function () {
    // Get container elements
    var containers = [
        document.getElementById('currentCurator'),
        document.getElementById('nextCurator'),
        document.getElementById('followingCurator')
    ];
    var successive = document.getElementById('successiveCurators');
    var alertClose = document.getElementById('alert-close');
    
    // Get file path, add time-stamp to prevent caching
    var filePath = 'https://scratchtools.tk/fpc/api/v2/json/?u=' + new Date().getTime();
    
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
            try {
                downloaded(JSON.parse(xmlHttp.responseText));
            } catch(e) {
                if (e instanceof SyntaxError) {
                    error();
                    console.log('Bad JSON syntax');
                } else {
                    throw e;
                }
            }
        }
    };
    
    xmlHttp.open('GET', filePath, true);
    xmlHttp.timeout = 5000;

    // Send http request
    xmlHttp.send(null);
    
    // Interpret downloaded data
    function downloaded(result) {
        // Check response was valid
        if (result['response']['code'] === 0) {
            
            // Load current, following and successive curators
            for (var i = 0; i < 3; i++) {
                
                // Display week range
                
                var date = document.createElement('span');

                date.className = 'date';
                date.innerText = 'Start - End';

                containers[i].parentElement.insertBefore(
                        date, 
                        containers[i].parentElement.childNodes[0]
                );
                
                // Load curator
                
                // Check curator is known
                
                if (result['curators'][i]['user']) {

                    // Check if FPC is confirmed
                    
                    if (result['curators'][i]['confirmed']) {
                        //FPC was confirmed

                        containers[i].innerHTML =
                                '<span title="@' +
                                result['curators'][i]['user'] +
                                '">@' +
                                result['curators'][i]['user'] + 
                                '</span>';
                        
                        containers[i].parentElement.href = result['curators'][i]['suggest_url'];
                        containers[i].className = '';
                    } else {
                        //FPC not confirmed

                        containers[i].innerHTML =
                                '<span title="This FPC has not yet been confirmed"">@' + 
                                result['curators'][i]['user'] + 
                                ' (TBC)</span>';
                        containers[i].className = 'gray';
                    }
                } else {
                    containers[i].title = 'The FPC during this period is currently unknown';
                    containers[i].innerText = 'Unknown';
                }
            }

            // Check if there are successive curators
            
            if (result['curators'].length > 2) {
                // There are successive curators

                // For each successive curator
                for (var i = 3; i < result['curators'].length; i++) {
                    // Add date
                    successive.innerHTML += '<span class="date">Start - End</span>';

                    // Check if curator has been suggested
                    if (result['curators'][i]['user']) {
                        // Curator has been suggested

                        // Check if curator is confirmed
                        
                        if (result['curators'][i]['confirmed']) {
                            // Curator is confirmed
                            
                            successive.innerHTML +=
                                    '<a href="' +
                                    result['curators'][i]['suggest_url'] + 
                                    '" target="_blank" title="@' +
                                    result['curators'][i]['user'] + '">@' +
                                    result['curators'][i]['user'] + '</a>';
                        } else {
                            // Curator isn't confirmed, so display TBC label
                            // and add no link
                            
                            successive.innerHTML +=
                                    '<span class="gray" title="This FPC has not yet been confirmed">@' +
                                    result['curators'][i]['user'] +
                                    ' (TBC)</span>';
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

            // Show notice
            if (result['message']) {
                document.getElementById('alert-text').innerHTML = result['message'];
                document.getElementById('alert').className = 'box';
            }
        } else {
            error();
            console.log(
                    'Error: code ' + 
                    result['response']['code'] + 
                    ' - ' + 
                    result['response']['description']
            );
        }
    }

    // Display error messages in every container
    function error() {
        // TODO: on error, hide containers and show separate div
        containers[0].innerText = 'Error';
        containers[1].innerText = 'Error';
        containers[2].innerText = 'Error';
    }

    // Loads the curator name into the specified container
    function load(user, element) {
        // Check if curator has been suggested
        
        if (user !== '') {
            // Curator has been suggested for this period
            
            var date = document.createElement('span');

            date.className = 'date';
            date.innerText = 'Start - End';

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
        }
    }

    // Makes a date human readable
    // Uses browser language to match users prefrences
    function formatDate(d) {
        return d.toLocaleString(navigator.language, {
            day: "numeric",
            month: "short"
        });
    }
    
    // Add close button click event
    alertClose.onclick = function() {
        document.getElementById('alert').className = 'hidden';
    };
};