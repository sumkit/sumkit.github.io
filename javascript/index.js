var windowWidth = 200; //init values
var windowHeight = 200;

function hoverText(elem) {
    var label = document.getElementById("label");
    label.innerHTML=elem.id;
    var left = elem.offsetLeft + (elem.width/5);
    var top = elem.offsetTop;
    top -= 30;
    $("#label").offset({ left: left, top: top});
}

function hideElements() {
    var divs = document.getElementsByClassName("section");
    for(var i=0; i<divs.length; i++) {
        var d = divs[i];
        d.style.display="none";
    }
}

function coffeeRain() {
    hideElements();
    var interval = $(window).width()/20;
    var y1 = $(window).height();
    var paper = Raphael(0,0,$(window).width(), y1);
    var anim1 = Raphael.animation({y: y1}, 2000, "linear");
    for(var i=0; i<20; i++) {
        var x1 = i*interval;
        var raphDrop = paper.image("media/desk/drop.png", x1, 0, y1/10, y1/10);
        if(i==0) {
            //show about me div
            var anim2 = Raphael.animation({y: y1}, 2000, "linear", function() {
                document.getElementById("about-me").style.display="inline"; 
            });
            anim2 = anim2.delay(800);
            raphDrop.animate(anim2);
        }
        else if(i==19) {
            //last drop
            var anim2 = Raphael.animation({y: y1}, 2000, "linear", function() {
                paper.remove();
            });
            anim2 = anim2.delay(1000);
            raphDrop.animate(anim2);
        } else {
            var rand = Math.random()*10;
            anim1 = anim1.delay(rand*100);
            raphDrop.animate(anim1);
        }
    }
}

function changeX(id) {
    var plusID = id+"_+";
    var timesID = id+"_x";
    var imgDiv = id+"_imgs";
    if(document.getElementById(plusID).style.display == 'none') {
        document.getElementById(plusID).style.display="inline";
        document.getElementById(timesID).style.display="none";
        document.getElementById(imgDiv).style.display="none";
    } else {
        document.getElementById(plusID).style.display="none";
        document.getElementById(timesID).style.display="inline";
        document.getElementById(imgDiv).style.display="block";
    }
}

function showGolf() {
    hideElements();
    document.getElementById("golf_div").style.display="inline";
}

function showProjects() {
    hideElements();
    document.getElementById("projects").style.display="inline";
}

function showResume() {
    //not already clicked
    hideElements();
    $("#resumeModal").modal('toggle');
}

function showContact() {
    hideElements();
    document.getElementById("contact_div").style.display="inline";
}

$( document ).ready(function() {
    windowWidth = $(window).width();
    windowHeight = $(window).height();
    
    if(windowWidth < windowHeight) {
        //mobile
        document.getElementById("desk").style.display="none";
        document.getElementById("about-me").style.display="block";
        document.getElementById("golf_div").style.display="block";
        document.getElementById("projects").style.display="block";
        document.getElementById("resume_div").style.display="block";
        document.getElementById("contact_div").style.display="block";
        
        //change CSS
        $("#name").css("font-size",100+'px');
        $(".title").css("font-size",60+'px');
        $(".section-header").css("font-size",80+'px');
        $(".description").css("font-size",28+'px');
    } else {
        //desktop
    }
});