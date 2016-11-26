var temp;
document.addEventListener('DOMContentLoaded', function() {
    document.getElementById("oridomi").style.display="none";
    if (!OriDomi.isSupported) {
      alert("OriDomi is not supposed on your browser.");
      return;
    }

    return;
});
function fold() {
    var text = document.getElementById("draft").getElementsByClassName("draft_text")[0].value;
    document.getElementById("draft").style.display="none";

    document.getElementById("oridomi").style.display = "block";
    document.getElementById("oridomi").getElementsByClassName("oridami_text")[0].value = text;

    temp = new OriDomi('#oridomi', {
            hPanels: 3,
            ripple: true
          });
    temp.setRipple().stairs(50, 'bottom');

    document.getElementById("envelope_div").style.display = "inline";

    var left = $("#envelope").offset().left;
    var top = $("#envelope").offset().top;
    var width = $("#envelope").height()/4;
    left += width;
    var height = $("#envelope").height()/2;
    top += height;
    document.getElementById("text").style.left = left + "px";
    document.getElementById("text").style.top = top+"px";
    document.getElementById("text").style.position = "absolute";
    document.getElementById("text").style.display="block";
}
function unfold() {
    document.getElementById("draft").style.display="inline";
    document.getElementById("oridomi").style.display = "none";
}