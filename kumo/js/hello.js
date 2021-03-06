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
var x; //close button to remove envelopes from screen
var envelopesShowing=false;
var replyMsgId=0;

$(document).ready(function() {
    drawClouds(); //clouds are drawn regardless of authorization status 
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
            circle.attr("stroke", "none");
        }
        last = last +(i*radius)+radius;
    }
}

//on window load function 
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

//Draw mailbox, inbox, and pencil Raphael images after authorization has been confirmed
function loggedInDrawElements() {
    var paper = Raphael((3/4)*windowWidth,0,(windowWidth/4)+5, windowHeight);
    var mailbox = paper.image("media/mailbox.png",0,windowHeight/3,windowHeight/6, windowHeight/6);
    mailbox.click(function() {
        if(!envelopesShowing) {
            gapi.client.load('gmail', 'v1', getUnread);
        }
    });
    mailbox.hover(function() {
        //hover in
        showSnackbar("Mailbox of unread emails.");
    }, function() {
        //hover out
        showSnackbar("Mailbox of unread emails.");
    });
    mailbox.node.alt="unread mailbox";
    
    var inbox = paper.image("media/inbox.png",0,windowHeight/2,windowHeight/6,windowHeight/6); 
    inbox.click(function() {
        if(!envelopesShowing) {
            gapi.client.load('gmail', 'v1', getInbox);    
        }
    });
    inbox.hover(function() {
        //hover in
        showSnackbar("Show inbox.");
    }, function() {
        //hover out
        showSnackbar("Show inbox.");
    });
    inbox.node.alt="inbox";
    
    var pencil = paper.image("media/crayon.png",0,(2/3)*windowHeight,windowHeight/12,windowHeight/12);
    pencil.click(function() {
        $("#writeModal").modal('toggle');
    });
    pencil.hover(function() {
        //hover in
        showSnackbar("Start a new email.");
    }, function() {
        //hover out
        showSnackbar("Start a new email.");
    });
    inbox.node.alt="inbox";
    pencil.node.alt="write new email";
}

//Check if a modal is open so we know which keypress events to listen for
function isModalShowing() {
    var modals = document.getElementsByClassName("modal");
    var showing=false;
    for(var i=0;i<modals.length;i++) {
        var m = modals[i];
        var mID='#'+m.id;
        if($(mID).hasClass('in')) {
            showing=true;
        }
    }
    return showing;
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
    document.getElementById("logoutBtnDiv").style.display='block'; //show logout button
    loggedInDrawElements();
      
    showSnackbar("Click the Help button or press 'h' for help and tips.");
      
    gapi.client.load('gmail', 'v1', function() {
        //need to load something initially
        gapi.client.gmail.users.messages.list({
            'userId': 'me',
            'labelIds': 'UNREAD',
            'maxResults': 2
        });
    });
    
    $(document).keypress(function(event) {
        if(!isModalShowing()) {
            switch(String.fromCharCode(event.charCode)) {
                case "l":
                    //logout
                    document.getElementById("logoutBtn").click();
                    break;
                case "h":
                    //help
                    document.getElementById("helpBtn").click();
                    break;
                case "u":
                    //open unread emails
                    gapi.client.load('gmail', 'v1', getUnread);
                    break;
                case "i":
                    //open inbox
                    gapi.client.load('gmail', 'v1', getInbox);
                    break;
                case "n":
                    //write new email
                    $("#writeModal").modal('toggle');
                    break;
                case "x":
                    //remove each envelope and address text, if there are any showing
                    if(envelopesShowing) 
                        removeEnvelopes();
                    break;
                case "o":
                    //open message
                    if(!isModalShowing() && envelopesShowing) {
                        var thisMsg;
                        if(unreadMsgs.length > 0) {
                            openEmail(unreadMsgs[unreadMsgs.length-1], "unread");
                        } else {
                            openEmail(inboxMsgs[inboxMsgs.length-1], "inbox");
                        }
                    }
                    break;
                case " ":
                    //space, move message to bottom of pile
                    if(envelopesShowing) {
                        console.log("space");
                        if(unreadMsgs.length > 0) {
                            var lastIndex = unreadMsgs.length-1;
                            var last = unreadMsgs[lastIndex];
                            unreadMsgs.splice(lastIndex, 1);
                            unreadMsgs.unshift(last);
                            envelopePaper.clear();
                            $.each(unreadMsgs, function(msg) {
                              displayMessage(msg, "unread")
                            });
                        } else {
                            var lastIndex = inboxMsgs.length-1;
                            var last = inboxMsgs[lastIndex];
                            inboxMsgs.splice(lastIndex, 1);
                            inboxMsgs.unshift(last);
                            envelopePaper.clear();
                            $.each(inboxMsgs, function(msg) {
                              displayMessage(msg, "inbox")
                            });
                        }
                    }
                default:
                    //do nothing
                    break;
            }
        } 
        if(isModalShowing()) {
            switch(String.fromCharCode(event.charCode)) {
                case "x":
                    //exit modal
                    var modals = document.getElementsByClassName("modal");
                    for(var i=0;i<modals.length;i++) {
                        var m = modals[i];
                        var mID='#'+m.id;
                        if($(mID).hasClass('in')) {
                            $(mID).modal('toggle');
                        }
                    }
                    break;
                default:
                    //do nothing
                    break;
            }
        }
    });
  } else {
    // Show auth UI, allowing the user to initiate authorization by
    // clicking authorize button.
    authorizeDiv.style.display = 'block';
  }
}

