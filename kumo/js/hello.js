// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '571876370007-1peoaj3v39c15glembj915jl4eaib8a2.apps.googleusercontent.com';
var API_KEY = 'AIzaSyClrfIxWqPqslBjRtKrHi1U6zKJP7Uequk'
var SCOPES = ['https://www.googleapis.com/auth/gmail.readonly',
             'https://www.googleapis.com/auth/gmail.send'];

var windowWidth = $(window).width();
var windowHeight = $(window).height();

var unreadMsgs = [];
var inboxMsgs = [];
var i = 1;

$(document).ready(function() {
    drawClouds();

//    var paper = Raphael(0, 0, windowWidth, windowHeight);
//    var mailbox = paper.image("media/mailbox.png", (3/4)*windowWidth,windowHeight/3, 
//                              windowWidth/4, windowWidth/4);
//    mailbox.click(function() {
//        gapi.client.load('gmail', 'v1', getUnread);
//    });
//    
//    var inbox = paper.image("media/inbox.png",0,0,windowWidth/5, windowWidth/5);
//    inbox.click(function() {
//        gapi.client.load('gmail', 'v1', getInbox);
//    });
//    
//    var pencil = paper.image("media/crayon.png",0,windowHeight/2,windowWidth/12,windowHeight/8);
//    pencil.click(function() {
//        console.log("pencil");
//    });
});

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
            circle.attr("fill", "#000");
            circle.attr("stroke-width", "0");
        }
        last = last +(i*radius)+radius;
    }
}

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

//Get all emails in inbox (read and unread)
function getInbox() {
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
  });
}

//fetch only unread emails from user's inbox
function getUnread() {
    unreadMsgs = [];
    i=1;
    
  var request = gapi.client.gmail.users.messages.list({
    'userId': 'me',
    'labelIds': 'UNREAD',
    'maxResults': 30
  });

  request.execute(function(response) {
    $.each(response.messages.reverse(), function() {
      var messageRequest = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': this.id
      });
      messageRequest.execute(handleUnread);
    });
  });
} 

function handleUnread(message) {
    unreadMsgs.push(message);
    displayMessage(message);
}
function handleInbox(message) {
    inboxMsgs.push(message);
    displayMessage(message);
}

function displayMessage(message) {
    var bodyMsg = atob(message.payload.body.data);
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
//    var rect = paper.rect(210,0, 500, 300, 10);
    // Sets the fill attribute of the rectangle to white
    rect.attr("fill", "#ffffff");
    // Sets the stroke attribute of the rectangle to green with width 8
    rect.attr("stroke", "#507C5C");
    rect.attr("stroke-width", "8");
    
    
    rect.dblclick(function(event) {
        var oridomi = document.getElementById("oridomi");
        oridomi.style = "display: block;"
        var temp = new OriDomi('#oridomi', {
                hPanels: 3,
                ripple: 0
        });
        temp.setRipple().stairs(50, 'bottom');
        
//        var paper2 = Raphael(windowWidth/8, windowHeight/3, windowWidth, (5/8)*windowHeight);
//        var letter = paper2.image("media/papers.png",0,0,windowWidth/3, windowHeight/2);
//        var svgs = document.getElementsByTagName("svg");
//        var svg = svgs[svgs.length-1];
//        var img = svg.getElementsByTagName("image")[0];
        
//        var folded = new OriDomi(img);
//        folded.accordion(30);
        
        var thisMsg = unreadMsgs[unreadMsgs.length-1];
        console.log(atob(thisMsg.payload.body.data));

//        var bodyText = paper.text(20, 20, atob(thisMsg.payload.body.data));
//        bodyText.attr("fill", "#000");
//        bodyText.attr("stroke", "none");
//        bodyText.attr("font-size", "12px");
//        bodyText.attr("font-weight", "normal");
//        bodyText.attr("font-family", "arial");
//        bodyText.attr("text-anchor", "start");
    });

    var frontStr = "From: "+from+"\nSubject: "+subject;
    var t = paper.text((3/4)*windowWidth,windowHeight/4, frontStr);
    t.attr("fill", "#000");
    t.attr("stroke", "none");
    t.attr("font-size", "20px");
    t.attr("font-weight", "normal");
    t.attr("font-family", "arial");
    t.attr("text-anchor", "start");
    
    var anim1 = Raphael.animation({x: 10}, 2000, "backOut", function() {
    }).delay(200*i);
    var anim2 = Raphael.animation({x: windowWidth/6}, 2000, "backOut",function() {
    });
    i++;
    rect.animate(anim1);
    t.animateWith(rect, anim1, anim2);
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