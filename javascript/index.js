$( document ).ready(function() {
    var box = document.getElementsByClassName("right-half")[0];
    box.style.visibility = "hidden";

    $('#work').waypoint(function() {
        console.log("home");
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "hidden";
    }, {
        offset: '60%'
    });
    $('#golf').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "hidden";
    }, {
        offset: '50%'
    });
    $('#golf').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="Budgie";
        var body = document.getElementById("body");
        body.innerHTML = "Android application to manage and categorize expenses. Features include reading prices off of the receipt instead of manual input (implements Microsoft's Oxford Optical Character Recognition API) and pie charts to show spending distribution.";
        var link = document.getElementById("link");
        link.innerHTML="<a href=\"http://www.envoynow.co/\"><span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span> EnvoyNow</a>"
    }, {
        offset: '75%'
    });
    $('.parallax-envoy').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="EnvoyNow";
        var body = document.getElementById("body");
        body.innerHTML = "Android application to manage and categorize expenses. Features include reading prices off of the receipt instead of manual input (implements Microsoft's Oxford Optical Character Recognition API) and pie charts to show spending distribution.";
    }, {
        offset: '30%'
    });
    $('.parallax-budgie').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="Budgie";
        var body = document.getElementById("body");
        body.innerHTML = "Android application to manage and categorize expenses. Features include reading prices off of the receipt instead of manual input (implements Microsoft's Oxford Optical Character Recognition API) and pie charts to show spending distribution.";
        var link = document.getElementById("link");
        link.innerHTML="<a href=\"http://www.envoynow.co/\"><span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span> EnvoyNow</a>"
    }, {
        offset: '20%'
    });
    $('.parallax-budgie').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="Budgie";
        var body = document.getElementById("body");
        body.innerHTML = "Android application to manage and categorize expenses. Features include reading prices off of the receipt instead of manual input (implements Microsoft's Oxford Optical Character Recognition API) and pie charts to show spending distribution.";
        var link = document.getElementById("link");
        link.innerHTML="<a href=\"http://www.envoynow.co/\"><span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span> EnvoyNow</a>"
    }, {
        offset: '50%'
    });
    $('.parallax-budgie').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="Umbrella";
        var body = document.getElementById("body");
        body.innerHTML = "Android application uses Bluetooth-based messaging and crowdsourcing to combat gender-based violence and the bystander effect.";
        var link = document.getElementById("link");
        link.innerHTML="<a href=\"https://github.com/sumkit/umbrella\"><span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span> GitHub</a>"
    }, {
        offset: '65%'
    });
    $('.parallax-umbrella').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="Umbrella";
        var body = document.getElementById("body");
        body.innerHTML = "Android application uses Bluetooth-based messaging and crowdsourcing to combat gender-based violence and the bystander effect.";
        var link = document.getElementById("link");
        link.innerHTML="<a href=\"https://github.com/sumkit/umbrella\"><span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span> GitHub</a>"
    }, {
        offset: '50%'
    });
    $('.parallax-umbrella').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="Umbrella";
        var body = document.getElementById("body");
        body.innerHTML = "Android application uses Bluetooth-based messaging and crowdsourcing to combat gender-based violence and the bystander effect.";
        var link = document.getElementById("link");
        link.innerHTML="<a href=\"https://github.com/sumkit/umbrella\"><span class=\"glyphicon glyphicon-link\" aria-hidden=\"true\"></span> GitHub</a>"
    }, {
        offset: '10%'
    });
    $('.parallax-umbrella').waypoint(function() {
        var box = document.getElementsByClassName("right-half")[0];
        box.style.visibility = "visible";
        var title = document.getElementById("title");
        title.innerHTML="EnvoyNow";
        var body = document.getElementById("body");
        body.innerHTML = "Android application to manage and categorize expenses. Features include reading prices off of the receipt instead of manual input (implements Microsoft's Oxford Optical Character Recognition API) and pie charts to show spending distribution.";
    }, {
        offset: '70%'
    });
});