function removeEnvelopes() {        
    envelopePaper.remove();
    envelopesShowing=false;
    x.remove(); //remove x from page after clearing all envelopes 
}

//Create Raphael close button
function createX() {
    var paper = Raphael((windowWidth/2)+10,(5/6)*windowHeight,windowWidth/8,(windowHeight/10));
    x = paper.text(0, 10, "Close");
    x.attr('fill', "white");
    x.attr("stroke", "none");
    x.attr("font-size", windowWidth/40);
    x.attr("font-weight", "bold");
    x.attr("text-anchor", "start");
    x.click(function() {
        //remove each envelope and address text
        removeEnvelopes();
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
      //null response.messages means no new messages
      if(response.messages != null) {
          envelopePaper = Raphael(windowWidth/8, windowHeight/3, 0.625*windowWidth, windowHeight/2);
          envelopesShowing=true;
          var promises = [];
          $.each(response.messages, function() {
              var messageRequest = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': this.id
              });
              // Gmail API is asyncronous, so wrap all server responses in a Promise.all()
              var promise = $.Deferred();
              promises.push(promise);
              messageRequest.execute(function(message) {
                  // Save the message in a collection 
                  unreadMsgs.push(message);
                  promise.resolve(message);
              });
          });
          Promise.all(promises).then(function(messages) {
              // Sort messages by date in descending order
              messages.sort(compareMessages); //unreadMsgs

              // Finally, process the messages
              messages.forEach(function(message){
                  handleUnread(message);
              });
          });
          createX();
      } else {
          showSnackbar("0 unread emails.");
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
          envelopePaper = Raphael(windowWidth/8, windowHeight/3, 0.625*windowWidth, windowHeight/2);
          envelopesShowing=true;
          var promises = [];
          $.each(response.messages, function() {
              var messageRequest = gapi.client.gmail.users.messages.get({
                'userId': 'me',
                'id': this.id
              });
              // Gmail API is asyncronous, so wrap all server responses in a Promise.all()
              var promise = $.Deferred();
              promises.push(promise);
              messageRequest.execute(function(message) {
                  // Save the message in a collection 
                  inboxMsgs.push(message);
                  promise.resolve(message);
              });
          });
          Promise.all(promises).then(function(messages) {
              // Sort messages by date in descending order
              messages.sort(compareMessages); //inboxMsgs

              // Finally, process the messages
              messages.forEach(function(message){
                  handleInbox(message);
              });
          });
          createX(); 
      }
  });
}

/**
 * sort messages from most recent to oldest
 * @param {Message} a first message
 * @param {Message} b second message to compare to first message
 */
function compareMessages(a, b) {
    var headersA = a.payload.headers;
    var headersB = b.payload.headers;
    var da;
    var db;
    $.each(headersA, function() {
        if(this.name.toLowerCase() === "date") {
            da=new Date(this.value).valueOf();
        }
    });
    $.each(headersB, function() {
        if(this.name.toLowerCase() === "date") {
            db=new Date(this.value).valueOf();
        }
    });
    return da < db ? -1 : (da > db ? 1 : 0);
}

/**
 * Called for each unread message. Add the message to a global list of unread messages. 
 * Call displayMessage() to display the addressed envelope on the screen
 * @param {Message} message that is unread 
 */
