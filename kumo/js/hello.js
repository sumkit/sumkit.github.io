// Your Client ID can be retrieved from your project in the Google
// Developer Console, https://console.developers.google.com
var CLIENT_ID = '571876370007-1peoaj3v39c15glembj915jl4eaib8a2.apps.googleusercontent.com';
var API_KEY = 'AIzaSyClrfIxWqPqslBjRtKrHi1U6zKJP7Uequk'
var SCOPES = 'https://www.googleapis.com/auth/gmail.readonly '+
    'https://www.googleapis.com/auth/gmail.send '+'https://www.googleapis.com/auth/gmail.modify';

var green = "#507C5C";

var windowWidth = $(window).width();
var windowHeight = $(window).height();

var unreadMsgs = []; //array of message objects that are unread (max 20)
var inboxMsgs = []; //array of message objects from inbox (max 20)
var animDelay = 1;
var envelopePaper; //Raphael canvas to show "envelopes" of received emails 
var envelopesShowing=false;

$(document).ready(function() {
    drawClouds();
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
      'scope': SCOPES,
      'immediate': true
    }, handleAuthResult);
}

//Initiate auth flow in response to user clicking authorize button
function handleAuthClick() {
    gapi.auth.authorize({
        client_id: CLIENT_ID,
        scope: SCOPES,
        immediate: false
    }, handleAuthResult);
    return false;
}

function loggedInDrawElements() {
    var paper = Raphael((3/4)*windowWidth, 0, windowWidth, windowHeight);
    var mailbox = paper.image("media/mailbox.png", 0,windowHeight/2, 
                              windowWidth/4, windowWidth/4);
    mailbox.click(function() {
        console.log("mailbox clicked");
        gapi.client.load('gmail', 'v1', getUnread);
    });
    
    var inbox = paper.image("media/inbox.png",0,0,windowWidth/5, windowWidth/5);
    inbox.click(function() {
        gapi.client.load('gmail', 'v1', getInbox);
    });
    
    var paper2 = Raphael(0,windowWidth/4,windowWidth/11,windowHeight/7)
    var pencil = paper2.image("media/crayon.png",0,0,windowWidth/12,windowHeight/8);
    pencil.click(function() {
        $("#writeModal").modal('toggle');
    });
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
    document.getElementById("logoutBtn").style.display='inline'; //show logout button
    loggedInDrawElements();
    gapi.client.load('gmail', 'v1', getUnread);
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'block';
  }
}

//Create Raphael close button
function createX() {
    var paper = Raphael(windowWidth/2,(6/7)*windowHeight,windowWidth/8,windowHeight/4);
    var x = paper.text(0, 10, "Close");
    x.attr('fill', green);
    x.attr("stroke", "none");
    x.attr("font-size", (windowHeight/30)+"px");
    x.attr("font-weight", "bold");
    x.attr("text-anchor", "start");
    
    x.click(function() {
        //remove each envelope and address text
        envelopePaper.forEach(function(elem, index) {
            console.log(index);
            if(index%2 === 0)
                index++;
            var anim = Raphael.animation({x: windowWidth}, 2000, "<", function() {}).delay(100*index);
            elem.animate(anim);
        });
        x.remove(); //remove x from page after clearing all envelopes 
        
//        envelopePaper.clear();
        envelopePaper.remove();
        envelopesShowing=false;
    });
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
      console.log(response);
      //null response.messages means no new messages
      if(response.messages != null) {
          envelopePaper = Raphael(windowWidth/8, windowHeight/3, windowWidth, windowHeight/2);
          envelopesShowing=true;
          $.each(response.messages.reverse(), function() {
              var messageRequest = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': this.id
              });
              messageRequest.execute(handleUnread);
          });
          createX();
      }
  });
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
      //check for empty inbox
      if(response.messages != null) {
          envelopePaper = Raphael(windowWidth/8, windowHeight/3, windowWidth, windowHeight/2);
          envelopesShowing=true;
          $.each(response.messages.reverse(), function() {
              var messageRequest = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': this.id
              });
              messageRequest.execute(handleInbox);
          });
          createX();   
      }
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
    var rect = envelopePaper.rect(windowWidth,0, windowWidth/2, windowHeight/2, 10);
    // Sets the fill attribute of the rectangle to white
    rect.attr("fill", "#ffffff");
    // Sets the stroke attribute of the rectangle to green with width 8
    rect.attr("stroke", green);
    rect.attr("stroke-width", "8");
    
    rect.dblclick(function(event) {
        console.log(event);
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
        temp.setRipple().stairs(50, 'top', function() {
            console.log(tag);
        });
        if(tag === "unread")
            modifyMessage('me', unreadMsgs[unreadMsgs.length-1].id, [], ["UNREAD"]);
    });
    var frontStr = "From: "+from+"\nSubject: "+subject;
    var t = envelopePaper.text(windowWidth,windowHeight/3, "");
    t.attr("fill", "#000");
    t.attr("stroke", "none");
    t.attr("font-size", (windowHeight/40)+"px");
    t.attr("font-weight", "normal");
    t.attr("font-family", "arial");
    t.attr("text-anchor", "start");
    formatText(frontStr, (windowHeight/2)-5, t);
    
    var anim1 = Raphael.animation({x: 10}, 2000, "backOut", function() {}).delay(200*animDelay);
    var anim2 = Raphael.animation({x: windowWidth/6}, 2000, "backOut",function() {});
    animDelay++;
    rect.animate(anim1);
    t.animateWith(rect, anim1, anim2);
}

