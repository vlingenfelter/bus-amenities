// variables for
var sl1IsChecked, sl2IsChecked, sl3IsChecked, sl4IsChecked, sl5IsChecked;
var mIsChecked, bIsChecked, cIsChecked, dIsChecked, eIsChecked;
var buswayIsChecked, rtIsChecked;
var keyIsChecked, otherIsChecked;
var stopsCountString;

//empty object to be filled with the stops used for analysis
var stopsForAnalysis = {
  "type": "FeatureCollection",
  "crs": {
    "type": "name",
    "properties": {
      "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
    }
  },
  "features": []
};

function resetStopsForAnalysis() {
  stopsForAnalysis = {
    "type": "FeatureCollection",
    "crs": {
      "type": "name",
      "properties": {
        "name": "urn:ogc:def:crs:OGC:1.3:CRS84"
      }
    },
    "features": []
  };
};

function whichChecks() {
  sl1IsChecked = document.getElementById("sl1andsl2Check").checked;
  sl4IsChecked = document.getElementById("sl4andsl5Check").checked;
  mIsChecked = document.getElementById("mCheck").checked;
  bIsChecked = document.getElementById("bCheck").checked;
  cIsChecked = document.getElementById("cCheck").checked;
  dIsChecked = document.getElementById("dCheck").checked;
  eIsChecked = document.getElementById("eCheck").checked;
  keyIsChecked = document.getElementById("keyBusCheck").checked;
  otherIsChecked = document.getElementById("otherBusCheck").checked;
};

// createStopsArray: takes in allstops1004 and adds proper stops to stopsForAnalysis
// logic: if user checked the right box and the JSON contains 1 for that box, include in analysis.
function createStopsArray(features) {
  for (i = 0; i < features.length; i++) {
    if (otherIsChecked && features[i].properties.StBusStop == 1) { // adds the 'other' bus stops to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (mIsChecked && features[i].properties.M == 1) { // adds the Mattapan Trolley to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (bIsChecked && features[i].properties.GreenB == 1) { // adds the B Branch to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (cIsChecked && features[i].properties.GreenC == 1) { // adds the C Branch to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (dIsChecked && features[i].properties.GreenD == 1) { // adds the D Branch to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (eIsChecked && features[i].properties.GreenE == 1) { // adds the E Branch to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (sl1IsChecked && (features[i].properties.SL1 == 1 || features[i].properties.SL2 == 1)) { // adds SL1 and Sl2 to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (sl4IsChecked && (features[i].properties.SL4 == 1 || features[i].properties.SL5 == 1)) { // adds SL4 and SL5 to the analysis object
      stopsForAnalysis.features.push(features[i]);
    } else if (keyIsChecked
      && features[i].properties.SL1 != 1
      && features[i].properties.SL2 != 1
      && features[i].properties.SL3 != 1
      && features[i].properties.SL4 != 1
      && features[i].properties.SL5 != 1
      && features[i].properties.isRT_KBR_1 == 1) { // adds the Key Bus Stops to the analysis object
      stopsForAnalysis.features.push(features[i]);
    }
  };
  var count = stopsForAnalysis.features.length;
  stopsCountString = "There are " + count.toString() + " stops in the JSON";
  //return features;
};




// Sets the data selection toggles and filters ever time page is refreshed
// default state: All data will be included
function initializeChecks() {
  // make sure the Light Rail Toggle is switched on
  $("#lrCheck").prop('checked', true).change();
  // make sure the Light Rail filters are all turned on
  $("#bCheck").prop('checked', true).change();
  $("#cCheck").prop('checked', true).change();
  $("#dCheck").prop('checked', true).change();
  $("#eCheck").prop('checked', true).change();
  $("#mCheck").prop('checked', true).change();
  // make sure the Silver Line Toggle is switched on
  $("#slCheck").prop('checked', true).change();
  // make sure the Silver Line filters are all turned on
  $("#sl1andsl2Check").prop('checked', true).change();
  $("#sl3Check").prop('checked', true).change();
  $("#sl4andsl5Check").prop('checked', true).change();
  // make sure the Streetside Bus Stops Toggle is switched on
  $("#streetBusCheck").prop('checked', true).change();
  // make sure the Streetside Bus Stops filters are all turned on
  $("#keyBusCheck").prop('checked', true).change();
  $("#otherBusCheck").prop('checked', true).change();
}

