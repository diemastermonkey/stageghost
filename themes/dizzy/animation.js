/*
Auto Refresh Page with Time script
By JavaScript Kit (javascriptkit.com)
Modified 2016 @diemastermonkey
This is a TEMPLATE - tokens throughout
in form _TOKEN_ get replaced at render
by an external script. Modify this and 
PanelServer*Template*.css to change layout.
*/

var iCycles = 0;  // Simple counter

// Simply starts animation timer
function fnAnimate () {
  // X-second timer 
  setTimeout ("beginrefresh()", 1000);
}

// Thx w3c
function randInt (min, max) {
  return Math.floor (Math.random() * (max - min)) + min;
}

/* Runs each (timer) */
function beginrefresh () {
  iCycles++;
  if (iCycles == 1 && randInt(0,2) == 0) {
    // On cycle start, set signage visible - MB!
    document.getElementById('signage').style = 
      "transition:opacity 3s; opacity:1.0;";
  }

  // New: Possibly change overlay frame (disused)
  /*
  if (randInt(0, 2) == 0) {
    var iFrame = randInt(1, 7); 
    var sSrc = 
      "themes/three" + "/fsmsm" + iFrame + ".png";

    // document.getElementById('foreground').style.background 
    document.getElementById('fgimage').src = sSrc;
  }
  */

  // Start animation of notice by changing position etc
  // Note: Position not changed in this one, but works
  // if (randInt(0, 2) == 0) {
    // var iTop = randInt(0, 100);
    // var iLeft = randInt(0, 100);
    // iTop  = 22;
    // iLeft = 60;

    document.getElementById('notice').style = 
      "transition:left 7s, top 7s, font-size 6s; "
      + "top:" + 67 + "%; " // PS cant do both
      + "left:" + -70 + "%; "
      + "font-size:22;";

    // Animate requestor image
    document.getElementById('requestorimage').style = 
      "transition:left 10s, top 13s, width 13s, height 13s; "
      + "top:" + 63 + "%; " // PS cant do both
      + "left:" + -120 + "%; "
      + "width:480px; height:360px;";
  // }

  // New: Mb set the signage area to opacity 0, causing it to fade out
  if (randInt(0, 15) == 0) {
    document.getElementById('signage').style = 
      "transition:opacity 7s;opacity:0.0;";
  }
  
  // Restart timer 
  setTimeout ("beginrefresh()", 1000)
}

