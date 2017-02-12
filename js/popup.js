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
        // Check response was successful
        if (result['response']['code'] === 0) {
            
            // Load current, next and following curators
            for (var i = 0; i < 3; i++) {
                
                // Get container parent
                var parent = containers[i].parentElement;
                
                // Display week range
                
                var date = document.createElement('span');

                date.className = 'date';
                date.innerHTML = 
                        formatDate(new Date(result['curators'][i]['start'])) +
                        ' - ' +
                        formatDate(new Date(result['curators'][i]['end']));

                parent.insertBefore(
                        date, 
                        parent.childNodes[0]
                );
                
                // Load curator
                
                // Check curator is known
                
                if (result['curators'][i]['user']) {
                    // Curator is known

                    // Check if FPC is confirmed
                    
                    if (result['curators'][i]['confirmed']) {
                        // FPC was confirmed
                        
                        // Check if FPC has any remaining slots
                        
                        if (!result['curators'][i]['full']) {
                            // FPC has remaining slots
                            
                            containers[i].innerHTML = '@' + result['curators'][i]['user'];
                            containers[i].className = '';

                            parent.className = 'box shadow-box hover';
                            parent.title = '@' + result['curators'][i]['user'];
                            parent.href = result['curators'][i]['suggest_url'];
                        } else {
                            // FPC is full
                            
                            containers[i].innerHTML = '@' + result['curators'][i]['user'] + ' (FULL)';
                            containers[i].className = 'gray';

                            parent.title = 'This FPC is full';
                        }
                    } else {
                        // FPC not confirmed

                        containers[i].innerHTML = '@' + result['curators'][i]['user'] + ' (TBC)';
                        containers[i].className = 'gray';
                        
                        parent.title = 'This FPC has not yet been confirmed';
                    }
                } else {
                    // Curator not known
                    
                    containers[i].innerHTML = 'Unknown';
                    
                    parent.title = 'The FPC during this period is currently unknown';
                }
            }

            // Check if there are successive curators
            
            if (result['curators'].length > 3) {
                // There are successive curators

                // For each successive curator
                for (var i = 3; i < result['curators'].length; i++) {
                    // Add date
                    successive.innerHTML +=
                            '<span class="date">' +
                            formatDate(new Date(result['curators'][i]['start'])) +
                            ' - ' +
                            formatDate(new Date(result['curators'][i]['end'])) +
                            '</span>';

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
                document.getElementById('successiveContainer').className = 'box shadow-box hover';
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
        containers[0].innerHTML = 'Error';
        containers[1].innerHTML = 'Error';
        containers[2].innerHTML = 'Error';
    }

    // Makes a date human readable
    // Uses browser language to match users prefrences
    function formatDate(d) {
        return d.toLocaleString(navigator.language, {
            day: 'numeric',
            month: 'short'
        });
    }
    
    // Add close button click event
    alertClose.onclick = function() {
        document.getElementById('alert').className = 'hidden';
    };
};