// Handler for Light Rail Data toggle
// sets defaults for when the toggle is switched on and off
function lightRailToggleHandler() {
  // when the toggle is switched execute if statement
  $("#lrCheck").click(function() {
    // data toggle is turned on
    if (document.getElementById("lrCheck").checked) {
      // default upon toggling data to "on" is that there is no filtering
      // all checkboxes will be checked
      $("#bCheck").prop('checked', true).change();
      $("#cCheck").prop('checked', true).change();
      $("#dCheck").prop('checked', true).change();
      $("#eCheck").prop('checked', true).change();
      $("#mCheck").prop('checked', true).change();
      // make sure checkboxes are enabled for filtering
      $("#bCheck").prop('disabled', false).change();
      $("#cCheck").prop('disabled', false).change();
      $("#dCheck").prop('disabled', false).change();
      $("#eCheck").prop('disabled', false).change();
      $("#mCheck").prop('disabled', false).change();
      // change color of filter icon to OPMI Teal
      $("#lrFilterIcon").css('color','#1fa898');
    // data toggle is turned off
    } else {
      // turn off all checkboxes
      $("#bCheck").prop('checked', false).change();
      $("#cCheck").prop('checked', false).change();
      $("#dCheck").prop('checked', false).change();
      $("#eCheck").prop('checked', false).change();
      $("#mCheck").prop('checked', false).change();
      // disable all checkboxes
      // safeguards user from applying a filter to data that is not included
      $("#bCheck").prop('disabled', true).change();
      $("#cCheck").prop('disabled', true).change();
      $("#dCheck").prop('disabled', true).change();
      $("#eCheck").prop('disabled', true).change();
      $("#mCheck").prop('disabled', true).change();
      // change color of filter icon to grey
      $("#lrFilterIcon").css('color','#d3d3d3');
    }
  });
}

// Handler for Silve Line toggle
// sets defaults for when the toggle is switched on and off
function silverLineToggleHandler() {
  // Execute if statement upon clicking the toggle
  $('#slCheck').click(function() {
    // checks the state of the toggle (was it moved to on or to off?)
    if (document.getElementById('slCheck').checked) {
      // checks all filters
      $("#sl1andsl2Check").prop('checked', true).change();
      $("#sl3Check").prop('checked', true).change();
      $("#sl4andsl5Check").prop('checked', true).change();
      // makes sure all filters are enabled
      $("#sl1andsl2Check").prop('disabled', false).change();
      $("#sl3Check").prop('disabled', false).change();
      $("#sl4andsl5Check").prop('disabled', false).change();
      // change color of filter icon to OPMI Teal
      $("#slFilterIcon").css('color','#1fa898');
      // turns off all filters when toggle is off
    } else {
      $("#sl1andsl2Check").prop('checked', false).change();
      $("#sl3Check").prop('checked', false).change();
      $("#sl4andsl5Check").prop('checked', false).change();
      // disables the filters
      $("#sl1andsl2Check").prop('disabled', true).change();
      $("#sl3Check").prop('disabled', true).change();
      $("#sl4andsl5Check").prop('disabled', true).change();
      // change color of filter icon to grey
      $("#slFilterIcon").css('color','#d3d3d3');
    }
    });
}
// Handler for Streetside Bus toggle
// sets defaults for when the toggle is switched on and off
function streetToggleHandler() {
  // executes the if statement upon toggle click
  $('#streetBusCheck').click(function() {
    // checks to see if toggle is checked
    if (document.getElementById('streetBusCheck').checked) {
      // turns on all filters as default
      $("#keyBusCheck").prop('checked', true).change();
      $("#otherBusCheck").prop('checked', true).change();
      // enables all filters
      $("#keyBusCheck").prop('disabled', false).change();
      $("#otherBusCheck").prop('disabled', false).change();
      // change color of filter icon to OPMI Teal
      $("#streetBusFilterIcon").css('color','#1fa898');
    } else {
      // turns off all filters
      $("#keyBusCheck").prop('checked', false).change();
      $("#otherBusCheck").prop('checked', false).change();
      // disables all filters
      $("#keyBusCheck").prop('disabled', true).change();
      $("#otherBusCheck").prop('disabled', true).change();
      // change color of filter icon to grey
      $("#streetBusFilterIcon").css('color','#d3d3d3');
    }
});
}
