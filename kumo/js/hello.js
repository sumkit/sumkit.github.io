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
  var windowWidth = $(window).width();
  var windowHeight = $(window).height();
  var two = new Two({ width: windowWidth, height: 190, fullscreen: true}).appendTo(document.body);  
    
  windowHeight -= 190;
  $.each(headers, function() {
      console.log(this.name.toLowerCase());
    if(this.name.toLowerCase() === "subject") {
        var env = two.makeRectangle(200,500,500,300);
        env.fill = "#ffffff";
        env.stroke = "#507C5C";
        env.linewidth = 6;
        
        var text = two.makeText("message", windowWidth/3, windowHeight/2);
        text.fill="#507C5C";
        text.translate = new Two.Vector(200,200);
//        text.noStroke();
        
        var clear = two.makeRectangle(500,200,50,50);
        clear.fill = "#507C5C";
        clear.stroke = "#ffffff";
        clear.linewidth = 4;
        clear.bind('click', function() {
            console.log("clicked");
            console.log('here');
            two.clear();
        })
        
        two.update();
    }
  });
}

/**
 * Send Email.
 */
function sendEmail() {
    var textDiv = document.getElementById("text");
    var addresses = textDiv.getElementsByClassName("addresses")[0].value;
    var subject = textDiv.getElementsByClassName("subject")[0].value;
    addresses = addresses.replace(/\s/g,'').split(',');
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
        email += "\r\n\r\nSent from kumo. Try it at www.summerkitahara.com/kumo/hello"
        
        // Using the js-base64 library for encoding: https://www.npmjs.com/package/js-base64
        var base64EncodedEmail = btoa(email);
        var request = gapi.client.gmail.users.messages.send({
          'userId': 'me',
          'resource': {
            'raw': base64EncodedEmail
          }
        }); 
        request.execute(function(response) {
            $('#address').val('');
            $('#subject').val('');
            $('#body').val('');
        });
    }
}