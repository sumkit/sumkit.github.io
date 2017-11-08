//global variables
var addedSectionLabel=false;

//create sidebar: draw on canvas and listen for mousemove, mouseleave, and onclick events
function drawSidebar(width, height) {
    var space = height/15;
    var radius = height/80;
    var sections=["about me", "projects", "golf", "résumé", "contact me"];
    var canvases = document.getElementsByClassName('sidebar');
    for(var i=0;i<canvases.length;i++) {
        var ctx=canvases[i].getContext("2d");
        ctx.canvas.width = (radius*3);
        canvases[i].style.left="90%";
        if(canvases[i].id=="sidebar-line") {
            ctx.canvas.height = (5*space);
            canvases[i].style.top="33%";
            ctx.moveTo(radius+3, (radius+1));
            ctx.lineTo(radius+3, (4*space)+radius);            
        } else {
            ctx.canvas.height = (2*radius)+6;
            var y=((i-1)*space)+(height/3);
            canvases[i].style.top=y+"px";
            ctx.beginPath();
            ctx.arc(radius+3,radius+3,height/75, 0,2*Math.PI);
            ctx.fillStyle = 'white';
            ctx.fill();
            ctx.strokeStyle="#7383BF";
            ctx.stroke();
            
            canvases[i].addEventListener('mousemove', function(event) {
                if(!addedSectionLabel) {
                    addedSectionLabel = true;                    
                    var id=this.id.split('-')[1];
                    var pos = $(this).position();
                    var top = pos.top;
                    var left = pos.left-(8*id.length)-radius-3;
                    var p = document.createElement('p');
                    p.className="temp-label";
                    p.innerHTML=id;
                    p.style.position="fixed";
                    p.style.left=left+"px";
                    p.style.top=top+"px";
                    p.style.textAlign = "start";
                    document.body.appendChild(p);
                }
            }, false);
            canvases[i].addEventListener('mouseleave', function(event) {
                $("p").remove(".temp-label");
                addedSectionLabel = false;
            }, false);
            canvases[i].addEventListener('click', function(event) {
                var id=this.id.split('-')[1];
                id = id.replace(' ','-');
                $('html, body').animate({
                    scrollTop: $("#"+id+"-div").offset().top
                }, 1000);
            }, false);
        }
        ctx.strokeStyle="#7383BF";
        ctx.lineWidth = 3;
        ctx.stroke();
    }
}

//+'s show screen shots for projects. rotate between + (closed) and x (open).
function drawPluses() {
    var pluses = document.getElementsByClassName("plus");
    for(var i=0; i<pluses.length; i++) {
        var p = pluses[i];
        p.addEventListener('click', function(event) {
            var id = $(this).parent().parent()[0].id;
            id=id+"_imgs";
            var div = document.getElementById(id);
            if(div.style.display === 'none' || div.style.display === '') {
                div.style.display='block';
                $(this).css({
                    "-webkit-transform": "rotate(45deg)",
                    "-moz-transform": "rotate(45deg)",
                    "transform": "rotate(45deg)" /* For modern browsers(CSS3)  */
                });
            } else {
                div.style.display='none';
                $(this).css({
                    "-ms-transform": "rotate(90deg)", /* IE 9 */
                    "-o-transform": "rotate(90deg)", /* Opera */
                    "-webkit-transform": "rotate(90deg)", /* Safari and Chrome */
                    "-moz-transform": "rotate(90deg)", /* Firefox */
                    "transform": "rotate(90deg)" /* For modern browsers(CSS3) */
                });
            }
        });
    }
}

function drawOnSize(width, height) {
    if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
        //is on mobile device
        $("#stylesheet").attr("href", "css/style_mobile.css");
        $('canvas').css("display","none"); //get rid of sidebar 
        $('#résumé-div').remove(); 
    }
    else {
        $("#stylesheet").attr("href", "css/style_desktop.css");
        $('#mobile-résumé-div').remove(); 
        drawSidebar(width, height);
    }
}

//runs on load 
$( document ).ready(function() {
    var width = $( window ).width();
    var height = $( window ).height();
    var max = Math.max(width, height);
    $("#name").css("font-size",(max/20)+'px');
    drawOnSize(width, height);
    drawPluses();
});

//dynamic browser window resize
$(window).resize(function(){
    var width = $( window ).width();
    var height = $( window ).height();
    drawOnSize(width, height);
});