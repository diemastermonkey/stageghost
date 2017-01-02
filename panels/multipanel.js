/* Stageghost support features for multipanel themes
   Mostly just switches between panels on timer
	 2016 @diemastermonkey
*/

var iCycles = 0;  // Simple counter
// How often update animations (not necessarily refresh)
var iRefreshTime = 7999;		
// List of tabs (divs) included in fnRandomTab lottery
var Tabs = ["System", "Channel", "Content"];

// Start animation timer - superfluous or use for one-time startup
function fnStartAnimation () {
  setTimeout ("fnAnimate()", iRefreshTime);  // Single occurance timer
}

// Return rand int min to max excluding max. Thx w3c
function randInt (min, max) {
  return Math.floor (Math.random() * (max - min)) + min;
}

// Switch to a tab (moved from panel html)
function openCity(evt, cityName) {
  var i;
  var argBtn = cityName + "-btn";  // shortcut to tab to highlight
  var x = document.getElementsByClassName("city");
  for (i = 0; i < x.length; i++) {
     x[i].style.display = "none";
  }
  var activebtn = document.getElementsByClassName("testbtn");
  for (i = 0; i < x.length; i++) {
      activebtn[i].className = activebtn[i].className.replace(" w3-dark-grey", "");
  }
  document.getElementById(cityName).style.display = "block";
	// Broken? OG: highlight 'clicked' tab
  evt.currentTarget.className += " w3-dark-grey";
	document.getElementById(argBtn).className += " w3-dark-grey"; // Append greyness

	// Mod dmm
	activebtn.click();
}

// Switch to a random tab, leaning on openCity
// Relies on 'Tabs' array
function fnRandomTab () {
  var iTab = randInt (0, 3);	// range 0 1 2  
  var sTabName = Tabs[iTab];
	// Almost works but setting whole container grey
  // document.getElementById(sTabName).className += " w3-dark-grey"; 
  openCity (null, sTabName);
}

/* Runs each (timer) and restarts timer */
function fnAnimate () {
  iCycles++;

  // Switch tabs except on first run
  if (iCycles != 1) {
     fnRandomTab ();
  }

  if (iCycles == 1 && randInt(0,2) == 0) {
    // On cycle start, set signage visible - MB!
    // document.getElementById('signage').style = 
    //  "transition:opacity 3s; opacity:1.0;";
  }

  // Also mb start animation of notice by changing position etc
  // Note: Position not changed in this one, but works
  if (randInt(0, 2) == 0) {
    // var iTop = randInt(0, 100);
    // var iLeft = randInt(0, 100);
    // iTop  = 22;
    // iLeft = 60;
    // document.getElementById('notice').style += 
    //  "transition:opacity 2s; "
      // + "top:" + iTop + "%; " // PS cant do both
      // + "left:" + iLeft + "%; "
      // + "opacity:0.0; ";
  }

  // New: Mb set the signage area to opacity 0, causing it to fade out
  if (randInt(0, 15) == 0) {
    document.getElementById('signage').style = 
      "transition:opacity 7s;opacity:0.0;";
  }
  
  // Restart timer 
  setTimeout ("fnAnimate()", iRefreshTime);
}