function handleUnread(message) {
    displayMessage(message, "unread");
}

/**
 * Called for each message from the inbox. Add the message to a global list of messages. 
 * Call displayMessage() to display the addressed envelope on the screen
 * @param {Message} message that is in the inbox 
 */
function handleInbox(message) {
    displayMessage(message, "inbox");
}

/** 
 * open email message in new modal after clicking on envelope
 * @param {Message} message to open
 * @param {String} tag of the message's label
 */
function openEmail(message, tag) {
    var bodyText="";
    if(message.payload.body.data != null) {
        bodyText=atob(message.payload.body.data);
    }
    var elemP=document.getElementById("emailOridomiText");
    elemP.innerHTML=getBody(message.payload);

    var hiddenP=document.getElementById("messageId");
    hiddenP.innerHTML=message.id;

    $("#emailModal").modal('toggle');
    if(tag === "unread")
        modifyMessage('me', unreadMsgs[unreadMsgs.length-1].id, [], ["UNREAD"]);
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
        
    // Creates rectangle with rounded corners (10)
    var rect;
    var envWidth = windowWidth/4;
    var envHeight = windowWidth/16;
    var envX = (3/4)*windowWidth;
    if(tag == "unread") {
        //come from mailbox
        rect = envelopePaper.rect(envX,0,envWidth,envHeight, 10);
    } else {
        //come from inbox
        rect = envelopePaper.rect(envX,(windowHeight*0.17),envWidth,envHeight, 10);
    }
    // Sets the fill attribute of the rectangle to white
    rect.attr("fill", "#ffffff");
    // Sets the stroke attribute of the rectangle to green with width 8
    rect.attr("stroke", green);
    rect.attr("stroke-width", "8");
    var frontStr = "From: "+from+"\nSubject: "+subject;
    var t = envelopePaper.text((0.75*windowWidth),(windowWidth/9),"");
    t.attr("fill", "#000");
    t.attr("stroke", "none");
    t.attr("font-size", windowWidth/60);
    t.attr("font-weight", "normal");
    t.attr("font-family", "arial");
    t.attr("text-anchor", "start");
    formatText(frontStr, envWidth-5, t);
    
    rect.drag(function(dx, dy) {
        //on move (mouse pressed)
        x1 = this.ox + dx;
        y1 = this.oy + dy; 
        x2 = t.ox + dx;
        y2 = t.oy + dy;
        this.attr({x: x1, y: y1});
        t.attr({x: x2, y: y2});
    }, function() {
        //on start (mouse down)
        this.ox = this.attr("x");
        this.oy = this.attr("y");
        t.ox = t.attr("x");
        t.oy = t.attr("y");
    }, function() {
        //on end (mouse up)
        if(Math.abs(this.ox-this.attr("x"))<3 &&
          Math.abs(this.oy-this.attr("y"))<3) {
            //click, not drag
            openEmail(message, tag);
        } else {
            //move top envelope to the bottom of the pile
            if(tag === "unread") {
                var lastIndex = unreadMsgs.length-1;
                var last = unreadMsgs[lastIndex];
                unreadMsgs.splice(lastIndex, 1);
                unreadMsgs.unshift(last);
            } else {
                var lastIndex = inboxMsgs.length-1;
                var last = inboxMsgs[lastIndex];
                inboxMsgs.splice(lastIndex, 1);
                inboxMsgs.unshift(last);
            }
            t.toBack();
            rect.toBack();
        }
    });
    
    var anim1 = Raphael.animation({x: 10, y: 0, width: windowWidth/2, height: windowWidth/4}, 2000, "backOut").delay(100*animDelay);
    var anim2 = Raphael.animation({x: windowWidth/7}, 2000, "backOut");
    animDelay++;
    rect.animate(anim1);
    t.animateWith(rect, anim1, anim2);
}

/** 
 * format the text to fit within a certain line length by adding '\n' characters where needed
 * @param {String} text is the text 
 * @param {int} lineLength
 * @param {Element} raphText Raphael text element to put formatted text into
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

/**
 * recursively get the HTML data from message 
 * @param {Array} arr array of message parts
 * @return {String} data or error message to display
 */
