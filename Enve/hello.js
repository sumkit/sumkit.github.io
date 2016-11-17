// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '571876370007-1peoaj3v39c15glembj915jl4eaib8a2.apps.googleusercontent.com';
var API_KEY = 'AIzaSyClrfIxWqPqslBjRtKrHi1U6zKJP7Uequk'
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
             'https://www.googleapis.com/auth/gmail.send'];

function handleClientLoad() {
  gapi.client.setApiKey(API_KEY);
  window.setTimeout(checkAuth, 1);
}

/**
 * Check if current user has authorized this application.
 */
function checkAuth() {
  gapi.auth.authorize(
    {
      'client_id': CLIENT_ID,
      'scope': SCOPES.join(' '),
      'immediate': false
    }, handleAuthResult);
}

/**
 * Handle response from authorization server.
 *
 * @param {Object} authResult Authorization result.
 */
function handleAuthResult(authResult) {
  var authorizeDiv = document.getElementById('authorize-div');
  if (authResult && !authResult.error) {
    // Hide auth UI, then load client library.
    authorizeDiv.style.display = 'none';
    loadGmailApi();
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

 /**
 * Print all Labels in the authorized user's inbox. If no labels
 * are found an appropriate message is printed.
 */
function listLabels() {
  var request = gapi.client.gmail.users.labels.list({
    'userId': 'me'
  });

  request.execute(function(resp) {
    var labels = resp.labels;
    appendPre('Labels:');
    if (labels != null) {
      for (var i = 0; i < labels.length; i++) {
        var label = labels[i];
        appendPre(label.name)
      }
    } else {
      appendPre('No Labels found.');
    }
  });
  }

/**
 * Initiate auth flow in response to user clicking authorize button.
 *
 * @param {Event} event Button click event.
 */
// function handleAuthClick(event) {
//   gapi.auth.authorize(
//     {client_id: CLIENT_ID, scope: SCOPES, immediate: false},
//     handleAuthResult);
//   return false;
// }

function handleAuthClick(event) {
  gapi.auth2.getAuthInstance().signIn();
}

function start() {
  gapi.client.init({
    'apiKey': API_KEY,
    'discoveryDocs': SCOPES,
    'clientId':CLIENT_ID,
    'scope':'profile'
  }).then(function() {
    window.setTimeout(checkAuth, 1);
  });
};

/**
 * Load Gmail API client library. List labels once client library
 * is loaded.
 */
function loadGmailApi() {
    gapi.client.load('gmail', 'v1', getInbox);
    gapi.client.load('gmail', 'v1', getUnread);
    gapi.client.load('gmail', 'v1', listLabels);
}

/**
 * Append a pre element to the body containing the given message
 * as its text node.
 *
 * @param {string} message Text to be placed in pre element.
 */
function appendPre(message) {
  var pre = document.getElementById('output');
  var textContent = document.createTextNode(message + '\n');
  pre.appendChild(textContent);
}

function getInbox() {
  var request = gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'labelIds': 'INBOX',
    'maxResults': 10
  });

  request.execute(function(response) {
    $.each(response.messages, function() {
      var messageRequest = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': this.id
      });

//      messageRequest.execute(displayMessage);
    });
  });
}

function getUnread() {
  var request = gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'labelIds': 'UNREAD',
    'maxResults': 30
  });

  request.execute(function(response) {
    $.each(response.messages, function() {
      var messageRequest = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': this.id
      });

    messageRequest.execute(displayMessage);
    });
  });
} 

function displayMessage(message) {
  var headers = message.payload.headers;
  $.each(headers, function() {
    if(this.name.toLowerCase() === "subject") {
        console.log(this.value);
    }
  })
}

/**
 * Send Email.
 */
function sendEmail() {
    var addresses = $('#address').val().replace(/\s/g,'').split(',');
    var subject = $('#subject').val();
    for(var i=0; i < addresses.length; i++) {
        var email = ''; //email RFC 5322 formatted String
        var headers = {'To': addresses[i],
            'Subject': subject};
        
        for(var header in headers) {
            email += header;
            email += ": "+headers[header]+"\r\n";
        }
        email += "\r\n";
        email += $('#body').val();
        
        // Using the js-base64 library for encoding: https://www.npmjs.com/package/js-base64
        var base64EncodedEmail = btoa(email);
        var request = gapi.client.gmail.users.messages.send({
          'userId': 'me',
          'resource': {
            'raw': base64EncodedEmail
          }
        }); 
        request.execute(function() {
            $('#address').val('');
            $('#subject').val('');
            $('#body').val('');
        });
    }
}
