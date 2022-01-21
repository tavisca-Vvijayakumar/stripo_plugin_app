import { HTTP_SUCCESS_CODE, HTTP_READY_STATE, CONTENT_TYPE } from './constant.js';
import { usercontext } from './usercontext.js';

const loader = document.querySelector('#overlay');

var EMAILUtility = {

    createNameSpace: function (namespace) {
        //get the namespace string and split it
        var namespaceArr = namespace.split('.');
        var parent = EMAIL;

        // excluding the parent
        if (namespaceArr[0] === 'EMAIL') {
            namespaceArr = namespaceArr.slice(1);
        }

        // loop through the array and create a nested namespace 
        for (var index = 0; index < namespaceArr.length; index++) {
            var partname = namespaceArr[index];
            // check if the current parent already has the namespace declared
            // if it isn't, then create it
            if (typeof parent[partname] === undefined || typeof parent[partname] === "undefined") {
                parent[partname] = {};
            }
            // get a reference to the deepest element in the hierarchy so far
            parent = parent[partname];
        }
        //  empty namespaces created and can be used.
        return parent;
    },

    createXMLHttpRequest: function (method, url, data, callback) {
        var req = new XMLHttpRequest();
        req.onreadystatechange = function () {
            if (req.readyState === HTTP_READY_STATE && req.status === HTTP_SUCCESS_CODE) {
                loader.style.opacity = 0;
                setTimeout(function () {
                    loader.style.display = "none";
                }, 1200);
                callback(req.responseText);
            } else if (req.readyState === HTTP_READY_STATE && req.status !== HTTP_SUCCESS_CODE) {
                console.error('Can not complete request. Please check you entered a valid PLUGIN_ID and SECRET_KEY values');
            }
        };
        req.open(method, url, true);
        if (method !== 'GET') {
            req.setRequestHeader('content-type', 'application/json');
        }
        req.send(data);
    },

    getConfiguration: async function (url) {
        let response = await fetch(url);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        return response.json();
    },

    createFetchRequest: async function name(entry_url, http_headers, http_method, http_data = undefined) {

        // loader.style.opacity = 1;
        // loader.style.display = "block";
        // setTimeout(function () {
        //     loader.style.display = "none";
        // }, 800);

        var options = null;

        if (http_data === undefined) {
            options = {
                method: http_method,
                headers: http_headers
            }
        }
        else {
            options = {
                method: http_method,
                headers: http_headers,
                body: JSON.stringify(http_data)
            }
        }

        let response = await fetch(entry_url, options);

        if (!response.ok) {
            loader.style.display = "none";
            throw new Error(`HTTP error! status: ${response.status}`)
        }

        if (http_method === "GET") {
            return response.json();
        }

        return HTTP_SUCCESS_CODE;
    },

    getContentStackRequestHeader: function () {
        var header = {
            'api_key': usercontext.apiKey,
            'authtoken': usercontext.authToken,
            'Content-Type': CONTENT_TYPE,
        };

        return header;
    },

    showSuccessErrorMessage: function (message, backgroundColor) {
        var fade = document.getElementById('messageBox');
        var opacity = 0;
        var intervalID = setInterval(function () {
            if (opacity < 1) {
                opacity = opacity + 0.1
                fade.style.opacity = opacity;
                fade.style.backgroundColor = backgroundColor;
                fade.innerHTML = message;
                fade.style.display = 'block';
            } else {
                clearInterval(intervalID);
                setTimeout(function () {
                    document.getElementById("messageBox").style.display = 'none';
                }, 1000);
            }
        }, 200);
    }
}


var MyObj = 
    [{
    "category": "Flight detail",
    "entries": [
        {
            "label": "Flight Name",
            "value": "{{FlightName}}",
        },
        {
            "label": "Flight Number",
            "value": "{{FlightNumber}}"
        },
        {
            "label": "Depart",
            "value": "{{Departat}}"
        },
        {
            "label": "Arrive",
            "value": "{{Arriveat}}"
        },

        {
            "label": "Airport/Terminal",
            "value": "{{Airport/Terminal}}"
        },
    ]
},
{
    "category": "Hotel detail",
    "entries": [
        {
            "label": "Hotel Name",
            "value": "air india",
        },
        {
            "label": "Hotel Address",
            "value": "EK 345"
        },
        {
            "label": "Landmark",
            "value": "10 0ct 21/10:30"
        }
    ]
}]

export { EMAILUtility ,MyObj}