function getHTMLPart(arr) {
    for(var x = 0; x <= arr.length; x++) {
        if(typeof arr[x] === 'undefined') {
            //do nothing
        } else {
            if(typeof arr[x].parts === 'undefined') {
                if(arr[x].mimeType === 'text/html') {
                    return arr[x].body.data;
                }
            } else {
                //not HTML type, so recurse 
                return getHTMLPart(arr[x].parts);
            }
        }
    }
    return "Sorry, kumo cannot load this data.";
}

/**
 * Get the message body and decode the URI
 * @param {Message} message that has been selected to open and view
 * @return URI decoded body for HTML
 */
function getBody(message) {
    var encodedBody = '';
    if(typeof message.parts === 'undefined') {
      encodedBody = message.body.data;
    } else {
      encodedBody = getHTMLPart(message.parts);
    }
    encodedBody = encodedBody.replace(/-/g, '+').replace(/_/g, '/').replace(/\s/g, '');
    return decodeURIComponent(escape(window.atob(encodedBody)));
}

//Handle the UI aspects of transitioning between writing the email body 
//and addressing the "envelope
function addressTransition() {
    $(".writeOridomiText").hide();
    var oridomiPaper = new OriDomi('#writeOridomi', {
        hPanels: 3,
        ripple: 0
    });
    oridomiPaper.foldUp('top', function() {
        window.setTimeout(function(){
            $("#writeModal").modal('toggle'); //close write modal (write email body)
            $("#envelopeModal").modal('toggle'); //open envelope modal (address email envelope)   
            oridomiPaper.unfold();
            $(".writeOridomiText").show();
        },500);
    });
}

/**
 * Send Email from authorized user to inputted address(es).
 */
function sendEmail(address, subject, body) {
    var email = ''; //email RFC 5322 formatted String
    var headers = {'To': address, 'Subject': subject};
    for(var header in headers) {
        email += header;
        email += ": "+headers[header]+"\r\n";
    }
    email += "\r\n";
    email += body;
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
        $(".replyOridomiText").val('');
    });   
}

//Called when press send button on new email
function sendEmailClick() {
    var textDiv = document.getElementsByClassName("writeOridomiText")[0].value;
    var addresses = $('#to').val();
    addresses = addresses.replace(/\s/g,'').split(',');
    var subject = $('#subject').val();
    var body = $(".writeOridomiText").val();
    for(var i=0; i < addresses.length; i++) {
        sendEmail(addresses[i], subject, body);   
    }
    $(".writeOridomiText").val('');
}

//Called when press reply button
function startReplyClick() {
    replyMsgId=document.getElementById("messageId").innerHTML;
    $('#replyModal').modal('toggle');
}

//Called when press send on replying message
//fetch the original message by ID
function replyEmailClick() {
    var request = gapi.client.gmail.users.messages.get({
        'userId': 'me',
        'id': replyMsgId
    });
    request.execute(replyEmail);
}

/**
 * Get parameters for email address, subject, and email body to call sendEmail()
 * 
 * @param {Message} message to send in reply
 */
function replyEmail(message) {
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
//    document.getElementById("replyOridomiTextID").display="none";
    $(".replyOridomiTextID").hide();
    var oridomiPaper = new OriDomi('#replyOridomi', {
        hPanels: 3,
        ripple: 0
    });
    oridomiPaper.foldUp('top', function() {
        window.setTimeout(function(){  
            $('#replyModal').modal('toggle');
            oridomiPaper.unfold();
//            document.getElementById("replyOridomiTextID").display="block";
            $(".replyOridomiTextID").show();
        },500);
    });
    if(!subject.toLowerCase().startsWith("re: ")) {
        subject = "Re: "+subject;
    }
    sendEmail(from, subject, $(".replyOridomiText").val());
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
      if(labelsToRemove.indexOf("UNREAD")>=0) {
          //labelsToRemove contains "UNREAD" -> remove read message from unread pile   
          if(envelopesShowing) {
              //redraw unread messages
              removeEnvelopes();
              gapi.client.load('gmail', 'v1', getUnread);
          }
      }
  });
}


/**
 * Show a snackbar at the bottom of the webpage with the specified text
 * @param {String} text to display in the snackbar 
 */
function showSnackbar(text) {
    var snack = document.getElementById("snackbar"); // Get the snackbar DIV
    snack.innerHTML = text; //set snackbar text
    snack.className = "show"; // Add the "show" class to DIV

    // After 3 seconds, remove the show class from DIV
    setTimeout(function(){snack.className = snack.className.replace("show", ""); }, 3000);
}