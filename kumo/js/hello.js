// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '571876370007-1peoaj3v39c15glembj915jl4eaib8a2.apps.googleusercontent.com';
var API_KEY = 'AIzaSyClrfIxWqPqslBjRtKrHi1U6zKJP7Uequk'
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
             'https://www.googleapis.com/auth/gmail.send'];

var windowWidth = $(window).width();
var windowHeight = $(window).height();

var unreadMsgs = []; //array of message objects that are unread (max 20)
var inboxMsgs = []; //array of message objects from inbox (max 20)
var animDelay = 1;

var envelopes = []; //envelopes currently on screen

$(document).ready(function() {
    drawClouds();

    var paper = Raphael((3/4)*windowWidth, 0, windowWidth, windowHeight);
    var mailbox = paper.image("media/mailbox.png", 0,windowHeight/2, 
                              windowWidth/4, windowWidth/4);
    mailbox.click(function() {
        gapi.client.load('gmail', 'v1', getUnread);
    });
    
    var inbox = paper.image("media/inbox.png",0,0,windowWidth/5, windowWidth/5);
    inbox.click(function() {
        gapi.client.load('gmail', 'v1', getInbox);
    });
    
    var pencil = paper.image("media/crayon.png",0,0.75*windowHeight,windowWidth/15,windowHeight/12);
    pencil.click(function() {
        $("#writeModal").modal('toggle');
        var temp = new OriDomi('#writeOridomi', {
                hPanels: 3,
                ripple: 0
        });
        temp.setRipple().stairs(50, 'bottom');
    });
});

//draw clouds made up of white circles on top of page
function drawClouds() {
    var windowWidth = $(window).width();
    var windowHeight = $(window).height();
    var radius = windowWidth/20;
    var paper = Raphael(0,0,windowWidth, (3*radius)+20);        
    var last = 0;
    while(last < windowWidth) {
        var i;
        for(i = 0; i < 7; i++) {
            var negOne = Math.pow(-1, i);
            negOne = negOne;
            var circle = paper.circle(last+(i*(3/4)*radius), (1.5*radius)+(negOne*(2/3)*radius), radius);
            circle.attr("fill", "#ffffff");
            circle.attr("stroke-width", "0");
        }
        last = last +(i*radius)+radius;
    }
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

//function handleAuthClick(event) {
//  gapi.auth2.getAuthInstance().signIn();
//}

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
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'inline';
  }
}

//Get all emails in inbox (read and unread)
function getInbox() {
  inboxMsgs = [];
  animDelay = 1;
    
  var request = gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'labelIds': 'INBOX',
    'maxResults': 20
  });

  request.execute(function(response) {
    $.each(response.messages, function() {
      var messageRequest = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': this.id
      });
      messageRequest.execute(handleInbox);
    });
    createX();
  });
}

//Create Raphael close button
function createX() {
    var paper = Raphael((7/8)*windowWidth, windowHeight/8,windowWidth/8,windowHeight/8);
    var x = paper.text(0,0, "x");
    x.attr('fill', 'red');
    x.attr("stroke", "#ffffff");
    x.attr("font-size", "70px");
    x.attr("font-weight", "bold");
    x.attr("font-family", "arial");
    
}

//fetch only unread emails from user's inbox
function getUnread() {
    unreadMsgs = [];
    animDelay = 1;
    
  var request = gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'labelIds': 'UNREAD',
    'maxResults': 20
  });

  request.execute(function(response) {
    $.each(response.messages.reverse(), function() {
      var messageRequest = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': this.id
      });
      messageRequest.execute(handleUnread);
    });
    createX();
  });
} 

function handleUnread(message) {
    unreadMsgs.push(message);
    displayMessage(message, "unread");
}
function handleInbox(message) {
    inboxMsgs.push(message);
    displayMessage(message, "inbox");
}

/** 
 * Display the message by creating an "envelope" rectangle  
 *
 * @param {Message} message 
 * @param {String} tag indicates if the message has an "UNREAD" or "INBOX" tag
 */
function displayMessage(message, tag) {
  var headers = message.payload.headers;
  var paper = Raphael(windowWidth/8, windowHeight/3, windowWidth, (5/8)*windowHeight);
    
    var subject = "";
    var from = "";
  $.each(headers, function() {
    if(this.name.toLowerCase() === "subject") {
        subject = this.value;
    }
    if(this.name.toLowerCase() === "from") {
        from = this.value;
    }
  });
        
    // Creates rectangle with rounded corners (10) at x = 50, y = 0
    var rect = paper.rect(windowWidth/8,0, (2/3)*windowWidth, windowHeight/2, 10);
    // Sets the fill attribute of the rectangle to white
    rect.attr("fill", "#ffffff");
    // Sets the stroke attribute of the rectangle to green with width 8
    rect.attr("stroke", "#507C5C");
    rect.attr("stroke-width", "8");
    
    rect.dblclick(function(event) {
        var bodyText = "";
        if(message.payload.body.data != null) {
            bodyText = atob(message.payload.body.data);
        }
        var elemP = document.getElementById("emailOridomiText");
        elemP.innerHTML = bodyText;
        
        $("#emailModal").modal('toggle');
        var temp = new OriDomi('#emailOridomi', {
                hPanels: 3,
                ripple: 0
        });
        temp.setRipple().stairs(50, 'bottom');
    });
    envelopes.push(rect);

    var frontStr = "From: "+from+"\nSubject: "+subject;
    var t = paper.text((3/4)*windowWidth,windowHeight/4, frontStr);
    t.attr("fill", "#000");
    t.attr("stroke", "none");
    t.attr("font-size", "20px");
    t.attr("font-weight", "normal");
    t.attr("font-family", "arial");
    t.attr("text-anchor", "start");
    
    var anim1 = Raphael.animation({x: 10}, 2000, "backOut", function() {}).delay(200*animDelay);
    var anim2 = Raphael.animation({x: windowWidth/6}, 2000, "backOut",function() {});
    rect.animate(anim1);
    t.animateWith(rect, anim1, anim2);
    animDelay++;
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
        
        //empty input fields 
        request.execute(function(response) {
            $('#address').val('');
            $('#subject').val('');
            $('#body').val('');
        });
    }
}