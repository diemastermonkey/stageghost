/* controller.js
   Serve as conduit between chatbot and Panel system - Next Gen
   20161124 @garyd @diemastermonkey
*/

// To do: Include  
// src="https://ajax.googleapis.com/ajax/libs/jquery/3.1.1/jquery.min.js"
// also at panels/jquery.min.js

// Globals   
// var sStatusPath = "cgi-bin/getstatus";
// Where to get, relative server
// Works // var sStatusPath = "/cgi-bin/getstatus";
var sStatusPath = "/cgi-bin/getstatus";
var iCycleTime = 5000;    // ms between updates
var oControllerTimer = null;
var sLastServerMsg = "INVALID";  // So processed only once
var sServerData = "";
var sServerBuffer = "";		// For external clients

// Once page first loaded, set handlers etc
function fnLoaded () {
  fnStatus ("Loaded");
  $(document).ajaxComplete (function () { fnLog ("AjaxComplete"); });
  $(document).ajaxError (function () { fnLog ("AjaxError"); });
  // $(document).ajaxSuccess (function (ajaxdata) {fnControllerServerResponse(ajaxdata); });
  // Start timer for server updates
  fnControllerTimer();        // Also initial server check
  fnLog ("Initial load complete.");
}

// Handle server check/UI update timer, set for next cycle
function fnControllerTimer () {
  // Perform per-cycle work here
  fnControllerServerCheck(); 
  // Reinstate single-fire timer, see ya soon
  oControllerTimer = setTimeout (fnControllerTimer, iCycleTime); 
}

// Initiate ajax check
function fnControllerServerCheck () {     
  fnStatus ("Server check...");
  fnLog ("Checking server for updates...");
  // Place request, specifying response handler
  $.get (sStatusPath,
    function (ajaxdata) {  // Specs dual completion handler
      fnLog ("In get: Data is " + ajaxdata);
      fnControllerServerResponse (ajaxdata); // see alt args
    }
  );
}

// Handle all ajax responses
function fnControllerServerResponse (ajaxdata) { 
  // Code
  fnLog ("Ajax success");
  fnLog ("Debug: Data is " + ajaxdata);
  fnStatus ("Idle");  // Might not stay long

  // Only process new server responses
  if (ajaxdata == sLastServerMsg) { 
    fnLog ("Idle");
    return;
  }

  // Store as latest server response
  sLastServerMsg = ajaxdata;
  sServerBuffer = ajaxdata;  // External taxicab
  fnLog ("New command from server: " + ajaxdata);

  // Split on equals
  var aVal = ajaxdata.split ("=");
  fnLog ("Debug: aVal0,1 = " + aVal[0] + "," + aVal[1]);

  // "3D Insert" directives all start with "3d=something"
  var temp = aVal[0];
  if (temp.indexOf("3d") != -1) {
    fnLog ("3D: Object insert");
    // HARDWIRED test texture:
    fnObjectAdd_3D ("/panels/raspberrypi.png");
    // fnObjectAdd_3D(aVal[1]);  // Should be this
    return;
  }

  // Simple DOM handler: Any server response with equals treated
  // as a field update/passed to fnElementSet
  if (aVal.length > 1) {
    fnElementSet (aVal[0], aVal[1]);
    fnLog ("Element " + aVal[0] + " set to " + aVal[1]);
    return;  // Done here
  }

  // If not tok=val pair, treat as source spec
  // for 'content-main' iframe. NOT best solution.
  // Mb just use getElementById().src=
  fnLog ("Updating content-main to " + ajaxdata);
  $('#content-main').html(
    '<iframe id="content-main" src="' 
      + ajaxdata 
      + '">Loading...</iframe>'
  );
  // Example: fnElementSet ("content-main", "<b>Alternate</b>");
  document.getElementById ("content-main").src = ajaxdata;

  // On any valid server message, returl data
  return (ajaxdata);
}

// Crudely update a DIV (only) element BY ID from server updates
// in form "element=html" ie "status-label=<b>shoutout!</b>"
// this recieves ("status-label", "<b>shoutout!</b>")
// completely replaces element's html, not just text content
function fnElementSet (sElement, sContent) {
  $('#' + sElement).html(
    '<div id=' + sElement + '>' + sContent + '</div>'
  );
}

// Simple console logger
function fnLog (argMsg) {console.log ("controller.js: " + argMsg);}

// Simple UI status updater
function fnStatus (argMsg) {
  $('#status-label').html('<span id="status-label">' + argMsg + '</span>');
}

// I swear this is just a crude test of
// 3D object added via ajax msg from chat
// Recieve url to texture, presumably usere profile pic
function fnObjectAdd_3D (argTextureUrl) {
  // Call fnObjectAdd() on remote inline html
  // DUH THAT IS ILLEGAL
  fnObjectAdd();
}

// Simple get/clear taxicab for external scripts - dumb
function fnServerBufferRead () { return (sServerBuffer); }
function fnServerBufferClear () {
  sServerBuffer = "";
  // fnLog ("ServerBuffer cleared.");
}

// Fin