/** 
 * @param {String} text is the text 
 * @param {int} lineLength 
 */
function formatText(text, lineLength, raphText) {
    var newText = "";
    var words = text.split(" ");
    if(words.length > 1) {
        //email addresses don't have spaces 
        for (var i=0; i<words.length; i++) {   
          raphText.attr("text", newText + " " + words[i]);
          if (raphText.getBBox().width > lineLength) {
            newText=newText+"\n" + words[i];
          } else {
            newText=newText+" " + words[i];
          }
        }
    } 
}

function addressTransition() {
    var oridomiPaper = new OriDomi('#writeOridomi', {
        hPanels: 3,
        ripple: 0
    });
    oridomiPaper.foldUp('top', function() {
        window.setTimeout(function(){
            $("#writeModal").modal('toggle'); //close write modal (write email body)
            $("#envelopeModal").modal('toggle'); //open envelope modal (address email envelope)   
        },500);
    });
}

/**
 * Send Email from authorized user to inputted address(es).
 */
function sendEmail() {
    var textDiv = document.getElementsByClassName("writeOridomiText")[0].value;
    var addresses = $('#to').val();
    addresses = addresses.replace(/\s/g,'').split(',');
    var subject = $('#subject').val();
        
    for(var i=0; i < addresses.length; i++) {
        var email = ''; //email RFC 5322 formatted String
        var headers = {'To': addresses[i], 'Subject': subject};
        for(var header in headers) {
            email += header;
            email += ": "+headers[header]+"\r\n";
        }
        email += "\r\n";
        email += $('.writeOridomiText').val();
        email += "\r\n\r\nSent from kumo. Try it at www.summerkitahara.com/kumo/hello"
        
        // Using the js-base64 library for encoding: https://www.npmjs.com/package/js-base64
        var base64EncodedEmail = btoa(email);
        var request = gapi.client.gmail.users.messages.send({
          'userId': 'me',
          'resource': {
            'raw': base64EncodedEmail
          }
        });
        
        //once finish sending email, empty input fields 
        request.execute(function(response) {            
            $('#to').val('');
            $('#subject').val('');
            $(".writeOridomiText").val('');
        });
    }
}

/**
 * Modify the Labels a Message is associated with.
 *
 * @param  {String} userId User's email address. The special value 'me'
 * can be used to indicate the authenticated user.
 * @param  {String} messageId ID of Message to modify.
 * @param  {Array} labelsToAdd Array of Labels to add.
 * @param  {Array} labelsToRemove Array of Labels to remove.
 */
function modifyMessage(userId, messageId, labelsToAdd, labelsToRemove) {
  var request = gapi.client.gmail.users.messages.modify({
    'userId': userId,
    'id': messageId,
    'addLabelIds': labelsToAdd,
    'removeLabelIds': labelsToRemove
  });

  //callback
  request.execute(function(response) {
          console.log(labelsToRemove);
      console.log(labelsToRemove.indexOf("UNREAD"));
      if(labelsToRemove.indexOf("UNREAD")>0) {
          console.log(envelopesShowing);
          //labelsToRemove contains "UNREAD" -> remove read message from unread pile   
          if(envelopesShowing) {
              for(var i=0;i<unreadMsgs.length;i++) {
                  var ithID = unreadMsgs[i].id;
                  console.log(ithID);
                  if(ithID === messageId) {
                      console.log("mark as read "+ithID);
                      var topText = envelopePaper.getElementByPoint((windowWidth/8)+windowWidth, (2/3)*windowHeight);
                      console.log(topText);
                      topText.remove();
                      var topEnv = envelopePaper.getElementByPoint((windowWidth/8)+windowWidth, (2/3)*windowHeight);
                      topEnv.remove();
                      return; //only remove 1 envelope
                  }
              }
          }
      }
  });
}